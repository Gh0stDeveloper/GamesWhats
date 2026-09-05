import { gameFrame } from './shared.js'

export function buildNinjaHtml() {
  const body = `<canvas id="c" width="520" height="300"></canvas><div class="row"><button class="btn" id="reset">NUEVA PARTIDA</button></div><div class="hint">Mantén pulsado y desliza sobre las frutas. Evita las bombas.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),W=c.width,H=c.height;
var items=[],score=0,lives=3,frame=0,over=false,down=false,last=null,trail=[];
var colors=['#ef4444','#22c55e','#f59e0b','#a855f7','#06b6d4'];
function reset(){items=[];score=0;lives=3;frame=0;over=false;trail=[];stat.textContent='PUNTOS 0 · VIDAS 3'}
function spawn(){var bomb=Math.random()<.14;items.push({x:55+Math.random()*(W-110),y:H+20,vx:(Math.random()-.5)*3.4,vy:-(9+Math.random()*5),r:bomb?18:17+Math.random()*7,bomb:bomb,color:colors[Math.floor(Math.random()*colors.length)],cut:false})}
function distPoint(px,py,a,b){var dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;if(!l)return Math.hypot(px-a.x,py-a.y);var t=((px-a.x)*dx+(py-a.y)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(a.x+t*dx),py-(a.y+t*dy))}
function slice(a,b){if(over)return;for(var i=0;i<items.length;i++){var it=items[i];if(!it.cut&&distPoint(it.x,it.y,a,b)<it.r+6){it.cut=true;if(it.bomb){over=true}else{score+=10}}}stat.textContent='PUNTOS '+score+' · VIDAS '+lives}
function pos(e){var r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
c.onpointerdown=function(e){e.preventDefault();down=true;last=pos(e);trail=[last]};c.onpointermove=function(e){if(!down)return;var p=pos(e);slice(last,p);last=p;trail.push(p);if(trail.length>12)trail.shift()};['pointerup','pointercancel','pointerleave'].forEach(function(n){c.addEventListener(n,function(){down=false;last=null})});
function update(){if(over)return;frame++;if(frame%42===0)spawn();for(var i=items.length-1;i>=0;i--){var it=items[i];it.vy+=.22;it.x+=it.vx;it.y+=it.vy;if(it.y>H+45){if(!it.bomb&&!it.cut){lives--;if(lives<=0)over=true}items.splice(i,1)}}stat.textContent='PUNTOS '+score+' · VIDAS '+lives}
function drawFruit(it){x.save();x.translate(it.x,it.y);if(it.cut)x.rotate(.35);x.fillStyle=it.bomb?'#111827':it.color;x.beginPath();x.arc(0,0,it.r,0,7);x.fill();x.fillStyle=it.bomb?'#f97316':'rgba(255,255,255,.45)';x.beginPath();x.arc(-6,-7,4,0,7);x.fill();if(it.bomb){x.strokeStyle='#facc15';x.lineWidth=3;x.beginPath();x.moveTo(8,-14);x.lineTo(15,-23);x.stroke()}x.restore()}
function draw(){x.fillStyle='#08111f';x.fillRect(0,0,W,H);x.strokeStyle='rgba(255,255,255,.05)';for(var i=0;i<W;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(var j=0;j<items.length;j++)drawFruit(items[j]);if(trail.length>1){x.strokeStyle='#fff';x.lineWidth=4;x.lineCap='round';x.beginPath();x.moveTo(trail[0].x,trail[0].y);for(var k=1;k<trail.length;k++)x.lineTo(trail[k].x,trail[k].y);x.stroke()}if(over){x.fillStyle='rgba(0,0,0,.72)';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.textAlign='center';x.font='900 25px Arial';x.fillText('FIN DE PARTIDA',W/2,135);x.font='700 13px Arial';x.fillText('Puntuación: '+score,W/2,164);x.textAlign='left'}}
function loop(){update();draw();requestAnimationFrame(loop)}document.getElementById('reset').onpointerdown=reset;reset();loop();`
  return gameFrame('NINJA FRUIT SLICE', 'CORTA FRUTAS CON EL DEDO', body, script)
}
