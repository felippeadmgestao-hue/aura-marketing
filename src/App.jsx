import { useState, useRef } from "react";

const T = {
  bg:"#F5F0E8", card:"#FFFFFF", dark:"#2C1F14", gold:"#C8A96E",
  mocha:"#8B7355", text:"#2C1F14", muted:"#9A8C7E", border:"#E8E0D0",
  green:"#4A7C59", red:"#8B3A3A", amber:"#C8853E",
};

const USERS = [
  { id:"felippe", name:"Felippe", role:"Admin", avatar:"F", password:"aura2024", color:"#C8A96E" },
  { id:"colab1", name:"Colaborador 1", role:"Editor", avatar:"C", password:"colab1", color:"#8B7355" },
  { id:"colab2", name:"Colaborador 2", role:"Editor", avatar:"C", password:"colab2", color:"#4A7C59" },
  { id:"colab3", name:"Colaborador 3", role:"Viewer", avatar:"C", password:"colab3", color:"#C8853E" },
];

const LS = {
  get:(k,d=[])=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } },
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;background:#E8E0D0;}
::-webkit-scrollbar-thumb{background:#8B735540;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
`;

const PILLARS = [
  { day:"Segunda", emoji:"✦", color:"#C8A96E", label:"INSPIRAÇÃO", concept:"Projeto em Destaque" },
  { day:"Quarta",  emoji:"◈", color:"#8B7355", label:"EDUCAÇÃO",   concept:"Dica de Valor" },
  { day:"Sexta",   emoji:"◉", color:"#2C1F14", label:"DESEJO",     concept:"Detalhe & Lifestyle" },
];

async function callClaude(msgs) {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-opus-4-5", max_tokens:2000, messages:msgs})
  });
  const d = await r.json();
  return d.content?.map(c=>c.text||"").join("") || "";
}

function toB64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const Card=({c,s={}})=><div style={{background:T.card,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(44,31,20,0.07)",animation:"fadeUp 0.3s ease both",...s}}>{c}</div>;
const Lbl=({c,s={}})=><div style={{fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:T.muted,fontWeight:600,marginBottom:6,...s}}>{c}</div>;
const H1=({c,s={}})=><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500,color:T.text,lineHeight:1.3,...s}}>{c}</div>;
const Spinner=()=><div style={{width:16,height:16,border:"2px solid #E8E0D0",borderTop:"2px solid #8B7355",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>;

function Btn({ch,onClick,disabled,s={},v="primary"}) {
  const vs={primary:{background:T.dark,color:T.bg},gold:{background:T.gold,color:T.dark},outline:{background:"transparent",color:T.mocha,border:"1.5px solid #8B7355"}};
  return <button onClick={onClick} disabled={disabled} style={{border:"none",borderRadius:10,padding:"12px 18px",cursor:disabled?"not-allowed":"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",opacity:disabled?0.5:1,transition:"all 0.2s",display:"inline-flex",alignItems:"center",gap:8,...vs[v],...s}}>{ch}</button>;
}

function Inp({val,set,ph,type="text"}) {
  return <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",border:"1.5px solid #E8E0D0",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:T.text,background:T.bg,outline:"none",marginBottom:10}}/>;
}

function TA({val,set,ph,rows=4}) {
  return <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} style={{width:"100%",border:"1.5px solid #E8E0D0",borderRadius:10,padding:"12px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:T.text,background:T.bg,resize:"vertical",outline:"none",lineHeight:1.7,marginBottom:10}}/>;
}

function CopyBox({text}) {
  const [ok,setOk]=useState(false);
  return (
    <div style={{background:T.bg,border:"1.5px solid #E8E0D0",borderRadius:12,padding:16,marginTop:12}}>
      <pre style={{whiteSpace:"pre-wrap",fontSize:13,color:T.text,lineHeight:1.8,fontFamily:"'DM Sans',sans-serif",margin:0}}>{text}</pre>
      <Btn ch={ok?"✓ Copiado!":"◈ Copiar"} v="outline" s={{marginTop:10,fontSize:11}} onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}/>
    </div>
  );
}

function Ring({score,size=56}) {
  const c=score>=75?T.green:score>=50?T.amber:T.red;
  const r=size/2-4,circ=2*Math.PI*r;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={4} strokeDasharray={`${(score/100)*circ} 999`} strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.22,fontWeight:700,color:c}}>{score}</div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [sel,setSel]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{css}</style>
      <div style={{background:T.dark,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:360,textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:T.bg,letterSpacing:"0.15em",marginBottom:4}}>AURA</div>
        <div style={{fontSize:10,color:T.gold,letterSpacing:"0.4em"}}>MARKETING PRO</div>
      </div>
      <div style={{width:"100%",maxWidth:360}}>
        <Lbl c="Selecione seu perfil" s={{marginBottom:10}}/>
        {USERS.map(u=>(
          <div key={u.id} onClick={()=>{setSel(u);setPw("");setErr("");}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:T.card,borderRadius:12,cursor:"pointer",border:`2px solid ${sel?.id===u.id?u.color:T.border}`,transition:"all 0.2s",marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`${u.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:u.color}}>{u.avatar}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>{u.name}</div><div style={{fontSize:11,color:T.muted}}>{u.role}</div></div>
            {sel?.id===u.id&&<div style={{marginLeft:"auto",color:u.color,fontSize:18}}>✓</div>}
          </div>
        ))}
        {sel&&(
          <div style={{marginTop:8}}>
            <Lbl c="Senha"/>
            <Inp val={pw} set={setPw} ph="Digite sua senha" type="password"/>
            {err&&<div style={{fontSize:12,color:T.red,marginBottom:8,textAlign:"center"}}>{err}</div>}
            <Btn ch="Entrar →" s={{width:"100%",justifyContent:"center"}} onClick={()=>{
              if(pw===sel.password){LS.set("session",sel);onLogin(sel);}
              else{setErr("Senha incorreta.");setTimeout(()=>setErr(""),2000);}
            }}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INICIO ───────────────────────────────────────────────────────────────────
function Inicio({user,nav}) {
  const reports=LS.get("reports",[]);
  const analyses=LS.get("analyses",[]);
  const grid=LS.get("grid",[]);
  const today=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
  return (
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{background:T.dark,borderRadius:20,padding:"24px 20px",marginBottom:16}}>
        <Lbl c="BEM-VINDO DE VOLTA" s={{color:T.gold,marginBottom:6}}/>
        <H1 c={`Olá, ${user.name}! 👋`} s={{color:T.bg,fontSize:24,marginBottom:2}}/>
        <div style={{fontSize:12,color:"rgba(245,240,232,0.6)",marginTop:6,textTransform:"capitalize"}}>{today}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {label:"Relatórios",value:reports.length,color:T.gold,screen:"relatorio"},
          {label:"Análises feitas",value:analyses.length,color:T.mocha,screen:"imagem"},
          {label:"Posts no grid",value:grid.length,color:T.green,screen:"grid"},
          {label:"Publicados",value:grid.filter(p=>p.status==="posted").length,color:T.amber,screen:"grid"},
        ].map((m,i)=>(
          <div key={i} onClick={()=>nav(m.screen)} style={{background:T.card,borderRadius:16,padding:16,boxShadow:"0 2px 12px rgba(44,31,20,0.07)",cursor:"pointer"}}>
            <Lbl c={m.label}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,color:m.color,lineHeight:1}}>{m.value}</div>
          </div>
        ))}
      </div>
      <Card c={
        <div>
          <Lbl c="Ações Rápidas" s={{marginBottom:12}}/>
          {[
            {icon:"◉",label:"Analisar imagem antes de postar",screen:"imagem",color:T.gold},
            {icon:"✎",label:"Gerar legenda com IA",screen:"gerador",color:T.mocha},
            {icon:"⊟",label:"Planejar grid da semana",screen:"grid",color:T.green},
            {icon:"✦",label:"Criar relatório semanal",screen:"relatorio",color:T.dark},
          ].map((a,i)=>(
            <div key={i} onClick={()=>nav(a.screen)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<3?`1px solid ${T.border}`:"none",cursor:"pointer"}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:a.color,flexShrink:0}}>{a.icon}</div>
              <div style={{fontSize:13,color:T.text,fontWeight:500}}>{a.label}</div>
              <div style={{marginLeft:"auto",color:T.muted}}>›</div>
            </div>
          ))}
        </div>
      }/>
    </div>
  );
}

// ─── GRID ─────────────────────────────────────────────────────────────────────
function Grid() {
  const [posts,setPosts]=useState(()=>LS.get("grid",[]));
  const [modal,setModal]=useState(false);
  const [wpp,setWpp]=useState(()=>LS.get("wpp",""));
  const [form,setForm]=useState({title:"",pillar:"Inspiração",day:"Segunda",caption:"",status:"planned"});
  const save=p=>{setPosts(p);LS.set("grid",p);};
  const add=()=>{save([...posts,{...form,id:Date.now()}]);setModal(false);setForm({title:"",pillar:"Inspiração",day:"Segunda",caption:"",status:"planned"});};
  const del=id=>save(posts.filter(p=>p.id!==id));
  const toggle=id=>save(posts.map(p=>p.id===id?{...p,status:p.status==="posted"?"planned":"posted"}:p));
  const pc={"Inspiração":T.gold,"Educação":T.mocha,"Desejo":T.dark};
  const sc={planned:T.muted,scheduled:T.amber,posted:T.green};
  const sl={planned:"Planejado",scheduled:"Agendado",posted:"Publicado"};
  return (
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <H1 c="Grid Planner"/>
        <Btn ch="+ Post" v="gold" s={{padding:"8px 14px",fontSize:12}} onClick={()=>setModal(true)}/>
      </div>
      <Card c={<><Lbl c="📱 WhatsApp para lembretes" s={{marginBottom:6}}/><Inp val={wpp} set={v=>{setWpp(v);LS.set("wpp",v);}} ph="DDD + número · Ex: 11999998888"/></>} s={{marginBottom:12,padding:14}}/>
      {posts.length===0?<Card c={<div style={{textAlign:"center",padding:20}}><div style={{fontSize:32,marginBottom:8}}>⊟</div><div style={{fontSize:14,color:T.muted}}>Nenhum post ainda.</div></div>}/>:
        [...posts].reverse().map(p=>(
          <Card key={p.id} s={{marginBottom:10,padding:14}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,borderRadius:10,flexShrink:0,background:`${pc[p.pillar]||T.mocha}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:pc[p.pillar]||T.mocha}}>
                {PILLARS.find(x=>x.label===p.pillar?.toUpperCase())?.emoji||"◈"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,fontWeight:700,color:pc[p.pillar]||T.mocha,letterSpacing:"0.1em",marginBottom:2}}>{p.pillar?.toUpperCase()} · {p.day}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title||"Sem título"}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:sc[p.status]}}/><span style={{fontSize:10,color:sc[p.status]}}>{sl[p.status]}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>{const n=wpp.replace(/\D/g,"");if(!n){alert("Configure o WhatsApp!");return;}window.open(`https://wa.me/55${n}?text=${encodeURIComponent(`🗓️ Post: ${p.pillar}\n📌 ${p.title}\n\n${p.caption}`)}`)}} style={{background:"rgba(74,124,89,0.15)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:14}}>📱</button>
                <button onClick={()=>toggle(p.id)} style={{background:"rgba(200,169,110,0.15)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:11,color:T.mocha,fontWeight:600}}>{p.status==="posted"?"↩":"✓"}</button>
                <button onClick={()=>del(p.id)} style={{background:"rgba(139,58,58,0.1)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:11,color:T.red}}>✕</button>
              </div>
            </div>
          </Card>
        ))
      }
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div style={{background:T.card,borderRadius:"20px 20px 0 0",padding:"24px 20px",width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <H1 c="Novo Post" s={{fontSize:18}}/><button onClick={()=>setModal(false)} style={{background:"none",border:"none",fontSize:22,color:T.muted,cursor:"pointer"}}>✕</button>
            </div>
            <Lbl c="Pilar"/><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
              {["Inspiração","Educação","Desejo"].map(pl=><button key={pl} onClick={()=>setForm(f=>({...f,pillar:pl}))} style={{padding:"9px 4px",border:`1.5px solid ${form.pillar===pl?pc[pl]:T.border}`,borderRadius:10,background:form.pillar===pl?`${pc[pl]}15`:"transparent",color:form.pillar===pl?pc[pl]:T.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{pl}</button>)}
            </div>
            <Lbl c="Dia"/>
            <select value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))} style={{width:"100%",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:T.text,background:T.bg,outline:"none",marginBottom:10}}>
              {["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"].map(d=><option key={d}>{d}</option>)}
            </select>
            <Lbl c="Título"/><Inp val={form.title} set={v=>setForm(f=>({...f,title:v}))} ph="Ex: Projeto Residencial SP"/>
            <Lbl c="Legenda"/><TA val={form.caption} set={v=>setForm(f=>({...f,caption:v}))} ph="Cole a legenda..." rows={3}/>
            <Lbl c="Status"/><div style={{display:"flex",gap:8,marginBottom:16}}>
              {["planned","scheduled","posted"].map(s=><button key={s} onClick={()=>setForm(f=>({...f,status:s}))} style={{flex:1,padding:"8px 4px",border:`1.5px solid ${form.status===s?sc[s]:T.border}`,borderRadius:10,background:form.status===s?`${sc[s]}15`:"transparent",color:form.status===s?sc[s]:T.muted,fontSize:10,fontWeight:600,cursor:"pointer"}}>{sl[s]}</button>)}
            </div>
            <Btn ch="Salvar Post" s={{width:"100%",justifyContent:"center"}} onClick={add}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANÁLISE ──────────────────────────────────────────────────────────────────
function Analise() {
  const [img,setImg]=useState(null);
  const [b64,setB64]=useState(null);
  const [ctx,setCtx]=useState("");
  const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState(()=>LS.get("analyses",[]));
  const [showHistory,setShowHistory]=useState(false);
  const ref=useRef();

  const handleFile=async f=>{if(!f)return;setB64(await toB64(f));setImg(URL.createObjectURL(f));setRes(null);};

  const analyze=async()=>{
    setLoading(true);setRes(null);
    const mt=b64?.startsWith("/9j/")?"image/jpeg":"image/png";
    const prompt=`Especialista em marketing visual para arquitetura premium. Analise esta imagem para o Instagram do Aura Studio Arquitetura. Contexto: ${ctx||"não informado"}. Retorne SOMENTE JSON válido: {"nota_estetica":80,"nota_marca":75,"nota_engajamento":70,"nota_geral":75,"pontos_fortes":["f1","f2","f3"],"pontos_melhoria":["m1","m2"],"tipo_post_ideal":"Inspiração","dia_ideal":"Segunda","legenda_sugerida":"legenda completa aqui com CTA","hashtags":"#arquitetura #interiores #design #aurastudio #decoracao","aprovado":true,"veredicto":"frase do veredicto"}`;
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-opus-4-5",max_tokens:2000,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:b64}},{type:"text",text:prompt}]}]})});
      const d=await r.json();
      const text=d.content?.map(c=>c.text||"").join("")||"";
      const s=text.indexOf("{"),e=text.lastIndexOf("}");
      const parsed=JSON.parse(text.substring(s,e+1));
      const newHistory=[{...parsed,date:new Date().toISOString(),contexto:ctx},...history].slice(0,50);
      setHistory(newHistory);
      LS.set("analyses",newHistory);
      setRes(parsed);
    }catch(err){setRes({error:"Erro: "+err.message});}
    setLoading(false);
  };

  if(showHistory) return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <button onClick={()=>setShowHistory(false)} style={{background:"none",border:"none",color:T.mocha,cursor:"pointer",fontSize:15,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>‹ Voltar</button>
      <H1 c="Histórico de Análises" s={{marginBottom:16}}/>
      {history.length===0?<Card c={<div style={{textAlign:"center",padding:20,color:T.muted}}>Nenhuma análise ainda.</div>}/>:
        history.map((a,i)=>(
          <Card key={i} s={{marginBottom:10,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Ring score={a.nota_geral||0} size={52}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:a.aprovado?T.green:T.red,marginBottom:3}}>{a.aprovado?"✓ Aprovada":"✗ Ajustes necessários"}</div>
                <div style={{fontSize:12,color:T.text,marginBottom:2}}>{a.veredicto}</div>
                <div style={{fontSize:10,color:T.muted}}>{new Date(a.date).toLocaleDateString("pt-BR")} · {a.tipo_post_ideal} · {a.dia_ideal}</div>
              </div>
            </div>
            {a.legenda_sugerida&&<CopyBox text={a.legenda_sugerida+"\n\n"+a.hashtags}/>}
          </Card>
        ))
      }
    </div>
  );

  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <H1 c="Análise de Imagem"/>
        {history.length>0&&<button onClick={()=>setShowHistory(true)} style={{background:T.gold,color:T.dark,border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>📋 Histórico ({history.length})</button>}
      </div>
      <div style={{fontSize:13,color:T.muted,marginBottom:16}}>Envie a foto antes de postar</div>
      <Card s={{marginBottom:12}}>
        <div onClick={()=>ref.current?.click()} style={{border:`2px dashed ${img?T.gold:T.border}`,borderRadius:12,padding:"24px 16px",textAlign:"center",cursor:"pointer",background:img?"rgba(200,169,110,0.06)":T.bg,marginBottom:img?12:0}}>
          {img?<img src={img} alt="" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,objectFit:"cover"}}/>:
            <><div style={{fontSize:32,marginBottom:8,color:T.gold}}>◉</div><div style={{fontSize:13,color:T.mocha,fontWeight:600}}>Toque para selecionar imagem</div></>}
        </div>
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        {img&&<>
          <Lbl c="Contexto (opcional)" s={{marginTop:12}}/><TA val={ctx} set={setCtx} ph="Projeto residencial, São Paulo..." rows={2}/>
          <Btn ch={loading?<><Spinner/>Analisando...</>:"◉ Analisar com IA"} disabled={loading} s={{width:"100%",justifyContent:"center"}} onClick={analyze}/>
        </>}
      </Card>

      {res&&!res.error&&<>
        <Card s={{background:res.aprovado?"rgba(74,124,89,0.12)":"rgba(139,58,58,0.12)",border:`1.5px solid ${res.aprovado?"rgba(74,124,89,0.35)":"rgba(139,58,58,0.35)"}`,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>{res.aprovado?"✓":"✗"}</div>
            <div><div style={{fontSize:12,fontWeight:700,color:res.aprovado?T.green:T.red,textTransform:"uppercase",letterSpacing:"0.1em"}}>{res.aprovado?"Aprovada para postagem":"Recomendamos ajustes"}</div><div style={{fontSize:13,color:T.text,marginTop:2}}>{res.veredicto}</div></div>
          </div>
        </Card>
        <Card s={{marginBottom:12}}>
          <Lbl c="Avaliação por Critério" s={{marginBottom:14}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[["Estética",res.nota_estetica],["Marca",res.nota_marca],["Engajamento",res.nota_engajamento],["Geral",res.nota_geral]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}><Ring score={v} size={60}/><div style={{fontSize:11,color:T.muted,marginTop:6}}>{l}</div></div>
            ))}
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <Card s={{padding:14}}><Lbl c="✓ Fortes" s={{color:T.green,marginBottom:8}}/>{res.pontos_fortes?.map((p,i)=><div key={i} style={{fontSize:12,color:T.text,marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:`2px solid ${T.green}`}}>{p}</div>)}</Card>
          <Card s={{padding:14}}><Lbl c="⚠ Melhorar" s={{color:T.amber,marginBottom:8}}/>{res.pontos_melhoria?.map((p,i)=><div key={i} style={{fontSize:12,color:T.text,marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:`2px solid ${T.amber}`}}>{p}</div>)}</Card>
        </div>
        <Card s={{marginBottom:12}}>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[["TIPO",res.tipo_post_ideal,T.gold],["DIA",res.dia_ideal,T.dark]].map(([l,v,c])=>(
              <div key={l} style={{flex:1,background:`${c}12`,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:T.muted,marginBottom:4}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <Lbl c="Legenda Sugerida" s={{marginBottom:6}}/>
          <CopyBox text={res.legenda_sugerida+"\n\n"+res.hashtags}/>
        </Card>
      </>}
      {res?.error&&<Card s={{background:"rgba(139,58,58,0.12)"}}><div style={{fontSize:13,color:T.red}}>{res.error}</div></Card>}
    </div>
  );
}

// ─── RELATÓRIO ────────────────────────────────────────────────────────────────
function Relatorio() {
  const [reports,setReports]=useState(()=>LS.get("reports",[]));
  const [view,setView]=useState("list"); // list | new | detail
  const [selected,setSelected]=useState(null);
  const [step,setStep]=useState(0); // 0=choose, 1=form, 2=result
  const [form,setForm]=useState({semana:"",seguidores:"",novos:"",alcance:"",curtidas:"",comentarios:"",salvamentos:"",posts_semana:"",melhor_post:"",notas:""});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  const saveReport=r=>{const n=[r,...reports].slice(0,20);setReports(n);LS.set("reports",n);};
  const delReport=id=>{const n=reports.filter(r=>r.id!==id);setReports(n);LS.set("reports",n);};

  const generate=async()=>{
    setLoading(true);
    const prompt=`Analise dados do Instagram Aura Studio Arquitetura: ${JSON.stringify(form)}. SOMENTE JSON: {"resumo_executivo":"texto","taxa_engajamento":"X%","nota_semana":75,"destaques":["d1","d2","d3"],"alertas":[],"top_metricas":[{"label":"Alcance","valor":"0","tendencia":"stable"}],"acoes_proxima_semana":["a1","a2","a3"],"sugestao_conteudo":["Segunda: tema","Quarta: tema","Sexta: tema"],"insight_principal":"texto"}`;
    try{
      const text=await callClaude([{role:"user",content:prompt}]);
      const s=text.indexOf("{"),e=text.lastIndexOf("}");
      const parsed=JSON.parse(text.substring(s,e+1));
      const full={...parsed,id:Date.now(),date:new Date().toISOString(),semana:form.semana||new Date().toLocaleDateString("pt-BR")};
      saveReport(full);setResult(full);setStep(2);
    }catch(err){setResult({error:"Erro: "+err.message});setStep(2);}
    setLoading(false);
  };

  const tc=t=>t==="up"?T.green:t==="down"?T.red:T.muted;
  const ti=t=>t==="up"?"↑":t==="down"?"↓":"→";

  if(view==="list") return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <H1 c="Relatórios"/>
        <Btn ch="+ Novo" v="gold" s={{padding:"8px 14px",fontSize:12}} onClick={()=>{setView("new");setStep(0);setResult(null);setForm({semana:"",seguidores:"",novos:"",alcance:"",curtidas:"",comentarios:"",salvamentos:"",posts_semana:"",melhor_post:"",notas:""});}}/>
      </div>
      {reports.length===0?
        <Card c={<div style={{textAlign:"center",padding:30}}><div style={{fontSize:32,marginBottom:8}}>✦</div><div style={{fontSize:14,color:T.muted}}>Nenhum relatório ainda.</div></div>}/>:
        reports.map(r=>(
          <Card key={r.id} s={{marginBottom:10,padding:14,cursor:"pointer"}} c={
            <div style={{display:"flex",alignItems:"center",gap:12}} onClick={()=>{setSelected(r);setView("detail");}}>
              <Ring score={r.nota_semana||0} size={52}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>Semana: {r.semana}</div>
                <div style={{fontSize:11,color:T.muted,marginBottom:3}}>{new Date(r.date).toLocaleDateString("pt-BR")}</div>
                <div style={{fontSize:12,color:T.mocha,fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{r.insight_principal}"</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
                <button onClick={e=>{e.stopPropagation();delReport(r.id);}} style={{background:"rgba(139,58,58,0.1)",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:T.red}}>✕</button>
                <span style={{color:T.muted,fontSize:18}}>›</span>
              </div>
            </div>
          }/>
        ))
      }
    </div>
  );

  if(view==="detail"&&selected) return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:T.mocha,cursor:"pointer",fontSize:15,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>‹ Voltar</button>
      <Card s={{background:T.dark,marginBottom:12}} c={<>
        <Lbl c="Relatório · Aura Studio" s={{color:T.gold}}/>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.bg,margin:"8px 0",lineHeight:1.5,fontStyle:"italic"}}>"{selected.insight_principal}"</div>
        <div style={{display:"flex",gap:24,marginTop:12}}>
          <div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>NOTA</div><div style={{fontSize:28,fontWeight:700,color:T.gold}}>{selected.nota_semana}<span style={{fontSize:14}}>/100</span></div></div>
          <div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>ENGAJAMENTO</div><div style={{fontSize:28,fontWeight:700,color:T.bg}}>{selected.taxa_engajamento}</div></div>
        </div>
      </>}/>
      <Card s={{marginBottom:12}} c={<><Lbl c="Resumo Executivo" s={{marginBottom:8}}/><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{selected.resumo_executivo}</div></>}/>
      {selected.top_metricas?.length>0&&<Card s={{marginBottom:12}} c={<>
        <Lbl c="Métricas" s={{marginBottom:12}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {selected.top_metricas.map((m,i)=>(
            <div key={i} style={{background:T.bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:16,fontWeight:700,color:T.text}}>{m.valor}</div>
              <div style={{fontSize:14,color:tc(m.tendencia),fontWeight:700}}>{ti(m.tendencia)}</div>
            </div>
          ))}
        </div>
      </>}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Card s={{padding:14}} c={<><Lbl c="✓ Destaques" s={{color:T.green,marginBottom:8}}/>{selected.destaques?.map((d,i)=><div key={i} style={{fontSize:12,color:T.text,marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:`2px solid ${T.green}`}}>{d}</div>)}</>}/>
        {selected.alertas?.length>0&&<Card s={{padding:14}} c={<><Lbl c="⚠ Alertas" s={{color:T.amber,marginBottom:8}}/>{selected.alertas.map((a,i)=><div key={i} style={{fontSize:12,color:T.text,marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:`2px solid ${T.amber}`}}>{a}</div>)}</>}/>}
      </div>
      <Card s={{marginBottom:12}} c={<><Lbl c="Plano Próxima Semana" s={{marginBottom:10}}/>
        {selected.acoes_proxima_semana?.map((a,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:13,color:T.text}}><span style={{color:T.gold,fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>{a}</div>)}
      </>}/>
      <Card c={<><Lbl c="Sugestão de Conteúdo" s={{marginBottom:10}}/>
        {selected.sugestao_conteudo?.map((s,i)=><div key={i} style={{background:`${[T.gold,T.mocha,T.dark][i]||T.muted}12`,borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:13,color:T.text}}>{s}</div>)}
      </>}/>
    </div>
  );

  // NEW
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:T.mocha,cursor:"pointer",fontSize:15,marginBottom:14,display:"flex",alignItems:"center",gap:6}}>‹ Relatórios</button>
      <H1 c="Novo Relatório" s={{marginBottom:16}}/>

      {step===0&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:T.card,borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(44,31,20,0.07)",cursor:"pointer",border:`2px solid ${T.border}`}} onClick={()=>setStep(1)}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"rgba(200,169,110,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:T.gold,flexShrink:0}}>✎</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:600,color:T.text,marginBottom:4}}>Inserir manualmente</div>
                <div style={{fontSize:13,color:T.muted}}>Digite os números do Instagram Insights</div>
              </div>
              <div style={{fontSize:24,color:T.muted}}>›</div>
            </div>
          </div>
        </div>
      )}

      {step===1&&(
        <Card c={<>
          <Lbl c="Dados da Semana" s={{marginBottom:12}}/>
          {[["semana","Período","Ex: 26/05 a 01/06"],["seguidores","Total de seguidores","Ex: 1.240"],["novos","Novos seguidores","Ex: +12"],["alcance","Alcance total","Ex: 3.400"],["curtidas","Curtidas","Ex: 87"],["comentarios","Comentários","Ex: 14"],["salvamentos","Salvamentos","Ex: 42"],["posts_semana","Posts publicados","Ex: 3"],["melhor_post","Melhor post","Ex: Projeto SP"]].map(([k,l,p])=>(
            <div key={k}><Lbl c={l}/><Inp val={form[k]} set={v=>setForm(f=>({...f,[k]:v}))} ph={p}/></div>
          ))}
          <Lbl c="Observações"/><TA val={form.notas} set={v=>setForm(f=>({...f,notas:v}))} ph="Campanhas, Reels virais..." rows={2}/>
          <Btn ch={loading?<><Spinner/>Gerando relatório...</>:"✦ Gerar Relatório com IA"} disabled={loading||!form.seguidores} s={{width:"100%",justifyContent:"center"}} onClick={generate}/>
        </>}/>
      )}

      {step===2&&result&&!result.error&&(
        <>
          <Card s={{background:T.dark,marginBottom:12}} c={<>
            <Lbl c="Relatório Gerado ✓" s={{color:T.gold}}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.bg,margin:"8px 0",lineHeight:1.5,fontStyle:"italic"}}>"{result.insight_principal}"</div>
            <div style={{display:"flex",gap:24,marginTop:12}}>
              <div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>NOTA</div><div style={{fontSize:28,fontWeight:700,color:T.gold}}>{result.nota_semana}<span style={{fontSize:14}}>/100</span></div></div>
              <div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>ENGAJAMENTO</div><div style={{fontSize:28,fontWeight:700,color:T.bg}}>{result.taxa_engajamento}</div></div>
            </div>
          </>}/>
          <Card s={{marginBottom:12}} c={<><Lbl c="Resumo Executivo" s={{marginBottom:8}}/><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{result.resumo_executivo}</div></>}/>
          <Card s={{marginBottom:12}} c={<><Lbl c="Plano Próxima Semana" s={{marginBottom:10}}/>{result.acoes_proxima_semana?.map((a,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:13,color:T.text}}><span style={{color:T.gold,fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>{a}</div>)}</>}/>
          <Card c={<><Lbl c="Sugestão de Conteúdo" s={{marginBottom:10}}/>{result.sugestao_conteudo?.map((s,i)=><div key={i} style={{background:`${[T.gold,T.mocha,T.dark][i]||T.muted}12`,borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:13,color:T.text}}>{s}</div>)}</>}/>
          <Btn ch="← Ver todos os relatórios" v="outline" s={{marginTop:16,width:"100%",justifyContent:"center"}} onClick={()=>{setView("list");setStep(0);setResult(null);}}/>
        </>
      )}
      {step===2&&result?.error&&<Card s={{background:"rgba(139,58,58,0.12)"}} c={<div style={{fontSize:13,color:T.red}}>{result.error}</div>}/>}
    </div>
  );
}

// ─── GERADOR ──────────────────────────────────────────────────────────────────
function Gerador() {
  const [pillar,setPillar]=useState(0);
  const [brief,setBrief]=useState("");
  const [res,setRes]=useState("");
  const [loading,setLoading]=useState(false);
  const gen=async()=>{
    if(!brief.trim())return;
    setLoading(true);setRes("");
    const p=PILLARS[pillar];
    try{const text=await callClaude([{role:"user",content:`Especialista em marketing para arquitetura premium. Legenda para Instagram do Aura Studio Arquitetura. TIPO: ${p.label} (${p.day}-feira). BRIEFING: ${brief}. Tom sofisticado, emojis com moderação, máx 8 linhas, CTA claro, 5 hashtags. APENAS a legenda pronta.`}]);setRes(text);}
    catch(e){setRes("Erro ao gerar.");}
    setLoading(false);
  };
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <H1 c="Gerador de Legendas" s={{marginBottom:4}}/>
      <div style={{fontSize:13,color:T.muted,marginBottom:16}}>IA especializada em arquitetura</div>
      <Card s={{marginBottom:12}} c={<>
        <Lbl c="Tipo de Post" s={{marginBottom:10}}/>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {PILLARS.map((p,i)=>(
            <div key={i} onClick={()=>setPillar(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${pillar===i?p.color:T.border}`,background:pillar===i?`${p.color}12`:"transparent",transition:"all 0.2s"}}>
              <span style={{fontSize:18,color:p.color}}>{p.emoji}</span>
              <div><div style={{fontSize:12,fontWeight:700,color:p.color,letterSpacing:"0.1em"}}>{p.day} · {p.label}</div><div style={{fontSize:11,color:T.muted}}>{p.concept}</div></div>
              {pillar===i&&<div style={{marginLeft:"auto",color:p.color}}>✓</div>}
            </div>
          ))}
        </div>
        <Lbl c="Briefing do Post"/>
        <TA val={brief} set={setBrief} ph="Descreva o projeto, ambiente, materiais, localização..." rows={4}/>
        <Btn ch={loading?<><Spinner/>Gerando...</>:"✎ Gerar Legenda com IA"} disabled={loading||!brief.trim()} s={{width:"100%",justifyContent:"center"}} onClick={gen}/>
      </>}/>
      {res&&<Card c={<><Lbl c="Legenda Gerada" s={{marginBottom:8}}/><CopyBox text={res}/></>}/>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const NAV=[{id:"inicio",icon:"⊞",label:"Início"},{id:"grid",icon:"⊟",label:"Grid"},{id:"imagem",icon:"◉",label:"Análise"},{id:"relatorio",icon:"✦",label:"Relatório"},{id:"gerador",icon:"✎",label:"Legendas"}];

export default function App() {
  const [user,setUser]=useState(()=>LS.get("session",null));
  const [screen,setScreen]=useState("inicio");
  const login=u=>{setUser(u);LS.set("session",u);};
  const logout=()=>{setUser(null);LS.set("session",null);setScreen("inicio");};
  if(!user) return <><style>{css}</style><Login onLogin={login}/></>;
  const screens={inicio:<Inicio user={user} nav={setScreen}/>,grid:<Grid/>,imagem:<Analise/>,relatorio:<Relatorio/>,gerador:<Gerador/>};
  return(
    <div style={{maxWidth:480,margin:"0 auto",background:T.bg,minHeight:"100vh",position:"relative"}}>
      <style>{css}</style>
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 8px rgba(44,31,20,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:T.dark,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:T.gold,fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>A</span>
          </div>
          <div><div style={{fontSize:13,fontWeight:700,color:T.text,lineHeight:1}}>AURA</div><div style={{fontSize:9,color:T.muted,letterSpacing:"0.2em"}}>MARKETING PRO</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`${user.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:user.color,border:`1.5px solid ${user.color}40`}}>{user.avatar}</div>
          <div style={{fontSize:12,color:T.text,fontWeight:600}}>{user.name}</div>
          <button onClick={logout} style={{background:"none",border:"none",fontSize:11,color:T.muted,cursor:"pointer",padding:"4px 8px"}}>Sair</button>
        </div>
      </div>
      <div key={screen}>{screens[screen]}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",padding:"8px 0 16px",zIndex:20,boxShadow:"0 -2px 12px rgba(44,31,20,0.06)"}}>
        {NAV.map(n=>{
          const active=screen===n.id;
          return(
            <button key={n.id} onClick={()=>setScreen(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
              <span style={{fontSize:19,color:active?T.dark:T.muted,transition:"color 0.2s"}}>{n.icon}</span>
              <span style={{fontSize:9,letterSpacing:"0.05em",color:active?T.dark:T.muted,fontWeight:active?700:400,fontFamily:"'DM Sans',sans-serif",transition:"color 0.2s"}}>{n.label.toUpperCase()}</span>
              {active&&<div style={{width:4,height:4,borderRadius:"50%",background:T.gold,marginTop:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
