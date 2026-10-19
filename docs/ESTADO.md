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

## Instalaciones de REA por entorno

Las decisiones de arriba (paquete de npm global, registro MCP sin `npx`) se tomaron en un
contenedor de nube; no se aplican solas a otra máquina. Estado verificado por entorno:

- **Este Mac** (2026-10-19, tarea "Biblioteca REA"): `rea-agents` instalado globalmente en
  `/Users/manuel/.npm-global` (binario `rea`, versión 6.7.0) y registrado como MCP de Claude
  Code en `~/.claude.json` (con respaldo automático `~/.claude.json.rea.backup`) vía
  `rea setup --client claude_code --yes`. Sin Hopper/Ghidra/IDA/jadx configurados — solo
  análisis estático. Confirmar que las herramientas `mcp__rea__*` cargan en la próxima sesión
  nueva de Claude Code en este Mac (requiere reiniciar Claude Code para tomar el registro).
- **Contenedor de nube** (2026-10-15, tarea "Prueba"): instalación separada, ver decisiones de
  octubre arriba.

## Proyecto hermano: Biblioteca REA

`mgmejiaar-lab/biblioteca-rea` (repositorio propio y privado, separado de este fork) es una app
visual que consume el binario `rea` de este Mac como ejecutor real de análisis. No vive dentro
de este repositorio — ver la decisión del 2026-10-18 en su propio `docs/DECISIONES.md`. Este
repo no cambia por esa app; solo se documenta aquí la relación.
