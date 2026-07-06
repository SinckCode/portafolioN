# Conectar login con Google y GitHub

El código ya está listo. Solo necesitas crear las apps OAuth y pegar las
credenciales en el `.env` de esta carpeta. Al reiniciar el API, los botones
aparecen automáticamente en `/login` y `/registro` del sitio.

## GitHub (2 minutos)

1. Ve a https://github.com/settings/developers → **New OAuth App**.
2. Llena:
   - Application name: `Angel Onesto Portfolio (local)`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4000/api/auth/github/callback`
3. Crea la app → copia el **Client ID** y genera un **Client Secret**.
4. En `.env`:
   ```
   GITHUB_CLIENT_ID=tu_client_id
   GITHUB_CLIENT_SECRET=tu_client_secret
   ```

## Google (5 minutos)

1. Ve a https://console.cloud.google.com/ → crea un proyecto (o usa uno).
2. **APIs y servicios → Pantalla de consentimiento OAuth**: tipo Externo,
   nombre de la app, tu correo. Guarda.
3. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente OAuth**:
   - Tipo: Aplicación web
   - Orígenes autorizados: `http://localhost:3000`
   - URI de redireccionamiento: `http://localhost:4000/api/auth/google/callback`
4. Copia Client ID y Client Secret al `.env`:
   ```
   GOOGLE_CLIENT_ID=tu_client_id
   GOOGLE_CLIENT_SECRET=tu_client_secret
   ```

## Probar

1. Reinicia el API (`npm run start:dev`).
2. `GET http://localhost:4000/api/auth/providers` debe responder
   `{"google":true,"github":true}` (según lo que hayas configurado).
3. En `http://localhost:3000/login` aparecen los botones. El flujo:
   botón → provider → callback del API → `/auth/callback` del sitio
   (guarda tokens y entra con tu cuenta).

## Producción (cuando despliegues)

Crea OTRAS apps OAuth con las URLs reales y actualiza:
```
OAUTH_CALLBACK_BASE=https://api.tudominio.com
FRONTEND_URL=https://tudominio.com
```
