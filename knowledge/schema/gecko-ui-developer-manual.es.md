# Manual de Desarrollador y Guía de API de GeckoUI

**Versión:** 1.0  
**Audiencia Objetivo:** Desarrolladores Humanos y Mantenedores  
**Archivo Fuente:** [`gecko-ui.js`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js)  
**Manual en Inglés:** [`gecko-ui-developer-manual.md`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui-developer-manual.md)  

---

## 1. Visión General y Diseño Arquitectónico

`GeckoUI` es una biblioteca de interfaz de usuario ligera, sin dependencias externas y desarrollada en JavaScript vanilla, diseñada a medida para los simuladores GECKO. Mientras que GECKO utiliza agentes de IA para generar simulaciones web interactivas de forma automática, los **desarrolladores humanos** se encargan de mantener `gecko-ui.js`, extender sus funcionalidades y empaquetarla o personalizarla en aplicaciones web independientes.

### Principios Arquitectónicos Clave
- **Sin Paso de Construcción y Sin Dependencias:** Escrita en JavaScript Vanilla ES6 puro. No requiere paquetes npm, transpilación ni hojas de estilo externas.
- **Inyección de Estilos Embebida:** El CSS se inyecta dinámicamente en el `<head>` mediante la función `injectCSS()`, definiendo propiedades personalizadas estándar de CSS (variables) para un tema oscuro uniforme.
- **Diseño con Barra Lateral Fija:** Automatiza la creación del DOM de la barra lateral (`#gecko-sidebar`) y ajusta automáticamente el cuerpo del documento (`body { padding-right: 320px !important }`) para garantizar que la zona del lienzo (canvas) o renderizador nunca quede oculta.
- **Motor Híbrido Reactivo y Guiado por Eventos:**
  - **Sincronización por Polling / Getters:** Las funciones de lectura (`get()`, `getState()`, `getCameraInfo()`) se ejecutan dentro del bucle `requestAnimationFrame` para mantener los controles y las métricas de telemetría actualizados cuadro por cuadro.
  - **Bus de Eventos:** Emite eventos del ciclo de vida (`play`, `pause`, `reset`, `tick`, `import`, `change`) para desacoplar los controles de la UI de la lógica física de la simulación.
- **Internacionalización Nativa (i18n):** Soporte integrado para inglés (`en`) y español (`es`) listo para usar en las etiquetas del sistema.

---

## 2. Guía de Inicio Rápido e Integración

### 2.1 Inclusión Estándar Mediante Etiqueta Script
Incluya `gecko-ui.js` antes del código principal de su simulador.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ejemplo de Simulador GECKO</title>
</head>
<body>
  <canvas id="sim-canvas"></canvas>

  <!-- 1. Incluir la biblioteca GeckoUI -->
  <script src="gecko-ui.js"></script>

  <!-- 2. Lógica de la Simulación -->
  <script>
    const canvas = document.getElementById('sim-canvas');
    let velocidad = 2.0;

    const ui = new GeckoUI({
      canvas: canvas,
      title: 'Simulador de Velocidad de Partículas',
      language: 'es',
      accentColor: '#00e5ff',
      getState: () => ({ velocidad }),
      onPlay: () => console.log('Simulación iniciada'),
      onPause: () => console.log('Simulación pausada'),
      onReset: () => { velocidad = 2.0; },
      panels: [
        {
          id: 'controles',
          title: 'Parámetros',
          controls: [
            {
              type: 'slider',
              id: 'ctrl-velocidad',
              label: 'Velocidad',
              min: 0,
              max: 10,
              step: 0.1,
              get: () => velocidad,
              set: (v) => { velocidad = v; }
            }
          ]
        }
      ]
    });
  </script>
</body>
</html>
```

---

## 3. Referencia de Configuración (`new GeckoUI(config)`)

El constructor `GeckoUI` recibe un único objeto de configuración con las siguientes propiedades:

| Opción | Tipo | Requerido | Valor por Defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `canvas` | `HTMLElement` | **Sí** | — | Elemento canvas o contenedor principal del simulador. |
| `language` | `'en' \| 'es'` | No | `'en'` | Idioma de la interfaz. Configura las etiquetas internas (`t`). |
| `title` | `string` | No | `'GECKO'` | Título mostrado en la barra superior. |
| `sidebarWidth` | `number` | No | `320` | Ancho de la barra lateral en píxeles (`px`). |
| `accentColor` | `string` | No | `'#00e5ff'` | Color de acento principal del tema (HEX, RGB o HSL). |
| `getState` | `Function` | No | `null` | Retorna un objeto plano `{ clave: valor }` consultado cada cuadro para las métricas. |
| `onExport` | `Function` | No | `null` | Retorna un objeto serializable en JSON que se descarga al pulsar Exportar. |
| `onImport` | `Function` | No | `null` | Callback ejecutado cuando el usuario importa un archivo JSON de estado (`(stateObj) => {}`). |
| `onPlay` | `Function` | No | `null` | Hook de evento llamado cuando se inicia la reproducción. |
| `onPause` | `Function` | No | `null` | Hook de evento llamado cuando se pausa la reproducción. |
| `onReset` | `Function` | No | `null` | Hook de evento llamado al presionar el botón de reiniciar. |
| `panels` | `Array<PanelConfig>` | No | `[]` | Arreglo de configuraciones declarativas de paneles. |
| `camera` | `CameraConfig` | No | `null` | Objeto de configuración para controles de cámara 3D. |
| `debugConsole` | `boolean` | No | `false` | Habilita el panel de consola de depuración en la parte inferior. |
| `debugConsoleLines`| `number` | No | `20` | Número máximo de líneas visibles conservadas en el búfer de depuración. |

---

## 4. Catálogo de Tipos de Control

`GeckoUI` admite 9 tipos de control declarativos dentro de las definiciones de paneles (`panels[].controls[]`).

### 4.1 `slider`
Deslizador numérico interactivo con distintivo de lectura de valor.

```javascript
{
  type: 'slider',
  id: 'gravedad',
  label: 'Constante de Gravedad',
  unit: 'm/s²',          // Etiqueta de unidad opcional
  min: 0,
  max: 20,
  step: 0.1,
  value: 9.8,            // Valor inicial de respaldo
  get: () => sim.gravedad,// Lee el valor actual en cada refresco
  set: (v) => { sim.gravedad = v; }
}
```

### 4.2 `number-input`
Campo de texto numérico validado. Vuelve al valor válido anterior si la entrada es inválida o `< min`.

```javascript
{
  type: 'number-input',
  id: 'masa',
  label: 'Masa del Objeto',
  unit: 'kg',
  min: 0.001,            // Límite inferior exclusivo de validación
  default: 1.0,
  applyOnIcon: true,     // Botón opcional con marca de verificación para aplicar al instante
  get: () => sim.masa,
  set: (v) => { sim.masa = v; }
}
```

### 4.3 `vector-input`
Fila de entrada de vectores de tres ejes (`X`, `Y`, `Z`) con icono opcional de confirmación.

```javascript
{
  type: 'vector-input',
  id: 'velocidad-inicial',
  label: 'Velocidad Inicial',
  unit: 'm/s',
  default: { x: 0, y: 10, z: 0 },
  applyOnIcon: true,
  get: () => sim.velocidad, // Retorna { x, y, z }
  set: (vec) => { sim.velocidad = vec; }
}
```

### 4.4 `checkbox`
Casilla de verificación de estado booleano.

```javascript
{
  type: 'checkbox',
  id: 'mostrar-vectores',
  label: 'Mostrar Vectores de Fuerza',
  default: true,
  get: () => sim.mostrarVectores,
  set: (val) => { sim.mostrarVectores = val; }
}
```

### 4.5 `dropdown`
Menú desplegable de selección.

```javascript
{
  type: 'dropdown',
  id: 'integrador',
  label: 'Método de Integración',
  options: [
    { value: 'euler', label: 'Euler' },
    { value: 'rk4', label: 'Runge-Kutta 4' }
  ],
  default: 'rk4',
  get: () => sim.integrador,
  set: (val) => sim.setIntegrador(val)
}
```

### 4.6 `metrics`
Lectura de telemetría en tiempo real que muestra valores obtenidos de `getState()` o actualizados vía `setMetric()`.

```javascript
{
  type: 'metrics',
  id: 'telemetria',
  fields: [
    { key: 'fps', label: 'FPS' },
    { key: 'energia', label: 'Energía Total', unit: 'J' }
  ]
}
```

### 4.7 `html`
Inyecta contenido HTML libre dentro del panel (ideal para notas, ecuaciones o explicaciones).

```javascript
{
  type: 'html',
  content: '<p style="color:#aaa;">Arrastre los agentes con el ratón para aplicar fuerza.</p>'
}
```

### 4.8 `button`
Botón de acción que se extiende a todo el ancho del panel.

```javascript
{
  type: 'button',
  id: 'limpiar-particulas',
  label: 'Limpiar Todas las Partículas',
  onClick: () => sim.limpiarParticulas()
}
```

### 4.9 `separator`
Línea divisoria horizontal.

```javascript
{ type: 'separator' }
```

---

## 5. Controles de Cámara e Integración de Consola de Depuración

### 5.1 Configuración de Controles de Cámara
Pase un objeto `camera` para renderizar una cuadrícula de 6 botones de navegación 3D y lectura de telemetría.

```javascript
camera: {
  onZoomIn: () => cam.zoom(-1),
  onZoomOut: () => cam.zoom(+1),
  onRotateXPos: () => cam.rotateX(+5),
  onRotateXNeg: () => cam.rotateX(-5),
  onRotateZPos: () => cam.rotateZ(+5),
  onRotateZNeg: () => cam.rotateZ(-5),
  getCameraInfo: () => ({
    dist: cam.distance.toFixed(1),
    rotX: cam.rotX.toFixed(0) + '°'
  })
}
```

### 5.2 Consola de Depuración Embebida
Al configurar `debugConsole: true`, la biblioteca intercepta las llamadas estándar a `console.log` y `console.error`, mostrando la salida en un panel con desplazamiento automático al final de la barra lateral.

```javascript
ui.debugLog('Mensaje de depuración personalizado');
```

---

## 6. Eventos y Bucle de Animación

`GeckoUI` gestiona un bucle nativo `requestAnimationFrame` (`_startLoop`).

### API del Bus de Eventos

```javascript
// Registrar manejador de eventos
ui.on('play', () => sim.reanudar());
ui.on('pause', () => sim.pausar());
ui.on('reset', () => sim.reiniciar());
ui.on('import', (datos) => sim.cargar(datos));
ui.on('change', ({ id, value }) => console.log(`El control ${id} cambió a`, value));

// Escuchador del bucle de física: 'tick' se dispara en cada cuadro cuando isPlaying es true
ui.on('tick', (dt) => {
  sim.actualizar(dt); // dt es el tiempo transcurrido en segundos (limitado a un máximo de 0.1s)
});
```

---

## 7. Referencia de la API Imperativa

Las instancias de `GeckoUI` proporcionan control programático completo sobre paneles, controles y estado de reproducción:

| Método | Firma | Descripción |
| :--- | :--- | :--- |
| `togglePlay()` | `()` | Alterna el estado de reproducción/pausa de la simulación. |
| `setPlaying(playing)` | `(boolean)` | Establece explícitamente el estado de reproducción (`true` / `false`) y actualiza el botón de la barra superior. |
| `refresh()` | `()` | Ejecuta las llamadas `get()` de todos los controles y actualiza los elementos del DOM manualmente. |
| `exportState()` | `()` | Activa `onExport()` / `getState()` e inicia la descarga del archivo `.json` de estado. |
| `addPanel(config)` | `(PanelConfig)` | Añade dinámicamente un nuevo panel colapsable. |
| `removePanel(id)` | `(string)` | Elimina un panel por su ID. |
| `expandPanel(id)` | `(string)` | Expande programáticamente un panel. |
| `collapsePanel(id)`| `(string)` | Colapsa programáticamente un panel. |
| `addControl(pId, ctrl)`| `(string, ControlConfig)`| Añade programáticamente un control a un panel existente. |
| `setMetric(key, val)`| `(string, any)` | Actualiza directamente una clave de métrica sin necesidad de `getState()`. |
| `debugLog(msg)` | `(string)` | Escribe una entrada de texto plano en la consola de depuración embebida. |

---

## 8. Guía de Extensión y Mantenimiento para Desarrolladores Humanos

Al modificar o ampliar la propia biblioteca `gecko-ui.js`, siga estas directrices de desarrollo:

1. **Mantener la Restricción de Cero Dependencias:** Nunca agregue bibliotecas externas ni importaciones. Todo el CSS debe permanecer dentro de `injectCSS()`.
2. **Agregar Nuevos Idiomas (i18n):** Añada traducciones al objeto `I18N` en la línea 8 de [`gecko-ui.js`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js#L8-L43):
   ```javascript
   const I18N = {
     en: { ... },
     es: { ... },
     fr: { play: 'Jouer', pause: 'Pause', ... } // Ejemplo de adición
   };
   ```
3. **Agregar Nuevos Tipos de Control:**
   - Amplíe la sentencia `switch (ctrlConfig.type)` en la función `addControl()` ([`gecko-ui.js:681`](file:///home/mark/Excess/gecko/knowledge/schema/gecko-ui.js#L681)).
   - Implemente la construcción del DOM, los escuchadores de eventos y el callback `ctrlObj.refresh` con protección para elementos activos.
4. **Propiedades Personalizadas de CSS (Personalización del Tema):**
   - Las variables del tema están vinculadas a `:root` en `injectCSS()`. Modifique los tokens de color predeterminados (`--gecko-bg`, `--gecko-bg-card`, `--gecko-accent`, `--gecko-border`) para ajustar el sistema de diseño visual.
