# To-Do List Mobile App (Enterprise Edition)

Aplicación móvil profesional de gestión de tareas y categorías, construida con los más altos estándares de calidad, arquitecturas escalables y patrones reactivos modernos. Diseñada específicamente como una solución *enterprise-grade* para pruebas técnicas.

## 🚀 Tecnologías y Versiones Core
Esta aplicación ha sido desarrollada asegurando total compatibilidad entre las siguientes versiones específicas:
- **Angular CLI:** `21.2.9`
- **Node.js:** `22.18.0`
- **NPM:** `10.9.3`
- **Ionic CLI:** `7.2.1`
- **Motor Nativo:** `Cordova` (Cumpliendo el requerimiento estricto de evitar Capacitor).
- **TypeScript:** Modo Estricto habilitado.
- **RxJS:** Gestión reactiva del estado.
- **Estilos:** SCSS (SASS).
- **Base de Datos Local:** `@ionic/storage-angular` + SQLite nativo.

---

## 🏗 Arquitectura y Decisiones Técnicas

El proyecto sigue una aproximación híbrida entre **Clean Architecture** y la arquitectura recomendada por Angular, priorizando el desacoplamiento:

1. **Separation of Concerns (SoC):** 
   - La lógica de negocio y persistencia se aisla en la capa `core/services`.
   - Las vistas de Ionic (`pages/`) se limitan a actuar como *Smart Components*.
2. **Programación Reactiva y Memory Management:**
   - Todo el estado fluye a través de `BehaviorSubject` y se consume en las vistas mediante el *pipe* `async`.
   - Esto **previene fugas de memoria** ya que Angular maneja la suscripción y des-suscripción nativamente.
3. **Alto Rendimiento (Performance):**
   - **OnPush Strategy:** Todos los componentes utilizan `ChangeDetectionStrategy.OnPush` para minimizar re-renderizados innecesarios y ahorrar recursos en dispositivos móviles.
   - **TrackBy:** Implementado en todas las directivas `*ngFor` para reciclar eficientemente los nodos del DOM.
   - **Lazy Loading:** Las rutas en `app-routing.module.ts` aprovechan `loadComponent` para cargar los "Standalone Components" bajo demanda, optimizando el *bundle size*.
4. **Standalone Components:** 
   - Uso de componentes modernos independientes (sin declaración en *NgModules*) que facilitan su testabilidad y reutilización, como el `TaskFormComponent` y el `CategorySelectorComponent`.
5. **ControlValueAccessor:**
   - El selector visual de categorías se construyó desde cero implementando esta interfaz, permitiendo su integración perfecta dentro del ecosistema `ReactiveFormsModule`.

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── core/                  # Singleton services, guards, interceptors, models
│   │   ├── interfaces/        # Modelos de datos estrictos (Task, Category)
│   │   └── services/          # Lógica de negocio (CRUD) y configuración remota
│   ├── shared/                # Componentes reutilizables, UI presentacional
│   │   └── components/        # task-item, task-form, category-selector
│   ├── pages/                 # Módulos Lazy-Loaded (Vistas y Controladores)
│   │   ├── tasks/             # Pantalla principal con filtros y buscador
│   │   └── categories/        # Pantalla de gestión de categorías
│   ├── app.component.ts       # Layout base
│   └── app-routing.module.ts  # Enrutamiento moderno
├── environments/              # Variables de Firebase y entorno
└── theme/                     # Tokens de diseño y variables globales SCSS
```

---

## ⚙️ Instalación y Requisitos

**Prerequisitos de máquina:**
- Tener instalado `Node.js 22.18.0`.
- Tener Ionic y Cordova instalados globalmente: `npm install -g @ionic/cli cordova`.

**Paso a paso:**
1. Clona este repositorio o descomprime el proyecto.
2. Navega al directorio raíz: `cd to-do-list`
3. Instala las dependencias: 
   ```bash
   npm install --legacy-peer-deps
   ```

---

## 💻 Ejecución Local (Navegador)

Para ejecutar la aplicación y probarla con *Live Reload* en el navegador:

```bash
ionic serve
```

---

## ☁️ Firebase y Feature Flags (Remote Config)

La aplicación implementa Firebase Remote Config. Se utiliza una cuenta "demo" pre-configurada en `src/environments/environment.ts`. 

### Feature Flag: `enable_categories`
- **Si es `true`:** La aplicación muestra un botón para acceder a las categorías en el menú superior, activa el filtro rápido en la pantalla de tareas mediante *chips* interactivos, y habilita el selector visual en el modal de creación.
- **Si es `false`:** Toda la funcionalidad y UI relacionada con las categorías se oculta automáticamente de forma reactiva.

### Feature Flag: `enable_dark_mode`
- **Si es `true`:** La aplicación muestra un botón en ion-toolbar que permite activar o desactivar el modo oscuro.
- **Si es `false`:** La opción de modo oscuro permanece oculta para el usuario.


---

## 📱 Compilación Nativa Híbrida (Android / iOS)

Este proyecto está forzado a usar **Cordova** en lugar de Capacitor. Se proporciona una guía completa en el archivo adjunto al proyecto:

👉 **[Ver Guía Completa de Construcción en cordova-build-guide.md](./cordova-build-guide.md)**

*Breve resumen de comandos:*
```bash
ionic cordova platform add android
ionic cordova platform add ios
ionic cordova run android
```
*(Para exportables APK/IPA revisa la guía adjunta).*

---
*Desarrollado con Arquitectura Clean + Angular Moderno + Ionic.*
