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
- NUEVAS / Eventos: fecha, hora, tipo, numero, nombre, detalle.
- NUEVAS / Conocimiento: id, categoria, titulo, contenido, activo, actualizado.
- NUEVAS / Estado: heartbeat con última actividad del bot.

### Nota sobre NUEVAS
El adaptador asume que `NUEVAS` es una pestaña que contiene los bloques de Eventos, Conocimiento y Estado. Si en tu archivo real son tres pestañas separadas, no se agregan columnas: se cambian únicamente los nombres de rango en `lib/data/sheets.ts`.

## Seguridad

- Nunca subir `.env.local`.
- Las credenciales de Google jamás llegan al navegador.
- Las contraseñas de cuentas aparecen ocultas por defecto.
- Las mutaciones pasan por rutas de servidor.
- Cambiar `ADMIN_PASSWORD` y `AUTH_SECRET` antes de publicar.

## Nota sobre el bot

El CRM no se conecta a `whatsapp-web.js`. Google Sheets funciona como puente. Esto permite que el dashboard sea útil aunque la PC que ejecuta el bot esté apagada.

## Fase 2 — estructura real de SP Digitales

La adaptación del adaptador de Google Sheets se hizo contra el archivo real entregado para esta fase. Las pestañas detectadas son:

- `Cuentas` — A:H
- `Clientes` — A:O (incluye `Enviar cuenta`)
- `Cuentas cambiadas` — A:C
- `Imagenes` — A:B
- `Historial completo` — A:D
- `Ventas revendedor` — A:M (incluye `Fila cuenta` y `Correo anterior`)
- `En revisión` — A:A

La hoja compartida actualmente **no contiene** `NUEVAS`, `Eventos`, `Conocimiento` ni `Estado`. Por eso el CRM no inventa esas hojas: esas colecciones quedan vacías hasta que el bot las cree o se confirme otra ubicación.

El `GOOGLE_SHEET_ID` del `.env.example` corresponde al archivo proporcionado en esta fase.
