# Dulcident: reglas del proyecto

## Qué es

Landing de práctica de una clínica dental de gomita ficticia. Sirve para aprender a hacer páginas animadas en 3D al nivel de Gomident. Es una demo, no un producto: nada se envía ni se guarda.

## La vara

- Gomident (y la sandía de gelatina "Melon Jelly Knife") marcan el nivel mínimo, no el tema ni la técnica. Cada parte busca su propia sorpresa: física, partículas, shaders, tipografía, sonido.
- Investiga por dos caminos: lo conocido (Three.js, GSAP, Lenis, Rapier) y la "locura" (cómo lo haría alguien que escribe su propio motor).
- Simular, no fingir: si algo se puede tocar, que responda con física de verdad.

## Cómo trabajamos

- Modo ágil: ciclos cortos de construir, verlo en Chrome y corregir. Sin planes largos ni pruebas formales; es una demo.
- Primero la imagen, después el código: para un diseño nuevo, generar una referencia (por ejemplo en Gemini) y construir comparando contra ella.
- Probar ideas en ramas aparte y soltarlas rápido si no convencen.
- Hoy: escritorio y Chrome. La fase 9 suma celular, calidad adaptativa y "reducir movimiento".

## Técnica actual

- Módulos ES en `src/`. Funciona de dos formas: sin build (importmap a jsDelivr en `index.html`) o con Vite (`npm run dev`), que usa `node_modules`. Toda librería nueva va en las dos partes: `package.json` y el importmap.
- Se publica como enlace privado (artifact de Claude) subiendo `index.html` y `src/`.
- Plan por fases: 1 módulos, 2 scroll, 3 shaders y postpro, 4 física, 5 partículas, 6 tipografía, 7 entradas, 8 Supabase, 9 celular.
- Hero: la boca se arma con código (herradura matemática, dientes como esferas deformadas por tipo). La encía es una cadena de resortes. Los dientes sueltos tienen gravedad, rebote y choques simples. Pinchy y Dr. Drill son el cursor.
- Material de gomita: `MeshPhysicalMaterial` con transmisión, grosor y barniz, más `RoomEnvironment` para los reflejos.
- Sonido: Web Audio sintetizado en vivo; la encía cruje según la tensión del jalón.
- Escenario único: el lienzo de la boca es fijo y llena la ventana; las secciones pasan por encima, transparentes. Cada sección tiene `data-pose` y `src/core/stage.js` define dónde va la boca en cada una (posición, escala, giro, si se juega o si sirve de selector). Entre secciones la pose se mezcla según el scroll.
- Scroll suave con Lenis (`src/core/scroll.js`); si no carga, scroll nativo. La flecha de la muesca baja a la siguiente sección.
- En la reserva el diente se elige tocándolo en la boca 3D (evento `dulci:pick3d`).
- El equipo 3D vive en un segundo canvas transparente encima de la boca y solo dibuja cuando está a la vista.
- `src/core/devtools.js` muestra los errores en pantalla (dentro del enlace publicado no hay consola).

## Identidad

- Paleta: menta `#CFE6DA` / `#E3F1EA`, tinta `#24343A`, coral `#F2705F`, uva `#8F63E8`, menta viva `#2FB892`, limón `#F4C542`.
- Tipografías: Nunito (900 para titulares) y Lilita One para frases de caricatura.
- Personajes: Dr. Drill (taladro menta), Pinchy (fórceps rojo), Bristles (cepillo uva), Flossy (hilo dental limón con cola rosa). Ojos tipo calcomanía que siguen el cursor.
- Textos en español.

## Licencias

- Todo se hace en código o se genera con permiso de uso comercial. Nada con licencia no comercial.
- Lo que no tiene licencia (como el código de Melon Jelly o de Gomident) solo se describe, nunca se copia.

## Ideas pendientes

- Física de gelatina real con tetraedros (XPBD) en un Web Worker, como Gomident.
- Rehacer la forma de la boca: una sola pieza cerrada por los lados, bien abierta y vista un poco desde arriba.
- Cómo se hizo: corte de rayos X / tetraedros sobre media boca.
- La Mano: un manotazo con física que tumba dientes.
- Zoom con el pellizco del trackpad.
