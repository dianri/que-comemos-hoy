# 🍽️ ¿Qué comemos hoy?

Aplicación web moderna, colaborativa e interactiva para decidir qué comer de forma divertida mediante una ruleta de la suerte inteligente, votaciones populares y sincronización multi-dispositivo en tiempo real entre comensales (familia, compañeros de trabajo, grupos de amigos).

Alojada en **Vercel** y respaldada por **Supabase (PostgreSQL + Realtime)**.

---

## ✨ Características Principales

### 1. 🎲 Ruleta de la Suerte Inteligente y Selección Rápida
- **Gajos Coloreados por Categoría:** Cada porción de la ruleta se dibuja con una paleta cromática distintiva según el tipo de comida (tonos cálidos/tierra para carnes, azulados/marinos para pescados, ámbar/dorados para arroces y pastas, etc.).
- **Sincronización con Filtros Activos:** La ruleta y la función de "Elección Rápida" giran exclusivamente entre los platos que cumplen con la búsqueda y los filtros seleccionados en pantalla.
- **Canvas Retina 2x de Alta Precisión:** Textos perfectamente centrados radial y angularmente con contraste óptimo y parada física exacta bajo la flecha de las 12 en punto.
- **Efectos de Audio y Celebración:** Sonido de giro mecánico sintetizado con Web Audio API (sin dependencias externas), explosión festiva de confeti (`canvas-confetti`) y botón directo *"¡A cocinar!"* que abre la receta ganadora.

### 2. 🎴 Gestión Gastronómica y Tarjetas Visuales
- **Múltiples Categorías por Plato:** Un plato puede pertenecer simultáneamente a varias categorías (ej. *Italiana*, *Pasta*, *Cenas Rápidas*).
- **⭐ Favoritos Sincronizados en la Nube:** Los platos favoritos se guardan en Supabase (`public.user_favorites`) vinculados a tu cuenta, estando disponibles al instante en móvil, tablet y ordenador sin perder sincronización.
- **✨ Autocompletado de Descripciones con IA:** Al crear o editar un plato, pulsa el botón mágico ✨ para generar una descripción culinaria concisa, apetitosa e irresistible gracias a su arquitectura en cascada con tolerancia a fallos (Gemini Flash, Pollinations AI, Wikipedia REST API y motor heurístico gastronómico).
- **🖼️ Selector de Fotos Inteligente con Refinamiento Culinario:** Catálogo integrado en alta resolución y buscador multifuente (Wikipedia en español e inglés, TheMealDB, Unsplash) con refinamiento contextual automático (`"receta"`, `"plato"`, `"comida"`), diccionario de traducción gastronómica al inglés y descarte estricto de documentos (`.pdf`, `.doc`, sedes electrónicas). Acceso directo a Google Images configurado con SafeSearch estricto y filtro de fotografía (`tbs=itp:photo`).

### 3. 🔍 Filtros Horizontales Drag-to-Scroll y Reordenación
- **Desplazamiento por Arrastre (Drag-to-Scroll):** La barra de filtros permite navegar fluidamente haciendo clic izquierdo y arrastrando el ratón en escritorio o deslizando con el dedo en móviles.
- **Botón "Todas" Diferenciado:** Botón de selección global estilizado y separado adecuadamente para facilitar la alternancia rápida de categorías.
- **Reordenación Personalizada de Categorías:** Panel de administración donde los superusuarios pueden crear, eliminar y cambiar el orden visual de los filtros con persistencia en Supabase.
- **Pestañas Principales con Desplazamiento Fluido:** Acceso rápido y touch-friendly a **Todos los platos**, **Mis Platos**, **⭐ Favoritos** y la pestaña exclusiva **Platos de otros** (👥) para superusuarios, con desplazamiento horizontal optimizado para móviles sin desbordamientos de pantalla.

### 4. 📖 Modal de Detalle de Receta HD
- Vista centralizada a pantalla completa accesible desde cualquier tarjeta, ruleta o elección rápida.
- Fotografía en alta resolución, descripción gastronómica completa, etiquetas de categorías, contador de votos y botón directo para añadir a favoritos o compartir mediante la Web Share API.
- **Identidad del Creador e Insignias de Estado:** Muestra el chef autor legítimo de la receta ("Chef Belenroll", "Chef Dianrie") con el correo electrónico del creador en el modal de detalle para trazabilidad, e insignias visuales ("Público", "En revisión", "Privado") para que los creadores reconozcan de inmediato el estado de sus platos.
- **Solicitud Directa de Inclusión en el General:** Los creadores pueden enviar a moderación sus recetas privadas directamente desde el modal de detalle con un clic en *"Solicitar inclusión en el General"*, con actualización visual instantánea a estado pendiente de aprobación evitando duplicados.
- **Botonera Inferior Despejada y Elección Rápida:** Barra de acciones minimalista y funcional con botones esenciales: "Modificar" (para propietarios o administradores), "Elección rápida" (con icono de dados `Dices` para saltar dinámicamente a otra receta al azar con animación festiva) y "Cerrar", eliminando etiquetas de estado redundantes.

### 5. 👥 Autenticación sin Contraseña, Moderación y Gestión Global
- **Barra Superior Compacta y Responsiva:** Cabecera optimizada con márgenes equilibrados, alineación vertical centrada de controles y truncado inteligente para pantallas móviles estrechas, garantizando espacio de respiro y cero desbordamientos.
- **Enlace Mágico (Magic Link):** Inicio de sesión seguro vía correo sin necesidad de recordar contraseñas, con aviso informativo sobre la carpeta de spam para agilizar el acceso.
- **Roles y Jerarquía:** Superusuario Raíz (`dianrie@hotmail.com`), Superusuarios Delegados y Usuarios Estándar.
- **Panel de Administración de Usuarios:** Métricas en tiempo real, gestión de roles y eliminación de cuentas.
- **Campana de Moderación y Flujo de Aprobación:** Campana con badge en tiempo real para superusuarios que abre el panel `DishModerationModal` para aprobar o rechazar solicitudes de platos comunitarios (`approval_status`).
- **🔔 Arquitectura de Notificaciones Push Centralizada en Backend:** Integración de Web Push API 100% desacoplada del frontend. La base de datos es la única fuente de verdad: triggers en PostgreSQL con validación estricta de cambios de estado (`IS DISTINCT FROM`) despachan asíncronamente eventos (`dish_pending`, `dish_approved`) a la Edge Function `send-push-notification`. Los administradores reciben alertas de nuevos platos pendientes y los creadores son notificados al instante cuando su receta es aprobada para la carta comunitaria. Cuenta con un motor extensible (`switch (type)`), claves VAPID y URLs absolutas (`https://quecomemoshoy.dianrie.com/...`) con icono corporativo HD e insignia monocroma transparente para Android. El cliente solo muta los datos en Supabase y solicita permisos de forma fluida al interactuar.
- **Gestión Global de Platos (`is_global`):** Los platos nuevos creados por superusuarios no se publican automáticamente en la pantalla general comunitaria por defecto. Cuentan con un interruptor ("Mostrar en la pantalla principal para todos") en los formularios de creación/edición y un botón de acción rápida con icono de globo terráqueo (`Globe`) en las tarjetas y vista de receta para alternar al instante entre estado público o privado/borrador.
- **Moderación Comunitaria:** Visitantes y usuarios estándar ven exclusivamente recetas globales oficiales en el feed principal, pudiendo solicitar la inclusión de sus platos mediante el interruptor *"Solicitar inclusión en el General"*.

### 6. 📱 Experiencia PWA e Instalación Móvil/Escritorio
- **Web App Progresiva (PWA):** Manifiesto web, iconos adaptativos y Service Worker con estrategia de caché offline.
- **Banner de Instalación No Invasivo:** Aviso elegante que captura el evento `beforeinstallprompt` para instalar la app como nativa, con guía interactiva para usuarios de iOS Safari y memoria de desestimación.

### 7. 🎮 Minijuego Arcade Integrado
- Minijuego recreativo integrado para amenizar la espera mientras se decide la comida, con tabla de mejores puntuaciones en tiempo real (`public.game_scores`).

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Herramienta de Construcción:** Vite 6 (`tsc -b && vite build`).
- **Base de Datos & Backend:** Supabase (PostgreSQL 15, Row Level Security, Realtime Channels).
- **Despliegue & Hosting:** Vercel (con `vercel.json` para SPA rewrites).

---

## 🗄️ Esquema de Base de Datos (Supabase)

- **`public.foods`**: Platos de la carta (`name`, `image_url`, `categories` TEXT[], `description`, `votes_count`, `user_id`, `user_email`, `is_global` BOOLEAN, `approval_status` TEXT).
- **`public.votes`**: Registro de votos en tiempo real por usuario y plato.
- **`public.user_favorites`**: Platos favoritos sincronizados en la nube por usuario autenticado.
- **`public.categories`**: Categorías culinarias con soporte de orden personalizado (`display_order`).
- **`public.user_roles`**: Asignación de roles de seguridad (`root_admin`, `superadmin`, `user`).
- **`public.game_scores`**: Registro de puntuaciones del minijuego arcade.
- **`public.push_subscriptions`**: Suscripciones Web Push de administradores y usuarios para alertas y avisos de moderación/aprobación en segundo plano.

---

## ⚙️ Variables de Entorno

Copia el archivo `.env.example` como `.env` y configura tus credenciales:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica

# IA (Opcional - Gemini Flash para descripciones gastronómicas automáticas)
VITE_GEMINI_API_KEY=tu-api-key-de-google-gemini
```

> **Nota:** Si no se proporciona `VITE_GEMINI_API_KEY`, la aplicación utiliza automáticamente el servicio gratuito Pollinations AI, la API REST de Wikipedia y su generador heurístico artesanal como respaldo sin coste alguno.

---

## 🚀 Despliegue en Vercel

1. Haz un fork o sube este repositorio a tu cuenta de GitHub.
2. Inicia sesión en [vercel.com](https://vercel.com) y crea un nuevo proyecto apuntando al repositorio.
3. Configura las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Haz clic en **Deploy**.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Compilación y control de calidad (TypeScript + Vite)
npm run build
```
