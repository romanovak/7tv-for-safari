<p align="center">
  <img src="docs/images/banner.svg" alt="7TV for Safari — solo Twitch" width="100%">
</p>

<p align="center"><a href="README.md">English</a> · <b>Español</b></p>

**7TV for Safari** empaqueta la [extensión de 7TV](https://github.com/SevenTV/Extension) (código abierto) para **Safari en macOS**, limitada a **twitch.tv** y aligerada de 14 MB a unos 2,4 MB. Incluye emotes de 7TV en el chat, el menú de emotes, ajustes de chat y de diseño, resaltados y más, sin el peso de otros sitios.

> **No oficial.** Este proyecto no está afiliado ni respaldado por 7TV ni por Twitch. El nombre y el logo de 7TV pertenecen a sus dueños.
>
> **Estado: experimental.** Probado en un solo Mac. Algunas funciones dependen de la estructura de Twitch y pueden dejar de funcionar cuando Twitch la cambie.

## Instalar la app ya compilada

<p align="center">
  <img src="docs/images/install-steps.svg" alt="Pasos: descargar, instalar, abrir una vez, permitir extensiones sin firmar, activar" width="100%">
</p>

Requiere **macOS 13 o superior** con Safari.

1. **Descarga** `7TV-for-Safari-<versión>-macOS.zip` desde la [última release](https://github.com/romanovak/7tv-for-safari/releases/latest) y descomprímelo.
2. **Mueve** `7TV Safari.app` a la carpeta `Aplicaciones` y quita la marca de cuarentena:
   ```bash
   xattr -cr "/Applications/7TV Safari.app"
   ```
   (O haz clic derecho en la app → **Abrir**.)
3. **Abre la app una vez** para que macOS registre la extensión de Safari y ciérrala.
4. En Safari activa el menú Desarrollo: **Ajustes → Avanzado → Mostrar funciones para desarrolladores web**.
5. Elige **Desarrollo → Permitir extensiones sin firmar** e introduce tu contraseña. *Safari olvida este ajuste cada vez que se cierra: repítelo tras cada reinicio.*
6. Ve a **Safari → Ajustes → Extensiones**, marca **7TV**, pulsa **Editar sitios web…** y pon `twitch.tv` en **Permitir** (permite también `7tv.io` si lo pide).
7. Abre un canal en [twitch.tv](https://www.twitch.tv) y recarga la página.

**Verificar la descarga** (opcional): `shasum -a 256 7TV-for-Safari-<versión>-macOS.zip` debe coincidir con `SHA256.txt` de la release.

> La app está **firmada ad-hoc y sin notarizar**, porque distribuir una extensión de Safari de forma permanente requiere una cuenta de pago de Apple Developer. Por eso son necesarios los pasos 2 y 5.

## Compilar desde el código

Requiere **Xcode** completo (no solo las Command Line Tools).

```bash
git clone https://github.com/romanovak/7tv-for-safari.git
cd 7tv-for-safari
open "official-project/7TV Safari/7TV Safari.xcodeproj"
```

1. En Xcode, para **los dos** targets (*7TV Safari* y *7TV Safari Extension*), abre **Signing & Capabilities**: elige tu **Team** (sirve un Apple ID gratuito) y cambia el **Bundle Identifier** `com.example.sevntv` por uno tuyo (el de la extensión debe ser el de la app + `.Extension`).
2. Actualiza `extensionBundleIdentifier` en `7TV Safari/ViewController.swift`.
3. Pulsa **⌘R** y sigue los pasos 4 a 7 de arriba.

Los scripts `scripts/build-release.sh` (genera el `.zip` universal) y `scripts/build-extension.sh` (reconstruye `extension-official/` desde el código de 7TV con los parches de `patches/`) están descritos en el [README en inglés](README.md#scripts).

## Estructura

| Ruta | Descripción |
|---|---|
| `extension-official/` | Build de la extensión oficial de 7TV (v3.1.26) adaptada a Safari. **La que debes usar.** |
| `official-project/` | Proyecto de Xcode que la empaqueta como extensión de Safari. |
| `extension-lite/` | Alternativa mínima hecha desde cero (unos 6 KB): solo emotes de 7TV, BTTV y FFZ, sin ajustes. |
| `patches/`, `scripts/` | Parches y scripts de compilación reproducible. |
| `docs/` | Imágenes y notas ([análisis de la extensión oficial](docs/ANALYSIS.es.md)). |

## Problemas frecuentes

| Problema | Solución |
|---|---|
| La extensión no aparece en Safari | Cierra Safari (⌘Q), ábrelo de nuevo, abre la app una vez y repite **Permitir extensiones sin firmar**. |
| Aparece duplicada | Hay otra copia registrada (p. ej. en `DerivedData`). Bórrala y reinicia Safari. |
| No salen emotes | Comprueba que `twitch.tv` esté en **Permitir**, recarga y revisa errores en **Desarrollo → Mostrar Web Inspector**. |
| macOS dice que la app está dañada o de un desarrollador no identificado | Ejecuta el `xattr -cr` del paso 2 o usa clic derecho → **Abrir**. |
| Se apagó tras reiniciar Safari | Es lo esperado con extensiones sin firmar: repite **Permitir extensiones sin firmar**. |

## Licencia

- El código y recursos de 7TV (`extension-official/`, logos) están bajo la licencia **Commons Clause** ([`LICENSE-7TV.md`](LICENSE-7TV.md)). **Este repositorio no se puede vender.**
- Todo lo escrito para este port (`extension-lite/`, `scripts/`, el proyecto de Xcode y la documentación) está bajo [MIT](LICENSE).
