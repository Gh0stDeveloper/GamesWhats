import { gameFrame } from './shared.js'

export function buildDoomHtml() {
  const body = `<canvas id="c" width="520" height="300"></canvas><div class="row"><button class="btn" id="left">IZQUIERDA</button><button class="btn" id="shoot">DISPARAR</button><button class="btn" id="right">DERECHA</button></div><div class="hint">Elimina enemigos antes de que lleguen a tu posición.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),W=c.width,H=c.height;
var p,enemies,shots,score,hp,frame,dead,l=false,r=false;
function reset(){p={x:W/2-16,y:H-38,w:32,h:24};enemies=[];shots=[];score=0;hp=5;frame=0;dead=false;l=false;r=false;stat.textContent='BAJAS 0 · HP 5'}
function spawn(){enemies.push({x:20+Math.random()*(W-48),y:-25,w:28,h:28,v:1.2+Math.random()*1.6+score/80,hp:1+(score>20&&Math.random()<.25?1:0)})}
function shoot(){if(dead){reset();return}shots.push({x:p.x+p.w/2-2,y:p.y-8,w:4,h:12,v:7})}
function box(a,b){return a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h}
function update(){if(dead)return;frame++;if(frame%45===0)spawn();if(l)p.x-=4.5;if(r)p.x+=4.5;p.x=Math.max(0,Math.min(W-p.w,p.x));for(var s=shots.length-1;s>=0;s--){shots[s].y-=shots[s].v;if(shots[s].y<-20)shots.splice(s,1)}for(var e=enemies.length-1;e>=0;e--){var en=enemies[e];en.y+=en.v;for(var k=shots.length-1;k>=0;k--){if(box(en,shots[k])){shots.splice(k,1);en.hp--;if(en.hp<=0){enemies.splice(e,1);score++;break}}}if(e<enemies.length&&enemies[e]===en){if(en.y>H){enemies.splice(e,1);hp--;if(hp<=0)dead=true}else if(box(en,p)){enemies.splice(e,1);hp--;if(hp<=0)dead=true}}}stat.textContent='BAJAS '+score+' · HP '+hp}
function draw(){x.fillStyle='#160b0b';x.fillRect(0,0,W,H);x.strokeStyle='rgba(248,113,113,.08)';for(var gy=0;gy<H;gy+=35){x.beginPath();x.moveTo(0,gy);x.lineTo(W,gy);x.stroke()}x.fillStyle='#f8fafc';for(var s=0;s<shots.length;s++)x.fillRect(shots[s].x,shots[s].y,shots[s].w,shots[s].h);for(var e=0;e<enemies.length;e++){var en=enemies[e];x.fillStyle=en.hp>1?'#fb923c':'#dc2626';x.fillRect(en.x,en.y,en.w,en.h);x.fillStyle='#111827';x.fillRect(en.x+5,en.y+7,5,5);x.fillRect(en.x+18,en.y+7,5,5)}x.fillStyle='#94a3b8';x.fillRect(p.x,p.y,p.w,p.h);x.fillStyle='#ef4444';x.fillRect(p.x+13,p.y-7,6,10);if(dead){x.fillStyle='rgba(0,0,0,.78)';x.fillRect(0,0,W,H);x.fillStyle='#f87171';x.textAlign='center';x.font='900 28px Arial';x.fillText('GAME OVER',W/2,130);x.fillStyle='#fff';x.font='700 13px Arial';x.fillText('Pulsa DISPARAR para reiniciar',W/2,160);x.textAlign='left'}}
function hold(id,key){var b=document.getElementById(id);b.onpointerdown=function(e){e.preventDefault();if(key==='l')l=true;else r=true};['pointerup','pointerleave','pointercancel'].forEach(function(n){b.addEventListener(n,function(){if(key==='l')l=false;else r=false})})}hold('left','l');hold('right','r');document.getElementById('shoot').onpointerdown=function(e){e.preventDefault();shoot()};function loop(){update();draw();requestAnimationFrame(loop)}reset();loop();`
  return gameFrame('MINI DOOM', 'ARENA SHOOTER', body, script)
}
