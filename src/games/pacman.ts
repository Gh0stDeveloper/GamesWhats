import { gameFrame } from './shared.js'

export function buildPacmanHtml() {
  const body = `<canvas id="c" width="450" height="450"></canvas><div class="row"><button class="btn" id="up">ARRIBA</button></div><div class="row"><button class="btn" id="left">IZQUIERDA</button><button class="btn" id="down">ABAJO</button><button class="btn" id="right">DERECHA</button></div><div class="hint">Come todos los puntos sin tocar a los fantasmas. Los controles cambian la dirección en la siguiente intersección disponible.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),N=15,S=30;
var base=[
'111111111111111','100000010000001','101110010111101','100000000000001','101011111010101','100010000010001','111010111010111','000000101000000','111010111010111','100010000010001','101011111010101','100000000000001','101110010111101','100000010000001','111111111111111'];
var map,p,ghosts,dir,nextDir,score,lives,pellets,state,lastMove;
var dirs={l:{x:-1,y:0},r:{x:1,y:0},u:{x:0,y:-1},d:{x:0,y:1}};
function resetMap(){map=[];pellets=0;for(var r=0;r<N;r++){map[r]=[];for(var q=0;q<N;q++){if(base[r][q]==='1')map[r][q]=1;else{map[r][q]=2;pellets++}}}[[7,7],[7,6],[7,8],[1,1]].forEach(function(a){if(map[a[1]][a[0]]===2){map[a[1]][a[0]]=0;pellets--}})}
function spawn(){p={x:1,y:1};dir='r';nextDir='r';ghosts=[{x:7,y:7,d:'l',c:'#ef4444'},{x:7,y:6,d:'r',c:'#f472b6'},{x:7,y:8,d:'u',c:'#22d3ee'}]}
function open(nx,ny){if(nx<0)nx=N-1;if(nx>=N)nx=0;return ny>=0&&ny<N&&map[ny][nx]!==1}
function wrap(v){if(v<0)return N-1;if(v>=N)return 0;return v}
function canMove(o,d){var v=dirs[d];return open(o.x+v.x,o.y+v.y)}
function moveObj(o,d){var v=dirs[d];o.x=wrap(o.x+v.x);o.y+=v.y}
function setDir(d){if(state!=='play'){reset();return}nextDir=d}
function chooseGhost(g){var opts=['l','r','u','d'].filter(function(d){return canMove(g,d)});var opposite={l:'r',r:'l',u:'d',d:'u'};var filtered=opts.filter(function(d){return d!==opposite[g.d]});if(filtered.length)opts=filtered;if(!opts.length)return g.d;opts.sort(function(a,b){var va=dirs[a],vb=dirs[b];var da=Math.abs(wrap(g.x+va.x)-p.x)+Math.abs(g.y+va.y-p.y);var db=Math.abs(wrap(g.x+vb.x)-p.x)+Math.abs(g.y+vb.y-p.y);return da-db});return Math.random()<.68?opts[0]:opts[Math.floor(Math.random()*opts.length)]}
function hit(){for(var i=0;i<ghosts.length;i++)if(ghosts[i].x===p.x&&ghosts[i].y===p.y)return true;return false}
function loseLife(){lives--;if(lives<=0){state='over';return}spawn()}
function tick(){if(state!=='play')return;if(canMove(p,nextDir))dir=nextDir;if(canMove(p,dir))moveObj(p,dir);if(map[p.y][p.x]===2){map[p.y][p.x]=0;pellets--;score+=10;if(pellets<=0){state='win';score+=500}}if(hit()){loseLife();return}for(var i=0;i<ghosts.length;i++){var g=ghosts[i];g.d=chooseGhost(g);if(canMove(g,g.d))moveObj(g,g.d);if(hit()){loseLife();return}}}
function reset(){resetMap();score=0;lives=3;state='play';spawn();lastMove=0;stat.textContent='PUNTOS 0 · VIDAS 3'}
function circle(cx,cy,rad,color){x.fillStyle=color;x.beginPath();x.arc(cx,cy,rad,0,Math.PI*2);x.fill()}
function draw(){x.fillStyle='#020617';x.fillRect(0,0,c.width,c.height);for(var r=0;r<N;r++)for(var q=0;q<N;q++){if(map[r][q]===1){x.fillStyle='#1d4ed8';x.fillRect(q*S+2,r*S+2,S-4,S-4);x.fillStyle='#172554';x.fillRect(q*S+7,r*S+7,S-14,S-14)}else if(map[r][q]===2)circle(q*S+S/2,r*S+S/2,3,'#fde68a')}var px=p.x*S+S/2,py=p.y*S+S/2;x.fillStyle='#facc15';x.beginPath();x.moveTo(px,py);x.arc(px,py,12,.22*Math.PI,1.78*Math.PI);x.closePath();x.fill();for(var i=0;i<ghosts.length;i++){var g=ghosts[i],gx=g.x*S+S/2,gy=g.y*S+S/2;circle(gx,gy,11,g.c);x.fillStyle=g.c;x.fillRect(gx-11,gy,22,9);circle(gx-4,gy-3,3,'#fff');circle(gx+4,gy-3,3,'#fff');circle(gx-4,gy-3,1.4,'#0f172a');circle(gx+4,gy-3,1.4,'#0f172a')}stat.textContent='PUNTOS '+score+' · VIDAS '+lives;if(state!=='play'){x.fillStyle='rgba(2,6,23,.82)';x.fillRect(0,0,c.width,c.height);x.fillStyle='#fff';x.textAlign='center';x.font='900 28px Arial';x.fillText(state==='win'?'LABERINTO COMPLETADO':'GAME OVER',c.width/2,205);x.font='700 13px Arial';x.fillText('Pulsa cualquier dirección para reiniciar',c.width/2,234);x.textAlign='left'}}
function loop(t){if(t-lastMove>175){tick();lastMove=t}draw();requestAnimationFrame(loop)}
[['left','l'],['right','r'],['up','u'],['down','d']].forEach(function(a){document.getElementById(a[0]).onpointerdown=function(e){e.preventDefault();setDir(a[1])}});reset();requestAnimationFrame(loop);`
  return gameFrame('PAC-MAN', 'LABERINTO ARCADE TÁCTIL', body, script)
}
