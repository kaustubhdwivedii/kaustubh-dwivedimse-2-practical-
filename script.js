const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const TODAY=()=>ymd(new Date());
const PR={high:3,medium:2,low:1},ST={todo:'To-do',doing:'Doing',done:'Done'};
let tasks=store.get('tf_tasks',null)||[
 {id:uid(),title:'Plan this week',priority:'high',status:'todo',due:TODAY()},
 {id:uid(),title:'Read lecture notes',priority:'medium',status:'doing',due:''},
 {id:uid(),title:'Try the Pomodoro timer',priority:'low',status:'done',due:''}];
let notes=store.get('tf_notes',[]),cfg=Object.assign({theme:'system',focus:25,short:5,long:15},store.get('tf_cfg',{}));
let stats=store.get('tf_stats',{}); // {date:sessions}
let curNote=notes[0]?.id||null,editId=null,filter='all',cm=new Date();cm.setDate(1);
const saveT=()=>store.set('tf_tasks',tasks),saveC=()=>store.set('tf_cfg',cfg);

/* routing */
function route(){const p=(location.hash||'#home').slice(1);const id=$('#'+p)&&$('section#'+p)?p:'home';
 $$('section').forEach(s=>s.classList.toggle('on',s.id===id));$$('nav a').forEach(a=>a.classList.toggle('on',a.hash==='#'+id));renderAll()}
addEventListener('hashchange',route);

/* theme */
function applyTheme(){document.documentElement.dataset.theme=cfg.theme}

/* tasks */
function addTask(t){tasks.push(Object.assign({id:uid(),due:'',status:'todo'},t));saveT();renderAll()}
function openDlg(id,due){editId=id||null;const t=tasks.find(x=>x.id===id)||{title:'',priority:'medium',due:due||'',status:'todo'};
 $('#dtitle').textContent=id?'Edit task':'New task';$('#ti').value=t.title;$('#pr').value=t.priority;$('#du').value=t.due;$('#st').value=t.status;$('#dlg').showModal();$('#ti').focus()}
$('#tf').addEventListener('submit',e=>{e.preventDefault();const v={title:$('#ti').value.trim(),priority:$('#pr').value,due:$('#du').value,status:$('#st').value};
 if(!v.title)return;if(editId)Object.assign(tasks.find(x=>x.id===editId),v);else addTask(v);saveT();$('#dlg').close();renderAll()});
$('#dc').onclick=()=>$('#dlg').close();
$('#newTask').onclick=()=>openDlg();
$('#pf').onchange=e=>{filter=e.target.value;renderBoard()};
function card(t){const od=t.due&&t.due<TODAY()&&t.status!=='done';
 return `<div class="task ${t.priority} ${t.status}" draggable="true" data-id="${t.id}"><p>${esc(t.title)}</p>
 <div class="meta"><span class="${od?'od':''}">${t.due?(od?'Overdue · ':'Due ')+t.due:t.priority}</span>
 <span><button class="ic" data-e="${t.id}" aria-label="Edit task">✏️</button><button class="ic" data-d="${t.id}" aria-label="Delete task">🗑️</button></span></div></div>`}
function renderBoard(){
 $('#board').innerHTML=Object.keys(ST).map(s=>{const l=tasks.filter(t=>t.status===s&&(filter==='all'||t.priority===filter)).sort((a,b)=>PR[b.priority]-PR[a.priority]);
  return `<div class="col" data-s="${s}"><h3>${ST[s]} <em>${l.length}</em></h3>${l.map(card).join('')||'<div class="empty">Nothing here yet</div>'}</div>`}).join('')}
const board=$('#board');
board.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.e)openDlg(b.dataset.e);
 if(b.dataset.d&&confirm('Delete this task?')){tasks=tasks.filter(t=>t.id!==b.dataset.d);saveT();renderAll()}});
board.addEventListener('dragstart',e=>{const c=e.target.closest('.task');if(!c)return;e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';c.classList.add('drag')});
board.addEventListener('dragend',()=>renderBoard());
board.addEventListener('dragover',e=>{const c=e.target.closest('.col');if(!c)return;e.preventDefault();$$('.col').forEach(x=>x.classList.toggle('over',x===c))});
board.addEventListener('drop',e=>{const c=e.target.closest('.col');if(!c)return;e.preventDefault();
 const t=tasks.find(x=>x.id===e.dataTransfer.getData('text/plain'));if(t){t.status=c.dataset.s;saveT()}renderAll()});

/* home */
function renderHome(){const h=new Date().getHours();$('#greet').textContent=(h<12?'Good morning':h<17?'Good afternoon':'Good evening');
 $('#today').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const nx=tasks.filter(t=>t.status!=='done').sort((a,b)=>PR[b.priority]-PR[a.priority]||(a.due||'9').localeCompare(b.due||'9')).slice(0,4);
 $('#upnext').innerHTML=nx.map(t=>`<div class="row sp" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${esc(t.title)}</span><small style="color:var(--${t.priority})">${t.priority}</small></div>`).join('')||'<div class="empty">All clear. Add a task above.</div>';
 const n=stats[TODAY()]||0;$('#hfocus').textContent=n?`${n} focus session${n>1?'s':''} completed today (${n*cfg.focus} min).`:'No focus sessions yet today.'}
$('#qa').onclick=()=>{const v=$('#qt').value.trim();if(!v)return $('#qt').focus();addTask({title:v,priority:$('#qp').value});$('#qt').value=''};
$('#qt').addEventListener('keydown',e=>{if(e.key==='Enter')$('#qa').click()});

/* dashboard */
function renderDash(){const c=s=>tasks.filter(t=>t.status===s).length,tot=tasks.length,pct=tot?Math.round(c('done')/tot*100):0;
 const od=tasks.filter(t=>t.due&&t.due<TODAY()&&t.status!=='done').length,fs=stats[TODAY()]||0;
 $('#stats').innerHTML=[[tot,'Total tasks'],[c('doing'),'In progress'],[c('done'),'Completed'],[od,'Overdue'],[fs,'Focus sessions today']].map(([n,l])=>`<div class="card stat"><b>${n}</b><span>${l}</span></div>`).join('');
 $('#comp').innerHTML=`<p class="sub">${c('done')} of ${tot} tasks done (${pct}%)</p><div class="bar"><i style="width:${pct}%"></i></div>`;
 $('#byp').innerHTML=['high','medium','low'].map(p=>{const n=tasks.filter(t=>t.priority===p&&t.status!=='done').length;
  return `<div style="margin-top:10px"><div class="row sp"><span>${p[0].toUpperCase()+p.slice(1)}</span><span class="sub">${n} open</span></div><div class="bar"><i style="width:${tot?n/tot*100:0}%;background:var(--${p})"></i></div></div>`}).join('')}

/* calendar */
function renderCal(){const y=cm.getFullYear(),m=cm.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
 $('#mlabel').textContent=cm.toLocaleDateString(undefined,{month:'long',year:'numeric'});
 let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="dn">${d}</div>`).join('')+'<div class="day blank"></div>'.repeat(first);
 for(let d=1;d<=days;d++){const k=ymd(new Date(y,m,d)),l=tasks.filter(t=>t.due===k);
  h+=`<button class="day ${k===TODAY()?'today':''} ${l.length?'has':''}" data-k="${k}"><b>${d}</b>${l.slice(0,3).map(t=>`<i class="${t.priority}">${esc(t.title)}</i>`).join('')}${l.length>3?`<small>+${l.length-3} more</small>`:''}</button>`}
 $('#cal').innerHTML=h}
$('#cal').onclick=e=>{const b=e.target.closest('.day[data-k]');if(b)openDlg(null,b.dataset.k)};
$('#prev').onclick=()=>{cm.setMonth(cm.getMonth()-1);renderCal()};$('#next').onclick=()=>{cm.setMonth(cm.getMonth()+1);renderCal()};
$('#tod').onclick=()=>{cm=new Date();cm.setDate(1);renderCal()};

/* notes */
function renderNotes(){const n=notes.find(x=>x.id===curNote);
 $('#nlist').innerHTML=notes.map(x=>`<button data-n="${x.id}" class="${x.id===curNote?'on':''}">${esc(x.title||'Untitled')}<small>${new Date(x.updated).toLocaleDateString()}</small></button>`).join('')||'<div class="empty">No notes yet</div>';
 $('#neditor').style.display=n?'block':'none';if(n){$('#ntitle').value=n.title;$('#nbody').value=n.body}}
$('#nlist').onclick=e=>{const b=e.target.closest('button');if(b){curNote=b.dataset.n;renderNotes()}};
$('#newNote').onclick=()=>{const n={id:uid(),title:'',body:'',updated:Date.now()};notes.unshift(n);curNote=n.id;store.set('tf_notes',notes);renderNotes();$('#ntitle').focus()};
function saveNote(){const n=notes.find(x=>x.id===curNote);if(!n)return;n.title=$('#ntitle').value;n.body=$('#nbody').value;n.updated=Date.now();store.set('tf_notes',notes);
 $('#nsaved').textContent='Saved '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
 const b=$(`#nlist [data-n="${n.id}"]`);if(b)b.firstChild.textContent=n.title||'Untitled'}
$('#ntitle').oninput=saveNote;$('#nbody').oninput=saveNote;
$('#delNote').onclick=()=>{if(!confirm('Delete this note?'))return;notes=notes.filter(x=>x.id!==curNote);curNote=notes[0]?.id||null;store.set('tf_notes',notes);renderNotes()};

/* pomodoro */
let mode='focus',left=cfg.focus*60,endAt=0,tick=null;
const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function showTimer(){$('#clock').textContent=fmt(left);document.title=(tick?fmt(left)+' · ':'')+'Taskflow';
 $('#tgo').textContent=tick?'Pause':'Start';$$('#modes button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
 const n=stats[TODAY()]||0;$('#tstat').textContent=`Today: ${n} session${n===1?'':'s'} · ${n*cfg.focus} min focused`}
function setMode(m){stop();mode=m;left=cfg[m]*60;showTimer()}
function stop(){clearInterval(tick);tick=null}
function beep(){try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.frequency.value=800;o.connect(a.destination);o.start();setTimeout(()=>{o.stop();a.close()},400)}catch(e){}}
function finish(){stop();beep();if(mode==='focus'){stats[TODAY()]=(stats[TODAY()]||0)+1;store.set('tf_stats',stats);
  setMode(stats[TODAY()]%4===0?'long':'short')}else setMode('focus')}
$('#tgo').onclick=()=>{if(tick){left=Math.max(0,Math.round((endAt-Date.now())/1000));stop();showTimer();return}
 endAt=Date.now()+left*1000;tick=setInterval(()=>{left=Math.max(0,Math.round((endAt-Date.now())/1000));showTimer();if(left<=0)finish()},250);showTimer()};
$('#trs').onclick=()=>setMode(mode);
$('#modes').onclick=e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.m)};

/* settings */
function renderSettings(){$('#sth').value=cfg.theme;$('#sf').value=cfg.focus;$('#ss').value=cfg.short;$('#sl').value=cfg.long}
$('#sth').onchange=e=>{cfg.theme=e.target.value;saveC();applyTheme()};
[['sf','focus'],['ss','short'],['sl','long']].forEach(([id,k])=>$('#'+id).onchange=e=>{cfg[k]=Math.min(120,Math.max(1,+e.target.value||cfg[k]));e.target.value=cfg[k];saveC();if(!tick&&mode===k){left=cfg[k]*60}showTimer()});
$('#wipe').onclick=()=>{if(!confirm('Delete all tasks, notes and settings?'))return;['tf_tasks','tf_notes','tf_cfg','tf_stats'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});location.reload()};

function renderAll(){renderHome();renderDash();renderBoard();renderCal();renderNotes();renderSettings();showTimer()}
applyTheme();route();
