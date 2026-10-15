# Decisiones

## 2026-10-15 — Usar el paquete publicado de npm en vez de compilar el repo fuente

**Decisión**: para que el usuario pueda usar REA en este entorno, no se compila `npm run build:cached` en esta carpeta. Se instala el paquete publicado `rea-agents` globalmente con npm, en un prefijo propio del usuario (`/datos/home/.npm-global`, ya que `/usr/local` no es escribible por el usuario sin privilegios de este contenedor).

**Por qué**: `npm run build:cached` falla de forma reproducible por falta de memoria — el contenedor tiene un límite de cgroup de 2 GiB (`/sys/fs/cgroup/memory.max`), y `tsc` muere (OOM, exit 137) incluso limitando el heap de Node a 1536 MB. El usuario solo necesita _usar_ REA, no modificar su código fuente, así que compilar no es necesario para su objetivo.

**Cómo aplicarlo**: si en el futuro alguien necesita modificar el código de REA en este fork, sí hará falta compilar, y el límite de memoria seguirá bloqueando `npm run build:cached` en este mismo entorno — habría que compilarlo en una máquina con más RAM, o investigar si se puede partir el build en pasos más pequeños.

## 2026-10-15 — Registrar REA con el binario global directo, no con `npx`

**Decisión**: el comando MCP registrado en `~/.claude.json` para Claude Code es `/datos/home/.npm-global/bin/rea mcp` (ruta directa), en vez del comando por defecto que genera `rea setup` (`npx -y rea-agents@6.5.0 mcp`).

**Por qué**: el comando con `npx` falla de forma intermitente — reproducido 3/3 veces — con `sh: 1: rea: not found` cuando el proceso recibe datos por stdin inmediatamente al arrancar, que es exactamente cómo un cliente MCP real se conecta. Parece un problema de resolución de binario de `npx` con paquetes que declaran dos bins (`rea` y `rea-agents`) al fijar una versión exacta en el comando. El binario global invocado directamente no tiene este problema (3/3 pruebas con stdin ok).

**Cómo aplicarlo**: si se vuelve a correr `rea setup` sin la ruta directa (por ejemplo tras una actualización de versión), revisar que el comando registrado en `~/.claude.json` siga siendo la ruta directa al binario y no vuelva a quedar en `npx ...`; si vuelve a fallar la conexión MCP con "connection closed", este es el primer sospechoso a revisar.
