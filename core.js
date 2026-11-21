/* core.js — القلب المشترك للاستوديوهات الجديدة (صغير وآمن: ما بيلمسش الاستوديو القديم) */
(function(){
const CORE=window.CORE={};CORE.VER='html77';
const $=CORE.$=id=>document.getElementById(id);
CORE.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
CORE.toast=function(m,ms){let t=$('coreToast');if(!t){t=document.createElement('div');t.id='coreToast';t.style.cssText='pointer-events:none;position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#0f172a;border:1px solid #38bdf8;color:#fff;padding:9px 14px;border-radius:12px;z-index:99;font-size:14px;max-width:90vw;text-align:center';document.body.appendChild(t)}
 t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',ms||2200)};

/* ---------- مخزن كبير (IndexedDB) احتياطي للمشروع والمكتبة والصور ---------- */
CORE.idb=(function(){let dbp=null;const db=()=>dbp||(dbp=new Promise((r,j)=>{try{const q=indexedDB.open('hs_db',1);q.onupgradeneeded=()=>{q.result.createObjectStore('kv')};q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)}catch(e){j(e)}}));
 const tx=(m,f)=>db().then(d=>new Promise((r,j)=>{const t=d.transaction('kv',m),s=t.objectStore('kv'),q=f(s);t.oncomplete=()=>r(q&&q.result);t.onerror=()=>j(t.error)}));
 return {get:k=>tx('readonly',s=>s.get(k)).catch(()=>undefined),set:(k,v)=>tx('readwrite',s=>s.put(v,k)).catch(()=>{}),del:k=>tx('readwrite',s=>s.delete(k)).catch(()=>{}),keys:()=>tx('readonly',s=>s.getAllKeys()).catch(()=>[])}})();
CORE.lsTs=k=>+(localStorage.getItem('hs_ts~'+k)||0);
/* بيكتب في localStorage، ونسخة دايمًا في المخزن الكبير؛ لو localStorage اتملا بيكمل على الكبير بس */
CORE.persist=function(k,raw,onFull){const ts=Date.now();CORE.idb.set(k,{ts,raw});
 try{localStorage.setItem(k,raw);localStorage.setItem('hs_ts~'+k,ts);return 'ls'}catch(e){}
 if(onFull){try{onFull();localStorage.setItem(k,raw);localStorage.setItem('hs_ts~'+k,ts);return 'ls'}catch(e){}}
 try{localStorage.removeItem(k);localStorage.setItem('hs_ts~'+k,ts)}catch(e){}
 if(!CORE._bigNote){CORE._bigNote=1;CORE.toast('📦 الشغل كبير: اتحفظ في المخزن الكبير على الموبايل ✓',4000)}return 'idb'};
/* لو النسخة في المخزن الكبير أحدث من localStorage بيرجعها */
CORE.restoreBig=async function(k){const r=await CORE.idb.get(k);if(!r||!r.raw)return null;const has=localStorage.getItem(k)!=null;if(has&&r.ts<=CORE.lsTs(k))return null;return r.raw};

/* ---------- نسخ ومشاركة ---------- */
CORE.copy=async function(txt,msg){let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(e){}
 if(!ok){try{const a=document.createElement('textarea');a.value=txt;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();ok=document.execCommand('copy');a.remove()}catch(e){}}
 if(ok)CORE.toast(msg||'تم النسخ ✓');else CORE.showText(txt);return ok};
CORE.showText=function(t){let o=$('coreTxt');if(!o){o=document.createElement('div');o.id='coreTxt';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000d;display:flex;flex-direction:column;padding:14px;gap:8px';
 o.innerHTML='<div style="color:#fff">النسخ التلقائي اتمنع. اضغط مطوّلًا على النص واختار «تحديد الكل» ثم «نسخ»</div><textarea id="coreTxtA" style="flex:1;direction:ltr;font-size:13px"></textarea><button class="b g" onclick="this.parentNode.style.display=\'none\'">تم</button>';document.body.appendChild(o)}
 o.style.display='flex';$('coreTxtA').value=t;$('coreTxtA').focus();$('coreTxtA').select()};
/* مشاركة: الأمر الطويل بيتنسخ الأول وتفتح قايمة المشاركة بنص قصير (زي الاستوديو القديم) */
CORE.send=async function(txt){const ok=await CORE.copy(txt,'اتنسخ الأمر ✓ الصقه في التطبيق');
 if(navigator.share){try{await navigator.share(txt.length<=6000?{text:txt}:{text:'الصق الأمر هنا (اتنسخ)'})}catch(e){}}};
CORE.shareImage=async function(dataUrl,name){try{const r=await fetch(dataUrl),b=await r.blob(),f=new File([b],name||'frame.jpg',{type:b.type||'image/jpeg'});
 if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return true}}catch(e){if(e&&e.name==='AbortError')return true}
 CORE.toast('المشاركة مش مدعومة هنا. اضغط مطوّلًا على الصورة واحفظها');return false};

/* ---------- قراءة شخصيات وأماكن الاستوديو القديم (قراءة فقط) ---------- */
CORE.oldStudio=async function(){let a=null,b=null;try{a=JSON.parse(localStorage.getItem('studio5s_v2')||'null')}catch(e){}
 try{b=await new Promise(r=>{const q=indexedDB.open('ez_state',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>{try{const g=q.result.transaction('s').objectStore('s').get('cur');g.onsuccess=()=>r(g.result);g.onerror=()=>r(null)}catch(e){r(null)}};q.onerror=()=>r(null)});b=b&&JSON.parse(b)}catch(e){b=null}
 const S=(b&&(!a||(b._ts||0)>(a._ts||0)))?b:a;return {chars:(S&&S.chars||[]).filter(c=>c&&c.name),places:(S&&S.places)||[],props:(S&&S.props)||[]}};

/* ---------- تخزين مشروع الاستوديو + سجل نسخ ---------- */
CORE.store=function(ns,def){const K='hs_'+ns,H='hs_hist_'+ns;let P;try{P=Object.assign({},def,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){P=Object.assign({},def)}
 let last='';const api={get:()=>P,
  save(){const raw=JSON.stringify(P);CORE.persist(K,raw,()=>{Object.keys(localStorage).filter(k=>k.indexOf('hs_hist_')===0).forEach(k=>{let h=[];try{h=JSON.parse(localStorage.getItem(k)||'[]')}catch(x){}try{localStorage.setItem(k,JSON.stringify(h.slice(0,2)))}catch(x){localStorage.removeItem(k)}})})},
  snap(why,force){try{const raw=JSON.stringify(P);if(!force&&raw===last)return;last=raw;let h=JSON.parse(localStorage.getItem(H)||'[]');h.unshift({ts:Date.now(),why:why||'',raw});for(const n of [12,6,3,1]){try{localStorage.setItem(H,JSON.stringify(h.slice(0,n)));break}catch(e){}}}catch(e){}},
  hist(){try{return JSON.parse(localStorage.getItem(H)||'[]')}catch(e){return []}},
  set(o){P=Object.assign({},def,o||{});api.save()},
  reset(){P=JSON.parse(JSON.stringify(def));api.save()},
  restore(ts){const x=api.hist().find(h=>h.ts==ts);if(!x)return false;api.snap('قبل الاسترجاع',true);P=Object.assign({},def,JSON.parse(x.raw));api.save();return true}};
 setInterval(()=>api.snap('تلقائي'),300000);
 CORE.restoreBig(K).then(raw=>{if(!raw)return;try{P=Object.assign({},def,JSON.parse(raw));window.dispatchEvent(new CustomEvent('hs-store',{detail:ns}))}catch(e){}});
 return api};

/* ---------- تقسيم الأمر لأجزاء حسب المدة ---------- */
CORE.partsN=(sec,sel)=>(!sel||sel==='auto')?Math.max(1,Math.ceil((+sec||30)/45)):Math.max(1,+sel||1);
CORE.partRange=(sec,n,k)=>[Math.round((+sec||30)*k/n),Math.round((+sec||30)*(k+1)/n)];

/* ---------- كتالوج الاختيارات ---------- */
CORE.GENRES=[['real','واقعي','حدث حقيقي القلب فيه إنساني وتفاصيله من الحياة'],['horror','رعب','توتر بطيء وصمت وصوت مفاجئ، والخوف من المجهول أكبر من المشهد المرعب'],['scifi','خيال علمي','فكرة علمية واحدة واضحة وعالم متماسك وتأثيرها على الإنسان'],['comedy','كوميدي','مفارقة وتصعيد وإيقاع سريع وخاتمة مفاجئة'],['fantasy','فانتازي','عالم له قواعد سحر ثابتة وإحساس بالدهشة'],['drama','دراما','صراع داخلي وقرار صعب وعواطف صادقة بلا مبالغة'],['mystery','غموض وتشويق','سؤال مفتوح وأدلة تتكشف تدريجيًا وتحوّل في الآخر'],['crime','جريمة','دافع وأدلة وكشف'],['action','أكشن','حركة واضحة الاتجاه وإيقاع قطع سريع وتصاعد'],['romance','رومانسي','لحظات صغيرة صادقة وشوق وتفاصيل'],['history','تاريخي','دقة في الزمن والمكان وأثر الحدث على الناس'],['edu','تعليمي','فكرة واحدة في كل مشهد وتبسيط بدون سطحية']];
CORE.VISUALS=[
 ['real','واقعي','real','تصوير واقعي طبيعي وإضاءة حقيقية وجلد وخامات حقيقية'],
 ['cine','سينمائي احترافي','real','سينمائي: عدسات واسعة وعمق ميدان ضيق وإضاءة درامية وتدرج لوني فيلمي'],
 ['doc','وثائقي','real','وثائقي: كاميرا محمولة هادئة ولقطات تغطية ومقابلات طبيعية'],
 ['hand','كاميرا محمول','real','كاميرا موبايل محمولة بحركة بشرية خفيفة وإضاءة متاحة'],
 ['3d','أنيميشن 3D','anim','رسوم ثلاثية الأبعاد بجودة أفلام الأنيميشن العالمية وخامات وإضاءة ناعمة'],
 ['2d','كارتون 2D','anim','رسوم ثنائية الأبعاد بخطوط واضحة وألوان مسطحة وحركة معبّرة'],
 ['anime','أنيمي','anim','أسلوب أنيمي ياباني بخطوط حادة وتعابير مبالغ فيها وخلفيات مرسومة'],
 ['handdrawn','رسم يدوي','anim','رسم يدوي بخطوط حية وتفاصيل غير مثالية عن قصد'],
 ['water','ألوان مائية','anim','ألوان مائية شفافة وحواف ناعمة وانسياب لوني'],
 ['stop','ستوب موشن','craft','ستوب موشن: حركة متقطعة بـ12 إطار في الثانية، وخامات حقيقية ظاهرة، وبصمات أصابع خفيفة'],
 ['clay','صلصال','craft','صلصال: خامة عجين ظاهرة وبصمات وحركة متقطعة، وتعابير وجه تتشكل بين اللقطات'],
 ['puppet','دمى قماش','craft','دمى قماش بخياطة وألياف ظاهرة وحركة مفصلية'],
 ['paper','ورق مقصوص','craft','ورق مقصوص بطبقات وظلال بين الطبقات وحركة مسطحة'],
 ['sand','رمل','craft','رسم بالرمل: خطوط تتشكل وتتحول من مشهد لمشهد'],
 ['motion','موشن جرافيك','graphic','موشن جرافيك: أشكال وخطوط ونصوص متحركة بإيقاع، بدون ممثلين'],
 ['white','وايت بورد','graphic','وايت بورد: يد ترسم على سبورة بيضاء بقلم، ويتشكل الرسم مع الكلام'],
 ['info','إنفوجرافيك متحرك','graphic','إنفوجرافيك: أرقام ورسوم بيانية وأيقونات تظهر تباعًا'],
 ['typo','تايبوجرافي','graphic','كلمات متحركة هي الصورة نفسها، خط وحركة تعبّر عن المعنى'],
 ['maps','خرائط متحركة','graphic','خرائط متحركة: مسارات وحدود وتكبير على أماكن مع تسميات واضحة'],
 ['comic','كوميك','art','صفحات كوميك: إطارات وفقاعات كلام وخطوط سميكة'],
 ['shadow','ظلال','art','مسرح ظلال: أشكال سوداء على خلفية مضيئة'],
 ['neon','نيون','art','إضاءة نيون ملونة وسطوح لامعة وليل'],
 ['bw','أبيض وأسود كلاسيك','art','أبيض وأسود بتباين عالٍ وحبيبات فيلم قديم'],
 ['pencil','قلم رصاص','art','رسم قلم رصاص بتظليل وخطوط ورق'],
 ['oil','لوحات زيتية','art','لوحات زيتية بضربات فرشاة ظاهرة'],
 ['pixel','بكسل','art','بكسل آرت بألوان محدودة وحركة إطارات قليلة']];
CORE.LANGS=[['eg','عامية مصرية','العامية المصرية الطبيعية كما يتكلم الناس، بدون تكلف'],['fusha','فصحى','فصحى سليمة جميلة بإيقاع يُقرأ بصوت عالٍ'],['simple','فصحى مبسطة','فصحى سهلة قريبة من الناس بدون ألفاظ معقدة'],['gulf','خليجي','لهجة خليجية طبيعية'],['shami','شامي','لهجة شامية طبيعية'],['maghrebi','مغربي','لهجة مغاربية طبيعية'],['mix','مزيج','السرد بالفصحى المبسطة والحوار بالعامية المصرية']];
CORE.SATIRE=[['none','بدون سخرية',''],['light','سخرية خفيفة (مقترحة)','سخرية خفيفة وذكية في مواضع قليلة بتعليق طريف، بدون ما تكسر جدية الموضوع، وبدون سخرية من ضحايا أو معتقدات أو مرض أو وفاة'],['mid','سخرية متوسطة','سخرية ظاهرة وخفيفة الدم في أغلب المقاطع، بدون إهانة، وتختفي تمامًا في المواضيع الحساسة']];
CORE.VOICES=[['storyteller','الحكّاء الشعبي','راوي قاعد قدامك: جمل قصيرة وسؤال للمشاهد ورجوع للحكاية'],['detective','المحقق الهادئ','عرض أدلة واحدًا ورا واحد، وتمييز «اللي نعرفه» من «اللي ما نعرفوش»'],['friend','الصديق الذكي','كلام بسيط وطريف يشرح الصعب كأنه بيحكيه لصاحبه'],['thriller','السينمائي المتوتر','مشاهد قصيرة وحواس وقطع مفاجئ وذروة'],['wit','الساخر الذكي','ملاحظات حادة وخفيفة الدم'],['doc','الوقور الوثائقي','تأمل وهدوء وجمل ثقيلة المعنى وإيقاع بطيء'],['sales','المقنع التجاري','يبدأ من مشكلة الجمهور بكلامه هو وينتهي بدعوة واضحة'],['mine','أسلوبي المحفوظ','مزيج أحمد خالد توفيق (سخرية حزينة وذكاء) وستيفن كنج (توتر وتفاصيل بشرية) ومصطفى محمود (تأمل ودهشة)'],['custom','أسلوب مخصص','يتقلد عينة نص بيلصقها المستخدم']];
CORE.TEAM={song:'شاعر أغاني محترف، وملحن وموزّع، ومهندس صوت، ومخرج كليب، ومدير تصوير، ومصمم إضاءة، ومونتير',
 film:'سيناريست، وكاتب محتوى عالمي، ومخرج، ومدير تصوير، ومصمم إضاءة، ومونتير، ومهندس صوت',
 ad:'كاتب إعلانات عالمي، ومصمم عالمي، ومخرج، ومدير تصوير، ومونتير، ومهندس صوت، ومعلّق صوتي'};
CORE.WRITING=`دستور الكتابة (إلزامي): اكتب كأفضل كاتب محتوى ومعد في العالم، بصوت كاتب واحد ثابت، وبكلام يتقال بصوت عالٍ ويبان إن إنسانًا كتبه. جمل متفاوتة الطول. تفاصيل محددة (أرقام، أسماء، أماكن، حواس) بدل العموميات. ممنوع: المقدمات العامة («في عالم يتسارع»، «لا شك أن»)، والخاتمة التلخيصية («في الختام»)، و«دعونا نغوص/نستكشف»، وتكرار صيغة «ليس كذا بل كذا»، والثلاثيات المتماثلة، والتعداد النقطي داخل السرد، وعبارات إنشائية فارغة، وتكرار نفس بداية الفقرات. ابدأ بهوك قوي، وكل مقطع ينتهي بجملة تشد للي بعده.`;
CORE.pick=(list,k)=>list.find(x=>x[0]===k)||list[0];
CORE.opts=(list,sel)=>list.map(x=>`<option value="${x[0]}"${x[0]===sel?' selected':''}>${CORE.esc(x[1])}</option>`).join('');
CORE.teamReview=(what,team,text)=>`أنت فريق محترف: ${team}. راجع الشغل ده (${what}) كل واحد من منظور تخصصه، وارجع بالآتي بالترتيب: (1) حكم واحد قاطع: جاهز / يحتاج تعديل. (2) أهم 5 تعديلات محددة، كل تعديل بصيغة «بدّل كذا بكذا» مع السبب في سطر. (3) النسخة المعدّلة كاملة. بدون خيارات متعددة وبدون كلام عام. ${CORE.WRITING}\n\nالشغل:\n"""\n${text}\n"""`;
/* سجل نسخ: نافذة جاهزة */
CORE.histBox=function(st,onRestore){const l=st.hist();let o=$('coreHist');if(o)o.remove();o=document.createElement('div');o.id='coreHist';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 o.innerHTML='<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:75vh;overflow:auto;padding:12px;color:#fff"><b>🕘 سجل النسخ</b><div class="m" style="margin:4px 0 8px">بيتحفظ لوحده. الاسترجاع بيحفظ الحالي الأول.</div><button class="b g" data-a="now" style="width:100%">📸 احفظ نسخة دلوقتي</button>'+
 (l.length?l.map(m=>'<div style="border-top:1px dashed #334155;margin-top:8px;padding-top:8px;display:flex;gap:8px;align-items:center"><div style="flex:1;font-size:13px">'+new Date(m.ts).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})+' • '+CORE.esc(m.why||'')+'</div><button class="b" data-r="'+m.ts+'">استرجع</button></div>').join(''):'<div class="m">لسه مفيش نسخ.</div>')+'<button class="b" data-a="x" style="width:100%;margin-top:10px">إغلاق</button></div>';
 document.body.appendChild(o);o.onclick=e=>{const t=e.target;if(t===o||t.dataset.a==='x'){o.remove();return}if(t.dataset.a==='now'){st.snap('يدوي',true);CORE.toast('اتحفظت ✓');CORE.histBox(st,onRestore);return}
  if(t.dataset.r&&confirm('ترجع للنسخة دي؟')){if(st.restore(t.dataset.r)){o.remove();onRestore&&onRestore();CORE.toast('اترجعت ✓')}}}};
})();

/* ================= 👥 مكتبة مشتركة: الشخصيات والأماكن ومراجع الكادر ================= */
(function(){
const C=window.CORE,esc=C.esc,LK='hs_lib';
const DIALECTS=[['','نفس لغة العمل'],['eg','مصري'],['fusha','فصحى'],['gulf','خليجي'],['shami','شامي'],['maghrebi','مغربي'],['iraqi','عراقي'],['sudani','سوداني'],['en','إنجليزي'],['custom','أخرى (اكتبها في الأداء)']];
const ANGLES=[['front','من الأمام'],['q34','ثلاثة أرباع'],['side','جانبي'],['back','من الخلف'],['wide','عام واسع'],['ots','من فوق الكتف'],['top','من فوق']];
C.DIALECTS=DIALECTS;C.ANGLES=ANGLES;
function load(){try{return Object.assign({chars:[],places:[],props:[],frames:[]},JSON.parse(localStorage.getItem(LK)||'{}'))}catch(e){return {chars:[],places:[],props:[],frames:[]}}}
C.lib=load();
C.restoreBig(LK).then(raw=>{if(!raw)return;try{C.lib=Object.assign({chars:[],places:[],props:[],frames:[]},JSON.parse(raw));C._castR&&C._castR()}catch(e){}});
C.libSave=function(){C.persist(LK,JSON.stringify(C.lib));return true};
C.libImport=async function(force){const o=await C.oldStudio();let n=0;
 (o.chars||[]).forEach(c=>{if(c.vo||!c.name)return;if(C.lib.chars.some(x=>x.oid===c.id||x.name===c.name))return;C.lib.chars.push({id:'c'+Date.now()+n,oid:c.id,name:c.name,look:c.ar||'',voice:c.voiceAr||'',dialect:'',tone:c.toneAr||'',img:c.img||''});n++});
 (o.places||[]).forEach(p=>{if(!p.name||C.lib.places.some(x=>x.name===p.name))return;C.lib.places.push({id:'p'+Date.now()+n,name:p.name,desc:p.ar||'',img:p.img||''});n++});
 (o.props||[]).forEach(p=>{if(!p.name||C.lib.props.some(x=>x.name===p.name))return;C.lib.props.push({id:'r'+Date.now()+n,name:p.name,desc:p.ar||'',img:p.img||''});n++});
 if(n)C.libSave();if(force)C.toast(n?'اتنقل '+n+' من الاستوديو القديم ✓':'مفيش جديد في الاستوديو القديم');return n};
if(!C.lib.chars.length&&!C.lib.places.length&&!localStorage.getItem('hs_lib_imp')){try{localStorage.setItem('hs_lib_imp','1')}catch(e){}C.libImport(false).then(n=>{if(n&&C._castR)C._castR()})}
C.shrinkImg=(file,max)=>new Promise(r=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const k=Math.min(1,(max||640)/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',.78))};im.onerror=()=>r('');im.src=u});
const T={chars:['👤 الشخصيات','شخصية'],places:['📍 الأماكن','مكان'],props:['🧰 الأدوات والإكسسوارات','أداة'],frames:['🖼️ مراجع الكادر','مرجع كادر']};
const get=(t,id)=>(C.lib[t]||[]).find(x=>x.id===id);
C.selOf=P=>{P.cast=P.cast||{};['chars','places','props','frames'].forEach(k=>{P.cast[k]=(P.cast[k]||[]).filter(id=>get(k,id))});return P.cast};
const dn=k=>C.pick(DIALECTS,k)[1];
/* نص الأوامر */
C.castTxt=function(P){const s=C.selOf(P),ch=s.chars.map(id=>get('chars',id)),pl=s.places.map(id=>get('places',id)),fr=s.frames.map(id=>get('frames',id)),pr=s.props.map(id=>get('props',id));let t='';
 if(ch.length)t+='الشخصيات (الشكل والصوت ثابتين في كل لقطة ومشهد، بدون أي تغيير):\n'+ch.map(c=>'- '+c.name+': '+(c.look||'')+(c.voice?' | الصوت: '+c.voice:'')+(c.dialect?' | اللهجة: '+dn(c.dialect):'')+(c.tone?' | الأداء: '+c.tone:'')).join('\n')+'\n';
 if(pr.length)t+='الأدوات والإكسسوارات (شكلها ثابت في كل لقطة تظهر فيها):\n'+pr.map(p=>'- '+p.name+': '+(p.desc||'')+(p.owner?' (مع '+p.owner+')':'')).join('\n')+'\n';
 if(pl.length)t+='الأماكن (ثابتة):\n'+pl.map(p=>'- '+p.name+': '+(p.desc||'')).join('\n')+'\n';
 if(fr.length)t+='مراجع الكادر (صور مرفقة، التزم بأماكن الشخصيات فيها):\n'+fr.map(f=>'- '+f.name+': '+(f.chars||[]).map(id=>(get('chars',id)||{}).name).filter(Boolean).join(' و')+((get('places',f.place)||{}).name?' في '+get('places',f.place).name:'')+(f.angle?'، زاوية '+C.pick(ANGLES,f.angle)[1]:'')+(f.note?'، '+f.note:'')).join('\n')+'\n';
 return t};
C.castVoices=function(P){const s=C.selOf(P);return s.chars.map(id=>get('chars',id)).filter(c=>c.voice||c.dialect||c.tone).map(c=>'- '+c.name+': '+[c.voice,c.dialect&&'لهجة '+dn(c.dialect),c.tone].filter(Boolean).join('، ')).join('\n')};
C.castFrames=P=>C.selOf(P).frames.map(id=>get('frames',id));
C.frameImg=id=>(get('frames',id)||{}).img||'';
/* الكارت */
C.castCard=function(P){const s=C.selOf(P);
 const row=(t,x)=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed var(--border);padding:6px 0"><input type="checkbox" data-cc="${t}:${x.id}" ${s[t].includes(x.id)?'checked':''} style="width:22px;height:22px">${x.img?`<img src="${x.img}" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:'<div style="width:44px;height:44px;border-radius:8px;background:#0b1220;display:flex;align-items:center;justify-content:center">'+T[t][0].split(' ')[0]+'</div>'}<div style="flex:1;min-width:0;font-size:14px"><b>${esc(x.name||'بدون اسم')}</b><div class="m" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t==='chars'?[x.voice&&'🗣️ '+x.voice,x.dialect&&dn(x.dialect)].filter(Boolean).join(' • ')||x.look:(t==='places'||t==='props')?x.desc:(x.chars||[]).map(id=>(get('chars',id)||{}).name).filter(Boolean).join('، '))}</div></div><button class="b" data-ca="edit:${t}:${x.id}" style="margin:0">✏️</button></div>`;
 return `<div class="c"><h3 id="castCard">👥 الشخصيات والأماكن والأدوات والكادرات</h3><div class="m">علّم اللي في العمل ده. المكتبة مشتركة بين كل الاستوديوهات.</div>
 ${['chars','places','props','frames'].map(t=>`<details ${s[t].length||!C.lib[t].length?'open':''} style="margin-top:8px"><summary style="font-weight:700">${T[t][0]} (${s[t].length}/${C.lib[t].length})</summary>${C.lib[t].map(x=>row(t,x)).join('')}<button class="b" data-ca="add:${t}">➕ ${T[t][1]} ${t==='chars'||t==='props'?'جديدة':'جديد'}</button></details>`).join('')}
 <button class="b" data-ca="import">⬇️ هات من الاستوديو القديم</button></div>`};
/* المحرر */
function editor(t,id){const x=id?Object.assign({},get(t,id)):{id:t[0]+Date.now(),name:'',chars:[]};let o=document.getElementById('castEd');if(o)o.remove();o=document.createElement('div');o.id='castEd';
 o.style.cssText='position:fixed;inset:0;z-index:97;background:#000c;display:flex;align-items:flex-end';
 const f=(k,l,ta,ph)=>`<label class="l">${l}</label>${ta?`<textarea data-e="${k}" rows="${ta}" placeholder="${ph||''}">${esc(x[k]||'')}</textarea>`:`<input data-e="${k}" value="${esc(x[k]||'')}" placeholder="${ph||''}">`}`;
 const opts=(l,v)=>l.map(a=>`<option value="${a[0]}"${a[0]===(v||'')?' selected':''}>${esc(a[1])}</option>`).join('');
 let body=f('name','الاسم');
 if(t==='chars')body+=f('look','الشكل الثابت (الملامح، السن، الملابس، الألوان)',3)+f('voice','🗣️ الصوت (الطبقة، السن، النبرة، السرعة، لازمة)',2,'مثال: صوت رجل ستيني أجش وبطيء، بيمط آخر الكلمة')+`<label class="l">اللهجة</label><select data-e="dialect">${opts(DIALECTS,x.dialect)}</select>`+f('tone','🎭 أسلوب الأداء والشخصية',2,'مثال: ساخر وهادئ، بيرد بسؤال');
 if(t==='places')body+=f('desc','الوصف الثابت (أماكن الأشياء، الإضاءة، الألوان)',3);
 if(t==='props')body+=f('desc','الوصف الثابت (الشكل، اللون، الحجم، الخامة، أي كتابة عليها)',3,'مثال: علبة دوا بيضا عليها شريط أزرق ولوجو صيدلية Dr/H')+f('owner','مع مين أو فين بتظهر (اختياري)',0,'مثال: في إيد فهيم / على الكاونتر');
 if(t==='frames')body+=`<label class="l">مين في الكادر</label>${C.lib.chars.map(c=>`<label style="display:inline-flex;gap:4px;margin:4px 8px 0 0;align-items:center"><input type="checkbox" data-fc="${c.id}" ${(x.chars||[]).includes(c.id)?'checked':''} style="width:auto">${esc(c.name)}</label>`).join('')||'<div class="m">ضيف شخصيات الأول</div>'}<label class="l">المكان</label><select data-e="place"><option value="">—</option>${C.lib.places.map(p=>`<option value="${p.id}"${p.id===x.place?' selected':''}>${esc(p.name)}</option>`).join('')}</select><label class="l">الزاوية</label><select data-e="angle">${opts([['','—']].concat(ANGLES),x.angle)}</select>`+f('note','مين واقف فين (اختياري)',2,'مثال: فهيم ورا الكاونتر يمين، والزبون قدامه شمال');
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:88vh;overflow:auto;padding:12px;color:#fff"><b>${id?'تعديل':'إضافة'} ${T[t][1]}</b>${body}
 <label class="l">🖼️ الصورة ${t==='frames'?'(صورة المرجع)':'(شيت أو مرجع)'}</label>${x.img?`<img src="${x.img}" style="max-width:100%;border-radius:10px">`:''}<input type="file" accept="image/*" data-eimg>
 ${t==='chars'?`<button class="b bl" data-ex="sheet">📋 أمر صورة شيت للشخصية</button>`:''}${t==='props'?`<button class="b bl" data-ex="sheet">📋 أمر صورة مرجع للأداة</button>`:''}${t==='places'?`<button class="b bl" data-ex="sheet">📋 أمر صورة للمكان</button>`:''}
 <div style="display:flex;gap:6px;margin-top:10px"><button class="b g" data-ex="save" style="flex:2">💾 حفظ</button>${id?'<button class="b r" data-ex="del">🗑️</button>':''}<button class="b" data-ex="x" style="flex:1">إلغاء</button></div></div>`;
 document.body.appendChild(o);
 o.addEventListener('change',async e=>{if(e.target.dataset.eimg!==undefined&&e.target.files[0]){x.img=await C.shrinkImg(e.target.files[0],t==='frames'?900:560);C.toast('اتحطت الصورة ✓ اضغط حفظ')}});
 o.onclick=e=>{const b=e.target.closest('[data-ex]');if(e.target===o){o.remove();return}if(!b)return;const a=b.dataset.ex;
  o.querySelectorAll('[data-e]').forEach(el=>x[el.dataset.e]=el.value);x.chars=[...o.querySelectorAll('[data-fc]')].filter(c=>c.checked).map(c=>c.dataset.fc);
  if(a==='x'){o.remove();return}
  if(a==='sheet'){C.copy(t==='chars'?`Character reference sheet, full body front view + 3/4 view + side view + close-up face, neutral pose, plain light grey background, consistent design. Character: ${x.name}. Look (Arabic description, translate faithfully): ${x.look||''}. No text, no watermark.`:t==='props'?`Product/prop reference image on a plain light grey background, front and 3/4 view, true colors and scale details. Prop: ${x.name}. Description (Arabic, translate faithfully): ${x.desc||''}. No watermark.`:`Wide establishing reference image of a location, no people, clear layout. Location: ${x.name}. Description (Arabic, translate faithfully): ${x.desc||''}. No text, no watermark.`,'اتنسخ أمر الصورة ✓ الصقه في Gemini أو ChatGPT');return}
  if(a==='del'){if(!confirm('تمسح «'+(x.name||'')+'» من المكتبة؟ (هيتشال من كل الاستوديوهات)'))return;C.lib[t]=C.lib[t].filter(y=>y.id!==x.id);C.libSave();o.remove();C._castR&&C._castR();return}
  if(a==='save'){if(!(x.name||'').trim()){alert('اكتب الاسم');return}const k=C.lib[t].findIndex(y=>y.id===x.id);if(k>=0)C.lib[t][k]=x;else C.lib[t].push(x);if(!C.libSave())return;
   if(!id&&C._castP){const P=C._castP();C.selOf(P)[t].push(x.id);C._castS&&C._castS()}o.remove();C.toast('اتحفظ ✓');C._castR&&C._castR()}}}
C.bindCast=function(getP,save,render){C._castP=getP;C._castS=save;C._castR=render;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-ca]');if(!b)return;const [a,t,id]=b.dataset.ca.split(':');
  if(a==='add')editor(t);if(a==='edit')editor(t,id);if(a==='import')C.libImport(true).then(()=>render())});
 document.addEventListener('change',e=>{const c=e.target.dataset&&e.target.dataset.cc;if(!c)return;const [t,id]=c.split(':'),s=C.selOf(getP());s[t]=s[t].filter(x=>x!==id);if(e.target.checked)s[t].push(id);save()})};
})();

/* ================= 🎵 الموسيقى التصويرية والبداية والنهاية (أوامر Suno) ================= */
(function(){
const C=window.CORE,esc=C.esc;
const MOODS=[['auto','حسب العمل'],['tense','توتر وتشويق'],['horror','رعب'],['comic','كوميدي خفيف'],['epic','ملحمي'],['sad','حزين ومؤثر'],['warm','دافئ وعائلي'],['mystery','غموض'],['upbeat','حماسي سريع'],['calm','هادئ تأملي'],['oriental','شرقي/مصري'],['pharaonic','فرعوني'],['electronic','إلكتروني حديث']];
C.MOODS=MOODS;
const M=P=>{P.music=Object.assign({on:true,mood:'auto',inst:'',ref:'',intro:5,outro:8,theme:''},P.music||{});return P.music};
C.musicCard=function(P){const m=M(P);return `<div class="c"><h3>🎵 الموسيقى التصويرية والبداية والنهاية</h3><div class="m">أوامر جاهزة لـ Suno (Instrumental). اختار الإحساس والآلات، وأنت اللي تحدد مدة البداية والنهاية.</div>
 <div class="row"><div><label class="l">الإحساس</label><select data-mf="mood">${C.opts(MOODS,m.mood)}</select></div><div><label class="l">اسم اللحن المميز (اختياري)</label><input data-mf="theme" value="${esc(m.theme)}" placeholder="مثال: لحن دكتور اتش"></div></div>
 <label class="l">الآلات المفضلة (اختياري)</label><input data-mf="inst" value="${esc(m.inst)}" placeholder="مثال: عود، كمان، بيانو، طبلة">
 <label class="l">مرجع إحساس (اختياري، بدون نسخ لحن موجود)</label><input data-mf="ref" value="${esc(m.ref)}" placeholder="مثال: زي موسيقى أفلام الغموض الكلاسيك">
 <div class="row"><div><label class="l">مدة البداية (ث)</label><input type="number" data-mf="intro" value="${esc(m.intro)}"></div><div><label class="l">مدة النهاية (ث)</label><input type="number" data-mf="outro" value="${esc(m.outro)}"></div></div>
 ${[['intro','🎬 أمر موسيقى البداية (Intro)'],['score','🎼 أمر الموسيقى التصويرية'],['outro','🏁 أمر موسيقى النهاية (Outro)'],['cues','🗂️ خريطة الموسيقى على المشاهد']].map(k=>`<div class="pair"><button class="b bl" data-mu="${k[0]}">📋 ${k[1]}</button><button class="b" data-mu="${k[0]}!">📤</button></div>`).join('')}</div>`};
C.musicPrompt=function(P,kind,ctx){const m=M(P),mood=m.mood==='auto'?'مناسب لنوع العمل':C.pick(MOODS,m.mood)[1];
 const head=`أنت مؤلف موسيقى أفلام عالمي ومهندس صوت. جهّز أمر Suno لموسيقى بدون غناء (Instrumental).\nالعمل:\n${ctx}\nالإحساس: ${mood}.${m.inst?'\nالآلات: '+m.inst+'.':''}${m.ref?'\nمرجع الإحساس (بدون تقليد لحن موجود): '+m.ref+'.':''}${m.theme?'\nاللحن المميز «'+m.theme+'»: نفس الجملة اللحنية تتكرر في البداية والنهاية والموسيقى التصويرية عشان تبقى هوية ثابتة.':''}\n`;
 const out=`\nارجع بالآتي فقط:\n1) Style of Music بالإنجليزي (120 حرف كحد أقصى): النوع، الـBPM، المقام أو السلم، الآلات، الإحساس، و"instrumental, no vocals".\n2) Lyrics box: وسوم البنية فقط بدون كلام، مثل [Intro] [Build] [Hit] [Outro] [End].\n3) 2 بدائل للأسلوب.\n4) نصيحة تركيب واحدة في المونتاج (مستوى الصوت تحت الكلام، القطع على الإيقاع).`;
 if(kind==='intro')return head+`المطلوب: موسيقى بداية مدتها ${m.intro} ثانية تقريبًا: هوك سمعي من أول ثانية، تصاعد سريع، وتنتهي بضربة (Hit) ممكن تتقطع عليها الصورة.`+out;
 if(kind==='outro')return head+`المطلوب: موسيقى نهاية مدتها ${m.outro} ثانية تقريبًا: نفس اللحن المميز، تهدئة، ونهاية واضحة (Clean ending) تنفع عليها الأسماء والدعوة للمتابعة.`+out;
 if(kind==='score')return head+`المطلوب: موسيقى تصويرية للعمل كله: خلفية تحت الكلام (مش زحمة في الترددات المتوسطة)، بتتبع تصاعد القصة، ومن غير ما تسرق الانتباه. لو العمل أطول من دقيقتين قسّمها لـ2 أو 3 مقاطع بإحساس مختلف (اسمي كل مقطع ومكانه).`+out;
 return `أنت مؤلف موسيقى أفلام ومونتير صوت. اعمل خريطة موسيقى للعمل ده: لكل مقطع أو مجموعة لقطات: من ثانية لثانية، الإحساس، نوع الموسيقى (بداية / تصويرية / صمت / مؤثر / نهاية)، ومستوى الصوت، ونقط القطع على الإيقاع. الصمت المقصود قوة، استخدمه في لحظة الذروة.\nالإحساس العام: ${mood}.\n\nالعمل:\n${ctx}`};
C.bindMusic=function(getP,save,getCtx){
 document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.mf;if(!k)return;const m=M(getP());m[k]=e.target.type==='number'?(+e.target.value||0):e.target.value;save()});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-mu]');if(!b)return;let k=b.dataset.mu,send=k.endsWith('!');if(send)k=k.slice(0,-1);const t=C.musicPrompt(getP(),k,getCtx());if(send)C.send(t);else C.copy(t,'اتنسخ أمر الموسيقى ✓ الصقه في Suno أو في ChatGPT/Claude');})};
})();

/* ================= 📁 العمل: جديد / حفظ وفتح من Google Drive / فحص بالذكاء ================= */
(function(){
const C=window.CORE,esc=C.esc,API='https://www.googleapis.com',GDK='studio_gdrive_v1',FOLDER='استوديو هشام - الأعمال';
const cfg=()=>{try{return JSON.parse(localStorage.getItem(GDK)||'{}')}catch(e){return {}}};
const put=o=>{const c=Object.assign(cfg(),o);try{localStorage.setItem(GDK,JSON.stringify(c))}catch(e){}return c};
const GD={tok:'',exp:0};try{const t=JSON.parse(sessionStorage.getItem('hs_gd_tok')||'{}');GD.tok=t.tok||'';GD.exp=t.exp||0}catch(e){}
const ok=()=>GD.tok&&Date.now()<GD.exp-60000;
const gis=()=>new Promise((r,j)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return r();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=()=>r();s.onerror=()=>j(new Error('تعذر تحميل تسجيل جوجل: اتأكد من النت'));document.head.appendChild(s)});
C.gdConnect=async function(){if(ok())return true;let cid=(cfg().cid||'').trim();
 if(!/\.apps\.googleusercontent\.com$/.test(cid)){cid=(prompt('الصق Client ID بتاع جوجل (نفس اللي في الاستوديو القديم، آخره apps.googleusercontent.com):')||'').trim();if(!/\.apps\.googleusercontent\.com$/.test(cid)){C.toast('مفيش Client ID صحيح');return false}put({cid})}
 try{await gis()}catch(e){C.toast(e.message);return false}
 return new Promise(res=>{const cl=google.accounts.oauth2.initTokenClient({client_id:cid,scope:'https://www.googleapis.com/auth/drive.file',
  callback:t=>{if(t&&t.access_token){GD.tok=t.access_token;GD.exp=Date.now()+(+t.expires_in||3600)*1000;try{sessionStorage.setItem('hs_gd_tok',JSON.stringify(GD))}catch(e){}put({linked:1});res(true)}else res(false)},
  error_callback:()=>{C.toast('ما اتربطش Drive');res(false)}});cl.requestAccessToken({prompt:cfg().linked?'':'consent'})})};
async function f(url,opt){opt=opt||{};opt.headers=Object.assign({Authorization:'Bearer '+GD.tok},opt.headers||{});const r=await fetch(url,opt);if(r.status===401){GD.tok='';GD.exp=0;try{sessionStorage.removeItem('hs_gd_tok')}catch(e){}throw new Error('الجلسة انتهت، اربط تاني')}if(!r.ok)throw new Error('Drive '+r.status);return r}
async function folder(){let id=cfg().hsFolder;if(id){try{const j=await (await f(API+'/drive/v3/files/'+id+'?fields=id,trashed')).json();if(!j.trashed)return id}catch(e){if(/اربط/.test(e.message))throw e}}
 const q=encodeURIComponent(`name='${FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);const l=await (await f(API+'/drive/v3/files?q='+q+'&fields=files(id)')).json();
 id=(l.files&&l.files[0]&&l.files[0].id)||(await (await f(API+'/drive/v3/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:FOLDER,mimeType:'application/vnd.google-apps.folder'})})).json()).id;put({hsFolder:id});return id}
C.gdList=async function(ns){const q=encodeURIComponent(`appProperties has { key='hs' and value='${ns}' } and trashed=false`);return ((await (await f(API+'/drive/v3/files?q='+q+'&orderBy=modifiedTime desc&pageSize=200&fields=files(id,name,modifiedTime,appProperties)')).json()).files||[])};
C.gdSave=async function(ns,name,data){if(!(await C.gdConnect()))return false;const fid=await folder(),fname=ns+' - '+name+'.json';
 const ex=(await C.gdList(ns)).find(x=>x.appProperties&&x.appProperties.name===name);const meta=ex?{name:fname}:{name:fname,parents:[fid],appProperties:{hs:ns,name}};
 const b='hsb'+Date.now(),body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${b}--`;
 await f(API+'/upload/drive/v3/files'+(ex?'/'+ex.id:'')+'?uploadType=multipart',{method:ex?'PATCH':'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body});return true};
/* ---------- نسخة احتياطية كاملة على Drive ---------- */
C.gdUpload=async function(name,blob,props,parentId){const meta={name,parents:[parentId||await folder()],appProperties:props||{}};
 const r=await f(API+'/upload/drive/v3/files?uploadType=resumable&fields=id',{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':blob.type||'application/octet-stream'},body:JSON.stringify(meta)});
 const loc=r.headers.get('Location');if(!loc)throw new Error('Drive ما رجّعش رابط الرفع');
 const u=await fetch(loc,{method:'PUT',headers:{'Content-Type':blob.type||'application/octet-stream'},body:blob});if(!u.ok)throw new Error('رفع الملف فشل ('+u.status+')');return (await u.json()).id};
C.gdFind=async function(q){const l=await (await f(API+'/drive/v3/files?q='+encodeURIComponent(q+' and trashed=false')+'&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,modifiedTime,size,appProperties)')).json();return l.files||[]};
C.gdBlob=async function(id){return await (await f(API+'/drive/v3/files/'+id+'?alt=media')).blob()};
C.backupCollect=async function(){const d={type:'hisham-studios-backup',v:2,at:new Date().toISOString(),device:/Android|iPhone|Mobile/i.test(navigator.userAgent)?'موبايل':'لاب/كمبيوتر',keys:{}};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^hs_(?!trc|dirty|ts~|gemkey|gemmodel)/.test(k))d.keys[k]=localStorage.getItem(k)}
 for(const k of await C.idb.keys()){if(/^hs_(?!trc|dirty|media_)/.test(k)&&!(k in d.keys)){const r=await C.idb.get(k);if(r&&r.raw)d.keys[k]=r.raw}}
 try{const g=JSON.parse(localStorage.getItem(GDK)||'{}');d.keys[GDK]=JSON.stringify({cid:g.cid})}catch(e){}
 return d};
C.backupApply=async function(d){Object.entries(d.keys||{}).forEach(([k,v])=>{if(/^hs_(film|ad|song|doc|montage|content|lib)$/.test(k))C.persist(k,v);else try{localStorage.setItem(k,v)}catch(x){}});await new Promise(r=>setTimeout(r,400))};
/* رفع: كل الشغل + (اختياري) ملفات المونتاج */
C.backupToDrive=async function(withMedia,log){log=log||(()=>{});if(!(await C.gdConnect()))return false;const fid=await folder();const d=await C.backupCollect();d.media=[];
 if(withMedia){let M=[];try{const J=JSON.parse(d.keys.hs_montage||'{}');M=(J.media||[]).slice();if(J.logo)M.push({id:'logo',name:'logo-'+(J.logo.name||'')})}catch(e){}const up=await C.gdFind("appProperties has { key='hsm' and value='1' }");
  for(let i=0;i<M.length;i++){const m=M[i],ex=up.find(x=>x.appProperties&&x.appProperties.mid===m.id);if(ex){d.media.push({id:m.id,fid:ex.id});continue}
   const r=await C.idb.get('hs_media_'+m.id);if(!r||!r.blob)continue;log('⬆️ برفع '+m.name+' ('+(i+1)+'/'+M.length+')…');
   const id=await C.gdUpload('مونتاج - '+m.name,r.blob,{hsm:'1',mid:m.id},fid);d.media.push({id:m.id,fid:id})}}
 log('⬆️ برفع النسخة…');const name='نسخة احتياطية - '+d.device+' - '+new Date().toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'})+'.json';
 await C.gdUpload(name,new Blob([JSON.stringify(d)],{type:'application/json'}),{hsb:'1',dev:d.device},fid);
 try{localStorage.setItem('hs_lastbk',String(Date.now()))}catch(e){}return true};
C.backupList=async function(){if(!(await C.gdConnect()))return null;return C.gdFind("appProperties has { key='hsb' and value='1' }")};
C.backupFromDrive=async function(id,withMedia,log){log=log||(()=>{});log('⬇️ بنزّل النسخة…');const d=await (await C.gdBlob(id)).text().then(JSON.parse);if(d.type!=='hisham-studios-backup')throw new Error('الملف ده مش نسخة احتياطية');
 await C.backupApply(d);let n=0;if(withMedia&&d.media){for(let i=0;i<d.media.length;i++){const x=d.media[i];if((await C.idb.get('hs_media_'+x.id)))continue;log('⬇️ بنزّل ملف مونتاج '+(i+1)+'/'+d.media.length+'…');try{const b=await C.gdBlob(x.fid);await C.idb.set('hs_media_'+x.id,{blob:b,name:'',type:b.type});n++}catch(e){}}}
 return {keys:Object.keys(d.keys||{}).length,media:n,at:d.at,device:d.device}};
C.gdLoad=async function(id){return await (await f(API+'/drive/v3/files/'+id+'?alt=media')).json()};

/* الشخصيات والأماكن المختارة بتتحفظ مع العمل على Drive، وبترجع للمكتبة لما تفتحه على جهاز تاني */
C.packWork=function(P){const d=JSON.parse(JSON.stringify(P)),c=P.cast||{},L={};['chars','places','props','frames'].forEach(k=>{L[k]=(C.lib[k]||[]).filter(x=>(c[k]||[]).includes(x.id))});d._lib=L;return d};
C.unpackWork=function(d){d=d||{};const L=d._lib;delete d._lib;let n=0;if(L){['chars','places','props','frames'].forEach(k=>{(L[k]||[]).forEach(x=>{if(x&&x.id&&!C.lib[k].some(y=>y.id===x.id)){C.lib[k].push(x);n++}})});if(n)C.libSave()}return d};
/* شريط العمل */
C.work=function(o){const {ns,st,render}=o,P=()=>st.get();C._page={st,def:o.def,render,ns};
 const bar=()=>{let el=document.getElementById('wbar');if(!el){el=document.createElement('div');el.id='wbar';const h=document.querySelector('header');h.parentNode.insertBefore(el,h.nextSibling)}
  el.innerHTML=`<div style="display:flex;gap:6px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);flex-wrap:wrap"><span style="font-size:13px;color:var(--muted)">📁</span><input id="wName" value="${esc(P().wname||'')}" placeholder="اسم العمل" style="flex:1;min-width:120px;padding:6px 8px;font-size:14px">
  <button class="b" data-w="save" style="margin:0">☁️ حفظ</button><button class="b" data-w="open" style="margin:0">📂 فتح</button><button class="b" data-w="new" style="margin:0">🆕 جديد</button><button class="b bl" data-w="check" style="margin:0">🔎 فحص</button><button class="b" data-w="tools" style="margin:0">🧰 أدوات</button><button class="b r" data-w="wipe" style="margin:0" title="مشروع جديد: امسح كل القديم">🧹</button></div><div id="wbDirty">${dirty()?DB:''}</div>`};
 const DB='<div style="background:#422006;color:#fcd34d;font-size:12px;padding:3px 12px">● فيه تعديلات ما اتحفظتش على Drive</div>';
 C._wbar=bar;
 const DK='hs_dirty_'+ns,dirty=()=>!!localStorage.getItem(DK)&&JSON.stringify(Object.assign({},P(),{step:0}))!==JSON.stringify(Object.assign({},o.def,{step:0}));
 const sv0=st.save;st.save=function(){sv0.apply(st,arguments);if(!localStorage.getItem(DK)){try{localStorage.setItem(DK,'1')}catch(e){}}const w=document.getElementById('wbDirty');if(w){const h=dirty()?DB:'';if(w.innerHTML!==h)w.innerHTML=h}else bar()};
 const clean=()=>{try{localStorage.removeItem(DK)}catch(e){}bar()};
 C.workDirty=dirty;
 C._rerender=render;
 window.addEventListener('hs-store',e=>{if(e.detail===ns){render();bar()}});
 window.addEventListener('beforeunload',e=>{if(dirty()&&!C._leaving){e.preventDefault();e.returnValue='فيه تعديلات ما اتحفظتش على Drive'}});
 C.leaveOk=async function(){if(!dirty())return true;const k=await ask3s((P().wname||'').trim());if(k==='x')return false;if(k==='save'){const r=await save();if(!r&&!confirm('الحفظ ما نجحش. تكمل برضه؟'))return false}C._leaving=true;return true};
 async function save(silent){const n=(P().wname||'').trim();if(!n){alert('اكتب اسم العمل الأول');return false}try{C.toast('⏳ بحفظ على Drive…',8000);const r=await C.gdSave(ns,n,C.packWork(P()));if(r){C.toast('☁️ اتحفظ «'+n+'» على Drive ✓');clean()}return r}catch(e){C.toast('⚠️ '+e.message,4000);return false}}
 async function openBox(){if(!(await C.leaveOk()))return;if(!(await C.gdConnect()))return;let l=[];try{C.toast('⏳ بجيب أعمالك…');l=await C.gdList(ns)}catch(e){C.toast('⚠️ '+e.message);return}
  let ov=document.getElementById('wOpen');if(ov)ov.remove();ov=document.createElement('div');ov.id='wOpen';ov.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
  const items=q=>l.filter(x=>!q||(x.appProperties.name||'').includes(q)).map(x=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed #334155;padding:8px 0"><div style="flex:1"><b>${esc(x.appProperties.name)}</b><div class="m" style="font-size:12px">${new Date(x.modifiedTime).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})}</div></div><button class="b g" data-o="${x.id}" style="margin:0">افتح</button></div>`).join('')||'<div class="m">مفيش أعمال بالاسم ده.</div>';
  ov.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:80vh;overflow:auto;padding:12px;color:#fff"><b>📂 أعمالك على Drive (${l.length})</b><input id="wQ" placeholder="اكتب اسم العمل…" style="margin-top:8px" value="${esc((P().wname||'').trim())}"><div id="wL">${items((P().wname||'').trim())}</div><button class="b" data-o="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
  document.body.appendChild(ov);ov.querySelector('#wQ').oninput=e=>{ov.querySelector('#wL').innerHTML=items(e.target.value.trim())};
  ov.onclick=async e=>{const b=e.target.closest('[data-o]');if(e.target===ov||(b&&b.dataset.o==='x')){ov.remove();return}if(!b)return;
   if(!confirm('تفتح العمل ده؟ الحالي هيتحفظ في سجل النسخ 🕘 الأول.'))return;try{const d=C.unpackWork(await C.gdLoad(b.dataset.o));st.snap('قبل فتح عمل من Drive',true);st.set(d);clean();ov.remove();bar();render();C.toast('اتفتح ✓')}catch(x){C.toast('⚠️ '+x.message)}}}
 function ask3(n){return new Promise(res=>{const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:99;background:#000c;display:flex;align-items:flex-end';
  ov.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;padding:14px;color:#fff"><b style="font-size:16px">🆕 عمل جديد</b><div class="m" style="margin:6px 0 10px">تعمل إيه في العمل الحالي${n?' «'+esc(n)+'»':''} قبل ما تبدأ؟</div>
  <button class="b g" data-k="save" style="width:100%;margin:0 0 8px">☁️ احفظه على Google Drive وابدأ جديد</button>
  <button class="b r" data-k="del" style="width:100%;margin:0 0 8px">🗑️ امسحه من غير حفظ وابدأ جديد</button>
  <button class="b" data-k="x" style="width:100%;margin:0">إلغاء</button></div>`;
  document.body.appendChild(ov);ov.onclick=e=>{const b=e.target.closest('[data-k]');if(e.target!==ov&&!b)return;const k=b?b.dataset.k:'x';ov.remove();res(k)}})}
 async function nw(){const n=(P().wname||'').trim(),has=JSON.stringify(P())!==JSON.stringify(Object.assign({},o.def,{step:0}));
  if(has){const k=await ask3(n);if(k==='x')return;
   if(k==='save'){if(!n){const nn=(prompt('اكتب اسم للعمل الحالي عشان يتحفظ على Drive:')||'').trim();if(!nn){C.toast('اتلغى: لازم اسم');return}P().wname=nn;st.save()}
    const r=await save();if(!r){if(!confirm('الحفظ على Drive ما نجحش. تمسح برضه؟ (فيه نسخة في سجل النسخ 🕘 على الموبايل)'))return}}
   else if(!confirm('متأكد؟ العمل هيتمسح من الصفحة (فيه نسخة احتياطية في سجل النسخ 🕘).'))return;
   st.snap('قبل عمل جديد',true)}
  st.reset();clean();render();window.scrollTo(0,0);C.toast('🆕 صفحة جديدة')}
 function ask3s(n){return new Promise(res=>{const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:99;background:#000c;display:flex;align-items:flex-end';
  ov.innerHTML=`<div style="background:#0f172a;border:1px solid #f59e0b;border-radius:16px 16px 0 0;width:100%;padding:14px;color:#fff"><b style="font-size:16px">⚠️ تذكير بالحفظ</b><div class="m" style="margin:6px 0 10px">العمل${n?' «'+esc(n)+'»':''} فيه تعديلات ما اتحفظتش على Google Drive.</div>
  <button class="b g" data-k="save" style="width:100%;margin:0 0 8px">☁️ احفظ على Drive وكمّل</button><button class="b" data-k="go" style="width:100%;margin:0 0 8px">كمّل من غير حفظ (يفضل على الموبايل)</button><button class="b" data-k="x" style="width:100%;margin:0">إلغاء</button></div>`;
  document.body.appendChild(ov);ov.onclick=e=>{const b=e.target.closest('[data-k]');if(e.target!==ov&&!b)return;const k=b?b.dataset.k:'x';ov.remove();res(k)}})}
 function check(){const ov=document.createElement('div');ov.id='wChk';ov.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
  ov.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:88vh;overflow:auto;padding:12px;color:#fff"><b>🔎 فحص العمل بالذكاء الاصطناعي</b><div class="m" style="margin:4px 0">1) انسخ أمر الفحص وابعته للتطبيق اللي تختاره. 2) الصق الرد هنا. 3) اضغط «طبّق»: النسخة المصححة بتحل محل الحالية (والقديمة في 🕘).</div>
  <div class="pair"><button class="b bl" data-c="copy">📋 انسخ أمر الفحص</button><button class="b" data-c="send">📤</button></div>
  <textarea id="wChkT" rows="8" placeholder="الصق رد الفحص هنا">${esc(P().chkPaste||'')}</textarea>
  <div style="display:flex;gap:6px;margin-top:8px"><button class="b g" data-c="apply" style="flex:2">✅ طبّق التصحيح</button><button class="b" data-c="x" style="flex:1">إغلاق</button></div></div>`;
  document.body.appendChild(ov);const ta=ov.querySelector('#wChkT');ta.oninput=()=>{P().chkPaste=ta.value;st.save()};
  ov.onclick=e=>{const b=e.target.closest('[data-c]');if(e.target===ov||(b&&b.dataset.c==='x')){ov.remove();return}if(!b)return;const a=b.dataset.c;
   const txt=()=>{const w=o.check.text();return w.trim()?`أنت فريق محترف: ${o.check.team}. افحص العمل ده فحص عميق وحاسم: القصة والمنطق والهوك والإيقاع، والحوار والأسلوب (يبان مكتوب بإيد إنسان؟)، وثبات الشخصيات وأصواتها ولهجاتها والأماكن، والدقة، وجاهزية كل لقطة للتوليد.\nارجع بالترتيب: (1) حكم واحد: جاهز / يحتاج تعديل. (2) أهم المشاكل في نقاط قصيرة. (3) النسخة المصححة كاملة بنفس الصيغة بالظبط (نفس العناوين ونفس شكل «لقطة N | ...» لو موجود) بين السطرين ===بداية=== و===نهاية===. بدون خيارات.\n${C.WRITING}\n\nالعمل:\n"""\n${w}\n"""`:''};
   if(a==='copy'||a==='send'){const t=txt();if(!t){C.toast('مفيش شغل لسه للفحص');return}a==='send'?C.send(t):C.copy(t,'اتنسخ أمر الفحص ✓');return}
   if(a==='apply'){let v=ta.value;if(!v.trim()){alert('الصق الرد الأول');return}const m=v.match(/===\s*بداية\s*===([\s\S]*?)===\s*نهاية\s*===/);if(m)v=m[1].trim();else if(!confirm('الرد مفيهوش علامات ===بداية=== و===نهاية===. أطبّق الرد كله؟'))return;
    st.snap('قبل تطبيق الفحص',true);const r=o.check.apply(v);if(r===false)return;P().chkPaste='';st.save();ov.remove();render();C.toast('✅ اتطبق التصحيح ('+r+')')}}}
 document.addEventListener('input',e=>{if(e.target.id==='wName'){P().wname=e.target.value;st.save()}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b)return;const a=b.dataset.w;if(a==='save')save();if(a==='open')openBox();if(a==='new')nw();if(a==='check')check();if(a==='tools')C.toolsMenu(o,st,render,bar);if(a==='wipe')C.wipeBox();if(a==='lessons')C.lessonsBox();if(a==='pub'){const t=C.pubPrompt(o.ctx?o.ctx():'');C.copy(t,'اتنسخ أمر حزمة النشر ✓')}});
 bar();
 const qo=new URLSearchParams(location.search).get('open');
 if(qo)setTimeout(async()=>{history.replaceState(null,'',location.pathname);if(!(await C.leaveOk()))return;if(!(await C.gdConnect()))return;try{C.toast('⏳ بفتح العمل…',8000);const d=C.unpackWork(await C.gdLoad(qo));st.snap('قبل فتح عمل من Drive',true);st.set(d);clean();render();C.toast('اتفتح ✓')}catch(x){C.toast('⚠️ '+x.message,4000)}},300)};
})();

/* ================= 🌐 ترجمة تلقائية للإنجليزي ================= */
(function(){
const C=window.CORE,TK='hs_trc';let cache={};try{cache=JSON.parse(localStorage.getItem(TK)||'{}')}catch(e){}
const AR=/[؀-ۿ]/;
const tf=(u,ms)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms||7000);return fetch(u,{signal:c.signal}).finally(()=>clearTimeout(t))};
async function g1(q){try{const r=await tf('https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q='+encodeURIComponent(q));if(r.ok){const j=await r.json();const t=(j[0]||[]).map(x=>x[0]||'').join('').trim();if(t)return t}}catch(e){}
 try{const r=await tf('https://api.mymemory.translated.net/get?langpair=ar|en&q='+encodeURIComponent(q.slice(0,480)));const j=await r.json();return (j&&j.responseData&&j.responseData.translatedText)||''}catch(e){return ''}}
async function tr(q){q=q.trim();if(!q||!AR.test(q))return q;if(cache[q])return cache[q];const t=await g1(q);if(t){cache[q]=t;try{const k=Object.keys(cache);if(k.length>1500)k.slice(0,500).forEach(x=>delete cache[x]);localStorage.setItem(TK,JSON.stringify(cache))}catch(e){}}return t||null}
/* الكلام المنطوق يفضل بلغته الأصلية؛ الباقي يترجم */
const KEEP=/^(الحوار|الكلام المنطوق|الكلمات المغناة في اللقطة|التعليق الصوتي على اللقطة[^:]*)\s*[:：]\s*/;
C.toEn=async function(txt){const lines=String(txt).split('\n'),out=new Array(lines.length);let fail=0,next=0;
 async function one(i){const l=lines[i];if(!AR.test(l)){out[i]=l;return}
  const m=l.match(KEEP);if(m){const lab=await tr(m[1]);out[i]=(lab||'Spoken line')+' (keep spoken exactly in the original language): "'+l.slice(m[0].length).trim()+'"';return}
  const t=await tr(l);if(t)out[i]=t;else{out[i]=l;fail++}}
 const worker=async()=>{while(next<lines.length)await one(next++)};
 await Promise.all(Array.from({length:Math.min(6,lines.length)},worker));
 return {text:out.join('\n'),fail}};
C.copyEn=async function(txt,msg){C.toast('⏳ بترجم للإنجليزي…',8000);const r=await C.toEn(txt);if(r.fail)C.toast('⚠️ '+r.fail+' سطر ما اتترجمش (اتأكد من النت)',4000);return r.fail?C.copy(r.text,'اتنسخ (فيه سطور عربي)'):C.copy(r.text,msg||'اتنسخ بالإنجليزي ✓')};
C.sendEn=async function(txt){C.toast('⏳ بترجم…',8000);const r=await C.toEn(txt);return C.send(r.text)};
})();

/* ================= 📚 سجل الدروس (بيتعلم من الأخطاء) ================= */
(function(){
const C=window.CORE,LK='hs_lessons';
C.lessons=()=>{try{return JSON.parse(localStorage.getItem(LK)||'[]')}catch(e){return []}};
const sv=l=>{try{localStorage.setItem(LK,JSON.stringify(l))}catch(e){}};
C.addLesson=function(t){t=(t||'').trim();if(!t)return;const l=C.lessons();if(!l.includes(t)){l.unshift(t);sv(l.slice(0,40))}C.toast('📚 اتحفظ الدرس ✓ وهيدخل في الأوامر الجاية')};

/* زر الرجوع والتالي في كل مرحلة */
C.backBar=(P,S)=>{const last=S.length-1,snd=P.sendMode&&P.shots&&P.shots.length&&P.step===last;
 const bk=snd?'<button class="b" data-a="exitSend">→ رجوع للقطات</button>':P.step>0?`<button class="b" data-a="go" data-i="${P.step-1}">→ رجوع: ${S[P.step-1]}</button>`:'<button class="b" data-a="home">→ رجوع للرئيسية</button>';
 const nx=!snd&&P.step<last?`<button class="b" data-a="go" data-i="${P.step+1}">التالي: ${S[P.step+1]} ←</button>`:'';
 return `<div class="bkbar" style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;margin:4px 0">${bk}${nx}</div>`};
C.stage=(P,S,html)=>C.backBar(P,S)+html+C.backBar(P,S);
C.lessonsTxt=()=>{const l=C.lessons().slice(0,15);return l.length?'تجنّب الأخطاء دي (حصلت قبل كده في التوليد):\n'+l.map(x=>'- '+x).join('\n')+'\n':''};
C.lessonsBox=function(){const l=C.lessons();let o=document.getElementById('lsBox');if(o)o.remove();o=document.createElement('div');o.id='lsBox';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:80vh;overflow:auto;padding:12px;color:#fff"><b>📚 سجل الدروس</b><div class="m" style="margin:4px 0">كل درس هنا بيدخل في أوامر الصور والفيديو في كل الاستوديوهات (آخر 15). اكتب الغلطة اللي حصلت بكلامك.</div>
 <textarea id="lsNew" rows="2" placeholder="مثال: الأيدي بتطلع بـ6 صوابع / الشنب بيختفي في اللقطات القريبة"></textarea><button class="b g" data-l="add" style="width:100%">➕ احفظ الدرس</button>
 ${l.map((x,i)=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed #334155;padding:6px 0"><span style="flex:1;font-size:14px">${C.esc(x)}</span><button class="b r" data-l="${i}" style="margin:0">🗑️</button></div>`).join('')||'<div class="m">لسه مفيش دروس.</div>'}
 <button class="b" data-l="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
 document.body.appendChild(o);o.onclick=e=>{const b=e.target.closest('[data-l]');if(e.target===o||(b&&b.dataset.l==='x')){o.remove();return}if(!b)return;
  if(b.dataset.l==='add'){C.addLesson(o.querySelector('#lsNew').value);C.lessonsBox();return}const l2=C.lessons();l2.splice(+b.dataset.l,1);sv(l2);C.lessonsBox()}};
})();

/* ================= 📢 حزمة النشر ================= */
window.CORE.pubPrompt=ctx=>`أنت مدير محتوى سوشيال ميديا عالمي. جهّز حزمة نشر للعمل ده لكل منصة: فيسبوك، إنستجرام ريلز، تيك توك، يوتيوب شورتس، ويوتيوب (فيديو كامل لو مناسب).
لكل منصة: العنوان، وأول سطر هوك، والكابشن بطول المنصة، و5 إلى 10 هاشتاجات (عربي وإنجليزي)، وأفضل وقت نشر للجمهور المصري والعربي، ودعوة للتفاعل.
وفي الآخر: أمر صورة مصغّرة (Thumbnail) بالإنجليزي، وجملة قصيرة تتكتب عليها (3 كلمات كحد أقصى).
اللغة: نفس لغة العمل، بأسلوب بشري جذاب من غير كليشيهات.
${window.CORE.WRITING}

العمل:
${ctx}`;

/* ================= 🧰 قايمة الأدوات: وصفات، هوكات، مسابقات، 10 مخرجات، خطة 30 يوم، نسخة إنجليزية ================= */
(function(){
const C=window.CORE,esc=C.esc,HK='hs_hooks';
C.hooks=()=>{try{return JSON.parse(localStorage.getItem(HK)||'[]')}catch(e){return []}};
const hsv=l=>{try{localStorage.setItem(HK,JSON.stringify(l.slice(0,60)))}catch(e){}};
const P_={
 hooks:ctx=>{const b=C.hooks().slice(0,10);return `أنت أقوى كاتب هوكات في العالم للسوشيال ميديا العربية. اكتب 10 هوكات لأول 3 ثواني للعمل ده، متنوعة: سؤال صادم، رقم غريب، موقف مضحك، تحدي، سر، عكس المتوقع، صورة غريبة، صوت مفاجئ، جملة ناقصة، مواجهة.
لكل هوك: الجملة المنطوقة أو المكتوبة، والصورة في أول ثانية، والصوت. وقيّم كل واحد من 10، ورشّح الأقوى في سطر.
${b.length?'هوكات نجحت معايا قبل كده (اتعلم من أسلوبها من غير ما تكررها):\n'+b.map(x=>'- '+x).join('\n')+'\n':''}${C.WRITING}\n\nالعمل:\n${ctx}`},
 test3:ctx=>`أنت خبير احتفاظ بالمشاهدين في تيك توك وريلز ويوتيوب شورتس. افحص أول 3 ثواني من العمل ده فقط (أول لقطة أو اتنين): الصورة الأولى، أول كلمة، أول صوت.
ارجع بحكم واحد قاطع: «يشد» أو «المشاهد هيعدّي». وسبب في سطر. ولو مش بيشد: بديل واحد جاهز للصورة والكلام والصوت. بدون خيارات.\n\nالعمل:\n${ctx}`,
 comp:ctx=>`أنت عضو لجنة تحكيم في مهرجانات أفلام الذكاء الاصطناعي العالمية. قيّم العمل ده بمعايير المسابقات: الفكرة والأصالة، القصة والبناء، الإخراج والتكوين، ثبات الشخصيات والراكور بين اللقطات، جودة الحركة، الصوت والموسيقى، المونتاج والإيقاع، الأثر العاطفي، والاستخدام الذكي للذكاء الاصطناعي.
لكل معيار: درجة من 10 وسطر واحد. وبعدها:
1) الدرجة النهائية، وهل يدخل مسابقة دولية دلوقتي ولا لأ.
2) أهم 3 تعديلات بالترتيب ترفع الدرجة.
3) قايمة التسليم: العنوان بالعربي والإنجليزي، ملخص (Logline) بالإنجليزي في سطرين، ترجمة (Subtitles) إنجليزي، الإفصاح عن أدوات الذكاء المستخدمة، حقوق الموسيقى والأصوات، المدة والمقاس المطلوبين.
بدون مجاملة.\n\nالعمل:\n${ctx}`,
 multi:ctx=>`أنت مدير محتوى عالمي. حوّل العمل ده لـ10 مخرجات منفصلة جاهزة للنشر:
1) ريل 30 ثانية (أي لقطات وبأي ترتيب + هوك مكتوب). 2) ريل 15 ثانية مختلف. 3) تيزر 7 ثواني. 4) كاروسيل 7 شرائح (نص كل شريحة + وصف الصورة). 5) بوست فيسبوك طويل. 6) بوست قصير + سؤال للتفاعل. 7) حالة واتساب. 8) سكريبت بودكاست أو صوتي دقيقة. 9) عنوان وصف يوتيوب. 10) 3 أفكار جزء تاني.
كل مخرج مستقل ومفهوم لوحده.\n${C.WRITING}\n\nالعمل:\n${ctx}`,
 plan:(ctx,page)=>`أنت مخطط محتوى عالمي. اعمل خطة نشر 30 يوم لصفحة «${page}» بناءً على نوع العمل ده.
جدول: اليوم | نوع المنشور (ريل/كاروسيل/بوست/لايف/ستوري) | الفكرة | الهوك | الهدف (وصول/تفاعل/بيع/متابعين).
قواعد: تنويع في الأنواع، ما يتكررش نفس النوع يومين ورا بعض، 3 أفكار «ترند» قابلة للتعديل، أفضل مواعيد النشر للجمهور المصري. وفي الآخر: أهم 5 أرقام أتابعها.\n\nمثال من شغل الصفحة:\n${ctx}`,
 en:ctx=>`أنت مترجم وكاتب محتوى عالمي بالإنجليزي. اعمل نسخة إنجليزية من العمل ده للجمهور العالمي: مش ترجمة حرفية. حافظ على النبرة والسخرية والتشويق، وغيّر الأمثلة والنكت المحلية لحاجات يفهمها جمهور عالمي، واكتب الحوار طبيعي زي ما الناس بتتكلم. حافظ على نفس شكل اللقطات (Shot 1 | ...) لو موجود. ارجع بالنسخة الإنجليزية كاملة، وبعدها قايمة قصيرة بالتغييرات الثقافية اللي عملتها.\n\nالعمل:\n${ctx}`
};
C.toolsMenu=function(o,st,render,bar){const ctx=()=>(o.ctx?o.ctx():'')||'(لسه مفيش شغل: اكتب الفكرة الأول)';
 let ov=document.getElementById('tlBox');if(ov)ov.remove();ov=document.createElement('div');ov.id='tlBox';ov.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 const it=(k,t,d)=>`<div class="pair"><button class="b bl" data-t="${k}" style="text-align:right">${t}<div style="font-size:11px;opacity:.75;font-weight:400">${d}</div></button><button class="b" data-t="${k}!">📤</button></div>`;
 ov.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:88vh;overflow:auto;padding:12px;color:#fff"><b style="font-size:16px">🧰 أدوات</b>
 ${(o.presets||[]).length?`<div class="m" style="margin-top:8px">🎯 وصفات جاهزة (بتملا الاختيارات، وتعدّل اللي يعجبك):</div><div style="display:flex;flex-wrap:wrap;gap:6px">${o.presets.map((p,i)=>`<button class="b g" data-p="${i}" style="margin:0">${esc(p.name)}</button>`).join('')}</div>`:''}
 <div class="m" style="margin-top:10px">أوامر (بتتنسخ وتلصقها في التطبيق اللي تختاره):</div>
 ${it('hooks','🪝 اقترح 10 هوكات','من بنك الهوكات اللي نجحت معاك')}${it('test3','⏱️ اختبار الـ3 ثواني الأولى','حكم واحد: يشد ولا لأ')}${it('comp','🏆 وضع المسابقات','تقييم لجنة تحكيم + قايمة التسليم')}${it('multi','♻️ عمل واحد = 10 مخرجات','ريلز، كاروسيل، بوستات، تيزر…')}${it('plan','🗓️ خطة محتوى 30 يوم','لصفحة تختارها')}${it('en','🌍 نسخة إنجليزية للعالمية','بنفس النبرة مع تغيير الأمثلة المحلية')}${it('refs','📋 المراجع المطلوبة','شخصيات وأماكن وكادرات وزوايا: الموجود والناقص')}${it('dur','⏱️ اقترح المدة','للعمل ولكل مشهد، والقرار ليك')}${it('pub','📢 حزمة النشر','عنوان وكابشن وهاشتاجات لكل منصة')}
 <div style="display:flex;gap:6px;margin-top:10px"><button class="b g" data-x="script" style="flex:1;margin:0">📄 العمل كامل (نسخ/طباعة)</button><button class="b g" data-x="dup" style="flex:1;margin:0">📑 كرّر العمل</button></div>
 <div style="display:flex;gap:6px;margin-top:10px"><button class="b" data-x="hookbank" style="flex:1;margin:0">🪝 بنك الهوكات (${C.hooks().length})</button><button class="b" data-x="lessons" style="flex:1;margin:0">📚 الدروس (${C.lessons().length})</button></div>
 <button class="b" data-x="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
 document.body.appendChild(ov);
 ov.onclick=e=>{const b=e.target.closest('[data-t],[data-p],[data-x]');if(e.target===ov){ov.remove();return}if(!b)return;
  if(b.dataset.x==='x'){ov.remove();return}if(b.dataset.x==='lessons'){ov.remove();C.lessonsBox();return}if(b.dataset.x==='script'){ov.remove();C.scriptBox(st.get(),'');return}if(b.dataset.x==='dup'){ov.remove();C.dupWork(o,st,render);return}if(b.dataset.x==='hookbank'){ov.remove();C.hookBank();return}
  if(b.dataset.p!==undefined){const p=o.presets[+b.dataset.p];if(!confirm('تطبّق وصفة «'+p.name+'»؟ هتغيّر الاختيارات بس (النوع والشكل والمدة…)، والكتابة بتفضل.'))return;st.snap('قبل وصفة',true);Object.assign(st.get(),JSON.parse(JSON.stringify(p.set)));st.save();ov.remove();bar();render();C.toast('🎯 اتطبقت «'+p.name+'»');return}
  let k=b.dataset.t,send=k.endsWith('!');if(send)k=k.slice(0,-1);let t;
  if(k==='pub')t=C.pubPrompt(ctx());else if(k==='refs')t=C.refsPrompt(ctx());else if(k==='dur')t=C.durPrompt(ctx());else if(k==='plan'){const pg=(prompt('اسم الصفحة اللي هتعمل لها الخطة:',localStorage.getItem('hs_lastpage')||'')||'').trim();if(!pg)return;try{localStorage.setItem('hs_lastpage',pg)}catch(x){}t=P_.plan(ctx(),pg)}else t=P_[k](ctx());
  send?C.send(t):C.copy(t,'اتنسخ ✓ الصقه في التطبيق')}};
C.hookBank=function(){const l=C.hooks();let o=document.getElementById('hkBox');if(o)o.remove();o=document.createElement('div');o.id='hkBox';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:80vh;overflow:auto;padding:12px;color:#fff"><b>🪝 بنك الهوكات</b><div class="m" style="margin:4px 0">احفظ هنا أي هوك نجح معاك (مشاهدات أو تفاعل عالي). أمر «اقترح 10 هوكات» بيتعلم منهم.</div>
 <textarea id="hkNew" rows="2" placeholder="مثال: «أنا عمري ما شفت زبون بيطلب كده…» + لقطة قريبة على وش فهيم"></textarea><button class="b g" data-h="add" style="width:100%">➕ احفظ الهوك</button>
 ${l.map((x,i)=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed #334155;padding:6px 0"><span style="flex:1;font-size:14px">${esc(x)}</span><button class="b" data-h="c${i}" style="margin:0">📋</button><button class="b r" data-h="d${i}" style="margin:0">🗑️</button></div>`).join('')||'<div class="m">لسه فاضي.</div>'}
 <button class="b" data-h="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
 document.body.appendChild(o);o.onclick=e=>{const b=e.target.closest('[data-h]');if(e.target===o||(b&&b.dataset.h==='x')){o.remove();return}if(!b)return;const h=b.dataset.h,L=C.hooks();
  if(h==='add'){const v=o.querySelector('#hkNew').value.trim();if(!v)return;L.unshift(v);hsv(L);C.toast('🪝 اتحفظ ✓');C.hookBank();return}
  if(h[0]==='c'){C.copy(L[+h.slice(1)]);return}if(h[0]==='d'){L.splice(+h.slice(1),1);hsv(L);C.hookBank()}}};
})();

/* ================= 📢 جاهز للنشر: خطة + كابشن + هاشتاجات لكل منصة، تتحفظ مع العمل ================= */
(function(){
const C=window.CORE,esc=C.esc;
const PLATS=[['fb','فيسبوك'],['ig','إنستجرام ريلز'],['tt','تيك توك'],['yts','يوتيوب شورتس'],['yt','يوتيوب'],['wa','حالة واتساب']];
const LABELS=['العنوان','الهوك','الكابشن','الهاشتاجات','أفضل وقت','أول تعليق','ملاحظة'];
const pub=P=>{P.pub=Object.assign({plats:['fb','ig','tt','yts'],raw:'',plan:'',thumb:'',items:[],posted:{},trends:'',country:'مصر'},P.pub||{});return P.pub};
const today=()=>new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
C.trendsPrompt=function(P,ctx){const u=pub(P),names=u.plats.map(k=>C.pick(PLATS,k)[1]);
 return `أنت محلل ترندات سوشيال ميديا. النهارده ${today()}. ابحث على النت دلوقتي (بحث حي، مش من ذاكرتك) عن الترندات والهاشتاجات المنتشرة فعلًا في آخر 7 أيام في ${u.country||'مصر'} على: ${names.join('، ')}.
مصادر تدوّر فيها: ترندات X وجوجل ترندز، وCreative Center بتاع تيك توك، والصوتيات والتحديات المنتشرة على الريلز، والأخبار والمناسبات الجاية في الأسبوعين الجايين.

بعدين اختار بس اللي ليه علاقة حقيقية بالعمل ده أو بجمهوره، وارفض أي ترند حساس (حوادث، وفيات، سياسة، أزمات) أو ملوش علاقة، لأن ركوب ترند غلط بيضر الصفحة.

اكتب الناتج كده ومن غير أي كلام تاني:
=== ترندات مناسبة ===
لكل ترند سطر: الاسم | المنصة | دليل إنه منتشر (رابط أو مصدر وتاريخ) | إزاي العمل يركب عليه بشكل ذكي في جملة
=== هاشتاجات منتشرة دلوقتي ===
لكل منصة: من 5 لـ 10 هاشتاجات مستخدمة فعلًا الأسبوع ده ومناسبة، وجنب كل واحد (كبير/متوسط/متخصص)
=== صوتيات وأشكال رايجة ===
أصوات أو تحديات أو قوالب مونتاج منتشرة ينفع العمل يستخدمها (لو موجودة)
=== مناسبات قريبة ===
أي مناسبة أو يوم عالمي في الأسبوعين الجايين ينفع نربطه بالعمل
=== تحذير ===
ترندات منتشرة بس ما ينفعش نركبها ولماذا (سطر لكل واحد)

لو مش متأكد إن حاجة منتشرة فعلًا اكتب جنبها (غير مؤكد). ممنوع تخترع ترند أو هاشتاج.

العمل:
${ctx}`};
C.pubPack=function(P,ctx){const u=pub(P),names=u.plats.map(k=>C.pick(PLATS,k)[1]);
 return `أنت مدير محتوى ومسوّق سوشيال ميديا عالمي للجمهور المصري والعربي. جهّز حزمة نشر كاملة وجاهزة للعمل ده، على المنصات دي بس: ${names.join('، ')}.
اكتب الناتج بالشكل ده بالظبط (العلامات زي ما هي) ومن غير أي كلام تاني:

=== الخطة ===
أفضل ترتيب للنشر على المنصات والفرق بين كل منصة والتانية (باليوم والساعة بتوقيت القاهرة)، وأول ساعة بعد النشر أعمل إيه (رد على التعليقات، ستوري، مشاركة في جروبات)، وإعادة النشر بعد كام يوم. 6 أسطر كحد أقصى.

${names.map(n=>`=== منصة: ${n} ===
العنوان: (لو المنصة بتدعم عنوان، وإلا اكتب بدون)
الهوك: أول سطر يوقف التمرير
الكابشن: الكابشن كامل بطول وطريقة المنصة دي (فقرات قصيرة جدًا، إيموجي بحساب، دعوة واحدة للتفاعل)
الهاشتاجات: من 5 لـ12 هاشتاج مناسبة للمنصة (عربي وإنجليزي، مزيج كبير ومتوسط ومتخصص)، في سطر واحد
أفضل وقت: اليوم والساعة بتوقيت القاهرة
أول تعليق: تعليق تكتبه أنت أول ما تنشر عشان يفتح النقاش
`).join('\n')}
=== الصورة المصغرة ===
أمر صورة مصغّرة بالإنجليزي + جملة عربي قصيرة تتكتب عليها (3 كلمات كحد أقصى).

قواعد: اللغة نفس لغة العمل وبأسلوب بشري جذاب، بدون كليشيهات، بدون وعود مبالغ فيها، والهاشتاجات حقيقية ومستخدمة.
${u.trends.trim()?'\nالترندات والهاشتاجات المنتشرة دلوقتي (من بحث حي، النهارده '+today()+'). اركب المناسب منها بذكاء وطبيعية، واستخدم الهاشتاجات المنتشرة دي في الأول، ومتستخدمش اللي في التحذير:\n'+u.trends.trim().slice(0,3500)+'\n':'\nلو تقدر تبحث على النت دلوقتي، اعرف الهاشتاجات المنتشرة الأسبوع ده في '+(u.country||'مصر')+' واستخدم المناسب منها.\n'}${C.WRITING}

العمل:
${ctx}`};
C.pubParse=function(t){const out={plan:'',thumb:'',items:[]};const parts=t.split(/^\s*={2,}\s*/m);
 const blocks=t.split(/\n?\s*={2,}\s*(الخطة|الصورة المصغرة|منصة\s*[:：]\s*[^=\n]+?)\s*={2,}\s*\n?/);
 for(let i=1;i<blocks.length;i+=2){const h=blocks[i].trim(),b=(blocks[i+1]||'').trim();
  if(h==='الخطة')out.plan=b;else if(h==='الصورة المصغرة')out.thumb=b;
  else{const name=h.replace(/^منصة\s*[:：]\s*/,'').trim(),it={name};let cur=null;
   b.split('\n').forEach(l=>{const m=l.replace(/\*\*/g,'').match(new RegExp('^\\s*[-•]?\\s*('+LABELS.join('|')+')\\s*[:：]\\s*(.*)$'));if(m){cur=m[1];it[cur]=m[2].trim()}else if(cur)it[cur]=(it[cur]?it[cur]+'\n':'')+l});
   LABELS.forEach(k=>{if(it[k])it[k]=it[k].trim();if(/^(بدون|لا يوجد|-)$/.test(it[k]||''))it[k]=''});out.items.push(it)}}
 return out};
C.pubCard=function(P){const u=pub(P);
 return `<div class="c" style="border-color:#f59e0b"><h3>📢 جاهز للنشر</h3><div class="m">خطة النشر والكابشن والهاشتاجات لكل منصة، بتتحفظ مع العمل.</div>
 <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${PLATS.map(([k,n])=>`<button class="b${u.plats.includes(k)?' g':''}" data-pp="${k}" style="margin:0">${n}</button>`).join('')}</div>
 <div class="shot"><b>🔥 1) اعرف الترند الأول</b><div class="m">الأمر ده لتطبيق بيدوّر على النت دلوقتي: <b>Grok</b> (الأقوى في ترندات X)، أو <b>Gemini</b>، أو <b>Perplexity</b>، أو ChatGPT بالبحث. بيرجع لك الترندات والهاشتاجات المنتشرة الأسبوع ده، والمناسبة لشغلك بس.</div>
  <div class="row"><div><label class="l">البلد</label><input data-pu-country value="${esc(u.country||'مصر')}"></div></div>
  <button class="b g" data-pu="trAg" style="width:100%">🤖 هات الترندات دلوقتي بالإيجنت (بحث جوجل)</button>
  <div class="pair"><button class="b bl" data-pu="tr">📋 أمر الترندات</button><button class="b" data-pu="tr!">📤</button></div>
  <textarea data-pu-tr rows="${u.trends?3:4}" placeholder="الصق رد الترندات هنا، وهيدخل في حزمة النشر لوحده">${esc(u.trends||'')}</textarea>${u.trends?'<div class="m" style="color:#86efac">✓ الترندات هتدخل في أمر حزمة النشر</div>':''}</div>
 <div class="m" style="margin-top:8px"><b>2) حزمة النشر</b></div>
 <div class="pair"><button class="b bl" data-pu="cmd">📋 أمر حزمة النشر</button><button class="b" data-pu="cmd!">📤</button></div>
 <textarea data-pu-raw rows="${u.items.length?3:6}" placeholder="الصق رد الذكاء هنا">${esc(u.raw)}</textarea><button class="b g" data-pu="parse">✂️ حوّل لكروت نشر</button>
 ${u.plan?`<div class="shot"><b>🗓️ خطة النشر</b><div class="m" style="white-space:pre-wrap;color:#e2e8f0">${esc(u.plan)}</div><button class="b" data-pc="plan">📋</button></div>`:''}
 ${u.items.map((it,i)=>`<div class="shot${u.posted[i]?' done':''}"><div class="hd"><b>${esc(it.name)}</b>${it['أفضل وقت']?`<span class="tag">🕒 ${esc(it['أفضل وقت'])}</span>`:''}</div>
  ${it['العنوان']?`<div class="m"><b>العنوان:</b> ${esc(it['العنوان'])}</div>`:''}
  <div style="white-space:pre-wrap;font-size:14px;margin-top:6px">${esc([it['الهوك'],it['الكابشن']].filter(Boolean).join('\n\n'))}</div>
  <div class="m" style="margin-top:6px;color:#7dd3fc;direction:rtl">${esc(it['الهاشتاجات']||'')}</div>
  ${it['أول تعليق']?`<div class="m" style="margin-top:6px">💬 أول تعليق: ${esc(it['أول تعليق'])}</div>`:''}
  <div><button class="b g" data-pc="post:${i}">📤 انشر على ${esc(it.name)}</button><button class="b bl" data-pc="all:${i}">📋 الكابشن + الهاشتاجات</button><button class="b" data-pc="cap:${i}">الكابشن</button><button class="b" data-pc="tag:${i}">#</button>${it['العنوان']?`<button class="b" data-pc="ttl:${i}">العنوان</button>`:''}${it['أول تعليق']?`<button class="b" data-pc="fc:${i}">💬</button>`:''}<button class="b${u.posted[i]?' on':''}" data-pc="done:${i}">✓ ${u.posted[i]?'اتنشر':'نشرت'}</button></div></div>`).join('')}
 ${u.thumb?`<div class="shot"><b>🖼️ الصورة المصغّرة</b><div class="m" style="white-space:pre-wrap;color:#e2e8f0">${esc(u.thumb)}</div><button class="b" data-pc="thumb">📋</button></div>`:''}</div>`};
C.bindPub=function(getP,save,render,getCtx){
 document.addEventListener('input',e=>{const t=e.target;if(!t.hasAttribute)return;if(t.hasAttribute('data-pu-raw')){pub(getP()).raw=t.value;save()}if(t.hasAttribute('data-pu-tr')){pub(getP()).trends=t.value;save()}if(t.hasAttribute('data-pu-country')){pub(getP()).country=t.value;save()}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-pp],[data-pu],[data-pc]');if(!b)return;const P=getP(),u=pub(P);
  if(b.dataset.pp){const k=b.dataset.pp;u.plats=u.plats.includes(k)?u.plats.filter(x=>x!==k):u.plats.concat(k);save();render();return}
  if(b.dataset.pu){let k=b.dataset.pu;if(k==='parse'){if(!u.raw.trim()){alert('الصق الرد الأول');return}const r=C.pubParse(u.raw);if(!r.items.length&&!r.plan){alert('مش لاقي علامات «=== منصة: ... ===». استخدم أمر حزمة النشر من هنا.');return}Object.assign(u,r);u.posted={};save();render();C.toast('📢 '+r.items.length+' منصة جاهزة ✓');return}
   if(k==='trAg'){if(!C.gemKey()){C.agentKeyBox();return}C.toast('🔎 الإيجنت بيدوّر على الترندات…',8000);C.gemRun([C.trendsPrompt(P,getCtx())],null,{search:true}).then(out=>{u.trends=out;save();render();C.toast('🔥 الترندات وصلت ✓')}).catch(e=>C.toast('⚠️ '+e.message,5000));return}
   const send=k.endsWith('!');if(send)k=k.slice(0,-1);const t=k==='tr'?C.trendsPrompt(P,getCtx()):C.pubPack(P,getCtx());send?C.send(t):C.copy(t,k==='tr'?'اتنسخ أمر الترندات ✓ ابعته لـ Grok أو Gemini':'اتنسخ أمر حزمة النشر ✓');return}
  const [k,i]=b.dataset.pc.split(':'),it=u.items[+i]||{};
  if(k==='done'){u.posted[i]=!u.posted[i];save();render();return}
  if(k==='post'){const txt=[it['الهوك'],it['الكابشن'],it['الهاشتاجات']].filter(Boolean).join('\n\n');C.pubShare(txt,it.name);return}
  const t={plan:u.plan,thumb:u.thumb,all:[it['الهوك'],it['الكابشن'],it['الهاشتاجات']].filter(Boolean).join('\n\n'),cap:[it['الهوك'],it['الكابشن']].filter(Boolean).join('\n\n'),tag:it['الهاشتاجات'],ttl:it['العنوان'],fc:it['أول تعليق']}[k];if(t)C.copy(t,'اتنسخ ✓')})};
/* نشر: الكابشن بيتنسخ، وقايمة المشاركة بتفتح بالفيديو (لو جاهز) عشان تختار التطبيق وتلصق */
C.pubShare=async function(txt,name){await C.copy(txt,'اتنسخ الكابشن والهاشتاجات ✓ الصقهم في '+(name||'التطبيق'));const f=C._pubFile;
 try{if(f&&navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:txt});return}if(navigator.share)await navigator.share({text:txt})}catch(e){}};
C.pubStatus=P=>{const u=P&&P.pub;if(!u||!u.items||!u.items.length)return '';const n=Object.values(u.posted||{}).filter(Boolean).length;return n+'/'+u.items.length+' منصة اتنشر'};
})();
window.CORE.adv=(html,open)=>`<details ${open?'open':''} style="margin-top:8px;border:1px dashed var(--border);border-radius:10px;padding:4px 8px"><summary style="color:#94a3b8;font-size:13px;cursor:pointer">⚙️ متقدم</summary>${html}</details>`;

/* ================= 📲 تثبيت كل استوديو كتطبيق لوحده ================= */
(function(){const C=window.CORE;let ev=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;const b=document.getElementById('instBtn');if(b){b.style.display='';b.title='ثبّت الاستوديو ده كتطبيق لوحده'}});
document.addEventListener('click',async e=>{if(!e.target.closest('#instBtn'))return;
 if(ev){ev.prompt();const r=await ev.userChoice;if(r&&r.outcome==='accepted')C.toast('📲 اتثبت ✓ هتلاقيه على الشاشة الرئيسية');ev=null;e.target.closest('#instBtn').style.display='none'}
 else alert(matchMedia('(display-mode: standalone)').matches?'الاستوديو ده مفتوح كتطبيق بالفعل.':'افتح الصفحة دي من Chrome، ومن القايمة (⋮) اختار «تثبيت التطبيق».\nلو مش ظاهر: امسح أيقونة «الاستوديو» القديمة من الشاشة الرئيسية الأول، وبعدين جرّب تاني.')});
window.addEventListener('appinstalled',()=>{const b=document.getElementById('instBtn');if(b)b.style.display='none'})})();

/* ================= 🪝 نوع الهوك والمشاعر ================= */
(function(){const C=window.CORE;
C.HOOKS=[['auto','الذكاء يختار الأقوى'],['shock','سؤال صادم'],['number','رقم أو حقيقة غريبة'],['funny','موقف مضحك من أول ثانية'],['secret','سر أو معلومة ممنوعة'],['reverse','عكس المتوقع'],['visual','صورة غريبة بدون كلام'],['sound','صوت مفاجئ'],['cut','جملة ناقصة تتكمل في الآخر'],['confront','مواجهة أو خناقة'],['pov','وجهة نظر (أنت مكان البطل)'],['challenge','تحدي للمشاهد'],['end','نبدأ من النهاية']];
C.EMOS=[['auto','حسب القصة'],['laugh','ضحك'],['tension','توتر وترقب'],['fear','خوف'],['awe','دهشة'],['nostalgia','حنين'],['empathy','تعاطف'],['hope','أمل'],['anger','غضب من ظلم'],['warm','دفء عائلي'],['pride','فخر']];
C.hookEmoHTML=P=>`<div class="row"><div><label class="l">🪝 نوع الهوك</label><select data-f="hook">${C.opts(C.HOOKS,P.hook||'auto')}</select></div><div><label class="l">💓 الإحساس الأساسي</label><select data-f="emo">${C.opts(C.EMOS,P.emo||'auto')}</select></div></div>`;
C.hookEmoTxt=P=>{const h=C.pick(C.HOOKS,P.hook||'auto'),e=C.pick(C.EMOS,P.emo||'auto');return `نوع الهوك: ${h[0]==='auto'?'اختار أقوى نوع للعمل ده واذكره':h[1]} (في أول 3 ثواني: لفظي + بصري + سمعي).\nالإحساس الأساسي اللي المشاهد يخرج بيه: ${e[0]==='auto'?'حدده حسب القصة واذكره':e[1]}، مع تصاعد عاطفي ولحظة تأثير واضحة.\n`}})();

/* ================= 📋 المراجع المطلوبة + ⏱️ اقتراح المدة (في 🧰) ================= */
(function(){const C=window.CORE;
C.refsPrompt=ctx=>{const L=C.lib;return `أنت مخرج ومدير فني ومشرف راكور. اقرا العمل ده من أوله لآخره وطلّع قايمة كل المراجع اللي محتاجها قبل التوليد:
1) الشخصيات: كل شخصية، وكل تغيير في شكلها أو لبسها، والصور المطلوبة لها (شيت أمامي/جانبي/وش قريب).
2) الأماكن: كل مكان، وصورة مرجع لكل واحد.
3) الأدوات المهمة (Props) اللي لازم تفضل ثابتة.
4) مراجع الكادر: كل تركيبة (مين مع مين، فين، الزاوية) بتتكرر في أكتر من لقطة، ومين واقف فين.
5) زوايا الكاميرا المطلوبة لكل مكان.
وقارن بالموجود عندي، وقول الناقص بس:
الشخصيات الموجودة: ${L.chars.map(x=>x.name).join('، ')||'مفيش'}
الأماكن الموجودة: ${L.places.map(x=>x.name).join('، ')||'مفيش'}
الأدوات الموجودة: ${(L.props||[]).map(x=>x.name).join('، ')||'مفيش'}
مراجع الكادر الموجودة: ${L.frames.map(x=>x.name).join('، ')||'مفيش'}
الناتج: جدول «المطلوب | موجود ✓ / ناقص ✗ | أمر الصورة بالإنجليزي للناقص».\n\nالعمل:\n${ctx}`};
C.durPrompt=ctx=>`أنت مخرج ومونتير محترف. اقرا العمل ده واقترح المدة المناسبة ليه (للعمل كله ولكل مشهد)، بناءً على كمية الحوار (حوالي 2.5 كلمة في الثانية)، والأحداث، وإيقاع النوع، والمنصة. ارجع بـ: المدة المقترحة بالثواني، والحد الأدنى والأقصى، وجدول المشاهد بالمدد، وأي جزء ممكن يتقص لو عايز أقصر. القرار النهائي بتاعي.\n\nالعمل:\n${ctx}`;})();

/* ================= 🎯 قوالب حسب التطبيق + فحص الستوري بورد + السيناريو كامل + كرّر العمل ================= */
(function(){
const C=window.CORE,esc=C.esc,TK='hs_target';
C.VTARGETS=[['flow','Google Flow (Veo)',8],['kling','Kling',10],['higgs','Higgsfield',10],['grok','Grok Imagine',15],['any','تطبيق تاني',15]];
C.ITARGETS=[['any','أي مولّد صور'],['gemini','Nano Banana (Gemini)'],['mj','Midjourney'],['grok','Grok Imagine (صور)'],['higgs','Higgsfield (Soul)']];
C.target=()=>{try{return Object.assign({v:'flow',i:'any'},JSON.parse(localStorage.getItem(TK)||'{}'))}catch(e){return {v:'flow',i:'any'}}};
C.setTarget=(k,v)=>{const t=C.target();t[k]=v;try{localStorage.setItem(TK,JSON.stringify(t))}catch(e){}};
C.vt=()=>C.VTARGETS.find(x=>x[0]===C.target().v)||C.VTARGETS[0];
C.targetName=()=>C.vt()[1].replace(/ \(.*/,'');
const NEG=/^ممنوع:\s*/m;
function splitNeg(t){const m=t.match(/^ممنوع:[^\n]*$/m);if(!m)return [t,''];return [t.replace(m[0]+'\n','').replace(m[0],''),m[0].replace(NEG,'')]}
/* أمر الفيديو */
C.fitVideo=function(t,s){const v=C.target().v;
 if(v==='kling'){const [a,n]=splitNeg(t);return a+(n?'\n\nNegative prompt: '+n:'')}
 if(v==='higgs')return t+'\nالكاميرا بتتحرك بالحركة المكتوبة فوق، والأمر بيوصف اللي بيحصل أثناءها.';
 if(v==='grok')return t+'\nحركة واحدة واضحة. اوصف الصوت والمؤثرات والجو مع الحركة. حافظ تمامًا على شكل الشخصيات ولبسهم والمكان زي صورة البداية.';
 return t};
/* نصيحة للمستخدم (بتظهر على الشاشة، مش جوه الأمر) */
C.targetHint=function(){const v=C.target().v,i=C.target().i;const V={flow:'Flow: كل لقطة لحد 8 ثواني، والحوار والصوت جوه نفس اللقطة.',kling:'Kling: صورة البداية في خانة الإطار الأول، والمدة 5 أو 10 ث. السطر الأخير «Negative prompt» انقله للخانة بتاعته.',higgs:'Higgsfield: اختار من قايمة حركة الكاميرا أقرب حركة للمكتوبة في الأمر.',grok:'Grok Imagine: لقطة لحد 15 ث بصوت متزامن. ارفع صورة البداية والصق الأمر.',any:''}[v]||'';
 const I={mj:'Midjourney: الأمر جاهز بالمقاس وممنوعاته في الآخر.',gemini:'Nano Banana: ارفع صور الشخصيات والمكان مع الأمر عشان الشكل يثبت.',grok:'',higgs:'Higgsfield Soul: اختار Soul ID للشخصية لو عندك.',any:''}[i]||'';return [V,I].filter(Boolean).join(' • ')};
C.fitImage=function(t,aspect){const v=C.target().i;
 if(v==='mj'){const [a]=splitNeg(t);return a.replace(/^Generate ONE still image:[^\n]*\n/,'').trim()+'\n--ar '+(aspect||'9:16')+' --style raw --no text, watermark, letters, deformed hands'}
 return t};
/* لف أوامر الصفحة */
C.wrapPR=function(PR,getP){const sv=PR.shotP,si=PR.imgP,se=PR.shotEn;
 if(sv)PR.shotP=i=>C.fitVideo(sv(i),getP().shots[i]);
 if(si)PR.imgP=i=>C.fitImage(si(i),getP().aspect);
 if(se)PR.shotEn=i=>se(i).replace(/Google Flow/g,C.targetName())};
/* شريط فحص الستوري بورد + اختيار التطبيق */
C.boardBar=function(P){const sh=P.shots||[];if(!sh.length)return '';const T=sh.reduce((a,s)=>a+(+s.dur||0),0),want=+P.sec||0,max=C.vt()[2];
 const miss=[],long=[];sh.forEach((s,i)=>{const n=[];if(!(s.desc||'').trim())n.push('المشهد');if(!(s.cam||'').trim())n.push('الكاميرا');if(!(s.light||'').trim())n.push('الإضاءة');if(n.length)miss.push((i+1)+' ('+n.join('، ')+')');if((+s.dur||0)>max)long.push(i+1)});
 const pc=want?Math.min(100,Math.round(T/want*100)):100,col=!want||Math.abs(T-want)<=Math.max(3,want*.1)?'#22c55e':T<want?'#f59e0b':'#ef4444';
 const sel=(k,L)=>`<select data-tg="${k}" style="margin:0">${L.map(x=>`<option value="${x[0]}"${x[0]===C.target()[k]?' selected':''}>${x[1]}</option>`).join('')}</select>`;
 return `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px"><span>⏱️ ${T} ث${want?' من '+want:''}</span><span style="color:${col}">${want?(T<want?'ناقص '+(want-T)+' ث':T>want?'زيادة '+(T-want)+' ث':'مظبوط ✓'):''}</span></div>
 <div style="height:8px;background:#1e293b;border-radius:6px;overflow:hidden;margin-top:3px"><div style="height:100%;width:${pc}%;background:${col}"></div></div>
 ${miss.length?`<div class="m" style="color:#fcd34d;margin-top:4px">⚠️ لقطات ناقصة: ${miss.slice(0,8).join(' • ')}${miss.length>8?' …':''}</div>`:''}${long.length?`<div class="m" style="color:#fca5a5;margin-top:4px">✂️ لقطات أطول من ${max} ث (حد ${esc(C.targetName())}): ${long.join('، ')}</div>`:''}
 ${C.targetHint()?`<div class="m" style="margin-top:4px">💡 ${esc(C.targetHint())}</div>`:''}<div class="row" style="margin-top:6px"><div><label class="l">🎯 تطبيق الفيديو</label>${sel('v',C.VTARGETS)}</div><div><label class="l">🖼️ تطبيق الصور</label>${sel('i',C.ITARGETS)}</div></div></div>`};
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.tg;if(!k)return;C.setTarget(k,e.target.value);C.toast('🎯 الأوامر هتتظبط على '+e.target.selectedOptions[0].text);C._rerender&&C._rerender()});
/* السيناريو كامل */
C.fullScript=function(P,title){const L=[];const n=(P.wname||title||'عمل').trim();L.push('# '+n,'');
 const blocks=[['الفكرة',P.idea],['الموضوع',P.topic],['البحث',P.research],['السيناريو / النص',P.script],['كلمات الأغنية',P.lyrics]];
 blocks.forEach(([h,v])=>{if((v||'').trim())L.push('## '+h,v.trim(),'')});
 const c=C.castTxt?C.castTxt(P):'';if(c.trim())L.push('## الشخصيات والأماكن',c.trim(),'');
 const sh=P.shots||[];if(sh.length){L.push('## الستوري بورد ('+sh.length+' لقطة • '+sh.reduce((a,s)=>a+(+s.dur||0),0)+' ثانية)','');
  sh.forEach((s,i)=>{L.push('لقطة '+(i+1)+' | '+(s.dur||'?')+' ث'+(s.lyric?' | '+s.lyric:''));[['المشهد',s.desc],['الكاميرا',s.cam],['الحركة',s.move],['الإضاءة',s.light],['تغيير الشكل',s.look]].forEach(([k,v])=>{if((v||'').trim())L.push(k+': '+v.trim())});L.push('')})}
 return L.join('\n')};
C.scriptBox=function(P,title){const t=C.fullScript(P,title);let o=document.getElementById('fsBox');if(o)o.remove();o=document.createElement('div');o.id='fsBox';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:90vh;overflow:auto;padding:12px;color:#fff"><b>📄 العمل كامل</b><textarea readonly rows="14" style="margin-top:8px;font-size:13px">${esc(t)}</textarea>
 <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="b g" data-f="copy" style="flex:1">📋 نسخ</button><button class="b bl" data-f="file" style="flex:1">📤 ملف نصي</button><button class="b" data-f="print" style="flex:1">🖨️ طباعة / PDF</button></div><button class="b" data-f="x" style="width:100%;margin-top:8px">إغلاق</button></div>`;
 document.body.appendChild(o);o.onclick=async e=>{const b=e.target.closest('[data-f]');if(e.target===o||(b&&b.dataset.f==='x')){o.remove();return}if(!b)return;const a=b.dataset.f;
  if(a==='copy')C.copy(t,'اتنسخ العمل كامل ✓');
  if(a==='file'){const name=((P.wname||title||'عمل').trim()||'عمل')+'.txt',f=new File([t],name,{type:'text/plain'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(x){if(x&&x.name==='AbortError')return}const a2=document.createElement('a');a2.href=URL.createObjectURL(f);a2.download=name;a2.click()}
  if(a==='print'){const w=window.open('','_blank');if(!w){C.toast('افتح النوافذ المنبثقة للطباعة');return}w.document.write('<html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>'+esc(P.wname||'العمل')+'</title><style>body{font-family:Cairo,Tahoma,sans-serif;line-height:1.9;padding:24px;white-space:pre-wrap;font-size:14px}</style></head><body>'+esc(t).replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/^## (.*)$/gm,'<h2>$1</h2>')+'</body></html>');w.document.close();setTimeout(()=>w.print(),400)}}};
/* كرّر العمل: نفس الإعدادات والشخصيات، والمحتوى فاضي */
const CONTENT=['idea','script','paste','shots','lyrics','topic','research','chkPaste','epSum','sendIdx','sendMode','pub','wname','grid','title','paste2','cover'];
C.dupWork=async function(o,st,render){if(C.leaveOk&&!(await C.leaveOk()))return;const P=st.get(),old=(P.wname||'').trim();
 const name=(prompt('اسم العمل الجديد (نفس الإعدادات والشخصيات):',old?old+' 2':'')||'').trim();if(!name)return;
 st.snap('قبل تكرار العمل',true);const n=JSON.parse(JSON.stringify(P));CONTENT.forEach(k=>{if(k in o.def)n[k]=JSON.parse(JSON.stringify(o.def[k]));else delete n[k]});n.wname=name;n.step=0;
 st.set(n);C._wbar&&C._wbar();render();window.scrollTo(0,0);C.toast('📑 عمل جديد «'+name+'» بنفس الإعدادات ✓')};
})();

/* ================= 🤖 وضع الإيجنت: Gemini API بمفتاحك (اختياري) ================= */
(function(){
const C=window.CORE,esc=C.esc,KK='hs_gemkey',MK='hs_gemmodel',BASE='https://generativelanguage.googleapis.com/v1beta';
C.gemKey=()=>{let k=(localStorage.getItem(KK)||'').trim();if(!k){const o=(localStorage.getItem('studio5s_v2_key')||'').trim();if(/^AIza/.test(o)){k=o;try{localStorage.setItem(KK,o)}catch(e){}}}return k};
C.gemSpeed=()=>localStorage.getItem('hs_gemspeed')||'fast';
C.setGemKey=k=>{try{if(k)localStorage.setItem(KK,k.trim());else localStorage.removeItem(KK);localStorage.removeItem(MK)}catch(e){}};
/* بيختار أحدث موديل Flash متاح للمفتاح ده، عشان أسماء الموديلات بتتغير */
C.gemModels=async function(){try{const c=JSON.parse(localStorage.getItem(MK)||'null');if(c&&Date.now()-c.t<864e5&&Array.isArray(c.l))return c.l}catch(e){}
 const r=await fetch(BASE+'/models?pageSize=200&key='+encodeURIComponent(C.gemKey()));if(!r.ok)throw new Error(r.status===400||r.status===403?'المفتاح مش صحيح أو مش مفعّل. اتأكد إنك نسخته كامل من aistudio.google.com/apikey':'Gemini رد بخطأ '+r.status);
 const L=((await r.json()).models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')&&/flash/i.test(m.name)&&!/tts|image|live|audio|embed|exp|8b/i.test(m.name));
 const ver=n=>{const x=n.match(/(\d+(?:\.\d+)?)/);return x?+x[1]:0},rank=n=>(/lite/.test(n)?2:0)+(/preview/.test(n)?1:0);L.sort((a,b)=>(rank(a.name)-rank(b.name))||(ver(b.name)-ver(a.name)));
 const l=L.map(m=>m.name).slice(0,7);if(!l.length)l.push('models/gemini-2.5-flash');try{localStorage.setItem(MK,JSON.stringify({l,t:Date.now()}))}catch(e){}return l};
C.gemModel=async()=>(await C.gemModels())[0];
const nice=(st,msg)=>st>=500?'كل موديلات Gemini زحمة دلوقتي. جرّب كمان دقيقتين.':st===429||/quota|RESOURCE_EXHAUSTED|rate/i.test(msg)?'الحد المجاني لـ Gemini خلص دلوقتي. استنى دقيقة وجرّب تاني، ولو فضل كده جرّب بكرة.':st===403||/API key|PERMISSION/i.test(msg)?'المفتاح مش شغال (اتأكد إنه صح ومفعّل).':st>=500?'سيرفر Gemini مشغول. جرّب تاني بعد شوية.':msg;
C.b64=blob=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(blob)});
/* parts: نص أو {blob} أو {b64,mime} */
C.gemRun=async function(parts,onStep,opt){opt=opt||{};if(!C.gemKey())throw new Error('حط مفتاح Gemini الأول');onStep&&onStep('🤖 بختار الموديل…');await C.gemModels();const P=[];let size=0;
 for(const x of parts){if(typeof x==='string')P.push({text:x});else if(x.blob){const d=await C.b64(x.blob);size+=d.length;P.push({inline_data:{mime_type:x.blob.type||x.mime||'application/octet-stream',data:d}})}else if(x.b64){size+=x.b64.length;P.push({inline_data:{mime_type:x.mime,data:x.b64}})}}
 if(size>95e6)throw new Error('الملفات كبيرة أوي على الإيجنت (أكتر من 95 ميجا). قصّر الأغنية أو قلل الفيديوهات');
 const models=await C.gemModels();let j=null,lastErr='',model='',useSearch=!!opt.search;const SP=C.gemSpeed(),stream=opt.stream!==false&&!!(window.ReadableStream&&window.TextDecoder);
 const noThink=(()=>{try{return JSON.parse(localStorage.getItem('hs_gemnothink')||'{}')}catch(e){return {}}})();
 for(let mi=0;mi<models.length&&!j;mi++){model=models[mi];onStep&&onStep('🤖 الفريق بيشتغل… ('+model.replace('models/','')+')');
  const gc={temperature:opt.temp==null?.6:opt.temp,maxOutputTokens:SP==='fast'?8192:16384};const vv=(model.match(/(\d+(?:\.\d+)?)/)||[0,0])[1]*1;
  if(SP!=='deep'&&!noThink[model]&&!opt._noThink){if(vv>=3)gc.thinkingConfig={thinkingLevel:SP==='fast'?'low':'medium'};else if(vv>=2.5)gc.thinkingConfig={thinkingBudget:SP==='fast'?0:1024}}
  const body=Object.assign({systemInstruction:{parts:[{text:(opt.sys===false?'':C.CREW||'')+(opt.sysExtra?'\n'+opt.sysExtra:'')}]},contents:(opt.history||[]).map(h=>({role:h.role,parts:[{text:h.text}]})).concat([{role:'user',parts:P}]),generationConfig:gc},useSearch?{tools:[{google_search:{}}]}:{});
  let got=0;const ac=new AbortController(),t0=Date.now(),lim=opt.timeout||180000,tk=setInterval(()=>{const sec=Math.round((Date.now()-t0)/1000);if(got)return;onStep&&onStep('🤖 الفريق بيفكر… '+sec+' ثانية ('+model.replace('models/','')+')'+(sec>25?' — الطلبات الكبيرة بتاخد وقت':''))},1000),to=setTimeout(()=>ac.abort(),lim);
  const url=BASE+'/'+model+(stream?':streamGenerateContent?alt=sse&key=':':generateContent?key=')+encodeURIComponent(C.gemKey());
  let r;try{r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:ac.signal})}catch(e){clearInterval(tk);clearTimeout(to);if(e&&e.name==='AbortError')throw new Error('Gemini اتأخر أكتر من '+Math.round(lim/60000)+' دقايق ومردّش. جرّب تاني، أو قسّم الطلب لحاجة أصغر.');throw new Error('مفيش نت أو Gemini مش بيرد')}
  if(r.ok&&stream){let txt='',meta=null,fin='',all='';try{const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
    for(;;){const {done,value}=await rd.read();if(done)break;const ch=dec.decode(value,{stream:true});all+=ch;buf+=ch;let k;while((k=buf.indexOf('\n'))>=0){const line=buf.slice(0,k).trim();buf=buf.slice(k+1);if(!line.startsWith('data:'))continue;try{const o=JSON.parse(line.slice(5));const c=(o.candidates||[])[0]||{};((c.content&&c.content.parts)||[]).forEach(p=>{if(!p.thought&&p.text)txt+=p.text});if(c.groundingMetadata)meta=c.groundingMetadata;if(c.finishReason)fin=c.finishReason}catch(e){}}
     if(txt){got=1;const w=txt.trim().split(/\s+/).length;onStep&&onStep('✍️ الفريق بيكتب… '+w+' كلمة'+(opt.preview!==false?'\n'+txt.slice(-160):''))}}}
   catch(e){clearInterval(tk);clearTimeout(to);if(e&&e.name==='AbortError')throw new Error('Gemini اتأخر ومكملش الرد. جرّب تاني.');throw new Error('الاتصال اتقطع أثناء الرد. جرّب تاني.')}
   if(!txt&&all.trim()){try{let o=JSON.parse(all.trim());(Array.isArray(o)?o:[o]).forEach(x=>{const c=(x.candidates||[])[0]||{};((c.content&&c.content.parts)||[]).forEach(p=>{if(!p.thought&&p.text)txt+=p.text});if(c.groundingMetadata)meta=c.groundingMetadata})}catch(e){}}
   clearInterval(tk);clearTimeout(to);if(!txt.trim()&&fin==='SAFETY')throw new Error('Gemini رفض الطلب ده (محتوى ممنوع عنده). غيّر الصياغة.');
   j={candidates:[{content:{parts:[{text:txt}]},groundingMetadata:meta}]};if(mi>0){try{const l=models.slice();l.splice(mi,1);l.unshift(model);localStorage.setItem(MK,JSON.stringify({l,t:Date.now()}))}catch(e){}}break}
  clearInterval(tk);clearTimeout(to);
  const jj=await r.json().catch(()=>({}));if(r.ok){j=jj;if(mi>0){try{const l=models.slice();l.splice(mi,1);l.unshift(model);localStorage.setItem(MK,JSON.stringify({l,t:Date.now()}))}catch(e){}}break}
  const m=(jj.error&&jj.error.message)||'';lastErr=nice(r.status,m||('Gemini رد بخطأ '+r.status));
  if(r.status===400&&gc.thinkingConfig&&/think/i.test(m)){noThink[model]=1;try{localStorage.setItem('hs_gemnothink',JSON.stringify(noThink))}catch(e){}mi--;continue}
  if(useSearch&&r.status===400&&/tool|search|ground/i.test(m)){useSearch=false;mi--;continue}
  if(r.status>=500){if(!opt._retried){opt._retried=1;onStep&&onStep('⏳ Gemini زحمة، بجرب تاني بعد ثانيتين…');await new Promise(z=>setTimeout(z,2000));mi--;continue}opt._retried=0;onStep&&onStep('🔄 الموديل ده زحمة، بجرب موديل تاني…');continue}
  if(r.status===404||r.status===429||(r.status===400&&/not (found|supported)/i.test(m))||(r.status===403&&/billing|paid|free tier/i.test(m))){if(r.status===404){try{localStorage.removeItem(MK)}catch(e){}}continue}
  throw new Error(lastErr)}
 if(!j)throw new Error(lastErr||'Gemini ما ردّش');
 const cand=(j.candidates||[])[0]||{},t=cand.content;let out=t&&t.parts?t.parts.filter(p=>!p.thought).map(p=>p.text||'').join(''):'';if(!out.trim())throw new Error('Gemini ما ردّش (ممكن المحتوى اتمنع أو الحد المجاني خلص)');
 const G=cand.groundingMetadata&&cand.groundingMetadata.groundingChunks;if(opt.search&&G&&G.length){const seen={};const L=G.map(g=>g.web).filter(w=>w&&w.uri&&!seen[w.uri]&&(seen[w.uri]=1)).slice(0,12);if(L.length)out+='\n\nالمصادر اللي اتبحث فيها:\n'+L.map(w=>'- '+(w.title||'')+': '+w.uri).join('\n')}
 return out};
/* بيطلّع النسخة النهائية من بين ===بداية=== و===نهاية=== لو موجودة */
C.between=t=>{const m=String(t||'').match(/===\s*بداية\s*===([\s\S]*?)===\s*نهاية\s*===/);return m?m[1].trim():null};
const MARK='\n\nمهم للبرنامج: اكتب الناتج النهائي المطلوب بس بين السطرين ===بداية=== و===نهاية===، وأي شرح أو ملاحظات قبلهم.';
C.AGMARK=MARK;

/* ===== دستور الفريق العالمي (بيتبعت مع كل طلب للإيجنت) ===== */
C.CREW=`أنت مش مساعد عادي. أنت فريق إنتاج عالمي كامل بيشتغل كأنه شخص واحد متكامل، ومستواه مستوى أفضل الأفلام والإعلانات والكليبات في العالم. الفريق:
1) سيناريست وكاتب محتوى: بناء درامي محكم، هوك من أول ثانيتين، صراع وتصاعد وذروة ونهاية مؤثرة، حوار بشري طبيعي يتقال بصوت عالي، وكوميديا أو تشويق حسب النوع. بيكتب بالعامية المصرية أو باللغة المطلوبة، ومش باين أبدًا إنه مكتوب بالذكاء الاصطناعي.
2) مخرج: رؤية واضحة لكل مشهد، توجيه أداء الممثلين وأصواتهم، إيقاع، وكل لقطة ليها سبب في الحكاية.
3) مدير تصوير ومهندس كادرات: حجم اللقطة والعدسة والزاوية وحركة الكاميرا المناسبة لكل لحظة، وقواعد التكوين (الأثلاث، العمق، الخطوط الموجّهة، المساحة السلبية)، وقاعدة 180 درجة واستمرارية الاتجاه.
4) مهندس إضاءة: مصدر الضوء واتجاهه وجودته (ناعم/حاد) ودرجة حرارته، والإضاءة بتخدم الإحساس، ونفس منطق الإضاءة ثابت بين اللقطات.
5) مهندس ألوان (Colorist): لوحة ألوان للعمل كله، وتلوين يخدم الإحساس، وثبات الألوان بين اللقطات.
6) مونتير: القطع على الحركة، match cut و smash cut و jump cut في مكانهم، تنويع أطوال اللقطات، وانتقالات قليلة ومبررة.
7) مهندس صوت ومكساج: وضوح الكلام أولًا، الموسيقى تحت الكلام، المؤثرات بتبني العالم، ومستوى علوّ مناسب للمنصات.
8) مصمم جرافيك: هوية بصرية، خطوط مناسبة للعربي والإنجليزي، تسلسل بصري واضح، بوسترات وصور مصغّرة بتجذب من أول نظرة.
9) باحث ومثقف عالمي: معلومات دقيقة، وكل معلومة مهمة بمصدرها لو متاح البحث، ومش بيخترع أرقام أو أسماء أو أحداث. لو مش متأكد بيقول «غير مؤكد».
قواعد ثابتة: نفّذ اللي صاحب الشغل طالبه بالظبط وبأعلى احترافية، من غير ما تغيّر حاجة مطلبش يغيّرها. لو الطلب ممكن يتعمل أحسن قول اقتراحك في سطر، ونفّذ طلبه هو. التزم بأي شكل ناتج مطلوب منك حرفيًا (علامات، JSON، صيغة لقطات)، عشان البرنامج بيقرا ردك ويطبّقه أوتوماتيك. ردك بالعامية المصرية ومختصر، إلا لو المطلوب نص طويل.`;
/* ===== محرك «اعمل العمل كله»: خطوات بنقط مراجعة ===== */
C.agentFlow=function(o){if(!C.gemKey()){C.agentKeyBox();return}let ov=document.getElementById('agFlow');if(ov)ov.remove();ov=document.createElement('div');ov.id='agFlow';ov.style.cssText='position:fixed;inset:0;z-index:97;background:#000c;display:flex;align-items:flex-end';
 const S=o.steps.map(x=>Object.assign({st:'wait'},x));let cur=-1,out='',auto=false,busy=false,stopped=false,err=false,hist=[];
 const draw=(note)=>{const s=S[cur]||{};ov.innerHTML=`<div style="background:#0f172a;border:1px solid #10b981;border-radius:16px 16px 0 0;width:100%;max-height:92vh;overflow:auto;padding:12px;color:#fff">
  <div style="display:flex;align-items:center;gap:8px"><b style="flex:1;font-size:16px">🤖 ${esc(o.title||'الإيجنت')}</b>${busy?'<button class="b r" data-ag="stop" style="margin:0">⏹ إيقاف</button>':''}<button class="b" data-ag="close" style="margin:0">✕</button></div>
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0">${S.map((x,i)=>`<span class="tag" style="font-size:12px;${i===cur?'background:#10b981;color:#04130d':''}">${x.st==='done'?'✓':x.st==='skip'?'—':i===cur&&busy?'⏳':''} ${esc(x.label)}</span>`).join('')}</div>
  <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="agAuto" ${auto?'checked':''} style="width:auto"> كمّل لوحدك من غير ما تقف عند كل مرحلة</label>
  <div class="m" id="agNote" style="margin:8px 0;white-space:pre-wrap">${esc(note||'')}</div>
  ${!busy&&err&&cur<S.length?`<div style="display:flex;gap:6px"><button class="b g" data-ag="redo" style="flex:2">🔁 جرّب تاني</button><button class="b r" data-ag="stop" style="flex:1">⏹ وقف هنا</button></div>`:''}
  ${!busy&&!err&&cur>=0&&cur<S.length&&out?`<div class="m">${esc(s.gateLabel||'النتيجة (تقدر تعدّل فيها قبل ما تكمّل):')}</div><textarea id="agOut" rows="12" style="font-size:14px">${esc(out)}</textarea>
   <input id="agWish" placeholder="عايز يتغير إيه؟ (اختياري، لو هتطلب تاني)" style="margin-top:6px">
   <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="b g" data-ag="ok" style="flex:2">✓ تمام، كمّل</button><button class="b" data-ag="redo" style="flex:1">🔁 اعمل تاني</button><button class="b" data-ag="copy" style="flex:1">📋 نسخ</button><button class="b r" data-ag="stop" style="flex:1">⏹ وقف هنا</button></div>`:''}
  ${cur>=S.length?`<button class="b g" data-ag="close" style="width:100%">🎉 خلص — اقفل وشوف الشغل</button>`:''}</div>`};
 document.body.appendChild(ov);
 const run=async(wish)=>{if(stopped)return;const s=S[cur];if(!s){draw('✅ الإيجنت خلص كل المراحل. الشغل كله اتحط في الصفحة، وتقدر تعدّل أي حاجة.');o.onDone&&o.onDone();return}
  if(s.skip&&s.skip()){s.st='skip';cur++;return run()}
  busy=true;err=false;draw('⏳ '+s.label+'…');
  try{let res='';if(s.loop){res=await s.loop({say:t=>draw('⏳ '+t),gem:(p,op)=>C.gemRun(p,null,op),wish})}
   else{let pr=await s.build(wish);if(!pr){busy=false;stopped=true;draw('⏹ وقف: '+(s.need||'ناقص حاجة في الصفحة'));return}
    if(wish)pr=(Array.isArray(pr)?pr:[pr]).concat(['\n\nتعديل مطلوب على النسخة اللي فاتت: '+wish]);
    res=await C.gemRun(Array.isArray(pr)?pr:[pr],t=>draw(t),{search:!!s.search})}
   if(stopped)return;out=s.pick?s.pick(res):(C.between(res)||res);busy=false;if(!String(out).trim()){err=true;draw('⚠️ الرد جه فاضي. جرّب تاني.');return}const pre=C.between(res)?res.split(/===\s*بداية/)[0].trim().slice(0,2500):'';
   if(auto||!s.gate){await accept();return}draw((s.hint?s.hint+'\n\n':'')+pre)}
  catch(e){if(stopped)return;busy=false;err=true;draw('⚠️ '+e.message)}};
 const accept=async()=>{if(stopped)return;const s=S[cur];const v=(document.getElementById('agOut')||{}).value;if(v!=null&&!auto)out=v;try{s.apply&&await s.apply(out)}catch(e){draw('⚠️ '+e.message);return}s.st='done';cur++;out='';o.render&&o.render();run()};
 ov.onclick=async e=>{const b=e.target.closest('[data-ag]');if(e.target.id==='agAuto'){auto=e.target.checked;if(auto&&!busy&&!err&&out)accept();return}if(!b)return;const a=b.dataset.ag;if(busy&&a!=='close'&&a!=='stop')return;
  if(a==='close'){if(busy)stopped=true;ov.remove();o.render&&o.render();return}if(a==='stop'){stopped=true;ov.remove();o.render&&o.render();C.toast('⏹ الإيجنت وقف، واللي اتعمل اتحفظ');return}
  if(a==='copy'){C.copy((document.getElementById('agOut')||{}).value||out,'اتنسخ ✓');return}
  if(a==='ok'){accept();return}if(a==='redo'){const w=(document.getElementById('agWish')||{}).value||'';run(w.trim())}};
 cur=0;draw('');run()};
/* خطوة اللقطات: كل الأجزاء في محادثة واحدة */
C.agentShots=function(PR,getP,applyParse,label){return {label:label||'تقسيم اللقطات والستوري بورد',gate:true,gateLabel:'اللقطات (عدّل لو حابب، وبعدين كمّل):',hint:'دي اللقطات اللي هتتحط في الستوري بورد.',
 loop:async({say,gem,wish})=>{const P=getP(),n=C.partsN(P.sec,P.parts),hist=[],all=[];P.shots=[];
  for(let k=0;k<n;k++){say('بكتب اللقطات'+(n>1?' — الجزء '+(k+1)+' من '+n:'')+'…');let pr=PR.shots(k);if(!pr)throw new Error('ناقص النص قبل التقسيم');if(wish&&k===0)pr+='\n\nملاحظة مهمة: '+wish;
   const r=await gem([pr],{history:hist});hist.push({role:'user',text:pr},{role:'model',text:r});all.push(r);P.paste=r;applyParse(k>0)}
  return all.join('\n\n')},pick:x=>x,apply:out=>{const P=getP();P.paste=out;applyParse(false)}}};
/* خطوات الترند والنشر */
C.agentPub=function(getP,save,getCtx){return [{label:'الترندات (بحث جوجل)',search:true,gate:true,gateLabel:'الترندات والهاشتاجات المنتشرة دلوقتي:',build:()=>C.trendsPrompt(getP(),getCtx()),pick:x=>x,apply:out=>{const P=getP();P.pub=P.pub||{};P.pub.trends=out;save()}},
 {label:'حزمة النشر',gate:true,gateLabel:'خطة النشر والكابشن والهاشتاجات لكل منصة:',build:()=>C.pubPack(getP(),getCtx()),pick:x=>x,apply:out=>{const P=getP();const r=C.pubParse(out);P.pub=Object.assign(P.pub||{},{raw:out},r.items.length?r:{});P.pub.posted={};save()}}]};

/* ===== «اطلب أي حاجة»: الفريق يقرا العمل ويعدّل فيه أو يرد ===== */
const NOEDIT=['step','sendIdx','sendMode','grid','wname','pub','cast','chkPaste','paste','media','edl','logo','brands','brandSel','agentNote'];
function slim(P){return JSON.stringify(P,(k,v)=>{if(NOEDIT.includes(k)&&k!=='wname')return undefined;if(typeof v==='string'&&v.startsWith('data:'))return undefined;if(k==='img'||k==='thumb')return undefined;return v}).slice(0,40000)}
C.askPrompt=function(req){const pg=C._page;if(!pg)throw new Error('الصفحة دي مش جاهزة للإيجنت');const P=pg.st.get(),D=pg.def;
 const fields=Object.keys(D).filter(k=>!NOEDIT.includes(k)&&['string','number','boolean'].includes(typeof D[k]));
 const prompt=`طلب صاحب الشغل:
${req}

حالة العمل الحالية (JSON):
${slim(P)}

${C.castTxt?C.castTxt(P):''}
الخانات اللي تقدر تعدّلها: ${fields.join('، ')}${Array.isArray(D.shots)?'، واللقطات shots (كل لقطة: dur بالثواني، lyric الكلام المنطوق، desc المشهد، cam الكاميرا والكادر، move الحركة، light الإضاءة، look تغيير الشكل)':''}.

نفّذ الطلب كفريق عالمي. لو الطلب سؤال أو استشارة أو حاجة مش مكانها خانة (زي أمر بوستر أو لوحة ألوان أو بحث) حطها كاملة في answer.
اكتب ردك كده: سطر أو اتنين شرح، وبعدين JSON صحيح بين ===بداية=== و===نهاية===:
{"answer":"ردك أو الناتج الكامل لو مطلوب","set":{"اسم_الخانة":"القيمة الجديدة كاملة"},"shotEdits":[{"i":0,"light":"..."}],"shots":null}
- set: الخانات اللي اتغيرت بس، بقيمتها الجديدة الكاملة.
- shotEdits: تعديل لقطات موجودة (i رقم اللقطة من 0).
- shots: لو هتعيد كتابة اللقطات كلها أو تزود لقطات، حط القايمة الكاملة الجديدة، وإلا null.
- ما تغيّرش أي حاجة الطلب ما طلبهاش.`;
return prompt};
C.askApply=function(out){const pg=C._page,P=pg.st.get(),D=pg.def;const fields=Object.keys(D).filter(k=>!NOEDIT.includes(k)&&['string','number','boolean'].includes(typeof D[k]));
 const raw=C.between(out);let o=null;if(raw){try{o=JSON.parse(raw.replace(/,\s*([}\]])/g,'$1'))}catch(e){}}
 if(!o)return {answer:out,changed:[]};
 const before=JSON.stringify(P),changed=[];
 Object.entries(o.set||{}).forEach(([k,v])=>{if(!fields.includes(k))return;P[k]=typeof D[k]==='number'?(+v||0):typeof D[k]==='boolean'?!!v:String(v);changed.push(k)});
 if(Array.isArray(P.shots)){const F=['dur','lyric','desc','cam','move','light','look'];
  if(Array.isArray(o.shots)&&o.shots.length){const old=P.shots;P.shots=o.shots.map((x,i)=>{const b=Object.assign({dur:4,lyric:'',desc:'',cam:'',move:'',light:'',look:'',img:'',done:false},old[i]?{img:old[i].img,frame:old[i].frame,done:old[i].done,imgMode:old[i].imgMode}:{});F.forEach(f=>{if(x[f]!=null)b[f]=f==='dur'?Math.max(1,Math.min(15,+x[f]||4)):String(x[f])});return b});changed.push(o.shots.length+' لقطة')}
  (o.shotEdits||[]).forEach(e=>{const s=P.shots[+e.i];if(!s)return;F.forEach(f=>{if(e[f]!=null)s[f]=f==='dur'?Math.max(1,Math.min(15,+e[f]||s.dur)):String(e[f])});changed.push('لقطة '+(+e.i+1))})}
 if(changed.length){pg.st.save()}return {answer:(o.answer||'')+(out.includes('المصادر اللي اتبحث فيها')?'\n\n'+out.slice(out.indexOf('المصادر اللي اتبحث فيها')):''),changed,before}};
C.agentAsk=async function(req,onStep){const prompt=C.askPrompt(req);const out=await C.gemRun([prompt],onStep,{search:/ابحث|بحث|ترند|مصدر|إحصائ|حقيقي|تاريخ/.test(req)});return C.askApply(out)};
C.askBox=function(){return `<div style="margin-top:10px"><label class="l">💬 اطلب أي حاجة من الفريق</label><textarea id="askIn" rows="2" placeholder="مثال: خلي البطل صعيدي ولهجته قوية، وغيّر إضاءة كل اللقطات لليل بإضاءة نيون زرقا وحمرا، واقترح بوستر للفيلم"></textarea>
 <button class="b bl" data-a="askGo" style="width:100%">🎬 نفّذ</button><div id="askOut"></div></div>`};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-a="askGo"],[data-ask]');if(!b)return;const pg=C._page;if(!pg)return;
 if(b.dataset.ask==='undo'){if(C._askUndo){pg.st.snap('قبل التراجع',true);pg.st.set(JSON.parse(C._askUndo));C._askUndo=null;pg.render();C.toast('↩️ رجع زي ما كان')}return}
 if(b.dataset.ask==='copy'){C.copy(C._askAns||'','اتنسخ ✓');return}
 if(b.dataset.ask)return;
 if(!C.gemKey()){C.agentKeyBox();return}const req=(document.getElementById('askIn')||{}).value||'';if(!req.trim()){C.toast('اكتب طلبك الأول');return}
 const box=document.getElementById('askOut');const say=t=>{if(box)box.innerHTML='<div class="m" style="white-space:pre-wrap">'+esc(t)+'</div>'};b.disabled=true;
 C._lastReq=req;try{pg.st.snap('قبل طلب الإيجنت',true);const r=await C.askAgent(req,say);showAsk(r);

  const ta=document.getElementById('askIn');if(ta)ta.value=''}
 catch(x){const bx=document.getElementById('askOut');if(bx)bx.innerHTML=`<div class="shot" style="border-color:#f59e0b"><b>⚠️ ${esc(x.message)}</b>
  <div class="m" style="margin-top:6px">حل تاني شغال دايمًا: انسخ الطلب، والصقه في تطبيق Gemini أو ChatGPT أو Claude، وبعدين الصق الرد هنا، والبرنامج هيطبّقه بنفس الطريقة.</div>
  <button class="b bl" data-ask="man" style="width:100%">📋 انسخ الطلب</button><textarea id="askMan" rows="4" placeholder="الصق الرد هنا"></textarea><button class="b g" data-ask="manApply" style="width:100%">✓ طبّق الرد</button>
  <button class="b" data-ask="diag" style="width:100%">🔧 افحص الاتصال بـ Gemini</button><div id="askDiag"></div></div>`}b.disabled=false});
C.askAgent=C.agentAsk;
function showAsk(r){C._askUndo=r.before||null;C._askAns=r.answer||'';const pg=C._page;pg.render();const bx=document.getElementById('askOut');if(bx)bx.innerHTML=`<div class="shot" style="border-color:#10b981">${r.changed.length?'<b>✅ اتعدّل: '+esc(r.changed.join('، '))+'</b>':'<b>💬 رد الفريق</b>'}${r.answer?`<div style="white-space:pre-wrap;font-size:14px;margin-top:6px">${esc(r.answer)}</div>`:''}<div>${r.answer?'<button class="b" data-ask="copy">📋 نسخ</button>':''}${r.changed.length?'<button class="b" data-ask="undo">↩️ تراجع</button>':''}</div></div>`}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-ask]');if(!b)return;const a=b.dataset.ask,pg=C._page;if(!pg)return;
 if(a==='man'){const req=(document.getElementById('askIn')||{}).value||C._lastReq||'';if(!req.trim()){C.toast('اكتب طلبك الأول');return}C._lastReq=req;C.copy(C.CREW+'\n\n'+C.askPrompt(req),'اتنسخ الطلب ✓ الصقه في Gemini');return}
 if(a==='manApply'){const v=(document.getElementById('askMan')||{}).value||'';if(!v.trim()){C.toast('الصق الرد الأول');return}pg.st.snap('قبل طلب الإيجنت',true);showAsk(C.askApply(v));return}
 if(a==='diag'){const box=document.getElementById('askDiag');box.innerHTML='<div class="m">⏳ بفحص…</div>';box.innerHTML=await C.gemDiag();return}});
/* فحص الاتصال: بيوري كل موديل رد بإيه بالظبط */
C.gemDiag=async function(){const L=[];const k=C.gemKey();L.push('النسخة: '+C.VER+' • المفتاح: '+(k?k.slice(0,6)+'…'+k.slice(-4)+' ('+k.length+' حرف)':'مش متحط'));
 if(!k)return '<div class="m">'+L.join('<br>')+'</div>';let models=[];
 try{const r=await fetch(BASE+'/models?pageSize=200&key='+encodeURIComponent(k));const j=await r.json().catch(()=>({}));if(!r.ok){L.push('❌ قايمة الموديلات: '+r.status+' '+esc(((j.error||{}).message||'').slice(0,140)));return '<div class="m" style="direction:rtl">'+L.join('<br>')+'</div>'}
  models=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')&&/flash/i.test(m.name)&&!/tts|image|live|audio|embed|exp|8b/i.test(m.name)).map(m=>m.name);L.push('✓ الموديلات المتاحة: '+models.length)}catch(e){L.push('❌ مفيش اتصال بجوجل: '+esc(e.message));return '<div class="m">'+L.join('<br>')+'</div>'}
 try{localStorage.removeItem(MK)}catch(e){}
 for(const m of models.slice(0,6)){const ac=new AbortController(),to=setTimeout(()=>ac.abort(),25000),t0=Date.now();
  try{const r=await fetch(BASE+'/'+m+':generateContent?key='+encodeURIComponent(k),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:'رد بكلمة واحدة: تمام'}]}]}),signal:ac.signal});clearTimeout(to);const j=await r.json().catch(()=>({}));
   L.push((r.ok?'✅ ':'❌ ')+m.replace('models/','')+' — '+(r.ok?'شغال ('+((Date.now()-t0)/1000).toFixed(1)+' ث)':r.status+' '+esc(((j.error||{}).message||'').slice(0,120))))}
  catch(e){clearTimeout(to);L.push('❌ '+m.replace('models/','')+' — '+(e.name==='AbortError'?'اتأخر أكتر من 25 ثانية':esc(e.message)))}}
 return '<div class="m" style="direction:ltr;text-align:left;white-space:pre-wrap;font-size:12px">'+L.join('\n')+'</div><div class="m">ابعت صورة من النتيجة دي.</div>'};
C.agentKeyBox=function(){let o=document.getElementById('agKeyBox');if(o)o.remove();o=document.createElement('div');o.id='agKeyBox';o.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #10b981;border-radius:16px 16px 0 0;width:100%;padding:12px;color:#fff"><b>🔑 الإيجنت محتاج مفتاح Gemini</b>${C.agentKeyHTML().replace('<details','<details open')}<button class="b" style="width:100%;margin-top:8px" onclick="this.closest('#agKeyBox').remove()">إغلاق</button></div>`;document.body.appendChild(o)};
C.agentBtn=(label)=>`<div class="c" style="border-color:#10b981"><h3>🤖 فريقك العالمي</h3><div class="m">سيناريست ومخرج ومدير تصوير ومهندس إضاءة وألوان ومونتير ومهندس صوت ومصمم جرافيك وباحث، شغالين كإيجنت واحد. ${C.gemKey()?'':'(محتاج مفتاح Gemini مجاني)'}</div>
 <div style="display:flex;gap:4px;margin:8px 0 4px">${[['fast','⚡ سريع'],['balanced','⚖️ متوازن'],['deep','🧠 دقيق']].map(x=>`<button class="b${C.gemSpeed()===x[0]?' g':''}" data-gs="${x[0]}" style="flex:1;margin:0;padding:6px;font-size:13px">${x[1]}</button>`).join('')}</div><button class="b g" data-a="agentAll" style="width:100%;font-size:16px;padding:12px">🎬 ${label||'اعمل العمل كله'}</button><div class="m">بيكتب ويقسّم ويملا الستوري بورد لوحده، ويقف عند كل مرحلة تراجعها.</div>${C.askBox()}</div>`;
/* كارت الإيجنت (مشترك) */
C.agentKeyHTML=function(){const has=!!C.gemKey();return `<details${has?'':' open'} style="margin-top:6px"><summary style="font-size:13px;color:#94a3b8">🔑 مفتاح Gemini ${has?'✓ متحط':'(مطلوب لوضع الإيجنت)'}</summary>
 <div class="m" style="font-size:12px">خده ببلاش من aistudio.google.com/apikey (Get API key). بيتحفظ على الجهاز ده بس، ومش بيدخل في النسخة الاحتياطية. الملفات بتتبعت لـ Google عشان Gemini يشوفها ويسمعها.</div>
 <div class="m" style="font-size:11px">نسخة البرنامج: ${C.VER}</div><div style="display:flex;gap:4px;margin:6px 0">${[['fast','⚡ سريع'],['balanced','⚖️ متوازن'],['deep','🧠 دقيق']].map(x=>`<button class="b${C.gemSpeed()===x[0]?' g':''}" data-gs="${x[0]}" style="flex:1;margin:0;padding:6px">${x[1]}</button>`).join('')}</div><div class="m" style="font-size:11px">سريع: رد في ثواني للطلبات العادية. دقيق: بيفكر أكتر، أبطأ وأحسن للسيناريو الكامل والبحث.</div><div style="display:flex;gap:6px"><input type="password" id="gemKeyIn" placeholder="AIza..." value="${has?'••••••••':''}" style="flex:1;direction:ltr"><button class="b" data-gk="save" style="margin:0">حفظ</button>${has?'<button class="b r" data-gk="del" style="margin:0">🗑️</button>':''}</div></details>`};
document.addEventListener('click',e=>{const g=e.target.closest('[data-gs]');if(g){try{localStorage.setItem('hs_gemspeed',g.dataset.gs)}catch(x){}C.toast('السرعة: '+g.textContent.trim());C._rerender&&C._rerender();return}const b=e.target.closest('[data-gk]');if(!b)return;if(b.dataset.gk==='del'){C.setGemKey('');C.toast('اتشال المفتاح');C._rerender&&C._rerender();return}
 const v=(document.getElementById('gemKeyIn')||{}).value||'';if(!v||/^•+$/.test(v)){C.toast('الصق المفتاح الأول');return}C.setGemKey(v);C.toast('🔑 اتحفظ المفتاح ✓');C._rerender&&C._rerender()});
})();

/* ================= 🧹 مشروع جديد: مسح كل القديم ================= */
(function(){const C=window.CORE,esc=C.esc;
const G=[['works','🎬 الأعمال الحالية في كل الاستوديوهات','مع سجل النسخ 🕘 وملفات المونتاج',1],
 ['lib','👥 مكتبة الشخصيات والأماكن والأدوات والكادرات','بصورها وأصواتها',1],
 ['content','⚡ أفكار وردود وسجل أداء وبراندات المحتوى السريع','',1],
 ['learn','🪝 بنك الهوكات وسجل الدروس','',1],
 ['old','🧰 الاستوديو الكامل القديم','حلقاته وصوره، ومش بتدخل في نسخة Drive، يعني مش هترجع',0]];
const RX={works:/^hs_(film|ad|song|doc|montage|content)$|^hs_(hist_|dirty_|ts~|media_)/,lib:/^hs_lib$/,content:/^hs_cs_/,learn:/^hs_(hooks|lessons)$/,
 old:/^(studio5s_v2|ez_cur|ez_paste|ez_projlist|ez_step|ez_undo|studio_shortundo|studio_bkProg|studio_bkSnooze|studio_lastBackup)$/};
const OLDDB=['ez_state','studio_charimg','ez_imgs','ez_projs'];
const delDb=n=>new Promise(r=>{try{const q=indexedDB.deleteDatabase(n);q.onsuccess=q.onerror=q.onblocked=()=>r()}catch(e){r()}});
C.wipe=async function(sel){const rx=sel.map(k=>RX[k]).filter(Boolean),hit=k=>rx.some(r=>r.test(k));let n=0;
 Object.keys(localStorage).filter(hit).forEach(k=>{localStorage.removeItem(k);n++});
 for(const k of await C.idb.keys())if(hit(k)){await C.idb.del(k);n++}
 if(sel.includes('lib')){try{localStorage.setItem('hs_lib_imp','1')}catch(e){}C.lib&&['chars','places','props','frames'].forEach(t=>{if(Array.isArray(C.lib[t]))C.lib[t].length=0})}
 if(sel.includes('old'))for(const d of OLDDB){await delDb(d);n++}
 return n};
C.wipeBox=function(){let o=document.getElementById('wipeBox');if(o)o.remove();o=document.createElement('div');o.id='wipeBox';o.style.cssText='position:fixed;inset:0;z-index:99;background:#000d;display:flex;align-items:flex-end';
 const lb=+(localStorage.getItem('hs_lastbk')||0),fresh=Date.now()-lb<15*60000;
 o.innerHTML=`<style>#wipeBox .b{background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:15px;cursor:pointer}#wipeBox .b.g{background:#10b981;border-color:#10b981;color:#04130d;font-weight:700}#wipeBox .m{color:#94a3b8;font-size:13px;line-height:1.7}#wipeBox .l{display:block;font-size:13px;color:#cbd5e1;margin:10px 0 4px}#wipeBox input#wpOk{width:100%;box-sizing:border-box;background:#0b1220;color:#fff;border:1px solid #334155;border-radius:10px;padding:9px;font-family:inherit;font-size:15px}</style><div style="background:#0f172a;border:1px solid #ef4444;border-radius:16px 16px 0 0;width:100%;max-height:92vh;overflow:auto;padding:14px;color:#fff;font-family:inherit">
 <b style="font-size:17px">🧹 مشروع جديد: امسح كل القديم</b>
 <div class="m" style="margin:6px 0">الخطوة الأولى: اعمل نسخة على Drive، عشان لو احتجت أي حاجة بعدين ترجّعها من الصفحة الرئيسية.</div>
 <button class="b g" data-wp="bk" style="width:100%;margin:0">☁️ اعمل نسخة على Drive الأول</button><div id="wpMsg" class="m" style="margin-top:4px">${fresh?'<span style="color:#86efac">✓ فيه نسخة اتعملت من شوية</span>':''}</div>
 <div class="m" style="margin-top:10px">امسح إيه؟</div>
 ${G.map(g=>`<label style="display:flex;gap:10px;align-items:center;border-top:1px dashed #334155;padding:8px 0;font-size:14px"><input type="checkbox" data-wg="${g[0]}" ${g[3]?'checked':''} style="width:22px;height:22px;flex:0 0 auto"><span>${g[1]}${g[2]?`<br><span class="m" style="font-size:12px">${esc(g[2])}</span>`:''}</span></label>`).join('')}
 <div class="m" style="font-size:12px;margin-top:6px">مفتاح Gemini وربط Drive والإعدادات مش هيتمسحوا. والمسح على الجهاز ده بس، وأعمالك المحفوظة على Drive بتفضل زي ما هي.</div>
 <label class="l">اكتب كلمة <b>امسح</b> للتأكيد</label><input id="wpOk" autocomplete="off">
 <button class="b" data-wp="go" style="width:100%;margin:10px 0 0;background:#b91c1c;border-color:#b91c1c;color:#fff;font-weight:700">🗑️ امسح وابدأ من الصفر</button>
 <button class="b" data-wp="x" style="width:100%;margin:8px 0 0">إلغاء</button></div>`;
 document.body.appendChild(o);const msg=t=>{o.querySelector('#wpMsg').textContent=t};
 o.onclick=async e=>{const b=e.target.closest('[data-wp]');if(e.target===o||(b&&b.dataset.wp==='x')){o.remove();return}if(!b)return;
  if(b.dataset.wp==='bk'){b.disabled=true;try{const ok=await C.backupToDrive(false,msg);msg(ok?'✓ اتعملت النسخة على Drive':'اتلغت النسخة')}catch(x){msg('⚠️ '+x.message)}b.disabled=false;return}
  const sel=[...o.querySelectorAll('[data-wg]')].filter(x=>x.checked).map(x=>x.dataset.wg);if(!sel.length){C.toast('علّم حاجة تتمسح');return}
  if(o.querySelector('#wpOk').value.trim()!=='امسح'){C.toast('اكتب «امسح» في الخانة للتأكيد');o.querySelector('#wpOk').focus();return}
  if(Date.now()-(+(localStorage.getItem('hs_lastbk')||0))>15*60000&&!confirm('ما عملتش نسخة على Drive دلوقتي، والمسح مالوش رجوع. تمسح برضه؟'))return;
  b.disabled=true;b.textContent='⏳ بمسح…';const n=await C.wipe(sel);C._leaving=true;C.toast('🧹 اتمسح ('+n+' عنصر). بداية جديدة ✓',3000);setTimeout(()=>location.replace(location.pathname),700)}};
})();
