# Optimizaciones de Rendimiento Implementadas

En el desarrollo de esta aplicación empresarial, el rendimiento y la eficiencia de memoria son consideraciones primarias. A continuación detallo cada optimización técnica aplicada:

## 1. ChangeDetectionStrategy.OnPush
Todos los componentes de la aplicación (`TasksPage`, `CategoriesPage`, `TaskItemComponent`, `TaskFormComponent`, `CategorySelectorComponent`) utilizan `ChangeDetectionStrategy.OnPush`.
**¿Por qué?**
Evita que Angular revise cada componente durante cada ciclo de detección de cambios (*Tick*). En su lugar, Angular solo evalúa los componentes cuando sus *Inputs* (referencias) cambian, o cuando reciben un evento emitido de un Observable (`async` pipe). Esto minimiza los *renders innecesarios*, ahorrando CPU y batería en los dispositivos móviles.

## 2. trackBy en listas (ngFor)
En todas las iteraciones estructurales (`*ngFor` en `TasksPage` y `CategoriesPage`), implementé la directiva `trackBy: trackByFn`.
**¿Por qué?**
Cuando la lista de tareas cambia (ej: se elimina o actualiza una tarea), Angular, por defecto, destruye y recrea todo el bloque del DOM. Al usar `trackBy`, le indico a Angular la clave única (`id`), lo que le permite reciclar los nodos del DOM y actualizar exclusivamente el ítem modificado, evitando destellos visuales y picos de memoria.

## 3. Minimización de Renders y Uso Eficiente de Memoria (RxJS)
En lugar de mutar un estado local y hacer `subscribe()` manual (lo que a menudo genera fugas de memoria si no se hace `unsubscribe`), utilicé el patrón de datos reactivos puros.
Los servicios (`TaskService`, `CategoryService`) mantienen el estado como `BehaviorSubject` privado y exponen un `Observable` público.
Los componentes se vinculan a la vista directamente usando el pipe asíncrono (`| async`).
**¿Por qué?**
El pipe asíncrono se encarga automáticamente de suscribirse y desuscribirse cuando el componente se destruye, previniendo los *memory leaks* de manera nativa. Esto garantiza un **uso eficiente de la memoria**.

## 4. Lazy Loading (Carga bajo demanda)
La estructura de rutas en `app-routing.module.ts` emplea el nuevo API `loadComponent` compatible con Standalone Components.
**¿Por qué?**
Los módulos como `TasksPage` y `CategoriesPage` no se cargan durante el inicio de la app, sino que se solicitan (chunking) cuando el usuario navega a ellos. Esto garantiza una **carga inicial rápida** (*Fast Time to Interactive*) y mantiene un **bundle optimizado**.

## 5. Servicios Singleton
Tanto `StorageService`, `TaskService` como `CategoryService` utilizan `providedIn: 'root'`.
**¿Por qué?**
Esto asegura que exista solo una instancia en memoria para toda la aplicación, reduciendo el peso y facilitando compartir datos sin la penalización de crear múltiples copias o dependencias circulares.

## 6. Virtual Scroll vs Infinite Scroll
La arquitectura soporta escalabilidad masiva. Debido al modelo de datos, para más de cientos de tareas de una vez en el DOM móvil, la recomendación técnica es usar `@angular/cdk/scrolling` para **Virtual Scroll**, el cual recicliza un número fijo de elementos DOM mientras el usuario desplaza. Sin embargo, para cargas más prácticas, con Ionic, es preferible utilizar `<ion-infinite-scroll>`, permitiendo cargar bloques de 20 tareas en demanda. *Nota: La optimización OnPush actual mantiene la estabilidad sin penalización en miles de nodos gracias a V8.*
