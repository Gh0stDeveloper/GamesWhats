import { gameFrame } from './shared.js'

export function buildTetrisHtml() {
  const body = `<canvas id="c" width="300" height="600"></canvas><div class="row"><button class="btn" id="left">IZQUIERDA</button><button class="btn" id="rotate">GIRAR</button><button class="btn" id="right">DERECHA</button></div><div class="row"><button class="btn" id="down">BAJAR</button><button class="btn" id="drop">CAÍDA RÁPIDA</button></div><div class="hint">Completa líneas horizontales. Usa GIRAR para rotar la pieza y CAÍDA RÁPIDA para soltarla.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),COLS=10,ROWS=20,S=30;
var board,piece,score,lines,state,last,dropMs;
var shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
var colors=['#22d3ee','#facc15','#a78bfa','#fb923c','#60a5fa','#4ade80','#f87171'];
function empty(){var a=[];for(var r=0;r<ROWS;r++){a[r]=[];for(var q=0;q<COLS;q++)a[r][q]=0}return a}
function clone(m){return m.map(function(r){return r.slice()})}
function makePiece(){var i=Math.floor(Math.random()*shapes.length);return{m:clone(shapes[i]),x:Math.floor(COLS/2)-Math.ceil(shapes[i][0].length/2),y:-1,color:colors[i]}}
function collides(px,py,m){for(var r=0;r<m.length;r++)for(var q=0;q<m[r].length;q++)if(m[r][q]){var xx=px+q,yy=py+r;if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true}return false}
function rotateMatrix(m){var h=m.length,w=m[0].length,n=[];for(var q=0;q<w;q++){n[q]=[];for(var r=h-1;r>=0;r--)n[q].push(m[r][q])}return n}
function rotate(){if(state!=='play'){reset();return}var n=rotateMatrix(piece.m);if(!collides(piece.x,piece.y,n))piece.m=n;else if(!collides(piece.x-1,piece.y,n)){piece.x--;piece.m=n}else if(!collides(piece.x+1,piece.y,n)){piece.x++;piece.m=n}}
function merge(){for(var r=0;r<piece.m.length;r++)for(var q=0;q<piece.m[r].length;q++)if(piece.m[r][q]&&piece.y+r>=0)board[piece.y+r][piece.x+q]=piece.color;clearLines();piece=makePiece();if(collides(piece.x,piece.y,piece.m))state='over'}
function clearLines(){var cleared=0;for(var r=ROWS-1;r>=0;r--){var full=true;for(var q=0;q<COLS;q++)if(!board[r][q]){full=false;break}if(full){board.splice(r,1);board.unshift(new Array(COLS).fill(0));cleared++;r++}}if(cleared){lines+=cleared;score+=[0,100,300,500,800][cleared]||cleared*250;dropMs=Math.max(120,650-lines*12)}}
function move(dx){if(state!=='play')return;if(!collides(piece.x+dx,piece.y,piece.m))piece.x+=dx}
function down(){if(state!=='play'){reset();return}if(!collides(piece.x,piece.y+1,piece.m)){piece.y++;score+=1}else merge()}
function hardDrop(){if(state!=='play'){reset();return}var n=0;while(!collides(piece.x,piece.y+1,piece.m)){piece.y++;n++}score+=n*2;merge()}
function reset(){board=empty();piece=makePiece();score=0;lines=0;state='play';last=0;dropMs=650;stat.textContent='PUNTOS 0 · LÍNEAS 0'}
function cell(px,py,color){x.fillStyle=color;x.fillRect(px*S+1,py*S+1,S-2,S-2);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(px*S+3,py*S+3,S-6,4)}
function draw(){x.fillStyle='#020617';x.fillRect(0,0,c.width,c.height);x.strokeStyle='rgba(148,163,184,.08)';x.lineWidth=1;for(var q=0;q<=COLS;q++){x.beginPath();x.moveTo(q*S,0);x.lineTo(q*S,c.height);x.stroke()}for(var r=0;r<=ROWS;r++){x.beginPath();x.moveTo(0,r*S);x.lineTo(c.width,r*S);x.stroke()}for(var rr=0;rr<ROWS;rr++)for(var qq=0;qq<COLS;qq++)if(board[rr][qq])cell(qq,rr,board[rr][qq]);for(var pr=0;pr<piece.m.length;pr++)for(var pq=0;pq<piece.m[pr].length;pq++)if(piece.m[pr][pq]&&piece.y+pr>=0)cell(piece.x+pq,piece.y+pr,piece.color);stat.textContent='PUNTOS '+score+' · LÍNEAS '+lines;if(state==='over'){x.fillStyle='rgba(2,6,23,.82)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='900 28px Arial';x.fillText('GAME OVER',c.width/2,265);x.font='700 13px Arial';x.fillText('Pulsa GIRAR o BAJAR para reiniciar',c.width/2,292);x.textAlign='left'}}
function loop(t){if(state==='play'&&t-last>=dropMs){down();last=t}draw();requestAnimationFrame(loop)}
document.getElementById('left').onpointerdown=function(e){e.preventDefault();move(-1)};document.getElementById('right').onpointerdown=function(e){e.preventDefault();move(1)};document.getElementById('rotate').onpointerdown=function(e){e.preventDefault();rotate()};document.getElementById('down').onpointerdown=function(e){e.preventDefault();down()};document.getElementById('drop').onpointerdown=function(e){e.preventDefault();hardDrop()};reset();requestAnimationFrame(loop);`
  return gameFrame('TETRIS', 'BLOQUES · PUZZLE TÁCTIL', body, script)
}
