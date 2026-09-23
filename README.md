# Just Print — página web

Sitio público de Just Print: **https://justprinthn.com**

## Dónde vive

- El código está en este repositorio público (`Adorams49/justprint-web`), separado del repo de la app de operaciones (`Just-Print`).
- Se publica solo con **GitHub Pages** cada vez que se sube un cambio a la rama `main` (flujo `.github/workflows/deploy.yml`, tarda ~1 minuto).
- El HTTPS (candado) lo emite y renueva GitHub automáticamente. No hay certificados que renovar a mano.
- GoDaddy solo es el registrador del dominio: el DNS de `justprinthn.com` apunta a GitHub Pages. El correo (Google Workspace) no depende de esto.
- Solo se publican `index.html`, `404.html`, `assets/`, `servicios/`, `sitemap.xml` y `robots.txt`. Los archivos de trabajo (`build.py`, `data/`, los `.bat`, este README) nunca quedan visibles en la página.

## Ver la página en tu PC

Doble clic en **`preview.bat`** → abre `http://localhost:8080` con lo que haya en la carpeta en ese momento (aunque no esté subido a GitHub).

## Cómo actualizar

1. Se editan los archivos (ver abajo).
2. Doble clic en **`build.bat`** (o `python build.py`) para regenerar las páginas de servicio, el menú, el pie y el sitemap.
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

En `config.js`:

- `GALLERY`: fotos que se deslizan de lado en "Nuestro trabajo". Para agregar una, súbela a `assets/img/` y agrega una línea.
- `CLIENTS` / `TESTIMONIALS`: vacíos = esas secciones no aparecen.
- `SOCIAL`: enlaces de Facebook e Instagram (salen en el pie de página). Vacío = ícono sin enlace.

## Notas

- No hay formulario ni descarga del catálogo: todo invita a llamar o escribir al correo.
- Los subdominios `cpanel/ftp/webdisk/whm.justprinthn.com` dejaron de funcionar (apuntaban al hosting viejo). El panel de GoDaddy se usa desde "Mis productos".
- El sitio viejo sigue de respaldo en el hosting de GoDaddy (`respaldo_sitio_anterior/`). Ahí también quedaron archivos sueltos de la renovación manual de HTTPS (ya no se usan) que se pueden borrar cuando se entre al panel.
- `build.py` tiene `DOMAIN = "https://justprinthn.com"` para el sitemap y Google.
