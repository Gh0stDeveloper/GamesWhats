# GamesWhats

GamesWhats es mi bot de WhatsApp dedicado exclusivamente a **mini juegos HTML interactivos que se renderizan dentro del propio mensaje de WhatsApp**.

Lo hice separado de mis otros bots para poder probar, mantener y documentar este tipo de juegos sin mezclar economía, RPG, IA generativa, descargas, moderación, tienda u otros módulos. La idea es que todos los juegos usen la misma capa de transporte y que cada juego solamente tenga que construir su HTML.

## Juegos incluidos

| Comando | Juego | Tipo |
| --- | --- | --- |
| `.mario` | Mini Mario | Plataformas táctiles |
| `.dino` | Dino Runner | Runner |
| `.ninja` | Ninja Fruit Slice | Corte táctil |
| `.snake` | Snake | Arcade clásico |
| `.tetris` | Tetris | Puzzle de bloques |
| `.pacman` / `.packman` | Pac-Man | Laberinto arcade |
| `.spacedodge` | Space Dodge | Esquivar obstáculos |
| `.doom` | Mini Doom | Arena shooter |
| `.gato` | Gato | Tres en raya contra IA local |
| `.damas` | Damas | Tablero táctil contra IA local |
| `.games` / `.juegos` | Catálogo | Ayuda |

Todos los juegos son autocontenidos: CSS, HTML y JavaScript están incluidos en el payload del mensaje. No dependen de imágenes, scripts, CDN ni recursos HTTP externos.

## Cómo explico el funcionamiento

Yo no envío el juego como un archivo `.html` ni mando al usuario a un navegador externo. Cuando alguien escribe un comando como `.mario`, `.tetris` o `.pacman`, mi bot busca el juego en el registro de `src/games/index.ts`, genera todo su HTML y se lo pasa a una única función de transporte: `sendHtmlGame()`.

Esa función construye un mensaje de WhatsApp con esta estructura lógica:

```text
botForwardedMessage
└── richResponseMessage
    └── unifiedResponse.data
        └── Base64(JSON)
            └── GenAISingleLayoutViewModel
                └── GenAIaeacdsnwHtmlPrimitive
                    └── payload = HTML del juego
```

El cliente de WhatsApp compatible recibe ese primitive interno y renderiza el HTML como una superficie interactiva dentro del chat. Por eso puedo usar `<canvas>`, controles táctiles, animaciones y JavaScript sin que el servidor tenga que procesar cada movimiento del jugador.

También centralicé este transporte para que Mario, Dino, Tetris, Pac-Man y los demás juegos se envíen exactamente por el mismo método. De esa forma no tengo juegos usando un formato distinto que pueda terminar mostrando el aviso de actualizar WhatsApp mientras otro juego sí abre correctamente.

La implementación está en:

```text
src/html-transport.ts
docs/WHATSAPP_HTML_TRANSPORT.md
```

> El formato `richResponseMessage` con `GenAIaeacdsnwHtmlPrimitive` es interno/no documentado públicamente por WhatsApp. Puedo validar que el bot construye y relanza correctamente el mensaje, pero WhatsApp puede cambiar la compatibilidad de renderizado entre versiones del cliente.

## Bibliotecas y tecnologías que uso

El proyecto está hecho principalmente con:

- [Baileys](https://github.com/WhiskeySockets/Baileys) — conexión con WhatsApp Web, sesiones, eventos, envío y relay de mensajes.
- [Node.js](https://nodejs.org/) — runtime del bot.
- [TypeScript](https://www.typescriptlang.org/) — tipado y compilación del código fuente.
- [tsx](https://github.com/privatenumber/tsx) — ejecución en modo desarrollo con recarga.
- [Pino](https://getpino.io/) — logging.
- [dotenv](https://github.com/motdotla/dotenv) — carga de variables desde `.env`.
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) — muestra el QR de vinculación directamente en la terminal.
- [@hapi/boom](https://github.com/hapijs/boom) — lectura y clasificación de errores/desconexiones que entrega Baileys.
- HTML5 Canvas + JavaScript — motor local de cada mini juego.
- [GitHub Actions](https://github.com/features/actions) — CI para typecheck, compilación y smoke tests.

No necesité añadir ninguna biblioteca de juegos para Tetris o Pac-Man: ambos están implementados directamente con Canvas y JavaScript para que sigan siendo autocontenidos.

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
    ├── index.ts           # registro y aliases
    ├── shared.ts          # frame visual común
    ├── mario.ts
    ├── dino.ts
    ├── ninja.ts
    ├── snake.ts
    ├── tetris.ts
    ├── pacman.ts
    ├── space-dodge.ts
    ├── doom.ts
    ├── gato.ts
    └── damas.ts
```

Separé la capa de transporte de la lógica de los juegos. Si quiero añadir otro juego, solamente creo un nuevo builder HTML en `src/games/` y lo registro en `src/games/index.ts`; no necesito volver a implementar la conexión ni el formato rich response.

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

Para VPS/systemd:

```text
docs/INSTALL_VPS.md
```

## Vinculación

Yo recomiendo vincular por QR:

```bash
npm run pair
```

También dejé disponible la vinculación por número:

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

## Desarrollo y comprobaciones

```bash
npm run dev
npm run typecheck
npm run build
npm run smoke
```

El smoke valida:

- exactamente 10 juegos HTML registrados;
- builders autocontenidos;
- ausencia de URLs HTTP/HTTPS dentro de los juegos;
- presencia de los campos críticos del rich response;
- aliases principales, incluyendo `.packman` → `.pacman`;
- que cada juego incluya JavaScript inline y use el frame común de GamesWhats.

## CI

Cada push ejecuta GitHub Actions con Node 24:

```text
npm install
npm run typecheck
npm run build
npm run smoke
```

Así puedo detectar antes de instalar el bot en una VPS si rompí imports, tipos, compilación, registro de juegos o el formato esperado por el transporte.

## Por qué el servidor no procesa cada movimiento

Después de enviar el mensaje, la partida ocurre en el cliente de WhatsApp:

- `requestAnimationFrame()` actualiza los juegos de canvas;
- `pointerdown` y otros eventos reciben los toques;
- las colisiones se calculan localmente;
- Tetris administra piezas y líneas localmente;
- Pac-Man administra el laberinto, puntos y fantasmas localmente;
- la IA de Gato y Damas se ejecuta localmente;
- el score vive en esa instancia del mensaje.

Mi servidor Node.js solamente recibe el comando inicial, construye el payload y lo envía. No recibe una petición por cada salto, giro, disparo o movimiento.

## Alcance

Mantengo GamesWhats como un bot/laboratorio específico para juegos HTML embebidos en WhatsApp. Eso me permite probar compatibilidad, mejorar el transporte y añadir juegos nuevos sin arrastrar dependencias de un bot multipropósito.
