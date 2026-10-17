# Plan para un gestor documental independiente e integrable

La recomendación es desarrollar **un núcleo documental reutilizable, dos formas de uso y una capa de personalización por compañía**. Esto responde a tu negocio de software a medida: poder vender solo gestión documental o incorporarla dentro de las aplicaciones que entregas, manteniendo ajustes particulares en ambos casos.

Es una propuesta para llevar el [benchmark](2026-10-16-gestion-documental/00-informe-principal.md) a un producto propio. No se ha inspeccionado aquí una aplicación tuya que permita determinar qué existe ya, cuánto habría que cambiar ni cuánto tardaría. No hay implementación nueva en esta entrega.

## Las dos formas de uso

| Modalidad     | Qué recibe el cliente                                                                          | Qué se reutiliza                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Independiente | Un gestor documental con acceso, navegación, marca y configuración propios                     | Motor documental, permisos, historial, procesos y componentes de pantalla                |
| Integrada     | Gestión documental dentro de su aplicación, por ejemplo en la ficha de un contrato o proveedor | El mismo motor y componentes, conectados mediante una API y una integración de identidad |

La API es el contrato por el que las pantallas y otros programas piden operaciones al motor. La aplicación independiente también debe usar ese contrato. Una integración podrá reutilizar tus pantallas o construir pantallas específicas sobre la misma API.

**Estar dentro de la pantalla del cliente y ejecutarse en su infraestructura son decisiones diferentes.** Un módulo integrado puede conectarse a tu servicio. Si un cliente requiere una instalación dedicada, debe desplegarse una versión del mismo producto con su configuración, evitando una copia de código que evolucione por separado. La selección entre recursos compartidos y dedicados depende de aislamiento y operación; la distinción entre cliente lógico e instalación está explicada en [Microsoft Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models). Esta referencia no implica elegir Azure.

## Paso 1 Elegir el primer proceso que vas a vender

Escoge un proceso concreto para el piloto: por ejemplo, recepción, revisión y aprobación de documentos asociados a un contrato. Es un ejemplo, no una necesidad confirmada de tus clientes. Describe quién participa, qué documentos usa, qué decisión toma y qué resultado debe obtener.

Antes de elegir tecnología o fechas, inventaría lo que ya tienen tus aplicaciones: acceso de usuarios, documentos, permisos, integraciones y almacenamiento. Identifica qué se puede reutilizar y qué está acoplado a un cliente concreto.

**Entrega:** una ficha del piloto con recorrido completo, tipos documentales, actores, reglas, excepciones e integraciones. Incluir dos contextos de uso: desde el gestor independiente y desde una aplicación anfitriona.

## Paso 2 Delimitar el producto común y sus módulos

Como base inicial propongo documentos y originales, versiones, metadatos, búsqueda por metadatos, permisos, historial y relación con expedientes del negocio. Añadir un proceso de revisión y aprobación acotado para demostrar el ciclo completo.

La extracción OCR, interpretación de facturas, cotejo con pedidos, firma y conectores especializados pueden ser módulos opcionales. Su prioridad debe salir del piloto. Un gestor de contratos no tiene por qué ejecutar el procesamiento de facturas para poder funcionar.

La [arquitectura del benchmark](2026-10-16-gestion-documental/05-arquitectura-y-aprendizajes.md) desarrolla las separaciones importantes: documento y revisión; extracción y validación; tarea y decisión; envío externo y confirmación.

**Entrega:** una lista de capacidades base, módulos opcionales y exclusiones de la primera entrega. No construir un diseñador general de procesos antes de comprobar el primer proceso configurable.

## Paso 3 Fijar cómo se conecta con cada aplicación

Define operaciones comunes para cargar, consultar, versionar, buscar y relacionar documentos; iniciar un proceso; decidir una tarea; consultar el historial y obtener el archivo con autorización. Define también cómo informa resultados a la aplicación anfitriona y cómo se recupera de una respuesta perdida.

Para la integración, acuerda identidad del usuario, compañía y contexto de negocio. Por ejemplo, un documento puede relacionarse con un contrato del programa del cliente sin copiar toda su base de contratos. La referencia debe distinguir compañía, integración, tipo de objeto e identificador externo, y tener una política cuando el objeto cambia o desaparece.

El módulo debe comprobar permisos en el servidor para cada operación. Recibir un identificador de compañía o de contrato desde una pantalla no demuestra que el usuario tenga acceso. Este criterio coincide con la validación por petición y de recursos concretos de [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

**Entrega:** contrato de API, integración de identidad y una aplicación anfitriona mínima de prueba. No es necesario separar todo en microservicios: puede comenzar como un backend modular con responsabilidades claras.

## Paso 4 Separar las personalizaciones

| Tipo de ajuste        | Ejemplos propuestos                                                                                      | Cómo mantenerlo                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Configuración         | Marca, nombres, campos obligatorios, categorías, responsables, plazos, pasos y condiciones de aprobación | Configuración validada y versionada por compañía              |
| Módulo opcional       | Lectura de facturas, firma, cotejo o un conector reutilizable                                            | Capacidad del producto con activación y permisos definidos    |
| Desarrollo específico | Una pantalla propia, un cálculo particular o un conector al sistema de un cliente                        | Extensión separada con contrato, versión y pruebas propias    |
| Mejora del núcleo     | Una capacidad común que sirve a varios clientes                                                          | Cambio del producto compartido, con pruebas de compatibilidad |

Ejemplo: que una compañía use una aprobación y otra dos puede resolverse con configuración. Enviar el resultado a un sistema particular puede requerir un conector. Una pantalla especial puede consumir la misma API sin redefinir los permisos ni el historial.

Cada petición de cliente debe clasificarse antes de presupuestarla. Mantén una versión identificable del núcleo y registra qué configuración y extensiones usa cada compañía. No conviertas la configuración en ejecución libre de código ni permitas que una personalización anule el aislamiento de datos o borre el significado de decisiones anteriores.

**Entrega:** catálogo inicial de ajustes permitidos y ficha de cada extensión, con responsable de mantenimiento, dependencias y pruebas de aceptación.

## Paso 5 Definir el aislamiento y la operación

Define el ámbito del cliente: una compañía puede tener sociedades, sedes o departamentos y eso no debe confundirse automáticamente con instalaciones independientes. Decide qué comparten y qué deben mantener separado en el piloto.

Aplicando tu estándar, la base sería Supabase, con esquema y usuario de base de datos propios de la aplicación, pertenencia a la app, control de acceso desde el inicio y Storage privado. Si varias compañías comparten la aplicación, el control debe exigir además pertenencia y permiso en la compañía correspondiente: pertenecer a la app por sí solo no basta. La ubicación concreta en un proyecto existente requiere tu elección y confirmación antes de crear infraestructura.

Prueba el aislamiento en archivos, búsquedas, versiones, historial y tareas en segundo plano. Incluye respaldo y restauración, exportación de datos de un cliente y medición de su consumo. Si se ofrece infraestructura dedicada, define quién la opera, cómo se actualiza y qué diferencias de servicio se admiten, conservando el mismo producto.

**Entrega:** una matriz de acceso y un procedimiento de alta, actualización, recuperación y salida de un cliente. No hay infraestructura creada por este plan.

## Paso 6 Construir un recorrido completo en ambas modalidades

El primer resultado funcional debería permitir:

1. Entrar como usuario autorizado de una compañía.
2. Subir un documento y asociarlo a un expediente.
3. Revisarlo y tomar una decisión sobre una versión identificada.
4. Consultar quién decidió, qué regla se aplicó y qué versión revisó.
5. Repetir el recorrido desde la aplicación anfitriona con la misma política.

Después, configura dos compañías de prueba con reglas diferentes. Deben usar la misma versión del núcleo. Cambiar un requisito en una no debe modificar la otra, y cambiar de presentación no debe crear otro documento ni perder el historial.

La integración de identidad debe incluir expiración de sesión y revocación. La recepción de un resultado repetido no debe producir una segunda aprobación o una segunda operación externa. Los casos del [protocolo del benchmark](2026-10-16-gestion-documental/06-protocolo-de-pruebas.md) sirven como base, especialmente aislamiento, concurrencia, cambios de versión y conciliación.

**Criterio para avanzar:** demostrar ambos recorridos, impedir accesos cruzados y actualizar el núcleo manteniendo las dos configuraciones. Estas pruebas están propuestas; no se han ejecutado en un producto tuyo.

## Paso 7 Convertirlo en una oferta repetible

Puedes organizar la oferta en producto base, puesta en marcha, módulos opcionales, desarrollos específicos y operación o soporte. Las modalidades independiente e integrada necesitan describir claramente qué incluye la entrega; integrar identidad y datos del cliente es trabajo que debe quedar acotado.

Para cada venta, deja por escrito el alcance, los ajustes incluidos, las integraciones, los criterios de aceptación y quién mantiene cada extensión. Antes de fijar precios o plazos, mide el piloto y sus costos reales; aquí no se han calculado ni medido.

El aprendizaje comercial del piloto debe responder si el siguiente cliente se incorpora principalmente configurando el producto o si exige reconstruirlo. Si aparece una necesidad común, evalúala como mejora del núcleo; si es particular, mantenla en la extensión correspondiente.

## El siguiente entregable concreto

Preparar una especificación de la primera versión con el proceso piloto, núcleo compartido, dos formas de uso, personalizaciones admitidas y criterios de aceptación. El primer hito de implementación debe demostrar el mismo expediente funcionando en ambas modalidades y con dos configuraciones de compañía.

La implementación corresponde al repositorio del producto documental, por identificar; REA es el espacio de esta investigación. Este plan y sus enlaces fueron revisados como documentación. El visor del Taller y la exportación Word/PDF no se han probado para este archivo.
