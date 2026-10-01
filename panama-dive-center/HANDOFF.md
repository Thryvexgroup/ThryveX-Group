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

## Fotografías: qué hay ahora y qué debe sustituirse
Las fotos actuales son **sustitutas con licencia Creative Commons BY 2.0** (Open Images /
Flickr), elegidas por especie y atmósfera. No son de Coiba: el martillo es de un acuario, la
"isla del parque" está en Nueva Zelanda. Sirven para vender el diseño, no para publicar.
Los créditos están en el pie y en `assets/img/credits.json`; si alguna se mantiene, el
crédito debe quedarse. Resolución máxima de origen: 1024 px, por eso el hero se ve algo
suave en pantallas grandes.

Para publicar, sustituir por fotos del propio centro con el mismo nombre de archivo:

| Archivo | Dónde aparece | Qué foto | Tamaño |
|---|---|---|---|
| `hero.jpg` | Fondo del hero | Pelágico o cardumen con sol arriba, sujeto a la derecha | 2400×1350 |
| `fauna-martillo.jpg`, `fauna-ballena.jpg`, `fauna-puntablanca.jpg`, `fauna-tortuga.jpg`, `fauna-arrecife.jpg` | Tira "Lo que puedes ver" | Una especie por foto, encuadre cuadrado | 800×800 |
| `coiba-aerial.jpg` | Por qué Coiba, grande | Granito de Oro o Coiba desde el aire | 1600×1000 |
| `hammerheads.jpg` | Por qué Coiba, pequeña | Martillos en Contreras | 1200×750 |
| `boat.jpg` | Salidas | La lancha saliendo de Santa Catalina, o delfines en el cruce | 1600×600 |
| `course-training.jpg` | Cursos | Instructor con alumnos en Granito de Oro | 1200×800 |
| `season.jpg` | Temporada | Tiburón ballena o jorobada | 1200×800 |
| `team.jpg` | Nosotros | El equipo frente a la tienda | 960×1200, vertical |

Opcional: `assets/media/hero.mp4`, clip de 10 a 20 s, 1920×1080, sin audio, menos de 6 MB.
Se funde sobre la foto del hero.

Fuente: el Instagram y Facebook del centro (con su permiso), o grabar en el viaje con GoPro
a 4K/30 con filtro rojo. Guardar como JPG calidad 80.

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
