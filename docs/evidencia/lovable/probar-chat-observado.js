// Ejecutar con taller_browser.browser_run_code_unsafe, pasando este archivo como filename.
// Interfaz real local; API, historial y WebSocket simulados. No envía turnos a modelos.
// Basado en scripts/probar-chat-proceso.mjs del Taller, sin modificar ese repositorio.
async (page) => {
  const context = await page
    .context()
    .browser()
    .newContext({
      viewport: { width: 1280, height: 800 },
      serviceWorkers: "block",
    });
  const test = await context.newPage();
  const origin = "http://localhost:8085";
  const project = {
    id: "analisis-lovable",
    nombre: "Comparación simulada",
    ruta: "/prueba/fluidez",
    urlVistaPrevia: "about:blank",
    comandoDev: "",
    arranqueAutomatico: false,
    servidorEncendido: false,
  };
  const agent = {
    id: "codex",
    nombre: "Codex",
    modos: ["chat"],
    comando: "codex",
    args: [],
    modelos: [],
    modeloPorDefecto: "simulado",
    tienePlan: true,
  };
  const chat = {
    id: "fluidez-simulada",
    proyectoId: project.id,
    agenteId: agent.id,
    nombre: "Fluidez simulada",
    modelo: "simulado",
    sesionAgente: null,
    ocupada: true,
    pendiente: false,
    creadaEn: 1,
    modoAuto: false,
    tarea: { id: "t-prueba", titulo: "Fluidez simulada", terminada: false },
  };
  const history = [];
  for (let i = 0; i < 24; i++)
    history.push(
      {
        id: `u${i}`,
        tipo: "usuario",
        texto: `SIMULACIÓN: solicitud ${i}`,
        en: i * 10,
      },
      {
        id: `p${i}`,
        tipo: "texto",
        texto: "SIMULACIÓN: estoy revisando los archivos.",
        en: i * 10 + 1,
      },
      {
        id: `a${i}`,
        tipo: "accion",
        verbo: "Leyó",
        objetivo: "demo.ts",
        detalle: "Contenido ficticio para la comprobación.",
        ok: true,
        en: i * 10 + 2,
      },
      {
        id: `r${i}`,
        tipo: "texto",
        texto:
          "SIMULACIÓN: respuesta terminada.\n\n- Primera comprobación\n- Segunda comprobación\n\n```ts\nconst ejemplo = true;\n```",
        en: i * 10 + 3,
      },
      {
        id: `c${i}`,
        tipo: "cierre",
        duracionMs: 1000,
        archivos: 0,
        en: i * 10 + 4,
      },
    );
  history.push({
    id: "actual-u",
    tipo: "usuario",
    texto: "SIMULACIÓN: turno activo.",
    en: 300,
  });
  const progress = {
    id: "actual-p",
    tipo: "texto",
    texto: "SIMULACIÓN: progreso visible antes de la acción.",
    escribiendo: true,
    en: 301,
  };
  history.push(progress);
  let socket;
  const errors = [];
  const unexpectedWrites = [];
  test.on("pageerror", (error) => errors.push(error.message));
  await context.addInitScript(() => {
    localStorage.setItem(
      "taller.proyectoActivo",
      JSON.stringify("analisis-lovable"),
    );
    localStorage.setItem("taller.vistaPrevia.visible", "false");
  });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) return route.abort();
    if (
      !url.pathname.startsWith("/api/") &&
      !url.pathname.startsWith("/nube/") &&
      !url.pathname.startsWith("/connector/")
    )
      return route.continue();
    if (request.method() !== "GET") {
      unexpectedWrites.push(url.pathname);
      return route.abort();
    }
    const path = url.pathname;
    // main.tsx activa NubeGate ante cualquier JSON 200 en esta ruta.
    // El Taller observado está en modo local: reproducir su ausencia de endpoint de nube.
    if (path === "/nube/config")
      return route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Modo local simulado",
      });
    let value = {};
    if (path === "/api/datos")
      value = {
        proyectos: [project],
        agentes: [agent],
        carpetaBase: "/prueba",
        estandares: {},
      };
    else if (path === "/api/repositorios")
      value = { porProyecto: {}, grupos: [] };
    else if (path === "/api/terminales") value = [];
    else if (path === "/api/conversaciones") value = [chat];
    else if (path.endsWith("/llaves"))
      value = { faltan: [], nombres: [], variables: [] };
    else if (path.endsWith("/documentos"))
      value = {
        carpeta: "documentos",
        existe: false,
        documentos: [],
        carpetas: [],
      };
    else if (path.includes("/modelos"))
      value = { modelos: [], origen: "respaldo" };
    else if (path === "/api/cuentas")
      value = { claude: { conectada: true }, codex: { conectada: true } };
    else if (path.includes("/servidor"))
      value = {
        vivo: false,
        proyecto: project,
        puertosDetectados: [],
        candidatos: [],
      };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(value),
    });
  });
  await context.routeWebSocket("**/*", (ws) =>
    ws.onMessage((raw) => {
      let message;
      try {
        message = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (message.tipo === "abrirChat") {
        socket = ws;
        ws.send(
          JSON.stringify({
            tipo: "chatListo",
            conversacion: chat,
            piezas: history,
          }),
        );
      }
    }),
  );
  try {
    await test.goto(origin);
    await test.getByRole("tab").filter({ hasText: "Fluidez simulada" }).click();
    await test
      .getByText(progress.texto, { exact: true })
      .waitFor({ state: "visible" });
    const before = await test
      .getByText(progress.texto, { exact: true })
      .isVisible();
    socket.send(
      JSON.stringify({
        tipo: "pieza",
        pieza: {
          id: "actual-a",
          tipo: "accion",
          verbo: "Editó",
          objetivo: "demo.ts",
          en: 302,
        },
      }),
    );
    await test
      .getByText(progress.texto, { exact: true })
      .waitFor({ state: "hidden" });
    const after = await test
      .getByText(progress.texto, { exact: true })
      .isVisible();
    const mountedHiddenNodes = await test
      .locator(".chat-proceso:not([open]) .grupo-acciones-lista *")
      .count();
    const answer = {
      id: "actual-r",
      tipo: "texto",
      texto: "SIMULACIÓN: respuesta parcial.",
      escribiendo: true,
      en: 303,
    };
    socket.send(JSON.stringify({ tipo: "pieza", pieza: answer }));
    await test
      .getByText(answer.texto, { exact: true })
      .waitFor({ state: "visible" });
    await test.locator(".chat-hilo").evaluate((el) => {
      el.scrollTop = 0;
    });
    const scrollBefore = await test
      .locator(".chat-hilo")
      .evaluate((el) => el.scrollTop);
    socket.send(
      JSON.stringify({
        tipo: "piezaActualizada",
        pieza: { ...answer, texto: answer.texto + " Otro fragmento." },
      }),
    );
    await test
      .getByText(answer.texto + " Otro fragmento.", { exact: true })
      .waitFor({ state: "visible" });
    await test.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const scrollAfter = await test
      .locator(".chat-hilo")
      .evaluate((el) => ({
        top: el.scrollTop,
        height: el.clientHeight,
        total: el.scrollHeight,
      }));
    await test.screenshot({
      path: "/Users/manuel/Programación/rea/docs/evidencia/lovable/taller-simulado-escritorio.png",
    });
    await test.setViewportSize({ width: 390, height: 844 });
    const mobile = await test.evaluate(() => ({
      width: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      chatHeight: document.querySelector(".chat-hilo").clientHeight,
    }));
    await test.screenshot({
      path: "/Users/manuel/Programación/rea/docs/evidencia/lovable/taller-simulado-movil.png",
    });
    if (
      !before ||
      after ||
      scrollBefore !== 0 ||
      scrollAfter.top <= 0 ||
      unexpectedWrites.length ||
      errors.length
    )
      throw new Error(
        JSON.stringify({
          before,
          after,
          scrollBefore,
          scrollAfter,
          unexpectedWrites,
          errors,
        }),
      );
    return {
      entorno: origin,
      simulacion:
        "API, sesión, historial y eventos ficticios sobre la interfaz real; sin modelos ni escrituras reales",
      historyPieces: history.length,
      progressVisibleBeforeAction: before,
      progressVisibleAfterAction: after,
      mountedHiddenNodes,
      scrollBefore,
      scrollAfter,
      mobile,
      unexpectedWrites,
      errors,
      timing: "No mide latencia del modelo ni rendimiento comparado.",
    };
  } finally {
    await context.close();
  }
};
