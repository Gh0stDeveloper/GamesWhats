import { gameFrame } from './shared.js'

export function buildDinoHtml() {
  const body = `<canvas id="c" width="520" height="260"></canvas><div class="row"><button class="btn" id="jump">SALTAR</button><button class="btn" id="reset">REINICIAR</button></div><div class="hint">Toca SALTAR o el tablero para brincar los obstáculos.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat');
var W=c.width,H=c.height,ground=220,player,obs,score,speed,spawn,dead;
function reset(){player={x:58,y:ground-42,w:30,h:42,vy:0,on:true};obs=[];score=0;speed=6;spawn=70;dead=false;stat.textContent='PUNTOS 0'}
function jump(){if(dead){reset();return}if(player.on){player.vy=-12;player.on=false}}
function hit(a,b){return a.x<a.x+a.w&&a.x+a.w>b.x&&a.y+a.h>b.y&&a.y<b.y+b.h&&a.x<b.x+b.w}
function update(){if(dead)return;score++;speed=Math.min(11,6+score/900);spawn--;if(spawn<=0){var h=28+Math.random()*34;obs.push({x:W+15,y:ground-h,w:18+Math.random()*15,h:h});spawn=55+Math.random()*55}player.vy+=.62;player.y+=player.vy;if(player.y+player.h>=ground){player.y=ground-player.h;player.vy=0;player.on=true}for(var i=obs.length-1;i>=0;i--){obs[i].x-=speed;if(obs[i].x+obs[i].w<0)obs.splice(i,1);else if(hit(player,obs[i]))dead=true}stat.textContent='PUNTOS '+Math.floor(score/6)}
function draw(){x.clearRect(0,0,W,H);x.fillStyle='#dbeafe';x.fillRect(0,0,W,H);x.fillStyle='#bfdbfe';for(var i=0;i<6;i++){var cx=(i*110-(score*.25)%110);x.beginPath();x.arc(cx,55+(i%2)*24,18,0,7);x.fill()}x.fillStyle='#64748b';x.fillRect(0,ground,W,3);x.fillStyle='#16a34a';x.fillRect(player.x,player.y,player.w,player.h);x.fillStyle='#14532d';x.fillRect(player.x+20,player.y+6,13,10);x.fillStyle='#fff';x.fillRect(player.x+25,player.y+8,3,3);x.fillStyle='#166534';for(var j=0;j<obs.length;j++){var o=obs[j];x.fillRect(o.x,o.y,o.w,o.h);x.fillRect(o.x-6,o.y+10,8,8)}if(dead){x.fillStyle='rgba(2,6,23,.72)';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.textAlign='center';x.font='900 27px Arial';x.fillText('GAME OVER',W/2,110);x.font='700 13px Arial';x.fillText('Toca para reiniciar',W/2,140);x.textAlign='left'}}
function loop(){update();draw();requestAnimationFrame(loop)}
document.getElementById('jump').onpointerdown=function(e){e.preventDefault();jump()};document.getElementById('reset').onpointerdown=function(e){e.preventDefault();reset()};c.onpointerdown=function(e){e.preventDefault();jump()};reset();loop();`
  return gameFrame('DINO RUNNER', 'RUNNER TÁCTIL', body, script)
}
