# Entrevista Técnica: Decisiones y Desafíos

A continuación, presento mis respuestas técnicas fundamentadas como Tech Lead / Senior Mobile Architect, detallando las decisiones tomadas durante el desarrollo de la aplicación To-Do List Híbrida.

---

### 1. ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

El desafío principal radicó en **orquestar un stack tecnológico con requisitos estrictos de versionamiento cruzado**, específicamente la combinación de un motor nativo clásico (Cordova) con el ecosistema web ultra-moderno de Angular 21 (usando su nuevo *application builder* esbuild) y el ecosistema de Ionic 7.2. 

1. **Gestión de Cordova vs Capacitor:** Aunque el ecosistema moderno impulsa a migrar a Capacitor, el requerimiento de usar Cordova me obligó a diseñar una estrategia de construcción donde el `angular.json` y el `baseHref` debían estar perfectamente configurados para que los artefactos compilados cayeran en la carpeta `www` nativa, sin romper el enrutamiento interno en los WebViews nativos.
2. **Feature Flags asíncronos en Ionic:** Implementar *Firebase Remote Config* para ocultar dinámicamente un módulo completo (Categorías) presentaba el reto de las "condiciones de carrera" (race conditions). Si la UI cargaba antes que la respuesta de Firebase, habría *flashes* visuales. Lo resolví implementando un `RemoteConfigService` con un `BehaviorSubject` inicializado con valores seguros (fallback), asegurando que la reactividad de RxJS manejara la sincronización del DOM transparentemente usando el pipe `async`.
3. **Persistencia Híbrida Segura:** Lograr que la misma aplicación persista datos limpiamente en un navegador (IndexedDB) durante el desarrollo y en SQLite puro al correr nativamente en un dispositivo requirió configurar `@ionic/storage-angular` como un adaptador universal, abstrayendo completamente esta complejidad de la capa de lógica de negocio (`TaskService`).

---

### 2. ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

Para garantizar una experiencia fluida (60 FPS) y un consumo mínimo de memoria en dispositivos móviles (donde los recursos son limitados y el Garbage Collector de V8 puede causar *jank*), apliqué las siguientes técnicas de optimización *enterprise-grade*:

1. **ChangeDetectionStrategy.OnPush:** 
   Implementado en todos los componentes. Por defecto, Angular revisa cada componente de la aplicación entera cada vez que ocurre un evento asíncrono. Al forzar `OnPush`, le indico al motor de renderizado que **solo** recalcule el DOM de un componente si sus `@Input()` cambian por referencia o si un evento es emitido explícitamente desde un `Observable` que la vista consume. Esto recorta drásticamente el árbol de validación y minimiza el uso de CPU.
2. **Reutilización del DOM mediante `trackBy`:**
   En las listas (`*ngFor`), proveer la función `trackBy` basada en el `id` único de la tarea o categoría impide que Angular destruya y reconstruya elementos del DOM innecesariamente. Esto es vital para las animaciones y acciones *Swipe* (`<ion-item-sliding>`).
3. **Gestión Reactiva de Memoria (Zero Memory Leaks):**
   Erradiqué las llamadas a `.subscribe()` manuales en la capa de vista. Todos los componentes se conectan a los flujos de datos (BehaviorSubjects) utilizando el *pipe* `| async` en el HTML. Esto garantiza que Angular destruya automáticamente las suscripciones cuando el componente se desmonta (ej: al navegar hacia atrás), logrando un manejo perfecto de la memoria (heap).
4. **Standalone Components & Lazy Loading:**
   Adopté los *Standalone Components* de las nuevas APIs de Angular. Esto permitió eliminar el exceso de *NgModules* e inyectar `TasksPage` y `CategoriesPage` de forma 100% perezosa (*Lazy Loaded*) en el router, reduciendo el tamaño del bundle inicial y acelerando el *Time to Interactive* (TTI).

---

### 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

La mantenibilidad a largo plazo es el rasgo definitorio de un código Senior. Lo aseguré implementando una variante estricta de **Clean Architecture** adaptada al ecosistema de Angular:

1. **Separation of Concerns (Desacoplamiento):**
   - Dividí el proyecto en `core/` (Lógica de dominio, interfaces de datos, servicios singleton) y `shared/` (Componentes visuales puros o *Dumb Components*).
   - Los componentes visuales (como `TaskItemComponent`) no saben absolutamente nada sobre Firebase, Storage o lógica de negocio. Solo reciben un `@Input()` y emiten `@Output()`. Esto los hace altamente reutilizables y muy fáciles de testear unitariamente (Unit Testing).
2. **Principio de Responsabilidad Única (SOLID):**
   - El `TaskService` solo maneja tareas. El `CategoryService` maneja validaciones de duplicados y categorías. El `StorageService` abstrae el origen de la base de datos subyacente. Si en el futuro se decide migrar de Ionic Storage a Realm, o de Firebase a LaunchDarkly para Feature Flags, solo se toca una clase central sin afectar la capa visual.
3. **Tipado Estricto (TypeScript):**
   - Habilité validaciones fuertes. Todas las entidades de negocio implementan una `interface` explícita, y las enumeraciones de dominio (ej: `TaskPriority`) están selladas con tipos lógicos (`'low' | 'medium' | 'high'`), evitando errores en tiempo de ejecución.
4. **Diseño Extensible para Formularios:**
   - Para el selector visual de categorías (`CategorySelectorComponent`), en lugar de crear simples eventos de clic, invertí el tiempo en implementar la interfaz nativa `ControlValueAccessor`. Esto convirtió mi componente personalizado en un elemento de formulario estándar, capaz de ser validado y gestionado por la API robusta de `ReactiveFormsModule` como si fuera un input nativo `<input>`.
