# Guía docente: solución del segundo incremento

## Propósito

El juego ya permite explorar, recoger objetos y enfrentar al Profie de
Matemáticas. En este incremento el alumno debe comprender que el estado de una
partida puede convertirse a texto JSON, almacenarse en el navegador y
recuperarse para continuar exactamente donde se quedó.

## Resultado observable

Al finalizar la demostración, se puede:

1. registrar nombre y carrera;
2. mover al personaje y obtener monedas u objetos;
3. guardar únicamente al interactuar con el Vigilante y confirmar;
4. recargar el navegador;
5. continuar con la misma posición, inventario, puntos y progreso;
6. consultar las estadísticas con `P`;
7. comenzar una partida nueva con confirmación.

## Cambios principales

Cada bloque resuelto está marcado directamente en JavaScript con comentarios
`DONE SEMANA 2.x`. Las soluciones gráficas heredadas se identifican con
`DONE SEMANA 1`.

### 1. Estado reiniciable

`game-state.js` conserva una copia profunda del estado inicial. La función
`resetGameState()` restaura valores nuevos sin reemplazar el objeto compartido,
por lo que las escenas siguen consultando la misma referencia.

### 2. Servicio de guardado

`save-service.js` implementa cuatro operaciones:

- `save()`: convierte el estado a JSON y lo guarda;
- `load()`: recupera, valida y combina los datos con los valores base;
- `clear()`: elimina el guardado;
- `newGame()`: elimina el guardado y restablece el estado.

La clave utilizada es `ultimaAsesoriaMortalSaveV2`. El número de versión
facilita reconocer cambios futuros en la estructura.

### 3. Continuar o iniciar de nuevo

`name-scene.js` comprueba si existe una partida. Si la encuentra, presenta dos
opciones. **Continuar partida** carga el estado; **Nueva partida** solicita
confirmación antes de borrar el avance.

### 4. Estadísticas

`map-scene.js` crea un panel de solo lectura con los datos relevantes. Se usa
la tecla `P` porque `S` ya forma parte del movimiento WASD. Mientras el panel o
el inventario están abiertos, el personaje se detiene.

### 5. Punto único de guardado

El juego no guarda durante el registro, la recolección, las misiones ni las
batallas. `interactGuard()` solicita confirmación y solo ejecuta
`SaveService.save()` cuando el jugador acepta. Rechazar conserva intacta la
última partida guardada.

Por tanto, cerrar o recargar implica perder el avance posterior a la última
visita al Vigilante. Los cambios entre escenas permanecen en memoria durante la
sesión actual; todavía no se establece un guardado especial al cambiar de
escenario.

## Secuencia sugerida con el grupo

1. Mostrar qué campos contiene `GAME_STATE`.
2. Ejecutar `JSON.stringify(GAME_STATE)` en la consola y explicar el resultado.
3. Revisar `SaveService.save()` y localizar la entrada en el almacenamiento del
   navegador.
4. Modificar monedas, posición o inventario; guardar y recargar.
5. Revisar `load()` y comprobar que reconstruye arreglos y posición.
6. Abrir el panel con `P` y relacionar cada dato con el estado.
7. Completar una misión, recargar sin guardar y comprobar que se pierde.
8. Repetirla, guardar con el Vigilante y comprobar que se conserva.
9. Probar **Nueva partida** y confirmar que el estado vuelve a sus valores base.

## Pruebas manuales

| Caso | Acción | Resultado esperado |
|---|---|---|
| Guardado manual | Interactuar con el Vigilante | Aparece confirmación y se crea el guardado |
| Rechazar guardado | Elegir cancelar ante el Vigilante | El último guardado no cambia |
| Sin autoguardado | Completar una misión y recargar | Se recupera el último estado guardado |
| Continuar | Recargar y elegir continuar | Se conservan nombre, carrera y posición |
| Coleccionables | Recoger una moneda, guardar y recargar | La moneda no reaparece |
| Inventario | Obtener un objeto, guardar y recargar | El objeto sigue en el inventario |
| Estadísticas | Presionar `P` | Se muestran datos y el avatar se detiene |
| Nueva partida | Elegir nueva y confirmar | Se borra el avance y vuelve el registro |
| Dato dañado | Alterar el valor almacenado | El juego vuelve al registro sin bloquearse |

## Límite del incremento

No activar todavía las batallas de Programación y Coordinación. El objetivo es
que el guardado y las estadísticas queden estables antes de sumar nuevos
escenarios de combate.
