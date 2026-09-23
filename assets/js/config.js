/* ==========================================================
   Just Print — DATOS EDITABLES
   Cambia aquí los datos reales; no hace falta tocar nada más.
   Si dejas un campo vacío (""), se oculta de la página.
   ========================================================== */

const CONFIG = {
  phoneLabel: "+504 3392-4640",   // como se muestra
  phone: "50433924640",           // solo números, para el enlace de llamada
  email: "jfigueroa@justprinthn.com",
  hours: "Lun–Vie · 8:00 a.m. – 5:00 p.m. · Sáb 8:00 a.m. – 12:00 p.m.",

  // Ubicación (el mapa ya apunta a tu enlace de Google Maps)
  address: "Col. Universidad, 20 calle A, 8 avenida, San Pedro Sula, Honduras",
  mapsLink: "",
  mapsLat: 15.525042511167925,
  mapsLng: -88.02513127849124
};

/* Redes sociales (salen en el pie de página). Si dejas un enlace vacío (""),
   el ícono se ve pero no lleva a ningún lado. */
const SOCIAL = {
  facebook: "https://www.facebook.com/justprinthn/",
  instagram: "https://www.instagram.com/justprint.hn/"
};

/* Preguntas frecuentes: 10 EJEMPLOS. Reemplaza las respuestas por las reales. */
const FAQS = [
  {
    q: "¿Qué servicios ofrece Just Print?",
    a: "Diseño gráfico, impresión en pequeño y gran formato, lonas, viniles y rotulación vehicular, canvas, impresión offset, letras encajueladas, estructuras metálicas, mueblería, acrílicos, centro de copiado, displays publicitarios y artículos promocionales."
  },
  {
    q: "¿Atienden a nivel nacional?",
    a: "Sí. Atendemos en todo Honduras, tanto para la producción como para la instalación de tus proyectos."
  },
  {
    q: "¿Cómo pido una cotización?",
    a: "Llámanos o escríbenos por correo indicando qué necesitas, medidas y cantidades aproximadas. Te responderemos con una propuesta."
  },
  {
    q: "¿Cuánto tarda un trabajo?",
    a: "Depende del tipo de trabajo, de la cantidad y del acabado. Cuando cotizamos te damos una fecha estimada de entrega."
  },
  {
    q: "¿En qué formato debo enviar mi diseño?",
    a: "Lo ideal es un archivo vectorial (PDF, AI) o una imagen en alta resolución. Si no tienes el diseño listo, nuestro departamento de diseño puede ayudarte."
  },
  {
    q: "¿Ofrecen servicio de diseño gráfico?",
    a: "Sí. Contamos con un departamento de diseño para crear, adaptar y evolucionar la imagen de tu marca."
  },
  {
    q: "¿Hacen la instalación de los rótulos y vinilos?",
    a: "Sí. Contamos con equipo de producción y acabados con amplia experiencia, con servicio de instalación a nivel nacional."
  },
  {
    q: "¿Hay una cantidad mínima de pedido?",
    a: "Depende del producto. Escríbenos con lo que necesitas y te indicamos las cantidades disponibles."
  },
  {
    q: "¿Qué formas de pago aceptan?",
    a: "Te confirmamos las formas de pago disponibles al momento de enviarte la cotización."
  },
  {
    q: "¿Puedo pedir un trabajo urgente?",
    a: "Podemos revisar tu caso. Cuéntanos la fecha límite en tu solicitud y te decimos si es posible cumplirla."
  }
];

/* Galería "Nuestro trabajo" (desliza de lado al hacer scroll).
   img = archivo dentro de assets/img · service = id del servicio (enlaza a su página).
   Puedes agregar tus propias fotos: súbelas a assets/img/ y añade una línea. */
const GALLERY = [
  { img: "g-lona-back.webp",        title: "Lona backlight",            service: "lona" },
  { img: "g-lona-front.webp",       title: "Lona frontlight",           service: "lona" },
  { img: "c-viniles.webp",          title: "Rotulación vehicular",      service: "viniles" },
  { img: "g-letras-luz.webp",       title: "Encajuelado con luz",       service: "letras" },
  { img: "g-letras-metal.webp",     title: "Encajuelados metálicos",    service: "letras" },
  { img: "g-letras-pvc.webp",       title: "Encajuelados en PVC",       service: "letras" },
  { img: "g-canvas-foto.webp",      title: "Canvas con fotografías",    service: "canvas" },
  { img: "c-acrilicos.webp",        title: "Señalética en acrílico",    service: "acrilicos" },
  { img: "g-acrilico-trofeos.webp", title: "Placas y trofeos",          service: "acrilicos" },
  { img: "g-mueble-tienda.webp",    title: "Muebles para tiendas",      service: "muebleria" },
  { img: "c-offset.webp",           title: "Impresión offset",          service: "offset" },
  { img: "g-copiado-carnet.webp",   title: "Carnets y credenciales",    service: "copiado" },
  { img: "c-display.webp",          title: "Roll-up publicitario",      service: "display" },
  { img: "c-promo.webp",            title: "Promocionales",             service: "promocionales" }
];

/* Clientes (logos o nombres) y testimonios: vacíos por ahora.
   Mientras estén vacíos, esas secciones NO aparecen en la página.
   CLIENTS:      [{ name: "Empresa S.A.", logo: "assets/img/clientes/empresa.png" }]  (logo es opcional)
   TESTIMONIALS: [{ text: "Excelente servicio…", name: "Nombre", role: "Cargo, Empresa" }]        */
const CLIENTS = [];
const TESTIMONIALS = [];
