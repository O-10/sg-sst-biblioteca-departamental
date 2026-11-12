# SG-SST · Biblioteca Departamental Jorge Garcés Borrero

Aplicación web de autoevaluación de los **60 Estándares Mínimos del SG-SST** (Decreto 1072 de 2015, Capítulo III, y tabla de puntuación de la Resolución 0312 de 2019, artículos 16 y 27).

Es una **página única** en HTML, CSS y JavaScript puro, sin compilación ni dependencias locales. La interfaz sigue el estilo y la estructura de la referencia institucional: encabezado, tarjetas de indicadores, ciclo PHVA, panel de categorías, panel de análisis, pestañas y lista agrupada de estándares.

## Cómo abrirla

Debido a que la aplicación guarda evidencias en **IndexedDB**, debe servirse por HTTP (no abrir `index.html` con doble clic).

Desde la carpeta del proyecto:

```powershell
cd biblioteca_sg_sst
python -m http.server 8080
```

Luego abra `http://localhost:8080`.

Alternativas sin Python:

```powershell
npx serve .
# o
npx http-server .
```

## Estructura de la página

1. **Encabezado** con el nombre de la institución y el estado de guardado.
2. **Banner de estado**: listo para comenzar, evaluación incompleta (provisional) o completa.
3. **Tres indicadores principales** con apariencia 3D:
   - Calificación total con medidor tipo velocímetro.
   - Estado de los estándares con dona y leyenda por estado.
   - Soportes documentales con barra de avance.
4. **Cuatro tarjetas del ciclo PHVA** (Planear, Hacer, Verificar, Actuar) con puntaje, barra y pendientes.
5. **Panel de categorías** con el avance de las 11 agrupaciones.
6. **Panel de análisis e interpretación** con hallazgos, meta del 85 %, brechas y alertas de soportes.
7. **Pestañas por ciclo** con contador de pendientes y lista agrupada de los 60 estándares.
8. **Barra de herramientas**: ZIP de soportes, siguiente pendiente, imprimir/PDF y reiniciar.
9. **Buscador y filtro por estado** sobre la lista de estándares.

## Funcionalidades

- **Autoevaluación de los 60 estándares**: estado por estándar (Pendiente, Cumple, Parcial, No cumple, No aplica), peso y criterio de verificación visibles.
- **Soportes documentales por estándar**: carga de **varios archivos** por selector o arrastrando sobre la fila; cada archivo queda vinculado a su estándar.
- **Vista previa en la plataforma**: PDF, imágenes y archivos de texto se abren en un modal sin salir de la aplicación.
- **Descarga y eliminación** de cada soporte, con confirmación antes de borrar.
- **Observaciones** por estándar para registrar hallazgos, responsables o acciones de mejora.
- **Justificación obligatoria** cuando un estándar se marca como *No aplica*; sin justificación no se excluye del cálculo.
- **Búsqueda** por código, nombre, descripción, criterio, categoría u observación; **filtro** por estado, pendientes y con soporte.
- **Siguiente pendiente**: salta al primer estándar sin evaluar, limpia filtros y resalta la fila.
- **Reiniciar**: borra estados, observaciones, justificaciones y todos los archivos, conservando los datos de la institución.

## Reglas de puntuación

| Estado | Valor |
| --- | --- |
| Cumple | 100 % del peso |
| Parcial | 50 % del peso |
| No cumple | 0 % |
| No aplica | Se excluye del denominador (requiere justificación) |
| Pendiente | 0 % (cuenta en el denominador) |

El porcentaje general es la suma ponderada obtenida dividida entre el peso de los estándares **aplicables** evaluados. Mientras existan pendientes, la calificación se muestra como **provisional**.

Escala de valoración:

- **< 60 %**: Crítico
- **60 % – 85 %**: Moderadamente aceptable
- **> 85 %**: Aceptable
- **Sin estándares evaluados**: Sin evaluar
- **Todos los estándares evaluados como No aplica**: No aplica

## Almacenamiento

- Evaluación, observaciones, justificaciones y ficha: `localStorage` (`sg_sst_biblioteca_assessment_v1`).
- Archivos de soporte: IndexedDB (`sg_sst_biblioteca_evidence`, almacén `files`). Si IndexedDB no está disponible, se usa un respaldo en memoria durante la sesión.

Todo se guarda **solo en el navegador del usuario**. No hay servidor ni base de datos central; los soportes no se envían a ninguna parte.

## Exportaciones

- **CSV**: resumen, detalle de los 60 estándares, resumen por ciclo y categoría, y análisis. Separador `;` con BOM UTF-8 para Excel en español.
- **Excel (.xlsx)**: tres hojas — *Resumen*, *Estándares* y *Evidencias* — generadas con SheetJS desde CDN.
- **PDF**: informe con encabezado institucional, resúmenes, análisis y detalle de estándares, generado con jsPDF + AutoTable.
- **Imprimir / PDF del navegador**: vista imprimible en carta horizontal con las mismas secciones.
- **ZIP de soportes**: descarga todos los archivos adjuntos organizados en carpetas por código de estándar (`soportes/2.1.1/...`), con JSZip.

Si las librerías de CDN no están disponibles, la aplicación avisa y recurre al CSV o a la vista imprimible.

## Estructura del proyecto

```
biblioteca_sg_sst/
├── index.html
├── README.md
├── css/
│   └── styles.css
└── js/
    ├── data.js   # 60 estándares, criterios, ciclos y pesos
    └── app.js    # estado, cálculo, evidencias y exportación
```

## Nota normativa

Los pesos y la agrupación corresponden a la tabla de estándares mínimos aplicable a entidades con **más de 50 trabajadores (riesgos I–V)** de la Resolución 0312 de 2019. El alcance usado en el análisis es de **138 personas (58 directas + 80 contratistas)**, por lo que aplican los 60 estándares sin exclusiones. Verifique siempre la vigencia y aplicabilidad con su ARL y su asesor SG-SST.
