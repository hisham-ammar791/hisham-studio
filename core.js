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
