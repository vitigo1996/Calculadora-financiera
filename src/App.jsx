// v12
import { useState, useEffect, useMemo } from "react";

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

const fmtCOP = (n) => new Intl.NumberFormat("es-CO", { style:"currency", currency:"COP", minimumFractionDigits:0, maximumFractionDigits:0 }).format(n||0);
const fmtUSD = (n) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", minimumFractionDigits:2, maximumFractionDigits:2 }).format(n||0);

export default function App() {
  const [wallets, setWallets] = useLocalStorage("fin_wallets", { efectivo:{cop:0}, bancolombia:{cop:0}, wise:{usd:0} });
  const [walletInputs, setWalletInputs] = useState({});
  const [salaries, setSalaries] = useLocalStorage("fin_salaries", { david:0, daniela:0 });
  const [hogar, setHogar] = useLocalStorage("fin_hogar", { Arriendo:0, Internet:0, Servicios:0 });
  const [deudas, setDeudas] = useLocalStorage("fin_deudas", { Nu:{}, Falabella:{}, Addi:{}, "Cuota carro":{}, Icetex:{} });
  const [deudaLibre, setDeudaLibre] = useLocalStorage("fin_deuda_libre", [{id:1,nombre:"",saldo:0,positiva:false},{id:2,nombre:"",saldo:0,positiva:false},{id:3,nombre:"",saldo:0,positiva:false}]);
  const [ahorros, setAhorros] = useLocalStorage("fin_ahorros2", {
    Boda:{total:0,aporte:0}, Inversion:{total:0,aporte:0,real:0},
    "Ahorro-Casa":{total:0,aporte:0}, "Ahorro-Emergencia":{total:0,aporte:0}, "Ahorro-Personal":{total:0,aporte:0},
  });
  const [rate, setRate] = useState(null);
  const [openHogar, setOpenHogar] = useState(false);
  const [openTarjetas, setOpenTarjetas] = useState(false);
  const [openDeudas, setOpenDeudas] = useState(false);
  const [tab, setTab] = useState("wallets");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`https://www.datos.gov.co/resource/32sa-8pi3.json?$where=vigenciadesde<='${today}' AND vigenciahasta>='${today}'`)
      .then(r=>r.json()).then(d=>{ if(d?.[0]?.valor) setRate(parseFloat(d[0].valor)); else throw 0; })
      .catch(()=>fetch("https://api.frankfurter.app/latest?from=USD&to=COP").then(r=>r.json()).then(d=>setRate(d.rates.COP)).catch(()=>setRate(3593)));
  }, []);

  const totalSalary = (salaries.david||0)+(salaries.daniela||0);
  const pctD = totalSalary > 0 ? salaries.david/totalSalary : 0.5;
  const pctDa = 1-pctD;

  const tabs = [
    {id:"wallets", label:"Billetera", icon:"💳"},
    {id:"hogar", label:"Obligaciones", icon:"🏠"},
    {id:"ahorros", label:"Portafolio", icon:"💎"},
    {id:"history", label:"Distribución", icon:"◎"},
  ];

  const walletAdd = (id, field, raw) => {
    const v = parseFloat(raw)||0; if(!v) return;
    setWallets(p=>({...p,[id]:{...p[id],[field]:(p[id]?.[field]||0)+v}}));
    setWalletInputs(p=>({...p,[`${id}_inp`]:""}));
  };
  const walletSub = (id, field, raw) => {
    const v = parseFloat(raw)||0; if(!v) return;
    setWallets(p=>({...p,[id]:{...p[id],[field]:Math.max(0,(p[id]?.[field]||0)-v)}}));
    setWalletInputs(p=>({...p,[`${id}_inp`]:""}));
  };

  const pmBtn = (id) => (
    <div style={{display:"flex",gap:4}}>
      <button onClick={()=>setAhorros(p=>({...p,[id]:{...p[id],total:(p[id]?.total||0)+(p[id]?.aporte||0),aporte:0,_raw:""}}))}
        style={{...btnSt, background:"rgba(100,220,150,0.2)", color:"#7dffaa", border:"1px solid rgba(100,220,150,0.3)", borderRadius:12, padding:"6px 14px"}}>＋</button>
      <button onClick={()=>setAhorros(p=>({...p,[id]:{...p[id],total:Math.max(0,(p[id]?.total||0)-(p[id]?.aporte||0)),aporte:0,_raw:""}}))}
        style={{...btnSt, background:"rgba(255,100,100,0.18)", color:"#ff8a8a", border:"1px solid rgba(255,100,100,0.3)", borderRadius:12, padding:"6px 14px"}}>－</button>
    </div>
  );

  const btnSt = {cursor:"pointer",border:"none",borderRadius:12,fontFamily:"inherit",fontSize:16,fontWeight:600,padding:"6px 14px",transition:"all .2s"};
  const inputSt = {background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.1)",color:"#f1f0f9",fontFamily:"'DM Serif Display',serif",fontSize:14,padding:"4px 0",outline:"none",width:"100%"};

  return (
    <div style={{fontFamily:"'Outfit',sans-serif",background:"#111827",minHeight:"100vh",color:"#f1f0f9",paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} input{outline:none}
        ::selection{background:rgba(168,85,247,0.25)}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
        .glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:24px}
        .pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:600;letter-spacing:.5px}
        .hovr{transition:all .2s} .hovr:hover{background:rgba(255,255,255,0.05)!important}
        .tab-active{color:#fff!important} .tab-btn{transition:all .2s;cursor:pointer;border:none;background:none;font-family:inherit}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        .amt-btn{cursor:pointer;border:none;border-radius:12px;width:36px;height:36px;font-size:18px;font-weight:500;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;backdrop-filter:blur(8px)}
        .amt-btn:active{transform:scale(.92)}
        .section-fade{animation:fadeUp .35s ease both} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{padding:"52px 24px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(120,60,220,0.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>
          {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:"#f1f0f9",lineHeight:1.1}}>
          mi <span style={{fontStyle:"italic",color:"rgba(192,132,252,0.95)"}}>billetera</span>
        </div>
      </div>

      <div style={{padding:"0 16px",maxWidth:480,margin:"0 auto"}}>

        {/* ── BILLETERA ── */}
        {tab==="wallets" && (
          <div className="section-fade">
            {[
              {id:"efectivo", label:"Efectivo", icon:"", field:"cop", fmt:fmtCOP, color:"#c8b8ff", tag:"COP"},
              {id:"bancolombia", label:"Bancolombia", icon:"", field:"cop", fmt:fmtCOP, color:"#c8b8ff", tag:"COP"},
              {id:"wise", label:"Wise", icon:"", field:"usd", fmt:fmtUSD, color:"#7dffaa", tag:"USD"},
            ].map((w,i)=>{
              const val = wallets[w.id]?.[w.field]||0;
              const inp = walletInputs[`${w.id}_inp`]||"";
              return (
                <div key={w.id} className="glass" style={{marginBottom:12, padding:"20px 22px", position:"relative", overflow:"hidden"}}>
                  {/* emoji fondo */}
                  <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:64,opacity:0.08,pointerEvents:"none",userSelect:"none"}}>{w.icon}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,position:"relative"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:22,fontWeight:500,color:"#f1f0f9"}}>{w.label}</span>
                      <span className="pill" style={{background:w.tag==="COP"?"rgba(200,184,255,0.12)":"rgba(125,255,170,0.12)",color:w.color}}>{w.tag}</span>
                    </div>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:w.color,letterSpacing:"-0.5px"}}>{w.fmt(val)}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10,position:"relative"}}>
                    <input type="number" placeholder="Ingresar valor…" value={inp}
                      onChange={e=>setWalletInputs(p=>({...p,[`${w.id}_inp`]:e.target.value}))}
                      style={{...inputSt, fontSize:13, color:"#e2d9f3"}} />
                    <button className="amt-btn" onClick={()=>walletSub(w.id,w.field,inp)}
                      style={{background:"rgba(255,100,100,0.18)",color:"#ff8a8a",border:"1px solid rgba(255,100,100,0.25)"}}>−</button>
                    <button className="amt-btn" onClick={()=>walletAdd(w.id,w.field,inp)}
                      style={{background:"rgba(100,220,150,0.18)",color:"#7dffaa",border:"1px solid rgba(100,220,150,0.25)"}}>+</button>
                  </div>
                </div>
              );
            })}

            {/* Deudas */}
            <div className="glass" style={{padding:"20px 22px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:16,top:16,fontSize:40,opacity:0.08,pointerEvents:"none",userSelect:"none"}}></div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase",marginBottom:18}}>Deudas</div>
              {deudaLibre.slice(0,2).map((dl,i)=>{
                const esPos=dl.positiva||false;
                const inp=walletInputs[`deuda_${dl.id}_inp`]||"";
                const color=esPos?"#7dffaa":"#ff8a8a";
                return (
                  <div key={dl.id} style={{marginBottom:i===0?20:0,paddingBottom:i===0?20:0,borderBottom:i===0?"1px solid rgba(255,255,255,0.07)":"none"}}>
                    <input placeholder="Nombre…" value={dl.nombre}
                      onChange={e=>setDeudaLibre(p=>p.map(x=>x.id===dl.id?{...x,nombre:e.target.value}:x))}
                      style={{...inputSt,fontSize:22,fontWeight:600,marginBottom:10,color:"rgba(255,255,255,0.9)"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div onClick={()=>setDeudaLibre(p=>p.map(x=>x.id===dl.id?{...x,positiva:!x.positiva}:x))}
                        style={{width:96,height:28,borderRadius:14,background:esPos?"rgba(100,220,150,0.2)":"rgba(255,100,100,0.15)",border:`1px solid ${esPos?"rgba(100,220,150,0.4)":"rgba(255,100,100,0.35)"}`,cursor:"pointer",position:"relative",transition:"background .25s, border .25s",flexShrink:0,overflow:"hidden"}}>
                        {/* Texto al lado CONTRARIO de la bolita */}
                        <span style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:esPos?undefined:30,right:esPos?30:undefined,fontSize:9,fontWeight:700,color:esPos?"rgba(100,220,150,0.95)":"rgba(255,100,100,0.95)",whiteSpace:"nowrap",zIndex:0,pointerEvents:"none",transition:"left .25s, right .25s"}}>{esPos?"Me deben":"Debo"}</span>
                        {/* Círculo */}
                        <div style={{position:"absolute",top:3,left:esPos?70:3,width:22,height:22,borderRadius:"50%",background:esPos?"#7dffaa":"#ff8a8a",transition:"left .25s",zIndex:1,boxShadow:`0 0 6px ${esPos?"rgba(125,255,170,0.5)":"rgba(255,138,138,0.5)"}`}}/>
                      </div>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color,letterSpacing:"-0.5px"}}>{fmtCOP(dl.saldo||0)}</div>
                    </div>
                      <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
                      <input type="number" placeholder="Ingresar valor…" value={inp}
                        onChange={e=>setWalletInputs(p=>({...p,[`deuda_${dl.id}_inp`]:e.target.value}))}
                        style={{...inputSt,fontSize:13,color:"#e2d9f3",flex:1}}/>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",whiteSpace:"nowrap",fontWeight:500}}>Pagar deuda</div>
                        <button className="amt-btn" onClick={()=>{const v=parseFloat(inp)||0;if(!v)return;setDeudaLibre(p=>p.map(x=>x.id===dl.id?{...x,saldo:Math.max(0,(x.saldo||0)-v)}:x));setWalletInputs(p=>({...p,[`deuda_${dl.id}_inp`]:""}));}}
                          style={{background:"rgba(255,100,100,0.18)",color:"#ff8a8a",border:"1px solid rgba(255,100,100,0.25)"}}>−</button>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",whiteSpace:"nowrap",fontWeight:500}}>Aumentar deuda</div>
                        <button className="amt-btn" onClick={()=>{const v=parseFloat(inp)||0;if(!v)return;setDeudaLibre(p=>p.map(x=>x.id===dl.id?{...x,saldo:(x.saldo||0)+v}:x));setWalletInputs(p=>({...p,[`deuda_${dl.id}_inp`]:""}));}}
                          style={{background:"rgba(100,220,150,0.18)",color:"#7dffaa",border:"1px solid rgba(100,220,150,0.25)"}}>+</button>
                      </div>
                      {/* Switch */}
                    </div>
                  </div>
                );
              })}

              {/* Autofinanciera — fijo, me deben */}
              <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:22,fontWeight:600,color:"rgba(255,255,255,0.9)",marginBottom:10}}>Autofinanciera</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{width:96,height:28,borderRadius:14,background:"rgba(100,220,150,0.2)",border:"1px solid rgba(100,220,150,0.4)",position:"relative",overflow:"hidden",flexShrink:0}}>
                    <span style={{position:"absolute",top:"50%",transform:"translateY(-50%)",left:10,fontSize:9,fontWeight:700,color:"rgba(100,220,150,0.95)",whiteSpace:"nowrap"}}>Me deben</span>
                    <div style={{position:"absolute",top:3,left:70,width:22,height:22,borderRadius:"50%",background:"#7dffaa",boxShadow:"0 0 6px rgba(125,255,170,0.5)"}}/>
                  </div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#7dffaa",letterSpacing:"-0.5px"}}>{fmtCOP(24166570)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── OBLIGACIONES ── */}
        {tab==="hogar" && (()=>{
          const HOGAR=[{id:"Arriendo",desc:null,icon:""},{id:"Internet",desc:"07409278",icon:""},{id:"Servicios",desc:"3628",icon:""}];
          const CUPOS={Nu:5000000, Falabella:3400000, Addi:8000000};
          const TARJETAS=[{id:"Nu",icon:""},{id:"Falabella",icon:"️"},{id:"Addi",icon:""}];
          const CREDITOS=[{id:"Cuota carro",label:"Carro",icon:"",total:89990000,miPct:true},{id:"Icetex",label:"Icetex",icon:"",total:4664318,miPct:false}];

          const GroupLabel = ({text}) => (
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>{text}</div>
          );

          return (
            <div className="section-fade">

              {/* 1. Sueldos */}
              <GroupLabel text="Sueldos"/>
              <div className="glass" style={{padding:"22px",marginBottom:20}}>
                <div style={{display:"flex",height:4,borderRadius:4,overflow:"hidden",marginBottom:18}}>
                  <div style={{width:`${totalSalary>0?pctD*100:50}%`,background:"linear-gradient(90deg,#5b21b6,#a855f7)",transition:"width 0.6s ease"}}/>
                  <div style={{width:2,background:"#111827",flexShrink:0}}/>
                  <div style={{flex:1,background:"linear-gradient(90deg,#be185d,#f472b6)"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",gap:16}}>
                  {[{key:"david",label:"David",color:"#c084fc"},{key:"daniela",label:"Daniela",color:"#f9a8d4"}].map(p=>(
                    <div key={p.key} style={{flex:1}}>
                      <div style={{fontSize:22,color:p.color,fontWeight:600,marginBottom:8}}>{p.label}</div>
                      <input type="number" placeholder="0" value={salaries[p.key]||""}
                        onChange={e=>setSalaries(prev=>({...prev,[p.key]:e.target.value===''?0:parseFloat(e.target.value)||0}))}
                        style={{...inputSt,fontSize:20,fontFamily:"'DM Serif Display',serif",color:"#e2d9f3",textAlign:p.key==="daniela"?"right":"left"}}/>
                      {totalSalary>0&&<div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:5,textAlign:p.key==="daniela"?"right":"left"}}>{(p.key==="david"?pctD*100:pctDa*100).toFixed(1)}%</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Hogar */}
              <GroupLabel text="Gastos del hogar"/>
              <div className="glass" style={{padding:"20px 22px",marginBottom:20}}>
                {HOGAR.map((c,i)=>(
                  <div key={c.id} style={{marginBottom:i<HOGAR.length-1?18:0,paddingBottom:i<HOGAR.length-1?18:0,borderBottom:i<HOGAR.length-1?"1px solid rgba(255,255,255,0.07)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div>
                        <span style={{fontSize:22,fontWeight:500,color:"#f1f0f9"}}>{c.id}</span>
                        {c.desc&&<span style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginLeft:8}}>{c.desc}</span>}
                      </div>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#c8b8ff"}}>{fmtCOP(hogar[c.id]||0)}</div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:16}}>
                        <span style={{fontSize:11,color:"rgba(200,184,255,0.5)"}}>David <span style={{color:"#c8b8ff"}}>{fmtCOP((hogar[c.id]||0)*pctD)}</span></span>
                        <span style={{fontSize:11,color:"rgba(249,168,212,0.5)"}}>Daniela <span style={{color:"#f9a8d4"}}>{fmtCOP((hogar[c.id]||0)*pctDa)}</span></span>
                      </div>
                      <input type="number" placeholder="Total" value={hogar[c.id]||""}
                        onChange={e=>setHogar(p=>({...p,[c.id]:e.target.value===''?0:parseFloat(e.target.value)||0}))}
                        style={{...inputSt,width:110,textAlign:"right",fontSize:14,fontFamily:"'DM Serif Display',serif",color:"#e2d9f3"}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Tarjetas — un solo recuadro */}
              <GroupLabel text="Tarjetas de crédito"/>
              <div className="glass" style={{padding:"20px 22px",marginBottom:20}}>
                {TARJETAS.map((t,idx)=>{
                  const cupo=CUPOS[t.id], deuda=deudas[t.id]?.deuda||0;
                  const isAddi = t.id==="Addi";
                  const cuota = isAddi ? Math.ceil(deuda/3) : (deudas[t.id]?.cuota||0);
                  const disponible=Math.max(0,cupo-deuda);
                  const pct=Math.min((deuda/cupo)*100,100);
                  const gastoInput=deudas[t.id]?.gastoInput||"";
                  const dentroDeFecha = deudas[t.id]?.dentroDeFecha !== false; // default true
                  return (
                    <div key={t.id} style={{marginBottom:idx<TARJETAS.length-1?22:0,paddingBottom:idx<TARJETAS.length-1?22:0,borderBottom:idx<TARJETAS.length-1?"1px solid rgba(255,255,255,0.07)":"none",position:"relative"}}>
                      <div style={{position:"absolute",right:0,top:0,fontSize:40,opacity:0.07,pointerEvents:"none",userSelect:"none"}}>{t.icon}</div>
                      <div style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                          <div style={{fontSize:22,fontWeight:600,color:"#f1f0f9"}}>{t.id}</div>
                          <div style={{fontSize:18,color:"#7dffaa",fontFamily:"'DM Serif Display',serif"}}>{fmtCOP(disponible)} <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"'Outfit',sans-serif"}}>disponible</span></div>
                        </div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#ff8a8a",letterSpacing:"-0.5px"}}>{fmtCOP(deuda)} <span style={{fontSize:11,color:"rgba(255,138,138,0.4)",fontFamily:"'Outfit',sans-serif"}}>en deuda</span></div>
                      </div>
                      {!isAddi && (
                        <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2,marginBottom:10,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:pct>80?"linear-gradient(90deg,#f87171,#fca5a5)":"linear-gradient(90deg,#a855f7,#c084fc)",transition:"width .5s",borderRadius:2}}/>
                        </div>
                      )}
                      {/* Cuota mínima + botón cuota — solo Nu y Falabella */}
                      {!isAddi && (
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                          <div>
                            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:3}}>CUOTA MÍNIMA</div>
                            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"#fbbf24"}}>{fmtCOP(cuota)}</div>
                          </div>
                          <button onClick={()=>setDeudas(p=>({...p,[t.id]:{...p[t.id],cuota:p[t.id]?.deuda||0}}))}
                            style={{cursor:"pointer",border:"1px solid rgba(251,191,36,0.25)",borderRadius:10,fontFamily:"inherit",fontSize:12,fontWeight:500,padding:"6px 12px",background:"rgba(251,191,36,0.12)",color:"#fbbf24",whiteSpace:"nowrap"}}>↺ cuota</button>
                        </div>
                      )}
                      {/* Cuota editable para Addi */}
                      {isAddi && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>CUOTA</div>
                          <input type="number" placeholder="Ingresar cuota…" value={deudas[t.id]?.cuota||""}
                            onChange={e=>setDeudas(p=>({...p,[t.id]:{...p[t.id],cuota:e.target.value===''?0:parseFloat(e.target.value)||0}}))}
                            style={{...inputSt,fontSize:16,fontFamily:"'DM Serif Display',serif",color:"#fbbf24"}}/>
                        </div>
                      )}
                      {/* Input + botones — solo Nu y Falabella */}
                      {!isAddi && (
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <input type="number" placeholder="Ingresar valor…" value={gastoInput}
                            onChange={e=>setDeudas(p=>({...p,[t.id]:{...p[t.id],gastoInput:e.target.value}}))}
                            style={{...inputSt,fontSize:12,color:"#e2d9f3",flex:1}}/>
                          <button onClick={()=>{
                            const g=parseFloat(gastoInput)||0; if(!g) return;
                            setDeudas(p=>({...p,[t.id]:{...p[t.id],deuda:(p[t.id]?.deuda||0)+g,gastoInput:""}}));
                          }} style={{cursor:"pointer",border:"1px solid rgba(168,85,247,0.35)",borderRadius:10,fontFamily:"inherit",fontSize:12,fontWeight:500,padding:"7px 13px",background:"rgba(168,85,247,0.22)",color:"#d8b4fe",whiteSpace:"nowrap"}}>+ gasto</button>
                          <button onClick={()=>{
                            const g=parseFloat(gastoInput)||0; if(!g) return;
                            setDeudas(p=>({...p,[t.id]:{...p[t.id],deuda:Math.max(0,(p[t.id]?.deuda||0)-g),cuota:Math.max(0,(p[t.id]?.cuota||0)-g),gastoInput:""}}));
                          }} style={{cursor:"pointer",border:"1px solid rgba(100,220,150,0.3)",borderRadius:10,fontFamily:"inherit",fontSize:12,fontWeight:500,padding:"7px 13px",background:"rgba(100,220,150,0.18)",color:"#86efac",whiteSpace:"nowrap"}}> pagado</button>
                        </div>
                      )}
                      {/* Solo botón pagado para Addi */}
                      {isAddi && (
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <input type="number" placeholder="Ingresar valor…" value={gastoInput}
                            onChange={e=>setDeudas(p=>({...p,[t.id]:{...p[t.id],gastoInput:e.target.value}}))}
                            style={{...inputSt,fontSize:12,color:"#e2d9f3",flex:1}}/>
                          <button onClick={()=>{
                            const g=parseFloat(gastoInput)||0; if(!g) return;
                            setDeudas(p=>({...p,[t.id]:{...p[t.id],deuda:(p[t.id]?.deuda||0)+g,gastoInput:""}}));
                          }} style={{cursor:"pointer",border:"1px solid rgba(168,85,247,0.35)",borderRadius:10,fontFamily:"inherit",fontSize:12,fontWeight:500,padding:"7px 13px",background:"rgba(168,85,247,0.22)",color:"#d8b4fe",whiteSpace:"nowrap"}}>+ gasto</button>
                          <button onClick={()=>{
                            const g=parseFloat(gastoInput)||0; if(!g) return;
                            setDeudas(p=>({...p,[t.id]:{...p[t.id],deuda:Math.max(0,(p[t.id]?.deuda||0)-g),gastoInput:""}}));
                          }} style={{cursor:"pointer",border:"1px solid rgba(100,220,150,0.3)",borderRadius:10,fontFamily:"inherit",fontSize:12,fontWeight:500,padding:"7px 13px",background:"rgba(100,220,150,0.18)",color:"#86efac",whiteSpace:"nowrap"}}> pagado</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 4. Créditos — un solo recuadro */}
              <div style={{marginTop:0}}><GroupLabel text="Créditos"/></div>
              <div className="glass" style={{padding:"20px 22px",marginBottom:12}}>
                {CREDITOS.map((c,idx)=>{
                  const cuota=deudas[c.id]?.cuota||(c.id==="Cuota carro"?1521807:73837);
                  return (
                    <div key={c.id} style={{marginBottom:idx<CREDITOS.length-1?20:0,paddingBottom:idx<CREDITOS.length-1?20:0,borderBottom:idx<CREDITOS.length-1?"1px solid rgba(255,255,255,0.07)":"none",position:"relative"}}>
                      <div style={{position:"absolute",right:0,top:0,fontSize:40,opacity:0.07,pointerEvents:"none",userSelect:"none"}}>{c.icon}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
                        <div style={{fontSize:22,fontWeight:500,color:"#f1f0f9"}}>{c.label}</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#ff8a8a",letterSpacing:"-0.5px"}}>{fmtCOP(c.total)}</div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>CUOTA MENSUAL</div>
                          <input type="number" value={cuota||""} onChange={e=>setDeudas(p=>({...p,[c.id]:{...p[c.id],cuota:e.target.value===''?0:parseFloat(e.target.value)||0}}))}
                            style={{...inputSt,fontSize:18,fontFamily:"'DM Serif Display',serif",color:"#e2d9f3",width:160}}/>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>MI PARTE {c.miPct?`(${(pctD*100).toFixed(0)}%)`:""}</div>
                          <div style={{fontSize:22,color:"#c8b8ff",fontFamily:"'DM Serif Display',serif"}}>{fmtCOP(c.miPct?cuota*pctD:cuota)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── PORTAFOLIO ── */}
        {tab==="ahorros" && (()=>{
          const AHORRO=[
            {id:"Ahorro-Casa",label:"Casa",icon:"",desc:"Confama"},
            {id:"Ahorro-Emergencia",label:"Emergencia",icon:"️",desc:"Nu"},
            {id:"Ahorro-Personal",label:"Personal",icon:"",desc:"Bancolombia"},
            {id:"Boda",label:"Boda",icon:"",desc:"Nu"},
          ];
          const totalAhorro=AHORRO.reduce((s,x)=>s+(ahorros[x.id]?.total||0),0);
          const totalInv=ahorros["Inversion"]?.total||0;
          const invReal=ahorros["Inversion"]?.real||0;

          const GroupLabel=({text})=>(
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>{text}</div>
          );

          return (
            <div className="section-fade">
              {/* Totales */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                <div className="glass" style={{padding:"18px 20px"}}>
                  <div style={{fontSize:9,color:"rgba(52,211,153,0.7)",letterSpacing:2,marginBottom:8}}>AHORRADO</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#7dffaa"}}>{fmtCOP(totalAhorro)}</div>
                </div>
                <div className="glass" style={{padding:"18px 20px"}}>
                  <div style={{fontSize:9,color:"rgba(192,132,252,0.7)",letterSpacing:2,marginBottom:8}}>INVERTIDO</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#c084fc"}}>{fmtCOP(totalInv)}</div>
                </div>
              </div>

              {/* Inversión */}
              <GroupLabel text="Inversión · eToro"/>
              <div className="glass" style={{padding:"20px 22px",marginBottom:20,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:56,opacity:0.08,pointerEvents:"none",userSelect:"none"}}></div>
                <div style={{marginBottom:14,position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                    <div style={{fontSize:22,fontWeight:500,color:"#f1f0f9"}}>Invertido</div>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#c084fc",letterSpacing:"-0.5px"}}>{fmtCOP(totalInv)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
                  <input type="number" placeholder="Ingresar valor…" value={ahorros["Inversion"]?._raw??(ahorros["Inversion"]?.aporte||"")}
                    onChange={e=>setAhorros(p=>({...p,Inversion:{...p.Inversion,aporte:parseFloat(e.target.value)||0,_raw:e.target.value}}))}
                    style={{...inputSt,fontSize:13,color:"#e2d9f3",flex:1}}/>
                  {pmBtn("Inversion")}
                </div>
              </div>

              {/* Ahorros */}
              <GroupLabel text="Ahorro"/>
              <div className="glass" style={{padding:"20px 22px"}}>
                {AHORRO.map((item,i)=>{
                  const total=ahorros[item.id]?.total||0, aporte=ahorros[item.id]?.aporte||"";
                  return (
                    <div key={item.id} style={{marginBottom:i<AHORRO.length-1?20:0,paddingBottom:i<AHORRO.length-1?20:0,borderBottom:i<AHORRO.length-1?"1px solid rgba(255,255,255,0.07)":"none",position:"relative"}}>
                      <div style={{position:"absolute",right:0,top:0,fontSize:36,opacity:0.07,pointerEvents:"none",userSelect:"none"}}>{item.icon}</div>
                      <div style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:22,fontWeight:500,color:"#f1f0f9"}}>{item.label}</span>
                            <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{item.desc}</span>
                          </div>
                          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#7dffaa",letterSpacing:"-0.5px"}}>{fmtCOP(total)}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <input type="number" placeholder="Ingresar valor…" value={ahorros[item.id]?._raw??(aporte||"")}
                          onChange={e=>setAhorros(p=>({...p,[item.id]:{...p[item.id],aporte:parseFloat(e.target.value)||0,_raw:e.target.value}}))}
                          style={{...inputSt,fontSize:13,color:"#e2d9f3",flex:1}}/>
                        {pmBtn(item.id)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── DISTRIBUCIÓN ── */}
        {tab==="history" && (()=>{
          const sueldo=salaries.david||0;
          const saludPension=sueldo*0.08;
          const gastoHogar=["Arriendo","Internet","Servicios"].reduce((s,c)=>s+((hogar[c]||0)*pctD),0);
          const cuotasTarjetas=["Nu","Falabella","Addi"].reduce((s,t)=>s+(deudas[t]?.cuota||0),0);
          const carroCuota=deudas["Cuota carro"]?.cuota||1521807;
          const cuotasDeudas=(carroCuota*pctD)+(deudas["Icetex"]?.cuota||73837);
          const totalFijo=saludPension+gastoHogar+cuotasTarjetas+cuotasDeudas;
          const disponible=sueldo-totalFijo;

          const Q=({q})=>{
            const badges={ambas:["1ra","2da"],"1ra":["1ra"],"2da":["2da"]};
            return <span style={{display:"inline-flex",gap:3,marginLeft:6}}>
              {["1ra","2da"].map(n=>{const a=(q==="ambas")||(q===n);return <span key={n} style={{fontSize:8,padding:"1px 5px",borderRadius:4,background:a?"rgba(168,85,247,0.2)":"rgba(255,255,255,0.05)",color:a?"#c084fc":"rgba(255,255,255,0.2)",fontWeight:a?600:400}}>{n}</span>;})}
            </span>;
          };

          const Line=({label,value,color="#e8e6f0",sub,q,indent=false,collapsible=false,open=false,onToggle})=>(
            <div onClick={collapsible?onToggle:undefined} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`${indent?"10px 0 10px 20px":"16px 0"}`,borderBottom:"1px solid rgba(255,255,255,0.06)",cursor:collapsible?"pointer":"default"}}>
              <div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <span style={{fontSize:indent?16:20,color:indent?"rgba(255,255,255,0.6)":"#f1f0f9",fontWeight:indent?400:500}}>{label}</span>
                  {q&&<Q q={q}/>}
                  {collapsible&&<span style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginLeft:6}}>{open?"▲":"▼"}</span>}
                </div>
                {sub&&<div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3}}>{sub}</div>}
              </div>
              <div style={{fontSize:indent?16:22,fontFamily:"'DM Serif Display',serif",color,textAlign:"right"}}>{fmtCOP(value)}</div>
            </div>
          );

          return (
            <div className="section-fade">
              <div className="glass" style={{padding:"22px",marginBottom:14}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Distribución mensual · David</div>
                <Line label="💼 Sueldo" value={sueldo} color="#7dffaa"/>
                <Line label="🏥 Salud y pensión" value={saludPension} color="#ff8a8a" sub="8% del sueldo" q="ambas"/>
                <Line label="🏠 Gastos del hogar" value={gastoHogar} color="#ff8a8a" sub={`${(pctD*100).toFixed(0)}% según sueldo`} collapsible open={openHogar} onToggle={()=>setOpenHogar(v=>!v)}/>
                {openHogar&&["Arriendo","Internet","Servicios"].filter(c=>hogar[c]>0).map(c=>(
                  <Line key={c} label={c} value={(hogar[c]||0)*pctD} indent q={c==="Arriendo"?"2da":"1ra"}/>
                ))}
                <Line label="💳 Cuotas tarjetas" value={cuotasTarjetas} color="#ff8a8a" sub="Nu · Falabella · Addi" collapsible open={openTarjetas} onToggle={()=>setOpenTarjetas(v=>!v)}/>
                {openTarjetas&&["Nu","Falabella","Addi"].filter(t=>deudas[t]?.cuota>0).map(t=>(
                  <Line key={t} label={t} value={deudas[t]?.cuota||0} indent q={t==="Addi"?"1ra":"2da"}/>
                ))}
                <Line label="📋 Cuotas deudas" value={cuotasDeudas} color="#ff8a8a" collapsible open={openDeudas} onToggle={()=>setOpenDeudas(v=>!v)}/>
                {openDeudas&&<>
                  <Line label="Carro" value={carroCuota*pctD} sub={`${(pctD*100).toFixed(0)}% de ${fmtCOP(carroCuota)}`} indent q="1ra"/>
                  <Line label="Icetex" value={deudas["Icetex"]?.cuota||73837} indent q="1ra"/>
                </>}
                <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 0",marginTop:4,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:500}}>Total gastos fijos</span>
                  <span style={{fontSize:15,fontFamily:"'DM Serif Display',serif",color:"#ff8a8a"}}>{fmtCOP(totalFijo)}</span>
                </div>
              </div>

              {/* Disponible + quincenas */}
              {(() => {
                const q1 = ((hogar["Internet"]||0)+(hogar["Servicios"]||0))*pctD
                  + (deudas["Addi"]?.cuota||0)
                  + (carroCuota*pctD)
                  + (deudas["Icetex"]?.cuota||73837);
                const q2 = (hogar["Arriendo"]||0)*pctD
                  + (deudas["Nu"]?.cuota||0)
                  + (deudas["Falabella"]?.cuota||0);
                const cardSt = {padding:"18px 16px",flex:1};
                return (
                  <div style={{display:"flex",gap:10,alignItems:"stretch"}}>
                    <div className="glass" style={{...cardSt,background:disponible>=0?"rgba(52,211,153,0.06)":"rgba(239,68,68,0.06)",borderColor:disponible>=0?"rgba(52,211,153,0.2)":"rgba(239,68,68,0.18)"}}>
                      <div style={{fontSize:9,color:disponible>=0?"rgba(125,255,170,0.6)":"rgba(255,100,100,0.6)",letterSpacing:2,marginBottom:6}}>DISPONIBLE</div>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:disponible>=0?"#7dffaa":"#ff6666",letterSpacing:"-0.5px"}}>{fmtCOP(disponible)}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
                      <div className="glass" style={{...cardSt}}>
                        <div style={{fontSize:9,color:"rgba(200,184,255,0.6)",letterSpacing:2,marginBottom:6}}>MITAD DE MES</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#c8b8ff",letterSpacing:"-0.5px"}}>{fmtCOP(q1)}</div>
                      </div>
                      <div className="glass" style={{...cardSt}}>
                        <div style={{fontSize:9,color:"rgba(249,168,212,0.6)",letterSpacing:2,marginBottom:6}}>FIN DE MES</div>
                        <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#f9a8d4",letterSpacing:"-0.5px"}}>{fmtCOP(q2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

      </div>

      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(17,24,39,0.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"10px 16px 22px",display:"flex",gap:8}}>
        {tabs.map(t=>{
          const active = tab===t.id;
          return (
            <button key={t.id} className="tab-btn" onClick={()=>setTab(t.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"8px 4px",borderRadius:16,
                background:active?"rgba(168,85,247,0.18)":"transparent",
                border:active?"1px solid rgba(168,85,247,0.3)":"1px solid transparent",
                color:active?"#d8b4fe":"rgba(255,255,255,0.35)",
                transition:"all .2s"}}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <span style={{fontSize:9,letterSpacing:.5,fontWeight:active?700:400,textTransform:"uppercase"}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
