# Solar Power Pat — demostración de asistente de WhatsApp

Página estática, un solo `index.html`, sin build. Reutiliza las fuentes de `../panama-dive-center/assets/fonts/`.
En el proyecto Vercel de ThryveX queda en `/solar-power-pat/` (rewrites ya añadidos en `vercel.json`). Lleva `noindex`.

## Qué es
No es un rediseño de su web. Es una demostración interactiva del producto principal para este tipo de cliente:
un asistente de WhatsApp que responde 24/7, pide la factura, precotiza, agenda la visita técnica y hace seguimiento.
El simulador del teléfono es un guion con ramas (casa/negocio, foto o monto, agendar / preguntas / lo pienso) y
un cálculo ilustrativo. Debajo aparece la "notificación" que recibiría Angelo con el lead calificado.

## Supuestos del cálculo (cambiar en `estimate()` si hace falta)
- Tarifa $0.22/kWh · 4.5 horas de sol pico · 80% de rendimiento · panel de 550 W
- Costo instalado de referencia: $1.20/W residencial, $1.10/W comercial, mostrado como rango ±10%
- Ahorro mostrado: 90% de la factura · Cuota: costo / 48 meses al 0%
Estos supuestos están declarados en la propia página, en letra pequeña, antes del cierre.

## Para reutilizarla con otro instalador solar (20 minutos)
1. Copiar la carpeta con el nombre del nuevo prospecto y añadir sus dos rewrites en `vercel.json`.
2. Buscar y reemplazar: "Solar Power Pat", "SP" (avatar), "6646-3171", "Angelo", "lunes a viernes de 8 a 5".
3. Ajustar las tres referencias propias de este prospecto: financiamiento 0%, Canadian Solar/Jinko, robot SolarCleano F1.
4. Cambiar los colores en `:root` si la marca lo pide (`--sun`, `--navy`).
5. Probar el flujo en el móvil antes de enviar.

## Datos que confirmar con el cliente si avanza
- Horario real de atención y horarios de visita técnica disponibles.
- Precios por vatio, marcas, condiciones del financiamiento 0% y bancos aliados.
- Zonas que cubren y tiempos del trámite de medición neta con ENSA / Naturgy.
- Si quieren el asistente también en Instagram y en la web, además de WhatsApp.
