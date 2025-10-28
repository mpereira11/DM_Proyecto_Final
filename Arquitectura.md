PFinance – Personal Finance & Investment Assistant

Objetivo general
El objetivo principal de PFinance es desarrollar una aplicación móvil que ayude a las personas a organizar sus finanzas personales, mejorar sus hábitos financieros y tomar decisiones más informadas sobre inversión. La aplicación ofrecerá 
un asistente de inteligencia artificial que analiza los gastos, ingresos, activos financieros y noticias económicas, con el fin de generar recomendaciones personalizadas sobre ahorro, planificación financiera y oportunidades de inversión, 
de acuerdo con el perfil de cada usuario.

Arquitectura general del sistema

PFinance está basada en una arquitectura cliente-servidor híbrida, que combina diferentes tecnologías para garantizar rendimiento, escalabilidad y facilidad de uso.

Frontend:
La aplicación móvil se desarrollará en React Native con Expo. Este componente será responsable de la interfaz gráfica, la interacción del usuario y la visualización de datos financieros. Desde el frontend, los usuarios podrán registrar 
ingresos y gastos, visualizar su balance financiero, explorar activos de inversión, acceder a noticias y comunicarse con el asistente inteligente.

Backend:
El backend estará implementado sobre **Supabase**, una plataforma que ofrece un conjunto de servicios de backend modernos compatibles con PostgreSQL. Supabase gestionará la autenticación de usuarios, la base de datos relacional, el almacenamiento 
de archivos y la ejecución de funciones del lado del servidor (Edge Functions).

Los principales servicios utilizados serán:

- Supabase Auth: para el registro e inicio de sesión mediante correo electrónico o autenticación social (por ejemplo, Google).
- Supabase Database (PostgreSQL): para el almacenamiento estructurado de ingresos, gastos, configuraciones de usuario, historial de activos y preferencias financieras.
- Supabase Storage: para el almacenamiento de documentos o materiales multimedia, como tutoriales o imágenes de perfil.
- Supabase Edge Functions: para la ejecución de lógica del servidor, como la comunicación con APIs financieras externas y el procesamiento de datos del asistente de inteligencia artificial.

Servicios externos:
PFinance se integrará con diferentes APIs que proporcionarán información financiera en tiempo real, tales como Alpha Vantage, Yahoo Finance y NewsAPI. También se incluirá un modelo de inteligencia artificial (OpenAI o Hugging Face) para el chatbot 
financiero. Estas integraciones permitirán ofrecer datos actualizados sobre el mercado de valores, divisas, criptomonedas, commodities y noticias relevantes para la toma de decisiones.

Componentes principales

1. Autenticación de usuario: Sistema de registro e inicio de sesión con Supabase Auth, con soporte para correo electrónico y autenticación social. El usuario podrá definir su perfil financiero (conservador, moderado o arriesgado).

2. Dashboard financiero: Muestra el balance general del usuario, con gráficos de gastos e ingresos, metas de ahorro, y un resumen de activos y noticias relevantes.

3. Gestor de finanzas personales: Permite registrar ingresos y gastos organizados por categorías (alimentación, transporte, ocio, etc.), generando reportes visuales con librerías como react-native-chart-kit. El sistema analiza los patrones de gasto y
   ofrece recomendaciones para mejorar la salud financiera.

4. Asistente de inversión (chatbot con IA): Analiza hábitos financieros y perfil de riesgo del usuario para sugerir inversiones adecuadas en bienes raíces, CDT, fondos o activos financieros. También interpreta noticias y tendencias para identificar 
   posibles momentos favorables de inversión. El chatbot responde preguntas sobre ahorro, inversión o planificación financiera.

5. Explorador de activos: Muestra información de acciones, divisas, criptomonedas, oro, petróleo y otros activos. Incluye gráficos en tiempo real y alertas personalizadas sobre cambios significativos.

6. Noticias y análisis de mercado: Integra APIs de noticias financieras para mostrar información actualizada sobre el entorno económico global. La inteligencia artificial resume titulares y evalúa su impacto potencial en los mercados.

7. Mini cursos educativos: Incluye tutoriales breves sobre conceptos de inversión y finanzas personales, alojados en Supabase Storage o integrados mediante YouTube API.

8. Notificaciones inteligentes: Implementación de recordatorios y alertas locales en la aplicación, junto con la posibilidad de utilizar un servicio externo (como Expo Notifications) para notificaciones push, relacionadas con ahorro, gastos y 
  movimientos en el mercado.

Flujo de datos

1. El usuario inicia sesión y Supabase genera un token de autenticación.
2. La aplicación consulta la información financiera almacenada en la base de datos de Supabase y en la memoria local.
3. Cuando el usuario registra nuevos ingresos o gastos, estos se sincronizan con la base de datos en tiempo real mediante Supabase Realtime.
4. Las Edge Functions consultan las APIs externas para obtener precios de activos y noticias actualizadas.
5. El asistente de inteligencia artificial procesa los datos del usuario y genera recomendaciones personalizadas.
6. El sistema envía notificaciones o recordatorios locales con alertas y sugerencias financieras.

Requerimientos funcionales:

- Autenticación y gestión de usuarios mediante Supabase Auth.
- Registro, consulta y análisis de ingresos y gastos.
- Integración con APIs financieras y de noticias.
- Chatbot con inteligencia artificial.
- Sincronización en tiempo real mediante Supabase Realtime.
- Modo offline con sincronización local.
- Visualización de datos mediante gráficos interactivos.
