# Plan para una base reutilizable de gestión documental

Necesitas **una base de código de gestión documental que tú puedas incorporar y adaptar al construir el software de cada cliente**. En cada proyecto tú decides si entregas solamente gestión documental o si la integras con los demás módulos de una aplicación. El cliente recibe la solución que hayas preparado para él.

La aclaración del usuario sustituye el enfoque anterior de dos accesos al mismo sistema. Se reutilizan capacidades y código entre proyectos; no se exige que un cliente tenga ambas modalidades, comparta datos entre dos aplicaciones o dependa de un servicio documental central.

Es una propuesta para llevar el [benchmark](2026-10-16-gestion-documental/00-informe-principal.md) a una base propia. El primer caso identificado es Bancavalor: se hizo una revisión inicial de su gestor existente, documentada en [el punto de partida](2026-10-17-bancavalor-punto-de-partida-documental.md). No se ha probado su funcionamiento real ni estimado la implementación. No hay código nuevo de aplicación en esta entrega.

## Cómo utilizas la base en tus proyectos

| Decisión tuya para el proyecto        | Qué construyes                                                                                   | Qué aporta la base                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Entregar solo gestión documental      | Una aplicación documental adaptada al cliente                                                    | Documentos, versiones, búsqueda, permisos, historial, procesos y componentes de pantalla |
| Incorporarla a un software más amplio | Una aplicación con los módulos de negocio que el cliente necesita y gestión documental integrada | Las mismas capacidades, adaptadas a los usuarios, datos y navegación de esa aplicación   |

La recomendación técnica es mantener el núcleo como un módulo con versiones identificables. Cada aplicación incorpora una versión y sus ajustes particulares. Los puntos de adaptación conectan el módulo con la identidad, permisos, almacenamiento y entidades de esa aplicación. Las pantallas pueden reutilizar componentes de la base o incluir desarrollos específicos.

La forma concreta de empaquetarlo depende de las tecnologías que ya uses. Puede tener contratos internos entre módulos y exponer una API cuando la aplicación la necesite; no tiene que empezar como un servicio remoto. Esa decisión requiere revisar tus proyectos y no se ha tomado aquí.

## Paso 1 Elegir el primer proceso que vas a vender

El usuario eligió Bancavalor, banca de inversión, como primer caso. Se parte de su gestor existente y se trabaja por fases: primero [recepción y aprobaciones](2026-10-17-bancavalor-fase-1-recepcion-y-aprobaciones.md). La emisión queda aplazada y no se añade un proceso de compras. Las preguntas sobre emisión ya no bloquean el primer ajuste.

Antes de elegir tecnología o fechas, inventaría lo que ya tienen tus aplicaciones: acceso de usuarios, documentos, permisos, integraciones y almacenamiento. Identifica qué se puede reutilizar y qué está acoplado a un cliente concreto.

**Entrega:** una ficha del piloto con recorrido completo, tipos documentales, actores, reglas, excepciones e integraciones. Para ese proyecto, elige una modalidad de entrega: aplicación documental o módulo de una solución más amplia.

## Paso 2 Delimitar el producto común y sus módulos

Como base inicial propongo documentos y originales, versiones, metadatos, búsqueda por metadatos, permisos, historial y relación con expedientes del negocio. Añadir un proceso de revisión y aprobación acotado para demostrar el ciclo completo.

La extracción OCR, interpretación de facturas, cotejo con pedidos, firma y conectores especializados pueden ser módulos opcionales. Su prioridad debe salir del piloto. Un gestor de contratos no tiene por qué ejecutar el procesamiento de facturas para poder funcionar.

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

Preparar la especificación de la base reutilizable: funciones incluidas, componentes de pantalla, puntos de adaptación, extensiones y forma de incorporarla a tus proyectos. Elegir después un primer proyecto y su modalidad de entrega. La prueba de reutilización se hará con proyectos separados, sin exigir dos accesos para un cliente.

La implementación corresponde al repositorio del producto documental, por identificar; REA es el espacio de esta investigación. Este plan y sus enlaces fueron revisados como documentación. El visor del Taller y la exportación Word/PDF no se han probado para este archivo.
