# Dulcident

Landing de práctica de una clínica dental de gomita ficticia, inspirada en el método con el que se hizo Gomident. Todo vive en un solo archivo: `index.html`.

## Qué hay

- **Hero jugable**: boca de gomita en 3D (Three.js). Pinchy, el fórceps, es el cursor. Agarra un diente, menéalo y jala: sale con hilo de encía, gotas de jarabe, moneda del hada y una frase. Dr. Drill aparece solo sobre las caries.
- **Equipo**: Dr. Drill, Pinchy, Bristles y Flossy en 3D, con ojos que siguen el cursor.
- **Reseñas**, **Cómo está hecho**, **Reserva** con selector de diente y ticket, y **footer** con letras de gomita.
- Sonido sintetizado en vivo con Web Audio, sin archivos.

## Cómo verlo

La forma más fácil: abre el enlace privado de Dulcident que te pasó Claude.

En tu PC necesitas un servidor local (los módulos no abren con doble clic). Con Node.js instalado, en esta carpeta:

```
npx serve .
```

O, para trabajar con recarga instantánea:

```
npm install
npm run dev
```

La página necesita internet para las fuentes de Google y, en modo sin build, para Three.js desde jsDelivr.

## Seguir trabajando con Claude Code

Abre una terminal en esta carpeta y escribe `claude`. El archivo `CLAUDE.md` le explica el proyecto y las reglas.

## Dónde está cada cosa

| Parte | Archivo |
| --- | --- |
| Estructura y textos | `index.html` |
| Colores, tipografías y estilos | `src/styles.css` (bloque `:root` al inicio) |
| Orden de arranque | `src/main.js` |
| Sonido sintetizado | `src/core/sound.js` |
| Boca 3D, física, pinzas y taladro | `src/hero/hero.js` |
| Equipo 3D | `src/team/team.js` |
| Reseñas | `src/page/reviews.js` |
| Selector de diente, formulario y ticket | `src/page/booking.js` |
| Letras de gomita del footer | `src/page/footer.js` |

## Números para afinar el juego

En `src/hero/hero.js`:

- `const T = .62 - .4 * t.loose;`: qué tanto hay que jalar un diente para que salga.
- `t.loose + Math.min(latSpeed, 3) * h * .26`: qué tan rápido se afloja al menearlo.
- Resortes de la encía (`* 70`, `* 95`, `* 7.5`): firmeza y rebote de la gelatina.
- `PHRASES`: las frases sarcásticas.
- `CAVITY`: qué dientes tienen caries.
