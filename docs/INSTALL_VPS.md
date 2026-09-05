# Instalación de GamesWhats en Ubuntu VPS

## Requisitos

- Ubuntu 22.04/24.04.
- Node.js 24 o superior.
- npm 11 o superior.
- Git.

## Instalar

```bash
git clone https://github.com/Gh0stDeveloper/GamesWhats.git
cd GamesWhats
npm install
cp .env.example .env
npm run build
```

## Vincular WhatsApp

QR recomendado:

```bash
npm run pair
```

Elige `QR`, abre WhatsApp > Dispositivos vinculados > Vincular un dispositivo y escanea el código.

También existe pairing por número:

```bash
PAIRING_METHOD=code PAIRING_NUMBER=525512345678 npm run pair
```

La sesión queda guardada en `data/session/` por defecto.

## Ejecutar

```bash
npm start
```

Prueba desde WhatsApp:

```text
.games
.dino
.ninja
.mario
```

## systemd

Copia el ejemplo incluido:

```bash
sudo cp deploy/gameswhats.service /etc/systemd/system/gameswhats.service
sudo systemctl daemon-reload
sudo systemctl enable --now gameswhats
sudo systemctl status gameswhats --no-pager
```

El unit file presupone que el repositorio está en `/opt/gameswhats`. Si lo instalaste en otra ruta, modifica `WorkingDirectory` y `ExecStart`.

## Actualizar

```bash
cd /opt/gameswhats
git fetch origin
git reset --hard origin/main
npm install
npm run build
sudo systemctl restart gameswhats
```

La carpeta `data/session/` está ignorada por Git y no se elimina con una actualización normal.

## Variables

```dotenv
PREFIX=.
SESSION_DIR=./data/session
LOG_LEVEL=info
RICH_BOT_JID=867051314767696@bot
```

No cambies `RICH_BOT_JID` salvo que estés probando deliberadamente otra variante del sobre rich-response.
