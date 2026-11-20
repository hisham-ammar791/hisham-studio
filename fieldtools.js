/* أزرار نسخ / لصق / مسح لكل خانة كتابة — مشتركة لكل الصفحات */
(function(){
if(window.__ft)return;window.__ft=1;
const css=`.ftb{display:flex;gap:6px;justify-content:flex-end;margin:3px 0 6px}
.ftb button,.ftf button{font-family:inherit;font-size:12px;padding:3px 9px;border-radius:8px;border:1px solid rgba(127,127,127,.45);background:rgba(127,127,127,.14);color:inherit;cursor:pointer;line-height:1.6}
.ftb button.mic,.ftf button.mic{border-color:#10b981aa;color:#6ee7b7}
.ftb button.del,.ftf button.del{border-color:#d62828aa;color:#ff6b6b}
.ftf{position:absolute;z-index:99999;display:none;gap:5px;background:#1b2233;padding:4px;border-radius:10px;box-shadow:0 3px 12px #0007;color:#fff}
.fttoast{position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#1b2233;color:#fff;padding:8px 14px;border-radius:12px;z-index:100000;font-size:14px;display:flex;gap:10px;align-items:center;box-shadow:0 3px 12px #0008}
.fttoast button{font-family:inherit;background:#ffd166;color:#111;border:0;border-radius:8px;padding:3px 10px;cursor:pointer}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const OK_TYPES=['','text','search','url','email','tel'];
const want=el=>{if(!el||el.dataset.nt!==undefined||el.disabled||el.style.display==='none'||el.hidden)return false;if(el.readOnly&&el.tagName!=='TEXTAREA')return false;
 if(el.tagName==='TEXTAREA')return true;
 if(el.tagName==='INPUT')return OK_TYPES.includes((el.getAttribute('type')||'').toLowerCase());return false};
const fire=el=>{el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
let tt;const msg=(t,undo)=>{document.querySelectorAll('.fttoast').forEach(x=>x.remove());clearTimeout(tt);
 const d=document.createElement('div');d.className='fttoast';d.innerHTML='<span></span>';d.firstChild.textContent=t;
 if(undo){const b=document.createElement('button');b.textContent='↩️ رجّع';b.onclick=()=>{undo();d.remove()};d.appendChild(b)}
 document.body.appendChild(d);tt=setTimeout(()=>d.remove(),undo?7000:1800)};
async function doCopy(el){const v=el.value;if(!v){msg('الخانة فاضية');return}
 try{await navigator.clipboard.writeText(v)}catch(e){el.focus();el.select();try{document.execCommand('copy')}catch(_){}}
 msg('اتنسخ ✓')}
async function doPaste(el){try{const t=await navigator.clipboard.readText();if(!t){msg('الحافظة فاضية');return}
 const old=el.value,find=loc(el);el.value=old?old+(el.tagName==='TEXTAREA'?'\n':' ')+t:t;fire(el);msg('اتلصق ✓',()=>{const t=find();if(t){t.value=old;fire(t)}})}
 catch(e){el.focus();msg('اضغط مطوّل جوه الخانة واختار «لصق»')}}
const loc=el=>{const L=[...document.querySelectorAll('textarea,input')],i=L.indexOf(el);return()=>document.contains(el)?el:(L.length&&document.querySelectorAll('textarea,input')[i])||null};
function doClear(el){const old=el.value,find=loc(el);if(!old){msg('الخانة فاضية أصلًا');return}
 el.value='';fire(el);el.focus();
 msg('اتمسحت الخانة',()=>{const t=find();if(t){t.value=old;fire(t)}else msg('الصفحة اتحدثت — مش قادر أرجّعها')})}
/* 🎤 الكتابة بالصوت (Chrome) */
const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;let MIC=null;
function micStop(){if(MIC){MIC.stopped=true;try{MIC.r.stop()}catch(e){}}}
function doMic(el){if(!SRC){msg('الكتابة بالصوت مش مدعومة في المتصفح ده. استخدم Chrome');return}
 if(MIC&&MIC.el===el){micStop();return}micStop();
 const r=new SRC(),old=el.value,base=old&&!/\s$/.test(old)?old+' ':old,find=loc(el);let fin='';
 r.lang=el.dataset.lang||(/^ltr$/i.test(el.getAttribute('dir')||getComputedStyle(el).direction)&&!/[\u0600-\u06FF]/.test(el.placeholder||'')?'en-US':'ar-EG');r.interimResults=true;r.continuous=true;r.maxAlternatives=1;
 MIC={r,el,stopped:false};document.querySelectorAll('[data-ft="m"]').forEach(b=>b.classList.toggle('on',false));
 const mark=on=>document.querySelectorAll('[data-ft="m"]').forEach(b=>{if(b.__el===el||b.closest('.ftb')===el.nextElementSibling)b.textContent=on?'⏹️ وقّف':'🎤 اتكلم'});
 r.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)fin+=(fin&&!/\s$/.test(fin)?' ':'')+t.trim();else tmp+=t}
  const t=find()||el;t.value=base+fin+(tmp?(fin?' ':'')+tmp:'');fire(t)};
 r.onerror=e=>{const m={'not-allowed':'اسمح لكروم يستخدم المايك (من القفل اللي جنب العنوان ← الأذونات)','service-not-allowed':'اسمح لكروم يستخدم المايك','network':'الكتابة بالصوت محتاجة نت','no-speech':'ما سمعتش حاجة، قرّب الموبايل واتكلم تاني','audio-capture':'مفيش مايك شغال'}[e.error];if(m)msg('🎤 '+m)};
 r.onend=()=>{const m=MIC;MIC=null;mark(false);if(fin.trim())msg('🎤 اتكتب ✓',()=>{const t=find();if(t){t.value=old;fire(t)}})};
 try{r.start();mark(true);msg('🎤 بسمعك… اتكلم، ودوس «وقّف» لما تخلص')}catch(e){MIC=null;msg('المايك مشغول، جرّب تاني')}}
const act=(a,el)=>a==='c'?doCopy(el):a==='p'?doPaste(el):a==='m'?doMic(el):doClear(el);
const BTN=(SRC?'<button type="button" data-ft="m" class="mic">🎤 اتكلم</button>':'')+'<button type="button" data-ft="c">📋 نسخ</button><button type="button" data-ft="p">📥 لصق</button><button type="button" class="del" data-ft="x">🗑️ مسح</button>';
/* الخانات الكبيرة: شريط ثابت تحتها */
function add(el){if(el.__ft)return;el.__ft=1;
 if(el.tagName!=='TEXTAREA')return;
 const b=document.createElement('div');b.className='ftb';b.innerHTML=el.readOnly?'<button type="button" data-ft="c">📋 نسخ</button>':BTN;
 b.addEventListener('click',e=>{const x=e.target.closest('[data-ft]');if(!x)return;e.preventDefault();e.stopPropagation();act(x.dataset.ft,el)});
 el.insertAdjacentElement('afterend',b)}
function scan(root){(root.querySelectorAll?root:document).querySelectorAll('textarea,input').forEach(el=>{if(want(el))add(el)})}
/* الخانات الصغيرة: شريط عائم فوقها وقت الكتابة */
const fl=document.createElement('div');fl.className='ftf';fl.innerHTML=BTN;let cur=null;
fl.addEventListener('mousedown',e=>e.preventDefault());fl.addEventListener('touchstart',e=>{const x=e.target.closest('[data-ft]');if(x){e.preventDefault();cur&&act(x.dataset.ft,cur)}},{passive:false});
fl.addEventListener('click',e=>{const x=e.target.closest('[data-ft]');if(x&&cur){e.preventDefault();act(x.dataset.ft,cur)}});
const place=()=>{if(!cur||!document.contains(cur)){fl.style.display='none';return}const r=cur.getBoundingClientRect();
 fl.style.display='flex';const h=fl.offsetHeight||30,w=fl.offsetWidth||170;
 let top=r.top+window.scrollY-h-4;if(r.top<h+6)top=r.bottom+window.scrollY+4;
 let left=r.left+window.scrollX+r.width-w;if(left<4)left=4;fl.style.top=top+'px';fl.style.left=left+'px'};
document.addEventListener('focusin',e=>{const el=e.target;if(el.tagName==='INPUT'&&want(el)){cur=el;fl.querySelectorAll('[data-ft="m"]').forEach(b=>{b.__el=el;b.textContent=MIC&&MIC.el===el?'⏹️ وقّف':'🎤'});if(!fl.parentNode)document.body.appendChild(fl);place()}else if(!fl.contains(el)){cur=null;fl.style.display='none'}});
document.addEventListener('focusout',e=>{setTimeout(()=>{if(document.activeElement!==cur&&!(MIC&&MIC.el===cur)){cur=null;fl.style.display='none'}},150)});
window.addEventListener('scroll',()=>cur&&place(),{passive:true});window.addEventListener('resize',()=>cur&&place());
const go=()=>{scan(document);new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches&&n.matches('textarea'))want(n)&&add(n);else if(n.querySelectorAll)scan(n)}}).observe(document.body,{childList:true,subtree:true})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go();
})();
