# Análisis de la extensión oficial de 7TV (v3.1.26) para Safari

Fuente: https://github.com/SevenTV/Extension (commit `69eaa09`). Este repositorio no incluye ese código fuente; `scripts/build-extension.sh` lo descarga y lo compila.

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

## Decisión para Safari

Se compiló la extensión oficial y se adaptó (ver README, «Changes from upstream»):

- Solo `twitch.tv`; sin permisos de YouTube/Kick.
- `background.scripts` en lugar de service worker (Safari), sin `default_area` ni sourcemaps.
- Se eliminó la inyección de ~8 MB de emojis SVG (el content script los descargaba en cada página): se usan los emojis nativos de macOS.
- Se descartaron imágenes de onboarding e iconos nightly. Resultado: 14 MB → 2,4 MB.

Limitaciones conocidas: la extensión depende de internos de React/DOM de Twitch (puede romperse con cambios de Twitch), y las funciones con cuenta de 7TV (pinturas, badges, conexión en vivo) no se han verificado en Safari.

`extension-lite/` es una alternativa mínima hecha desde cero para quien solo quiera emotes.
