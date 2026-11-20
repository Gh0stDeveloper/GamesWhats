# GamesWhats

### Interactive mini-games for WhatsApp messages

GamesWhats is a dedicated WhatsApp bot project for experimenting with self-contained HTML, CSS and JavaScript mini-games. I keep this project separate from my broader WhatsApp automation tools so the game-rendering workflow can be tested independently.

## Game collection

| Command | Game |
| --- | --- |
| `.mario` | Mini Mario |
| `.dino` | Dino Runner |
| `.ninja` | Fruit Slice |
| `.snake` | Snake |
| `.tetris` | Tetris |
| `.pacman` | Maze arcade |
| `.spacedodge` | Space Dodge |
| `.doom` | Mini arena game |
| `.gato` | Tic-tac-toe |
| `.damas` | Checkers |
| `.games` | Game menu |

## How it works

Each supported game produces a compact HTML payload with its own styles and JavaScript. Game state is handled within the interactive content rather than by a central server for every player action.

## Technology

Node.js · JavaScript · HTML · CSS · WhatsApp bot integration

## Run locally

Use the Node.js project scripts and configure the required WhatsApp session credentials. A linked WhatsApp account and compatibility with the current messaging platform are needed for operation.

**Project note:** WhatsApp client features can change. Successful code-level tests do not guarantee that every version of WhatsApp renders interactive content identically.

---

**GamesWhats — a focused environment for interactive messaging experiments.**
