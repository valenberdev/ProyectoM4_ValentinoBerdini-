# ◆ Gestor de Tareas

SPA de gestión de tareas con autenticación, persistencia en la nube y notificaciones por email, desarrollada como Proyecto Integrador 4 para MateCode.

**🔗 URL de producción:** https://proyecto-m4-valentino-berdini.vercel.app

---

## Descripción del proyecto

Aplicación web que permite a los usuarios registrarse, gestionar sus tareas diarias (crear, editar, eliminar, marcar como completadas) y recibir un resumen de su estado por email. Cada usuario solo puede ver y modificar sus propias tareas, con persistencia en tiempo real en la nube.

**Stack:**
- **Frontend:** React + TypeScript + Vite
- **Backend as a Service:** Firebase (Authentication + Firestore)
- **Notificaciones:** AWS SES, invocado desde una Vercel Function
- **Deploy:** Vercel
- **Testing:** Vitest + React Testing Library
- **Drag & drop:** dnd-kit

**Funcionalidades principales:**
- Registro y login con email/contraseña y con Google
- Rutas protegidas según estado de autenticación
- CRUD completo de tareas, sincronizado en tiempo real (`onSnapshot`)
- Filtros por estado (todas / pendientes / completadas)
- Ordenamiento por prioridad o fecha de vencimiento
- Reordenamiento manual por drag & drop
- Envío de resumen de tareas por email
- Tema claro/oscuro con persistencia en `localStorage`
- Diseño mobile-first

---

## Decisiones arquitectónicas

**Organización por capas.** El código está separado en `pages/` (vistas), `components/` (UI reutilizable), `features/` (lógica de negocio por dominio: `auth`, `tasks`), `services/` (integración con Firebase), `hooks/`, `types/` y `utils/`. Los componentes de UI no llaman directamente a Firebase: siempre pasan por `authService.ts` o `taskService.ts`, lo que permite testear componentes con mocks simples sin tocar servicios reales.

**Modelo de datos `Task`.** El campo `dueDate` se tipó como `Date | null` (en vez de opcional, `Date?`) a propósito: obliga a manejar explícitamente el caso "sin fecha" en cada lugar del código donde se usa, en vez de permitir que se olvide un chequeo.

**Conversión de Timestamps.** Firestore no guarda objetos `Date` nativos, sino `Timestamp`. Se centralizó la conversión en una única función (`convertirDocumentoATask`) para evitar repetir esta lógica en cada punto de lectura. Durante el desarrollo del drag & drop apareció un bug real: al escribir varias tareas en paralelo, Firestore emite un estado "optimista" local donde `serverTimestamp()` aún no se resolvió (llega como `null`) antes de la confirmación del servidor. Se resolvió con un valor de respaldo (`new Date()`) mientras se espera la confirmación real.

**Reglas de seguridad de Firestore.** Se gestionan vía Firebase CLI (`firestore.rules` + `firebase deploy --only firestore:rules`) en vez del editor web de Firebase Console, que presentaba errores de parseo con caracteres invisibles al pegar contenido. Las reglas verifican `request.auth.uid == resource.data.userId` en lectura/escritura, y se probó explícitamente que un usuario no puede leer las tareas de otro.

**Vulnerabilidad de `react-router` (GHSA-qwww-vcr4-c8h2).** Al instalar dependencias de AWS SDK, `npm audit` reportó una vulnerabilidad "high" en `react-router` (CSRF bypass en modo RSC). Se evaluó el advisory oficial: **solo afecta a aplicaciones que usan las APIs inestables de React Server Components**. Este proyecto usa el modo declarativo clásico (`<BrowserRouter>`, `<Routes>`/`<Route>`), sin RSC ni Framework Mode, por lo que se decidió **no** aplicar el fix sugerido (`npm audit fix --force`), que hubiera implicado un upgrade mayor con breaking changes para resolver una vulnerabilidad no explotable en esta arquitectura.

**Variables de entorno con y sin prefijo `VITE_`.** Las credenciales de Firebase llevan el prefijo `VITE_` porque el SDK corre en el navegador y necesita esos valores en el bundle. Las credenciales de AWS **no** llevan ese prefijo: deben quedar exclusivamente en el servidor (Vercel Function), nunca en el código que se envía al cliente.

**SPA rewrites en Vercel.** Al probar el deploy con usuarios externos, entrar directo a una ruta como `/login` devolvía 404, porque Vercel buscaba un archivo físico en esa ruta. Se agregó `vercel.json` con un rewrite a `index.html` para que el router de React maneje el resto del ruteo del lado del cliente.

---

## Instalación local

```bash
git clone <https://github.com/valenberdev/ProyectoM4_ValentinoBerdini->
cd gestor-tareas
npm install
```

Crear un archivo `.env` en la raíz (ver plantilla en `.env.example`) con las variables detalladas abajo.

```bash
npm run dev
```

Para correr también las Vercel Functions localmente (necesario para probar el envío de emails):

```bash
npm install -g vercel
vercel dev
```

Para correr los tests:

```bash
npm run test
```

---

## Variables de entorno

| Variable | Prefijo `VITE_` | Descripción |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Sí | API key del proyecto de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Sí | Dominio de autenticación de Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Sí | ID del proyecto de Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Sí | Bucket de almacenamiento de Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sí | Sender ID de Firebase Messaging |
| `VITE_FIREBASE_APP_ID` | Sí | ID de la app de Firebase |
| `AWS_ACCESS_KEY_ID` | No | Access Key del usuario IAM con permisos de SES |
| `AWS_SECRET_ACCESS_KEY` | No | Secret Key del usuario IAM |
| `AWS_REGION` | No | Región de AWS SES (ej. `us-east-2`) |
| `SES_SENDER_EMAIL` | No | Email remitente verificado en SES |

Las variables sin prefijo `VITE_` solo son accesibles desde las Vercel Functions (`api/`), nunca desde el bundle del navegador. En producción, las 10 variables están cargadas en Vercel para los entornos **Production** y **Preview**.

---

## Flujo de envío de emails

1. El usuario hace click en "Enviar resumen por email" desde `TasksPage`.
2. El frontend arma un resumen (`armarResumenTareas` en `taskService.ts`): separa tareas pendientes (ordenadas por prioridad) y completadas.
3. Se hace un `POST` a `/api/send-summary` con el email del usuario (`user.email` de Firebase Auth) y el resumen ya procesado.
4. La Vercel Function (`api/send-summary.ts`) arma el HTML del email (con estilos inline, compatible con clientes de correo) y llama a AWS SES usando el SDK, con credenciales que existen únicamente en el entorno de servidor.
5. AWS SES envía el email; la función responde `200` o `500` según el resultado, y el frontend refleja el estado de carga/error.

**Nota:** la cuenta de AWS SES está en modo sandbox, por lo que solo puede enviar a direcciones de email verificadas manualmente en la consola de AWS.

---

## Uso de IA en el proceso de trabajo

Usé Claude como asistente de desarrollo guiado, con un enfoque deliberado: pedí explicaciones y guía socrática en vez de código resuelto, para asegurarme de entender cada pieza antes de avanzar. Algunos ejemplos concretos:

- **Conceptos nuevos explicados antes de implementarlos:** antes de escribir `onAuthStateChanged` o `onSnapshot`, pedí que me explicaran qué hacían y por qué, en vez de copiarlos directamente. Esto me permitió anticipar y entender por qué `ProtectedRoute` necesita un estado `loading` además de `user` — sin ese estado intermedio, un usuario con sesión activa podía ser redirigido incorrectamente al login por una fracción de segundo al recargar la página.

- **Debugging real, no solo generación de código:** varios errores los diagnostiqué yo mismo con guía (por ejemplo, el error de "Cannot read properties of null (reading toDate)" durante el drag & drop, causado por `serverTimestamp()` sin resolver en escrituras optimistas de Firestore), entendiendo la causa raíz en vez de aplicar un parche a ciegas.

- **Decisiones con trade-offs explícitos:** para el campo `dueDate`, elegí `Date | null` en vez de opcional a propósito, sabiendo que implicaba más chequeos en el código pero menos bugs por casos no contemplados. Para la vulnerabilidad de `react-router`, evalué el advisory oficial antes de decidir no aplicar el fix, en vez de correr `npm audit fix --force` sin entender el impacto real.

- **Patrones que reutilicé sin que me los repitieran:** el patrón de narrowing de TypeScript (`if (!user) return null` + guardar en una constante `currentUser`) lo apliqué en `TodoForm` y después en `TasksPage` sin que se me explicara de nuevo, una vez que entendí por qué era necesario dentro de closures.

- **Buenas prácticas que descubrí a partir de su uso:** separar la lógica de negocio (`taskService.ts`) de los componentes de UI, para que estos últimos reciban funciones como props en vez de importar servicios directamente — esto simplificó mucho el mockeo en los tests de `TodoForm`.

---

**Autor:** Valentino Berdini