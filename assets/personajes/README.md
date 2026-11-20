# Personajes gráficos

Esta carpeta contiene los personajes transparentes utilizados por la versión de
demostración:

- `vigilante.png`;
- `avatar-masculino.png`;
- `avatar-femenino.png`;
- `avatar-masculino-movimiento.png`;
- `avatar-femenino-movimiento.png`;
- `estudiante-proyecto.png`;
- `encargada-cafeteria.png`;
- `estudiante-triste.png`;
- `profie-matematicas.png`;
- `profie-programacion.png`;
- `profie-coordinador.png`.

Fueron generados como versiones de producción basadas en la lámina conceptual
aprobada `propuesta-avatares-v1.png`. Conservan los rasgos, accesorios, colores
y función narrativa de esa propuesta, pero eliminan el fondo y separan a cada
personaje para que Phaser pueda escalarlo de forma independiente.

El jugador puede elegir un avatar masculino o femenino. Ambos representan a
estudiantes universitarios mexicanos contemporáneos mediante tonos de piel,
cabello y rasgos naturales, sin utilizar vestimenta folclórica ni estereotipos.
La selección se utiliza en el mapa, las batallas, el perfil y el resumen final.
Cada protagonista cuenta con un spritesheet de doce cuadros: tres pasos hacia
abajo, tres hacia la izquierda, tres hacia la derecha y tres hacia arriba. Las
hojas miden 1086 × 1448 píxeles y se dividen en cuadros uniformes de 362 × 362.

Los objetos se toman de `assets/sprites/items-final.png`, la lámina gráfica
aprobada que Phaser divide en cuadros independientes.

Los prompts empleados se registran en `PROMPTS.md`.
