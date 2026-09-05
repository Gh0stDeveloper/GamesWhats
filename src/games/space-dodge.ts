import { gameFrame } from './shared.js'

export function buildSpaceDodgeHtml() {
  const body = `<canvas id="c" width="520" height="300"></canvas><div class="row"><button class="btn" id="left">IZQUIERDA</button><button class="btn" id="right">DERECHA</button></div><div class="hint">Mueve la nave y esquiva los asteroides. También puedes arrastrar sobre el tablero.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),W=c.width,H=c.height;
var ship,rocks,score,frame,dead,left=false,right=false;
function reset(){ship={x:W/2-16,y:H-45,w:32,h:28};rocks=[];score=0;frame=0;dead=false;stat.textContent='PUNTOS 0'}
function spawn(){var r=12+Math.random()*18;rocks.push({x:r+Math.random()*(W-r*2),y:-r,v:2.6+Math.random()*2.8+score/1200,r:r})}
function hit(a,b){var cx=Math.max(a.x,Math.min(b.x,a.x+a.w)),cy=Math.max(a.y,Math.min(b.y,a.y+a.h));return Math.hypot(b.x-cx,b.y-cy)<b.r}
function update(){if(dead)return;frame++;if(frame%28===0)spawn();if(left)ship.x-=5;if(right)ship.x+=5;ship.x=Math.max(0,Math.min(W-ship.w,ship.x));for(var i=rocks.length-1;i>=0;i--){rocks[i].y+=rocks[i].v;if(hit(ship,rocks[i]))dead=true;if(rocks[i].y-rocks[i].r>H){rocks.splice(i,1);score+=5}}stat.textContent='PUNTOS '+score}
function draw(){x.fillStyle='#030712';x.fillRect(0,0,W,H);x.fillStyle='#fff';for(var i=0;i<55;i++){var sx=(i*73+frame*.15)%W,sy=(i*47)%H;x.globalAlpha=.25+(i%5)/8;x.fillRect(sx,sy,1.5,1.5)}x.globalAlpha=1;for(var j=0;j<rocks.length;j++){var r=rocks[j];x.fillStyle='#64748b';x.beginPath();x.arc(r.x,r.y,r.r,0,7);x.fill();x.fillStyle='#334155';x.beginPath();x.arc(r.x-r.r*.3,r.y-r.r*.2,r.r*.28,0,7);x.fill()}x.fillStyle='#38bdf8';x.beginPath();x.moveTo(ship.x+ship.w/2,ship.y);x.lineTo(ship.x+ship.w,ship.y+ship.h);x.lineTo(ship.x+ship.w/2,ship.y+ship.h-7);x.lineTo(ship.x,ship.y+ship.h);x.closePath();x.fill();x.fillStyle='#f97316';x.fillRect(ship.x+11,ship.y+ship.h,4,9);x.fillRect(ship.x+18,ship.y+ship.h,4,9);if(dead){x.fillStyle='rgba(0,0,0,.75)';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.textAlign='center';x.font='900 27px Arial';x.fillText('NAVE DESTRUIDA',W/2,130);x.font='700 13px Arial';x.fillText('Toca el tablero para reiniciar',W/2,160);x.textAlign='left'}}
function hold(id,key){var b=document.getElementById(id);b.onpointerdown=function(e){e.preventDefault();if(dead)reset();window[key]=true};['pointerup','pointerleave','pointercancel'].forEach(function(n){b.addEventListener(n,function(){window[key]=false})})}hold('left','left');hold('right','right');
c.onpointerdown=function(e){if(dead){reset();return}var r=c.getBoundingClientRect();ship.x=(e.clientX-r.left)*W/r.width-ship.w/2};c.onpointermove=function(e){if(e.buttons!==1)return;var r=c.getBoundingClientRect();ship.x=(e.clientX-r.left)*W/r.width-ship.w/2};function loop(){update();draw();requestAnimationFrame(loop)}reset();loop();`
  return gameFrame('SPACE DODGE', 'ESQUIVA ASTEROIDES', body, script)
}
