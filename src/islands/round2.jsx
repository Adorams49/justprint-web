/* ==========================================================
   Ronda 2 de React Bits (se importa desde main.jsx)
   ========================================================== */
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import DriftWall from './reactbits/DriftWall.jsx';
import AccordionGallery from './reactbits/AccordionGallery.jsx';
import ScrollStack, { ScrollStackItem } from './reactbits/ScrollStack.jsx';
import { ChromaGrid } from './reactbits/ChromaGrid.jsx';
import CardSwap from './reactbits/CardSwap.jsx';
import TechText from './reactbits/TechText.jsx';
import TextLoop from './reactbits/TextLoop.jsx';
import CircularText from './reactbits/CircularText.jsx';
import ShinyText from './reactbits/ShinyText.jsx';
import ScrollExpand from './reactbits/ScrollExpand.jsx';
import MagnetLines from './reactbits/MagnetLines.jsx';
import Crosshair from './reactbits/Crosshair.jsx';
import JellyRadio from './reactbits/JellyRadio.jsx';
import DepthCarousel from './reactbits/DepthCarousel.jsx';

// raíz del sitio (islands.js vive en assets/islands/): sirve igual desde index.html y desde servicios/*.html
const BASE = new URL('../../', import.meta.url).href;

export function round2({ mount, services, gallery, finePointer }) {
  const svc = id => services.find(s => s.id === id) || {};
  const narrow = window.matchMedia('(max-width: 820px)').matches;
  const dark = document.documentElement.dataset.theme === 'dark';

  /* ---------- Inicio: muro de fotos a la deriva detrás del texto ---------- */
  mount('driftwall', () => (
    <DriftWall
      items={[...gallery.map(g => g.img), ...services.map(s => `c-${s.img}.webp`)].map(img => ({ image: `assets/img/${img}`, title: '' }))}
      columns={narrow ? 3 : 6}
      tileWidth={220}
      tileHeight={112}
      gap={16}
      tilt={18}
      turn={-12}
      speed={26}
      dim={0.72}
      fade={0.7}
      overlayColor="#041f40"
      pauseOnHover={false}
    />
  ));

  /* ---------- Título del inicio con Tech Text ---------- */
  const mountTech = () =>
    mount('techtext', el => {
      const lines = (el.dataset.lines || '').split('|');
      const colors = ['#ffffff', '#7cc8ee'];
      return (
        <>
          <span className="sr-only">{lines.join(' ')}</span>
          {lines.map((line, i) => (
            <span key={i} className="hero__tech-line" aria-hidden="true">
              <TechText
                text={line}
                fontFamily="Bricolage Grotesque"
                fontWeight={800}
                fontSize={110}
                letterSpacing={-0.035}
                color={colors[i % 2]}
                accentColor="#35a2db"
                labels={!narrow}
                draggable={false}
                speed={0.8}
              />
            </span>
          ))}
        </>
      );
    });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mountTech);
  else mountTech();

  /* ---------- Barra bajo el inicio: texto que viaja por una onda ---------- */
  mount('textloop', () => (
    <TextLoop
      text="Gran formato ✦ Lonas ✦ Viniles ✦ Letras con luz ✦ Acrílicos"
      shape="wave"
      curviness={22}
      speed={70}
      fontSize={30}
      fontWeight={700}
      letterSpacing={2.5}
      color="#ffffff"
      ribbonColor="#1b74a8"
      ribbonWidth={64}
      bandHeight={170}
    />
  ));

  /* ---------- Textos con brillo ---------- */
  mount('shiny', el => {
    const onDark = el.closest('.hero, .process, .catalog, .work');
    return (
      <ShinyText
        text={el.textContent.trim()}
        color={onDark ? 'rgba(255,255,255,0.78)' : 'var(--blue-ink)'}
        shineColor={onDark ? '#ffffff' : '#062f5e'}
        speed={2.6}
        delay={1.5}
      />
    );
  });

  /* ---------- Debajo del carrusel: Chroma Grid con los servicios ---------- */
  mount('chroma', () => (
    <ChromaGrid
      items={services.map(s => ({
        image: `assets/img/c-${s.img}.webp`,
        title: s.title,
        subtitle: s.sub,
        borderColor: s.color,
        accent: s.color,
        url: `servicios/${s.id}.html`,
        alt: s.title
      }))}
      columns={narrow ? 2 : 4}
      minCardWidth={150}
      aspectRatio="2 / 1"
      cardRadius={18}
      theme={dark ? 'dark' : 'light'}
    />
  ));

  /* ---------- Por qué Just Print: tarjetas que se apilan al hacer scroll ---------- */
  const reasons = [
    ['Alta calidad', 'Impresión sin limitaciones.', 'Equipos de alta calidad para pequeño y gran formato, offset y copiado láser.', 'c-granformato.webp'],
    ['A nivel nacional', 'Todo Honduras.', 'Producción e instalación en todo el país, con el mismo cuidado en cada pieza.', 'g-letras-luz.webp'],
    ['Un solo lugar', `${services.length} líneas de productos.`, 'Diseño, impresión, rotulación, mobiliario y promocionales bajo un mismo techo.', 'c-muebleria.webp'],
    ['Rápido y accesible', 'El mejor servicio, a menor costo.', 'Comprometidos con cada cliente, con atención adaptada a lo que necesitas.', 'g-lona-front.webp'],
    ['Diseño gráfico', 'Tu marca, en manos creativas.', 'Nuestro departamento de diseño te ayuda a mantener, adaptar y evolucionar tu imagen.', 'story-design.webp']
  ];
  mount('stack', () => (
    <ScrollStack useWindowScroll smoothScroll={false} itemDistance={120} itemStackDistance={22} stackPosition="16%" baseScale={0.86}>
      {reasons.map(([k, h, p, img]) => (
        <ScrollStackItem key={k} itemClassName="why-card">
          <div className="why-card__copy">
            <p className="why-card__k">{k}</p>
            <h3 className="why-card__h">{h}</h3>
            <p className="why-card__p">{p}</p>
          </div>
          <img className="why-card__img" src={`assets/img/${img}`} alt="" loading="lazy" />
        </ScrollStackItem>
      ))}
    </ScrollStack>
  ));

  /* ---------- Taller: foto que se expande al hacer scroll + mira "a la medida" ---------- */
  function MeasureOverlay() {
    const ref = useRef(null);
    const [ready, setReady] = useState(false);
    useEffect(() => setReady(true), []);
    return (
      <div ref={ref} className="expand-copy">
        <p className="expand-copy__k">Impresión a la medida</p>
        <h2 className="expand-copy__h">Tú pones la medida. Nosotros la imprimimos.</h2>
        <p className="expand-copy__p">Lonas, viniles y rótulos al tamaño exacto de tu espacio.</p>
        <a className="btn btn--white" href="#contacto">Pedir cotización</a>
        {ready && finePointer && !narrow ? <Crosshair containerRef={ref} color="#7cc8ee" opacity={0.9} lineStyle="dashed" /> : null}
      </div>
    );
  }
  mount('expand', () => (
    <ScrollExpand
      src="assets/img/story-printer.webp"
      alt="Impresora de gran formato en el taller de Just Print"
      useWindowScroll
      startWidth={narrow ? 82 : 46}
      startHeight={narrow ? 44 : 56}
      mediaZoom={1.2}
      scrollDistance={1}
      overlayScrim={0.64}
    >
      <MeasureOverlay />
    </ScrollExpand>
  ));

  /* ---------- Nosotros: tarjetas que se intercambian ---------- */
  mount('cardswap', () => (
    <CardSwap
      items={['lona', 'letras', 'canvas', 'acrilicos', 'muebleria'].map(id => ({
        title: svc(id).title,
        image: `assets/img/c-${svc(id).img}.webp`,
        alt: svc(id).title
      }))}
      width={narrow ? 290 : 440}
      height={narrow ? 200 : 290}
      cardDistance={narrow ? 26 : 50}
      verticalDistance={narrow ? 30 : 56}
      delay={3800}
      theme={dark ? 'dark' : 'light'}
    />
  ));

  /* ---------- Catálogo: acordeón con secciones del catálogo ---------- */
  mount('accordion', () => (
    <AccordionGallery
      items={['granformato:gran-formato', 'letras:letras', 'viniles:viniles', 'muebleria:muebleria', 'acrilicos:acrilicos', 'promo:promocionales'].map(p => {
        const [img, id] = p.split(':');
        return { image: `assets/img/m-${img}.webp`, label: svc(id).title, link: `servicios/${id}.html`, alt: svc(id).title };
      })}
      defaultIndex={0}
      height={narrow ? 420 : 500}
      orientation={narrow ? 'vertical' : 'horizontal'}
      grayscale={false}
      overlayColor="#041f40"
      accentColor="#7cc8ee"
      trigger={finePointer ? 'hover' : 'click'}
    />
  ));

  /* ---------- Preguntas: líneas que siguen al cursor ---------- */
  if (finePointer) {
    mount('magnet', () => (
      <MagnetLines rows={20} columns={9} containerSize="100%" lineColor="var(--magnet)" lineWidth="2px" lineHeight="22px" baseAngle={-10} />
    ));
  }

  /* ---------- Páginas de servicio: Depth Carousel con los demás servicios ---------- */
  mount('depth', el => {
    const others = services.filter(s => s.id !== el.dataset.current);
    return (
      <DepthCarousel
        items={others.map(s => ({ image: `${BASE}assets/img/m-${s.img}.webp`, alt: s.title, title: s.title, href: `${BASE}servicios/${s.id}.html` }))}
        cardWidth={narrow ? 230 : 300}
        cardHeight={narrow ? 340 : 440}
        radius={22}
        tint="#041f40"
        autoplay
        autoplayDelay={3600}
      />
    );
  });

  /* ---------- Pie: "desarrollado por" en círculo ---------- */
  mount('circular', () => <CircularText text="DESARROLLADO POR ✦ ARI RAMOS ✦ " spinDuration={22} onHover="speedUp" />);

  /* ---------- Menú de arriba con Jelly Radio (solo escritorio) ---------- */
  function JellyNav({ links }) {
    const [value, setValue] = useState('');
    useEffect(() => {
      const on = e => setValue(e.detail || '');
      document.addEventListener('jp:section', on);
      return () => document.removeEventListener('jp:section', on);
    }, []);
    return (
      <JellyRadio
        items={links.map(l => ({ value: l.id, label: l.label }))}
        value={value}
        onChange={v => {
          setValue(v);
          const t = document.getElementById(v);
          if (!t) { window.location.href = `${BASE}index.html#${v}`; return; }
          if (t) t.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          history.replaceState(null, '', '#' + v);
        }}
        size="sm"
        gap={2}
        radius={999}
        chipColor="rgba(255,255,255,0)"
        activeColor="#ffffff"
        textColor="rgba(255,255,255,0.85)"
        activeTextColor="#062f5e"
        ariaLabel="Secciones de la página"
      />
    );
  }
  if (!narrow) {
    document.querySelectorAll('[data-jellynav]').forEach(el => {
      const links = [...el.querySelectorAll('a')].map(a => ({ id: a.getAttribute('href').replace(/^.*#/, ''), label: a.textContent.trim() }));
      const host = document.createElement('div');
      host.className = 'nav__jelly';
      el.after(host);
      el.classList.add('is-jelly');
      createRoot(host).render(<JellyNav links={links} />);
    });
  }
}
