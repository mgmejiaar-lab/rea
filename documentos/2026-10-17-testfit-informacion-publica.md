# TestFit: qué se puede saber con información pública

17 de octubre de 2026

## Alcance de esta investigación

Esta nota **no es ingeniería inversa técnica**: no hay cuenta, ni archivo, ni app instalada de TestFit que analizar con REA. Es investigación de fuentes públicas (web de TestFit, su base de conocimiento, y dos fuentes de terceros) sobre cómo describe el producto su propio funcionamiento. Separo lo que TestFit afirma de sí mismo (marketing), lo que dice una fuente periodística independiente, y lo que queda sin verificar.

No se pudo acceder a la documentación de versión/release notes (`support.testfit.io`) porque redirige a `app.testfit.io/resources`, que requiere sesión — no se insistió porque no hay cuenta autorizada.

## 1. Qué es, según fuente independiente (AEC Magazine)

- Empresa con sede en Texas (EE. UU.), fundada en 2016 por el arquitecto Clifton Harness y Ryan Griege, para automatizar trabajo repetitivo de proyectos residenciales (distribución de unidades y estacionamientos).
- Cliente principal histórico: desarrolladores inmobiliarios, no arquitectos (la adopción arquitectónica fue lenta, por costo).
- Antes fue plug-in de Forma (ex Spacemaker); según el periodista, esa experiencia le mostró los límites de las apps 100% en la nube, lo que explica por qué TestFit es una app de escritorio que prioriza velocidad local.

## 2. El algoritmo: lo que dice marketing vs. lo que dice la fuente independiente

**TestFit (marketing)**: presenta la generación como "Real-Time AI", combinando "the power of AI" con parámetros de código, prometiendo miles de opciones en segundos.

**AEC Magazine (independiente)**: el núcleo **no es IA en su mayor parte**, es un motor de resolución **paramétrica** que evalúa cientos de condiciones de sitio/diseño/costo y devuelve una opción optimizada. Para la función de diseño generativo (aparte, en beta) usa un solver **basado en objetivos** (goal-based): el usuario define KPIs y rangos min/max, el motor genera una solución y variantes, y recalcula al cambiar restricciones. La propia empresa evita llamarlo "IA" en ese contexto técnico, aunque sí lo hace en marketing.

**Lo que no se sabe**: ni TestFit ni las fuentes de terceros (fitgap, datadrivenaec) publican el algoritmo de optimización en detalle, cómo pondera criterios en conflicto, ni métricas de precisión validadas independientemente.

## 3. Flujo: de parcela + programa + parking + restricciones a alternativas

Según la página oficial del Site Solver (marketing, sin detalle algorítmico):

1. **Definir el sitio**: parcela por APN/dibujo (metes and bounds), masa, vialidad, usos mixtos, contexto 3D.
2. **Restricciones**: zonas de exclusión (inundación, humedales vía ESRI), datos de suelo SSURGO (tipo, nivel freático, profundidad de roca, pendiente), ubicación de plantas eléctricas.
3. **Código/zonificación**: perfil con FAR, unidades/acre, ratio de estacionamiento (aplicado a todo el sitio); circulación vertical y núcleos (automáticos o manuales).
4. **Programa**: tipología (multifamiliar, industrial, mixto...), mezcla y tamaños de unidad, amenidades, balcones; se pueden guardar como presets reutilizables.
5. **Costos/deal**: corte/relleno/importación/exportación de tierra; costo de terreno, duro, blando, ingresos.
6. **Parámetros de optimización**: objetivos y filtros min/max (FAR, parking ratio, altura, cobertura, yield on cost...).
7. **Generar**: el motor produce opciones ("schemes") dentro de esos límites.
8. **Filtrar/ordenar/regenerar**: por KPI, refinando sobre una solución preferida.
9. **Comparar**: esquemas lado a lado (NRSF, eficiencia, yield on cost).
10. **Cuantificar**: takeoffs (superficies, conteo de unidades/cajones) y costo conceptual, incluyendo volúmenes de corte/relleno.
11. **Exportar/compartir**: PDF con datos vivos, .dxf, .skp, .glTF, .csv; integración con Revit y con TT Core Studio (estructura de estacionamiento).

### Estacionamiento en particular (Parking Solver)

- Genera superficie, estructurado (varios niveles) o ambos, a partir de la forma/tamaño de la parcela dibujada.
- Parámetros: ratio objetivo, tipos de cajón (ADA, EV, compacto, remolque, dimensiones custom), ancho de pasillos, ángulos, ubicación de accesos.
- Responde en tiempo real a cambios de huella construida y de setbacks (retiros); cada opción se guarda como "scheme" con su propio modelo financiero.
- Edición manual posible después de la generación automática.

## 4. Integraciones y formatos (fuente: ficha de directorio, sin verificación independiente)

- Integraciones citadas: Revit, AutoCAD, SketchUp, Zoneomics, ESRI, TT Core Studio (Thornton Tomasetti).
- Entradas: límite de predio, zonificación, mezcla de unidades; opcional topografía 3D, parking, costo, cronograma. Formatos: CSV, shapefiles, GeoJSON, archivos de dibujo.
- Salidas: distribución de edificio, conteo de cajones, NRSF, eficiencia, yield on cost, corte/relleno, variantes de mezcla.
- **No hay documentación pública de API.** El acceso programático, si existe, se gestiona directo con el proveedor.

## 5. Precios de referencia (vendor, sin verificar vigencia)

- Urban Planner (gratuito/bajo detalle, sin mezcla de unidades personalizada).
- Urban Planner+: ~100 USD/mes.
- Parking Solver: ~195 USD/mes (otra fuente cita 400 USD/mes para "Data Maps", no queda claro si es el mismo producto).
- Site Solver completo: ~10,000 USD/año.
- Enterprise: precio a medida.

Nota: dos fuentes de terceros dan cifras distintas para productos con nombres parecidos — no están reconciliadas, trátese como referencia aproximada, no como tarifa confirmada.

## 6. Limitaciones de esta investigación

- Todo lo descrito en la sección 3 viene de páginas de marketing del propio proveedor: no hay confirmación independiente de que el flujo real coincida exactamente con lo publicado.
- Sin acceso a demo/cuenta, no se pudo observar la interfaz, tiempos reales de respuesta, ni la calidad de las alternativas generadas.
- Métricas de adopción (6,600+ usuarios, etc.) y de rendimiento ("2-3x más iteraciones", "4-10x más rápido") son afirmaciones del proveedor sin metodología publicada.
- No se encontró evidencia de certificación SOC 2 / ISO 27001, ni política de retención de datos o de uso de datos de clientes para entrenar modelos.

## Fuentes

- [TESTFIT Site Solver](https://www.testfit.io/testfit)
- [TESTFIT Parking Solver](https://www.testfit.io/parking-solver)
- [TestFit — AEC Magazine, "TestFit runs free"](https://aecmag.com/concept-design/testfit-runs-free)
- [datadrivenaec.com — ficha de directorio TestFit](https://datadrivenaec.com/tools/testfit)
