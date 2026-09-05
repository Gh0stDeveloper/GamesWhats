# GamesWhats

Bot de WhatsApp dedicado exclusivamente a **mini juegos HTML interactivos que se renderizan dentro del propio mensaje de WhatsApp**.

No incluye economía, RPG, IA generativa, descargas, moderación, tienda ni otros módulos. Su objetivo es aislar y documentar el mismo tipo de experiencia interactiva usada por juegos como Dino, Ninja y Mario.

## Juegos incluidos

| Comando | Juego | Tipo |
| --- | --- | --- |
| `.mario` | Mini Mario | Plataformas táctiles |
| `.dino` | Dino Runner | Runner |
| `.ninja` | Ninja Fruit Slice | Corte táctil |
| `.snake` | Snake | Arcade clásico |
| `.spacedodge` | Space Dodge | Esquivar obstáculos |
| `.doom` | Mini Doom | Arena shooter |
| `.gato` | Gato | Tres en raya contra IA local |
| `.damas` | Damas | Tablero táctil contra IA local |
| `.games` / `.juegos` | Catálogo | Ayuda |

Todos los juegos son autocontenidos: CSS, HTML y JavaScript están incluidos en el payload del mensaje. No cargan recursos HTTP externos.

## Cómo se ve un juego dentro de WhatsApp

GamesWhats no envía un archivo `.html` ni una URL. Construye un mensaje especial con esta ruta lógica:

```text
botForwardedMessage
└── richResponseMessage
    └── unifiedResponse.data
        └── Base64(JSON)
            └── GenAISingleLayoutViewModel
                └── GenAIaeacdsnwHtmlPrimitive
                    └── payload = HTML del juego
```

El cliente de WhatsApp compatible reconoce ese primitive interno y renderiza el HTML como una superficie interactiva dentro del chat. Por eso un `<canvas>`, los botones táctiles y el JavaScript funcionan como una miniaplicación incrustada en el mensaje.

La explicación completa está en:

```text
docs/WHATSAPP_HTML_TRANSPORT.md
```

> Este formato es interno/no documentado públicamente por WhatsApp y puede cambiar entre versiones. Que Baileys consiga relanzar el mensaje no garantiza que todos los clientes existentes lo rendericen.

## Arquitectura

```text
src/
├── index.ts               # conexión + parser de comandos
├── pair.ts                # QR / pairing por número
├── session.ts             # sesión Baileys
├── html-transport.ts      # richResponseMessage + HTML primitive
├── config.ts
├── logger.ts
└── games/
    ├── index.ts
    ├── shared.ts
    ├── mario.ts
    ├── dino.ts
    ├── ninja.ts
    ├── snake.ts
    ├── space-dodge.ts
    ├── doom.ts
    ├── gato.ts
    └── damas.ts
```

La capa de transporte y los juegos están separados. Para añadir un juego nuevo solo se necesita crear otro builder HTML y registrarlo en `src/games/index.ts`; no es necesario modificar la sesión de WhatsApp.

## Requisitos

- Node.js 24+
- npm 11+
- una cuenta de WhatsApp para vincular como dispositivo adicional

## Instalación rápida

```bash
git clone https://github.com/Gh0stDeveloper/GamesWhats.git
cd GamesWhats
npm install
cp .env.example .env
npm run build
npm run pair
npm start
```

Para VPS/systemd consulta:

```text
docs/INSTALL_VPS.md
```

## Vinculación

QR recomendado:

```bash
npm run pair
```

También puede usarse pairing por número:

```bash
PAIRING_METHOD=code PAIRING_NUMBER=525512345678 npm run pair
```

La sesión se guarda en `data/session/` y esa ruta está ignorada por Git.

## Variables de entorno

```dotenv
PREFIX=.
SESSION_DIR=./data/session
LOG_LEVEL=info
RICH_BOT_JID=867051314767696@bot
```

`RICH_BOT_JID` pertenece al sobre compatible de rich responses. No representa el JID de la cuenta que ejecuta GamesWhats.

## Desarrollo

```bash
npm run dev
npm run typecheck
npm run build
npm run smoke
```

El smoke valida:

- exactamente 8 juegos HTML;
- builders autocontenidos;
- ausencia de URLs HTTP/HTTPS dentro de los juegos;
- presencia de los campos críticos del rich response;
- aliases principales de comandos.

## CI

GitHub Actions usa Node 24 y ejecuta:

```text
npm install
npm run typecheck
npm run build
npm run smoke
```

## Por qué el servidor no procesa cada movimiento

Después de enviar el mensaje, la partida ocurre en el cliente de WhatsApp:

- `requestAnimationFrame()` actualiza los juegos de canvas;
- `pointerdown` y `pointermove` reciben los toques;
- las colisiones se calculan localmente;
- la IA de Gato y Damas se ejecuta localmente;
- el score vive en esa instancia del mensaje.

El servidor Node.js solo recibe el comando inicial y envía el payload HTML. No recibe una petición por cada salto, disparo o movimiento.

## Alcance deliberado

GamesWhats es únicamente un bot/laboratorio de juegos HTML embebidos en WhatsApp. Mantener ese alcance reducido facilita estudiar el transporte, probar compatibilidad y desarrollar nuevos juegos sin arrastrar dependencias de un bot multipropósito.
