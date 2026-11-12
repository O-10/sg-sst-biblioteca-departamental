/* ============================================================
   BIBLIOTECA DEPARTAMENTAL JORGE GARCÉS BORRERO
   Estándares Mínimos SG-SST - Decreto 1072 de 2015 (Cap. III)
   Tabla de valores y calificación - 60 ítems / 100 puntos
   ============================================================ */

window.SG_SST_DATA = (function () {
  'use strict';

  const CYCLES = [
    { id: 'Planear', name: 'I. Planear', weight: 25, color: '#0B86D9', icon: 'target' },
    { id: 'Hacer', name: 'II. Hacer', weight: 60, color: '#2F6B3A', icon: 'gear' },
    { id: 'Verificar', name: 'III. Verificar', weight: 5, color: '#B89A6A', icon: 'search' },
    { id: 'Actuar', name: 'IV. Actuar', weight: 10, color: '#1F3A5F', icon: 'cycle' }
  ];

  const CRITERIA = [
    { id: 'c1', code: '1', name: 'Recursos', weight: 10, cycle: 'Planear', color: '#0B86D9', soft: '#E7F4FD' },
    { id: 'c2', code: '2', name: 'Gestión integral del SG-SST', weight: 15, cycle: 'Planear', color: '#1F3A5F', soft: '#E9EEF5' },
    { id: 'c3', code: '3', name: 'Gestión de la salud', weight: 20, cycle: 'Hacer', color: '#2F6B3A', soft: '#EAF3EC' },
    { id: 'c4', code: '4', name: 'Gestión de peligros y riesgos', weight: 30, cycle: 'Hacer', color: '#B89A6A', soft: '#F7F1E5' },
    { id: 'c5', code: '5', name: 'Gestión de amenazas', weight: 10, cycle: 'Hacer', color: '#8C6D3F', soft: '#F5EDDD' },
    { id: 'c6', code: '6', name: 'Verificación del SG-SST', weight: 5, cycle: 'Verificar', color: '#4A4A4A', soft: '#EFEFEF' },
    { id: 'c7', code: '7', name: 'Mejoramiento', weight: 10, cycle: 'Actuar', color: '#244F2C', soft: '#E8F0E9' }
  ];

  const GROUPS = [
    { code: '1.1', name: 'Recursos financieros, técnicos, humanos y de otra índole', weight: 4, criterion: 'c1' },
    { code: '1.2', name: 'Capacitación en el Sistema de Gestión de la Seguridad y Salud en el Trabajo', weight: 6, criterion: 'c1' },
    { code: '2.1', name: 'Política de Seguridad y Salud en el Trabajo', weight: 1, criterion: 'c2' },
    { code: '2.2', name: 'Objetivos del Sistema de Gestión de la Seguridad y la Salud en el Trabajo', weight: 1, criterion: 'c2' },
    { code: '2.3', name: 'Evaluación inicial del SG-SST', weight: 1, criterion: 'c2' },
    { code: '2.4', name: 'Plan Anual de Trabajo', weight: 2, criterion: 'c2' },
    { code: '2.5', name: 'Conservación de la documentación', weight: 2, criterion: 'c2' },
    { code: '2.6', name: 'Rendición de cuentas', weight: 1, criterion: 'c2' },
    { code: '2.7', name: 'Normatividad nacional vigente y aplicable en materia de SST', weight: 2, criterion: 'c2' },
    { code: '2.8', name: 'Comunicación', weight: 1, criterion: 'c2' },
    { code: '2.9', name: 'Adquisiciones', weight: 1, criterion: 'c2' },
    { code: '2.10', name: 'Contratación', weight: 2, criterion: 'c2' },
    { code: '2.11', name: 'Gestión del cambio', weight: 1, criterion: 'c2' },
    { code: '3.1', name: 'Condiciones de salud en el trabajo', weight: 9, criterion: 'c3' },
    { code: '3.2', name: 'Registro, reporte e investigación de las enfermedades laborales, los incidentes y accidentes del trabajo', weight: 5, criterion: 'c3' },
    { code: '3.3', name: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores', weight: 6, criterion: 'c3' },
    { code: '4.1', name: 'Identificación de peligros, evaluación y valoración de riesgos', weight: 15, criterion: 'c4' },
    { code: '4.2', name: 'Medidas de prevención y control para intervenir los peligros/riesgos', weight: 15, criterion: 'c4' },
    { code: '5.1', name: 'Plan de prevención, preparación y respuesta ante emergencias', weight: 10, criterion: 'c5' },
    { code: '6.1', name: 'Gestión y resultados del SG-SST', weight: 5, criterion: 'c6' },
    { code: '7.1', name: 'Acciones preventivas y correctivas con base en los resultados del SG-SST', weight: 10, criterion: 'c7' }
  ];

  const STANDARDS = [
    /* ---------------- 1. RECURSOS (10%) ---------------- */
    {
      code: '1.1.1', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST',
      desc: 'Asignar una persona que diseñe e implemente el SG-SST. El diseño e implementación podrá ser realizado por profesionales en SST o profesionales con posgrado en SST, que cuenten con licencia vigente en SST y el curso virtual de cincuenta (50) horas.',
      verify: 'Solicitar el documento en el que consta la asignación, con la respectiva determinación de responsabilidades, y constatar la hoja de vida con soportes de la persona asignada.'
    },
    {
      code: '1.1.2', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Responsabilidades en el Sistema de Gestión de Seguridad y Salud en el Trabajo',
      desc: 'Asignar y documentar las responsabilidades específicas en el SG-SST a todos los niveles de la organización, para el desarrollo y mejora continua de dicho Sistema.',
      verify: 'Solicitar el soporte que contenga la asignación de las responsabilidades en SST.'
    },
    {
      code: '1.1.3', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Asignación de recursos para el Sistema de Gestión en Seguridad y Salud en el Trabajo',
      desc: 'Definir y asignar el talento humano, los recursos financieros, técnicos y tecnológicos requeridos para la implementación, mantenimiento y continuidad del SG-SST.',
      verify: 'Constatar la existencia de evidencias físicas que demuestren la definición y asignación del talento humano y los recursos, con base en el plan de trabajo anual.'
    },
    {
      code: '1.1.4', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Afiliación al Sistema General de Riesgos Laborales',
      desc: 'Garantizar que todos los trabajadores, independientemente de su forma de vinculación o contratación, están afiliados al Sistema de Seguridad Social en Salud, Pensión y Riesgos Laborales.',
      verify: 'Comparar la lista de trabajadores con las planillas de pago de aportes de los cuatro (4) meses anteriores. Muestreo: 10% entre 51 y 200 trabajadores; 30 trabajadores en empresas de más de 200.'
    },
    {
      code: '1.1.5', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Pago de pensión de trabajadores de alto riesgo',
      desc: 'En caso de que aplique, identificar a los trabajadores que se dediquen en forma permanente al ejercicio de actividades de alto riesgo (Decreto 2090 de 2003) y cotizar el monto establecido al Sistema de Pensiones.',
      verify: 'Verificar la identificación de los trabajadores de alto riesgo y el pago de la cotización especial señalada en la norma.'
    },
    {
      code: '1.1.6', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Conformación y funcionamiento del COPASST',
      desc: 'Conformar y garantizar el funcionamiento del Comité Paritario de Seguridad y Salud en el Trabajo, con igual número de representantes del empleador y de los trabajadores.',
      verify: 'Solicitar los soportes de convocatoria, elección, acta de constitución vigente y las actas de reunión mensuales del último año.'
    },
    {
      code: '1.1.7', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Capacitación de los integrantes del COPASST',
      desc: 'Capacitar a los integrantes del COPASST para el cumplimiento efectivo de las responsabilidades que les asigna la ley.',
      verify: 'Solicitar los documentos que evidencien las actividades de capacitación brindadas a los integrantes del COPASST.'
    },
    {
      code: '1.1.8', criterion: 'c1', group: '1.1', cycle: 'Planear', weight: 0.5,
      name: 'Conformación y funcionamiento del Comité de Convivencia Laboral',
      desc: 'Conformar y garantizar el funcionamiento del Comité de Convivencia Laboral, de acuerdo con la normatividad vigente.',
      verify: 'Solicitar el documento de conformación, las actas de reuniones (mínimo una cada tres meses) y los informes de gestión del Comité.'
    },
    {
      code: '1.2.1', criterion: 'c1', group: '1.2', cycle: 'Planear', weight: 2,
      name: 'Programa de capacitación anual en promoción y prevención',
      desc: 'Elaborar y ejecutar el programa de capacitación anual en promoción y prevención, que incluye los peligros/riesgos prioritarios y las medidas de prevención y control, extensivo a todos los niveles de la organización.',
      verify: 'Solicitar el programa de capacitación anual y la matriz de identificación de peligros, y verificar los documentos que evidencien el cumplimiento del programa.'
    },
    {
      code: '1.2.2', criterion: 'c1', group: '1.2', cycle: 'Planear', weight: 2,
      name: 'Capacitación, inducción y reinducción en SST',
      desc: 'Realizar actividades de inducción y reinducción incluidas en el programa de capacitación, dirigidas a todos los trabajadores, previas al inicio de labores, sobre peligros, riesgos y medidas de prevención y control.',
      verify: 'Solicitar las listas de participantes y los soportes documentales de las inducciones y reinducciones. Muestreo: 10% entre 51 y 200 trabajadores; 30 trabajadores en empresas de más de 200.'
    },
    {
      code: '1.2.3', criterion: 'c1', group: '1.2', cycle: 'Planear', weight: 2,
      name: 'Responsables del SG-SST con curso virtual de cincuenta (50) horas',
      desc: 'El responsable del Sistema de Gestión de SST debe realizar y aprobar el curso de capacitación virtual de cincuenta (50) horas en SST definido por el Ministerio del Trabajo.',
      verify: 'Solicitar el certificado de aprobación del curso virtual de 50 horas en SST expedido a nombre del responsable del SG-SST.'
    },

    /* ---------------- 2. GESTIÓN INTEGRAL (15%) ---------------- */
    {
      code: '2.1.1', criterion: 'c2', group: '2.1', cycle: 'Planear', weight: 1,
      name: 'Política del Sistema de Gestión de Seguridad y Salud en el Trabajo',
      desc: 'Establecer por escrito la Política de SST, fechada y firmada por el representante legal, comunicada al COPASST, con alcance sobre todos los centros de trabajo y trabajadores, revisada como mínimo una vez al año y difundida y accesible para todos los niveles.',
      verify: 'Solicitar la política del SG-SST y confirmar que cumpla con los aspectos del criterio; validar fecha de emisión, firma del representante legal, requisitos normativos y divulgación.'
    },
    {
      code: '2.2.1', criterion: 'c2', group: '2.2', cycle: 'Planear', weight: 1,
      name: 'Objetivos definidos, claros, medibles, cuantificables y con metas',
      desc: 'Definir los objetivos del SG-SST coherentes con la política y el plan de trabajo anual, documentados, comunicados a los trabajadores, revisados y evaluados mínimo una vez al año, en documento firmado por el empleador.',
      verify: 'Revisar si los objetivos están definidos y cumplen las condiciones del criterio, y si existen evidencias del proceso de difusión.'
    },
    {
      code: '2.3.1', criterion: 'c2', group: '2.3', cycle: 'Planear', weight: 1,
      name: 'Evaluación e identificación de prioridades del SG-SST',
      desc: 'Realizar la evaluación inicial del SG-SST identificando las prioridades para establecer el plan de trabajo anual o para actualizar el existente, por el responsable del SG-SST o personal externo con licencia en SST.',
      verify: 'Solicitar la evaluación inicial del SG-SST mediante matriz legal, matriz de peligros y riesgos, verificación de controles, listas de asistencia, análisis de puestos de trabajo, exámenes médicos y seguimiento de indicadores.'
    },
    {
      code: '2.4.1', criterion: 'c2', group: '2.4', cycle: 'Planear', weight: 2,
      name: 'Plan Anual de Trabajo con objetivos, metas, responsabilidades, recursos y cronograma',
      desc: 'Diseñar y definir un plan anual de trabajo para el cumplimiento del SG-SST que identifique objetivos, metas, responsabilidades, recursos y cronograma de actividades, firmado por el empleador y el responsable del SG-SST.',
      verify: 'Solicitar el plan de trabajo anual, verificar su cumplimiento y, en caso de incumplimientos, solicitar los planes de mejora respectivos.'
    },
    {
      code: '2.5.1', criterion: 'c2', group: '2.5', cycle: 'Planear', weight: 2,
      name: 'Archivo y retención documental del Sistema de Gestión de SST',
      desc: 'Contar con un sistema de archivo y retención documental para los registros y documentos que soportan el SG-SST.',
      verify: 'Constatar la existencia del sistema y verificar mediante muestreo que los registros sean legibles, fácilmente identificables, accesibles y protegidos contra daño y pérdida.'
    },
    {
      code: '2.6.1', criterion: 'c2', group: '2.6', cycle: 'Planear', weight: 1,
      name: 'Rendición de cuentas sobre el desempeño del SG-SST',
      desc: 'Realizar anualmente la rendición de cuentas del desarrollo del SG-SST, que incluya a todos los niveles de la empresa.',
      verify: 'Solicitar los registros documentales que evidencien la rendición de cuentas anual y los mecanismos definidos por la empresa.'
    },
    {
      code: '2.7.1', criterion: 'c2', group: '2.7', cycle: 'Planear', weight: 2,
      name: 'Matriz legal de normatividad nacional vigente y aplicable en SST',
      desc: 'Definir la matriz legal que contemple las normas actualizadas del Sistema General de Riesgos Laborales aplicables a la empresa.',
      verify: 'Solicitar la matriz legal y verificar que contenga normas vigentes en riesgos laborales, normas técnicas según los peligros identificados y normas de otras entidades aplicables.'
    },
    {
      code: '2.8.1', criterion: 'c2', group: '2.8', cycle: 'Planear', weight: 1,
      name: 'Mecanismos de comunicación y autorreporte en el SG-SST',
      desc: 'Disponer de mecanismos eficaces para recibir y responder las comunicaciones internas y externas relativas a la SST, incluido el autorreporte de condiciones de trabajo y de salud por parte de trabajadores o contratistas.',
      verify: 'Constatar la existencia y eficacia de los mecanismos de comunicación interna y externa en materia de SST.'
    },
    {
      code: '2.9.1', criterion: 'c2', group: '2.9', cycle: 'Planear', weight: 1,
      name: 'Identificación y evaluación para la adquisición de bienes y servicios',
      desc: 'Establecer un procedimiento para la identificación y evaluación de las especificaciones en SST de las compras y adquisición de productos y servicios.',
      verify: 'Verificar la existencia de un procedimiento para la identificación y evaluación de especificaciones en SST y constatar su cumplimiento.'
    },
    {
      code: '2.10.1', criterion: 'c2', group: '2.10', cycle: 'Planear', weight: 2,
      name: 'Evaluación y selección de proveedores y contratistas',
      desc: 'Establecer los aspectos de SST que podrá tener en cuenta la empresa en la evaluación y selección de proveedores y contratistas.',
      verify: 'Solicitar el documento que señale los criterios relacionados con SST para la evaluación y selección de proveedores y contratistas.'
    },
    {
      code: '2.11.1', criterion: 'c2', group: '2.11', cycle: 'Planear', weight: 1,
      name: 'Evaluación del impacto de cambios internos y externos en el SG-SST',
      desc: 'Disponer de un procedimiento para evaluar el impacto sobre la SST que se pueda generar por cambios internos o externos.',
      verify: 'Solicitar el documento que contenga el procedimiento de gestión del cambio.'
    },

    /* ---------------- 3. GESTIÓN DE LA SALUD (20%) ---------------- */
    {
      code: '3.1.1', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Descripción sociodemográfica y diagnóstico de condiciones de salud',
      desc: 'Recolectar información actualizada de todos los trabajadores del último año: descripción sociodemográfica (edad, sexo, escolaridad, estado civil) y diagnóstico de condiciones de salud, evaluación y análisis de estadísticas de salud laboral y común.',
      verify: 'Solicitar el documento consolidado con la información sociodemográfica y el diagnóstico de condiciones de salud.'
    },
    {
      code: '3.1.2', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Actividades de promoción y prevención en salud',
      desc: 'Desarrollar actividades de medicina del trabajo, prevención y promoción de la salud y programas de vigilancia epidemiológica requeridos, según las prioridades del diagnóstico de condiciones de salud y los peligros/riesgos prioritarios.',
      verify: 'Solicitar evidencias de la definición y ejecución de las actividades de medicina del trabajo, promoción y prevención y de los programas de vigilancia epidemiológica.'
    },
    {
      code: '3.1.3', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Información al médico de los perfiles de cargo',
      desc: 'Informar al médico que realiza las evaluaciones ocupacionales los perfiles de cargos, con descripción de las tareas y el medio en el cual se desarrollará la labor.',
      verify: 'Verificar que se remitieron al médico los soportes documentales de perfiles de cargo, descripción de tareas y medio de trabajo.'
    },
    {
      code: '3.1.4', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Realización de exámenes médicos ocupacionales: preingreso y periódicos',
      desc: 'Realizar las evaluaciones médicas ocupacionales de acuerdo con la normatividad y los peligros/riesgos a los cuales se encuentre expuesto el trabajador, definiendo la frecuencia de las evaluaciones periódicas y comunicando por escrito los resultados.',
      verify: 'Solicitar los conceptos de aptitud, el documento que evidencie la definición de frecuencia y la comunicación escrita de resultados al trabajador.'
    },
    {
      code: '3.1.5', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Custodia de las historias clínicas',
      desc: 'Tener la custodia de las historias clínicas a cargo de una institución prestadora de servicios en SST o del médico que practica las evaluaciones médicas ocupacionales.',
      verify: 'Evidenciar los soportes que demuestren que la custodia de las historias clínicas está a cargo de una IPS en SST o del médico evaluador.'
    },
    {
      code: '3.1.6', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Restricciones y recomendaciones médico-laborales',
      desc: 'Cumplir las restricciones y recomendaciones médico-laborales de EPS o ARL, adecuar el puesto de trabajo, reubicar o readaptar al trabajador cuando se requiera y entregar los documentos de competencia del empleador para calificación de origen y pérdida de capacidad laboral.',
      verify: 'Solicitar recomendaciones y restricciones, evidencias de cumplimiento y soportes de recibido de quienes califican en primera oportunidad o las Juntas de Calificación de Invalidez.'
    },
    {
      code: '3.1.7', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Estilos de vida y entornos saludables',
      desc: 'Elaborar y ejecutar un programa para promover entre los trabajadores estilos de vida y entornos de trabajo saludables, incluyendo campañas de prevención y control de farmacodependencia, alcoholismo y tabaquismo, entre otros.',
      verify: 'Solicitar el programa respectivo y los documentos y registros que evidencien su cumplimiento.'
    },
    {
      code: '3.1.8', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Agua potable, servicios sanitarios y disposición de basuras',
      desc: 'Contar con un suministro permanente de agua potable, servicios sanitarios y mecanismos para disponer excretas y basuras.',
      verify: 'Verificar mediante observación directa, dejando soporte fílmico o fotográfico.'
    },
    {
      code: '3.1.9', criterion: 'c3', group: '3.1', cycle: 'Hacer', weight: 1,
      name: 'Eliminación adecuada de residuos sólidos, líquidos o gaseosos',
      desc: 'Eliminar los residuos sólidos, líquidos o gaseosos que se producen, así como los residuos peligrosos, de forma que no se ponga en riesgo a los trabajadores.',
      verify: 'Constatar mediante observación directa las evidencias del proceso de eliminación y solicitar el contrato de la empresa gestora de residuos peligrosos cuando se requiera.'
    },
    {
      code: '3.2.1', criterion: 'c3', group: '3.2', cycle: 'Hacer', weight: 2,
      name: 'Reporte de accidentes de trabajo y enfermedades laborales',
      desc: 'Reportar a la ARL y a la EPS todos los accidentes y enfermedades laborales diagnosticadas. Reportar a la Dirección Territorial del Ministerio del Trabajo los accidentes graves y mortales y las enfermedades laborales dentro de los dos (2) días hábiles siguientes.',
      verify: 'Realizar muestreo del FURAT y FUREL y verificar si el reporte a ARL, EPS y Dirección Territorial se hizo dentro del término legal.'
    },
    {
      code: '3.2.2', criterion: 'c3', group: '3.2', cycle: 'Hacer', weight: 2,
      name: 'Investigación de accidentes, incidentes y enfermedad laboral',
      desc: 'Investigar los incidentes, todos los accidentes de trabajo y las enfermedades diagnosticadas como laborales con participación del COPASST, determinando causas básicas e inmediatas y previniendo nuevos casos.',
      verify: 'Verificar investigaciones dentro de los quince (15) días siguientes, participación del COPASST, acciones para expuestos y remisión de informes en casos graves o mortales.'
    },
    {
      code: '3.2.3', criterion: 'c3', group: '3.2', cycle: 'Hacer', weight: 1,
      name: 'Registro y análisis estadístico de accidentes y enfermedades laborales',
      desc: 'Llevar registro estadístico de los accidentes de trabajo y de las enfermedades laborales, analizarlo y usar las conclusiones para el mejoramiento del SG-SST.',
      verify: 'Solicitar el registro actualizado del año corrido y del año inmediatamente anterior, junto con la evidencia del análisis y conclusiones.'
    },
    {
      code: '3.3.1', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición de la frecuencia de la accidentalidad',
      desc: 'Medir la frecuencia de los accidentes como mínimo una vez al mes y clasificar el origen del peligro/riesgo que los generó (físicos, químicos, biológicos, de seguridad, públicos, psicosociales, entre otros).',
      verify: 'Solicitar los resultados de la medición del año corrido y/o del año anterior y constatar el comportamiento de la frecuencia y su relación con los peligros identificados.'
    },
    {
      code: '3.3.2', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición de la severidad de la accidentalidad',
      desc: 'Medir la severidad de los accidentes de trabajo como mínimo una vez al mes y clasificar el origen del peligro/riesgo que los generó.',
      verify: 'Solicitar los resultados de la medición del año corrido y/o anterior y constatar el comportamiento de la severidad y su relación con los peligros identificados.'
    },
    {
      code: '3.3.3', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición de la mortalidad por accidente de trabajo',
      desc: 'Medir la mortalidad por accidentes como mínimo una vez al año y clasificar el origen del peligro/riesgo que la generó.',
      verify: 'Solicitar los resultados de la medición del año corrido y/o anterior y constatar el comportamiento de la mortalidad y su relación con los peligros identificados.'
    },
    {
      code: '3.3.4', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición de la prevalencia de la enfermedad laboral',
      desc: 'Medir la prevalencia de la enfermedad laboral como mínimo una vez al año y clasificar el origen del peligro/riesgo que la generó.',
      verify: 'Solicitar los resultados de la medición del año corrido y/o anterior y constatar el comportamiento de la prevalencia y su relación con los peligros identificados.'
    },
    {
      code: '3.3.5', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición de la incidencia de la enfermedad laboral',
      desc: 'Medir la incidencia de la enfermedad laboral como mínimo una vez al año y clasificar el origen del peligro/riesgo que la generó.',
      verify: 'Solicitar los resultados de la medición del año corrido y/o anterior y constatar el comportamiento de la incidencia y su relación con los peligros identificados.'
    },
    {
      code: '3.3.6', criterion: 'c3', group: '3.3', cycle: 'Hacer', weight: 1,
      name: 'Medición del ausentismo por causa médica',
      desc: 'Medir el ausentismo por incapacidad de origen laboral y común, como mínimo una vez al mes, y clasificar el origen del peligro/riesgo que lo generó.',
      verify: 'Solicitar los resultados de la medición del año corrido y/o anterior y constatar el comportamiento del ausentismo y su relación con los peligros identificados.'
    },

    /* ---------------- 4. GESTIÓN DE PELIGROS Y RIESGOS (30%) ---------------- */
    {
      code: '4.1.1', criterion: 'c4', group: '4.1', cycle: 'Hacer', weight: 4,
      name: 'Metodología para la identificación de peligros, evaluación y valoración de riesgos',
      desc: 'Definir y aplicar una metodología para la identificación de peligros y evaluación y valoración de los riesgos de origen físico, ergonómico o biomecánico, biológico, químico, de seguridad, público, psicosocial, entre otros, con alcance sobre todos los procesos, actividades rutinarias y no rutinarias, maquinaria, equipos y centros de trabajo.',
      verify: 'Solicitar el documento de la metodología y verificar su aplicación con participación de los trabajadores, seleccionando actividades al azar y confrontando mediante observación directa.'
    },
    {
      code: '4.1.2', criterion: 'c4', group: '4.1', cycle: 'Hacer', weight: 4,
      name: 'Identificación de peligros con participación de todos los niveles de la empresa',
      desc: 'Realizar la identificación de peligros y evaluación y valoración de los riesgos con participación de los trabajadores de todos los niveles, actualizándola como mínimo una vez al año y ante accidentes mortales, eventos catastróficos o cambios en procesos, instalaciones, maquinaria o equipos.',
      verify: 'Solicitar evidencias de participación y periodicidad; verificar eventos mortales o catastróficos y la implementación inmediata de acciones frente a riesgos no tolerables.'
    },
    {
      code: '4.1.3', criterion: 'c4', group: '4.1', cycle: 'Hacer', weight: 3,
      name: 'Identificación de sustancias catalogadas como carcinógenas o con toxicidad aguda',
      desc: 'En las empresas donde se procese, manipule o trabaje con sustancias o agentes carcinógenos (IARC grupo 1) o con toxicidad aguda (SGA categorías I y II), priorizar los riesgos asociados y realizar acciones de prevención e intervención.',
      verify: 'Revisar materias primas, insumos, productos y desechos; verificar la priorización y las acciones, así como las áreas destinadas para el almacenamiento de estas sustancias.'
    },
    {
      code: '4.1.4', criterion: 'c4', group: '4.1', cycle: 'Hacer', weight: 4,
      name: 'Realización de mediciones ambientales, químicas, físicas y biológicas',
      desc: 'Realizar mediciones ambientales de los riesgos prioritarios provenientes de peligros químicos, físicos y/o biológicos.',
      verify: 'Verificar los soportes documentales de las mediciones ambientales realizadas y la remisión de los resultados al COPASST.'
    },
    {
      code: '4.2.1', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Implementación de medidas de prevención y control de peligros/riesgos identificados',
      desc: 'Ejecutar las medidas de prevención y control con base en la identificación de peligros y la valoración de riesgos, aplicando la jerarquización y priorizando la intervención en la fuente y en el medio cuando sea factible.',
      verify: 'Solicitar evidencias de ejecución, verificar su programación en el plan anual y la priorización de los peligros/riesgos identificados como prioritarios.'
    },
    {
      code: '4.2.2', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Verificación de aplicación de medidas de prevención y control por parte de los trabajadores',
      desc: 'Verificar la aplicación por parte de los trabajadores de las medidas de prevención y control de los peligros/riesgos.',
      verify: 'Solicitar los soportes documentales implementados por la empresa y realizar visita a las instalaciones para verificar el cumplimiento.'
    },
    {
      code: '4.2.3', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Elaboración de procedimientos, instructivos, fichas y protocolos de SST',
      desc: 'Elaborar procedimientos, instructivos y fichas técnicas de seguridad y salud en el trabajo cuando se requiera y entregarlos a los trabajadores.',
      verify: 'Solicitar los procedimientos, instructivos, fichas técnicas y protocolos de SST y el soporte de entrega de los mismos a los trabajadores.'
    },
    {
      code: '4.2.4', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Realización de inspecciones sistemáticas con participación del COPASST',
      desc: 'Elaborar formatos de registro y realizar visitas de inspección sistemática a instalaciones, maquinaria o equipos, incluidos los relacionados con la prevención y atención de emergencias, con la participación del COPASST.',
      verify: 'Solicitar los formatos de registro y las evidencias de las visitas de inspección realizadas, verificando la participación del COPASST.'
    },
    {
      code: '4.2.5', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Mantenimiento periódico de instalaciones, equipos, máquinas y herramientas',
      desc: 'Realizar el mantenimiento periódico de instalaciones, equipos, máquinas y herramientas, de acuerdo con los informes de visitas de inspección o reportes de condiciones inseguras y los manuales y fichas técnicas.',
      verify: 'Solicitar la evidencia del mantenimiento preventivo y/o correctivo de instalaciones, equipos, máquinas y herramientas.'
    },
    {
      code: '4.2.6', criterion: 'c4', group: '4.2', cycle: 'Hacer', weight: 2.5,
      name: 'Entrega de Elementos de Protección Personal (EPP) y capacitación en uso adecuado',
      desc: 'Suministrar a los trabajadores los EPP que se requieran y reponerlos oportunamente, verificar que contratistas y subcontratistas entreguen los EPP y realizar capacitación para su uso adecuado.',
      verify: 'Solicitar soportes de entrega y reposición de EPP, verificar el cumplimiento por parte de contratistas y subcontratistas y la capacitación en uso.'
    },

    /* ---------------- 5. GESTIÓN DE AMENAZAS (10%) ---------------- */
    {
      code: '5.1.1', criterion: 'c5', group: '5.1', cycle: 'Hacer', weight: 5,
      name: 'Plan de prevención, preparación y respuesta ante emergencias',
      desc: 'Elaborar un plan de prevención, preparación y respuesta ante emergencias que identifique amenazas, evalúe y analice la vulnerabilidad. Debe incluir planos de las instalaciones con áreas y salidas de emergencia, señalización y realización de simulacros como mínimo una vez al año, teniendo en cuenta todas las jornadas y centros de trabajo, y ser divulgado.',
      verify: 'Solicitar el plan y evidencias de divulgación, planos y señalización, realización de simulacros y análisis de resultados y recomendaciones incorporadas.'
    },
    {
      code: '5.1.2', criterion: 'c5', group: '5.1', cycle: 'Hacer', weight: 5,
      name: 'Brigada de prevención, preparación y respuesta ante emergencias conformada, capacitada y dotada',
      desc: 'Conformar, capacitar y dotar la brigada de prevención, preparación y respuesta ante emergencias (primeros auxilios, contra incendios, evacuación, etc.), según las necesidades y el tamaño de la empresa.',
      verify: 'Solicitar el documento de conformación de la brigada y verificar los soportes de capacitación y entrega de la dotación.'
    },

    /* ---------------- 6. VERIFICACIÓN (5%) ---------------- */
    {
      code: '6.1.1', criterion: 'c6', group: '6.1', cycle: 'Verificar', weight: 1.25,
      name: 'Definición de indicadores del SG-SST de acuerdo con las condiciones de la empresa',
      desc: 'Definir indicadores que permitan evaluar el SG-SST de acuerdo con las condiciones de la empresa, teniendo en cuenta los indicadores mínimos señalados en el Capítulo IV de la Resolución 0312 de 2019, y tener disponibles los resultados de la evaluación.',
      verify: 'Solicitar los indicadores definidos por la empresa y el informe con los resultados de la evaluación del SG-SST.'
    },
    {
      code: '6.1.2', criterion: 'c6', group: '6.1', cycle: 'Verificar', weight: 1.25,
      name: 'Auditoría anual del Sistema de Gestión de SST',
      desc: 'Realizar una auditoría anual, planificada con la participación del COPASST, con alcance a todas las áreas de la empresa, definiendo la idoneidad del auditor, el alcance, la periodicidad, la metodología y la presentación de informes.',
      verify: 'Verificar los soportes de las auditorías internas realizadas por lo menos una vez al año y el programa de auditoría con participación del COPASST.'
    },
    {
      code: '6.1.3', criterion: 'c6', group: '6.1', cycle: 'Verificar', weight: 1.25,
      name: 'Revisión anual por la alta dirección, resultados y alcance de la auditoría',
      desc: 'Revisar como mínimo una vez al año, por parte de la alta dirección, el SG-SST, sus resultados y el alcance de la auditoría de cumplimiento, de acuerdo con los aspectos del artículo 2.2.4.6.30 del Decreto 1072 de 2015.',
      verify: 'Solicitar los soportes de la revisión por la alta dirección y verificar el cumplimiento de los aspectos señalados en el artículo 2.2.4.6.30 del Decreto 1072 de 2015.'
    },
    {
      code: '6.1.4', criterion: 'c6', group: '6.1', cycle: 'Verificar', weight: 1.25,
      name: 'Planificación de la auditoría con el COPASST y comunicación de resultados',
      desc: 'Planificar la auditoría con el COPASST y comunicar los resultados de la revisión anual por la alta dirección al COPASST y al responsable del SG-SST.',
      verify: 'Solicitar el documento donde conste la revisión anual por la alta dirección y la comunicación de los resultados al COPASST y al responsable del SG-SST.'
    },

    /* ---------------- 7. MEJORAMIENTO (10%) ---------------- */
    {
      code: '7.1.1', criterion: 'c7', group: '7.1', cycle: 'Actuar', weight: 2.5,
      name: 'Definición de acciones preventivas y correctivas con base en los resultados del SG-SST',
      desc: 'Definir e implementar las acciones preventivas y/o correctivas necesarias con base en los resultados de la supervisión, inspecciones, medición de los indicadores del SG-SST y las recomendaciones del COPASST.',
      verify: 'Solicitar la evidencia documental de la implementación de las acciones preventivas y/o correctivas.'
    },
    {
      code: '7.1.2', criterion: 'c7', group: '7.1', cycle: 'Actuar', weight: 2.5,
      name: 'Acciones de mejora conforme a la revisión de la alta dirección',
      desc: 'Cuando la revisión por la alta dirección evidencie que las medidas de prevención y control son inadecuadas o pueden dejar de ser eficaces, la empresa toma las medidas correctivas, preventivas y/o de mejora para subsanar lo detectado.',
      verify: 'Solicitar la evidencia documental de las acciones correctivas, preventivas y/o de mejora implementadas según lo detectado en la revisión por la alta dirección.'
    },
    {
      code: '7.1.3', criterion: 'c7', group: '7.1', cycle: 'Actuar', weight: 2.5,
      name: 'Acciones de mejora con base en investigaciones de accidentes y enfermedades laborales',
      desc: 'Definir e implementar las acciones preventivas y/o correctivas necesarias con base en los resultados de las investigaciones de accidentes de trabajo y la determinación de causas básicas e inmediatas, así como de las enfermedades laborales.',
      verify: 'Solicitar la evidencia documental de las acciones de mejora planteadas conforme a las investigaciones y verificar su efectividad.'
    },
    {
      code: '7.1.4', criterion: 'c7', group: '7.1', cycle: 'Actuar', weight: 2.5,
      name: 'Elaboración del Plan de Mejoramiento e implementación de medidas correctivas',
      desc: 'Implementar las medidas y acciones correctivas producto de requerimientos o recomendaciones de autoridades administrativas y de las administradoras de riesgos laborales.',
      verify: 'Solicitar las evidencias de las acciones correctivas realizadas en respuesta a los requerimientos o recomendaciones de autoridades administrativas y ARL.'
    }
  ];

  const TOTAL_WEIGHT = STANDARDS.reduce(function (sum, item) { return sum + item.weight; }, 0);

  return {
    CYCLES: CYCLES,
    CRITERIA: CRITERIA,
    GROUPS: GROUPS,
    STANDARDS: STANDARDS,
    TOTAL_WEIGHT: TOTAL_WEIGHT
  };
})();
