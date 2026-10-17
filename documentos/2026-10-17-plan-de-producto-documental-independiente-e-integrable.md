# Plan para una base reutilizable de gestión documental

Necesitas **una base de código de gestión documental que tú puedas incorporar y adaptar al construir el software de cada cliente**. En cada proyecto tú decides si entregas solamente gestión documental o si la integras con los demás módulos de una aplicación. El cliente recibe la solución que hayas preparado para él.

La aclaración del usuario sustituye el enfoque anterior de dos accesos al mismo sistema. Se reutilizan capacidades y código entre proyectos; no se exige que un cliente tenga ambas modalidades, comparta datos entre dos aplicaciones o dependa de un servicio documental central.

Es una propuesta para llevar el [benchmark](2026-10-16-gestion-documental/00-informe-principal.md) a una base propia. El primer caso identificado es Bancavalor: se hizo una revisión inicial de su gestor existente, documentada en [el punto de partida](2026-10-17-bancavalor-punto-de-partida-documental.md). No se ha probado su funcionamiento real ni estimado la implementación. No hay código nuevo de aplicación en esta entrega.

## Cómo utilizas la base en tus proyectos

| Decisión tuya para el proyecto        | Qué construyes                                                                                   | Qué aporta la base                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Entregar solo gestión documental      | Una aplicación documental adaptada al cliente                                                    | Documentos, versiones, búsqueda, permisos, historial, procesos y componentes de pantalla |
| Incorporarla a un software más amplio | Una aplicación con los módulos de negocio que el cliente necesita y gestión documental integrada | Las mismas capacidades, adaptadas a los usuarios, datos y navegación de esa aplicación   |

La propuesta es mantener capacidades reutilizables con versiones identificables, para que puedas incorporar el conjunto documental o solo las piezas que necesites. Cada aplicación registra las versiones elegidas y sus ajustes particulares. Los puntos de adaptación conectan esas piezas con la identidad, permisos, almacenamiento y entidades de la aplicación. Las pantallas pueden reutilizar componentes de la base o incluir desarrollos específicos.

La forma concreta de empaquetarlo depende de las tecnologías que ya uses. Puede tener contratos internos entre módulos y exponer una API cuando la aplicación la necesite; no tiene que empezar como un servicio remoto. Esa decisión requiere revisar tus proyectos y no se ha tomado aquí.

## Componer la solución por módulos y submódulos

El requisito aclarado por el usuario es poder explorar una herramienta en Conectia360, ver sus módulos y submódulos, y escoger una funcionalidad concreta para incorporarla a un proyecto. Es el modelo de piezas de Tetris. La organización del catálogo facilita encontrarlas; la separación del código y sus contratos permite reutilizarlas. Un enlace a un archivo o repositorio, por sí solo, no demuestra que una pieza funcione por separado.

Este es un mapa **propuesto**, no el inventario de módulos independientes ya comprobados en Bancavalor:

| Herramienta        | Módulo                | Submódulos o funcionalidades propuestas                                               | Resultado principal                                             |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Gestión documental | Ingreso               | Carga individual, carga masiva, conector de recepción DIAN                            | Originales identificados y resultado de recepción por archivo   |
| Gestión documental | Lectura de facturas   | Interpretación de XML, extracción de texto PDF, OCR de imágenes, extracción de campos | Datos extraídos asociados a su documento y evidencia disponible |
| Gestión documental | Revisión y validación | Revisión humana, validación de campos y totales, detección de duplicados              | Datos revisados e incidencias pendientes                        |
| Gestión documental | Aprobaciones          | Asignación, decisiones, devolución, reglas y excepciones del cliente                  | Decisiones trazables sobre una versión identificada             |
| Gestión documental | Archivo y consulta    | Originales, versiones, metadatos, búsqueda y acceso autorizado                        | Documentos recuperables con control de acceso                   |

El historial acompaña las operaciones que lo necesitan. La autenticación, la autorización y el almacenamiento deben conectarse con los servicios del proyecto mediante puntos de adaptación definidos. Reutilizar solo una pieza no autoriza a omitir esos controles cuando procesa archivos o datos privados.

La jerarquía sirve para navegar. Las dependencias deben mostrarse aparte: una carga masiva puede utilizar almacenamiento y un lector, mientras que el mismo lector puede recibir archivos desde otra aplicación. No es necesario crear un repositorio, un servicio ni una pantalla por cada funcionalidad; la separación física se decide después de comprobar qué se reutiliza y cómo.

### Ejemplo: escoger únicamente la lectura de facturas

El contrato propuesto para el lector es:

- **Recibe:** contenido del archivo o una referencia autorizada, formato e instrucciones de extracción permitidas por el proyecto.
- **Devuelve:** campos extraídos, referencia al original, evidencia de origen cuando esté disponible, advertencias, datos desconocidos y errores del documento. No inventa valores ni porcentajes de confianza.
- **Necesita:** los lectores y proveedores habilitados para esos formatos. Un XML puede seguir una ruta distinta a una imagen; usar agentes o modelos no es un requisito para todas las entradas.
- **Se adapta:** mediante configuración y adaptadores de archivo y proveedor, sin depender de las pantallas, tablas o reglas de aprobación de Bancavalor.
- **Límite:** extraer campos no acredita validez tributaria, aprobación ni pago. El sistema consumidor decide cómo revisar y utilizar el resultado.

La calidad debe acreditarse con documentos de prueba, resultados por campo, fallos conocidos y versión evaluada. Precisión, tiempo y costo se registran cuando se midan; aquí no están medidos. No etiquetar una pieza como «la mejor» o «lista para reutilizar» solo por el proveedor o modelo que utiliza.

### Dónde llega una carga masiva

En la composición propuesta, la recepción conserva los originales y registra el resultado de cada archivo. El procesamiento del lote llama al lector y entrega sus resultados a la bandeja de revisión o al sistema del cliente que se haya conectado. Se distingue archivo recibido, lectura completada y factura revisada; son resultados diferentes, no estados actuales afirmados del producto.

El procesamiento debe poder reintentar archivos fallidos sin duplicar los ya procesados, y un fallo individual debe quedar identificado. El conector DIAN es una fuente de entrada; sus documentos pasan por las etapas que correspondan. Esta propuesta no activa la conexión ni sustituye la tarea DIAN existente.

Ejemplos de composiciones que tú podrías elegir:

- **Cliente con sistema propio:** lector de facturas → resultados para su sistema actual.
- **Cliente con recepción masiva:** carga por lotes → lectura → revisión.
- **Bancavalor, fase 1:** recepción → lectura o captura manual → revisión y clasificación → aprobaciones → consulta e historial.

### Qué debe registrar Conectia360 sobre cada pieza

Como requisito para su catálogo, propongo una ficha con propósito, ubicación en el repositorio, versión, entradas, salidas, dependencias obligatorias y opcionales, puntos de adaptación, componente de pantalla si existe y ejemplo de integración. Debe distinguir lo localizado en código de lo probado por separado y de lo integrado y probado en un proyecto, enlazando la evidencia correspondiente.

Una selección debe hacer visibles sus dependencias y los ajustes necesarios. «Traer un módulo» significa incorporar una versión y conectar esos puntos de adaptación; no copiar archivos sin conocer sus dependencias. También pueden guardarse composiciones habituales para repetirlas en otros proyectos. El catálogo de Conectia360 no está implementado ni verificado en esta tarea; su construcción corresponde a una tarea en ese proyecto.

## Paso 1 Elegir el primer proceso que vas a vender

El usuario eligió Bancavalor, banca de inversión, como primer caso. Se parte de su gestor existente y se trabaja por fases: primero [recepción y aprobaciones](2026-10-17-bancavalor-fase-1-recepcion-y-aprobaciones.md). La emisión queda aplazada y no se añade un proceso de compras. Las preguntas sobre emisión ya no bloquean el primer ajuste.

Antes de elegir tecnología o fechas, inventaría lo que ya tienen tus aplicaciones: acceso de usuarios, documentos, permisos, integraciones y almacenamiento. Identifica qué se puede reutilizar y qué está acoplado a un cliente concreto.

**Entrega:** una ficha del piloto con recorrido completo, tipos documentales, actores, reglas, excepciones e integraciones. Para ese proyecto, elige una modalidad de entrega: aplicación documental o módulo de una solución más amplia.

## Paso 2 Delimitar el producto común y sus módulos

Para el gestor completo propongo documentos y originales, versiones, metadatos, búsqueda por metadatos, permisos, historial y relación con expedientes del negocio. Estas capacidades no deben convertirse en una dependencia obligatoria de quien solo necesita leer un archivo. En Bancavalor, comprobar además un proceso de revisión y aprobación acotado para demostrar el ciclo completo.

La extracción OCR, interpretación de facturas, firma y conectores especializados pueden ser módulos opcionales. Su prioridad debe salir del piloto. Un gestor de contratos no tiene por qué ejecutar el procesamiento de facturas para poder funcionar.

La [arquitectura del benchmark](2026-10-16-gestion-documental/05-arquitectura-y-aprendizajes.md) desarrolla las separaciones importantes: documento y revisión; extracción y validación; tarea y decisión; envío externo y confirmación.

**Entrega:** una lista de capacidades base, módulos opcionales y exclusiones de la primera entrega. No construir un diseñador general de procesos antes de comprobar el primer proceso configurable.

## Paso 3 Fijar cómo se conecta con cada aplicación

Define operaciones comunes para cargar, consultar, versionar, buscar y relacionar documentos; iniciar un proceso; decidir una tarea; consultar el historial y obtener el archivo con autorización. Mantén estas reglas en el núcleo reutilizable y define puntos de adaptación concretos para cada aplicación.

Para integrarlo, conecta los usuarios y permisos de la aplicación con las acciones documentales, y sus entidades con los documentos. Por ejemplo, un contrato del programa del cliente puede tener documentos asociados. Esa relación debe tener identidad estable y una política cuando el contrato cambia o desaparece. No hace falta duplicar el registro de contratos ni imponer un segundo inicio de sesión.

El módulo debe comprobar permisos en el servidor para cada operación. Recibir un identificador de compañía o de contrato desde una pantalla no demuestra que el usuario tenga acceso. Este criterio coincide con la validación por petición y de recursos concretos de [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

**Entrega:** contratos del módulo y adaptadores para identidad, permisos, archivos y relaciones de negocio. Añadir una API de red cuando exista un consumidor que la necesite. No es necesario separar todo en microservicios: puede comenzar dentro del backend de cada aplicación, con responsabilidades claras.

## Paso 4 Separar las personalizaciones

| Tipo de ajuste        | Ejemplos propuestos                                                                                      | Cómo mantenerlo                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Configuración         | Marca, nombres, campos obligatorios, categorías, responsables, plazos, pasos y condiciones de aprobación | Configuración validada y versionada por compañía              |
| Módulo opcional       | Lectura de facturas, firma, cotejo o un conector reutilizable                                            | Capacidad del producto con activación y permisos definidos    |
| Desarrollo específico | Una pantalla propia, un cálculo particular o un conector al sistema de un cliente                        | Extensión separada con contrato, versión y pruebas propias    |
| Mejora del núcleo     | Una capacidad común que sirve a varios clientes                                                          | Cambio del producto compartido, con pruebas de compatibilidad |

Ejemplo: que una compañía use una aprobación y otra dos puede resolverse con configuración. Enviar el resultado a un sistema particular puede requerir un conector. Una pantalla especial puede utilizar las operaciones del módulo sin redefinir los permisos ni el historial.

Cada petición de cliente debe clasificarse antes de presupuestarla. Mantén una versión identificable del núcleo y registra qué configuración y extensiones usa cada proyecto. Prueba y decide las actualizaciones por aplicación; una mejora de la base no tiene que cambiar automáticamente todos los proyectos. No conviertas la configuración en ejecución libre de código ni permitas que una personalización anule los permisos o borre el significado de decisiones anteriores.

**Entrega:** catálogo inicial de ajustes permitidos y ficha de cada extensión, con responsable de mantenimiento, dependencias y pruebas de aceptación.

## Paso 5 Adaptar datos y operación a cada aplicación

Reutilizar código no exige compartir documentos, usuarios ni base de datos entre clientes. Cada proyecto debe definir dónde viven sus documentos y cómo se aplican sus permisos. Si una aplicación atiende a varias compañías, el aislamiento entre ellas será un requisito específico de esa aplicación.

Aplicando tu estándar, cada aplicación en Supabase debe respetar su esquema y usuario propios, pertenencia a la app, control de acceso desde el inicio y Storage privado. El módulo documental debe integrarse en ese espacio y mantener separados sus modelos y migraciones de las reglas específicas del cliente. Si varias compañías comparten una aplicación, el control debe exigir además pertenencia y permiso en la compañía correspondiente. La ubicación concreta requiere tu elección y confirmación antes de crear infraestructura.

Prueba los permisos en archivos, búsquedas, versiones, historial y tareas en segundo plano. Incluye respaldo y restauración, exportación de documentos y actualización de la base reutilizable sin perder ajustes particulares. Define quién opera cada aplicación y cómo se mantienen sus extensiones.

**Entrega:** matriz de acceso, persistencia adaptada al proyecto y procedimientos de actualización, recuperación y exportación. No hay infraestructura creada por este plan.

## Paso 6 Probar la reutilización en dos proyectos de ejemplo

Primero prueba el recorrido completo en la modalidad elegida para el piloto:

1. Entrar como usuario autorizado de una compañía.
2. Subir un documento y asociarlo a un expediente.
3. Revisarlo y tomar una decisión sobre una versión identificada.
4. Consultar quién decidió, qué regla se aplicó y qué versión revisó.
5. Verificar que los ajustes del cliente se cumplen y que el acceso no autorizado se rechaza.

Después comprueba que la base se puede reutilizar en otro proyecto de ejemplo. Uno puede ser una aplicación exclusivamente documental y el otro una aplicación de negocio que incorpora el módulo. Usa datos ficticios independientes: son dos soluciones diferentes, no dos entradas al mismo expediente de un cliente.

Ambos proyectos deben utilizar una versión identificable de la base y tener sus propios ajustes. Cambiar una regla particular del segundo no debe modificar el primero. Una actualización de la base debe probarse en cada uno antes de adoptarla.

La integración de identidad debe incluir expiración de sesión y revocación. La recepción de un resultado repetido no debe producir una segunda aprobación o una segunda operación externa. Los casos del [protocolo del benchmark](2026-10-16-gestion-documental/06-protocolo-de-pruebas.md) sirven como base, especialmente aislamiento, concurrencia, cambios de versión y conciliación.

**Criterio para avanzar:** demostrar que se puede incorporar la base en ambos tipos de proyecto sin reescribir su lógica común y manteniendo los ajustes particulares. Estas pruebas están propuestas; no se han ejecutado en un producto tuyo.

## Paso 7 Convertirlo en una oferta repetible

Puedes organizar la oferta en capacidades de la base, adaptación al proyecto, módulos opcionales, desarrollos específicos y operación o soporte. Tú eliges la composición de cada solución. El cliente recibe el software acordado; no necesita elegir entre accesos o conocer cómo reutilizas tu base.

Para cada venta, deja por escrito el alcance, los ajustes incluidos, las integraciones, los criterios de aceptación y quién mantiene cada extensión. Antes de fijar precios o plazos, mide el piloto y sus costos reales; aquí no se han calculado ni medido.

El aprendizaje del piloto debe responder qué partes puedes reutilizar al programar para el siguiente cliente y qué adaptación requiere su proyecto. Si aparece una necesidad común, evalúala como mejora de la base; si es particular, mantenla en la extensión correspondiente.

## El siguiente entregable concreto

Preparar el inventario de piezas del gestor existente de Bancavalor y definir primero el contrato de lectura de facturas: archivos que admite realmente, datos que devuelve, dependencias actuales y adaptadores necesarios. Comprobar una extracción aislada con documentos de prueba antes de declararla reutilizable. El módulo de carga masiva se conecta con ese contrato cuando corresponda, sin mezclar recepción, extracción y aprobación.

Este trabajo se encaja en la fase 1 ya elegida: primero comprobar el recorrido actual de recepción y aprobaciones y separar responsabilidades progresivamente, sin exigir una reescritura de todo el gestor. La prueba posterior de reutilización se hará con proyectos separados, sin exigir dos accesos para un cliente.

La implementación del piloto corresponde a `conectia360/vaultfolio-forge`, en una tarea del proyecto Bancavalor; REA es el espacio de esta investigación. La ubicación futura de los paquetes compartidos queda por decidir. Este plan y sus enlaces fueron revisados como documentación. No se han ejecutado las composiciones propuestas ni probado el visor del Taller o la exportación Word/PDF para este archivo.
