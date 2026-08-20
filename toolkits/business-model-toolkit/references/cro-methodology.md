# Metodologia CRO para Landing Pages SaaS

## Triangulo Invertido (What / Why / How)

Divide la pagina en tres bloques fundamentales con colores de fondo distintos para evitar monotonia visual:

### BLOQUE 1: THE WHAT (Above the Fold)
- Titulo llamativo en negrita + subtitulo que resuma la oferta de un vistazo
- Espacio para video explicativo o imagen aspiracional donde el usuario objetivo se identifique
- Boton CTA claramente visible que no se corte en la pantalla inicial
- Barra superior persistente con mensaje persuasivo o urgencia real (no contadores falsos)

### BLOQUE 2: THE WHY (Generar Deseo)
- Describir la oferta como solucion empaquetada, no como software
- Detallar beneficios clave y segmentar "Para quien es?"
- Intercalar franjas con mensajes persuasivos ("mantras") entre secciones

### BLOQUE 3: THE HOW (Impulso a la Accion)
- Proceso de implementacion paso a paso
- Precio/oferta con resumen claro (o oculto si es B2G/enterprise)
- Prueba social de alta autoridad: testimonios, logos, numeros de impacto
- FAQ para resolver dudas y refrasear beneficios
- Garantia de cumplimiento + CTA final con presion

## Secuencia Emocional

El landing recorre tres emociones en orden de prioridad:

1. **Miedo** (incumplimiento, perdida, riesgo) -- captura atencion
2. **Verguenza** (deficiencia visible, comparacion con competencia) -- profundiza dolor
3. **Aspiracion** (ser referente, destacar, liderar) -- ofrece la salida

Esta secuencia mapea directamente a What/Why/How.

## Directrices de Diseno

### Botones CTA
- Color complementario que resalte sobre el fondo (nunca el mismo color que los titulos)
- Repetir el CTA principal minimo 3 veces en la pagina (hero, video, cierre)
- Texto orientado a accion: "Agendar demo", "Solicitar propuesta", no "Enviar" o "Contactar"

### Tipografia
- Fuentes legibles (sans-serif para cuerpo)
- Prohibido color gris para parrafos largos
- Evitar textos pequenos que obliguen a zoom

### Navegacion
- Minima: solo logo + CTA en header
- "Botones de salto" en "Para quien es?" que lleven al bloque de precio/proceso
- Sin menu complejo que distraiga de la conversion

### Repeticion
- El mensaje clave no se menciona una sola vez: repetir en hero, mantras, FAQ, CTA final
- Cada seccion refuerza el dolor → solucion → accion

## Mecanismos de Urgencia por Tipo de Audiencia

### B2G (Gobierno)
- Regulacion/legislacion vigente ("Ley X obliga a...")
- Ciclo presupuestario ("Presupuestos 2027 cierran en...")
- Cupo limitado de onboarding (real, no artificial)
- NUNCA contadores falsos -- los funcionarios publicos detectan manipulacion

### B2B (Empresas)
- ROI cuantificable ("Ahorre X horas/semana")
- Caso de exito con metricas ("Empresa Y redujo Z en 30 dias")
- Integracion limitada por temporada
- Early adopter pricing

### B2B2C (Plataforma/Marketplace)
- Impacto en el usuario final: "Sus [clientes/ciudadanos] merecen mejor [servicio]"
- Regulacion que obliga al intermediario a mejorar la experiencia del consumidor
- Competencia que ya digitalizo su relacion con el consumidor
- Metricas duales: impacto en el negocio + impacto en el usuario final

### B2C (Consumidor)
- Escasez real de producto/servicio
- Social proof masivo (numero de usuarios, reviews)
- Oferta por tiempo limitado (si es real)
- Comparacion directa con alternativas

## Estructura de 12 Secciones

Toda landing page generada por este toolkit sigue esta estructura base. Las secciones se adaptan segun audiencia:

| # | Seccion | Fondo | Proposito |
|---|---------|-------|-----------|
| 1 | Barra de urgencia | Color de alerta | Capturar atencion, establecer presion |
| 2 | Hero (Above the Fold) | Oscuro | Titulo + subtitulo + CTA principal |
| 3 | Mantra 1 | Calido/contraste | Transicion, reforzar dolor |
| 4 | Problemas / Soluciones | Blanco | Mostrar realidad actual vs solucion |
| 5 | "Para quien es?" | Claro/suave | Segmentar, botones de salto |
| 6 | Mantra 2 | Oscuro | Transicion, reforzar necesidad |
| 7 | Proceso (3 pasos) | Blanco | Mostrar simplicidad de implementacion |
| 8 | Prueba social | Gris claro | Logos, testimonios, numeros |
| 9 | Video | Oscuro | Demo visual, CTAs duales |
| 10 | FAQ | Blanco | Resolver objeciones, refrasear beneficios |
| 11 | CTA final | Oscuro | Cierre con garantia |
| 12 | Footer | Muy oscuro | Legal, contacto, redes |

## Tracking y Medicion

Toda landing debe incluir:
1. Google Analytics 4 con eventos custom: `cta_click`, `scroll_depth`, `faq_expand`
2. Pixeles de retargeting (Facebook Pixel + Google Ads)
3. Heatmaps (Hotjar o Smartlook)
4. UTM tracking en todas las URLs de campana
5. OG tags para compartir en redes/WhatsApp

## Stack Tecnico Recomendado

| Audiencia | Framework | Hosting | Razon |
|-----------|-----------|---------|-------|
| B2G | Astro (Bigspring Light) | Cloudflare Workers | SSG, 95+ PageSpeed, edge |
| B2B | Astro o Next.js | Vercel | SSG/SSR, analytics integrado |
| B2B2C | Astro o Next.js | Cloudflare Workers o Vercel | SSG, dual audience |
| B2C | Next.js | Vercel | SSR para personalizacion, A/B testing |
