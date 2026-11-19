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
  set(o){P=Object.assign({},def,o||{});api.save()},
  reset(){P=JSON.parse(JSON.stringify(def));api.save()},
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
async function f(url,opt){opt=opt||{};opt.headers=Object.assign({Authorization:'Bearer '+GD.tok},opt.headers||{});const r=await fetch(url,opt);if(r.status===401){GD.tok='';throw new Error('الجلسة انتهت، اربط تاني')}if(!r.ok)throw new Error('Drive '+r.status);return r}
async function folder(){let id=cfg().hsFolder;if(id){try{const j=await (await f(API+'/drive/v3/files/'+id+'?fields=id,trashed')).json();if(!j.trashed)return id}catch(e){if(/اربط/.test(e.message))throw e}}
 const q=encodeURIComponent(`name='${FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);const l=await (await f(API+'/drive/v3/files?q='+q+'&fields=files(id)')).json();
 id=(l.files&&l.files[0]&&l.files[0].id)||(await (await f(API+'/drive/v3/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:FOLDER,mimeType:'application/vnd.google-apps.folder'})})).json()).id;put({hsFolder:id});return id}
C.gdList=async function(ns){const q=encodeURIComponent(`appProperties has { key='hs' and value='${ns}' } and trashed=false`);return ((await (await f(API+'/drive/v3/files?q='+q+'&orderBy=modifiedTime desc&pageSize=200&fields=files(id,name,modifiedTime,appProperties)')).json()).files||[])};
C.gdSave=async function(ns,name,data){if(!(await C.gdConnect()))return false;const fid=await folder(),fname=ns+' - '+name+'.json';
 const ex=(await C.gdList(ns)).find(x=>x.appProperties&&x.appProperties.name===name);const meta=ex?{name:fname}:{name:fname,parents:[fid],appProperties:{hs:ns,name}};
 const b='hsb'+Date.now(),body=`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${b}--`;
 await f(API+'/upload/drive/v3/files'+(ex?'/'+ex.id:'')+'?uploadType=multipart',{method:ex?'PATCH':'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body});return true};
C.gdLoad=async function(id){return await (await f(API+'/drive/v3/files/'+id+'?alt=media')).json()};

/* شريط العمل */
C.work=function(o){const {ns,st,render}=o,P=()=>st.get();
 const bar=()=>{let el=document.getElementById('wbar');if(!el){el=document.createElement('div');el.id='wbar';const h=document.querySelector('header');h.parentNode.insertBefore(el,h.nextSibling)}
  el.innerHTML=`<div style="display:flex;gap:6px;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);flex-wrap:wrap"><span style="font-size:13px;color:var(--muted)">📁</span><input id="wName" value="${esc(P().wname||'')}" placeholder="اسم العمل" style="flex:1;min-width:120px;padding:6px 8px;font-size:14px">
  <button class="b" data-w="save" style="margin:0">☁️ حفظ</button><button class="b" data-w="open" style="margin:0">📂 فتح</button><button class="b" data-w="new" style="margin:0">🆕 جديد</button><button class="b bl" data-w="check" style="margin:0">🔎 فحص</button><button class="b" data-w="tools" style="margin:0">🧰 أدوات</button></div>${dirty()?'<div style="background:#422006;color:#fcd34d;font-size:12px;padding:3px 12px">● فيه تعديلات ما اتحفظتش على Drive</div>':''}`};
 C._wbar=bar;
 const DK='hs_dirty_'+ns,dirty=()=>!!localStorage.getItem(DK)&&JSON.stringify(P())!==JSON.stringify(Object.assign({},o.def,{step:0}));
 const sv0=st.save;st.save=function(){sv0.apply(st,arguments);if(!localStorage.getItem(DK)){try{localStorage.setItem(DK,'1')}catch(e){}bar()}};
 const clean=()=>{try{localStorage.removeItem(DK)}catch(e){}bar()};
 C.workDirty=dirty;
 window.addEventListener('beforeunload',e=>{if(dirty()&&!C._leaving){e.preventDefault();e.returnValue='فيه تعديلات ما اتحفظتش على Drive'}});
 C.leaveOk=async function(){if(!dirty())return true;const k=await ask3s((P().wname||'').trim());if(k==='x')return false;if(k==='save'){const r=await save();if(!r&&!confirm('الحفظ ما نجحش. تكمل برضه؟'))return false}C._leaving=true;return true};
 async function save(silent){const n=(P().wname||'').trim();if(!n){alert('اكتب اسم العمل الأول');return false}try{C.toast('⏳ بحفظ على Drive…',8000);const r=await C.gdSave(ns,n,P());if(r){C.toast('☁️ اتحفظ «'+n+'» على Drive ✓');clean()}return r}catch(e){C.toast('⚠️ '+e.message,4000);return false}}
 async function openBox(){if(!(await C.leaveOk()))return;if(!(await C.gdConnect()))return;let l=[];try{C.toast('⏳ بجيب أعمالك…');l=await C.gdList(ns)}catch(e){C.toast('⚠️ '+e.message);return}
  let ov=document.getElementById('wOpen');if(ov)ov.remove();ov=document.createElement('div');ov.id='wOpen';ov.style.cssText='position:fixed;inset:0;z-index:98;background:#000c;display:flex;align-items:flex-end';
  const items=q=>l.filter(x=>!q||(x.appProperties.name||'').includes(q)).map(x=>`<div style="display:flex;gap:8px;align-items:center;border-top:1px dashed #334155;padding:8px 0"><div style="flex:1"><b>${esc(x.appProperties.name)}</b><div class="m" style="font-size:12px">${new Date(x.modifiedTime).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})}</div></div><button class="b g" data-o="${x.id}" style="margin:0">افتح</button></div>`).join('')||'<div class="m">مفيش أعمال بالاسم ده.</div>';
  ov.innerHTML=`<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:16px 16px 0 0;width:100%;max-height:80vh;overflow:auto;padding:12px;color:#fff"><b>📂 أعمالك على Drive (${l.length})</b><input id="wQ" placeholder="اكتب اسم العمل…" style="margin-top:8px" value="${esc((P().wname||'').trim())}"><div id="wL">${items((P().wname||'').trim())}</div><button class="b" data-o="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
  document.body.appendChild(ov);ov.querySelector('#wQ').oninput=e=>{ov.querySelector('#wL').innerHTML=items(e.target.value.trim())};
  ov.onclick=async e=>{const b=e.target.closest('[data-o]');if(e.target===ov||(b&&b.dataset.o==='x')){ov.remove();return}if(!b)return;
   if(!confirm('تفتح العمل ده؟ الحالي هيتحفظ في سجل النسخ 🕘 الأول.'))return;try{const d=await C.gdLoad(b.dataset.o);st.snap('قبل فتح عمل من Drive',true);st.set(d);clean();ov.remove();bar();render();C.toast('اتفتح ✓')}catch(x){C.toast('⚠️ '+x.message)}}}
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
 document.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b)return;const a=b.dataset.w;if(a==='save')save();if(a==='open')openBox();if(a==='new')nw();if(a==='check')check();if(a==='tools')C.toolsMenu(o,st,render,bar);if(a==='lessons')C.lessonsBox();if(a==='pub'){const t=C.pubPrompt(o.ctx?o.ctx():'');C.copy(t,'اتنسخ أمر حزمة النشر ✓')}});
 bar();
 const qo=new URLSearchParams(location.search).get('open');
 if(qo)setTimeout(async()=>{history.replaceState(null,'',location.pathname);if(!(await C.leaveOk()))return;if(!(await C.gdConnect()))return;try{C.toast('⏳ بفتح العمل…',8000);const d=await C.gdLoad(qo);st.snap('قبل فتح عمل من Drive',true);st.set(d);clean();render();C.toast('اتفتح ✓')}catch(x){C.toast('⚠️ '+x.message,4000)}},300)};
})();

/* ================= 🌐 ترجمة تلقائية للإنجليزي ================= */
(function(){
const C=window.CORE,TK='hs_trc';let cache={};try{cache=JSON.parse(localStorage.getItem(TK)||'{}')}catch(e){}
const AR=/[؀-ۿ]/;
async function g1(q){try{const r=await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q='+encodeURIComponent(q));if(r.ok){const j=await r.json();const t=(j[0]||[]).map(x=>x[0]||'').join('').trim();if(t)return t}}catch(e){}
 try{const r=await fetch('https://api.mymemory.translated.net/get?langpair=ar|en&q='+encodeURIComponent(q.slice(0,480)));const j=await r.json();return (j&&j.responseData&&j.responseData.translatedText)||''}catch(e){return ''}}
async function tr(q){q=q.trim();if(!q||!AR.test(q))return q;if(cache[q])return cache[q];const t=await g1(q);if(t){cache[q]=t;try{const k=Object.keys(cache);if(k.length>1500)k.slice(0,500).forEach(x=>delete cache[x]);localStorage.setItem(TK,JSON.stringify(cache))}catch(e){}}return t||null}
/* الكلام المنطوق يفضل بلغته الأصلية؛ الباقي يترجم */
const KEEP=/^(الحوار|الكلام المنطوق|الكلمات المغناة في اللقطة|التعليق الصوتي على اللقطة[^:]*)\s*[:：]\s*/;
C.toEn=async function(txt){const lines=String(txt).split('\n'),out=[];let fail=0;
 for(const l of lines){if(!AR.test(l)){out.push(l);continue}
  const m=l.match(KEEP);if(m){const lab=await tr(m[1]);out.push((lab||'Spoken line')+' (keep spoken exactly in the original language): "'+l.slice(m[0].length).trim()+'"');continue}
  const t=await tr(l);if(t)out.push(t);else{out.push(l);fail++}}
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
 ${it('hooks','🪝 اقترح 10 هوكات','من بنك الهوكات اللي نجحت معاك')}${it('test3','⏱️ اختبار الـ3 ثواني الأولى','حكم واحد: يشد ولا لأ')}${it('comp','🏆 وضع المسابقات','تقييم لجنة تحكيم + قايمة التسليم')}${it('multi','♻️ عمل واحد = 10 مخرجات','ريلز، كاروسيل، بوستات، تيزر…')}${it('plan','🗓️ خطة محتوى 30 يوم','لصفحة تختارها')}${it('en','🌍 نسخة إنجليزية للعالمية','بنفس النبرة مع تغيير الأمثلة المحلية')}${it('pub','📢 حزمة النشر','عنوان وكابشن وهاشتاجات لكل منصة')}
 <div style="display:flex;gap:6px;margin-top:10px"><button class="b" data-x="hookbank" style="flex:1;margin:0">🪝 بنك الهوكات (${C.hooks().length})</button><button class="b" data-x="lessons" style="flex:1;margin:0">📚 الدروس (${C.lessons().length})</button></div>
 <button class="b" data-x="x" style="width:100%;margin-top:10px">إغلاق</button></div>`;
 document.body.appendChild(ov);
 ov.onclick=e=>{const b=e.target.closest('[data-t],[data-p],[data-x]');if(e.target===ov){ov.remove();return}if(!b)return;
  if(b.dataset.x==='x'){ov.remove();return}if(b.dataset.x==='lessons'){ov.remove();C.lessonsBox();return}if(b.dataset.x==='hookbank'){ov.remove();C.hookBank();return}
  if(b.dataset.p!==undefined){const p=o.presets[+b.dataset.p];if(!confirm('تطبّق وصفة «'+p.name+'»؟ هتغيّر الاختيارات بس (النوع والشكل والمدة…)، والكتابة بتفضل.'))return;st.snap('قبل وصفة',true);Object.assign(st.get(),JSON.parse(JSON.stringify(p.set)));st.save();ov.remove();bar();render();C.toast('🎯 اتطبقت «'+p.name+'»');return}
  let k=b.dataset.t,send=k.endsWith('!');if(send)k=k.slice(0,-1);let t;
  if(k==='pub')t=C.pubPrompt(ctx());else if(k==='plan'){const pg=(prompt('اسم الصفحة اللي هتعمل لها الخطة:',localStorage.getItem('hs_lastpage')||'')||'').trim();if(!pg)return;try{localStorage.setItem('hs_lastpage',pg)}catch(x){}t=P_.plan(ctx(),pg)}else t=P_[k](ctx());
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
const pub=P=>{P.pub=Object.assign({plats:['fb','ig','tt','yts'],raw:'',plan:'',thumb:'',items:[],posted:{}},P.pub||{});return P.pub};
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
${C.WRITING}

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
 <div class="pair"><button class="b bl" data-pu="cmd">📋 أمر حزمة النشر</button><button class="b" data-pu="cmd!">📤</button></div>
 <textarea data-pu-raw rows="${u.items.length?3:6}" placeholder="الصق رد الذكاء هنا">${esc(u.raw)}</textarea><button class="b g" data-pu="parse">✂️ حوّل لكروت نشر</button>
 ${u.plan?`<div class="shot"><b>🗓️ خطة النشر</b><div class="m" style="white-space:pre-wrap;color:#e2e8f0">${esc(u.plan)}</div><button class="b" data-pc="plan">📋</button></div>`:''}
 ${u.items.map((it,i)=>`<div class="shot${u.posted[i]?' done':''}"><div class="hd"><b>${esc(it.name)}</b>${it['أفضل وقت']?`<span class="tag">🕒 ${esc(it['أفضل وقت'])}</span>`:''}</div>
  ${it['العنوان']?`<div class="m"><b>العنوان:</b> ${esc(it['العنوان'])}</div>`:''}
  <div style="white-space:pre-wrap;font-size:14px;margin-top:6px">${esc([it['الهوك'],it['الكابشن']].filter(Boolean).join('\n\n'))}</div>
  <div class="m" style="margin-top:6px;color:#7dd3fc;direction:rtl">${esc(it['الهاشتاجات']||'')}</div>
  ${it['أول تعليق']?`<div class="m" style="margin-top:6px">💬 أول تعليق: ${esc(it['أول تعليق'])}</div>`:''}
  <div><button class="b bl" data-pc="all:${i}">📋 الكابشن + الهاشتاجات</button><button class="b" data-pc="cap:${i}">الكابشن</button><button class="b" data-pc="tag:${i}">#</button>${it['العنوان']?`<button class="b" data-pc="ttl:${i}">العنوان</button>`:''}${it['أول تعليق']?`<button class="b" data-pc="fc:${i}">💬</button>`:''}<button class="b${u.posted[i]?' on':''}" data-pc="done:${i}">✓ ${u.posted[i]?'اتنشر':'نشرت'}</button></div></div>`).join('')}
 ${u.thumb?`<div class="shot"><b>🖼️ الصورة المصغّرة</b><div class="m" style="white-space:pre-wrap;color:#e2e8f0">${esc(u.thumb)}</div><button class="b" data-pc="thumb">📋</button></div>`:''}</div>`};
C.bindPub=function(getP,save,render,getCtx){
 document.addEventListener('input',e=>{if(e.target.hasAttribute&&e.target.hasAttribute('data-pu-raw')){pub(getP()).raw=e.target.value;save()}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-pp],[data-pu],[data-pc]');if(!b)return;const P=getP(),u=pub(P);
  if(b.dataset.pp){const k=b.dataset.pp;u.plats=u.plats.includes(k)?u.plats.filter(x=>x!==k):u.plats.concat(k);save();render();return}
  if(b.dataset.pu){let k=b.dataset.pu;if(k==='parse'){if(!u.raw.trim()){alert('الصق الرد الأول');return}const r=C.pubParse(u.raw);if(!r.items.length&&!r.plan){alert('مش لاقي علامات «=== منصة: ... ===». استخدم أمر حزمة النشر من هنا.');return}Object.assign(u,r);u.posted={};save();render();C.toast('📢 '+r.items.length+' منصة جاهزة ✓');return}
   const send=k.endsWith('!'),t=C.pubPack(P,getCtx());send?C.send(t):C.copy(t,'اتنسخ أمر حزمة النشر ✓');return}
  const [k,i]=b.dataset.pc.split(':'),it=u.items[+i]||{};
  if(k==='done'){u.posted[i]=!u.posted[i];save();render();return}
  const t={plan:u.plan,thumb:u.thumb,all:[it['الهوك'],it['الكابشن'],it['الهاشتاجات']].filter(Boolean).join('\n\n'),cap:[it['الهوك'],it['الكابشن']].filter(Boolean).join('\n\n'),tag:it['الهاشتاجات'],ttl:it['العنوان'],fc:it['أول تعليق']}[k];if(t)C.copy(t,'اتنسخ ✓')})};
C.pubStatus=P=>{const u=P&&P.pub;if(!u||!u.items||!u.items.length)return '';const n=Object.values(u.posted||{}).filter(Boolean).length;return n+'/'+u.items.length+' منصة اتنشر'};
})();
window.CORE.adv=(html,open)=>`<details ${open?'open':''} style="margin-top:8px;border:1px dashed var(--border);border-radius:10px;padding:4px 8px"><summary style="color:#94a3b8;font-size:13px;cursor:pointer">⚙️ متقدم</summary>${html}</details>`;
