import { gameFrame } from './shared.js'

export function buildGatoHtml() {
  const body = `<div id="board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div><div class="row"><button class="btn" id="reset">NUEVA PARTIDA</button></div><div class="hint">Tú juegas con X. La IA usa O.</div>`
  const script = `
var board=document.getElementById('board'),stat=document.getElementById('stat'),cells,turn,done;
var wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function result(a){for(var i=0;i<wins.length;i++){var w=wins[i];if(a[w[0]]&&a[w[0]]===a[w[1]]&&a[w[1]]===a[w[2]])return a[w[0]]}return a.every(Boolean)?'draw':''}
function render(){board.innerHTML='';for(let i=0;i<9;i++){var b=document.createElement('button');b.className='btn';b.style.height='92px';b.style.fontSize='34px';b.style.background=cells[i]==='X'?'#1d4ed8':cells[i]==='O'?'#7c3aed':'#111827';b.textContent=cells[i]||'';b.onpointerdown=function(e){e.preventDefault();play(i)};board.appendChild(b)}}
function choose(){var empty=[];for(var i=0;i<9;i++)if(!cells[i])empty.push(i);function winning(mark){for(var j=0;j<empty.length;j++){var k=empty[j],copy=cells.slice();copy[k]=mark;if(result(copy)===mark)return k}return -1}var k=winning('O');if(k<0)k=winning('X');if(k<0&&cells[4]==='')k=4;if(k<0){var corners=[0,2,6,8].filter(function(n){return !cells[n]});if(corners.length)k=corners[Math.floor(Math.random()*corners.length)]}if(k<0&&empty.length)k=empty[Math.floor(Math.random()*empty.length)];return k}
function finish(){var r=result(cells);if(!r)return false;done=true;stat.textContent=r==='draw'?'EMPATE':r==='X'?'GANASTE':'GANÓ LA IA';return true}
function ai(){if(done)return;var k=choose();if(k>=0)cells[k]='O';render();if(!finish())stat.textContent='TU TURNO'}
function play(i){if(done||turn||cells[i])return;cells[i]='X';render();if(finish())return;turn=true;stat.textContent='IA PENSANDO';setTimeout(function(){turn=false;ai()},260)}
function reset(){cells=['','','','','','','','',''];turn=false;done=false;stat.textContent='TU TURNO';render()}document.getElementById('reset').onpointerdown=reset;reset();`
  return gameFrame('GATO', 'TRES EN RAYA CONTRA IA', body, script)
}
