# Profies vs. Estudiantes · versión de demostración

Línea de trabajo para completar y pulir **La última asesoría mortal: Profesores
Zombis** como demostración de la carrera para estudiantes de bachillerato. Esta
versión integra el recorrido completo, el mapa definitivo y un pulido especial
para utilizar el juego en demostraciones con estudiantes de bachillerato.

## Inicio rápido

1. Descomprime o copia la carpeta completa.
2. Abre `iniciar-servidor.bat`.
3. Visita `http://localhost:8000`.
4. Registra nombre y carrera y completa el recorrido descrito abajo.
5. Habla con el Vigilante cuando quieras guardar manualmente.

## Publicación e instalación

El proyecto incluye manifiesto, service worker, iconos y caché sin conexión. La
guía [GUIA-PUBLICAR-GITHUB-PAGES.md](GUIA-PUBLICAR-GITHUB-PAGES.md) explica qué
contenido subir y cómo activar GitHub Pages sin modificar las rutas del juego.

## Recorrido completo

1. Registrar nombre y carrera con el Vigilante.
   Durante el registro también se elige avatar masculino o femenino.
2. Explorar, reunir créditos y enfrentar al Profie de Matemáticas en la
   biblioteca.
3. Ayudar a los estudiantes: comprar comida y recibir la laptop.
4. Entrar al laboratorio y vencer al Profie de Programación.
5. Llevar el código del antídoto a Coordinación.
6. Vencer al Profie Coordinador y ver el desenlace.

Cada batalla disciplinaria usa su banco temático e incorpora un único reto
crítico de la carrera después de tres preguntas. El Coordinador combina el
banco de la carrera elegida con el banco de vida laboral.

## Funcionalidad cerrada en esta versión

- batalla activa contra los tres Profies;
- requisitos de acceso para laboratorio y Coordinación;
- recompensas y avance de la historia;
- victoria final con resumen de resultados;
- derrota definitiva cuando se agotan las oportunidades;
- recuperación desde el último guardado o inicio de una partida nueva;
- guardado exclusivamente manual mediante el Vigilante;
- persistencia de objetos recogidos, misiones, estadísticas y Profies vencidos.
- mapa cenital definitivo con accesos, ubicaciones y colisiones adaptadas;
- HUD compacto con oportunidades, créditos, puntos y objetivo actual;
- panel completo de estadísticas accesible con `P` o el botón **Perfil**.
- personajes transparentes de producción para NPC y Profies, basados en la
  propuesta gráfica aprobada;
- escalas diferenciadas para exploración, registro y combate.
- protagonistas masculino y femenino seleccionables, persistentes y visibles
  durante toda la partida.
- animaciones de caminar en cuatro direcciones para ambos protagonistas;
- NPC más visibles y ventana de juego ampliada 10% sin alterar su proporción.
- fondos propios para biblioteca, laboratorio y Coordinación;
- indicador animado que señala el siguiente objetivo en el mapa;
- introducción breve, controlable con botón o barra espaciadora;
- transiciones suaves entre registro, exploración, batallas y desenlace;
- entrada animada de los personajes y daño visible durante el combate;
- selección de respuestas mediante clic, teclas `1`–`4` o `A`–`D`;
- cierre orientado a presentar la creación de videojuegos y aplicaciones como
  una posibilidad de carrera.
- música diferenciada para exploración, Matemáticas, Programación y
  Coordinación, con entrada y salida gradual;

## Pendiente para las siguientes versiones

- revisar con el docente las cuatro pistas actuales y sustituir la música de
  exploración si alguna alternativa representa mejor el tono del campus;
- integrar la fanfarria de victoria después de aprobar la selección musical.

## Controles

- Flechas o `W`, `A`, `S`, `D`: movimiento.
- `E` o `Espacio`: interactuar.
- `I`: abrir o cerrar el inventario.
- `P`: abrir o cerrar el perfil de estadísticas.
- Botón **Perfil**: alternativa visible para abrir o cerrar las estadísticas.
- `1`–`4` o `A`–`D`: elegir una respuesta durante las batallas.

## Archivos clave

```text
assets/batallas/            Fondos diferenciados para los tres Profies
assets/personajes/          Avatares, NPC y Profies
assets/sprites/             Objetos del recorrido
js/data/game-state.js       Estado inicial y función de reinicio
js/services/save-service.js Guardado, carga, borrado y nueva partida
js/scenes/name-scene.js     Registro y menú de partidas
js/scenes/map-scene.js      Estadísticas y único punto de guardado
js/scenes/battle-scene.js   Tres batallas sin autoguardado
js/scenes/outcome-scene.js  Victoria, derrota y opciones posteriores
```

No abras `index.html` con doble clic: los JSON deben cargarse mediante el
servidor local.

## Verificación rápida

Con Node.js instalado, ejecuta `node tests/smoke-test.js`. La prueba comprueba
los cinco bancos, la posición del reto crítico, la combinación del Coordinador,
los accesos de progresión y los desenlaces de victoria y derrota.
