import { gameFrame } from './shared.js'

export function buildDamasHtml() {
  const body = `<canvas id="c" width="560" height="560"></canvas><div class="row"><button class="btn" id="reset">NUEVA PARTIDA</button></div><div class="hint">Tú juegas con blancas y avanzas hacia arriba. Toca una ficha y después una casilla marcada.</div>`
  const script = `
var c=document.getElementById('c'),x=c.getContext('2d'),stat=document.getElementById('stat'),S=70;
var b,sel,moves,busy,over;
function init(){b=[];for(var r=0;r<8;r++){b[r]=[];for(var q=0;q<8;q++)b[r][q]=null}for(var r1=0;r1<3;r1++)for(var c1=0;c1<8;c1++)if((r1+c1)%2)b[r1][c1]={p:'B',k:false};for(var r2=5;r2<8;r2++)for(var c2=0;c2<8;c2++)if((r2+c2)%2)b[r2][c2]={p:'W',k:false};sel=null;moves=[];busy=false;over=false;stat.textContent='TU TURNO';draw()}
function inside(r,c){return r>=0&&r<8&&c>=0&&c<8}
function pieceMoves(r,c,captureOnly){var p=b[r][c];if(!p)return[];var dirs=p.k?[-1,1]:p.p==='W'?[-1]:[1],out=[];for(var d=0;d<dirs.length;d++)for(var dc=-1;dc<=1;dc+=2){var nr=r+dirs[d],nc=c+dc;if(!inside(nr,nc))continue;if(!b[nr][nc]&&!captureOnly)out.push({fr:r,fc:c,tr:nr,tc:nc,cap:null});else if(b[nr][nc]&&b[nr][nc].p!==p.p){var jr=nr+dirs[d],jc=nc+dc;if(inside(jr,jc)&&!b[jr][jc])out.push({fr:r,fc:c,tr:jr,tc:jc,cap:{r:nr,c:nc}})}}return out}
function allMoves(side){var captures=[],normal=[];for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(b[r][c]&&b[r][c].p===side){var ms=pieceMoves(r,c,false);for(var i=0;i<ms.length;i++)(ms[i].cap?captures:normal).push(ms[i])}return captures.length?captures:normal}
function apply(m){var p=b[m.fr][m.fc];b[m.fr][m.fc]=null;b[m.tr][m.tc]=p;if(m.cap)b[m.cap.r][m.cap.c]=null;if(p&&((p.p==='W'&&m.tr===0)||(p.p==='B'&&m.tr===7)))p.k=true}
function count(side){var n=0;for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(b[r][c]&&b[r][c].p===side)n++;return n}
function check(){var w=count('W'),bl=count('B');if(!w||!allMoves('W').length){over=true;stat.textContent='GANÓ LA IA';return true}if(!bl||!allMoves('B').length){over=true;stat.textContent='GANASTE';return true}return false}
function ai(){if(over)return;busy=true;stat.textContent='IA PENSANDO';setTimeout(function(){var a=allMoves('B');if(!a.length){check();draw();return}var captures=a.filter(function(m){return m.cap});var pool=captures.length?captures:a;apply(pool[Math.floor(Math.random()*pool.length)]);busy=false;sel=null;moves=[];if(!check())stat.textContent='TU TURNO';draw()},320)}
function select(r,c){if(over){init();return}if(busy)return;var p=b[r][c];if(p&&p.p==='W'){var legal=allMoves('W');moves=legal.filter(function(m){return m.fr===r&&m.fc===c});sel={r:r,c:c};draw();return}if(sel){for(var i=0;i<moves.length;i++)if(moves[i].tr===r&&moves[i].tc===c){apply(moves[i]);sel=null;moves=[];draw();if(!check())ai();return}}}
function draw(){for(var r=0;r<8;r++)for(var c2=0;c2<8;c2++){x.fillStyle=(r+c2)%2?'#475569':'#e2e8f0';x.fillRect(c2*S,r*S,S,S)}if(sel){x.strokeStyle='#facc15';x.lineWidth=5;x.strokeRect(sel.c*S+4,sel.r*S+4,S-8,S-8)}for(var m=0;m<moves.length;m++){x.fillStyle='rgba(34,197,94,.7)';x.beginPath();x.arc(moves[m].tc*S+S/2,moves[m].tr*S+S/2,11,0,7);x.fill()}for(var rr=0;rr<8;rr++)for(var cc=0;cc<8;cc++){var p=b[rr][cc];if(!p)continue;x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.arc(cc*S+S/2+3,rr*S+S/2+4,25,0,7);x.fill();x.fillStyle=p.p==='W'?'#f8fafc':'#111827';x.beginPath();x.arc(cc*S+S/2,rr*S+S/2,25,0,7);x.fill();x.strokeStyle=p.p==='W'?'#94a3b8':'#64748b';x.lineWidth=3;x.stroke();if(p.k){x.fillStyle='#facc15';x.font='900 22px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('K',cc*S+S/2,rr*S+S/2);x.textAlign='left';x.textBaseline='alphabetic'}}}
c.onpointerdown=function(e){e.preventDefault();var r=c.getBoundingClientRect(),cx=Math.floor((e.clientX-r.left)*560/r.width/S),cy=Math.floor((e.clientY-r.top)*560/r.height/S);select(cy,cx)};document.getElementById('reset').onpointerdown=init;init();`
  return gameFrame('DAMAS', 'TABLERO TÁCTIL CONTRA IA', body, script)
}
