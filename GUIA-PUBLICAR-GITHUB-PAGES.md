# Guía exacta: publicar el juego como PWA en GitHub Pages

Esta guía corresponde a la estructura actual de **Profies vs. Estudiantes**.
No es necesario instalar Git ni cambiar rutas en el código para realizar la
primera publicación.

## 1. Carpeta que se debe publicar

La raíz del repositorio debe contener directamente los archivos de la carpeta:

```text
profies_vs_estudiantes/
└── proyecto/                 ← abre esta carpeta y sube su contenido
    ├── index.html
    ├── manifest.webmanifest
    ├── service-worker.js
    ├── .nojekyll
    ├── assets/
    ├── css/
    ├── js/
    └── vendor/
```

No subas la carpeta `profies_vs_estudiantes` como una carpeta dentro del
repositorio. Tampoco subas `versiones` ni `recursos_audio`: son respaldos y
material de selección, no forman parte del sitio publicado.

El resultado correcto en GitHub debe mostrar `index.html` inmediatamente al
abrir el repositorio, no dentro de otra carpeta llamada `proyecto`.

## 2. Crear el repositorio

1. Entra a <https://github.com> e inicia sesión.
2. Pulsa **New** o abre <https://github.com/new>.
3. En **Repository name** escribe `profies-vs-estudiantes`.
4. Selecciona **Public**.
5. No marques **Add a README**, **.gitignore** ni **license**, porque los
   archivos del proyecto ya están preparados.
6. Pulsa **Create repository**.

## 3. Subir la estructura desde el navegador

1. En el repositorio vacío, selecciona **uploading an existing file**. Si ya
   aparece algún archivo, usa **Add file → Upload files**.
2. En el Explorador de Windows abre:

   ```text
   10_Materia_DAMyVj\04_Material_generado\proyectos\
   profies_vs_estudiantes\proyecto
   ```

3. Selecciona **todo el contenido interior** de `proyecto` y arrástralo al área
   de carga. Deben conservarse las carpetas `assets`, `css`, `js` y `vendor`.
4. Comprueba que la lista incluya `index.html`, `manifest.webmanifest` y
   `service-worker.js`.
5. Escribe `Publicar PWA de Profies vs. Estudiantes` en **Commit changes**.
6. Elige **Commit directly to the main branch** y confirma el cambio.

El proyecto contiene menos de cien archivos y ningún archivo individual supera
el límite habitual de carga desde el navegador de GitHub.

### Si `.nojekyll` no aparece

Selecciona **Add file → Create new file**, escribe `.nojekyll` como nombre,
deja el contenido vacío y confirma el cambio. Este archivo evita que GitHub
intente procesar el juego como un proyecto Jekyll.

## 4. Activar GitHub Pages

1. Abre **Settings** en el repositorio.
2. En **Code, planning, and automation**, abre **Pages**.
3. En **Build and deployment → Source**, selecciona
   **Deploy from a branch**.
4. En **Branch**, selecciona `main`.
5. En la carpeta selecciona `/ (root)`.
6. Pulsa **Save**.
7. Abre **Actions** y espera a que la ejecución de Pages tenga una marca verde.
8. Regresa a **Settings → Pages** para abrir la dirección publicada.

Con el nombre recomendado, la dirección será:

```text
https://TU_USUARIO.github.io/profies-vs-estudiantes/
```

No elimines el nombre del repositorio de la dirección. El manifiesto, el
service worker y los recursos usan rutas relativas para funcionar dentro de
esa subcarpeta.

## 5. Comprobar el juego y la instalación

1. Abre la dirección publicada en una ventana privada.
2. Verifica la introducción, el mapa y una batalla.
3. En Brave, Chrome o Edge de escritorio busca el icono de instalación en la
   barra de direcciones. También puede aparecer **Instalar juego** en la página.
4. En Android abre la dirección con Chrome y elige **Instalar aplicación** o
   **Agregar a pantalla principal**.
5. En iPhone o iPad usa **Compartir → Agregar a pantalla de inicio**.
6. Después de abrir una vez el juego completo, desconecta temporalmente la red
   y vuelve a iniciarlo. Interfaz, mapas, preguntas y música deben continuar
   disponibles mediante la caché.

El primer acceso requiere internet para descargar aproximadamente 49 MB de
recursos. La instalación necesita HTTPS; GitHub Pages lo proporciona.

## 6. Publicar cambios posteriores

1. Modifica el proyecto y pruébalo con `iniciar-servidor.bat`.
2. En GitHub usa **Add file → Upload files** y sube los archivos modificados.
3. Si cambias código, imágenes, preguntas o música sin conexión, modifica en
   `service-worker.js`:

   ```js
   const CACHE_VERSION = 'profies-pwa-v2';
   ```

   En actualizaciones posteriores usa `v3`, `v4`, etc. Esto retira la caché
   anterior cuando la PWA recibe la nueva versión.
4. Confirma el cambio y espera la marca verde en **Actions**.
5. Abre la aplicación conectada a internet una vez y después vuelve a abrirla.

## 7. Errores frecuentes

### La página muestra 404

- Comprueba que `index.html` esté en la raíz del repositorio.
- Confirma **main** y **/(root)** en **Settings → Pages**.
- Revisa la ejecución más reciente en **Actions**.

### Faltan imágenes, preguntas o música

- Revisa que se hayan subido completas `assets`, `js` y `vendor`.
- Respeta mayúsculas, minúsculas, guiones y extensiones. GitHub Pages distingue
  entre `Mapa.png` y `mapa.png`.
- No cambies nombres de archivos después de subirlos.

### No aparece la opción de instalación

- Abre la dirección `https://`, no una copia mediante doble clic.
- Espera a que termine de cargar y actualiza una vez.
- Comprueba `manifest.webmanifest`, `service-worker.js`, `icon-192.png` e
  `icon-512.png`.
- En iOS utiliza **Compartir**; su instalación funciona de manera diferente.

### Se sigue viendo una versión anterior

- Aumenta `CACHE_VERSION` en `service-worker.js`.
- Publica el cambio y abre la PWA con internet.
- Para probar inmediatamente, desinstala la PWA anterior o elimina los datos
  del sitio desde el navegador.

## Archivos PWA incorporados

- `manifest.webmanifest`: identidad, colores, orientación e iconos.
- `service-worker.js`: caché del juego y reproducción de audio por rangos.
- `js/pwa.js`: registro del service worker y botón de instalación.
- `assets/icons/`: iconos de 192, 512 y 180 píxeles.
- `.nojekyll`: publicación estática sin procesamiento de Jekyll.

Referencias oficiales:

- GitHub Pages: <https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>
- Instalación PWA: <https://developer.mozilla.org/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable>
- Iconos PWA: <https://developer.mozilla.org/docs/Web/Progressive_web_apps/How_to/Define_app_icons>
