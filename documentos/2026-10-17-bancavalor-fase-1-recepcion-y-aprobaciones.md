# Fase 1 de Bancavalor Recepción y aprobación de facturas

**Esta fase todavía no está implementada ni probada de punta a punta.** Se parte del gestor existente. La memoria de la revisión consultada registra la conexión DIAN como inactiva; no se verificó su estado real en esta tarea.

Decisión del usuario: avanzar por fases y trabajar primero la recepción de facturas y sus aprobaciones. La emisión queda aplazada y ya no es una pregunta que bloquee este trabajo. Tampoco se incorpora un proceso de compras.

## Resultado que buscamos

Cada factura recibida debe poder seguirse desde su entrada hasta una decisión interna explicable, conservando archivos, datos revisados, responsables e historial. La propuesta termina en el expediente aprobado, rechazado o pendiente con causa identificada, disponible para el siguiente paso operativo. No cambia por sí misma la causación o el pago existentes ni autoriza envíos o eventos tributarios.

Las capacidades siguientes son requisitos técnicos propuestos para esta fase, no funciones certificadas del sistema. Las políticas concretas de Bancavalor sobre responsables, límites, excepciones y autoaprobación **no están en el manual en las secciones localizadas**; deben contrastarse con la configuración vigente y confirmarse cuando falte una regla.

## Qué aprovechamos del gestor existente

La [revisión inicial](2026-10-17-bancavalor-punto-de-partida-documental.md) identifica carga de archivos, lectura XML, permisos, historial, clasificación y aprobación. En la migración revisada hay modos de aprobación «uno» y «cascada», una persona asignada y la capacidad de aprobador global. El rechazo exige motivo y permite volver a clasificación. Estas son observaciones del código, no pruebas de ejecución.

Las funciones SQL bloquean la fila de factura al operar y vuelven a comprobar permiso y estado. Conviene conservar y probar esas protecciones. El código obtiene los aprobadores de la configuración actual del centro de costos; por eso hace falta definir y comprobar qué ocurre cuando esa configuración cambia durante un proceso. [Fuente fijada del circuito](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/supabase/migrations/20261223120000_gestor_documental.sql).

## Alcance funcional propuesto

| Parte                       | Resultado exigible                                                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ingreso                     | Carga manual y recepción DIAN conservan procedencia, fecha de ingreso y originales. Una recepción parcial muestra qué archivo falta y permite reanudar sin perder lo guardado                                                                                       |
| Seguridad de archivos       | Validar formato y contenido, limitar tamaño y expansión de ZIP/XML, controlar el acceso y mantener los archivos privados. Definir tratamiento de archivos dañados o sospechosos sin abrirlos a otros usuarios                                                       |
| Identificación y duplicados | Contrastar compañía receptora, emisor, número y CUFE cuando estén disponibles. Distinguir duplicado exacto, posible coincidencia y documento corregido; una entrada manual y otra DIAN no deben convertirse inadvertidamente en dos expedientes del mismo documento |
| Lectura y revisión          | Conservar datos extraídos y correcciones humanas. Mostrar incertidumbre o diferencias entre fuentes. La lectura automática no toma una decisión de aprobación                                                                                                       |
| Clasificación               | Asignar el centro de costos y responsables conforme a las reglas de Bancavalor. Si falta un responsable válido, dejar una excepción visible en lugar de escogerlo por suposición                                                                                    |
| Aprobaciones                | Comprobar actor, permiso, estado y datos revisados al confirmar. Aplicar la secuencia acordada, conservar el motivo del rechazo y documentar cualquier excepción autorizada                                                                                         |
| Cambios y reasignaciones    | Conservar qué datos y regla recibió cada decisión. Reasignaciones y cambios relevantes deben seguir una política explícita; una aprobación anterior no debe trasladarse silenciosamente a datos distintos                                                           |
| Seguimiento                 | Poder localizar pendientes por responsable, fecha y estado; identificar documentos detenidos y su causa. Los plazos y avisos se configuran conforme al proceso acordado                                                                                             |
| Historial y consulta        | Recuperar originales, decisiones, correcciones y responsables con permisos coherentes en lista, detalle, descarga e historial. Comprobar también respaldo y restauración de un expediente de prueba                                                                 |

Los controles de carga se apoyan en la validación por capas, restricciones de tamaño y almacenamiento protegido de [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). Los permisos se deben verificar en cada solicitud y en el servidor, según [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). Estos criterios no certifican por sí solos la seguridad de una implementación.

La vinculación entre la recepción DIAN y el expediente de aprobación debe ser explícita y evitar duplicar el registro. El código de recepción actual se documenta como independiente del circuito de aprobación y pago; no se asumirá que ya los enlaza. [Alcance de la recepción existente](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/docs/dian-recepcion.md).

## Reglas de aprobación que se deben fijar

Primero leer la configuración y las autorizaciones actuales; solo preguntar lo que no esté resuelto. No introducir límites monetarios, perfiles ni automatismos inventados.

- Quién puede clasificar, aprobar, reasignar y autorizar una excepción.
- Cuándo basta una decisión y cuándo deben completarse pasos en cascada. Aprobación paralela de todos, si se solicita, requiere una definición adicional; no se presenta como capacidad comprobada.
- Si quien carga una factura puede aprobarla y en qué condiciones.
- Qué significa el aprobador global y cuándo puede cerrar un proceso sin las decisiones ordinarias.
- Qué sucede con una factura en curso si cambian los responsables o las reglas del centro de costos.
- Qué cambios de datos requieren nueva revisión o aprobación, y cómo se tramita una ausencia o sustitución.
- Cuándo vence una tarea y qué aviso o escalamiento procede. No enviar correos reales durante las pruebas sin autorización expresa.

Un caso prioritario para comprobar es el uso de «Tomar la factura» en una cascada. La función `gd_reclamar` asigna una persona y `gd_aprobar` aplica la cascada cuando no hay persona asignada. Hay que probar sus combinaciones y contrastarlas con la política de excepciones, también mediante llamada directa. Es una derivación del código y una prueba pendiente, no un incidente reproducido. [Funciones y condiciones observadas](https://github.com/conectia360/vaultfolio-forge/blob/c56fffae9587192a72fc706f07ccb061b7a2bf5c/supabase/migrations/20261223120000_gestor_documental.sql#L515-L566).

## Pruebas de aceptación propuestas

Todas están pendientes de ejecutar. Utilizar datos ficticios aislados, usuarios de prueba autorizados y avisos simulados. Una simulación del proveedor no acredita su conexión real.

| Caso | Comprobación                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| R01  | Cargar PDF y XML coherentes; conservar originales, procedencia y datos confirmados                                                            |
| R02  | Presentar archivo dañado, tipo incompatible o límite de tamaño excedido; explicar el rechazo y no procesarlo como válido                      |
| R03  | Recibir un archivo y fallar el otro; reanudar sin sobrescribir el original ni perder el resultado parcial                                     |
| R04  | Ingresar la misma factura por carga manual y DIAN, incluyendo simultaneidad; resolver la identidad sin duplicar el expediente                 |
| R05  | Presentar receptor distinto o discrepancias entre XML y datos; impedir que llegue a aprobación sin resolver la excepción definida             |
| R06  | Pasar un documento recibido al circuito de aprobación; conservar el vínculo y comprobar que repetir la acción no duplique registros           |
| R07  | Completar aprobación de un responsable y aprobación en cascada; comprobar orden, actores y decisión final                                     |
| R08  | Probar persona designada, «Tomar la factura» y aprobador global; permitir solo las excepciones acordadas y registrarlas                       |
| R09  | Enviar dos decisiones simultáneas o repetir una petición; obtener un único resultado válido por paso                                          |
| R10  | Rechazar, corregir y reenviar; mantener motivo e historial y revisar los datos corregidos                                                     |
| R11  | Cambiar configuración o reasignar con una tarea abierta; aplicar la política acordada sin reinterpretar silenciosamente decisiones            |
| R12  | Retirar permiso con la pantalla abierta; comprobar la siguiente operación y el comportamiento definido para accesos temporales a archivos     |
| R13  | Intentar lectura y acciones sin autorización en lista, detalle, archivo, historial y llamada directa; denegar en todas las vías pertinentes   |
| R14  | Interrumpir un procesamiento y recuperarlo; conservar trabajo confirmado y mostrar los pendientes reales                                      |
| R15  | Consultar un expediente decidido y restaurar una copia de prueba; recuperar sus archivos y trazabilidad                                       |
| R16  | Repetir el recorrido con sesión real en escritorio y móvil en el entorno autorizado; registrar la versión probada y lo que siga sin comprobar |

## Orden de ejecución

1. **Establecer el punto de partida real.** En la tarea de Bancavalor, actualizar la revisión de trabajo siguiendo sus instrucciones y probar carga manual → clasificación → aprobación/rechazo → historial. Registrar fallos y cobertura; no activar DIAN ni repetir trabajo de su cápsula sin revisar su estado y autorizaciones.
2. **Cerrar el circuito de aprobación.** Confirmar reglas pendientes, corregir diferencias demostradas y ejecutar sus pruebas pequeñas de permisos y transiciones. No ampliar otros módulos.
3. **Consolidar recepción y excepciones.** Completar la unión con el expediente, duplicados, archivos parciales y recuperación; coordinar la comprobación real de DIAN con su tarea existente.
4. **Cerrar la fase con evidencia.** Ejecutar los casos aplicables de punta a punta, revisión de escritorio/móvil y controles de publicación correspondientes. Informar expresamente cualquier conexión, prueba o despliegue pendiente.

La fase no se declara terminada solo porque los botones funcionan ni porque compila. Debe quedar demostrado el recorrido, las excepciones acordadas y la trazabilidad. El objetivo de reutilizar la base se conserva, pero extraerla a un paquete no es requisito previo para mejorar esta primera recepción.

## Texto de arranque para la tarea de Bancavalor

Afinar la recepción de facturas y sus aprobaciones, partiendo del gestor existente y del alcance de fase 1 guardado en REA. Trabajar primero carga manual, clasificación, aprobación/rechazo e historial, con casos aislados. Leer la tarea DIAN vigente para no duplicar ni activar su trabajo. Conservar el alcance por fases: emisión, compras y cambios en pagos o causación quedan fuera de este ajuste. Verificar las reglas actuales antes de proponer otras; no hacer llamadas pagadas ni enviar correos o eventos reales sin autorización expresa. Identificar qué existe, qué falla y qué se prueba antes de modificar.

La implementación se continúa con «+ Nueva tarea» dentro de Bancavalor, en Abrir: Claude Code o Codex. Este documento se guarda en REA como aplicación del benchmark; no modifica el repositorio del producto.
