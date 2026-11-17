# Tareas App (PWA)

Aplicacion web progresiva para la gestion de tareas con React, Vite y Firebase.

## Requisitos previos

- Node.js (version 18 o superior)
- Cuenta en Firebase con un proyecto configurado

## Instalacion y ejecucion

### 1. Clonar e instalar dependencias

```bash
cd tareas-app
npm install
```

### 2. Configurar Firebase

Crea el archivo `src/firebase.js` (puedes basarte en `src/firebase.example.js`) y coloca las credenciales de tu proyecto de Firebase:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

> Nota: El archivo `src/firebase.js` se encuentra ignorado en `.gitignore` para no exponer tus credenciales en el repositorio.

### 3. Configurar servicios en Firebase Console

1. **Authentication**:
   - En la seccion *Sign-in method*, habilita los proveedores:
     - Correo electronico / contrasena
     - Google

2. **Firestore Database**:
   - En la pestana *Reglas*, copia y publica el contenido del archivo `firestore.rules`:

```firestore-security-rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /tareas/{tareaId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null 
                    && resource.data.userId == request.auth.uid
                    && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4. Iniciar el servidor local

```bash
npm run dev
```

Abre en tu navegador la URL que muestra la terminal (por ejemplo, `http://localhost:5173`).

## Funcionalidades implementadas

- **Autenticacion**: Registro e inicio de sesion con correo/contrasena y Google. Rutas protegidas y cierre de sesion.
- **Firestore en tiempo real**: Creacion, lectura, edicion, marcado de completada y eliminacion sincronizadas con `onSnapshot`.
- **Reglas de seguridad**: Solo el propietario autenticado puede ver y modificar sus propias tareas.
- **PWA**: Incluye Web App Manifest y Service Worker; se puede instalar desde el navegador.

## Comandos disponibles

- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Genera los archivos de produccion en la carpeta `dist`.
- `npm run preview`: Previsualiza la version compilada de produccion.
