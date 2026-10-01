# Panama Dive Center — concepto de rediseño

Sitio estático, sin build. Abre `index.html` o despliega la carpeta en cualquier host.
En el proyecto Vercel de ThryveX queda en `/panama-dive-center/`.

## Concepto
La página es un descenso. El océano WebGL detrás de todo empieza en la superficie
(rayos de sol, cáusticas) y se oscurece hasta los 40 m en la sección de reserva.
La lectura de profundidad en la barra y la línea bajo ella son la única firma. Las
secciones claras (salidas, cursos, temporada, opiniones, preguntas) son paneles opacos;
las oscuras (Coiba, sitios, nosotros, reserva) dejan ver el mar.

Idioma principal: español. Inglés con el conmutador ES/EN (se recuerda).
Tipografía: Plus Jakarta Sans (títulos), Inter (texto), JetBrains Mono (solo la profundidad).

## Fotos reales: dónde van
Cada ranura se activa sola cuando el archivo existe en `assets/img/`. Si falta, se oculta.

| Archivo | Dónde aparece | Qué foto | Formato |
|---|---|---|---|
| `hero.jpg` | Fondo del hero | Tiburón ballena o cardumen con rayos de sol arriba | 2400×1350, horizontal |
| `coiba-aerial.jpg` | Por qué Coiba, grande | Isla Coiba o Granito de Oro desde el aire | 1800×1125 |
| `hammerheads.jpg` | Por qué Coiba, pequeña | Martillos en azul (Contreras) | 1200×750 |
| `boat.jpg` | Salidas, sobre el itinerario | La lancha saliendo de la playa de Santa Catalina | 2000×760, panorámica |
| `course-training.jpg` | Cursos, banda superior | Instructor con alumnos en aguas someras | 2000×760, panorámica |
| `team.jpg` | Nosotros, izquierda | El equipo frente a la tienda | 1200×1500, vertical |

Opcional: `assets/media/hero.mp4`, clip de 10 a 20 s, 1920×1080, sin audio, menos de 6 MB.
Se funde detrás del hero y desaparece al bajar.

Fuente de las fotos: el Instagram y Facebook del centro (con su permiso), o grabar en el
viaje con GoPro a 4K/30 con filtro rojo. Guardar como JPG calidad 80.

## Datos que confirmar con el centro antes de publicar
- Precios: salida de 2 inmersiones $155, 3 inmersiones $185, Divemaster $1,680 y
  Open Water Referido $380 salen de su propio Rezdy. Discover Scuba $170, Open Water $550
  y Advanced $550 vienen de listados de terceros.
- Rescue y Tec se muestran como "Consúltanos".
- Horarios del itinerario, ratios (4:1), equipo de seguridad, horario y dirección están
  escritos como un buen punto de partida y necesitan el visto bueno del dueño.
- Las tres opiniones llevan la etiqueta "Ejemplo" y deben sustituirse por reseñas reales de
  Tripadvisor. El 5.0 es ilustrativo.
- Los enlaces sociales del pie apuntan a las portadas de cada plataforma hasta tener los
  perfiles reales.
- Productos Rezdy enlazados: salida diaria 74187, OW referido 202878, Divemaster 56423.

## Nota de venta
No les faltan reservas. El argumento es: la web actual les hace parecer la opción barata
cuando son el centro 5 estrellas. Este sitio vende cursos, Divemaster y el día premium,
responde por adelantado las preguntas de WhatsApp y funciona en español e inglés.
Enséñalo en el móvil entre inmersiones.
