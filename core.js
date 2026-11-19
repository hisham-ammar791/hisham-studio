/* core.js — القلب المشترك للاستوديوهات الجديدة (صغير وآمن: ما بيلمسش الاستوديو القديم) */
(function(){
const CORE=window.CORE={};
const $=CORE.$=id=>document.getElementById(id);
CORE.esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
CORE.toast=function(m,ms){let t=$('coreToast');if(!t){t=document.createElement('div');t.id='coreToast';t.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#0f172a;border:1px solid #38bdf8;color:#fff;padding:9px 14px;border-radius:12px;z-index:99;font-size:14px;max-width:90vw;text-align:center';document.body.appendChild(t)}
 t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',ms||2200)};

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
  save(){try{localStorage.setItem(K,JSON.stringify(P))}catch(e){CORE.toast('⚠️ الحفظ فشل (المساحة مليانة؟)',4000)}},
  snap(why,force){try{const raw=JSON.stringify(P);if(!force&&raw===last)return;last=raw;let h=JSON.parse(localStorage.getItem(H)||'[]');h.unshift({ts:Date.now(),why:why||'',raw});localStorage.setItem(H,JSON.stringify(h.slice(0,12)))}catch(e){}},
  hist(){try{return JSON.parse(localStorage.getItem(H)||'[]')}catch(e){return []}},
  restore(ts){const x=api.hist().find(h=>h.ts==ts);if(!x)return false;api.snap('قبل الاسترجاع',true);P=Object.assign({},def,JSON.parse(x.raw));api.save();return true}};
 setInterval(()=>api.snap('تلقائي'),300000);return api};

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
function load(){try{return Object.assign({chars:[],places:[],frames:[]},JSON.parse(localStorage.getItem(LK)||'{}'))}catch(e){return {chars:[],places:[],frames:[]}}}
C.lib=load();
C.libSave=function(){try{localStorage.setItem(LK,JSON.stringify(C.lib));return true}catch(e){C.toast('⚠️ المساحة مليانة: صغّر الصور أو امسح القديم',4000);return false}};
C.libImport=async function(force){const o=await C.oldStudio();let n=0;
 (o.chars||[]).forEach(c=>{if(c.vo||!c.name)return;if(C.lib.chars.some(x=>x.oid===c.id||x.name===c.name))return;C.lib.chars.push({id:'c'+Date.now()+n,oid:c.id,name:c.name,look:c.ar||'',voice:c.voiceAr||'',dialect:'',tone:c.toneAr||'',img:c.img||''});n++});
 (o.places||[]).forEach(p=>{if(!p.name||C.lib.places.some(x=>x.name===p.name))return;C.lib.places.push({id:'p'+Date.now()+n,name:p.name,desc:p.ar||'',img:p.img||''});n++});
 if(n)C.libSave();if(force)C.toast(n?'اتنقل '+n+' من الاستوديو القديم ✓':'مفيش جديد في الاستوديو القديم');return n};
if(!C.lib.chars.length&&!C.lib.places.length&&!localStorage.getItem('hs_lib_imp')){try{localStorage.setItem('hs_lib_imp','1')}catch(e){}C.libImport(false).then(n=>{if(n&&C._castR)C._castR()})}
C.shrinkImg=(file,max)=>new Promise(r=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const k=Math.min(1,(max||640)/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',.78))};im.onerror=()=>r('');im.src=u});
const T={chars:['👤 الشخصيات','شخصية'],places:['📍 الأماكن','مكان'],frames:['🖼️ مراجع الكادر','مرجع كادر']};
const get=(t,id)=>(C.lib[t]||[]).find(x=>x.id===id);
C.selOf=P=>{P.cast=P.cast||{chars:[],places:[],frames:[]};['chars','places','frames'].forEach(k=>{P.cast[k]=(P.cast[k]||[]).filter(id=>get(k,id))});return P.cast};
const dn=k=>C.pick(DIALECTS,k)[1];
/* نص الأوامر */
C.castTxt=function(P){const s=C.selOf(P),ch=s.chars.map(id=>get('chars',id)),pl=s.places.map(id=>get('places',id)),fr=s.frames.map(id=>get('frames',id));let t='';
 if(ch.length)t+='الشخصيات (الشكل والصوت ثابتين في كل لقطة ومشهد، بدون أي تغيير):\n'+ch.map(c=>'- '+c.name+': '+(c.look||'')+(c.voice?' | الصوت: '+c.voice:'')+(c.dialect?' | اللهجة: '+dn(c.dialect):'')+(c.tone?' | الأداء: '+c.tone:'')).join('\n')+'\n';
 if(pl.length)t+='الأماكن (ثابتة):\n'+pl.map(p=>'- '+p.name+': '+(p.desc||'')).join('\n')+'\n';
 if(fr.length)t+='مراجع الكادر (صور مرفقة، التزم بأماكن الشخصيات فيها):\n'+fr.map(f=>'- '+f.name+': '+(f.chars||[]).map(id=>(get('chars',id)||{}).name).filter(Boolean).join(' و')+((get('places',f.place)||{}).name?' في '+get('places',f.place).name:'')+(f.angle?'، زاوية '+C.pick(ANGLES,f.angle)[1]:'')+(f.note?'، '+f.note:'')).join('\n')+'\n';
 return t};
C.castVoices=function(P){const s=C.selOf(P);return s.chars.map(id=>get('chars',id)).filter(c=>c.voice||c.dialect||c.tone).map(c=>'- '+c.name+': '+[c.voice,c.dialect&&'لهجة '+dn(c.dialect),c.tone].filter(Boolean).join('، ')).join('\n')};
C.castFrames=P=>C.selOf(P).frames.map(id=>get('frames',id));
C.frameImg=id=>(get('frames',id)||{}).img||'';
/* الكارت */
C.castCard=function(P){const s=C.selOf(P);
 const row=(t,x)=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed var(--border);padding:6px 0"><input type="checkbox" data-cc="${t}:${x.id}" ${s[t].includes(x.id)?'checked':''} style="width:22px;height:22px">${x.img?`<img src="${x.img}" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:'<div style="width:44px;height:44px;border-radius:8px;background:#0b1220;display:flex;align-items:center;justify-content:center">'+T[t][0].split(' ')[0]+'</div>'}<div style="flex:1;min-width:0;font-size:14px"><b>${esc(x.name||'بدون اسم')}</b><div class="m" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t==='chars'?[x.voice&&'🗣️ '+x.voice,x.dialect&&dn(x.dialect)].filter(Boolean).join(' • ')||x.look:t==='places'?x.desc:(x.chars||[]).map(id=>(get('chars',id)||{}).name).filter(Boolean).join('، '))}</div></div><button class="b" data-ca="edit:${t}:${x.id}" style="margin:0">✏️</button></div>`;
 return `<div class="c"><h3>👥 الشخصيات والأماكن والكادرات</h3><div class="m">علّم اللي في العمل ده. المكتبة مشتركة بين كل الاستوديوهات.</div>
 ${['chars','places','frames'].map(t=>`<details ${s[t].length||!C.lib[t].length?'open':''} style="margin-top:8px"><summary style="font-weight:700">${T[t][0]} (${s[t].length}/${C.lib[t].length})</summary>${C.lib[t].map(x=>row(t,x)).join('')}<button class="b" data-ca="add:${t}">➕ ${T[t][1]} جديد</button></details>`).join('')}
 <button class="b" data-ca="import">⬇️ هات من الاستوديو القديم</button></div>`};
/* المحرر */
function editor(t,id){const x=id?Object.assign({},get(t,id)):{id:t[0]+Date.now(),name:'',chars:[]};let o=document.getElementById('castEd');if(o)o.remove();o=document.createElement('div');o.id='castEd';
 o.style.cssText='position:fixed;inset:0;z-index:97;background:#000c;display:flex;align-items:flex-end';
 const f=(k,l,ta,ph)=>`<label class="l">${l}</label>${ta?`<textarea data-e="${k}" rows="${ta}" placeholder="${ph||''}">${esc(x[k]||'')}</textarea>`:`<input data-e="${k}" value="${esc(x[k]||'')}" placeholder="${ph||''}">`}`;
 const opts=(l,v)=>l.map(a=>`<option value="${a[0]}"${a[0]===(v||'')?' selected':''}>${esc(a[1])}</option>`).join('');
 let body=f('name','الاسم');
 if(t==='chars')body+=f('look','الشكل الثابت (الملامح، السن، الملابس، الألوان)',3)+f('voice','🗣️ الصوت (الطبقة، السن، النبرة، السرعة، لازمة)',2,'مثال: صوت رجل ستيني أجش وبطيء، بيمط آخر الكلمة')+`<label class="l">اللهجة</label><select data-e="dialect">${opts(DIALECTS,x.dialect)}</select>`+f('tone','🎭 أسلوب الأداء والشخصية',2,'مثال: ساخر وهادئ، بيرد بسؤال');
 if(t==='places')body+=f('desc','الوصف الثابت (أماكن الأشياء، الإضاءة، الألوان)',3);
 if(t==='frames')body+=`<label class="l">مين في الكادر</label>${C.lib.chars.map(c=>`<label style="display:inline-flex;gap:4px;margin:4px 8px 0 0;align-items:center"><input type="checkbox" data-fc="${c.id}" ${(x.chars||[]).includes(c.id)?'checked':''} style="width:auto">${esc(c.name)}</label>`).join('')||'<div class="m">ضيف شخصيات الأول</div>'}<label class="l">المكان</label><select data-e="place"><option value="">—</option>${C.lib.places.map(p=>`<option value="${p.id}"${p.id===x.place?' selected':''}>${esc(p.name)}</option>`).join('')}</select><label class="l">الزاوية</label><select data-e="angle">${opts([['','—']].concat(ANGLES),x.angle)}</select>`+f('note','مين واقف فين (اختياري)',2,'مثال: فهيم ورا الكاونتر يمين، والزبون قدامه شمال');
 o.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:88vh;overflow:auto;padding:12px;color:#fff"><b>${id?'تعديل':'إضافة'} ${T[t][1]}</b>${body}
 <label class="l">🖼️ الصورة ${t==='frames'?'(صورة المرجع)':'(شيت أو مرجع)'}</label>${x.img?`<img src="${x.img}" style="max-width:100%;border-radius:10px">`:''}<input type="file" accept="image/*" data-eimg>
 ${t==='chars'?`<button class="b bl" data-ex="sheet">📋 أمر صورة شيت للشخصية</button>`:''}${t==='places'?`<button class="b bl" data-ex="sheet">📋 أمر صورة للمكان</button>`:''}
 <div style="display:flex;gap:6px;margin-top:10px"><button class="b g" data-ex="save" style="flex:2">💾 حفظ</button>${id?'<button class="b r" data-ex="del">🗑️</button>':''}<button class="b" data-ex="x" style="flex:1">إلغاء</button></div></div>`;
 document.body.appendChild(o);
 o.addEventListener('change',async e=>{if(e.target.dataset.eimg!==undefined&&e.target.files[0]){x.img=await C.shrinkImg(e.target.files[0],t==='frames'?900:560);C.toast('اتحطت الصورة ✓ اضغط حفظ')}});
 o.onclick=e=>{const b=e.target.closest('[data-ex]');if(e.target===o){o.remove();return}if(!b)return;const a=b.dataset.ex;
  o.querySelectorAll('[data-e]').forEach(el=>x[el.dataset.e]=el.value);x.chars=[...o.querySelectorAll('[data-fc]')].filter(c=>c.checked).map(c=>c.dataset.fc);
  if(a==='x'){o.remove();return}
  if(a==='sheet'){C.copy(t==='chars'?`Character reference sheet, full body front view + 3/4 view + side view + close-up face, neutral pose, plain light grey background, consistent design. Character: ${x.name}. Look (Arabic description, translate faithfully): ${x.look||''}. No text, no watermark.`:`Wide establishing reference image of a location, no people, clear layout. Location: ${x.name}. Description (Arabic, translate faithfully): ${x.desc||''}. No text, no watermark.`,'اتنسخ أمر الصورة ✓ الصقه في Gemini أو ChatGPT');return}
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
