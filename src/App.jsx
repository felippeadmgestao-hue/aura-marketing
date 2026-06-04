import { useState, useRef, useEffect } from "react";

const T = {
  bg:"#F5F0E8", card:"#FFFFFF", dark:"#2C1F14", gold:"#C8A96E",
  mocha:"#8B7355", text:"#2C1F14", muted:"#9A8C7E", border:"#E8E0D0",
  green:"#4A7C59", red:"#8B3A3A", amber:"#C8853E",
};

const USERS = [
  { id:"felippe", name:"Felippe", role:"Admin", avatar:"F", password:"aura2024", color:"#C8A96E" },
  { id:"colab1",  name:"Colaborador 1", role:"Editor", avatar:"C", password:"colab1", color:"#8B7355" },
  { id:"colab2",  name:"Colaborador 2", role:"Editor", avatar:"C", password:"colab2", color:"#4A7C59" },
  { id:"colab3",  name:"Colaborador 3", role:"Viewer", avatar:"C", password:"colab3", color:"#C8853E" },
];

const store = {
  get:(k,def=null)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch{return def;} },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;background:#E8E0D0;}
::-webkit-scrollbar-thumb{background:#8B735540;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
`;

const PILLARS = [
  { day:"Segunda", emoji:"✦", color:"#C8A96E", label:"INSPIRAÇÃO", concept:"Projeto em Destaque",
    tags:"#arquitetura #interiores #projetoarquitetonico #aurastudio #designdeinteriores" },
  { day:"Quarta",  emoji:"◈", color:"#8B7355", label:"EDUCAÇÃO",   concept:"Dica de Valor",
    tags:"#dicasdearquitetura #tendencias2026 #decoracao #interioresbrasileiros" },
  { day:"Sexta",   emoji:"◉", color:"#2C1F14", label:"DESEJO",     concept:"Detalhe & Lifestyle",
    tags:"#detalhesquefazemadiferença #luxodosdetalhes #arquiteturadeinteriores" },
];

async function callClaude(messages) {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:1000, messages})
  });
  const d = await r.json();
  return d.content?.map(c=>c.text||"").join("") || "";
}

function fileToB64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=()=>rej(new Error("Erro"));
    r.readAsDataURL(file);
  });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"});
}

const Card=({children,style={}})=>(
  <div style={{background:"#FFFFFF",borderRadius:16,padding:20,
    boxShadow:"0 2px 12px rgba(44,31,20,0.07)",animation:"fadeUp 0.35s ease both",...style}}>
    {children}
  </div>
);
const Label=({children,style={}})=>(
  <div style={{fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",
    color:"#9A8C7E",fontWeight:600,marginBottom:6,...style}}>{children}</div>
);
const H=({children,style={}})=>(
  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,
    fontWeight:500,color:"#2C1F14",lineHeight:1.3,...style}}>{children}</div>
);
const Btn=({children,onClick,disabled,style={},variant="primary"})=>{
  const v={
    primary:{background:"#2C1F14",color:"#F5F0E8"},
    gold:{background:"#C8A96E",color:"#2C1F14"},
    outline:{background:"transparent",color:"#8B7355",border:"1.5px solid #8B7355"},
    ghost:{background:"transparent",color:"#9A8C7E",border:"1.5px solid #E8E0D0"},
  };
  return(
    <button onClick={onClick} disabled={disabled} style={{
      border:"none",borderRadius:10,padding:"12px 18px",cursor:disabled?"not-allowed":"pointer",
      fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",
      opacity:disabled?0.5:1,transition:"all 0.2s",display:"inline-flex",
      alignItems:"center",gap:8,...v[variant],...style
    }}>{children}</button>
  );
};
const Spinner=()=>(
  <div style={{width:16,height:16,border:"2px solid #E8E0D0",
    borderTop:"2px solid #8B7355",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
);
const Textarea=({value,onChange,placeholder,rows=4})=>(
  <textarea value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder} rows={rows}
    style={{width:"100%",border:"1.5px solid #E8E0D0",borderRadius:10,
      padding:"12px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",
      color:"#2C1F14",background:"#F5F0E8",resize:"vertical",outline:"none",
      lineHeight:1.7,marginBottom:10}}/>
);
const Input=({value,onChange,placeholder,type="text",style={}})=>(
  <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder}
    style={{width:"100%",border:"1.5px solid #E8E0D0",borderRadius:10,
      padding:"11px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",
      color:"#2C1F14",background:"#F5F0E8",outline:"none",marginBottom:10,...style}}/>
);
const ResultBox=({text})=>{
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return(
    <div style={{background:"#F5F0E8",border:"1.5px solid #E8E0D0",borderRadius:12,padding:16,marginTop:12}}>
      <pre style={{whiteSpace:"pre-wrap",fontSize:13,color:"#2C1F14",lineHeight:1.8,
        fontFamily:"'DM Sans',sans-serif",margin:0}}>{text}</pre>
      <Btn onClick={copy} variant="outline" style={{marginTop:10,fontSize:11}}>
        {copied?"✓ Copiado!":"◈ Copiar"}
      </Btn>
    </div>
  );
};
const ScoreRing=({score,size=56})=>{
  const c=score>=75?"#4A7C59":score>=50?"#C8853E":"#8B3A3A";
  const r=size/2-4,circ=2*Math.PI*r;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E0D0" strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={4}
          strokeDasharray={`${(score/100)*circ} 999`} strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:size*0.22,fontWeight:700,color:c}}>{score}</div>
    </div>
  );
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [sel,setSel]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const attempt=()=>{
    if(sel&&pw===sel.password){onLogin(sel);}
    else{setErr("Senha incorreta.");setTimeout(()=>setErr(""),2000);}
  };
  return(
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{css}</style>
      <div style={{background:"#2C1F14",borderRadius:20,padding:"28px 24px",
        width:"100%",maxWidth:360,textAlign:"center",marginBottom:24,animation:"fadeUp 0.4s ease"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,
          color:"#F5F0E8",letterSpacing:"0.15em",marginBottom:4}}>AURA</div>
        <div style={{fontSize:10,color:"#C8A96E",letterSpacing:"0.4em"}}>MARKETING PRO</div>
      </div>
      <div style={{width:"100%",maxWidth:360,animation:"fadeUp 0.5s ease 0.1s both"}}>
        <Label style={{marginBottom:10}}>Selecione seu perfil</Label>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {USERS.map(u=>(
            <div key={u.id} onClick={()=>{setSel(u);setPw("");setErr("");}}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                background:"#FFFFFF",borderRadius:12,cursor:"pointer",
                border:`2px solid ${sel?.id===u.id?u.color:"#E8E0D0"}`,transition:"all 0.2s"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${u.color}25`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:700,color:u.color}}>{u.avatar}</div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#2C1F14"}}>{u.name}</div>
                <div style={{fontSize:11,color:"#9A8C7E"}}>{u.role}</div>
              </div>
              {sel?.id===u.id&&<div style={{marginLeft:"auto",color:u.color,fontSize:18}}>✓</div>}
            </div>
          ))}
        </div>
        {sel&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <Label>Senha</Label>
            <Input type="password" value={pw} onChange={setPw} placeholder="Digite sua senha" style={{marginBottom:8}}/>
            {err&&<div style={{fontSize:12,color:"#8B3A3A",marginBottom:8,textAlign:"center"}}>{err}</div>}
            <Btn onClick={attempt} style={{width:"100%",justifyContent:"center"}}>Entrar →</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── INÍCIO ────────────────────────────────────────────────────────────────────
function Inicio({user,setScreen}) {
  const today=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
  const reports=store.get("reports",[]);
  const analyses=store.get("analyses",[]);
  const grid=store.get("grid",[]);
  const metrics=[
    {label:"Relatórios salvos",value:reports.length,sub:"histórico",color:"#C8A96E",screen:"relatorio"},
    {label:"Análises feitas",value:analyses.length,sub:"imagens",color:"#8B7355",screen:"imagem"},
    {label:"Posts no grid",value:grid.length,sub:"planejados",color:"#4A7C59",screen:"grid"},
    {label:"Publicados",value:grid.filter(p=>p.status==="posted").length,sub:"esta semana",color:"#C8853E",screen:"grid"},
  ];
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{background:"#2C1F14",borderRadius:20,padding:"24px 20px",marginBottom:16}}>
        <Label style={{color:"#C8A96E",marginBottom:6}}>BEM-VINDO DE VOLTA</Label>
        <H style={{color:"#F5F0E8",fontSize:24,marginBottom:2}}>Olá, {user.name}! 👋</H>
        <div style={{fontSize:12,color:"rgba(245,240,232,0.6)",marginTop:6,textTransform:"capitalize"}}>{today}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,
          background:"rgba(245,240,232,0.1)",borderRadius:10,padding:"8px 12px"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#4A7C59"}}/>
          <div style={{fontSize:12,color:"#F5F0E8"}}>{user.role} · Aura Studio Arquitetura</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {metrics.map((m,i)=>(
          <Card key={i} onClick={()=>setScreen(m.screen)}
            style={{padding:16,cursor:"pointer",animationDelay:`${i*0.07}s`}}>
            <Label>{m.label}</Label>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,
              fontWeight:500,color:m.color,lineHeight:1}}>{m.value}</div>
            <div style={{fontSize:11,color:"#9A8C7E",marginTop:4}}>{m.sub}</div>
          </Card>
        ))}
      </div>
      <Card style={{marginBottom:12}}>
        <Label style={{marginBottom:12}}>Ações Rápidas</Label>
        {[
          {icon:"◉",label:"Analisar imagem antes de postar",screen:"imagem",color:"#C8A96E"},
          {icon:"✎",label:"Gerar legenda com IA",screen:"gerador",color:"#8B7355"},
          {icon:"⊟",label:"Planejar grid da semana",screen:"grid",color:"#4A7C59"},
          {icon:"✦",label:"Criar relatório semanal",screen:"relatorio",color:"#2C1F14"},
        ].map((a,i)=>(
          <div key={i} onClick={()=>setScreen(a.screen)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",
              borderBottom:i<3?"1px solid #E8E0D0":"none",cursor:"pointer"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${a.color}18`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,color:a.color,flexShrink:0}}>{a.icon}</div>
            <div style={{fontSize:13,color:"#2C1F14",fontWeight:500}}>{a.label}</div>
            <div style={{marginLeft:"auto",color:"#9A8C7E"}}>›</div>
          </div>
        ))}
      </Card>
      <Card style={{background:"rgba(200,169,110,0.12)",border:"1px solid rgba(200,169,110,0.3)"}}>
        <div style={{fontSize:12,color:"#8B7355",lineHeight:1.7}}>
          <strong>✦ Dica da semana:</strong> Posts com detalhe de textura geram 3× mais salvamentos. Aposte nos closes de materiais na próxima Sexta!
        </div>
      </Card>
    </div>
  );
}

// ── GRID PLANNER ──────────────────────────────────────────────────────────────
function GridPlanner() {
  const [posts,setPosts]=useState(()=>store.get("grid",[]));
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({title:"",pillar:"Inspiração",day:"Segunda",caption:"",imgUrl:"",status:"planned"});
  const [whatsapp,setWhatsapp]=useState(()=>store.get("wpp_number",""));
  const save=(p)=>{setPosts(p);store.set("grid",p);};
  const addPost=()=>{save([...posts,{...form,id:Date.now(),createdAt:new Date().toISOString()}]);setModal(null);setForm({title:"",pillar:"Inspiração",day:"Segunda",caption:"",imgUrl:"",status:"planned"});};
  const deletePost=(id)=>save(posts.filter(p=>p.id!==id));
  const toggleStatus=(id)=>save(posts.map(p=>p.id===id?{...p,status:p.status==="posted"?"planned":"posted"}:p));
  const pillarColor={"Inspiração":"#C8A96E","Educação":"#8B7355","Desejo":"#2C1F14"};
  const statusColor={planned:"#9A8C7E",scheduled:"#C8853E",posted:"#4A7C59"};
  const statusLabel={planned:"Planejado",scheduled:"Agendado",posted:"Publicado"};
  const days=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  const sendWhatsApp=(post)=>{
    const num=whatsapp.replace(/\D/g,"");
    if(!num){alert("Configure o número primeiro!");return;}
    const msg=encodeURIComponent(`🗓️ *Lembrete Aura Studio*\n\nPost de hoje: *${post.pillar}*\n📌 ${post.title||"Sem título"}\n\n${post.caption||""}`);
    window.open(`https://wa.me/55${num}?text=${msg}`,"_blank");
  };
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <H>Grid Planner</H>
        <Btn onClick={()=>setModal("new")} variant="gold" style={{padding:"8px 14px",fontSize:12}}>+ Post</Btn>
      </div>
      <Card style={{marginBottom:12,padding:14}}>
        <Label style={{marginBottom:6}}>📱 WhatsApp para lembretes</Label>
        <Input value={whatsapp} onChange={v=>{setWhatsapp(v);store.set("wpp_number",v);}}
          placeholder="DDD + número · Ex: 11999998888" style={{marginBottom:0}}/>
      </Card>
      {posts.length>0&&(
        <Card style={{marginBottom:12}}>
          <Label style={{marginBottom:10}}>Preview do Feed</Label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
            {[...posts].reverse().slice(0,9).map((p,i)=>(
              <div key={i} onClick={()=>setModal(p)}
                style={{aspectRatio:"1",borderRadius:6,overflow:"hidden",cursor:"pointer",
                  background:p.imgUrl?`url(${p.imgUrl}) center/cover`:`${pillarColor[p.pillar]||"#8B7355"}25`,
                  backgroundSize:"cover",display:"flex",alignItems:"flex-end",position:"relative"}}>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5),transparent 60%)",
                  display:"flex",alignItems:"flex-end",padding:4}}>
                  <span style={{fontSize:8,color:"#fff",fontWeight:600}}>{p.pillar?.slice(0,3).toUpperCase()}</span>
                </div>
                {p.status==="posted"&&<div style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:"#4A7C59"}}/>}
              </div>
            ))}
          </div>
        </Card>
      )}
      {posts.length===0
        ?<Card style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:32,marginBottom:8}}>⊟</div>
          <div style={{fontSize:14,color:"#9A8C7E"}}>Nenhum post planejado.<br/>Clique em "+ Post" para começar.</div>
        </Card>
        :[...posts].reverse().map(p=>(
          <Card key={p.id} style={{marginBottom:10,padding:14}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:48,height:48,borderRadius:10,flexShrink:0,
                background:p.imgUrl?`url(${p.imgUrl}) center/cover`:`${pillarColor[p.pillar]||"#8B7355"}20`,
                backgroundSize:"cover",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:pillarColor[p.pillar]||"#8B7355"}}>
                {!p.imgUrl&&(PILLARS.find(x=>x.label===p.pillar?.toUpperCase())?.emoji||"◈")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,marginBottom:3}}>
                  <span style={{fontSize:10,fontWeight:700,color:pillarColor[p.pillar]||"#8B7355",letterSpacing:"0.1em"}}>{p.pillar?.toUpperCase()}</span>
                  <span style={{fontSize:9,color:"#9A8C7E"}}>· {p.day}</span>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:"#2C1F14",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title||"Sem título"}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:statusColor[p.status]}}/>
                  <span style={{fontSize:10,color:statusColor[p.status]}}>{statusLabel[p.status]}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>sendWhatsApp(p)} style={{background:"rgba(74,124,89,0.15)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:14}}>📱</button>
                <button onClick={()=>toggleStatus(p.id)} style={{background:"rgba(200,169,110,0.15)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:11,color:"#8B7355",fontWeight:600}}>{p.status==="posted"?"↩":"✓"}</button>
                <button onClick={()=>deletePost(p.id)} style={{background:"rgba(139,58,58,0.1)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:11,color:"#8B3A3A"}}>✕</button>
              </div>
            </div>
            {p.caption&&<div style={{marginTop:10,fontSize:11,color:"#9A8C7E",lineHeight:1.6,
              background:"#F5F0E8",borderRadius:8,padding:"8px 10px",
              display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.caption}</div>}
          </Card>
        ))
      }
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,
          display:"flex",alignItems:"flex-end",animation:"fadeIn 0.2s ease"}}
          onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div style={{background:"#FFFFFF",borderRadius:"20px 20px 0 0",padding:"24px 20px",
            width:"100%",maxWidth:480,margin:"0 auto",maxHeight:"85vh",overflowY:"auto",animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <H style={{fontSize:18}}>Novo Post</H>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:20,color:"#9A8C7E",cursor:"pointer"}}>✕</button>
            </div>
            <Label>Pilar</Label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
              {["Inspiração","Educação","Desejo"].map(pl=>(
                <button key={pl} onClick={()=>setForm(f=>({...f,pillar:pl}))}
                  style={{padding:"8px 4px",border:`1.5px solid ${form.pillar===pl?pillarColor[pl]:"#E8E0D0"}`,
                    borderRadius:10,background:form.pillar===pl?`${pillarColor[pl]}15`:"transparent",
                    color:form.pillar===pl?pillarColor[pl]:"#9A8C7E",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {pl}
                </button>
              ))}
            </div>
            <Label>Dia</Label>
            <select value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}
              style={{width:"100%",border:"1.5px solid #E8E0D0",borderRadius:10,padding:"11px 14px",
                fontSize:13,fontFamily:"'DM Sans',sans-serif",color:"#2C1F14",background:"#F5F0E8",outline:"none",marginBottom:10}}>
              {days.map(d=><option key={d}>{d}</option>)}
            </select>
            <Label>Título</Label>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ex: Projeto Residencial SP"/>
            <Label>Legenda</Label>
            <Textarea value={form.caption} onChange={v=>setForm(f=>({...f,caption:v}))} placeholder="Cole a legenda..." rows={3}/>
            <Label>Status</Label>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["planned","scheduled","posted"].map(s=>(
                <button key={s} onClick={()=>setForm(f=>({...f,status:s}))}
                  style={{flex:1,padding:"8px 4px",border:`1.5px solid ${form.status===s?statusColor[s]:"#E8E0D0"}`,
                    borderRadius:10,background:form.status===s?`${statusColor[s]}15`:"transparent",
                    color:form.status===s?statusColor[s]:"#9A8C7E",fontSize:10,fontWeight:600,cursor:"pointer"}}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
            <Btn onClick={addPost} style={{width:"100%",justifyContent:"center"}}>Salvar Post</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ANÁLISE DE IMAGEM ─────────────────────────────────────────────────────────
function AnaliseImagem() {
  const [image,setImage]=useState(null);
  const [b64,setB64]=useState(null);
  const [context,setContext]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const fileRef=useRef();
  const handleFile=async(file)=>{if(!file)return;setB64(await fileToB64(file));setImage(URL.createObjectURL(file));setResult(null);};
  const analyze=async()=>{
    setLoading(true);setResult(null);
    const prompt=`Especialista em marketing visual para arquitetura premium. Analise esta imagem para o Instagram do "Aura Studio Arquitetura". Contexto: ${context||"Não informado"}. Retorne SOMENTE JSON: {"nota_estetica":<0-100>,"nota_marca":<0-100>,"nota_engajamento":<0-100>,"nota_geral":<0-100>,"pontos_fortes":["p1","p2","p3"],"pontos_melhoria":["m1","m2","m3"],"tipo_post_ideal":"Inspiração|Educação|Desejo","dia_ideal":"Segunda|Quarta|Sexta","legenda_sugerida":"legenda completa","hashtags":"#tag1 #tag2 #tag3 #tag4 #tag5","aprovado":true,"veredicto":"frase curta"}`;
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-opus-4-5",max_tokens:2000,
          messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:(b64.startsWith("/9j/") ? "image/jpeg" : "image/png"),data:b64}},{type:"text",text:prompt}]}]})});
      const d=await r.json();
      const text=d.content?.map(c=>c.text||"").join("")||"";
      const start=text.indexOf("{");const end=text.lastIndexOf("}");
      const parsed=JSON.parse(text.substring(start,end+1));
      setResult(parsed);
    }catch(e){setResult({error:"Erro: "+e.message});}
    setLoading(false);
  };
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <H style={{marginBottom:4}}>Análise de Imagem</H>
      <div style={{fontSize:13,color:"#9A8C7E",marginBottom:16}}>Envie a foto antes de postar</div>
      <Card style={{marginBottom:12}}>
        <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${image?"#C8A96E":"#E8E0D0"}`,borderRadius:12,
          padding:"24px 16px",textAlign:"center",cursor:"pointer",background:image?"rgba(200,169,110,0.08)":"#F5F0E8",marginBottom:image?12:0}}>
          {image?<img src={image} alt="preview" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,objectFit:"cover"}}/>
            :<><div style={{fontSize:32,marginBottom:8}}>◉</div><div style={{fontSize:13,color:"#8B7355",fontWeight:600}}>Toque para selecionar imagem</div></>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        {image&&<>
          <Label style={{marginTop:10}}>Contexto (opcional)</Label>
          <Textarea value={context} onChange={setContext} rows={2} placeholder="Projeto residencial, São Paulo..."/>
          <Btn onClick={analyze} disabled={loading} style={{width:"100%",justifyContent:"center"}}>
            {loading?<><Spinner/>Analisando...</>:"◉ Analisar com IA"}
          </Btn>
        </>}
      </Card>
      {result&&!result.error&&<>
        <Card style={{background:result.aprovado?"rgba(74,124,89,0.15)":"rgba(139,58,58,0.15)",
          border:`1.5px solid ${result.aprovado?"rgba(74,124,89,0.4)":"rgba(139,58,58,0.4)"}`,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>{result.aprovado?"✓":"✗"}</div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:result.aprovado?"#4A7C59":"#8B3A3A",textTransform:"uppercase",letterSpacing:"0.1em"}}>
                {result.aprovado?"Aprovada para postagem":"Recomendamos ajustes"}
              </div>
              <div style={{fontSize:13,color:"#2C1F14",marginTop:2}}>{result.veredicto}</div>
            </div>
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <Label style={{marginBottom:14}}>Avaliação por Critério</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[["Estética",result.nota_estetica],["Marca",result.nota_marca],["Engajamento",result.nota_engajamento],["Geral",result.nota_geral]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center"}}><ScoreRing score={v} size={60}/><div style={{fontSize:11,color:"#9A8C7E",marginTop:6}}>{l}</div></div>
            ))}
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <Card style={{padding:14}}>
            <Label style={{color:"#4A7C59",marginBottom:8}}>✓ Fortes</Label>
            {result.pontos_fortes?.map((p,i)=><div key={i} style={{fontSize:12,color:"#2C1F14",marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:"2px solid #4A7C59"}}>{p}</div>)}
          </Card>
          <Card style={{padding:14}}>
            <Label style={{color:"#C8853E",marginBottom:8}}>⚠ Melhorar</Label>
            {result.pontos_melhoria?.map((p,i)=><div key={i} style={{fontSize:12,color:"#2C1F14",marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:"2px solid #C8853E"}}>{p}</div>)}
          </Card>
        </div>
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[["TIPO",result.tipo_post_ideal,"#C8A96E"],["DIA",result.dia_ideal,"#2C1F14"]].map(([l,v,c])=>(
              <div key={l} style={{flex:1,background:`${c}12`,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#9A8C7E",marginBottom:4}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <Label style={{marginBottom:6}}>Legenda Sugerida</Label>
          <ResultBox text={result.legenda_sugerida+"\n\n"+result.hashtags}/>
        </Card>
      </>}
      {result?.error&&<Card style={{background:"rgba(139,58,58,0.15)"}}><div style={{fontSize:13,color:"#8B3A3A"}}>{result.error}</div></Card>}
    </div>
  );
}

// ── RELATÓRIO ─────────────────────────────────────────────────────────────────
function ReportView({r}) {
  const tc=(t)=>t==="up"?"#4A7C59":t==="down"?"#8B3A3A":"#9A8C7E";
  const ti=(t)=>t==="up"?"↑":t==="down"?"↓":"→";
  return(<>
    <Card style={{background:"#2C1F14",marginBottom:12}}>
      <Label style={{color:"#C8A96E"}}>Relatório · Aura Studio</Label>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#F5F0E8",margin:"8px 0",lineHeight:1.5,fontStyle:"italic"}}>"{r.insight_principal}"</div>
      <div style={{display:"flex",gap:20,marginTop:12}}>
        <div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>NOTA</div>
          <div style={{fontSize:28,fontWeight:700,color:"#C8A96E"}}>{r.nota_semana}<span style={{fontSize:14}}>/100</span></div></div>
        {r.taxa_engajamento&&<div><div style={{fontSize:10,color:"rgba(200,169,110,0.8)",letterSpacing:"0.15em"}}>ENGAJAMENTO</div>
          <div style={{fontSize:28,fontWeight:700,color:"#F5F0E8"}}>{r.taxa_engajamento}</div></div>}
      </div>
    </Card>
    <Card style={{marginBottom:12}}>
      <Label style={{marginBottom:8}}>Resumo Executivo</Label>
      <div style={{fontSize:13,color:"#2C1F14",lineHeight:1.7}}>{r.resumo_executivo}</div>
    </Card>
    {r.top_metricas?.length>0&&<Card style={{marginBottom:12}}>
      <Label style={{marginBottom:12}}>Métricas</Label>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {r.top_metricas.map((m,i)=>(
          <div key={i} style={{background:"#F5F0E8",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#9A8C7E",marginBottom:4}}>{m.label}</div>
            <div style={{fontSize:16,fontWeight:700,color:"#2C1F14"}}>{m.valor}</div>
            <div style={{fontSize:14,color:tc(m.tendencia),fontWeight:700}}>{ti(m.tendencia)}</div>
          </div>
        ))}
      </div>
    </Card>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      <Card style={{padding:14}}>
        <Label style={{color:"#4A7C59",marginBottom:8}}>✓ Destaques</Label>
        {r.destaques?.map((d,i)=><div key={i} style={{fontSize:12,color:"#2C1F14",marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:"2px solid #4A7C59"}}>{d}</div>)}
      </Card>
      {r.alertas?.length>0&&<Card style={{padding:14}}>
        <Label style={{color:"#C8853E",marginBottom:8}}>⚠ Alertas</Label>
        {r.alertas.map((a,i)=><div key={i} style={{fontSize:12,color:"#2C1F14",marginBottom:6,lineHeight:1.5,paddingLeft:8,borderLeft:"2px solid #C8853E"}}>{a}</div>)}
      </Card>}
    </div>
    <Card style={{marginBottom:12}}>
      <Label style={{marginBottom:10}}>Plano Próxima Semana</Label>
      {r.acoes_proxima_semana?.map((a,i)=>(
        <div key={i} style={{display:"flex",gap:10,marginBottom:8,fontSize:13,color:"#2C1F14"}}>
          <span style={{color:"#C8A96E",fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>{a}
        </div>
      ))}
    </Card>
    <Card>
      <Label style={{marginBottom:10}}>Sugestão de Conteúdo</Label>
      {r.sugestao_conteudo?.map((s,i)=>(
        <div key={i} style={{background:`${["#C8A96E","#8B7355","#2C1F14"][i]||"#9A8C7E"}12`,
          borderRadius:10,padding:"10px 12px",marginBottom:8,fontSize:13,color:"#2C1F14"}}>{s}</div>
      ))}
    </Card>
  </>);
}

function Relatorio() {
  const [view,setView]=useState("list");
  const [mode,setMode]=useState(null);
  const [reports,setReports]=useState(()=>store.get("reports",[]));
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({semana:"",seguidores:"",novos:"",alcance:"",curtidas:"",comentarios:"",salvamentos:"",posts_semana:"",melhor_post:"",notas:""});
  const [image,setImage]=useState(null);
  const [b64,setB64]=useState(null);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const fileRef=useRef();
  const saveReport=(r)=>{const n=[r,...reports].slice(0,20);setReports(n);store.set("reports",n);};
  const deleteReport=(id)=>{const u=reports.filter(r=>r.id!==id);setReports(u);store.set("reports",u);};
  const generate=async(fromPrint=false)=>{
    setLoading(true);setResult(null);
    const prompt=fromPrint
      ?`Analise este print do Instagram Insights do Aura Studio Arquitetura. Retorne SOMENTE JSON: {"resumo_executivo":"...","taxa_engajamento":"X%","nota_semana":<0-100>,"destaques":["d1","d2","d3"],"alertas":[],"top_metricas":[{"label":"","valor":"","tendencia":"up|down|stable"}],"acoes_proxima_semana":["a1","a2","a3","a4"],"sugestao_conteudo":["Segunda:...","Quarta:...","Sexta:..."],"insight_principal":"..."}`
      :`Analise dados do Aura Studio: ${JSON.stringify(form)}. Retorne SOMENTE JSON: {"resumo_executivo":"...","taxa_engajamento":"X%","nota_semana":<0-100>,"destaques":["d1","d2","d3"],"alertas":[],"top_metricas":[{"label":"","valor":"","tendencia":"up|down|stable"}],"acoes_proxima_semana":["a1","a2","a3","a4"],"sugestao_conteudo":["Segunda:...","Quarta:...","Sexta:..."],"insight_principal":"..."}`;
    try{
      let text;
      if(fromPrint){
        const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-opus-4-5",max_tokens:2000,
            messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:(b64.startsWith("/9j/") ? "image/jpeg" : "image/png"),data:b64}},{type:"text",text:prompt}]}]})});
        const d=await r.json();
        text=d.content?.map(c=>c.text||"").join("")||"";
      }else{
        text=await callClaude([{role:"user",content:prompt}]);
      }
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      const full={...parsed,id:Date.now(),date:new Date().toISOString(),semana:form.semana||new Date().toLocaleDateString("pt-BR")};
      saveReport(full);setResult(full);
    }catch(e){setResult({error:"Erro."});}
    setLoading(false);
  };

  if(view==="list") return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <H>Relatórios</H>
        <Btn onClick={()=>{setView("new");setMode(null);setResult(null);}} variant="gold" style={{padding:"8px 14px",fontSize:12}}>+ Novo</Btn>
      </div>
      {reports.length===0
        ?<Card style={{textAlign:"center",padding:40}}>
          <div style={{fontSize:32,marginBottom:8}}>✦</div>
          <div style={{fontSize:14,color:"#9A8C7E"}}>Nenhum relatório ainda.</div>
        </Card>
        :reports.map(r=>(
          <Card key={r.id} style={{marginBottom:10,padding:14,cursor:"pointer"}} onClick={()=>{setSelected(r);setView("detail");}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <ScoreRing score={r.nota_semana||0} size={52}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"#2C1F14",marginBottom:2}}>Semana: {r.semana||fmtDate(r.date)}</div>
                <div style={{fontSize:11,color:"#9A8C7E",marginBottom:4}}>{fmtDate(r.date)}</div>
                <div style={{fontSize:12,color:"#8B7355",fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{r.insight_principal}"</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                <button onClick={e=>{e.stopPropagation();deleteReport(r.id);}} style={{background:"rgba(139,58,58,0.1)",border:"none",borderRadius:8,padding:"4px 8px",cursor:"pointer",fontSize:11,color:"#8B3A3A"}}>✕</button>
                <div style={{color:"#9A8C7E",fontSize:18,textAlign:"center"}}>›</div>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  );

  if(view==="detail"&&selected) return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:"#8B7355",cursor:"pointer",fontSize:16,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>‹ Voltar</button>
      <ReportView r={selected}/>
    </div>
  );

  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:"#8B7355",cursor:"pointer",fontSize:16,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>‹ Relatórios</button>
      <H style={{marginBottom:16}}>Novo Relatório</H>
      {!mode&&!result&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{id:"manual",icon:"✎",title:"Inserir manualmente",desc:"Digite os números do Insights"},
            {id:"print",icon:"◉",title:"Enviar print do Insights",desc:"A IA lê automaticamente"}
          ].map(opt=>(
            <Card key={opt.id} style={{cursor:"pointer"}} onClick={()=>setMode(opt.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:14,background:"rgba(200,169,110,0.18)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#C8A96E",flexShrink:0}}>{opt.icon}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#2C1F14",marginBottom:2}}>{opt.title}</div>
                  <div style={{fontSize:12,color:"#9A8C7E"}}>{opt.desc}</div>
                </div>
                <div style={{marginLeft:"auto",color:"#9A8C7E",fontSize:18}}>›</div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {mode==="manual"&&!result&&(
        <Card>
          <Label style={{marginBottom:12}}>Dados da Semana</Label>
          {[["semana","Período","Ex: 26/05 a 01/06"],["seguidores","Total de seguidores","Ex: 1.240"],
            ["novos","Novos seguidores","Ex: +12"],["alcance","Alcance total","Ex: 3.400"],
            ["curtidas","Curtidas","Ex: 87"],["comentarios","Comentários","Ex: 14"],
            ["salvamentos","Salvamentos","Ex: 42"],["posts_semana","Posts publicados","Ex: 3"],
            ["melhor_post","Melhor post","Ex: Projeto residencial SP"]
          ].map(([k,label,ph])=>(
            <div key={k}><Label>{label}</Label><Input value={form[k]} onChange={v=>setForm(p=>({...p,[k]:v}))} placeholder={ph}/></div>
          ))}
          <Label>Observações</Label>
          <Textarea value={form.notas} onChange={v=>setForm(p=>({...p,notas:v}))} rows={2} placeholder="Campanhas, Reels virais..."/>
          <Btn onClick={()=>generate(false)} disabled={loading||!form.seguidores} style={{width:"100%",justifyContent:"center"}}>
            {loading?<><Spinner/>Gerando...</>:"✦ Gerar Relatório com IA"}
          </Btn>
        </Card>
      )}
      {mode==="print"&&!result&&(
        <Card>
          <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${image?"#C8A96E":"#E8E0D0"}`,borderRadius:12,
            padding:"24px 16px",textAlign:"center",cursor:"pointer",background:image?"rgba(200,169,110,0.08)":"#F5F0E8",marginBottom:12}}>
            {image?<img src={image} alt="insights" style={{maxWidth:"100%",maxHeight:250,borderRadius:8,objectFit:"contain"}}/>
              :<><div style={{fontSize:32,marginBottom:8}}>◉</div><div style={{fontSize:13,color:"#8B7355",fontWeight:600}}>Print do Instagram Insights</div></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
            onChange={async e=>{const file=e.target.files[0];if(!file)return;setImage(URL.createObjectURL(file));setB64(await fileToB64(file));}}/>
          {image&&<Btn onClick={()=>generate(true)} disabled={loading} style={{width:"100%",justifyContent:"center"}}>
            {loading?<><Spinner/>Analisando...</>:"✦ Gerar Relatório com IA"}
          </Btn>}
        </Card>
      )}
      {result&&!result.error&&<>
        <ReportView r={result}/>
        <Btn onClick={()=>{setView("list");setMode(null);setResult(null);}} variant="outline" style={{marginTop:16,width:"100%",justifyContent:"center"}}>← Ver relatórios</Btn>
      </>}
      {result?.error&&<Card style={{background:"rgba(139,58,58,0.15)"}}><div style={{fontSize:13,color:"#8B3A3A"}}>{result.error}</div></Card>}
    </div>
  );
}

// ── GERADOR ───────────────────────────────────────────────────────────────────
function Gerador() {
  const [pillar,setPillar]=useState(0);
  const [brief,setBrief]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const generate=async()=>{
    if(!brief.trim())return;
    setLoading(true);setResult("");
    const p=PILLARS[pillar];
    const prompt=`Especialista em marketing para arquitetura premium. Legenda para Instagram do "Aura Studio Arquitetura". TIPO: ${p.label} (${p.day}-feira). BRIEFING: ${brief}. Tom sofisticado, emojis com moderação (◉ ✦ ◈), máx 8 linhas, CTA claro, 5 hashtags. APENAS a legenda pronta.`;
    try{const text=await callClaude([{role:"user",content:prompt}]);setResult(text);}
    catch(e){setResult("Erro ao gerar.");}
    setLoading(false);
  };
  return(
    <div style={{padding:"20px 16px",paddingBottom:90}}>
      <H style={{marginBottom:4}}>Gerador de Legendas</H>
      <div style={{fontSize:13,color:"#9A8C7E",marginBottom:16}}>IA especializada em arquitetura</div>
      <Card style={{marginBottom:12}}>
        <Label style={{marginBottom:10}}>Tipo de Post</Label>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {PILLARS.map((p,i)=>(
            <div key={i} onClick={()=>setPillar(i)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              borderRadius:12,cursor:"pointer",border:`1.5px solid ${pillar===i?p.color:"#E8E0D0"}`,
              background:pillar===i?`${p.color}12`:"transparent",transition:"all 0.2s"}}>
              <span style={{fontSize:18,color:p.color}}>{p.emoji}</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:p.color,letterSpacing:"0.1em"}}>{p.day} · {p.label}</div>
                <div style={{fontSize:11,color:"#9A8C7E"}}>{p.concept}</div>
              </div>
              {pillar===i&&<div style={{marginLeft:"auto",color:p.color}}>✓</div>}
            </div>
          ))}
        </div>
        <Label>Briefing</Label>
        <Textarea value={brief} onChange={setBrief} rows={4} placeholder="Descreva o projeto, ambiente, materiais, localização..."/>
        <Btn onClick={generate} disabled={loading||!brief.trim()} style={{width:"100%",justifyContent:"center"}}>
          {loading?<><Spinner/>Gerando...</>:"✎ Gerar Legenda com IA"}
        </Btn>
      </Card>
      {result&&<Card><Label style={{marginBottom:8}}>Legenda Gerada</Label><ResultBox text={result}/></Card>}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const NAV=[
  {id:"inicio",icon:"⊞",label:"Início"},
  {id:"grid",  icon:"⊟",label:"Grid"},
  {id:"imagem",icon:"◉",label:"Análise"},
  {id:"relatorio",icon:"✦",label:"Relatório"},
  {id:"gerador",icon:"✎",label:"Legendas"},
];

export default function App() {
  const [user,setUser]=useState(()=>store.get("session",null));
  const [screen,setScreen]=useState("inicio");
  const login=(u)=>{setUser(u);store.set("session",u);};
  const logout=()=>{setUser(null);store.set("session",null);setScreen("inicio");};
  if(!user) return <><style>{css}</style><Login onLogin={login}/></>;
  const screens={inicio:<Inicio user={user} setScreen={setScreen}/>,grid:<GridPlanner/>,imagem:<AnaliseImagem/>,relatorio:<Relatorio/>,gerador:<Gerador/>};
  return(
    <div style={{maxWidth:480,margin:"0 auto",background:"#F5F0E8",minHeight:"100vh",position:"relative"}}>
      <style>{css}</style>
      <div style={{background:"#FFFFFF",borderBottom:"1px solid #E8E0D0",padding:"12px 20px",
        display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:"#2C1F14",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#C8A96E",fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontWeight:600}}>A</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#2C1F14",lineHeight:1}}>AURA</div>
            <div style={{fontSize:9,color:"#9A8C7E",letterSpacing:"0.15em"}}>MARKETING PRO</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${user.color}25`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:user.color}}>{user.avatar}</div>
          <button onClick={logout} style={{background:"none",border:"none",fontSize:11,color:"#9A8C7E",cursor:"pointer"}}>Sair</button>
        </div>
      </div>
      <div key={screen}>{screens[screen]}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,
        background:"#FFFFFF",borderTop:"1px solid #E8E0D0",display:"flex",padding:"8px 0 14px",zIndex:20}}>
        {NAV.map(n=>{
          const active=screen===n.id;
          return(
            <button key={n.id} onClick={()=>setScreen(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
              <span style={{fontSize:18,color:active?"#2C1F14":"#9A8C7E",transition:"color 0.2s"}}>{n.icon}</span>
              <span style={{fontSize:9,letterSpacing:"0.05em",color:active?"#2C1F14":"#9A8C7E",fontWeight:active?700:400,
                fontFamily:"'DM Sans',sans-serif",transition:"color 0.2s"}}>{n.label.toUpperCase()}</span>
              {active&&<div style={{width:4,height:4,borderRadius:"50%",background:"#C8A96E",marginTop:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
