(function(){
const K=window.KONFIG;
const W={};
W.$=s=>document.querySelector(s);
W.esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
W.LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
W.hash=s=>{let h=7;for(const ch of s)h=(h*31+ch.codePointAt(0))|0;return String(h)};
W.zahl=v=>Number(String(v==null?"":v).replace(",",".").trim());
W.fmt=(n,d=1)=>Number(n||0).toLocaleString("de-DE",{maximumFractionDigits:d});
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
W.iso=iso;
W.heute=()=>iso(new Date());
W.datumText=d=>{if(!d)return"";const x=new Date(d+"T12:00:00");return isNaN(x)?d:x.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"})};
W.datumLang=d=>{const x=new Date(d+"T12:00:00");return isNaN(x)?d:x.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})};
W.tageBis=d=>Math.round((new Date(d+"T12:00:00")-new Date(W.heute()+"T12:00:00"))/864e5);
W.neueId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const FARBEN=["#d9a520","#8c2f22","#2c6b45","#6b3a1e","#3d5a8a","#c9772b","#7a4a7f","#5f7f2c","#a3473f","#2f6f73"];

/* ---------- Daten ---------- */
W.normal=d=>{
  d=d&&typeof d==="object"?d:{};
  const r=d.regeln&&typeof d.regeln==="object"?d.regeln:{};
  const arr=x=>Array.isArray(x)?x:[];
  const e=d.einstellungen&&typeof d.einstellungen==="object"?d.einstellungen:{};
  return {regeln:{hausKopf:arr(r.hausKopf),hausRegeln:arr(r.hausRegeln),bierpongRegeln:arr(r.bierpongRegeln)},abende:arr(d.abende),spiele:arr(d.spiele),
    einstellungen:{zusagenUrl:String(e.zusagenUrl||"").trim()}};
};
W.apiUrl=()=>{const g=K.github;return `https://api.github.com/repos/${g.besitzer}/${g.repo}/contents/${g.datei}`};
W.ladeDaten=async function(){
  try{
    const r=await fetch(W.apiUrl()+"?ref="+encodeURIComponent(K.github.branch),{headers:{Accept:"application/vnd.github.raw+json"},cache:"no-store"});
    if(!r.ok)throw new Error("api "+r.status);
    return W.normal(await r.json());
  }catch(e){
    const r=await fetch(K.github.datei+"?t="+Date.now(),{cache:"no-store"});
    if(!r.ok)throw new Error("datei "+r.status);
    return W.normal(await r.json());
  }
};

/* ---------- Abende ---------- */
W.abendeSortiert=D=>[...D.abende].sort((a,b)=>String(b.datum||"").localeCompare(String(a.datum||"")));
W.hatGetraenke=a=>Array.isArray(a.getraenke)&&a.getraenke.length>0;
W.naechsterAbend=D=>{
  const h=W.heute();
  return [...D.abende].filter(a=>String(a.datum||"")>=h).sort((a,b)=>(a.datum+(a.uhrzeit||"")).localeCompare(b.datum+(b.uhrzeit||"")))[0]||null;
};
W.abendeIm=(D,z)=>{
  const a=W.abendeSortiert(D).filter(W.hatGetraenke);if(!a.length)return[];
  const d=new Date(),jahr=String(d.getFullYear()),monat=jahr+"-"+String(d.getMonth()+1).padStart(2,"0");
  if(z==="letztes")return[a[0]];
  if(z==="monat")return a.filter(x=>String(x.datum).startsWith(monat));
  if(z==="jahr")return a.filter(x=>String(x.datum).startsWith(jahr));
  return a;
};
W.getraenkeSumme=liste=>{
  const m=new Map();
  for(const ab of liste)for(const g of (Array.isArray(ab.getraenke)?ab.getraenke:[])){
    const name=String(g.name||"").trim();if(!name)continue;
    const an=Number(g.anzahl)||0,gr=Number(g.groesse)||0;
    const e=m.get(name)||{name,anzahl:0,liter:0};e.anzahl+=an;e.liter+=an*gr;m.set(name,e);
  }
  return [...m.values()].sort((a,b)=>b.liter-a.liter);
};
W.liter=ab=>W.getraenkeSumme([ab]).reduce((s,d)=>s+d.liter,0);
W.farbe=(D,name)=>{const alle=W.getraenkeSumme(D.abende).map(x=>x.name);const i=alle.indexOf(name);return FARBEN[(i<0?0:i)%FARBEN.length]};

/* ---------- Bierpong ---------- */
W.bpSpieleIm=(D,z)=>{
  let sp=[...D.spiele].sort((a,b)=>String(b.datum||"").localeCompare(String(a.datum||""))||(Number(b.zeit)||0)-(Number(a.zeit)||0));
  if(z==="letzter"&&sp.length){const d=sp[0].datum;sp=sp.filter(s=>s.datum===d)}
  return sp;
};
W.bpTabelle=spiele=>{
  const m=new Map();
  const p=n=>{const e=m.get(n)||{name:n,s:0,u:0,n:0,pk:0};m.set(n,e);return e};
  for(const s of spiele){
    const t1=(s.team1||[]).map(String),t2=(s.team2||[]).map(String);
    if(s.ergebnis==="u"){[...t1,...t2].forEach(n=>{const e=p(n);e.u++;e.pk+=.5})}
    else{const [w,l]=s.ergebnis==="2"?[t2,t1]:[t1,t2];w.forEach(n=>{const e=p(n);e.s++;e.pk+=1});l.forEach(n=>{p(n).n++})}
  }
  return [...m.values()].sort((a,b)=>b.pk-a.pk||b.s-a.s||a.name.localeCompare(b.name));
};
W.team=t=>(t||[]).map(W.esc).join(" &amp; ");
W.spielText=s=>s.ergebnis==="u"
  ?`${W.team(s.team1)} und ${W.team(s.team2)}: <span class="sieger">Unentschieden</span>`
  :`<span class="sieger">${W.team(s.ergebnis==="2"?s.team2:s.team1)}</span> schlägt ${W.team(s.ergebnis==="2"?s.team1:s.team2)}`;

/* ---------- Regeln ---------- */
W.istLaut=t=>/[A-ZÄÖÜ]/.test(t)&&t===t.toUpperCase();
W.regelListe=arr=>`<ul class="regeln">${arr.map(r=>`<li class="${W.istLaut(r)?"laut":""}">${W.esc(r)}</li>`).join("")}</ul>`;

/* ---------- Diagramme ---------- */
W.saeulen=(D,daten)=>{
  if(!daten.length)return"";
  const max=Math.max(...daten.map(d=>d.liter),0.0001);
  const bw=46,gap=26,lp=40,top=26,h=200,unten=58;
  const Wd=Math.max(320,lp+daten.length*(bw+gap)+10),H=top+h+unten;
  let s=`<svg width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Säulendiagramm: Liter pro Getränk">`;
  for(let i=0;i<=4;i++){const y=top+h-h*i/4;
    s+=`<line x1="${lp-4}" x2="${Wd}" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity=".15"/><text x="${lp-8}" y="${y+4}" text-anchor="end" font-size="11" fill="currentColor" fill-opacity=".7">${W.fmt(max*i/4)}</text>`}
  daten.forEach((d,i)=>{
    const x=lp+gap/2+i*(bw+gap),bh=Math.max(2,h*d.liter/max),y=top+h-bh;
    const kurz=d.name.length>11?d.name.slice(0,10)+"…":d.name;
    s+=`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="${W.farbe(D,d.name)}"/><text x="${x+bw/2}" y="${y-6}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${W.fmt(d.liter)}</text><text x="${x+bw/2}" y="${top+h+16}" text-anchor="end" font-size="12" fill="currentColor" transform="rotate(-30 ${x+bw/2} ${top+h+16})"><title>${W.esc(d.name)}</title>${W.esc(kurz)}</text>`;
  });
  return s+"</svg>";
};
W.balken=(D,daten)=>{
  if(!daten.length)return"";
  const sort=[...daten].sort((a,b)=>b.anzahl-a.anzahl);
  const max=Math.max(...sort.map(d=>d.anzahl),0.0001);
  const lw=104,rh=34,Wd=380,bw=Wd-lw-48,H=sort.length*rh+8;
  let s=`<svg class="voll" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Balkendiagramm: Stück pro Getränk">`;
  sort.forEach((d,i)=>{
    const y=4+i*rh,w=Math.max(2,bw*d.anzahl/max);
    const kurz=d.name.length>13?d.name.slice(0,12)+"…":d.name;
    s+=`<text x="${lw-10}" y="${y+rh/2+4}" text-anchor="end" font-size="13" fill="currentColor"><title>${W.esc(d.name)}</title>${W.esc(kurz)}</text><rect x="${lw}" y="${y+6}" width="${w}" height="${rh-12}" rx="3" fill="${W.farbe(D,d.name)}"/><text x="${lw+w+8}" y="${y+rh/2+4}" font-size="13" font-weight="700" fill="currentColor">${W.fmt(d.anzahl,0)}</text>`;
  });
  return s+"</svg>";
};

/* ---------- Handy-Kalender (.ics) ---------- */
W.icsHref=a=>{
  const p=n=>String(n).padStart(2,"0");
  const f=d=>`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const tx=s=>String(s||"").replace(/\\/g,"\\\\").replace(/[,;]/g,m=>"\\"+m).replace(/\n/g,"\\n");
  let zeit;
  if(a.uhrzeit){const st=new Date(a.datum+"T"+a.uhrzeit+":00");const en=new Date(st.getTime()+5*36e5);zeit=`DTSTART:${f(st)}\r\nDTEND:${f(en)}`}
  else{const st=new Date(a.datum+"T12:00:00");const en=new Date(st.getTime()+864e5);zeit=`DTSTART;VALUE=DATE:${iso(st).replace(/-/g,"")}\r\nDTEND;VALUE=DATE:${iso(en).replace(/-/g,"")}`}
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Metzgers Wirtshaus//DE","BEGIN:VEVENT",
    `UID:${a.id||W.neueId()}@metzgers-wirtshaus`,`DTSTAMP:${f(new Date())}`,zeit,
    `SUMMARY:${tx("Metzgers Wirtshaus Abend"+(a.titel?" – "+a.titel:""))}`,
    a.notiz?`DESCRIPTION:${tx(a.notiz)}`:"","END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n");
  return "data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);
};

/* ---------- Kleinkram ---------- */
let toastT;
W.toast=t=>{const e=W.$("#toast");if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,3600)};
/* ---------- Zusagen (Google-Tabelle) ---------- */
let zUrl=String(K.zusagenUrl||"").trim();
W.setzeZusagenUrl=u=>{zUrl=String(u||"").trim()};
W.zusagenAktiv=()=>!!zUrl;
W.normUrl=u=>String(u||"").trim().replace(/\/macros\/u\/\d+\/s\//,"/macros/s/");
W.testeZusagenUrl=async roh=>{
  const u=W.normUrl(roh);
  if(!u)return {ok:false,url:u,text:"Bitte zuerst die Web-App-URL einfügen."};
  if(/docs\.google\.com\/spreadsheets/.test(u))return {ok:false,url:u,text:"Das ist die Adresse der Tabelle selbst. Gebraucht wird die Web-App-URL aus Apps Script (Bereitstellen → Bereitstellungen verwalten). Sie endet auf /exec."};
  if(/script\.google\.com\/macros\/s\/[^/]+\/dev$/.test(u))return {ok:false,url:u,text:"Das ist die Test-Adresse (endet auf /dev). Du brauchst die Web-App-URL, die auf /exec endet."};
  if(/script\.google\.com\/(home|d)\//.test(u))return {ok:false,url:u,text:"Das ist die Adresse vom Apps-Script-Editor. Gebraucht wird die Web-App-URL: Bereitstellen → Bereitstellungen verwalten → Web-App-URL kopieren (endet auf /exec)."};
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(u))return {ok:false,url:u,text:"Die Adresse sieht falsch aus. Sie muss mit https://script.google.com/macros/s/ beginnen und auf /exec enden."};
  let t;
  try{const r=await fetch(u+"?t="+Date.now(),{cache:"no-store"});t=await r.text()}
  catch(e){return {ok:false,url:u,text:"Google lässt die App nicht zugreifen. Fast immer fehlt „Zugriff: Jeder“. In Apps Script: Bereitstellen → Bereitstellungen verwalten → ✏️ Bearbeiten → Zugriff „Jeder“, Version „Neue Version“ → Bereitstellen."}}
  let j;try{j=JSON.parse(t)}catch(e){return {ok:false,url:u,text:"Google antwortet mit einer Webseite statt mit Daten. Meist wurde der Code vor dem Bereitstellen nicht gespeichert oder „Zugriff: Jeder“ fehlt. Code speichern, dann neue Version bereitstellen."}}
  if(j&&j.ok&&Array.isArray(j.zusagen))return {ok:true,url:u,text:`Verbindung klappt! In der Tabelle stehen ${j.zusagen.length} Einträge.`};
  return {ok:false,url:u,text:"Google antwortet, aber nicht wie erwartet. Prüf, ob der komplette Code aus zusagen-apps-script.gs eingefügt und gespeichert ist."};
};
W.ladeZusagen=async()=>{
  if(!W.zusagenAktiv())return[];
  const r=await fetch(zUrl+(zUrl.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});
  const j=await r.json();
  if(!j||!j.ok)throw new Error("zusagen");
  return Array.isArray(j.zusagen)?j.zusagen:[];
};
W.sendeZusage=async(abend,name,status)=>{
  const r=await fetch(zUrl,{method:"POST",body:JSON.stringify({abend,name,status})});
  const j=await r.json();
  if(!j||!j.ok)throw new Error("zusage");
  return Array.isArray(j.zusagen)?j.zusagen:[];
};
const gleich=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
W.gleicherName=gleich;
W.leute=(Z,id,status)=>(Z||[]).filter(z=>z.abend===id&&z.status===status).map(z=>z.name).sort((a,b)=>a.localeCompare(b,"de"));
W.meinStatus=(Z,id,name)=>{const z=(Z||[]).find(z=>z.abend===id&&gleich(z.name,name));return z?z.status:null};
W.alleNamen=Z=>{const m=new Map();(Z||[]).forEach(z=>{const k=String(z.name).trim().toLowerCase();if(k&&!m.has(k))m.set(k,String(z.name).trim())});return [...m.values()].sort((a,b)=>a.localeCompare(b,"de"))};
W.namenText=arr=>arr.map(W.esc).join(", ");
W.REG="_angemeldet";
W.teile=t=>String(t||"").split(",").map(x=>x.trim().replace(/\s+/g," ")).filter(Boolean);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

window.W=W;
})();
