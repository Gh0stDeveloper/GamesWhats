import { gameFrame } from './shared.js'

export function buildSnakeHtml() {
  const body = `<canvas id="c" width="420" height="420"></canvas><div class="row"><button class="btn" id="up">ARRIBA</button></div><div class="row"><button class="btn" id="left">IZQUIERDA</button><button class="btn" id="down">ABAJO</button><button class="btn" id="right">DERECHA</button></div><div class="hint">Come los cuadros amarillos. No choques contra el borde ni contra tu propio cuerpo.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),N=21,S=c.width/N;
var snake,dir,next,food,score,timer,dead;
function rnd(){return Math.floor(Math.random()*N)}
function place(){do{food={x:rnd(),y:rnd()}}while(snake.some(function(s){return s.x===food.x&&s.y===food.y}))}
function reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};next=dir;score=0;dead=false;place();stat.textContent='PUNTOS 0';clearInterval(timer);timer=setInterval(step,115)}
function setDir(dx,dy){if(dead){reset();return}if(dx===-dir.x&&dy===-dir.y)return;next={x:dx,y:dy}}
function step(){if(dead)return;dir=next;var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y})){dead=true;clearInterval(timer);draw();return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;place();stat.textContent='PUNTOS '+score}else snake.pop();draw()}
function draw(){x.fillStyle='#020617';x.fillRect(0,0,c.width,c.height);x.strokeStyle='rgba(255,255,255,.04)';for(var i=0;i<=N;i++){x.beginPath();x.moveTo(i*S,0);x.lineTo(i*S,c.height);x.stroke();x.beginPath();x.moveTo(0,i*S);x.lineTo(c.width,i*S);x.stroke()}x.fillStyle='#facc15';x.fillRect(food.x*S+3,food.y*S+3,S-6,S-6);for(var j=0;j<snake.length;j++){x.fillStyle=j===0?'#86efac':'#22c55e';x.fillRect(snake[j].x*S+2,snake[j].y*S+2,S-4,S-4)}if(dead){x.fillStyle='rgba(0,0,0,.72)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='900 28px Arial';x.fillText('GAME OVER',c.width/2,190);x.font='700 13px Arial';x.fillText('Pulsa cualquier dirección',c.width/2,220);x.textAlign='left'}}
[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]].forEach(function(a){document.getElementById(a[0]).onpointerdown=function(e){e.preventDefault();setDir(a[1],a[2])}});document.addEventListener('keydown',function(e){if(e.key==='ArrowUp')setDir(0,-1);if(e.key==='ArrowDown')setDir(0,1);if(e.key==='ArrowLeft')setDir(-1,0);if(e.key==='ArrowRight')setDir(1,0)});reset();draw();`
  return gameFrame('SNAKE', 'CLÁSICO TÁCTIL', body, script)
}
