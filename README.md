# SP Digitales CRM

CRM premium mobile-first para administrar ventas y renovaciones de SP Digitales. Fase 1 usa datos de ejemplo detrás de una interfaz de datos (`lib/data`). La integración real con Google Sheets está preparada y solo vive del lado servidor. En Fase 1 se usa `DATA_SOURCE=mock`; al pasar a `DATA_SOURCE=sheets`, el adaptador lee las columnas indicadas.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + componentes estilo shadcn/ui
- Recharts
- Google Sheets API preparada con service account
- Autenticación de un único admin mediante cookie httpOnly
- Deploy pensado para Vercel

## 1. Crear el proyecto

```bash
git clone TU_REPO
cd sp-digitales-crm
npm install
cp .env.example .env.local
```

Completa `ADMIN_PASSWORD` y `AUTH_SECRET`.

Para ejecutar:

```bash
npm run dev
```

Abrí `http://localhost:3000`.

## 2. GitHub

```bash
git init
git add .
git commit -m "feat: SP Digitales CRM phase 1"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sp-digitales-crm.git
git push -u origin main
```

## 3. Google Cloud / service account para Fase 2

1. Crear un proyecto en Google Cloud.
2. Habilitar **Google Sheets API**.
3. Crear una **Service Account**.
4. Crear una clave JSON para esa cuenta.
5. Copiar el email de la service account.
6. Compartir la hoja de Google Sheets con ese email como **Editor**.
7. En Vercel cargar:
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

La private key debe guardarse como secreto de Vercel. Si se pega con saltos de línea escapados, el adaptador los normaliza.

## 4. Deploy en Vercel

1. Importar el repo desde GitHub.
2. Framework: Next.js.
3. Agregar las variables de `.env.example`.
4. Para Fase 1 usar `DATA_SOURCE=mock`.
5. Deploy.

## 5. Fase 2

Cuando se conecte Sheets, `DATA_SOURCE=sheets` y se implementará el repositorio de Sheets usando exactamente estas hojas y columnas:

- Clientes: A:N — whatsapp, nombre, plan, monto, estadoPago, fechaCompra, fechaActivacion, vencimiento, vigente, referenciaPago, idMercadoPago, correo, contrasena, dni.
- Historial completo: fecha, numero, rol, mensaje.
- Cuentas: ID Cuenta, Email, Contraseña, Perfil 1 a 5.
- Cuentas cambiadas: Email, Contraseña, PIN.
- Ventas revendedor: fecha de venta, revendedor, cliente final, plan, monto, correo, contraseña, activación, vencimiento, perfiles, estado.
- Eventos: fecha, hora, tipo, numero, nombre, detalle (la crea el bot solo).
- Conocimiento: id, categoria, titulo, contenido, activo, actualizado (la crea el bot solo).
- Estado: heartbeat con última actividad del bot (la crea el bot solo).
- Configuracion: clave, valor — precios editables desde el CRM (la crea el bot solo).
- Comandos: id, tipo, estado, creado, resultado — acciones remotas tipo "forzar avisos de vencimiento" (la crea el bot solo).

## Seguridad

- Nunca subir `.env.local`.
- Las credenciales de Google jamás llegan al navegador.
- Las contraseñas de cuentas aparecen ocultas por defecto.
- Las mutaciones pasan por rutas de servidor.
- Cambiar `ADMIN_PASSWORD` y `AUTH_SECRET` antes de publicar.

## Nota sobre el bot

El CRM no se conecta a `whatsapp-web.js` directamente. Google Sheets funciona como puente en los dos sentidos:

- El **bot** (index.js actualizado, sección "PUENTE CON EL CRM") crea y mantiene 5 pestañas nuevas: `Eventos`, `Estado`, `Conocimiento`, `Configuracion` y `Comandos`. Las crea solo la primera vez que arranca si no existen.
- El **CRM** lee todas las pestañas (las de siempre + estas 5) en cada carga, y escribe directamente en `Clientes`, `Conocimiento`, `Configuracion` y `Comandos` cuando usás el panel (crear/editar/borrar cliente, agregar conocimiento, cambiar precios, forzar avisos de vencimiento).

Esto permite que el dashboard sea útil aunque la PC que ejecuta el bot esté apagada (vas a ver "Bot offline" y los últimos datos que se sincronizaron), y que las acciones que sí necesitan al bot corriendo (mandar mensajes reales de WhatsApp) queden como un "comando pendiente" hasta que el bot vuelva a estar online y lo ejecute.

### Cómo funciona cada pestaña nueva

- **Eventos** (fecha, hora, tipo, numero, nombre, detalle): el bot manda ahí cada evento que ya venía guardando internamente (ventas, incidencias resueltas, derivaciones, etc.), cada 1 minuto. Alimenta el dashboard de "Comportamiento del bot".
- **Estado** (ultimaActividad, estado): heartbeat del bot, cada 1 minuto. El CRM lo usa para mostrar "Bot online"/"Bot offline".
- **Conocimiento** (id, categoria, titulo, contenido, activo, actualizado): lo que cargues acá desde el CRM, el bot lo lee cada 1 minuto y lo suma de verdad al prompt que usa para responder — no es solo decorativo.
- **Configuracion** (clave, valor): hoy solo tiene los precios (`precio_1` a `precio_4`, `descuento_reventa`). Cambiarlos desde el CRM actualiza lo que cobra el bot en menos de 1 minuto, sin tocar código.
- **Comandos** (id, tipo, estado, creado, resultado): el CRM agrega una fila con estado `PENDIENTE` cuando apretás una acción (por ahora: "Forzar avisos de vencimiento"); el bot la ve, la ejecuta de verdad (manda los WhatsApp), y escribe el resultado ahí mismo.

Si el service account de Google no tiene permiso de "Editor" sobre la hoja (no solo "Viewer"), tanto el bot como el CRM van a fallar al intentar crear o escribir en estas pestañas.

## Fase 2 — estructura real de SP Digitales

La adaptación del adaptador de Google Sheets se hizo contra el archivo real entregado para esta fase. Las pestañas detectadas son:

- `Cuentas` — A:H
- `Clientes` — A:O (incluye `Enviar cuenta`)
- `Cuentas cambiadas` — A:C
- `Imagenes` — A:B
- `Historial completo` — A:D
- `Ventas revendedor` — A:M (incluye `Fila cuenta` y `Correo anterior`)
- `En revisión` — A:A

Con el bot actualizado (sección "PUENTE CON EL CRM" en index.js), las pestañas `Eventos`, `Conocimiento`, `Estado`, `Configuracion` y `Comandos` se crean solas la primera vez que el bot arranca — no hace falta crearlas a mano. Con un bot viejo sin ese código, esas colecciones simplemente se leen vacías (el CRM no se rompe, solo no tiene esos datos).

El `GOOGLE_SHEET_ID` del `.env.example` corresponde al archivo proporcionado en esta fase.
