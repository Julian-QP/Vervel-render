# App de tareas — React, Express y MongoDB Atlas

## Funciones

- Muestra el total de tareas completadas, por ejemplo: `3 de 5 tareas completadas`.
- El botón **Eliminar completadas** borra las tareas completadas enviando un `DELETE` por tarea, de forma secuencial.
- Haz doble clic en el título para editarlo. Pulsa Enter o haz clic fuera del campo para guardar; Escape cancela. Los cambios se guardan con `PUT`.
- Las tareas se almacenan en MongoDB Atlas y persisten entre reinicios del servidor.

## Desarrollo local

1. Crea una base de datos gratuita en MongoDB Atlas. En **Database Access**, crea un usuario y, en **Network Access**, permite la conexión desde tu entorno de desarrollo.
2. Copia `server/.env.example` a `server/.env` y reemplaza `MONGODB_URI` por la URI de conexión de tu cluster. Codifica los caracteres especiales de la contraseña en la URI. La API carga este archivo automáticamente al iniciar.
3. Instala e inicia la API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

4. En otra terminal, instala e inicia el cliente:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

5. Abre <http://localhost:5173>.

La API escucha en el puerto indicado por `PORT` (3001 localmente) y usa la base `tareas_app` de forma predeterminada.

## Despliegue

### API en Render

1. Crea un servicio **Blueprint** desde el repositorio. `render.yaml` configura `server` como directorio raíz y crea el servicio gratuito `tareas-api`.
2. En los ajustes del servicio, define `MONGODB_URI` con la URI de Atlas y `FRONTEND_URL` con el origen de tu aplicación Vercel (por ejemplo, `https://mi-app.vercel.app`, sin ruta). Para varios orígenes, sepáralos con comas.
3. En Atlas, agrega la IP de salida necesaria en **Network Access**. Si el plan de Render requiere IP de salida dinámica, Atlas permite `0.0.0.0/0`; úsalo solo con un usuario de base de datos de privilegios mínimos y una contraseña segura.
4. Comprueba que el servicio de Render esté activo y copia su URL pública, por ejemplo `https://tareas-api.onrender.com`.

### Cliente en Vercel

1. Importa el mismo repositorio como proyecto en Vercel y configura el **Root Directory** como `client`. Vercel detectará Vite y `client/vercel.json` configura el fallback de rutas.
2. En las variables de entorno del proyecto, define `VITE_API_URL` con la URL pública del servicio de Render (sin `/api/tareas`).
3. Despliega el proyecto y agrega su origen Vercel a `FRONTEND_URL` en Render. Si cambias esa variable, vuelve a desplegar o reinicia la API.

No pongas la URI de MongoDB en Vercel ni en el cliente. `MONGODB_URI` es un secreto que solo debe configurarse en Render. `VITE_API_URL` sí es pública.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/tareas` | Obtener todas las tareas |
| POST | `/api/tareas` | Crear una tarea (`{ "titulo": "..." }`) |
| PUT | `/api/tareas/:id` | Cambiar `completada` y/o `titulo` |
| DELETE | `/api/tareas/:id` | Eliminar una tarea |
