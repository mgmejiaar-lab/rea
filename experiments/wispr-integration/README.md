# Experimento local del puente de Wispr

Ejecuta el `agentToolBridge.js` distribuido con Wispr Flow 1.6.1167 contra un
servicio local **simulado**. No conecta la cuenta ni la app abierta, no captura
audio, no llama servicios de voz y no instala extensiones. No es un SDK ni un
provider nuevo de REA.

## Repetir

Este Mac ya tiene las dependencias utilizadas:

- Node 22.23.1, compatible con el runtime publicado de REA.
- Dependencia `@electron/asar` del repositorio.
- REA 6.5.0 instalado en `.cache/wispr-rea-cli/node_modules/rea-agents`.
- Wispr en `/Applications/Wispr Flow.app` con las huellas exactas del script.

Desde la raíz:

```sh
node experiments/wispr-integration/verify-bridge.mjs
```

Si Wispr se actualiza, el script se detiene antes de ejecutarlo. Inspeccionar
primero los nuevos bytes; no cambiar las huellas solo para hacer pasar la prueba.
El script no instala dependencias ni modifica la configuración de Wispr.

La salida indica cuántas comprobaciones pasaron y la ruta de un nuevo JSON en
`.cache/wispr-integration/`. Una salida distinta de cero es un fallo, aunque haya
comprobaciones previas exitosas. Los resultados y el código extraído no se suben a
Git. Los archivos temporales se eliminan al cerrar; si no se confirma la limpieza
del proceso, se conserva su carpeta y se informa el fallo.

## Cobertura

Inicialización MCP, catálogo, ping, llamada con texto en español, correlación de
respuestas concurrentes fuera de orden, errores de herramienta/argumentos
omitidos, método desconocido y cierre limpio: ocho comprobaciones.

El componente ejecutado es real; sus dos herramientas y su servidor de socket son
ficticios. Esto verifica esos intercambios del puente, no cumplimiento completo
de MCP, acceso a Wispr en ejecución ni entrega de dictado a otra aplicación.

Se reutiliza el supervisor de procesos del REA publicado para el hijo directo.
El código del puente revisado no crea subprocesos. No se hereda el entorno de
credenciales; se proporcionan solo las dos rutas locales que necesita el puente.

El [informe](../../documentos/2026-10-16-wispr-componentes-y-reconstruccion.md)
separa esta prueba de las extensiones internas observadas y del MCP remoto
documentado por Wispr.
