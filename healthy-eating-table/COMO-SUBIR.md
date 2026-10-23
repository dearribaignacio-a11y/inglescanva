# Cómo subir la presentación a internet (paso a paso)

Vas a usar dos páginas gratis:

- **GitHub**: guarda los archivos.
- **Vercel**: los convierte en una página web con un link (ese link es el que abre el QR).

No hace falta instalar nada. Solo un navegador (Chrome, Edge o Firefox) y una computadora.

---

## 1. Crear un repositorio en GitHub

1. Entrá a <https://github.com> y creá una cuenta (o iniciá sesión).
2. Arriba a la derecha tocá el **+** y elegí **New repository**.
3. En **Repository name** escribí un nombre sin espacios, por ejemplo: `eat-smart-feel-great`.
4. Dejalo en **Public**.
5. No marques ninguna otra opción.
6. Tocá el botón verde **Create repository**.

## 2. Subir los archivos arrastrándolos

1. Descomprimí `healthy-eating-table.zip` en tu computadora (clic derecho → *Extraer todo*).
2. Abrí la carpeta `healthy-eating-table`. Adentro vas a ver `index.html`, las carpetas `css`, `js`, `assets`, `fonts`, `vendor` y otros archivos.
3. En la página del repositorio recién creado, tocá el link **uploading an existing file**.
4. Seleccioná **todo lo que está ADENTRO** de la carpeta (Ctrl + A) y arrastralo a la página de GitHub.
   - ⚠️ Arrastrá el contenido, no la carpeta entera: `index.html` tiene que quedar "suelto", no dentro de otra carpeta.
   - El archivo `.gitignore` puede no verse en Windows; no pasa nada si no se sube.
5. Esperá a que termine de cargar la lista de archivos.
6. Abajo, tocá el botón verde **Commit changes**.
7. Revisá que en el repositorio se vea `index.html` en la lista principal.

## 3. Importarlo en Vercel

1. Entrá a <https://vercel.com> y tocá **Sign Up** → **Continue with GitHub** (usá la misma cuenta).
2. Tocá **Add New…** → **Project**.
3. En la lista aparece tu repositorio. Tocá **Import** al lado.
4. En **Framework Preset** elegí **Other**.
5. No completes **Build Command** ni ningún otro campo (dejalos vacíos).
6. Tocá **Deploy** y esperá menos de un minuto.

## 4. Conseguir el link

1. Cuando termine vas a ver una pantalla de felicitación. Tocá **Continue to Dashboard**.
2. En **Domains** aparece el link, algo como `eat-smart-feel-great.vercel.app`.
3. Abrilo: es la presentación. Guardalo en favoritos de la laptop que van a usar.

## 5. Probar el QR con el celular

1. Abrí el link en la laptop y andá a la escena 8 (*Game time!*). Podés escribir `#8` al final del link.
2. Escaneá el QR con la cámara del celular. Tiene que abrir directamente el juego.
3. Jugá una vez completa desde el celular para comprobarlo.

> Importante: el QR usa el link de la página abierta. Si abrís la presentación con doble clic en `index.html` (sin internet), el QR no sirve para los celulares. Para el QR, abrí siempre el link de Vercel. Los celulares necesitan internet.

## 6. Cambiar un texto y volver a subirlo

1. En tu computadora abrí `js/content.js` con el Bloc de notas (clic derecho → *Abrir con* → *Bloc de notas*).
2. Buscá el texto (Ctrl + F) y cambialo **solo entre las comillas** `"…"`. No borres las comillas, las comas ni los corchetes.
3. Guardá (Ctrl + S).
4. En GitHub, entrá a la carpeta `js` de tu repositorio y tocá **Add file** → **Upload files**.
5. Arrastrá el archivo `content.js` que modificaste y tocá **Commit changes**. (Reemplaza al anterior.)
6. Vercel lo actualiza solo en uno o dos minutos. Recargá la página para ver el cambio.

> Otra forma: en GitHub abrí `js/content.js`, tocá el lápiz ✏️ (*Edit this file*), cambiá el texto y tocá **Commit changes**.

---

## Atajos durante la exposición

- **→**, **Espacio** o **Page Down**: escena siguiente. **←** o **Page Up**: escena anterior.
- **F**: pantalla completa. **N**: mostrar/ocultar el guion de quien habla.
- **Esc**: cerrar el juego o la ventana *Sources*.
- Las flechas no activan nada dentro de las escenas: para eso se hace clic en los objetos.
- Si falla el Wi-Fi: doble clic en `index.html` y funciona igual (salvo el QR).
