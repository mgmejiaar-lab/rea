# Protocolo reproducible para comparar gestores documentales

**Estas pruebas de producto no se han ejecutado.** Este archivo define cómo pasar del análisis documental y de código a un benchmark experimental comparable. Las comprobaciones aisladas de Mayan se describen por separado en [su informe](02-mayan-edms.md). [Volver al informe principal](00-informe-principal.md).

El resultado actual no permite asignar ganadores en precisión, velocidad, facilidad de uso o costo. Para hacerlo se necesitan instalaciones identificadas, el mismo corpus, configuraciones registradas y resultados observados.

## 1. Preparación sin efectos reales

Usar entornos de laboratorio, personas ficticias y un receptor de integraciones que no contabilice ni avise a terceros. Cada ejecución debe registrar producto, versión de servidor y cliente, motor de búsqueda/OCR, extensiones, permisos, configuración, hora y zona horaria. Las cuentas de producto y los consumos que puedan generar costo requieren autorización antes de usarlos.

Separar dos modalidades:

- **Comportamiento del fabricante:** comprobar una regla documentada concreta de los capítulos individuales y conservar la versión de la fuente.
- **Requisito del producto propio:** comprobar un resultado deseado de la propuesta, aunque un referente no lo implemente. No registrar ese caso como incumplimiento del fabricante sin un contrato que lo exija.

Un dato no observado se registra como «no probado». Un caso sin función comparable se registra como «no aplicable» con motivo. Ninguno equivale a cero en una puntuación.

## 2. Expediente de cada ensayo

| Dato del ensayo | Contenido mínimo                                                   |
| --------------- | ------------------------------------------------------------------ |
| Identidad       | ID del caso, producto, ambiente, versión, configuración y operador |
| Precondición    | Estado inicial, sujetos ficticios, permisos y documentos presentes |
| Entrada         | Original, SHA-256, verdad de referencia y variante aplicada        |
| Acción          | Pasos exactos de interfaz o solicitudes API sin credenciales       |
| Expectativa     | Contrato documentado o requisito propio, etiquetado explícitamente |
| Observación     | Resultado visible, respuesta API, registros y efecto en destino    |
| Medición        | Inicio/fin, espera, trabajo activo y recursos si son observables   |
| Veredicto       | Aprobado, fallido, no probado o no aplicable, con razón            |
| Limpieza        | Estado final y eliminación de datos sintéticos cuando corresponda  |

Conservar IDs y digests en lugar de depender de capturas sin contexto. Ocultar credenciales de transporte en la evidencia; no ocultar automáticamente datos sintéticos necesarios para reproducir el resultado.

## 3. Corpus inicial propuesto

Los nombres, valores e importes siguientes son **datos ficticios de ensayo**. El impuesto del 10 % es una regla artificial para comprobar aritmética; no representa una norma fiscal. Los tamaños y cantidades del corpus deben ampliarse según la población real; esta lista no es una muestra estadística representativa.

Caso base: proveedor `PROV-A`, receptor `EMPRESA-PRUEBA`, factura `F-000123`, moneda `USD`. Dos líneas: 2 × 100,00 y 1 × 50,00. Base 250,00; impuesto artificial 25,00; total 275,00. Pedido y recepción completos con las mismas cantidades. La verdad de referencia la revisan dos personas antes de medir extracción.

| ID  | Variante sobre el caso base                                       | Qué permite distinguir                             |
| --- | ----------------------------------------------------------------- | -------------------------------------------------- |
| C01 | PDF digital legible                                               | Funcionamiento básico                              |
| C02 | Escaneo del mismo contenido                                       | Extracción frente a texto embebido                 |
| C03 | Rotación y bajo contraste                                         | Robustez de captura sin cambiar la verdad          |
| C04 | Dos páginas y tabla partida                                       | Continuidad de líneas                              |
| C05 | Moneda ausente                                                    | Ausencia frente a valor supuesto                   |
| C06 | Descuento explícito cero y descuento ausente en otro documento    | Cero frente a vacío                                |
| C07 | Total impreso 285,00 con base e impuesto sin cambios              | Inconsistencia de 10,00                            |
| C08 | Proveedor `PROV-B` con el mismo número                            | Evitar falso duplicado entre proveedores           |
| C09 | Copia exacta con otro nombre de archivo                           | Duplicado binario                                  |
| C10 | Nuevo escaneo de F-000123                                         | Duplicado comercial con bytes distintos            |
| C11 | Mismo número dirigido a otra sociedad ficticia                    | Alcance de la clave comercial                      |
| C12 | Nota de crédito identificada como tal                             | Tipo documental y signos                           |
| C13 | Factura válida, recepción de una sola unidad en primera línea     | Entrega parcial, no error de lectura               |
| C14 | Factura sin pedido asociado                                       | Excepción comercial                                |
| C15 | Fecha `03/04/2026` sin convención declarada                       | Ambigüedad conservada, no resuelta por adivinación |
| C16 | Un lote con factura, recepción y página en blanco                 | Separación y clasificación                         |
| C17 | Archivo protegido con contraseña y archivo dañado                 | Rechazo técnico y explicación                      |
| C18 | Documento correcto con revisión posterior que cambia beneficiario | Caducidad de aprobación y resultados derivados     |

Para evaluar aprendizaje, reservar proveedores/plantillas fuera del entrenamiento. No medir contra los mismos documentos usados para ajustar reglas y luego llamar al resultado generalización. Registrar qué datos fueron usados para configuración, entrenamiento y evaluación.

## 4. Pruebas transversales

En la tabla, «criterio propuesto» define la intención del producto propio. Los capítulos de cada proveedor contienen las expectativas específicas del fabricante.

| ID  | Preparación y pasos                                               | Criterio propuesto y evidencia decisiva                                     |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| B01 | Importar C01, abrirlo y descargar su original                     | Identidad y digest del original conservados; ninguna sustitución silenciosa |
| B02 | Cortar una carga a mitad y reanudar                               | Resultado inequívoco de aceptados y pendientes; verificar duplicados        |
| B03 | Cargar C16 y corregir separación                                  | Cada documento conserva referencia al lote/páginas originales               |
| B04 | Procesar C17                                                      | Error con causa; no aparece falsamente como validado                        |
| B05 | Crear revisión V2 mientras termina extracción de V1               | El resultado tardío sigue asociado a V1                                     |
| B06 | Reordenar páginas y descargar original/representación             | Diferencia de composición explicable y original recuperable                 |
| B07 | Renombrar proveedor relacionado                                   | Referencias siguen al mismo proveedor, no al texto del nombre               |
| B08 | Retirar acceso al destino de una relación                         | No se revelan contenido ni metadatos protegidos por navegación indirecta    |
| B09 | Aplicar dos fuentes de permiso con efectos distintos              | Resultado coherente con la política declarada y explicable                  |
| B10 | Revocar acceso con sesión y vista abiertas                        | Medir momento efectivo de revocación; contrastar UI y nueva solicitud       |
| B11 | Misma identidad en lista, detalle, descarga, OCR, miniatura y API | Ninguna vía concede acceso que su política prohíbe                          |
| B12 | Usuario de organización A intenta acceder a documento de B        | Denegación en todas las vías; sin filtración en búsqueda o recuentos        |
| B13 | Editar regla V2 mientras una instancia usa V1                     | La instancia conserva regla identificable o migración explícita             |
| B14 | Guardar V2 sin publicarla y crear un caso nuevo                   | El sistema expresa qué versión se aplica realmente                          |
| B15 | Dos personas deciden a la vez sobre una tarea compartida          | Una transición válida; conflictos explicados; efectos contados              |
| B16 | Política de todas las aprobaciones y rechazo temprano             | Pendientes y resultado cumplen la política elegida                          |
| B17 | Reasignar tarea después de que el primer actor la abra            | Autoridad comprobada al confirmar, no solo al abrir                         |
| B18 | Creador intenta aprobar su propio gasto                           | Resultado según política de segregación expresamente configurada            |
| B19 | Cambiar beneficiario o total tras aprobación                      | Reaprobación o bloqueo según la política; decisión anterior intacta         |
| B20 | Falta el responsable calculado por metadatos                      | Excepción visible; no escoger otro por suposición                           |
| B21 | Vence un plazo con trabajador detenido                            | Recuperación controlada, un efecto por vencimiento y hora explicable        |
| B22 | Confirmar C07 con extracción correcta                             | Regla aritmética impide el resultado definido como inválido                 |
| B23 | Revisar C05, C06 y C15                                            | Ausente, cero y ambiguo permanecen distinguibles                            |
| B24 | Procesar C13 y C14                                                | Revisión comercial separada de lectura de datos                             |
| B25 | Importar C09 y C10 secuencialmente y a la vez                     | Candidatos explicables y ausencia de doble operación en destino             |
| B26 | Importar C08 y C11                                                | Medir falsos positivos; no fusionar negocios distintos                      |
| B27 | Editar esquema existente y después vincular uno nuevo             | Cambio histórico conocido y exportación original recuperable                |
| B28 | Destino acepta pero pierde respuesta                              | Estado incierto seguido de conciliación; no reenvío ciego                   |
| B29 | Destino devuelve 400, 409, 429 y 500 por separado                 | Tratamiento según contrato; no confundir cualquier HTTP con éxito           |
| B30 | Destino devuelve 202 y finaliza después                           | Recibido y confirmado comercialmente son estados distintos                  |
| B31 | Repetir webhook y entregarlo fuera de orden                       | Procesamiento con identidad y revisión, sin revertir un dato nuevo          |
| B32 | Borrar y restaurar el caso aprobado                               | No repetir alta comercial por restauración                                  |
| B33 | Intentar purgar con retención/bloqueo de conservación             | Resultado de política registrada; no asumir equivalencia entre ambos        |
| B34 | Cambiar nombre del actor y etiqueta de una regla                  | La decisión anterior sigue siendo explicable                                |
| B35 | Restaurar una copia de base y almacenamiento en laboratorio       | Recuento y digest completos, referencias coherentes y búsqueda regenerable  |
| B36 | Paginar todos los resultados bajo permisos restringidos           | Sin omisiones/duplicados por paginación; cobertura y filtros registrados    |

No se atribuye a los cuatro referentes la existencia de una separación multiempresa concreta, retención legal, política de autoaprobación o API para cada caso. Primero se determina aplicabilidad en cada instalación.

## 5. Medir sin confundir cobertura y calidad

**Exactitud por campo:** campos correctos / campos evaluables. Publicar normalizaciones permitidas, tolerancias y denominador por campo. Un campo ausente no se cuenta automáticamente como correcto.

**Factura completamente correcta:** facturas con todos los campos críticos correctos / facturas evaluables. Declarar qué campos son críticos. Es una exigencia distinta de la media por campo.

**Automatización:** documentos que terminan sin revisión humana / documentos elegibles. Reportar a la vez errores dentro de ese subconjunto. Aumentar automatización sin medir sus errores puede ocultar deterioro.

**Duplicados:** matriz de verdaderos/falsos positivos y verdaderos/falsos negativos para duplicado binario y comercial por separado. Incluir concurrencia; un caso secuencial no prueba exclusión simultánea.

**Tiempo:** medir desde recepción hasta resultado de negocio, y por etapas: cola, extracción, revisión, aprobación e integración. Separar tiempo activo humano de espera. Usar distribución y percentiles, no solo una media; registrar cantidad de observaciones.

**Recursos:** cuando el entorno permita medirlos, registrar tiempo de CPU y memoria máxima de la familia de procesos, además de tiempo de pared. En SaaS esos datos pueden ser desconocidos; no sustituirlos con la memoria del navegador. Separar ejecuciones frías y calientes y registrar cache/configuración.

**Costo:** registrar consumo real de páginas/documentos, llamadas, almacenamiento y licencias conforme al contrato del ensayo. No hay precios medidos ni estimados en este dossier. Las llamadas a modelos u OCR pagados no están autorizadas por este protocolo.

**Accesibilidad operativa:** contar tareas completadas sin asistencia, errores de interpretación y tiempo de recuperación. El ensayo debe usar el mismo guion y participantes comparables. No inferir facilidad de uso de capturas publicitarias.

Si se usan agentes en el ensayo, medir también tokens y llamadas del flujo completo, incluidas herramientas, esquemas y reintentos; no inferir ahorro a partir de una respuesta más corta.

## 6. Criterios de cierre

Un caso solo queda aprobado cuando la evidencia incluye la precondición, la acción y el resultado, con la misma versión/configuración. Una respuesta simulada demuestra únicamente el comportamiento del componente bajo simulación; no el del servicio real.

No dar por resuelto un riesgo de concurrencia con una prueba de un solo actor. No dar por verificada la autorización porque desapareció un botón. No dar por confirmada una exportación porque terminó una tarea. No dar por recuperable un repositorio porque existe una copia sin restaurarla.

Para cerrar el benchmark experimental todavía hacen falta cuentas o instalaciones autorizadas y un corpus real representativo. Este dossier cierra la investigación pública y de código disponible; deja explícitos los experimentos restantes sin atribuirles resultados.
