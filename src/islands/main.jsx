/* ==========================================================
   Just Print — islas de React
   Cada componente de React Bits se monta en un espacio del HTML marcado con
   data-island="…". Lo que hay dentro de ese espacio en el HTML es la versión sin
   JavaScript: si algo falla (o el navegador no tiene WebGL), se deja tal cual.
   Los datos vienen de config.js y data.js (SERVICES, GALLERY, CONFIG), que la
   página carga antes que este archivo.
   ========================================================== */
import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import InfiniteSpiral from './reactbits/InfiniteSpiral.jsx';
import CircularCarousel from './reactbits/CircularCarousel.jsx';
import MorphSlider from './reactbits/MorphSlider.jsx';
import HoldButton from './reactbits/HoldButton.jsx';
import './islands.css';

/* global SERVICES, GALLERY, CONFIG */
const services = typeof SERVICES !== 'undefined' ? SERVICES : [];
const gallery = typeof GALLERY !== 'undefined' ? GALLERY : [];
const config = typeof CONFIG !== 'undefined' ? CONFIG : {};
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Si un componente falla, se vuelve a mostrar el contenido original del HTML
class Fallback extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn('[Just Print] Se usó la versión simple de un componente:', error);
  }
  render() {
    return this.state.failed ? <div dangerouslySetInnerHTML={{ __html: this.props.html }} /> : this.props.children;
  }
}

function mount(name, render) {
  document.querySelectorAll(`[data-island="${name}"]`).forEach(el => {
    const html = el.innerHTML;
    el.classList.add('is-island');
    createRoot(el).render(
      <StrictMode>
        <Fallback html={html}>{render(el)}</Fallback>
      </StrictMode>
    );
  });
}

/* ---------- Inicio: espiral infinita con los 12 servicios ----------
   En táctil solo gira sola (arrastrarla bloquearía el scroll de la página);
   con mouse también se arrastra y acompaña al scroll. */
mount('spiral', () => (
  <InfiniteSpiral
    items={services.map(s => ({
      id: s.id,
      src: `assets/img/t-${s.img}.webp`,
      alt: s.title,
      label: `${s.title}: ver servicio`,
      href: `servicios/${s.id}.html`
    }))}
    animationMode={finePointer ? 'all' : 'auto'}
    speed={0.32}
    radius={210}
    cardWidth={132}
    cardHeight={205}
    verticalSpacing={62}
    cardsPerTurn={8}
    centerScale={1.12}
    cardRadius={14}
    edgeFade={0.38}
    edgeBlur={4}
    perspective={1100}
    ariaLabel="Nuestros servicios en espiral"
  />
));

/* ---------- Servicios: carrusel circular ----------
   Tocar una foto de atrás la trae al frente; tocar la del frente (o Enter) abre el detalle. */
mount('services', el => {
  let active = 0;
  return (
    <CircularCarousel
      items={services.map(s => ({ id: s.id, src: `assets/img/c-${s.img}.webp`, alt: s.title, title: s.title, subtitle: s.sub }))}
      preset="cylinder"
      intro="rise"
      cardWidth={320}
      aspectRatio={1.96}
      gap={30}
      autoplay="drift"
      speed={9}
      momentum={0.55}
      parallax={0.25}
      depthFade={0.6}
      fadeColor="var(--carousel-fade)"
      innerShade={0.55}
      cornerRadius={18}
      captions
      ariaLabel="Servicios de Just Print"
      onChange={i => {
        active = i;
      }}
      onItemClick={(item, i) => {
        if (i === active && typeof window.openSheet === 'function') window.openSheet(item.id, el);
      }}
    />
  );
});

/* ---------- Nuestro trabajo: galería que se derrite de una foto a otra (WebGL) ---------- */
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}
if (hasWebGL()) {
  const title = document.querySelector('[data-work-title]');
  const tag = document.querySelector('[data-work-tag]');
  const link = document.querySelector('[data-work-link]');
  const showSlide = i => {
    const g = gallery[i];
    if (!g) return;
    const s = services.find(x => x.id === g.service);
    if (title) title.textContent = g.title;
    if (tag) tag.textContent = s ? s.title : '';
    if (link) link.href = `servicios/${g.service}.html`;
  };
  showSlide(0);
  mount('work', () => (
    <MorphSlider
      items={gallery.map(g => ({ image: `assets/img/${g.img}`, caption: g.title }))}
      transition="melt"
      duration={1.15}
      intensity={0.5}
      drift={0.3}
      aberration={0.25}
      autoplay
      autoplayDelay={5}
      radius={28}
      overlayColor="#020b17"
      showCaptions={false}
      ariaLabel="Galería de trabajos realizados"
      onIndexChange={showSlide}
    />
  ));
}

/* ---------- Catálogo: mantener presionado para pedirlo por correo ---------- */
const mailIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 8l9 6 9-6" />
  </svg>
);
const checkIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
mount('hold', () => {
  const email = config.email || 'jfigueroa@justprinthn.com';
  const subject = encodeURIComponent('Solicitud del catálogo 2026');
  const body = encodeURIComponent('Hola, me gustaría recibir el catálogo 2026 de Just Print.\n\nNombre:\nEmpresa:\nTeléfono:');
  return (
    <HoldButton
      icon={mailIcon}
      doneIcon={checkIcon}
      doneLabel="Abriendo tu correo"
      backgroundColor="#ffffff"
      fillColor="#1b74a8"
      textColor="#062f5e"
      fillTextColor="#ffffff"
      size="lg"
      radius={999}
      holdTime={1300}
      resetAfter={2400}
      hint="Mantén presionado un segundo para escribirnos y pedir el catálogo"
      onHold={() => {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }}
      onTap={() => {
        if (typeof window.toast === 'function') window.toast('Mantén presionado el botón para pedirlo');
      }}
    >
      Mantén para pedir el catálogo
    </HoldButton>
  );
});
