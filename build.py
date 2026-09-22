#!/usr/bin/env python3
"""
Just Print — generador del sitio.

Lee data/services.json y genera:
  · assets/js/data.js          (datos para la página principal)
  · servicios/<servicio>.html  (una página por servicio, para Google)
  · 404.html, sitemap.xml, robots.txt
  · el menú y el pie de página de index.html (entre las marcas <!--build:...-->)

Uso:  python build.py      (o doble clic en construir.bat)
Después de editar data/services.json, vuelve a correrlo.
"""
import html
import json
import re
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).parent
DOMAIN = "https://justprinthn.com"   # <- cámbialo si el dominio final es otro
SITE = "Just Print"
LOGO = "assets/img/logo-white-mark.png"
BUILD = datetime.now().strftime("%Y%m%d%H%M")   # versión: obliga al navegador a bajar el CSS/JS nuevo

services = json.loads((ROOT / "data" / "services.json").read_text(encoding="utf-8"))
esc = lambda s: html.escape(str(s), quote=True)


# ---------------------------------------------------------------- fragmentos
THEME_INIT = (
    "<script>try{var t=localStorage.getItem('jp-theme');"
    "if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';"
    "document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}</script>"
)

ICON_SUN = '<svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
ICON_MOON = '<svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>'


def nav_html(prefix):
    home = lambda a: (prefix + "index.html" + a) if prefix else a
    logo_href = (prefix + "index.html") if prefix else "#inicio"
    return f"""<header class="nav" id="nav">
  <div class="nav__inner">
    <a class="nav__logo" href="{logo_href}" aria-label="Just Print, inicio">
      <img src="{prefix}{LOGO}" alt="Just Print" width="856" height="471">
    </a>
    <nav class="nav__links" id="navLinks" aria-label="Principal">
      <a href="{home('#servicios')}">Servicios</a>
      <a href="{home('#proceso')}">Proceso</a>
      <a href="{home('#nosotros')}">Nosotros</a>
      <a href="{home('#catalogo')}">Catálogo</a>
      <a href="{home('#preguntas')}">Preguntas</a>
      <a href="{home('#contacto')}">Contacto</a>
    </nav>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Cambiar tema" title="Modo claro / oscuro">{ICON_SUN}{ICON_MOON}</button>
    <a class="btn btn--sm btn--blue nav__cta" href="{home('#contacto')}">Cotizar</a>
    <button class="nav__burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="navLinks">
      <span></span><span></span>
    </button>
  </div>
</header>"""


def footer_html(prefix):
    home = lambda a: (prefix + "index.html" + a) if prefix else a
    svc = "\n".join(
        f'        <a href="{prefix}servicios/{s["id"]}.html">{esc(s["title"])}</a>' for s in services
    )
    return f"""<footer class="footer">
  <div class="stripe" aria-hidden="true"></div>
  <div class="wrap footer__inner">
    <div class="footer__brand">
      <img src="{prefix}assets/img/logo-white.png" alt="Just Print. Expertos en lo que hacemos" width="901" height="573" loading="lazy">
      <p>Diseño, impresión e instalación a nivel nacional en Honduras.</p>
      <div class="socials" data-socials aria-label="Redes sociales"></div>
    </div>
    <div class="footer__cols">
      <div class="footer__col footer__col--wide">
        <h4>Servicios</h4>
{svc}
      </div>
      <div class="footer__col">
        <h4>Empresa</h4>
        <a href="{home('#nosotros')}">Nosotros</a>
        <a href="{home('#proceso')}">Cómo trabajamos</a>
        <a href="{home('#catalogo')}">Catálogo</a>
        <a href="{home('#preguntas')}">Preguntas frecuentes</a>
        <a href="{home('#contacto')}">Contacto</a>
      </div>
    </div>
  </div>
  <div class="wrap footer__legal">
    <span>© <span data-year>2026</span> Just Print. Todos los derechos reservados.</span>
    <span>Desarrollado por <strong>Ari Ramos</strong></span>
  </div>
</footer>
<button class="totop" id="toTop" type="button" aria-label="Volver arriba">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
</button>"""


def head_html(prefix, title, desc, path, img="assets/img/story-printer.webp", extra=""):
    canonical = f"{DOMAIN}/{path}" if path else f"{DOMAIN}/"
    return f"""<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="theme-color" content="#062f5e">
  <link rel="canonical" href="{canonical}">
  <meta property="og:site_name" content="{SITE}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{DOMAIN}/{img}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="{prefix}assets/img/favicon.png">
  <link rel="apple-touch-icon" href="{prefix}assets/img/favicon.png">
  {THEME_INIT}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}assets/css/style.css?v={BUILD}">{extra}"""


def scripts_html(prefix):
    return (
        f'<script src="{prefix}assets/js/config.js?v={BUILD}"></script>\n'
        f'<script src="{prefix}assets/js/data.js?v={BUILD}"></script>\n'
        f'<script src="{prefix}assets/js/common.js?v={BUILD}"></script>'
    )


# ---------------------------------------------------------------- páginas de servicio
def summary(s):
    txt = f'{s["sub"]} {s["text"][0]}'
    return txt if len(txt) <= 158 else txt[:155].rsplit(" ", 1)[0] + "…"


def related_cards(i):
    out = []
    for k in range(1, 4):
        r = services[(i + k) % len(services)]
        out.append(f"""      <a class="card reveal" style="--accent:{r['color']};--d:{(k-1)*.08:.2f}s" href="{r['id']}.html">
        <span class="card__img">
          <img src="../assets/img/c-{r['img']}.webp" alt="{esc(r['title'])}" loading="lazy">
          <span class="card__tag">{esc(r['tag'])}</span>
        </span>
        <span class="card__body">
          <span>
            <span class="card__title">{esc(r['title'])}</span>
            <span class="card__sub" style="display:block">{esc(r['sub'])}</span>
          </span>
          <span class="card__plus" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>
        </span>
      </a>""")
    return "\n".join(out)


def pager(i):
    prev, nxt = services[(i - 1) % len(services)], services[(i + 1) % len(services)]
    arrow = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
    return f"""  <section class="pager" aria-label="Más servicios">
    <a class="pager__a pager__a--prev" style="--accent:{prev['color']}" href="{prev['id']}.html">
      <span class="pager__ico">{arrow}<path d="M15 6l-6 6 6 6"/></svg></span>
      <span><small>Anterior</small><strong>{esc(prev['title'])}</strong></span>
    </a>
    <a class="pager__a pager__a--next" style="--accent:{nxt['color']}" href="{nxt['id']}.html">
      <span><small>Siguiente</small><strong>{esc(nxt['title'])}</strong></span>
      <span class="pager__ico">{arrow}<path d="M9 6l6 6-6 6"/></svg></span>
    </a>
  </section>"""


def service_page(i, s):
    prefix = "../"
    title = f'{s["title"]} en Honduras | {SITE}'
    desc = summary(s)
    path = f'servicios/{s["id"]}.html'
    ld = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": f"{DOMAIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Servicios", "item": f"{DOMAIN}/#servicios"},
                        {"@type": "ListItem", "position": 3, "name": s["title"], "item": f"{DOMAIN}/{path}"},
                    ],
                },
                {
                    "@type": "Service",
                    "name": s["title"],
                    "description": desc,
                    "areaServed": {"@type": "Country", "name": "Honduras"},
                    "provider": {"@type": "Organization", "name": SITE, "url": f"{DOMAIN}/"},
                },
            ],
        },
        ensure_ascii=False,
    )
    paras = "\n".join(f"        <p>{esc(t)}</p>" for t in s["text"])
    items = "\n".join(f"        <li>{esc(t)}</li>" for t in s["list"])
    return f"""<!DOCTYPE html>
<html lang="es" class="no-js" data-theme="light">
<head>
  {head_html(prefix, title, desc, path, img=f"assets/img/c-{s['img']}.webp", extra=f'<script type="application/ld+json">{ld}</script>')}
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
{nav_html(prefix)}

<div class="subnav" id="subnav" style="--accent:{s['color']}">
  <div class="subnav__inner">
    <strong class="subnav__title">{esc(s['title'])}</strong>
    <nav class="subnav__links" aria-label="En esta página">
      <a href="#descripcion">Descripción</a>
      <a href="#incluye">Incluye</a>
      <a href="#otros">Otros servicios</a>
    </nav>
    <a class="btn btn--sm btn--blue" href="../index.html#contacto">Cotizar</a>
  </div>
</div>

<main id="contenido">
  <section class="phero" style="--accent:{s['color']}">
    <div class="hero__bg" aria-hidden="true">
      <span class="orb orb--blue"></span><span class="orb orb--magenta"></span><span class="hero__grid"></span>
    </div>
    <div class="wrap phero__inner">
      <div class="phero__copy">
        <nav class="crumbs reveal" aria-label="Ruta de navegación">
          <a href="../index.html">Inicio</a><span>/</span><a href="../index.html#servicios">Servicios</a><span>/</span><span aria-current="page">{esc(s['title'])}</span>
        </nav>
        <span class="phero__tag reveal" style="--d:.05s">{esc(s['tag'])}</span>
        <h1 class="phero__title reveal" style="--d:.1s">{esc(s['title'])}</h1>
        <p class="phero__sub reveal" style="--d:.16s">{esc(s['sub'])}</p>
        <div class="hero__cta hero__cta--left reveal" style="--d:.22s">
          <a class="btn btn--blue" href="../index.html#contacto">Cotizar este servicio</a>
          <a class="btn btn--ghost" href="../index.html#catalogo">Ver catálogo</a>
        </div>
      </div>
      <div class="phero__media reveal reveal--scale" style="--d:.12s">
        <img src="../assets/img/c-{s['img']}.webp" alt="{esc(s['title'])}" width="800" height="410">
      </div>
    </div>
  </section>

  <section class="section" id="descripcion">
    <div class="wrap pdetail" style="--accent:{s['color']}">
      <div class="pdetail__media reveal reveal--scale">
        <img src="../assets/img/m-{s['img']}.webp" alt="Ejemplos de {esc(s['title']).lower()}" width="800" height="1245" loading="lazy">
      </div>
      <div class="pdetail__body">
        <p class="eyebrow reveal">Sobre este servicio</p>
        <h2 class="h2 reveal" style="--d:.06s">{esc(s['title'])}</h2>
        <div class="pdetail__text reveal" style="--d:.12s">
{paras}
        </div>
        <h3 class="pdetail__h reveal" id="incluye" style="--d:.16s">Incluye</h3>
        <ul class="check reveal" style="--d:.2s">
{items}
        </ul>
        <div class="pdetail__cta reveal" style="--d:.24s">
          <a class="btn btn--blue" href="../index.html#contacto">Pedir cotización</a>
          <a class="btn btn--outline" href="../index.html#catalogo">Ver catálogo</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--soft" id="otros">
    <div class="wrap">
      <header class="section__head">
        <p class="eyebrow reveal">Sigue explorando</p>
        <h2 class="h2 reveal" style="--d:.06s">Otros servicios</h2>
      </header>
      <div class="grid grid--3">
{related_cards(i)}
      </div>
    </div>
  </section>

{pager(i)}

  <section class="cta-band">
    <div class="wrap cta-band__inner">
      <h2 class="h2 h2--light reveal">¿Listo para empezar<br>tu proyecto?</h2>
      <p class="lead lead--light reveal" style="--d:.06s">Cuéntanos qué necesitas y te enviamos una cotización.</p>
      <div class="reveal" style="--d:.12s"><a class="btn btn--white" href="../index.html#contacto">Hablemos</a></div>
    </div>
  </section>
</main>

{footer_html(prefix)}

{scripts_html(prefix)}
</body>
</html>
"""


def not_found_page():
    prefix = "/"
    return f"""<!DOCTYPE html>
<html lang="es" class="no-js" data-theme="light">
<head>
  {head_html(prefix, f"Página no encontrada | {SITE}", "La página que buscas no existe.", "404.html", extra='<meta name="robots" content="noindex">')}
</head>
<body>
{nav_html(prefix)}
<main class="nf">
  <div class="hero__bg" aria-hidden="true"><span class="orb orb--blue"></span><span class="orb orb--magenta"></span><span class="hero__grid"></span></div>
  <div class="nf__inner">
    <p class="nf__code">404</p>
    <h1 class="nf__title">Esta página no existe.</h1>
    <p class="nf__sub">Puede que el enlace haya cambiado. Volvamos a un lugar seguro.</p>
    <div class="hero__cta"><a class="btn btn--blue" href="/index.html">Ir al inicio</a><a class="btn btn--ghost" href="/index.html#servicios">Ver servicios</a></div>
  </div>
</main>
{footer_html(prefix)}
{scripts_html(prefix)}
</body>
</html>
"""


# ---------------------------------------------------------------- escritura
def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8", newline="\n")
    print("  ✔", path)


def inject(index_text, name, content):
    pat = re.compile(rf"(<!--build:{name}-->).*?(<!--/build:{name}-->)", re.S)
    if not pat.search(index_text):
        raise SystemExit(f"Falta la marca <!--build:{name}--> en index.html")
    return pat.sub(lambda m: f"{m.group(1)}\n{content}\n{m.group(2)}", index_text)


def main():
    print("Generando sitio…")
    write("assets/js/data.js", "/* GENERADO por build.py desde data/services.json — no editar a mano */\nconst SERVICES = "
          + json.dumps(services, ensure_ascii=False, indent=2) + ";\n")

    for old in (ROOT / "servicios").glob("*.html"):
        old.unlink()
    for i, s in enumerate(services):
        write(f"servicios/{s['id']}.html", service_page(i, s))
    write("404.html", not_found_page())

    idx = (ROOT / "index.html").read_text(encoding="utf-8")
    idx = inject(idx, "nav", nav_html(""))
    idx = inject(idx, "footer", footer_html(""))
    idx = re.sub(r'(assets/(?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=\w+)?(?=")', rf"\1?v={BUILD}", idx)
    (ROOT / "index.html").write_text(idx, encoding="utf-8", newline="\n")
    print("  ✔ index.html (menú y pie)")

    today = date.today().isoformat()
    urls = [("", "1.0")] + [(f"servicios/{s['id']}.html", "0.8") for s in services]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, prio in urls:
        sm.append(f"  <url><loc>{DOMAIN}/{path}</loc><lastmod>{today}</lastmod><priority>{prio}</priority></url>")
    sm.append("</urlset>")
    write("sitemap.xml", "\n".join(sm) + "\n")
    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")
    print(f"Listo: {len(services)} páginas de servicio.")


if __name__ == "__main__":
    main()
