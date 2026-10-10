/* ==========================================================
   Just Print — animaciones con GSAP (todas las páginas)
   Mejora progresiva: si GSAP no carga, o la persona pidió
   "reducir movimiento" en su sistema, la página funciona igual
   que antes con las transiciones de CSS.
   ========================================================== */
(function motion() {
  if (typeof gsap === "undefined" || reduceMotion) return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Desde que GSAP toma un elemento, el CSS ya no debe animar su "transform" (si no, cada cuadro
  // de GSAP dispara una transición de CSS y el movimiento se siente pesado). Se hace al primer
  // hover para no cortar la animación de entrada (.reveal) que también usa transform.
  const OWN = "background-color .3s, color .3s, border-color .3s, box-shadow .5s, opacity .3s";
  function takeOver(el) {
    el.addEventListener("pointerenter", () => { el.style.transition = OWN; }, { once: true });
  }

  /* ---------- botones magnéticos: siguen un poco al cursor y regresan suave ----------
     Sin rebote al soltar: según Apple, el rebote solo se justifica después de un gesto con impulso. */
  function magnetic(el, strength = .28, max = 9) {
    takeOver(el);
    const toX = gsap.quickTo(el, "x", { duration: .45, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: .45, ease: "power3.out" });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      toX(clamp((e.clientX - r.left - r.width / 2) * strength, -max, max));
      toY(clamp((e.clientY - r.top - r.height / 2) * strength, -max, max));
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, scale: 1, duration: .5, ease: "power3.out", overwrite: "auto" });
    });
    press(el, .96);
  }

  // Respuesta al presionar (el CSS :active no aplica cuando GSAP controla el transform del elemento)
  function press(el, s = .97) {
    el.addEventListener("pointerdown", () => gsap.to(el, { scale: s, duration: .1, ease: "power2.out" }));
    const up = () => gsap.to(el, { scale: 1, duration: .35, ease: "power3.out" });
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  /* ---------- tarjetas 3D: se inclinan hacia el cursor con un brillo que lo sigue ----------
     (el mismo efecto que el "3D Card" / "Glare Card" de Aceternity UI, hecho sin React) */
  function tilt(el, max = 6, lift = -6) {
    takeOver(el);
    gsap.set(el, { transformPerspective: 900, transformOrigin: "center" });
    const rx = gsap.quickTo(el, "rotationX", { duration: .6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: .6, ease: "power3.out" });
    el.addEventListener("pointerenter", () => gsap.to(el, { y: lift, duration: .5, ease: "power3.out", overwrite: "auto" }));
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      ry((px - .5) * 2 * max);
      rx((.5 - py) * 2 * max);
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", () => {
      rx(0); ry(0);
      gsap.to(el, { y: 0, scale: 1, duration: .7, ease: "power3.out", overwrite: "auto" });
    });
    press(el);
  }

  if (finePointer) {
    $$(".btn, .arrow-btn, .social").forEach(el => magnetic(el));
    $$(".card").forEach(el => tilt(el, 5));
    $$(".tile").forEach(el => tilt(el, 3, -4));
    $$(".pager__a").forEach(el => tilt(el, 3, -4));
  }

  if (typeof ScrollTrigger === "undefined") return;

  /* ---------- animaciones ligadas al scroll ---------- */
  // Proceso: la foto se desplaza un poco más lento que la página (profundidad).
  if ($(".process__media")) {
    gsap.fromTo(".process__media", { yPercent: 5 }, {
      yPercent: -5, ease: "none",
      scrollTrigger: { trigger: ".process", start: "top bottom", end: "bottom top", scrub: .6 }
    });
  }
  /* ---------- Proceso: el número del paso entra deslizándose ---------- */
  document.addEventListener("jp:step", () => {
    const n = $("[data-step-count]");
    if (n) gsap.fromTo(n, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .45, ease: "power3.out" });
  });

  // Las fotos cargan sin alto fijo en algunos bloques: recalcular posiciones cuando todo cargó.
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
