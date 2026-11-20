# Recursos de producción

- `estudiante-base.png`: spritesheet inicial del protagonista conservado como
  referencia; la versión de demostración utiliza los dos avatares seleccionables
  de `assets/personajes`.
- `items-final.png`: lámina aprobada de objetos utilizada como atlas. Phaser
  recorta únicamente los diez elementos requeridos mediante cuadros definidos
  en `BootScene.createItemFrames()`.
- `objetos-base.png`: atlas inicial conservado como referencia; la versión de
  demostración ya no lo carga.

Los archivos de `assets/referencias` se conservan como tableros conceptuales y
no se cargan directamente durante la ejecución.
