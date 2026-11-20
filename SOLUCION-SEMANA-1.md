# Solución docente: avatar, movimiento y recolección

## Alcance

Esta solución resuelve únicamente el primer incremento del videojuego:

1. avatar cargado desde un spritesheet externo;
2. animaciones de caminar en cuatro direcciones con cuadros de 48 × 64 px;
3. movimiento con flechas y WASD;
4. velocidad uniforme al desplazarse en diagonal;
5. colisión contra edificios y límites;
6. recolección de objetos;
7. actualización del HUD y del inventario.
8. registro de nombre y carrera;
9. banco disciplinar de Matemáticas y una pregunta crítica de carrera.
10. persistencia en memoria de los objetos recogidos al cambiar de escena;
11. instrucciones narrativas posteriores a la batalla de Matemáticas.
12. efectos retro procedurales integrados en mapa, selección y combate.
13. spritesheet de diez objetos con cuadros de 32 × 32 px.

### Efectos retro

`RetroAudio` sintetiza cinco efectos con Web Audio:

- `beep()`: interacción e inventario;
- `coin()`: monedas;
- `hit()`: golpes en batalla;
- `confirm()`: selección, objetos y respuestas correctas;
- `alert()`: bloqueos, errores y respuestas incorrectas.

No se utilizan archivos externos. La música se reserva para la última semana.

El guardado y los dos combates finales continúan pendientes de forma
intencional.

### Selección de carrera y preguntas

`NameScene` ofrece Ingeniería Industrial y Sistemas y Tecnologías
Computacionales. La selección se almacena en `GAME_STATE.career` y el HUD la
muestra junto al nombre.

La batalla de Matemáticas toma sus preguntas normales de `matematicas.json`.
`BattleScene.prepareQuestions()` reserva además una sola pregunta de
`industrial.json` o `sistemas.json`, según la carrera. La inserta aleatoriamente
después de tres preguntas disciplinares y la marca como **Reto de carrera**.
Una respuesta correcta en ese reto produce daño doble.

La misma estructura queda preparada para Programación y para el Coordinador,
pero sus encuentros no se activan todavía en este incremento.

## Cambios respecto a la base del alumno

### 1. Movimiento activado

En `MapScene.update()` se ejecuta:

```js
this.movePlayer();
```

`update()` se ejecuta en cada cuadro. Por eso puede leer continuamente el
teclado y modificar la velocidad del cuerpo del jugador.

La función `movePlayer()` realiza el siguiente flujo:

```text
reiniciar velocidad
leer flechas o WASD
asignar velocidad y dirección
normalizar la diagonal
reproducir la animación
mostrar reposo cuando no existe movimiento
```

La operación:

```js
this.player.body.velocity.normalize().scale(speed);
```

evita que la combinación de dos ejes haga avanzar al avatar más rápido.

### 2. Recolección activada

En `MapScene.create()` se registró:

```js
this.physics.add.overlap(
  this.player,
  this.items,
  this.collectItem,
  null,
  this
);
```

`overlap` detecta la coincidencia entre el jugador y cualquier elemento del
grupo `items`. No separa los cuerpos ni bloquea el movimiento. Cuando detecta
el contacto, llama a `collectItem()`.

`collectItem()`:

1. consulta el identificador con `getData('itemId')`;
2. busca la definición en `ITEM_CATALOG`;
3. suma monedas y puntos o agrega el objeto al inventario;
4. desactiva el cuerpo y oculta el objeto;
5. actualiza el HUD;
6. muestra retroalimentación.

### 3. Spritesheets externos

`BootScene.preload()` carga dos archivos reales:

```js
this.load.spritesheet('student-sheet', 'assets/sprites/estudiante-base.png', {
  frameWidth: 48,
  frameHeight: 64
});
this.load.spritesheet('item-sheet', 'assets/sprites/objetos-base.png', {
  frameWidth: 32,
  frameHeight: 32
});
```

El avatar contiene cuatro filas direccionales y tres cuadros por fila. Las
animaciones se crean con `generateFrameNumbers()`. El cuadro central de cada
fila se utiliza como reposo, por lo que el personaje conserva la última
dirección al detenerse.

El spritesheet de objetos concentra moneda, billete, café, comida, laptop,
apuntes, formulario, código, oportunidad adicional y credencial. `addItem()`
convierte cada `itemId` en el número de cuadro correspondiente.

Las texturas procedurales se conservan solo para personajes secundarios. Los
tableros de `assets/referencias` sirven como inspiración y no se cargan como
spritesheets porque no tienen una cuadrícula uniforme.

## Secuencia recomendada de demostración

1. Ejecutar la base del alumno y comprobar que el avatar permanece inmóvil.
2. Mostrar `movePlayer()` sin modificarla.
3. Activar su llamada dentro de `update()`.
4. Probar las cuatro direcciones y una diagonal.
5. Cargar `estudiante-base.png` y `objetos-base.png` como spritesheets.
6. Crear las cuatro animaciones con los rangos de cuadros.
7. Sustituir el avatar y mapear los objetos.
8. Comparar el spritesheet con los tableros conceptuales.
9. Activar `overlap` en la base del alumno.
10. Recoger una moneda, revisar el HUD y abrir el inventario.
11. Ejecutar los casos de prueba finales.

No mostrar el código de guardado ni activar los encuentros posteriores.

## Pruebas de aceptación

| Caso | Pasos | Resultado esperado |
|---|---|---|
| Movimiento horizontal | Presionar izquierda y derecha | El avatar se desplaza y cambia de animación |
| Movimiento vertical | Presionar arriba y abajo | El avatar se desplaza y cambia de animación |
| Diagonal | Presionar dos direcciones | La velocidad no aumenta |
| Reposo | Soltar todas las teclas | La animación se detiene en el cuadro central |
| Recurso externo | Revisar la pestaña Red del navegador | Los dos PNG responden sin errores 404 |
| Objetos gráficos | Observar moneda, billete y apuntes | Cada elemento usa el cuadro correcto del spritesheet |
| Edificio | Caminar contra una pared | El jugador no atraviesa el edificio |
| Moneda | Tocar una moneda | Desaparece y suma una sola vez |
| Billete | Tocar el billete | Suma cinco créditos |
| Apuntes | Tocar los apuntes y abrir inventario | El objeto aparece en el inventario |
| Matemáticas | Interactuar en la biblioteca | Inicia la batalla de referencia |
| Carrera | Iniciar dos partidas con elecciones distintas | El HUD y el reto crítico corresponden a la selección |
| Banco disciplinar | Revisar las preguntas normales | Proceden de Matemáticas |
| Ataque crítico | Resolver tres preguntas y acertar el reto de carrera | Aparece como cuarta pregunta y causa daño doble |

## Evidencia docente

- captura del avatar moviéndose;
- captura del inventario con los apuntes;
- captura del HUD después de recoger monedas;
- respaldo de esta carpeta completa.

