# Ingeniería inversa de gestión documental

**La investigación pública y de código está realizada; la validación integrada de los productos sigue pendiente.** No se accedió a cuentas de DocuWare, M-Files o Rossum ni se levantó Mayan. En Mayan sí se inspeccionó el código oficial y se ejecutaron diez comprobaciones aisladas de métodos reales con dependencias simuladas. Este alcance permite extraer contratos, reglas y riesgos de diseño; no permite certificar rendimiento, precisión OCR, seguridad global ni equivalencia con una instalación.

Fecha de corte: **16 de octubre de 2026**, hora local de Colombia. Destinatario: el responsable de un producto de gestión documental que quiere aprender de referentes concretos. El repositorio de trabajo es REA; no se identificó ni se modificó la aplicación documental del usuario.

La conclusión principal es que un buen gestor documental debe poder explicar **qué documento y versión se procesaron, qué regla se aplicó, quién tenía autoridad y qué resultado quedó confirmado**. Los cuatro referentes aportan piezas distintas para resolverlo. La prioridad sugerida sigue el orden solicitado: DocuWare para entender el proceso configurable y Mayan para contrastar decisiones con implementación, complementados por M-Files y Rossum.

## 1. Qué leer primero

| Documento                                                                                                 | Qué resuelve                                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [01 DocuWare](01-docuware.md)                                                                             | Configuración, publicación, aprobaciones, autoridad de workflow, versiones e integraciones          |
| [02 Mayan EDMS](02-mayan-edms.md)                                                                         | Modelo real de documentos, versiones, ACL, workflows, OCR y búsqueda, con rutas de código fijadas   |
| [03 M-Files](03-m-files.md)                                                                               | Relaciones de negocio, permisos automáticos, excepciones y publicación histórica                    |
| [04 Rossum](04-rossum.md)                                                                                 | Extracción, confianza, reglas, revisión humana, duplicados y confirmación de exportación            |
| [05 Arquitectura y aprendizajes](05-arquitectura-y-aprendizajes.md)                                       | Propuesta conceptual para aprovechar los hallazgos sin atribuirla a ningún proveedor                |
| [06 Protocolo de pruebas](06-protocolo-de-pruebas.md)                                                     | 36 casos transversales, 18 variantes de corpus y métricas; todos los ensayos de producto pendientes |
| [Evidencia de Mayan](evidencias/mayan-evidencia.json) y [script repetible](evidencias/verificar-mayan.py) | Identidad de fuente, hashes, símbolos y diez comprobaciones ejecutadas                              |

Para una primera lectura, revisar esta síntesis y los apartados de aprendizajes de DocuWare y Mayan. Para decidir implementación, seguir las referencias de código y ejecutar los casos de aceptación pertinentes.

## 2. Los hallazgos que cambian decisiones

### Guardar una regla no significa activarla

DocuWare distingue guardado automático, publicación y ejecuciones en curso. Su documentación mantiene las instancias iniciadas fuera de los cambios posteriores de configuración. Es un contrato valioso para evitar que un expediente cambie de reglas a mitad de camino. [Dashboard oficial](https://knowledgecenter.docuware.com/help/docs/webbased-workflow-designer-dashboard).

En Mayan, la inspección muestra referencias de instancia y log hacia una plantilla y transiciones mutables. **Derivación:** el historial necesita una estrategia expresa de conservación de significado; una FK hacia la configuración actual no demuestra un snapshot histórico. El informe enlaza también los handlers que eliminan instancias al eliminar configuración. Eso se observó en fuente, no como incidente reproducido. [Análisis de workflows de Mayan](02-mayan-edms.md).

**Decisión propuesta:** identificar la versión de proceso usada por cada ejecución y tratar migraciones de expedientes como operaciones explícitas.

### El permiso efectivo depende de cómo se combinan sus fuentes

DocuWare documenta derechos aditivos. M-Files documenta fuentes automáticas restrictivas y mecanismos adicionales que impiden reducir todo el producto a una única operación de intersección. Mayan reutiliza filtros ACL y permite que un permiso global satisfaga la consulta. Son semánticas diferentes. [DocuWare](https://knowledgecenter.docuware.com/docs/assigning-rights), [M-Files](03-m-files.md), [Mayan](02-mayan-edms.md).

**Decisión propuesta:** explicar qué concede cada acción y comprobar la misma identidad en búsqueda, detalle, descarga, OCR y API. Asignación a una tarea, permiso sobre documento y autoridad técnica deben tener reglas separadas.

### Una transacción local no demuestra una sola aprobación

En el tramo de Mayan estudiado hay transacción para actualizar estado y guardar log; no se vio en ese método bloqueo de fila ni comparación de estado esperado. Esto justifica un experimento concurrente, **no una afirmación de fallo reproducido**. [Camino de transición y reservas](02-mayan-edms.md).

**Decisión propuesta:** cada decisión debe tener identidad estable, revisión esperada y un criterio que impida efectos duplicados. El caso B15 del protocolo define cómo comprobarlo.

### Terminar OCR no equivale a validar una factura

En Mayan, una rama de error OCR de página se registra sin relanzarla, mientras el callback de versión no cuenta páginas correctas antes de emitir finalización. El código permite distinguir «procesamiento terminó» de «todo el contenido se reconoció». Rossum aporta un modelo de bloqueos y validación por datos que conviene estudiar aparte. [Código y límites de OCR Mayan](02-mayan-edms.md), [validación en Rossum](04-rossum.md).

**Decisión propuesta:** conservar resultados parciales y errores por página/campo; la autorización de gasto requiere reglas de negocio independientes.

### Una exportación puede parecer exitosa y no estar aceptada

La documentación de la extensión REST API Export de Rossum indica que, sin un resolvedor configurado, cualquier código HTTP del envío cuenta como éxito. Es una condición específica de esa extensión, no una descripción de todas sus integraciones. [Fuente oficial](https://knowledge-base.rossum.ai/docs/rest-api-export).

**Decisión propuesta:** guardar el acuse e identidad del registro externo, no solo un estado exportado. Si el destino aceptó pero se perdió la respuesta, conciliar antes de repetir.

### Detectar duplicados no sustituye impedir una doble operación

Rossum reconoce una limitación de detección durante importaciones concurrentes. La comparación de bytes y el reconocimiento de una misma factura comercial son problemas distintos. [Extensión de duplicados](https://knowledge-base.rossum.ai/docs/duplicate-handling-extension).

**Decisión propuesta:** tratar coincidencias como candidatos explicables y asegurar la unicidad de la operación en el sistema que la registra, según una clave comercial acordada.

### Un referente también puede tener documentación inconsistente

En Rossum hay una discrepancia entre los umbrales predeterminados publicados y contradicciones en documentación de líneas y roles. En DocuWare hay contenido del nuevo cliente con notas editoriales y descripciones incompatibles de algunas acciones de papelera. Se conservaron esas incertidumbres en los capítulos individuales. No se eligió la variante más conveniente para presentar una conclusión falsa. [Rossum](04-rossum.md), [DocuWare](01-docuware.md).

**Decisión propuesta:** fijar versión, cliente, extensión y configuración antes de adoptar una regla; comprobar en laboratorio los puntos contradictorios.

## 3. Comparación por capacidad y evidencia

**D:** documentación oficial. **C:** código del commit fijado. **A:** comprobación aislada ejecutada. **ND:** no demostrado en este estudio; no significa que el producto carezca de la capacidad. La tabla no es un ranking comercial.

| Pregunta                                | DocuWare                                             | Mayan                                                      | M-Files                                                    | Rossum                                                           |
| --------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| ¿Cuál es el aprendizaje principal?      | D: proceso configurable y publicación                | C: límites entre recursos y procesamiento                  | D: contexto y autorización                                 | D: extracción y excepciones                                      |
| ¿Cómo se representa el trabajo?         | D: configuración, instancia, tarea                   | C: plantilla, instancia, estado y log                      | D: objeto/versiones y workflow                             | D: anotación, cola y esquema                                     |
| ¿Cómo se relacionan documentos?         | D: reglas por índices; alcance de cliente            | C: modelo documental estudiado; grafo comercial general ND | D: referencias entre objetos y direcciones                 | D: documento/anotación/procedencia; grafo empresarial general ND |
| ¿Qué sabemos de autorización?           | D: perfiles, derechos aditivos y usuario de workflow | C/A: ramas ACL; SQL/HTTP reales ND                         | D: múltiples fuentes y excepciones                         | D: roles; discrepancias UI/API pendientes                        |
| ¿Qué sabemos de versiones?              | D: documento y configuración separados               | C/A: originales/composición y append                       | D: identidad y revisiones, acceso histórico                | D: evolución de esquema y datos asociados                        |
| ¿Qué sabemos de facturas?               | D: aprobación y ejemplo de cotejo                    | C: OCR de texto; validación financiera ND                  | D: metadatos/procesos; extracción de facturas no analizada | D: campos, líneas, reglas, revisión y exportación                |
| ¿Concurrencia de decisiones?            | ND en ejecución                                      | Reserva de fuente; prueba SQL pendiente                    | ND en ejecución                                            | ND en ejecución                                                  |
| ¿Entrega externa exactamente una vez?   | ND                                                   | ND; configuración de tareas importa                        | ND                                                         | ND; reintentos documentados                                      |
| ¿Retención legal o auditoría inmutable? | No certificadas                                      | No certificadas                                            | No certificadas                                            | No certificadas                                                  |
| ¿Producto ejecutado de punta a punta?   | No                                                   | No; solo diez casos aislados                               | No                                                         | No                                                               |
| ¿Rendimiento y precisión medidos?       | No                                                   | No                                                         | No                                                         | No                                                               |

Los capítulos enlazados en la sección 1 contienen las fuentes de cada celda. Un producto especializado en captura no debe recibir una puntuación negativa por una capacidad de repositorio que este estudio no evaluó.

## 4. Procedencia y comprobaciones

Mayan se obtuvo de [GitLab oficial](https://gitlab.com/mayan-edms/mayan-edms), conforme a la indicación del usuario. El SHA analizado es `834ffec1b539171390358e60a0406870108514f5`; el código declara 4.12.2. No se usó el espejo de GitHub ni se supuso un tag de versión que no se encontró anunciado.

El proceso de evidencia terminó con código de salida 0: **67 archivos con SHA-256, 66 archivos Python parseados y diez comprobaciones aisladas aprobadas**. El JSON conserva qué se probó y qué quedó excluido. No se ejecutaron Django, PostgreSQL, Celery, Tesseract ni almacenamiento remoto. [Evidencia reproducible](evidencias/mayan-evidencia.json).

La lectura estática siguió productores y consumidores: API → validación → modelo → efectos; además contrastó rutas hermanas de autorización. Una ausencia de bloqueo en un método no se convirtió en ausencia global de protección. Los experimentos posteriores están definidos para resolver ese límite.

La metodología utilizó la guía [reverse-engineer-anything](../../.agents/skills/reverse-engineer-anything/SKILL.md): separar evidencia, inferencia e incertidumbre y estudiar código completo con herramientas de repositorio. No se instalaron motores ni se fingió haber descompilado software propietario.

La consulta web aportó documentación primaria. Los fragmentos de buscador sirvieron para localizar fuentes; las afirmaciones se elaboraron sobre páginas accesibles. Las incidencias de acceso y las contradicciones relevantes están registradas por producto. Las páginas web son fuentes móviles; el código Mayan sí está fijado por SHA.

Los siete documentos pasaron una comprobación de enlaces locales, referencias y bloques Markdown. Sus diez diagramas se renderizaron con Mermaid 12.2.0 en una página aislada de navegador; se revisaron capturas y se ajustaron los flujos cuya escala dificultaba la lectura. Esto comprueba ese renderizador, no el visor de Documentos del Taller ni sus exportaciones a Word/PDF, que quedaron sin probar. [Validación estructural](evidencias/validacion-documental.json), [alcance del renderizado](evidencias/renderizado.json).

## 5. Qué hacer con estos aprendizajes

**Primero**, seguir un documento de la aplicación propia desde ingreso hasta decisión y resultado externo, identificando dónde se pierde versión, regla, actor o evidencia. No se ha hecho ese diagnóstico aquí porque esa aplicación no está identificada en esta tarea.

**Después**, elegir una mejora acotada cuya necesidad aparezca en ese recorrido. Si el problema son permisos, usar los criterios de M-Files y las fronteras ACL de Mayan. Si es configuración y aprobación, partir de DocuWare. Si es captura y corrección de facturas, empezar por Rossum. Las recomendaciones son por capacidad, no una propuesta de compra.

**Antes de automatizar más**, ejecutar los casos de duplicado, cambio después de aprobación y resultado externo incierto. Una automatización rápida que no pueda explicar estos tres escenarios puede trasladar el error sin hacerlo visible.

La [arquitectura conceptual](05-arquitectura-y-aprendizajes.md) define responsabilidades y reglas propuestas. El [protocolo](06-protocolo-de-pruebas.md) permite convertirlas en pruebas sin improvisar datos, autoridades ni expectativas.

## 6. Límites que siguen abiertos

Faltan sesiones o instalaciones autorizadas para ejecutar flujos reales. No se midieron precisión de lectura, tiempos, recursos, costo ni usabilidad. No se analizaron binarios propietarios, infraestructura privada, cumplimiento normativo ni garantías contractuales. No se verificó la paridad de todas las versiones, clientes y extensiones.

No se publicaron cambios de aplicación, no se crearon cuentas, no se enviaron documentos a servicios pagados y no se hicieron asignaciones o notificaciones a personas reales. El resultado entregado es el dossier, su evidencia de código y el plan de verificación; no una integración activada.

La investigación disponible queda cerrada con esos límites. El siguiente paso útil es abrir el capítulo de DocuWare, continuar con Mayan y escoger una regla del producto propio para contrastarla con los casos de prueba, sin sustituir el producto existente.
