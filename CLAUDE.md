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
- Solo escritorio y Chrome. En pantallas chicas el hero muestra un aviso; el resto de la página sí funciona.

## Técnica actual

- Un solo archivo `index.html`. Three.js 0.169 desde jsDelivr con importmap. Sin build.
- Hero: la boca se arma con código (herradura matemática, dientes como esferas deformadas por tipo). La encía es una cadena de resortes. Los dientes sueltos tienen gravedad, rebote y choques simples. Pinchy y Dr. Drill son el cursor.
- Material de gomita: `MeshPhysicalMaterial` con transmisión, grosor y barniz, más `RoomEnvironment` para los reflejos.
- Sonido: Web Audio sintetizado en vivo; la encía cruje según la tensión del jalón.
- El equipo 3D vive en un segundo canvas que solo dibuja cuando está a la vista. La boca se pausa al salir de vista.

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
- Una sola boca que viaje con el scroll por todas las secciones (mover la cámara hacia un ancla por sección).
- La Mano: un manotazo con física que tumba dientes.
- Zoom con el pellizco del trackpad.
