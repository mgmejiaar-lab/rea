# Bancavalor como primer caso de la base documental

**No se ha probado el gestor con una sesión real.** La memoria de la rama revisada registra la recepción DIAN como inactiva y pendiente de configuración y descarga real; ese estado no se consultó en la base de datos. Esta entrega es una revisión de código y documentación para definir la primera mejora.

El usuario identifica Bancavalor como el primer caso: una banca de inversión que necesita gestionar emisión y recepción de facturas. Indicó que no quiere un proceso de compras. Se parte de su gestor existente para afinarlo y obtener después una base reutilizable.

## Proyecto y revisión examinada

- Repositorio encontrado: [conectia360/vaultfolio-forge](https://github.com/conectia360/vaultfolio-forge). Sus instrucciones lo identifican como Bancavalor / XEPO.
- Rama de integración consultada: `Pruebas`, commit `c56fffae9587192a72fc706f07ccb061b7a2bf5c`.
- Copia local existente: `/Users/manuel/Conectia360/Bancavalor/vaultfolio-forge`, rama `Pruebas`, commit `b79e064bc92560a67402e2210fa7d037e122d02f`, sin cambios locales al consultarla. No se actualizó ni cambió su rama.
- La revisión se realizó sobre una copia de consulta ignorada por Git en REA. Los archivos nuevos de recepción DIAN de la revisión remota no están en esa copia local de Bancavalor. No confundir ambas revisiones ni suponer que alguna demuestra lo publicado.

## Qué existe en el código revisado

| Parte                    | Observación de fuente                                                                                               | Límite de la comprobación                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Gestor de facturas       | La cabecera dice «Facturas de proveedores». Tiene entradas para pendientes, carga, consulta, pagos y administración | Código de las rutas; no navegación autenticada                                                                          |
| Modelo                   | La factura tiene proveedor y estados para aprobación, causación y pago                                              | Modelo tipado y migración; no consulta de registros reales                                                              |
| Archivos                 | Hay preparación de PDF, XML, imágenes y ZIP, lectura XML y una rama opcional de extracción con IA                   | No se cargaron documentos ni se llamó a un modelo                                                                       |
| Autorización e historial | Hay comprobaciones de permisos, políticas RLS y funciones que registran eventos                                     | No se ejecutaron pruebas de permisos ni se certifica seguridad global                                                   |
| Recepción DIAN           | Hay código y documentación de recepción por fechas y archivos XML/PDF                                               | Su documento excluye explícitamente la emisión; conexión real sin comprobar                                             |
| Emisión                  | Existe una investigación de integración con Siigo                                                                   | No se localizó implementación de emisión en las rutas y funciones revisadas; el documento no prueba que esté construida |

Fuentes fijadas: [rutas del gestor](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/src/routes/_authenticated/gestor-documental.tsx), [modelo](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/src/lib/gd/tipos.ts), [carga de archivos](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/src/lib/gd/gd.server.ts), [migración del gestor](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/supabase/migrations/20261223120000_gestor_documental.sql), [alcance DIAN](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/docs/dian-recepcion.md), [memoria de integración](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/docs/ESTADO.md), [investigación Siigo](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/docs/siigo-integracion.md).

## Primera fase acordada

El usuario decidió avanzar primero con **recepción y aprobaciones**. La pregunta anterior sobre emisión queda aplazada y no bloquea esta fase. El alcance y los casos de aceptación están en [Fase 1](2026-10-17-bancavalor-fase-1-recepcion-y-aprobaciones.md).

No son el mismo alcance. Tampoco basta con cambiar el rótulo «proveedor» por «cliente»: el código inspeccionado contiene acciones de aprobación y pago propias de su circuito actual. Cómo debe funcionar el circuito de emisión todavía no se ha definido.

La regla de emisión buscada **no está en el manual en las secciones localizadas**. La búsqueda de facturación solo encontró una referencia a proveedores de facturas dentro de productos de inversión, que no define este proceso. No se deducen de ahí impuestos, numeración, disparadores, aprobaciones ni obligación de usar Siigo. Se conserva como requisito del usuario el alcance de emisión y recepción, sin añadir compras ni eliminar funciones existentes.

## Cómo aprovechar lo construido para la base

Como propuesta, conviene conservar primero el flujo existente y delimitar qué responsabilidades podrán reutilizarse: archivos, identificación documental, lectura, permisos e historial. Las reglas específicas de recepción, emisión y conexiones externas se definirían aparte.

Hoy el módulo importa directamente el cliente Supabase y la autenticación de personal de Bancavalor. Es una dependencia observada, no un fallo reproducido. Al preparar la base reutilizable, esos puntos necesitan contratos de adaptación a cada aplicación. Evidencia: [acceso a datos](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/src/components/gd/use-gd-datos.ts) y [funciones del servidor](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/src/lib/gd/gd.functions.ts).

La arquitectura actual también usa un cliente administrativo para Storage. La base futura debe evaluar su adaptación al estándar de usuario propio y permisos limitados. No se propone cambiar aquí claves, autenticación ni el esquema existente.

## Continuación concreta

Continuar con la fase 1: comprobar el recorrido existente de carga, clasificación, aprobación/rechazo e historial y ajustar las diferencias demostradas. El documento de fase 1 separa criterios técnicos de políticas de negocio pendientes.

La modificación de la aplicación debe continuar en Bancavalor con una nueva tarea, por ejemplo «Afinar el gestor documental de facturas». Debe partir de las instrucciones y de la rama vigente de ese proyecto, conservar la tarea DIAN en curso y sus restricciones, y probar con sesión autorizada. Crear o enviar facturas reales, correos o llamadas pagadas requerirá autorización específica.

No se modificaron archivos de Bancavalor, bases de datos, configuración, servidores ni publicaciones. No se ejecutaron build o pruebas de aplicación porque esta revisión no cambia su código. La comprobación realizada cubre referencias y coherencia del diagnóstico, no funcionamiento real.
