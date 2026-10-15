# Estado del proyecto

## Qué es

Fork propio del usuario de REA ("Reverse Engineer Anything"), una herramienta CLI/MCP de ingeniería inversa local. Ver [AGENTS.md](../AGENTS.md) para alcance, autoridad y convenciones de desarrollo del proyecto original.

- `origin`: `https://github.com/mgmejiaar-lab/rea.git` (este fork, público)
- `upstream`: `https://github.com/morluto/rea.git` (proyecto original, de donde viene el código)

No es una app web: no tiene script `dev`, y `npm start` arranca un servidor MCP por stdio (`node scripts/rea.mjs mcp`), no un servidor HTTP. Nunca va a mostrar nada en la Vista Previa del Taller, y eso es esperado, no un error.

## Decisiones en pie

Ver [docs/DECISIONES.md](DECISIONES.md).

- No se compila el repo fuente en este entorno (bloqueado por límite de memoria del contenedor); se usa el paquete publicado en npm, instalado globalmente en una carpeta propia del usuario.
- REA está registrado como servidor MCP de Claude Code (no de Codex), usando el binario global directo en vez de `npx` por un bug de resolución encontrado en `npx` con este paquete.

## Pendientes generales del proyecto

- Confirmar en cada sesión nueva de Claude Code que las herramientas `mcp__rea__*` cargan correctamente (ver cápsula de la tarea "Prueba" en `docs/capsulas/` para el detalle técnico y el siguiente paso exacto).
- Sin motores nativos de desensamblado (Ghidra/IDA/Hopper) configurados todavía — solo análisis estático (artefactos, .NET/PE managed, JavaScript/Electron).
