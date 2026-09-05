# Cómo GamesWhats muestra juegos HTML dentro de WhatsApp

## Resumen

GamesWhats **no envía un archivo `.html`**, no sube una página a Internet y no manda un enlace que abra Chrome. El juego viaja dentro de un mensaje de WhatsApp construido con una estructura `richResponseMessage` que contiene una vista HTML interna.

El punto central es este primitive:

```text
GenAIaeacdsnwHtmlPrimitive
```

El cliente de WhatsApp que soporta esta clase de rich response interpreta el campo `payload` como contenido HTML y crea una superficie interactiva dentro del propio mensaje. Por eso botones, canvas, eventos táctiles y JavaScript aparecen como una miniaplicación en el chat.

> Importante: esta estructura es un formato interno/no documentado públicamente por WhatsApp. Puede cambiar entre versiones del cliente. GamesWhats replica una estructura que actualmente es compatible con los clientes objetivo, pero no existe garantía de estabilidad futura por parte de WhatsApp.

## Flujo completo

Cuando alguien escribe, por ejemplo:

```text
.dino
```

ocurre lo siguiente:

```text
mensaje entrante
   |
   v
parser de comandos
   |
   v
resolveGame("dino")
   |
   v
buildDinoHtml()
   |
   |  HTML + CSS + JavaScript autocontenidos
   v
sendHtmlGame()
   |
   v
richResponseMessage
   |
   v
unifiedResponse.data = Base64(JSON)
   |
   v
GenAIaeacdsnwHtmlPrimitive.payload = HTML
   |
   v
socket.relayMessage()
   |
   v
servidores de WhatsApp
   |
   v
cliente de WhatsApp compatible
   |
   v
render de la vista HTML dentro del chat
```

## Estructura lógica del mensaje

La forma simplificada es:

```text
messageContextInfo
└── botMetadata
    └── botResponseId

botForwardedMessage
└── message
    └── richResponseMessage
        ├── messageType
        ├── submessages
        │   └── título visible
        ├── unifiedResponse
        │   └── data = Base64(JSON)
        └── contextInfo
            └── forwardedAiBotMessageInfo
```

Al decodificar `unifiedResponse.data`, el JSON tiene esta forma conceptual:

```json
{
  "response_id": "game-...",
  "sections": [
    {
      "view_model": {
        "primitive": {
          "__typename": "GenAIaeacdsnwHtmlPrimitive",
          "payload": "<style>...</style><canvas>...</canvas><script>...</script>",
          "trusted_sources": []
        },
        "__typename": "GenAISingleLayoutViewModel"
      }
    }
  ]
}
```

## Por qué se usa `botForwardedMessage`

El HTML primitive no se coloca como un `conversation` normal ni como un `extendedTextMessage`. Se envuelve dentro de `botForwardedMessage.message.richResponseMessage`, junto con metadatos de respuesta de bot.

Esto hace que el cliente trate el mensaje como una respuesta enriquecida y consulte `unifiedResponse` para construir la vista. Si simplemente se enviara el HTML como texto, WhatsApp mostraría las etiquetas literalmente. Si se enviara como documento, el usuario recibiría un archivo y tendría que abrirlo fuera del chat.

## Por qué `unifiedResponse.data` está en Base64

`unifiedResponse.data` transporta un JSON serializado. GamesWhats realiza:

```ts
Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
```

El Base64 no convierte el HTML en una imagen ni lo cifra. Solo representa el JSON como texto seguro para el campo binario/serializado esperado por el rich response.

Cuando WhatsApp interpreta el mensaje, obtiene el objeto de vista y localiza:

```text
sections[0].view_model.primitive.payload
```

Ese `payload` contiene el juego completo.

## Por qué los juegos son autocontenidos

Cada juego de GamesWhats lleva dentro de su payload:

- CSS.
- HTML.
- Canvas o elementos DOM.
- JavaScript.
- Controles táctiles.
- Estado de la partida.
- Colisiones e IA cuando corresponda.

No se utilizan imágenes, scripts, CSS ni APIs HTTP externas durante la partida.

Esto tiene varias ventajas:

1. Menos puntos de fallo.
2. No depende de CORS.
3. No depende de que un dominio externo siga disponible.
4. El juego puede comenzar en cuanto WhatsApp termina de renderizar el primitive.
5. El repositorio contiene toda la lógica necesaria para reproducir el juego.

## Por qué no se cita el mensaje original dentro del sobre HTML

El transporte está deliberadamente reducido a los campos que han demostrado ser compatibles. Añadir contextos experimentales, newsletters, botones nativos adicionales o metadatos que no son necesarios puede provocar que algunos clientes no reconozcan el rich response y muestren mensajes como "Actualizar WhatsApp" en lugar de renderizar el juego.

Por esa razón `sendHtmlGame()` mantiene un sobre pequeño y estable.

## `messageContextInfo`

GamesWhats genera un `messageSecret` aleatorio y un `botResponseId` único por envío. El `response_id` del payload usa el mismo identificador lógico.

Ejemplo conceptual:

```text
game-1788640000000-a1b2c3d4
```

No identifica al jugador ni guarda una sesión remota del juego. Sirve para diferenciar la respuesta enriquecida dentro del mensaje.

## `forwardedAiBotMessageInfo`

La estructura compatible incluye:

```text
forwardedAiBotMessageInfo.botJid
```

GamesWhats permite configurar este valor mediante `RICH_BOT_JID`. El valor por defecto reproduce el sobre que actualmente renderiza correctamente este tipo de primitive.

Este JID **no es la cuenta de WhatsApp que ejecuta GamesWhats**. Forma parte de los metadatos del rich response compatible.

## Cómo se envía con Baileys

No se usa únicamente:

```ts
socket.sendMessage(chatId, { text: html })
```

porque eso sería texto plano.

GamesWhats usa:

```ts
generateWAMessageFromContent(...)
```

para construir el mensaje protobuf con la estructura especial y después:

```ts
socket.relayMessage(chatId, message.message!, {})
```

para transmitir el contenido ya construido.

## Qué ejecuta el juego

El servidor Node.js **no ejecuta la partida**. Node.js solo construye y envía el HTML.

Después de recibirlo:

- el canvas se dibuja en el cliente;
- `requestAnimationFrame()` mueve el juego;
- `pointerdown` / `pointermove` reciben los toques;
- las colisiones se calculan localmente;
- la IA de Gato/Damas se ejecuta localmente;
- el score vive dentro de esa instancia del mensaje.

Por eso el servidor no necesita recibir un evento por cada salto, movimiento o disparo.

## Estado y persistencia

Los juegos actuales son sesiones locales dentro del mensaje. El score no se envía automáticamente al bot ni se almacena en una base de datos.

Esto es intencional: GamesWhats es un repositorio de juegos HTML embebidos, no una plataforma de economía o perfiles.

Si en el futuro se quisiera guardar récords, sería necesario diseñar un mecanismo adicional de comunicación compatible; no debe asumirse que el JavaScript del primitive puede llamar libremente al bot.

## Compatibilidad

Hay tres resultados posibles al enviar el mensaje:

1. **Cliente compatible:** muestra el juego HTML interactivo.
2. **Cliente que reconoce rich response pero no el primitive:** puede mostrar una vista incompleta o solicitar actualización.
3. **Cambio futuro del protocolo:** el relay puede fallar o WhatsApp puede ignorar el mensaje.

Que `socket.relayMessage()` termine correctamente significa que el mensaje fue enviado al servicio, no que todos los clientes existentes vayan a renderizar un formato interno.

## Seguridad y alcance

Los juegos incluidos no cargan código remoto. El HTML procede de funciones TypeScript versionadas en este mismo repositorio. El smoke test verifica que los juegos no contengan URLs `http://` o `https://`.

La superficie rich HTML debe tratarse como una capacidad de cliente. No debe utilizarse para insertar contenido HTML procedente directamente de usuarios sin validación.

## Archivo principal

La implementación del sobre está en:

```text
src/html-transport.ts
```

Los builders están en:

```text
src/games/
```

El router que convierte `.dino`, `.mario`, etc. en un builder está en:

```text
src/index.ts
src/games/index.ts
```

## Principio de diseño de GamesWhats

GamesWhats separa completamente dos conceptos:

```text
TRANSPORTE
richResponseMessage + HTML primitive

CONTENIDO
Mario / Dino / Ninja / Snake / etc.
```

Gracias a esa separación, añadir un juego nuevo no requiere modificar la conexión de WhatsApp. Basta con crear un nuevo `buildXHtml()`, registrarlo y mantener el HTML autocontenido.
