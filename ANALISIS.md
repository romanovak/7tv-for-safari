# Análisis de la extensión oficial de 7TV (v3.1.26) y plan para Safari

Fuente: https://github.com/SevenTV/Extension (commit 69eaa09, clonado en el scratchpad, no está en este proyecto).

## Estructura

| Parte | Qué hace |
|---|---|
| `manifest.config.ts` | Genera el manifest MV3 (o MV2). Permisos: `scripting`, `storage`, `activeTab`; host `*.twitch.tv`; opcionales YouTube/Kick/7tv. Tiene `action` con popup, `options_ui` y `web_accessible_resources`. |
| `src/content/content.ts` | Content script mínimo (~100 líneas): inyecta `site.js` y el CSS en la página, y puentea permisos por `BroadcastChannel`. |
| `src/background/` | Service worker: mensajería, sincronización y peticiones de permisos. |
| `src/site/` | La app real (Vue 3 + Pinia), corre dentro de la página. Un módulo por sitio: `twitch.tv`, `youtube.com`, `kick.com`. |
| `src/site/twitch.tv/modules/` | chat, chat-input (autocompletado, anti-spam), emote-menu, hidden-elements, mod-logs, player, sidebar-previews, settings, autoclaim, avatars, custom-commands. |
| `src/app/` | UI compartida: `settings` (menú de ajustes), `emote-menu`, `chat` (Emote, Badge, UserCard, tooltips), `paint-tool`, `options` (página de opciones). |
| `src/worker/` | Web Worker con la conexión a 7TV (eventos en vivo, HTTP) y base de datos IndexedDB (`src/db`). |
| `src/apollo`, `src/assets/gql` | Cliente GraphQL para la API de 7TV. |

Cómo funciona: el content script solo inyecta; todo lo demás se engancha a los componentes React internos de Twitch, y reemplaza el chat por su propio componente Vue.

## Opciones nativas (≈105 ajustes, declarados con `declareConfig`)

- **Chat:** tamaño de fuente, padding, escala y margen de emotes, fondo alternado, timestamps, mensajes borrados, menciones coloreadas, límite de líneas, scroll suave, estilo de `/me`, tarjeta de usuario, ocultar chat compartido.
- **Resaltados:** mención, primer mensaje, regresa, raider, propio; sonido, parpadeo de título, opacidad.
- **Entrada de chat:** autocompletado (`:emote`, chatters, carrusel Tab), anti-spam.
- **Menú de emotes:** botón, pestaña por defecto, favoritos, más usados, búsqueda.
- **Diseño (`layout.hide_*`):** ~25 interruptores para ocultar elementos de Twitch (bits, suscribirse, whispers, recomendados, historias, etc.).
- **Reproductor:** estadísticas de video, saltar restricción de contenido, ocultar celebraciones.
- **Vanity:** badges y pinturas de nombre de 7TV (requieren conexión en vivo).
- **Moderación:** comando `/nuke`, mod logs, mod slider.
- Otros: autoclaim de puntos, difuminar emotes no listados, tooltips compactos, transparencias, sidebar previews.

## Interpretación para Safari

El código oficial no se puede "copiar" tal cual:
1. Requiere Node/yarn/Vite para compilarse (aquí no hay node) y su inyección depende de internos de React de Twitch.
2. Safari no soporta bien `options_ui` en pestaña ni varias APIs; hay que usar popup + página de opciones empaquetada.
3. Pinturas, badges y emotes en vivo dependen de un WebSocket de eventos de 7TV y de la sesión del usuario.

### Opción recomendada: ampliar mi extensión ligera (fases)

1. **Popup + opciones** con `browser.storage`: interruptores 7TV/BTTV/FFZ, escala y margen de emotes, ancho cero, blur de no listados.
2. **Chat:** tamaño de fuente, padding, fondo alternado, ocultar timestamps/badges, resaltados (mención, propio) con CSS/JS.
3. **Diseño:** los `layout.hide_*` más útiles como reglas CSS activables.
4. **Menú de emotes** propio (botón junto al chat, búsqueda, favoritos) y autocompletado `:emote` en el input.
5. **Opcional:** pinturas/badges y actualizaciones en vivo (WebSocket 7TV EventAPI).

### Alternativa: compilar la oficial y convertirla

Instalar node + yarn, `yarn build`, ajustar el manifest para Safari y pasar por `safari-web-extension-converter`. Da todas las funciones, pero es frágil y se rompe cuando Twitch cambia su DOM.
