# Dulcident

Landing de práctica de una clínica dental de gomita ficticia, inspirada en el método con el que se hizo Gomident. Todo vive en un solo archivo: `index.html`.

## Qué hay

- **Hero jugable**: boca de gomita en 3D (Three.js). Pinchy, el fórceps, es el cursor. Agarra un diente, menéalo y jala: sale con hilo de encía, gotas de jarabe, moneda del hada y una frase. Dr. Drill aparece solo sobre las caries.
- **Equipo**: Dr. Drill, Pinchy, Bristles y Flossy en 3D, con ojos que siguen el cursor.
- **Reseñas**, **Cómo está hecho**, **Reserva** con selector de diente y ticket, y **footer** con letras de gomita.
- Sonido sintetizado en vivo con Web Audio, sin archivos.

## Cómo verlo

Opción rápida: abre `index.html` con Chrome (doble clic).

Opción recomendada, con un servidor local (evita problemas de caché y se parece más a producción):

```
npx serve .
```

Luego abre la dirección que aparece (normalmente http://localhost:3000). Necesitas Node.js instalado.

La página necesita internet: carga Three.js desde jsDelivr y las fuentes Nunito y Lilita One desde Google Fonts.

## Seguir trabajando con Claude Code

Abre una terminal en esta carpeta y escribe `claude`. El archivo `CLAUDE.md` le explica el proyecto y las reglas.

## Dónde está cada cosa en `index.html`

| Parte | Dónde buscar |
| --- | --- |
| Colores y tipografías | Bloque `:root` al inicio del `<style>` |
| Textos del hero y secciones | HTML después del `<style>` |
| Reseñas, selector de diente, formulario, footer | Primer `<script>` (normal) |
| Boca 3D, física, sonido, pinzas y taladro | Primer `<script type="module">` |
| Equipo 3D | Segundo `<script type="module">` |

## Números para afinar el juego

En el módulo de la boca:

- `const T = .62 - .4 * t.loose;`: qué tanto hay que jalar un diente para que salga.
- `t.loose + Math.min(latSpeed, 3) * h * .26`: qué tan rápido se afloja al menearlo.
- Resortes de la encía (`* 70`, `* 95`, `* 7.5`): firmeza y rebote de la gelatina.
- `PHRASES`: las frases sarcásticas.
- `CAVITY`: qué dientes tienen caries.
