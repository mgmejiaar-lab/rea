// Local investigation of one reviewed Wispr component, not a REA provider or SDK.
// The socket service below is a fixture. It never connects to the running app.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { createReadStream } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { extractFile } from "@electron/asar";
import { ProviderProcessSupervisor } from "../../.cache/wispr-rea-cli/node_modules/rea-agents/dist/process/ProviderProcess.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const artifact = "/Applications/Wispr Flow.app/Contents/Resources/app.asar";
const entry = ".webpack/main/agentToolBridge.js";
// Fail closed after a Wispr update: inspect the new bytes before executing them.
const expectedArtifact =
  "84293f175ce0c4e0db7818b1f1ebfb2eb524a9315f8dfa74439925019e9fb587";
const expectedBridge =
  "8a9e77a6310d960d5486ed138a591a8185d4cf443b391b3ce069a39364451a2b";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const artifactHash = createHash("sha256");
for await (const bytes of createReadStream(artifact))
  artifactHash.update(bytes);
assert.equal(
  artifactHash.digest("hex"),
  expectedArtifact,
  "The installed ASAR changed; inspect it before running this experiment.",
);
const bridge = extractFile(artifact, entry);
assert.equal(
  sha256(bridge),
  expectedBridge,
  "The reviewed bridge bytes changed.",
);

const outputRoot = join(root, ".cache/wispr-integration");
await mkdir(outputRoot, { recursive: true });
const work = await mkdtemp(join(root, ".cache/wbi-"));
const socketPath = join(work, "b.sock");
const toolsPath = join(work, "tools.json");
const bridgePath = join(work, "bridge.cjs");
const catalog = [
  {
    name: "demo_echo",
    description: "Synthetic local echo",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" }, batch: { type: "boolean" } },
      required: ["text"],
    },
  },
  {
    name: "demo_fail",
    description: "Synthetic local failure",
    inputSchema: { type: "object", properties: {} },
  },
];
const checks = [];
const sockets = new Set();
const received = [];
const delivered = [];
const batch = [];
const pending = new Map();
let nextId = 1;
let supervisor;
let child;
let lines;
let protocolError;
let failure;
let cleanup;

function failProtocol(error) {
  protocolError ??= error;
  for (const request of pending.values()) request.reject(error);
  pending.clear();
}

function reply(socket, call) {
  delivered.push(call.arguments.text);
  socket.write(
    `${JSON.stringify({ type: "result", requestId: call.requestId, result: [{ type: "text", text: call.arguments.text }] })}\n`,
  );
}

const server = createServer((socket) => {
  sockets.add(socket);
  socket.on("error", failProtocol);
  socket.on("close", () => sockets.delete(socket));
  const input = createInterface({ input: socket });
  input.on("line", (line) => {
    try {
      const call = JSON.parse(line);
      assert.equal(call.type, "call");
      assert.equal(typeof call.requestId, "string");
      received.push(call);
      if (call.toolName === "demo_fail") {
        socket.write(
          `${JSON.stringify({ type: "result", requestId: call.requestId, error: "synthetic failure" })}\n`,
        );
        return;
      }
      assert.equal(call.toolName, "demo_echo");
      assert.equal(typeof call.arguments.text, "string");
      if (call.arguments.batch !== true) {
        reply(socket, call);
        return;
      }
      batch.push(call);
      if (batch.length === 2)
        for (const item of batch.reverse()) reply(socket, item);
    } catch (error) {
      failProtocol(error);
    }
  });
});
server.on("error", failProtocol);

function request(method, params) {
  if (protocolError) return Promise.reject(protocolError);
  const id = nextId++;
  return new Promise((resolveRequest, rejectRequest) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      rejectRequest(new Error(`Timeout waiting for ${method}`));
    }, 2000);
    pending.set(id, {
      resolve(value) {
        clearTimeout(timer);
        resolveRequest(value);
      },
      reject(error) {
        clearTimeout(timer);
        rejectRequest(error);
      },
    });
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) })}\n`,
    );
  });
}

async function check(name, run) {
  await run();
  checks.push({ name, passed: true });
}

try {
  // The CommonJS extension changes loading mode only; bytes remain identical.
  await writeFile(bridgePath, bridge, { flag: "wx", mode: 0o600 });
  await writeFile(toolsPath, JSON.stringify(catalog), {
    flag: "wx",
    mode: 0o600,
  });
  server.listen(socketPath);
  await once(server, "listening");
  child = spawn(process.execPath, [bridgePath], {
    cwd: work,
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
    env: { AGENT_BRIDGE_SOCKET: socketPath, AGENT_TOOLS_FILE: toolsPath },
  });
  // This reviewed bridge creates no subprocesses. Retain its actual child handle.
  supervisor = new ProviderProcessSupervisor(
    { process: child, ownsProcessLifetime: true },
    { maxDiagnosticBytes: 65536 },
  );
  child.on("error", failProtocol);
  child.stdin.on("error", failProtocol);
  lines = createInterface({ input: child.stdout });
  lines.on("line", (line) => {
    try {
      const message = JSON.parse(line);
      assert.equal(message.jsonrpc, "2.0");
      const waiting = pending.get(message.id);
      assert.ok(waiting, "Unexpected JSON-RPC response ID");
      pending.delete(message.id);
      waiting.resolve(message);
    } catch (error) {
      failProtocol(error);
    }
  });

  await check("initialize", async () => {
    const response = await request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "local-investigation", version: "1" },
    });
    assert.deepEqual(response.result, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "wispr-extension-tools", version: "1.0.0" },
    });
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`,
    );
  });
  await check("tools/list", async () =>
    assert.deepEqual((await request("tools/list")).result, { tools: catalog }),
  );
  await check("ping", async () =>
    assert.deepEqual((await request("ping")).result, {}),
  );
  await check(
    "tools/call preserves tool name, arguments and response",
    async () => {
      const response = await request("tools/call", {
        name: "demo_echo",
        arguments: { text: "Prueba local: integración ágil." },
      });
      assert.deepEqual(response.result, {
        content: [{ type: "text", text: "Prueba local: integración ágil." }],
      });
      assert.deepEqual(received[0].arguments, {
        text: "Prueba local: integración ágil.",
      });
    },
  );
  await check("concurrent calls correlate out-of-order results", async () => {
    const responses = await Promise.all(
      ["primero", "segundo"].map((text) =>
        request("tools/call", {
          name: "demo_echo",
          arguments: { text, batch: true },
        }),
      ),
    );
    assert.deepEqual(delivered.slice(-2), ["segundo", "primero"]);
    assert.deepEqual(
      responses.map((response) => response.result.content[0].text),
      ["primero", "segundo"],
    );
  });
  await check("tool errors and omitted arguments", async () => {
    const response = await request("tools/call", { name: "demo_fail" });
    assert.deepEqual(response.result, {
      content: [{ type: "text", text: "Error: synthetic failure" }],
      isError: true,
    });
    assert.deepEqual(received.at(-1).arguments, {});
  });
  await check("unknown method rejected", async () => {
    assert.deepEqual((await request("nonexistent")).error, {
      code: -32601,
      message: "Method not found: nonexistent",
    });
  });
  await check("stdin closure exits cleanly", async () => {
    child.stdin.end();
    assert.equal(await supervisor.waitForOutputClose(2000), true);
    const snapshot = supervisor.snapshot();
    assert.equal(snapshot.exitCode, 0);
    assert.equal(snapshot.signal, null);
    assert.equal(snapshot.stderr.bytes, 0);
    assert.notEqual(snapshot.diagnosticTruncated, true);
    assert.equal(protocolError, undefined);
  });
} catch (error) {
  failure = error;
} finally {
  failProtocol(new Error("Experiment closed"));
  if (supervisor) cleanup = await supervisor.stop();
  lines?.close();
  for (const socket of sockets) socket.destroy();
  if (server.listening) await new Promise((done) => server.close(done));
  if (cleanup?.status !== "incomplete")
    await rm(work, { recursive: true, force: true });
  else
    failure ??= new Error(
      `Cleanup incomplete; retained ${work}: ${cleanup.reason}`,
    );
}

const report = {
  recorded_at: new Date().toISOString(),
  artifact,
  artifact_sha256: expectedArtifact,
  source_entry: entry,
  source_sha256: expectedBridge,
  actual_shipped_bridge_executed: child !== undefined,
  service: "simulated-local-socket",
  live_wispr_connected: false,
  dictation_tested: false,
  credentials_provided: false,
  node: process.version,
  checks,
  passed: failure === undefined,
  child_exit: supervisor?.observedExit(),
  cleanup,
  ...(cleanup?.status === "incomplete"
    ? { retained_work_directory: work }
    : {}),
  ...(failure ? { error: failure.message } : {}),
};
const reportPath = join(outputRoot, `verification-${Date.now()}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, {
  flag: "wx",
  mode: 0o600,
});
console.log(
  JSON.stringify({
    passed: report.passed,
    checks: checks.length,
    report: reportPath,
    service: report.service,
  }),
);
if (failure) {
  console.error(failure.message);
  process.exitCode = 1;
}
