# Just Print — página web

Sitio público de Just Print: **https://justprinthn.com**

## Dónde vive

- El código está en este repositorio público (`Adorams49/justprint-web`), separado del repo de la app de operaciones (`Just-Print`).
- Se publica solo con **GitHub Pages** cada vez que se sube un cambio a la rama `main` (flujo `.github/workflows/deploy.yml`, tarda ~1 minuto).
- El HTTPS (candado) lo emite y renueva GitHub automáticamente. No hay certificados que renovar a mano.
- GoDaddy solo es el registrador del dominio: el DNS de `justprinthn.com` apunta a GitHub Pages. El correo (Google Workspace) no depende de esto.
- Solo se publican `index.html`, `404.html`, `assets/`, `servicios/`, `sitemap.xml` y `robots.txt`. Los archivos de trabajo (`build.py`, `data/`, `src/`, `package.json`, los `.bat`, este README) nunca quedan visibles en la página.

## Ver la página en tu PC

Doble clic en **`preview.bat`** → abre `http://localhost:8080` con lo que haya en la carpeta en ese momento (aunque no esté subido a GitHub).

## Cómo actualizar

1. Se editan los archivos (ver abajo).
2. Doble clic en **`build.bat`**: compila los componentes de React (si Node.js está instalado) y regenera las páginas de servicio, el menú, el pie y el sitemap.
3. Se revisa con `preview.bat`.
4. Solo cuando se decide publicar: `git add -A`, `git commit` y `git push` a `main`.

## Dónde editar

| Archivo | Qué contiene |
|---|---|
| `assets/js/config.js` | Teléfono, correo, horario, dirección, coordenadas del mapa, redes sociales, preguntas frecuentes, galería, clientes y testimonios. |
| `data/services.json` | Los 12 servicios (textos, listas, colores). Después de editarlo, correr `build.bat`. |
| `assets/img/` | Fotos y logos. |
| `index.html` | Textos fijos de la página principal. |
| `assets/css/style.css` | Estilos. |
| `assets/js/motion.js` | Animaciones con GSAP: tarjetas 3D, botones magnéticos y animaciones al hacer scroll. Si GSAP no carga o el visitante pidió "reducir movimiento", la página funciona igual sin ellas. |
| `src/islands/` | Componentes de React Bits (espiral del inicio, carrusel circular de servicios, galería que se transforma y botón "mantener para pedir el catálogo"). Se compilan con `npm run build` (o `build.bat`) a `assets/islands/`, que es lo que carga la página. |
| `assets/vendor/gsap/` | GSAP 3.15.0 (núcleo + ScrollTrigger) guardado dentro del proyecto, sin depender de un CDN. Licencia gratuita de GSAP, permite uso comercial: https://gsap.com/standard-license |

En `config.js`:

- `GALLERY`: fotos de "Nuestro trabajo" (se transforman de una a otra). Para agregar una, súbela a `assets/img/` (proporción 2:1, como 800×405) y agrega una línea.
- `CLIENTS` / `TESTIMONIALS`: vacíos = esas secciones no aparecen.
- `SOCIAL`: enlaces de Facebook e Instagram (salen en el pie de página). Vacío = ícono sin enlace.
- `hours`: una fila por elemento (por ejemplo, una para lunes a viernes y otra para sábado).

## React y React Bits

La página sigue siendo HTML normal (Google lee todo el texto). Solo cuatro partes son "islas" de React que se montan encima, tomadas de https://reactbits.dev (licencia MIT + Commons Clause: se pueden usar en un sitio comercial, no revenderse; copia en `src/islands/reactbits/LICENSE.md`):

- **Infinite Spiral**: inicio, los 12 servicios girando (con mouse también se arrastra).
- **Circular Carousel**: servicios. Tocar el del frente abre el detalle.
- **Morph Slider** (WebGL): "Nuestro trabajo". Sin WebGL se ve una tira de fotos normal.
- **Hold Button**: catálogo. Mantener presionado abre un correo para pedirlo.

Ronda 2 (`src/islands/round2.jsx`): **Drift Wall** (fondo del inicio), **Tech Text** (título), **Text Loop** (barra bajo el inicio), **Chroma Grid** (servicios bajo el carrusel), **Scroll Stack** (Por qué Just Print), **Scroll Expand** + **Crosshair** (sección "a la medida"), **Card Swap** (Nosotros), **Accordion Gallery** (catálogo), **Magnet Lines** (Preguntas), **Shiny Text** (etiquetas), **Circular Text** ("desarrollado por") y **Jelly Radio** (menú de arriba en escritorio).

Si algo de React falla, se queda el contenido simple del HTML. Para recompilar hace falta Node.js (`npm install` la primera vez, luego `npm run build`). Las miniaturas `assets/img/t-*.webp` (espiral) se hicieron a partir de las fotos `m-*`.

## Notas

- No hay formulario ni descarga del catálogo: todo invita a llamar o escribir al correo.
- Los subdominios `cpanel/ftp/webdisk/whm.justprinthn.com` dejaron de funcionar (apuntaban al hosting viejo). El panel de GoDaddy se usa desde "Mis productos".
- El sitio viejo sigue de respaldo en el hosting de GoDaddy (`respaldo_sitio_anterior/`). Ahí también quedaron archivos sueltos de la renovación manual de HTTPS (ya no se usan) que se pueden borrar cuando se entre al panel.
- `build.py` tiene `DOMAIN = "https://justprinthn.com"` para el sitemap y Google.
