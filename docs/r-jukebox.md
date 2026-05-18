# `<r-jukebox>`

reproductor de audio con playlist. children `<r-track>` con `src`, `title`, `artist`. vanilla, light DOM, fallback HTML sin JS.

---

## uso mínimo

```html
<r-jukebox loop="all">
  <r-track src="audio/1.mp3" title="apertura"   artist="meowrhino"></r-track>
  <r-track src="audio/2.mp3" title="intermedio" artist="meowrhino"></r-track>
  <r-track src="audio/3.mp3" title="cierre"     artist="meowrhino"></r-track>
</r-jukebox>

<script type="module" src="components/r-jukebox.js"></script>
```

sin JS, `r-jukebox` se muestra como un bloque con una lista `r-track` donde cada track es un link descargable. con JS, se convierte en player con play/pause, prev/next, scrubber, volumen y lista clicable.

---

## atributos de `<r-jukebox>`

| atributo   | valores                                | default | descripción |
|------------|----------------------------------------|---------|-------------|
| `autoplay` | presencia booleana                     | off     | intenta arrancar al cargar. sujeto a política del navegador (Chrome bloquea autoplay con sonido sin interacción previa). |
| `loop`     | `off` · `one` · `all`                  | `off`   | qué hacer al acabar un track. `one` repite el actual, `all` cicla la lista. |
| `shuffle`  | presencia booleana                     | off     | el siguiente track es aleatorio. el botón "anterior" sigue siendo lineal. |
| `volume`   | `0`..`1`                               | `0.8`   | volumen inicial (también editable desde el slider). |
| `start`    | índice                                 | `0`     | track con el que empezar. |
| `lang`     | `es` · `en` · `ca`                     | `es`    | aria-labels y mensajes internos. |

## atributos de `<r-track>`

| atributo    | descripción                                                          |
|-------------|----------------------------------------------------------------------|
| `src`       | URL del audio (obligatorio). MP3, OGG, WAV — lo que soporte el navegador. |
| `title`     | título visible. si falta, se infiere del nombre del archivo.         |
| `artist`    | autor o artista (opcional).                                          |
| `duration`  | duración legible inicial (e.g. `"3:24"`). se sobrescribe con la real cuando el navegador la carga. |

---

## eventos custom

todos `bubbles: true`. emitidos por el `<r-jukebox>`.

| evento                  | cuándo                              | `detail`                                |
|-------------------------|-------------------------------------|-----------------------------------------|
| `r-jukebox:play`        | el audio empieza a sonar            | `{ index, src, title }`                 |
| `r-jukebox:pause`       | pausa                               | `{ index, src, title }`                 |
| `r-jukebox:next`        | click en ⏭ o final con loop=all     | `{ index, src, title }`                 |
| `r-jukebox:prev`        | click en ⏮                          | `{ index, src, title }`                 |
| `r-jukebox:ended`       | termina un track                    | `{ index, src, title }`                 |
| `r-jukebox:timeupdate`  | tick (throttled a ~1Hz)             | `{ current, duration }` en segundos     |
| `r-jukebox:error`       | el navegador no pudo cargar el audio | `{ index, src, message }`              |

ejemplo: mostrar lo que suena en otro lado de la página.

```html
<r-jukebox id="bg" loop="all">…</r-jukebox>
<p>ahora suena: <span id="np">—</span></p>

<script>
  document.addEventListener('r-jukebox:play', (e) => {
    if (e.target.id === 'bg') document.getElementById('np').textContent = e.detail.title;
  });
</script>
```

---

## CSS variables

| variable                          | fallback                          | qué controla                          |
|-----------------------------------|-----------------------------------|---------------------------------------|
| `--r-jukebox-bg`                  | `--r-bg` → `#fafafa`              | fondo del player                      |
| `--r-jukebox-fg`                  | `--r-fg` → `#1a1a1a`              | texto general                         |
| `--r-jukebox-accent`              | `--r-accent` → coral              | scrubber, dot activo, botón play      |
| `--r-jukebox-border`              | `--r-border` → ink                | borde del bloque                      |
| `--r-jukebox-button-size`         | `2rem`                            | tamaño de botones de transporte       |
| `--r-jukebox-progress-height`     | `6px`                             | grosor del scrubber y del volumen     |
| `--r-jukebox-track-hover`         | `rgba(0,0,0,0.06)`                | fondo de un track al hover            |

---

## tres ejemplos

### 1) mínimo

```html
<r-jukebox>
  <r-track src="a.mp3" title="apertura"></r-track>
  <r-track src="b.mp3" title="intermedio"></r-track>
</r-jukebox>
```

### 2) loop infinito, autoplay (con la advertencia del navegador), shuffle

```html
<r-jukebox loop="all" shuffle volume="0.5" autoplay>
  <r-track src="01.mp3" title="primero"  artist="meowrhino"></r-track>
  <r-track src="02.mp3" title="segundo"  artist="meowrhino"></r-track>
  <r-track src="03.mp3" title="tercero"  artist="meowrhino"></r-track>
</r-jukebox>
```

### 3) tema oscuro custom

```html
<r-jukebox
  style="
    --r-jukebox-bg: #1a1a1a;
    --r-jukebox-fg: #fef8e6;
    --r-jukebox-accent: #f5b840;
    --r-jukebox-border: #f5b840;
  ">
  <r-track src="audio/cielo.mp3"  title="cielo abierto" artist="rikamichie"></r-track>
  <r-track src="audio/lluvia.mp3" title="lluvia"       artist="rikamichie"></r-track>
</r-jukebox>
```

---

## accesibilidad

- todos los botones tienen `aria-label` traducido por `lang`.
- el scrubber y el volumen son `<input type="range">` nativos — accesibles con teclado por defecto.
- la lista de tracks es navegable con Tab + Enter/Espacio.
- estado de play/pause y track activo se reflejan visualmente y por el cambio de texto del botón (`▶`/`⏸`).

---

## comportamiento sin JS

| con JS                                 | sin JS                                            |
|----------------------------------------|---------------------------------------------------|
| player con transport, scrubber, lista  | bloque con título y lista `<li><a>` a los audios |

cada `<r-track>` renderiza su propio fallback: un link al `src`. el navegador, según su comportamiento por defecto, abre el audio en una pestaña con su control nativo o lo descarga. mejor que nada y consistente con "vanilla, forever".

---

## limitaciones conocidas

- el navegador suele **bloquear autoplay con sonido** hasta que haya interacción del user. el componente intenta y si falla, no pasa nada (no emite error ruidoso). el user pulsa play y arranca.
- no hay ecualizador, ni visualizador de espectro, ni crossfade. si quieres eso, escucha `timeupdate` y monta tu propia capa.
- el shuffle es estocástico simple, sin "no repetir hasta agotar". para listas largas es indistinguible; para listas de 2-3 tracks puede repetir.
- `<r-track>` está pensado **solo** como hijo de `<r-jukebox>`. fuera de ese contexto, se renderiza como un link y nada más. no lo uses para otra cosa.

---

*retals · vanilla, forever · meowrhino studio*
