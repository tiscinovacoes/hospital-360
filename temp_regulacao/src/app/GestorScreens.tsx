import { useState, useRef, useEffect } from "react";
import {
  Upload, Users, Bot, Wifi, FileText, Calendar, Zap,
  ArrowRightLeft, CheckCircle2, Clock, XCircle, Send,
  ChevronRight, Activity, TrendingUp, CloudUpload, X,
  Check, Search, User, Building2, ClipboardList, BarChart2,
  Shield, Lock, Eye, RefreshCw, Plus, Download, Filter,
  AlertTriangle, Phone, MapPin, Stethoscope, QrCode,
  ChevronDown, Edit3, FileDown, LogOut, ArrowUp, ArrowDown,
  Minus, LayoutDashboard, Hospital, UserPlus, ScanLine,
  MoveUp, MoveDown, ArrowUpDown, ClipboardCheck,
  Star, RotateCcw, PhoneCall, AlertCircle, Copy,
  Repeat2, Flame, ShieldAlert, UserCheck, LogIn,
  Mail, ToggleLeft, ToggleRight, ListFilter, MessageSquare,
  SendHorizontal, Inbox, TimerReset, Percent,
  Truck, Package, Pill, Route, Bus, Boxes, BadgeCheck,
  Navigation, Map, FlaskConical, Kanban, Car,
  ChevronLeft, MoreHorizontal, GripVertical, Info,
  UserCog, Syringe, Clipboard, TrendingDown, Hash,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  PatientStatus, Priority, CheckinStatus, Patient, Clinic, AuditLog,
  BASE_PATIENTS, CLINICS, AUDIT_LOGS, WEEK_DATA, SPECIALTY_DATA, ACTIVITY_FEED,
  STATUS_CFG, PRIORITY_CFG, CHECKIN_CFG,
  StatusTag, PriorityBadge, WaIcon, calcAge,
} from "./shared";

export function DashboardScreen() {
  const kpis = [
    { label:"Confirmados no Mês",  value:"219", sub:"+12% vs anterior", trend:"up",      color:"text-emerald-600", bg:"bg-emerald-50",  border:"border-emerald-200", icon:<CheckCircle2 size={18} className="text-emerald-600"/> },
    { label:"Taxa de Absenteísmo", value:"14%", sub:"41 vagas perdidas",  trend:"down",    color:"text-red-600",     bg:"bg-red-50",      border:"border-red-200",     icon:<XCircle size={18} className="text-red-500"/> },
    { label:"Cancelamentos",       value:"41",  sub:"38 filas avançadas", trend:"neutral", color:"text-orange-600",  bg:"bg-orange-50",   border:"border-orange-200",  icon:<AlertTriangle size={18} className="text-orange-500"/> },
    { label:"Avanços Automáticos", value:"38",  sub:"Por timeout/recusa", trend:"up",      color:"text-blue-600",    bg:"bg-blue-50",     border:"border-blue-200",    icon:<ArrowUpDown size={18} className="text-blue-500"/> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Dashboard Gerencial</h1><p className="text-sm text-muted-foreground mt-0.5">Visão geral · Julho 2025</p></div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>WhatsApp Conectado</div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k=>(
          <div key={k.label} className={`bg-card rounded-xl border ${k.border} p-5`}>
            <div className="flex items-start justify-between mb-3"><div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center`}>{k.icon}</div>{k.trend==="up"?<ArrowUp size={13} className="text-emerald-500 mt-1"/>:k.trend==="down"?<ArrowDown size={13} className="text-red-500 mt-1"/>:<Minus size={13} className="text-gray-400 mt-1"/>}</div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs font-semibold mt-0.5">{k.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <p className="text-sm font-semibold mb-0.5">Produtividade Semanal</p>
          <p className="text-xs text-muted-foreground mb-4">Confirmações vs. Recusas</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={WEEK_DATA}>
              <CartesianGrid key="lc-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
              <XAxis key="lc-x" dataKey="day" tick={{ fontSize:11, fill:"#8896a5" }} axisLine={false} tickLine={false}/>
              <YAxis key="lc-y" tick={{ fontSize:11, fill:"#8896a5" }} axisLine={false} tickLine={false}/>
              <Tooltip key="lc-tip" contentStyle={{ border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }}/>
              <Legend key="lc-legend" iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }}/>
              <Line key="lc-conf" type="monotone" dataKey="confirmados" stroke="#059669" strokeWidth={2.5} dot={{ r:3, fill:"#059669" }} name="Confirmados"/>
              <Line key="lc-rec"  type="monotone" dataKey="recusados"   stroke="#DC2626" strokeWidth={2}   dot={{ r:3, fill:"#DC2626" }} name="Recusados" strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><Activity size={13} className="text-primary"/><p className="text-sm font-semibold">Atividades Recentes</p></div>
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {ACTIVITY_FEED.map((a,i)=>(
              <div key={i} className="flex gap-2.5">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-2 h-2 rounded-full ${a.color} mt-0.5 shrink-0`}/>
                  {i<ACTIVITY_FEED.length-1&&<div className="w-px flex-1 bg-border mt-1"/>}
                </div>
                <div className="pb-2 min-w-0"><p className="text-[10px] font-mono text-muted-foreground">{a.time}</p><p className="text-[11px] leading-snug">{a.msg}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-sm font-semibold mb-4">Confirmações por Especialidade — Mês atual</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={SPECIALTY_DATA} barSize={26}>
            <CartesianGrid key="bc-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
            <XAxis key="bc-x" dataKey="name" tick={{ fontSize:11, fill:"#8896a5" }} axisLine={false} tickLine={false}/>
            <YAxis key="bc-y" tick={{ fontSize:11, fill:"#8896a5" }} axisLine={false} tickLine={false}/>
            <Tooltip key="bc-tip" contentStyle={{ border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }}/>
            <Legend key="bc-legend" iconType="square" iconSize={9} wrapperStyle={{ fontSize:11 }}/>
            <Bar key="bc-conf" dataKey="confirmed" fill="#059669" radius={[4,4,0,0]} name="Confirmados"/>
            <Bar key="bc-ref"  dataKey="refused"   fill="#FCA5A5" radius={[4,4,0,0]} name="Recusados"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Upload ───────────────────────────────────────────────────────────────────────

export const UPLOAD_HISTORY = [
  { id:"1", date:"02/07/2025 09:14", file:"agenda_mamografia_jul.pdf",  hash:"a1b2c3", patients:24, specialty:"Mamografia",        status:"done"      },
  { id:"2", date:"01/07/2025 14:30", file:"agenda_buco_maxilo.pdf",     hash:"d4e5f6", patients:18, specialty:"Buco Maxilo Facial", status:"done"      },
  { id:"3", date:"01/07/2025 08:55", file:"agenda_ortopedia_jun.pdf",   hash:"g7h8i9", patients:31, specialty:"Ortopedia",          status:"done"      },
  { id:"4", date:"30/06/2025 16:02", file:"agenda_geral_semana27.pdf",  hash:"j0k1l2", patients:47, specialty:"Geral",              status:"done"      },
  { id:"5", date:"29/06/2025 11:20", file:"agenda_mamografia_jun.pdf",  hash:"a1b2c3", patients:22, specialty:"Mamografia",        status:"duplicate" },
];

export function UploadScreen() {
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash]       = useState<"success"|"duplicate"|null>(null);
  const [showDupAlert, setShowDupAlert] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = () => {
    setDragging(false);
    const isDup = Math.random() > 0.5;
    if (isDup) { setFlash("duplicate"); setShowDupAlert(true); }
    else { setFlash("success"); }
    setTimeout(() => setFlash(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Upload de Listas PDF</h1><p className="text-sm text-muted-foreground mt-0.5">Importe arquivos exportados do AIVO</p></div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>WhatsApp Conectado</div>
      </div>

      {showDupAlert && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0"/>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">⚠️ PDF Duplicado Detectado</p>
            <p className="text-xs text-amber-700 mt-0.5">Este arquivo já foi importado anteriormente (02/07/2025 09:14). Pacientes duplicados não serão adicionados à fila.</p>
            <div className="mt-2 flex gap-2">
              <button className="text-xs font-semibold text-amber-800 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-md transition-colors">Forçar Reimportação</button>
              <button onClick={()=>setShowDupAlert(false)} className="text-xs font-semibold text-amber-600 hover:text-amber-800 px-3 py-1 transition-colors">Ignorar</button>
            </div>
          </div>
          <button onClick={()=>setShowDupAlert(false)}><X size={14} className="text-amber-500"/></button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2" onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();handleDrop();}} onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={()=>handleDrop()}/>
          <div className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-14 px-8 ${dragging?"border-primary bg-blue-50":flash==="duplicate"?"border-amber-400 bg-amber-50":flash==="success"?"border-emerald-400 bg-emerald-50":"border-border bg-card hover:border-primary/40 hover:bg-accent/30"}`}>
            {flash==="duplicate" ? (<><div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3"><AlertTriangle size={28} className="text-amber-600"/></div><p className="font-semibold text-amber-700">Arquivo duplicado detectado!</p></>)
            : flash==="success" ? (<><div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3"><Check size={28} className="text-emerald-600"/></div><p className="font-semibold text-emerald-700">Processando…</p></>)
            : (<>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${dragging?"bg-primary":"bg-secondary"}`}><CloudUpload size={26} className={dragging?"text-white":"text-primary"}/></div>
              <p className="text-base font-semibold">{dragging?"Solte o arquivo aqui":"Arraste e solte o PDF"}</p>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
              <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border"><FileText size={13} className="text-primary"/><span className="text-xs font-medium text-secondary-foreground">Apenas .PDF exportados do AIVO</span></div>
            </>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3"><span className="text-sm font-semibold">Status API</span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.6)]"/></div>
            <div className="w-24 h-24 mx-auto bg-gray-50 rounded-lg border border-border flex items-center justify-center mb-3"><QrCode size={56} className="text-gray-700"/></div>
            <p className="text-xs text-center font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1">✓ Conectado · 3h 22min</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Proteção de Dados</p>
            {[["Verificação de hash MD5","✓"],["Bloqueio de re-upload","✓"],["Detecção de duplicatas","✓"]].map(([k,v])=>(
              <div key={k as string} className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-0"><span className="text-xs text-muted-foreground">{k}</span><span className="text-xs font-bold text-emerald-600">{v}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2"><TrendingUp size={14} className="text-primary"/><span className="text-sm font-semibold">Histórico de Uploads</span></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">{["Data / Hora","Arquivo","Especialidade","Pacientes","Status"].map((h,i)=><th key={h} className={`px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i>=3?"text-right":"text-left"}`}>{h}</th>)}</tr></thead>
          <tbody>
            {UPLOAD_HISTORY.map((u,i)=>(
              <tr key={u.id} className={`border-b border-border/60 hover:bg-accent/20 ${i%2?"bg-muted/10":""}`}>
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{u.date}</td>
                <td className="px-5 py-3"><div className="flex items-center gap-2"><FileText size={12} className="text-primary"/><span className="text-xs font-medium">{u.file}</span></div></td>
                <td className="px-5 py-3"><span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">{u.specialty}</span></td>
                <td className="px-5 py-3 text-right text-xs font-bold">{u.patients}</td>
                <td className="px-5 py-3 text-right">
                  {u.status==="done"      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><Check size={10}/>Concluído</span>
                  : u.status==="duplicate"? <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle size={10}/>Duplicado</span>
                  :                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><X size={10}/>Erro</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Queue ────────────────────────────────────────────────────────────────────────

export const QUEUE_GROUPS = [
  { key:"Mamografia",  color:"#1A5CA8", border:"#93BDE0", atendimento:"14 min", fila:"38 min" },
  { key:"Buco Maxilo", color:"#7C3AED", border:"#C4B5FD", atendimento:"22 min", fila:"55 min" },
  { key:"Ortopedia",   color:"#D97706", border:"#FCD34D", atendimento:"18 min", fila:"41 min" },
  { key:"Geral",       color:"#059669", border:"#6EE7B7", atendimento:"11 min", fila:"27 min" },
];

export function UpdatePhoneModal({ patient, onClose }: { patient:Patient; onClose:()=>void }) {
  const [phone, setPhone] = useState(patient.phone);
  const [done, setDone]   = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-96 p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><p className="font-bold text-sm">✏️ Atualizar Número</p><button onClick={onClose}><X size={15} className="text-muted-foreground"/></button></div>
        {!done ? (
          <>
            <p className="text-xs text-muted-foreground mb-4">Corrija o telefone de <strong>{patient.name}</strong> e re-dispare o bot automaticamente.</p>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Novo número WhatsApp</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 border border-border rounded-lg px-3 bg-background flex-1"><WaIcon/><input value={phone} onChange={e=>setPhone(e.target.value)} className="flex-1 text-sm font-mono outline-none py-2 bg-transparent" placeholder="(67) 99999-0000"/></div>
              </div>
            </div>
            <button onClick={()=>setDone(true)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Salvar e Re-disparar Bot</button>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3"><Check size={24} className="text-emerald-600"/></div>
            <p className="font-bold">Número atualizado!</p>
            <p className="text-xs text-muted-foreground mt-1">Mensagem re-disparada para {phone}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ManualCallModal({ patient, onClose }: { patient:Patient; onClose:()=>void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-96 p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><p className="font-bold text-sm">📞 Ligar Manualmente</p><button onClick={onClose}><X size={15} className="text-muted-foreground"/></button></div>
        <p className="text-xs text-muted-foreground mb-4">Números cadastrados para <strong>{patient.name}</strong> no AIVO:</p>
        <div className="space-y-2">
          {([["Principal", patient.phone],["Secundário", patient.phone2||"Não informado"],["Outro contato", patient.phone3||"Não informado"]] as [string,string][]).map(([label,num])=>(
            <div key={label} className={`flex items-center justify-between p-3 rounded-xl border ${num==="Não informado"?"border-border bg-muted/30 opacity-50":"border-emerald-200 bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors"}`}>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-sm font-mono font-semibold">{num}</p>
              </div>
              {num!=="Não informado"&&<div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center"><PhoneCall size={15} className="text-white"/></div>}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 text-center">Após confirmar presença por telefone, atualize o status manualmente.</p>
      </div>
    </div>
  );
}

export function MoveModal({ patient, onClose }: { patient:Patient; onClose:()=>void }) {
  const [done, setDone]    = useState(false);
  const [chosen, setChosen] = useState("");
  const opts = [
    { icon:<ArrowUpDown size={16} className="text-primary"/>,  label:"Mover para outra fila interna",    sub:"Redirecionar para Ortopedia, Geral ou Buco Maxilo" },
    { icon:<Building2 size={16} className="text-purple-600"/>, label:"Transferir para Clínica Parceira", sub:"Encaminhar para prestador credenciado"             },
    { icon:<MoveUp size={16} className="text-emerald-600"/>,   label:"Subir na prioridade",              sub:"Mover para cima na ordem de atendimento"           },
    { icon:<MoveDown size={16} className="text-orange-500"/>,  label:"Descer na prioridade",             sub:"Mover para baixo na ordem de atendimento"          },
  ];
  if (done) return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-80 p-7 text-center" onClick={e=>e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3"><Check size={28} className="text-emerald-600"/></div>
        <p className="font-bold">Concluído</p><p className="text-sm text-muted-foreground mt-1">{chosen}</p>
        <button onClick={onClose} className="mt-5 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold">Fechar</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-96 overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between"><div><p className="text-sm font-bold">⇄ Mover Paciente</p><p className="text-xs text-muted-foreground">{patient.name} · {patient.procedure}</p></div><button onClick={onClose}><X size={15} className="text-muted-foreground"/></button></div>
        <div className="p-4 space-y-2">
          {opts.map(opt=>(
            <button key={opt.label} onClick={()=>{setChosen(opt.label);setDone(true);}} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/30 transition-all text-left group">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-secondary">{opt.icon}</div>
              <div><p className="text-sm font-semibold">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.sub}</p></div>
              <ChevronRight size={13} className="text-muted-foreground ml-auto shrink-0"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddPatientModal({ onClose }: { onClose:()=>void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-[480px] overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between"><p className="text-sm font-bold">+ Adicionar Paciente Manualmente</p><button onClick={onClose}><X size={15} className="text-muted-foreground"/></button></div>
        <div className="p-6">
          {!saved ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {([["Nome Completo","text","col-span-2"],["CPF","text",""],["Cartão SUS","text",""],["Telefone Principal","tel",""],["Telefone Secundário","tel",""]] as [string,string,string][]).map(([l,t,s])=>(<div key={l} className={s}><label className="block text-xs font-semibold text-muted-foreground mb-1">{l}</label><input type={t} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary transition-colors"/></div>))}
                <div><label className="block text-xs font-semibold text-muted-foreground mb-1">Procedimento</label><div className="relative"><select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary appearance-none transition-colors"><option>Mamografia</option><option>Ortopedia</option><option>Buco Maxilo</option><option>Geral</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/></div></div>
                <div><label className="block text-xs font-semibold text-muted-foreground mb-1">Prioridade</label><div className="relative"><select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary appearance-none transition-colors"><option value="normal">Normal</option><option value="preferential">Preferencial</option><option value="priority1">Prioridade 1</option><option value="critical">Crítico</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/></div></div>
              </div>
              <button onClick={()=>setSaved(true)} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Adicionar à Fila</button>
            </div>
          ) : (
            <div className="text-center py-4"><div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3"><Check size={28} className="text-emerald-600"/></div><p className="font-bold">Adicionado!</p><p className="text-sm text-muted-foreground mt-1">Paciente na fila — aguardando disparo.</p><button onClick={onClose} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Fechar</button></div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SurveyBanner({ patientName, onDismiss }: { patientName:string; onDismiss:()=>void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-[#2577CC] px-4 py-2 flex items-center gap-2">
        <Star size={13} className="text-yellow-300"/>
        <span className="text-white text-xs font-bold">Pesquisa de Satisfação Agendada</span>
        <button onClick={onDismiss} className="ml-auto"><X size={13} className="text-white/70 hover:text-white"/></button>
      </div>
      <div className="p-4">
        <p className="text-xs text-foreground">Presença de <strong>{patientName}</strong> confirmada com sucesso.</p>
        <p className="text-xs text-muted-foreground mt-1">Mensagem de satisfação será enviada automaticamente via WhatsApp em <strong>2 horas</strong>.</p>
        <div className="mt-3 bg-muted/40 rounded-lg p-2 text-[11px] font-mono text-muted-foreground">"Avalie de 1 a 5 seu atendimento na Clínica Diagnóstica CG…"</div>
      </div>
    </div>
  );
}

// ─── Dispatch Motor ───────────────────────────────────────────────────────────────

export interface DispatchState {
  queue: string; color: string;
  targets: Patient[]; sentCount: number;
  countdown: number; done: boolean;
}

export function DispatchMotorPanel({ state, onDismiss }: { state: DispatchState; onDismiss: () => void }) {
  const pct = state.targets.length ? Math.round((state.sentCount / state.targets.length) * 100) : 0;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[480px] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: state.color }}>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-white" />
          <span className="text-white text-sm font-bold">Motor de Disparo · Fila {state.queue}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-xs font-mono bg-white/15 px-2 py-0.5 rounded">⏱ delay 30s entre envios</span>
          {state.done && <button onClick={onDismiss}><X size={14} className="text-white/80 hover:text-white" /></button>}
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">{state.done ? "✅ Disparo concluído!" : `Enviando ${state.sentCount + 1} de ${state.targets.length}…`}</span>
          <span className="text-sm font-bold" style={{ color: state.color }}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: state.color }} />
        </div>
        {!state.done && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Enviando para: <strong className="text-foreground">{state.targets[state.sentCount]?.name ?? "—"}</strong></span>
            <span className="flex items-center gap-1.5 font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg font-semibold">
              <Clock size={10} /> Próximo em {state.countdown}s
            </span>
          </div>
        )}
        {state.done && <p className="text-xs text-muted-foreground">{state.targets.length} mensagens enviadas · Motor anti-bloqueio ativo durante todo o disparo</p>}
        <div className="mt-3 space-y-1 max-h-28 overflow-y-auto">
          {state.targets.slice(0, state.sentCount).map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-[11px]">
              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
              <span className="text-foreground font-medium">{p.name}</span>
              <span className="text-muted-foreground ml-auto font-mono">{p.phone}</span>
            </div>
          ))}
          {!state.done && state.sentCount < state.targets.length && (
            <div className="flex items-center gap-2 text-[11px]">
              <RefreshCw size={11} className="text-blue-500 shrink-0 animate-spin" />
              <span className="text-blue-600 font-medium">{state.targets[state.sentCount]?.name}</span>
              <span className="text-muted-foreground ml-auto">enviando…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Specialty Detail Screen ──────────────────────────────────────────────────────

export interface SpecialtyGroup {
  key: string; color: string; border: string; atendimento: string; fila: string;
}

export const PRIORITY_ORDER: Priority[] = ["critical", "priority1", "preferential", "normal"];

export const PRIORITY_SECTION_CFG: Record<Priority, { label:string; icon:React.ReactNode; bg:string; headerBg:string; border:string; dot:string }> = {
  critical:     { label:"Crítico",      icon:<Flame size={13} className="text-red-600"/>,    bg:"bg-red-50",    headerBg:"bg-red-100",   border:"border-red-300",   dot:"bg-red-500" },
  priority1:    { label:"Prioridade 1", icon:<ShieldAlert size={13} className="text-orange-600"/>, bg:"bg-orange-50", headerBg:"bg-orange-100",border:"border-orange-300",dot:"bg-orange-500" },
  preferential: { label:"Preferencial", icon:<UserCheck size={13} className="text-blue-600"/>,bg:"bg-blue-50",   headerBg:"bg-blue-100",  border:"border-blue-300",  dot:"bg-blue-500" },
  normal:       { label:"Normal",        icon:<Users size={13} className="text-gray-500"/>,   bg:"bg-white",     headerBg:"bg-gray-100",  border:"border-gray-200",  dot:"bg-gray-400" },
};

export function SpecialtyDetailScreen({ grp, allPatients, onBack }: { grp: SpecialtyGroup; allPatients: Patient[]; onBack: () => void }) {
  const [patients, setPatients] = useState<Patient[]>(allPatients);
  const [dispatch, setDispatch] = useState<DispatchState | null>(null);
  const [dispatchPriority, setDispatchPriority] = useState<Priority | null>(null);
  const [autoDispatch, setAutoDispatch] = useState<Record<Priority, boolean>>({
    critical: true, priority1: true, preferential: true, normal: true,
  });
  const [searchQ, setSearchQ] = useState("");
  const [updatePhoneP, setUpdateP] = useState<Patient|null>(null);
  const [callP, setCallP] = useState<Patient|null>(null);
  const [chatP, setChatP] = useState<Patient|null>(null);
  const [moveP, setMoveP] = useState<Patient|null>(null);
  const dispatchRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const DELAY_MS = 1800;

  // Only patients matching this specialty
  const specPatients = patients.filter(p =>
    p.procedure.toLowerCase().includes(grp.key.toLowerCase().split(" ")[0])
  );

  const filtered = specPatients.filter(p =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.phone.includes(searchQ)
  );

  // KPI calculations
  const total      = specPatients.length;
  const confirmed  = specPatients.filter(p => p.status === "confirmed").length;
  const refused    = specPatients.filter(p => p.status === "refused").length;
  const waiting    = specPatients.filter(p => p.status === "waiting").length;
  const sent       = specPatients.filter(p => p.status === "sent").length;
  const failed     = specPatients.filter(p => ["failed","expired"].includes(p.status)).length;
  const rate       = total ? Math.round((confirmed / total) * 100) : 0;

  const fireByPriority = (priority: Priority) => {
    const queue = filtered.filter(p => (p.priority || "normal") === priority && p.status === "waiting");
    if (!queue.length) return;
    setDispatchPriority(priority);
    const state: DispatchState = { queue: `${grp.key} · ${PRIORITY_SECTION_CFG[priority].label}`, color: grp.color, targets: queue, sentCount: 0, countdown: 30, done: false };
    setDispatch(state);
    dispatchRef.current.forEach(clearTimeout);
    dispatchRef.current = [];
    queue.forEach((p, idx) => {
      const sendT = setTimeout(() => {
        setPatients(prev => prev.map(x => x.id === p.id ? { ...x, status: "sent" as PatientStatus } : x));
        setDispatch(prev => prev ? { ...prev, sentCount: idx + 1, countdown: 30, done: idx === queue.length - 1 } : null);
        if (idx === queue.length - 1) setDispatchPriority(null);
      }, DELAY_MS * (idx + 1));
      dispatchRef.current.push(sendT);
    });
  };

  const fireAll = () => {
    PRIORITY_ORDER.forEach((p, i) => { setTimeout(() => fireByPriority(p), i * 400); });
  };

  const groupedByPriority = PRIORITY_ORDER.map(priority => ({
    priority,
    patients: filtered.filter(p => (p.priority || "normal") === priority),
  })).filter(g => g.patients.length > 0);

  const kpis = [
    { label:"Total", value:String(total), icon:<Users size={15}/>, color:"text-foreground", bg:"bg-secondary", sub:"na especialidade" },
    { label:"Aguardando Disparo", value:String(waiting), icon:<Clock size={15}/>, color:"text-gray-600", bg:"bg-gray-100", sub:"na fila" },
    { label:"Enviados", value:String(sent), icon:<Send size={15}/>, color:"text-blue-700", bg:"bg-blue-100", sub:"aguardando resposta" },
    { label:"Confirmados", value:String(confirmed), icon:<CheckCircle2 size={15}/>, color:"text-emerald-700", bg:"bg-emerald-100", sub:"presença confirmada" },
    { label:"Recusados", value:String(refused), icon:<XCircle size={15}/>, color:"text-orange-700", bg:"bg-orange-100", sub:"cancelamentos" },
    { label:"Falhas/Expirados", value:String(failed), icon:<AlertTriangle size={15}/>, color:"text-red-700", bg:"bg-red-100", sub:"atenção requerida" },
    { label:"Taxa de Confirmação", value:`${rate}%`, icon:<Percent size={15}/>, color:rate>=80?"text-emerald-700":rate>=60?"text-amber-600":"text-red-700", bg:rate>=80?"bg-emerald-100":rate>=60?"bg-amber-100":"bg-red-100", sub:"do total de enviados" },
    { label:"T. Atendimento", value:grp.atendimento, icon:<TimerReset size={15}/>, color:"text-purple-700", bg:"bg-purple-100", sub:"média por paciente" },
    { label:"T. de Fila", value:grp.fila, icon:<Clock size={15}/>, color:"text-indigo-700", bg:"bg-indigo-100", sub:"espera média" },
  ];

  const waitingAll = filtered.filter(p => p.status === "waiting").length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronRight size={13} className="rotate-180"/>Filas
          </button>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: grp.color }}/>
            <span className="text-sm font-bold">{grp.key}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 bg-background">
              <Search size={12} className="text-muted-foreground"/>
              <input
                value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Buscar paciente…"
                className="text-xs py-2 outline-none bg-transparent w-44 placeholder:text-muted-foreground"
              />
              {searchQ && <button onClick={()=>setSearchQ("")}><X size={11} className="text-muted-foreground"/></button>}
            </div>
            <button
              onClick={fireAll}
              disabled={waitingAll === 0}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-sm"
              style={{ background: waitingAll===0?"#94A3B8":grp.color, cursor:waitingAll===0?"not-allowed":"pointer" }}
            >
              <Zap size={13}/>Disparar Todas as Filas {waitingAll>0&&`(${waitingAll})`}
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-9 gap-2.5">
          {kpis.map(k=>(
            <div key={k.label} className={`${k.bg} rounded-xl p-3 flex flex-col`}>
              <div className={`w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center mb-2 ${k.color}`}>{k.icon}</div>
              <p className={`text-lg font-black leading-none ${k.color}`}>{k.value}</p>
              <p className="text-[10px] font-semibold text-foreground mt-0.5">{k.label}</p>
              <p className="text-[9px] text-muted-foreground">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority sections */}
      <div className="flex-1 overflow-y-auto px-7 py-4 space-y-4">
        {groupedByPriority.map(({ priority, patients: pList }) => {
          const cfg = PRIORITY_SECTION_CFG[priority];
          const waitingCount = pList.filter(p=>p.status==="waiting").length;
          const firing = dispatchPriority === priority;
          const enabled = autoDispatch[priority];

          return (
            <div key={priority} className={`rounded-xl border ${cfg.border} overflow-hidden`}>
              {/* Section header */}
              <div className={`${cfg.headerBg} px-5 py-3 flex items-center gap-3 border-b ${cfg.border}`}>
                <div className="flex items-center gap-2">
                  {cfg.icon}
                  <span className="text-sm font-bold">{cfg.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white`} style={{ background:grp.color }}>{pList.length} paciente{pList.length!==1?"s":""}</span>
                </div>

                {/* Mini KPIs for this priority */}
                <div className="flex items-center gap-3 ml-2 text-[11px]">
                  <span className="flex items-center gap-1 text-gray-600"><Clock size={10}/>{pList.filter(p=>p.status==="waiting").length} aguard.</span>
                  <span className="flex items-center gap-1 text-blue-600"><Send size={10}/>{pList.filter(p=>p.status==="sent").length} env.</span>
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={10}/>{pList.filter(p=>p.status==="confirmed").length} conf.</span>
                  <span className="flex items-center gap-1 text-red-600"><XCircle size={10}/>{pList.filter(p=>["refused","failed","expired"].includes(p.status)).length} probl.</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* Auto-dispatch toggle */}
                  <button
                    onClick={()=>setAutoDispatch(prev=>({...prev,[priority]:!prev[priority]}))}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${enabled?"bg-emerald-100 text-emerald-700":"bg-gray-100 text-gray-500"}`}
                  >
                    {enabled?<ToggleRight size={13}/>:<ToggleLeft size={13}/>}
                    Auto-disparo {enabled?"Ativo":"Inativo"}
                  </button>
                  {/* Dispatch button for this priority */}
                  <button
                    onClick={()=>enabled&&fireByPriority(priority)}
                    disabled={firing||waitingCount===0||!enabled}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95"
                    style={{ background:!enabled?"#9CA3AF":waitingCount===0?"#CBD5E1":grp.color, cursor:(!enabled||waitingCount===0)?"not-allowed":"pointer" }}
                  >
                    {firing?<><RefreshCw size={10} className="animate-spin"/>Enviando…</>:<><SendHorizontal size={10}/>Disparar {priority}{waitingCount>0?` (${waitingCount})`:""}</>}
                  </button>
                </div>
              </div>

              {/* Patient table */}
              <div className={`${cfg.bg}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/80">
                      {["Hora","Paciente","Telefone","Unidade","Status","Ações"].map((h,i)=>(
                        <th key={h} className={`px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider ${i===5?"text-right":"text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pList.map((p, i)=>(
                      <tr key={p.id} className={`border-b border-gray-200/50 last:border-0 transition-colors ${p.isNextInQueue?"bg-amber-50/60 hover:bg-amber-50":i%2===0?"hover:bg-black/[.02]":"bg-black/[.02] hover:bg-black/[.04]"}`}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {p.isNextInQueue&&<span className="text-[8px] font-bold bg-amber-400 text-amber-900 px-1 py-0.5 rounded">PRÓX.</span>}
                            <span className="font-mono text-xs font-bold">{p.time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{p.name.charAt(0)}</div>
                            <div>
                              <p className="text-xs font-semibold leading-tight">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.cpf||"—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <WaIcon/>
                            <span className="text-xs font-mono text-muted-foreground">{p.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={10} className="text-muted-foreground shrink-0"/>
                            <span className="text-xs text-muted-foreground">{p.unit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5"><StatusTag status={p.status}/></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {!["failed","expired","cancelled"].includes(p.status)&&(
                              <button onClick={()=>setChatP(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors"><MessageSquare size={9}/>Chat</button>
                            )}
                            {p.status==="waiting"&&(
                              <button onClick={()=>{setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"sent" as PatientStatus}:x));}} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md text-white transition-colors" style={{ background:grp.color }}><SendHorizontal size={9}/>Enviar</button>
                            )}
                            {p.status==="failed"&&(
                              <>
                                <button onClick={()=>setUpdateP(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"><Edit3 size={9}/>Nº</button>
                                <button onClick={()=>setCallP(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"><PhoneCall size={9}/>Ligar</button>
                              </>
                            )}
                            {p.status==="expired"&&(
                              <button onClick={()=>setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"waiting" as PatientStatus}:x))} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"><RefreshCw size={9}/>Re-disparar</button>
                            )}
                            {!["failed","expired","cancelled"].includes(p.status)&&(
                              <button onClick={()=>setMoveP(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors"><ArrowRightLeft size={9}/>Mover</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {groupedByPriority.length === 0 && (
          <div className="py-20 text-center">
            <Inbox size={36} className="text-muted-foreground mx-auto mb-3 opacity-40"/>
            <p className="text-muted-foreground">Nenhum paciente encontrado para "{searchQ}"</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {chatP&&(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={()=>setChatP(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-72 overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{chatP.name.charAt(0)}</div>
              <div className="flex-1"><p className="text-white text-xs font-semibold">{chatP.name}</p><p className="text-white/60 text-[10px]">{chatP.phone}</p></div>
              <button onClick={()=>setChatP(null)}><X size={14} className="text-white/70"/></button>
            </div>
            <div className="bg-[#ECE5DD] p-3 min-h-40 space-y-2">
              <div className="bg-white rounded-b-xl rounded-tr-xl p-3 shadow-sm max-w-[90%]">
                <p className="text-[11px] text-gray-800 leading-relaxed">Olá, <b>{chatP.name.split(" ")[0]}</b>! Você tem um atendimento de <b>{chatP.procedure}</b> em <b>02/07/2025</b> às <b>{chatP.time}</b>.<br/><br/>Digite <b>1</b> para ✅ Confirmar ou <b>2</b> para ❌ Cancelar.</p>
                <p className="text-[9px] text-gray-400 text-right mt-1">09:14 ✓✓</p>
              </div>
              {chatP.status==="confirmed"&&<div className="bg-[#DCF8C6] rounded-b-xl rounded-tl-xl p-2 shadow-sm ml-auto max-w-[50%]"><p className="text-[11px]">1</p><p className="text-[9px] text-gray-400 text-right">09:17 ✓✓</p></div>}
            </div>
          </div>
        </div>
      )}
      {updatePhoneP && <UpdatePhoneModal patient={updatePhoneP} onClose={()=>setUpdateP(null)}/>}
      {callP        && <ManualCallModal  patient={callP}        onClose={()=>setCallP(null)}/>}
      {moveP        && <MoveModal        patient={moveP}        onClose={()=>setMoveP(null)}/>}
      {dispatch     && <DispatchMotorPanel state={dispatch} onDismiss={()=>setDispatch(null)}/>}
    </div>
  );
}

// ─── Queue Screen ─────────────────────────────────────────────────────────────────

export function QueueScreen({ onSpecialtyDetail }: { onSpecialtyDetail: (grp: SpecialtyGroup) => void }) {
  const [patients, setPatients]   = useState<Patient[]>(BASE_PATIENTS);
  const [firingQueue, setFiringQ] = useState<string|null>(null);
  const [firedQueues, setFiredQs] = useState<string[]>([]);
  const [chatPatient, setChatP]   = useState<Patient|null>(null);
  const [movePatient, setMoveP]   = useState<Patient|null>(null);
  const [updatePhoneP, setUpdateP]= useState<Patient|null>(null);
  const [callP, setCallP]         = useState<Patient|null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [surveyFor, setSurveyFor] = useState<string|null>(null);
  const [date, setDate]           = useState("2025-07-02");
  const [dispatch, setDispatch]   = useState<DispatchState|null>(null);
  const dispatchRef               = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Selected specialty card — null means "show all"
  const [selectedSpec, setSelectedSpec] = useState<string|null>(null);
  // Priority filter per specialty: "all" | "alta" | "media" | "baixa"
  const [priorityFilter, setPriorityFilter] = useState<"all"|"alta"|"media"|"baixa">("all");
  // Dispatch toggles per specialty
  const [dispatchToggles, setDispatchToggles] = useState<Record<string,boolean>>({
    Mamografia: true, "Buco Maxilo": true, Ortopedia: true, Geral: true,
  });

  const DELAY_MS = 1800;

  const fireQueue = (key: string) => {
    const grp   = QUEUE_GROUPS.find(g => g.key === key)!;
    const queue = patients.filter(p =>
      p.procedure.toLowerCase().includes(key.toLowerCase().split(" ")[0]) && p.status === "waiting"
    );
    if (!queue.length) return;
    setFiringQ(key);
    const state: DispatchState = { queue: key, color: grp.color, targets: queue, sentCount: 0, countdown: 30, done: false };
    setDispatch(state);
    dispatchRef.current.forEach(clearTimeout);
    dispatchRef.current = [];
    queue.forEach((p, idx) => {
      const sendT = setTimeout(() => {
        setPatients(prev => prev.map(x => x.id === p.id ? { ...x, status: "sent" as PatientStatus } : x));
        setDispatch(prev => prev ? { ...prev, sentCount: idx + 1, countdown: 30, done: idx === queue.length - 1 } : null);
        if (idx === queue.length - 1) {
          setFiringQ(null);
          setFiredQs(prev => [...prev, key]);
          setTimeout(() => setFiredQs(prev => prev.filter(q => q !== key)), 3000);
        }
      }, DELAY_MS * (idx + 1));
      dispatchRef.current.push(sendT);
      if (idx < queue.length - 1) {
        for (let t = 1; t <= 5; t++) {
          const tickT = setTimeout(() => {
            setDispatch(prev => prev ? { ...prev, countdown: Math.max(0, 30 - Math.round((t / 5) * 30)) } : null);
          }, DELAY_MS * (idx + 1) + (DELAY_MS / 5) * t);
          dispatchRef.current.push(tickT);
        }
      }
    });
  };

  const revertCancellation = (id:string) => {
    setPatients(prev=>prev.map(p=>p.id===id?{...p,status:"waiting" as PatientStatus,cancelledAt:undefined}:p));
  };
  const canRevert = (p:Patient) => p.status==="cancelled" && p.cancelledAt && (Date.now()-p.cancelledAt<600000);

  const rowClass = (p:Patient, i:number) => {
    if (p.isNextInQueue) return "bg-amber-50 hover:bg-amber-100/60";
    if (p.status==="failed") return "bg-red-50/40 hover:bg-red-50";
    if (p.status==="expired") return "bg-amber-50/40 hover:bg-amber-50";
    if (p.status==="cancelled") return "bg-slate-50 hover:bg-slate-100/60";
    return i%2===0?"hover:bg-accent/20":"bg-muted/10 hover:bg-accent/20";
  };

  const priorityLevel = (p: Patient): "alta"|"media"|"baixa" => {
    if (p.priority === "critical" || p.priority === "priority1") return "alta";
    if (p.priority === "preferential") return "media";
    return "baixa";
  };

  // Filter table rows
  const visiblePatients = patients.filter(p => {
    const matchSpec = selectedSpec === null ||
      p.procedure.toLowerCase().includes(selectedSpec.toLowerCase().split(" ")[0]);
    const matchPriority = priorityFilter === "all" || priorityLevel(p) === priorityFilter;
    return matchSpec && matchPriority;
  });

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-7 pt-6 pb-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Filas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {selectedSpec ? `Fila de ${selectedSpec}` : `${patients.length} pacientes · Todas as especialidades`}
              {selectedSpec && <button onClick={()=>{setSelectedSpec(null);setPriorityFilter("all");}} className="ml-2 text-xs text-primary hover:underline">Ver todas</button>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"><Calendar size={13} className="text-muted-foreground"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="text-xs font-medium bg-transparent outline-none text-foreground"/></div>
            <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 bg-card border border-border text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary/40 hover:bg-accent/30 transition-colors"><UserPlus size={14}/>Adicionar Paciente</button>
          </div>
        </div>

        {/* Specialty cards — clickable to filter */}
        <div className="grid grid-cols-4 gap-3">
          {QUEUE_GROUPS.map(grp=>{
            const gp   = patients.filter(p=>p.procedure.toLowerCase().includes(grp.key.toLowerCase().split(" ")[0]));
            const wait = gp.filter(p=>p.status==="waiting").length;
            const conf = gp.filter(p=>p.status==="confirmed").length;
            const sent = gp.filter(p=>p.status==="sent").length;
            const ref  = gp.filter(p=>["refused","cancelled","expired","failed"].includes(p.status)).length;
            const pct  = gp.length?Math.round((conf/gp.length)*100):0;
            const isFiring=firingQueue===grp.key, isFired=firedQueues.includes(grp.key);
            const isSelected = false; // navigation handled by onSpecialtyDetail
            return (
              <div
                key={grp.key}
                onClick={()=>onSpecialtyDetail(grp)}
                className={`rounded-xl border p-4 bg-card cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]`}
                style={{ borderColor:grp.border }}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background:grp.color }}/>
                      <p className="text-[13px] font-bold">{grp.key}</p>
                      {isSelected && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background:grp.color }}>FILTRO</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{gp.length} pacientes</p>
                  </div>
                  <span className="text-lg font-black" style={{ color:grp.color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2"><div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:grp.color }}/></div>

                {/* Lead time KPIs */}
                <div className="grid grid-cols-2 gap-1 mb-2 text-[10px]">
                  <div className="bg-muted/50 rounded px-1.5 py-1">
                    <p className="text-muted-foreground leading-tight">T. Atend.</p>
                    <p className="font-bold text-foreground">{grp.atendimento}</p>
                  </div>
                  <div className="bg-muted/50 rounded px-1.5 py-1">
                    <p className="text-muted-foreground leading-tight">T. Fila</p>
                    <p className="font-bold text-foreground">{grp.fila}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                  <span className="text-gray-500">⏳ {wait} aguard.</span>
                  <span className="text-blue-600">📤 {sent} enviados</span>
                  <span className="text-emerald-600">✅ {conf} conf.</span>
                  <span className="text-red-500">❌ {ref} probl.</span>
                </div>

                {/* Dispatch toggle */}
                <div className="flex items-center justify-between mb-2" onClick={e=>e.stopPropagation()}>
                  <span className="text-[10px] text-muted-foreground">Auto-disparo</span>
                  <button
                    onClick={()=>setDispatchToggles(prev=>({...prev,[grp.key]:!prev[grp.key]}))}
                    className={`flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 transition-colors ${dispatchToggles[grp.key]?"bg-emerald-100 text-emerald-700":"bg-gray-100 text-gray-500"}`}
                  >
                    {dispatchToggles[grp.key]?<ToggleRight size={12}/>:<ToggleLeft size={12}/>}
                    {dispatchToggles[grp.key]?"Ativo":"Inativo"}
                  </button>
                </div>

                <button
                  onClick={e=>{e.stopPropagation();if(dispatchToggles[grp.key])fireQueue(grp.key);}}
                  disabled={isFiring||wait===0||!dispatchToggles[grp.key]}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95"
                  style={{ background:!dispatchToggles[grp.key]?"#9CA3AF":isFired?"#059669":wait===0?"#CBD5E1":grp.color, cursor:(wait===0||!dispatchToggles[grp.key])?"not-allowed":"pointer" }}
                >
                  {isFired?<><Check size={11}/>Enviado!</>:isFiring?<><RefreshCw size={11} className="animate-spin"/>Enviando…</>:<><Zap size={11}/>Disparar{wait>0?` (${wait})`:""}</>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Priority tabs — shown when a specialty is selected */}
        {selectedSpec && (
          <div className="flex items-center gap-1 mt-3 bg-muted/40 rounded-lg p-1 w-fit">
            {([["all","Todas"],["alta","Alta"],["media","Média"],["baixa","Baixa"]] as [typeof priorityFilter, string][]).map(([val, label])=>(
              <button
                key={val}
                onClick={()=>setPriorityFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${priorityFilter===val?"bg-card shadow-sm text-foreground":"text-muted-foreground hover:text-foreground"}`}
              >
                {val==="alta" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle"/>}
                {val==="media" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 align-middle"/>}
                {val==="baixa" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5 align-middle"/>}
                {label}
              </button>
            ))}
            <span className="ml-2 text-[11px] text-muted-foreground">{visiblePatients.length} paciente{visiblePatients.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-4">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Horário","Paciente / Prioridade","Telefone","Procedimento","Unidade","Status","Ações"].map((h,i)=><th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i===6?"text-right":"text-left"}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {visiblePatients.map((p,i)=>(
                <tr key={p.id} className={`border-b border-border/60 transition-colors ${rowClass(p,i)}`}>
                  <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold">{p.time}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.isNextInQueue&&<span className="inline-flex items-center gap-0.5 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"><ChevronRight size={8}/>PRÓXIMO</span>}
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">{p.name.charAt(0)}</div>
                      <div><p className="text-xs font-medium leading-tight">{p.name}</p>{p.priority&&p.priority!=="normal"&&<PriorityBadge priority={p.priority}/>}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-1.5"><WaIcon/><span className="text-xs font-mono text-muted-foreground">{p.phone}</span></div></td>
                  <td className="px-4 py-2.5 text-xs font-medium">{p.procedure}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-1"><Building2 size={10} className="text-muted-foreground shrink-0"/><span className="text-xs text-muted-foreground">{p.unit}</span></div></td>
                  <td className="px-4 py-2.5"><StatusTag status={p.status}/></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {!["failed","expired","cancelled"].includes(p.status)&&(
                        <button onClick={()=>setChatP(p)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors"><Eye size={10}/>Chat</button>
                      )}
                      {!["failed","expired","cancelled"].includes(p.status)&&(
                        <button onClick={()=>setMoveP(p)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md text-muted-foreground hover:bg-muted transition-colors"><ArrowRightLeft size={10}/>Mover</button>
                      )}
                      {p.status==="failed"&&<>
                        <button onClick={()=>setUpdateP(p)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"><Edit3 size={10}/>Atualizar Nº</button>
                        <button onClick={()=>setCallP(p)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"><PhoneCall size={10}/>Ligar</button>
                      </>}
                      {p.status==="expired"&&(
                        <button onClick={()=>setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"waiting" as PatientStatus}:x))} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"><RefreshCw size={10}/>Re-disparar</button>
                      )}
                      {canRevert(p)&&(
                        <button onClick={()=>revertCancellation(p.id)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"><RotateCcw size={10}/>Reverter</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visiblePatients.length===0&&(
            <div className="py-12 text-center text-muted-foreground text-sm">Nenhum paciente nesta combinação de filtros.</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Legenda:</p>
          {(["failed","expired","cancelled"] as PatientStatus[]).map(s=>{
            const c=STATUS_CFG[s];
            return <span key={s} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>{c.label}</span>;
          })}
        </div>
      </div>

      {chatPatient&&(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={()=>setChatP(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-72 overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{chatPatient.name.charAt(0)}</div>
              <div className="flex-1"><p className="text-white text-xs font-semibold">{chatPatient.name}</p><p className="text-white/60 text-[10px]">{chatPatient.phone}</p></div>
              <button onClick={()=>setChatP(null)}><X size={14} className="text-white/70 hover:text-white"/></button>
            </div>
            <div className="bg-[#ECE5DD] p-3 min-h-40 space-y-2">
              <div className="bg-white rounded-b-xl rounded-tr-xl p-3 shadow-sm max-w-[90%]">
                <p className="text-[11px] text-gray-800 leading-relaxed">Olá, <b>{chatPatient.name.split(" ")[0]}</b>! Você tem um atendimento de <b>{chatPatient.procedure}</b> em <b>02/07/2025</b> às <b>{chatPatient.time}</b>.<br/><br/>Digite <b>1</b> para ✅ Confirmar ou <b>2</b> para ❌ Cancelar.</p>
                <p className="text-[9px] text-gray-400 text-right mt-1">09:14 ✓✓</p>
              </div>
              {chatPatient.status==="confirmed"&&<div className="bg-[#DCF8C6] rounded-b-xl rounded-tl-xl p-2 shadow-sm ml-auto max-w-[50%]"><p className="text-[11px]">1</p><p className="text-[9px] text-gray-400 text-right">09:17 ✓✓</p></div>}
              {chatPatient.status==="cancelled" &&<div className="bg-[#DCF8C6] rounded-b-xl rounded-tl-xl p-2 shadow-sm ml-auto max-w-[50%]"><p className="text-[11px]">2</p><p className="text-[9px] text-gray-400 text-right">09:19 ✓✓</p></div>}
            </div>
          </div>
        </div>
      )}
      {movePatient   && <MoveModal patient={movePatient}   onClose={()=>setMoveP(null)}/>}
      {updatePhoneP  && <UpdatePhoneModal patient={updatePhoneP} onClose={()=>setUpdateP(null)}/>}
      {callP         && <ManualCallModal  patient={callP}   onClose={()=>setCallP(null)}/>}
      {showAdd       && <AddPatientModal  onClose={()=>setShowAdd(false)}/>}
      {surveyFor && <SurveyBanner patientName={surveyFor} onDismiss={()=>setSurveyFor(null)}/>}
      {dispatch  && <DispatchMotorPanel state={dispatch} onDismiss={()=>setDispatch(null)}/>}
    </div>
  );
}

// ─── Patients ─────────────────────────────────────────────────────────────────────

export function PatientsScreen({ onDetail }:{ onDetail:(p:Patient)=>void }) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState<"name"|"cpf"|"cns"|"municipality">("name");
  const filtered = BASE_PATIENTS.filter(p=>{
    if(!query) return true;
    const q=query.toLowerCase();
    if(field==="name") return p.name.toLowerCase().includes(q);
    if(field==="cpf")  return (p.cpf||"").toLowerCase().includes(q);
    if(field==="cns")  return (p.cns||"").toLowerCase().includes(q);
    return (p.municipality||"").toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div><h1 className="text-xl font-semibold">Pacientes</h1><p className="text-sm text-muted-foreground mt-0.5">Fichas completas extraídas do AIVO</p></div>
      <div className="bg-card rounded-xl border border-border p-4 flex gap-3">
        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3"><Filter size={12} className="text-muted-foreground"/><select value={field} onChange={e=>setField(e.target.value as typeof field)} className="text-xs font-medium bg-transparent outline-none py-2"><option value="name">Nome</option><option value="cpf">CPF</option><option value="cns">CNS</option><option value="municipality">Município</option></select></div>
        <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3 bg-background"><Search size={13} className="text-muted-foreground shrink-0"/><input className="flex-1 text-sm bg-transparent outline-none py-2 placeholder:text-muted-foreground" placeholder="Buscar paciente…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery("")}><X size={12} className="text-muted-foreground"/></button>}</div>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{filtered.length} encontrado{filtered.length!==1?"s":""}</span></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/20">{["Paciente","CPF","CNS","Telefone","Município","Procedimento","Prioridade","Status",""].map((h,i)=><th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id} onClick={()=>onDetail(p)} className={`border-b border-border/60 hover:bg-accent/20 cursor-pointer transition-colors ${i%2?"bg-muted/10":""}`}>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-primary">{p.name.charAt(0)}</div><span className="text-xs font-medium">{p.name}</span></div></td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.cpf||"—"}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.cns||"—"}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.municipality||"—"}</td>
                <td className="px-4 py-3 text-xs font-medium">{p.procedure}</td>
                <td className="px-4 py-3"><PriorityBadge priority={p.priority}/></td>
                <td className="px-4 py-3"><StatusTag status={p.status}/></td>
                <td className="px-4 py-3"><ChevronRight size={13} className="text-muted-foreground ml-auto"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Patient Detail ───────────────────────────────────────────────────────────────

export function PatientDetailScreen({ patient, onBack }:{ patient:Patient; onBack:()=>void }) {
  const [tab, setTab] = useState<"personal"|"history"|"contacts">("personal");
  const [editingContact, setEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState(patient.phone);
  const [editEmail, setEditEmail] = useState("cleonice.alves@email.com");
  const [contactSaved, setContactSaved] = useState(false);

  const age = patient.birthDate?calcAge(patient.birthDate):"—";

  const history = [
    { date:"02/07/2025", procedure:patient.procedure, unit:patient.unit, status:patient.status,
      justification:"Solicitação médica UBS", log:"Mensagem enviada 09:14 · Resposta 09:17",
      lastAttended:"02/07/2025", pendingConsultations:1 },
    { date:"15/04/2025", procedure:"Consulta Geral",  unit:"UBS Central", status:"confirmed" as PatientStatus,
      justification:"Acompanhamento rotina", log:"Confirmado via WhatsApp",
      lastAttended:"15/04/2025", pendingConsultations:0 },
    { date:"10/01/2025", procedure:"Exame de Sangue", unit:"Lab Municipal", status:"confirmed" as PatientStatus,
      justification:"Preventivo anual", log:"Confirmado via ligação",
      lastAttended:"10/01/2025", pendingConsultations:2 },
  ];

  type ContactEntry = { ts: string; operator: string; type: "system"|"whatsapp"|"phone"|"manual"; channel: string; event: string; outcome?: string; };
  const contactLog: ContactEntry[] = [
    { ts:"02/07/2025 09:14:03", operator:"Sistema",         type:"whatsapp", channel:"WhatsApp",   event:"Mensagem de confirmação enviada automaticamente",        outcome:"Entregue ✓✓" },
    { ts:"02/07/2025 09:17:41", operator:"Sistema",         type:"whatsapp", channel:"WhatsApp",   event:"Resposta recebida do paciente: '1' (Confirmar presença)", outcome:"Status → Confirmado" },
    { ts:"26/06/2025 09:15:00", operator:"Sistema",         type:"whatsapp", channel:"WhatsApp",   event:"Mensagem de confirmação enviada — 1ª tentativa",          outcome:"Entregue ✓✓" },
    { ts:"26/06/2025 12:15:00", operator:"Sistema",         type:"system",   channel:"Motor",      event:"Timeout atingido — sem resposta em 3h",                   outcome:"Status → Expirado · Próximo acionado" },
    { ts:"26/06/2025 12:20:15", operator:"Ana Paula R.",    type:"phone",    channel:"Telefone",   event:"Ligação manual realizada — número principal",             outcome:"Sem resposta" },
    { ts:"26/06/2025 12:22:30", operator:"Ana Paula R.",    type:"phone",    channel:"Telefone",   event:"Ligação manual realizada — número secundário",            outcome:"Caixa postal" },
    { ts:"26/06/2025 13:00:00", operator:"Sistema",         type:"whatsapp", channel:"WhatsApp",   event:"2ª tentativa de disparo — novo número cadastrado",        outcome:"Entregue ✓✓" },
    { ts:"25/06/2025 08:00:00", operator:"Sistema",         type:"system",   channel:"Sistema",    event:"Paciente incluído na fila via importação de PDF",         outcome:"PDF: agenda_mamografia_jul.pdf" },
  ];

  const typeIcon: Record<string, React.ReactNode> = {
    whatsapp: <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    phone:    <PhoneCall size={12} className="text-emerald-600" />,
    system:   <Activity size={12} className="text-primary" />,
    manual:   <Edit3 size={12} className="text-purple-600" />,
  };
  const typeDot: Record<string, string> = {
    whatsapp:"bg-[#25D366]", phone:"bg-emerald-500", system:"bg-primary", manual:"bg-purple-500"
  };

  const handleSaveContact = () => {
    setContactSaved(true);
    setTimeout(()=>{ setEditingContact(false); setContactSaved(false); }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><ChevronRight size={13} className="rotate-180"/>Voltar</button>
        <span className="text-muted-foreground">/</span><span className="text-sm font-medium">{patient.name}</span>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-[#2577CC] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">{patient.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2 mb-0.5"><p className="text-white font-bold">{patient.name}</p><PriorityBadge priority={patient.priority}/></div>
              {patient.socialName&&<p className="text-white/70 text-xs">Nome social: {patient.socialName}</p>}
              <p className="text-white/70 text-xs">{age}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusTag status={patient.status}/>
            <button
              onClick={()=>{ setEditingContact(!editingContact); setTab("personal"); }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Edit3 size={12}/>Editar Dados
            </button>
          </div>
        </div>

        {/* Inline contact edit panel */}
        {editingContact && (
          <div className="px-6 py-4 border-b border-border bg-blue-50/60">
            <p className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5"><Edit3 size={11}/>Editar Telefone e E-mail</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefone Principal</label>
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 bg-background">
                  <Phone size={12} className="text-muted-foreground shrink-0"/>
                  <input
                    value={editPhone}
                    onChange={e=>setEditPhone(e.target.value)}
                    className="flex-1 text-sm font-mono outline-none py-2 bg-transparent"
                    placeholder="(67) 99999-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail</label>
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 bg-background">
                  <Mail size={12} className="text-muted-foreground shrink-0"/>
                  <input
                    value={editEmail}
                    onChange={e=>setEditEmail(e.target.value)}
                    className="flex-1 text-sm outline-none py-2 bg-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveContact}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${contactSaved?"bg-emerald-600 text-white":"bg-primary text-white hover:bg-primary/90"}`}
              >
                {contactSaved?<><Check size={13}/>Salvo!</>:<>Salvar Alterações</>}
              </button>
              <button onClick={()=>setEditingContact(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border">
          {([
            ["personal", "Dados Pessoais & Contatos"],
            ["history",  "Histórico Clínico"],
            ["contacts", "Log de Comunicação"],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={()=>setTab(t)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab===t?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t==="contacts" && <Shield size={12}/>}{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab==="personal"&&(
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Identificação</p>
                {([["Nome Completo",patient.name],["Nome Social",patient.socialName||"Não informado"],["Nasc.",patient.birthDate||"—"],["Idade",age],["Nome da Mãe",patient.mother||"—"],["Município",patient.municipality||"—"]] as [string,string][]).map(([k,v])=>(<div key={k} className="border-b border-border/60 pb-2.5"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{k}</p><p className="text-sm font-medium">{v}</p></div>))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Documentos & Contatos</p>
                {([["CPF",patient.cpf||"—"],["CNS",patient.cns||"—"],["Telefone 1",editPhone],["E-mail",editEmail],["Telefone 2",patient.phone2||"—"],["Telefone 3",patient.phone3||"—"]] as [string,string][]).map(([k,v])=>(<div key={k} className="border-b border-border/60 pb-2.5"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{k}</p><p className="text-sm font-medium font-mono">{v}</p></div>))}
                <div className="border-b border-border/60 pb-2.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Código Check-in</p>
                  <div className="flex items-center gap-2"><p className="text-sm font-bold font-mono text-primary">CK-{patient.checkinCode}</p><span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Visível apenas para Gestor</span></div>
                </div>
              </div>
            </div>
          )}

          {tab==="history"&&(
            <div className="space-y-3">
              {history.map((h,i)=>(
                <div key={i} className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div><p className="text-sm font-semibold">{h.procedure}</p><p className="text-xs text-muted-foreground">{h.unit} · {h.date}</p></div>
                    <StatusTag status={h.status}/>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="bg-muted/40 rounded-lg p-2"><p className="text-muted-foreground font-bold uppercase tracking-wider text-[9px] mb-1">Justificativa</p><p>{h.justification}</p></div>
                    <div className="bg-muted/40 rounded-lg p-2"><p className="text-muted-foreground font-bold uppercase tracking-wider text-[9px] mb-1">Log de Contato</p><p>{h.log}</p></div>
                  </div>
                  {/* Enhanced: Last attended + pending */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/60 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={11} className="text-primary shrink-0"/>
                      <div><p className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Último Atendimento</p><p className="font-semibold text-foreground">{h.lastAttended}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardList size={11} className={h.pendingConsultations>0?"text-amber-500 shrink-0":"text-emerald-500 shrink-0"}/>
                      <div>
                        <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Consultas Pendentes</p>
                        <p className={`font-semibold ${h.pendingConsultations>0?"text-amber-600":"text-emerald-600"}`}>
                          {h.pendingConsultations > 0 ? `${h.pendingConsultations} pendente${h.pendingConsultations>1?"s":""}` : "Nenhuma"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==="contacts"&&(
            <div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-5">
                <Shield size={14} className="text-amber-600 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-xs font-bold text-amber-800">Prontuário de Comunicação — Registro Imutável</p>
                  <p className="text-xs text-amber-700">Este histórico serve como documento oficial. Cada entrada é carimbada com data, hora e operador, e não pode ser alterada ou excluída.</p>
                </div>
              </div>
              <div className="space-y-0">
                {contactLog.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                      <div className={`w-3 h-3 rounded-full ${typeDot[entry.type]} shrink-0 ring-2 ring-white`}/>
                      {i < contactLog.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1"/>}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 hover:bg-accent/10 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {typeIcon[entry.type]}
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{entry.channel}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{entry.ts}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground leading-snug">{entry.event}</p>
                        {entry.outcome && <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><ChevronRight size={9}/>{entry.outcome}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1"><User size={9}/><span className="font-semibold">{entry.operator}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clinic Detail Dashboard ──────────────────────────────────────────────────────

export function ClinicDetailScreen({ clinic, onBack }: { clinic: Clinic; onBack: ()=>void }) {
  const kpis = [
    { label:"Pacientes Atendidos", value:"104", sub:"Mês de Julho/2025", color:"text-primary",    bg:"bg-blue-50",    border:"border-blue-200",    icon:<UserCheck size={16} className="text-primary"/> },
    { label:"Agendamentos",        value:"125", sub:"Total no mês",      color:"text-emerald-700",bg:"bg-emerald-50", border:"border-emerald-200",  icon:<Calendar size={16} className="text-emerald-600"/> },
    { label:"Taxa de Comparec.",   value:"83%", sub:"Presenças validadas",color:"text-purple-700",bg:"bg-purple-50",  border:"border-purple-200",   icon:<CheckCircle2 size={16} className="text-purple-600"/> },
    { label:"Repasse Estimado",    value:"R$ 33.280", sub:"Tabela SUS vigente", color:"text-amber-700",  bg:"bg-amber-50",   border:"border-amber-200",   icon:<FileText size={16} className="text-amber-600"/> },
  ];
  const recentPatients = [
    { name:"Cleonice Nunes Alves",  procedure:"Mamografia",   date:"02/07/2025", status:"confirmed" as PatientStatus },
    { name:"Benedita Almeida Rocha",procedure:"Mamografia",   date:"02/07/2025", status:"confirmed" as PatientStatus },
    { name:"Maria das Dores Souza", procedure:"Mamografia",   date:"02/07/2025", status:"refused"   as PatientStatus },
    { name:"Vania Facunda Medina",  procedure:"Mamografia",   date:"02/07/2025", status:"sent"      as PatientStatus },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"><ChevronRight size={13} className="rotate-180"/>Voltar</button>
        <span className="text-muted-foreground">/</span><span className="text-sm font-medium">{clinic.name}</span>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-[#2577CC] px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Building2 size={22} className="text-white"/></div>
          <div>
            <p className="text-white font-bold text-base">{clinic.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{clinic.city} · {clinic.cnpj}</p>
            <p className="text-white/60 text-xs">{clinic.address}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {clinic.specialties.map(s=><span key={s} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">{s}</span>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={11}/><span className="font-mono">{clinic.phone}</span></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={11}/><span>{clinic.address}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k=>(
          <div key={k.label} className={`bg-card rounded-xl border ${k.border} p-5`}>
            <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>{k.icon}</div>
            <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs font-semibold mt-0.5">{k.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><p className="text-sm font-semibold">Pacientes Atendidos Recentemente</p></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">{["Paciente","Procedimento","Data","Status"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {recentPatients.map((p,i)=>(
              <tr key={i} className={`border-b border-border/60 hover:bg-accent/20 ${i%2?"bg-muted/10":""}`}>
                <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">{p.name.charAt(0)}</div><span className="text-xs font-medium">{p.name}</span></div></td>
                <td className="px-5 py-3 text-xs">{p.procedure}</td>
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{p.date}</td>
                <td className="px-5 py-3"><StatusTag status={p.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Clinics List ─────────────────────────────────────────────────────────────────

export function ClinicsScreen({ onClinicDetail }: { onClinicDetail: (c:Clinic)=>void }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Clínicas Terceirizadas</h1><p className="text-sm text-muted-foreground mt-0.5">Parceiros credenciados para encaminhamento</p></div>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Plus size={14}/>Nova Clínica</button>
      </div>
      {showForm&&(
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-sm font-semibold mb-4">Cadastrar Nova Clínica</p>
          <div className="grid grid-cols-2 gap-4">
            {([["Nome da Clínica","col-span-2"],["CNPJ",""],["Cidade",""],["Endereço","col-span-2"],["Telefone",""],["Especialidades (vírgula)",""]] as [string,string][]).map(([l,s])=>(<div key={l} className={s}><label className="block text-xs font-semibold text-muted-foreground mb-1">{l}</label><input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary transition-colors"/></div>))}
          </div>
          <div className="flex gap-2 mt-4"><button className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg">Salvar</button><button onClick={()=>setShowForm(false)} className="text-muted-foreground text-sm px-4 py-2 rounded-lg hover:bg-muted transition-colors">Cancelar</button></div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {CLINICS.map(c=>(
          <div
            key={c.id}
            onClick={()=>onClinicDetail(c)}
            className="bg-card rounded-xl border border-border p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors"><Building2 size={17} className="text-primary"/></div>
                <div><p className="text-sm font-bold group-hover:text-primary transition-colors">{c.name}</p><p className="text-xs text-muted-foreground">{c.city}</p></div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0"/>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground"><FileText size={10}/><span className="font-mono">{c.cnpj}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={10}/><span>{c.address}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone size={10}/><span className="font-mono">{c.phone}</span></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">{c.specialties.map(s=><span key={s} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">{s}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsScreen() {
  const [reportTab, setReportTab] = useState<"confirmations"|"production">("confirmations");
  const [start, setStart]         = useState("2025-06-01");
  const [end,   setEnd]           = useState("2025-07-02");

  const confRows = [
    { municipality:"Campo Grande",specialty:"Mamografia",  total:62,confirmed:49,refused:7, rate:79},
    { municipality:"Dourados",     specialty:"Buco Maxilo", total:41,confirmed:33,refused:5, rate:80},
    { municipality:"Três Lagoas",  specialty:"Geral",       total:38,confirmed:30,refused:6, rate:79},
    { municipality:"Corumbá",      specialty:"Ortopedia",   total:29,confirmed:20,refused:8, rate:69},
    { municipality:"Ponta Porã",   specialty:"Geral",       total:21,confirmed:17,refused:3, rate:81},
    { municipality:"Naviraí",      specialty:"Ortopedia",   total:26,confirmed:18,refused:3, rate:69},
  ];

  const totalRepasse = PRODUCTION_DATA.reduce((s, r) => s + r.present * r.valueUnit, 0);

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div><h1 className="text-xl font-semibold">Relatórios</h1><p className="text-sm text-muted-foreground mt-0.5">Confirmações por região e produção financeira de terceirizadas</p></div>

      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {([["confirmations", "Confirmações por Município"],["production","Produção de Terceirizadas"]] as const).map(([t, label]) => (
          <button key={t} onClick={()=>setReportTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${reportTab===t?"bg-primary text-white shadow-sm":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>{label}</button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2"><label className="text-xs font-semibold text-muted-foreground">De</label><input type="date" value={start} onChange={e=>setStart(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary transition-colors"/></div>
        <div className="flex items-center gap-2"><label className="text-xs font-semibold text-muted-foreground">Até</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary transition-colors"/></div>
        <button className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"><Search size={13}/>Gerar</button>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary border border-border rounded-lg px-3 py-2 bg-card transition-colors"><FileDown size={13}/>PDF</button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary border border-border rounded-lg px-3 py-2 bg-card transition-colors"><Download size={13}/>Excel</button>
        </div>
      </div>

      {reportTab === "confirmations" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              {label:"Total de Atendimentos", value:"290", color:"text-primary",    bg:"bg-blue-50",    border:"border-blue-200"},
              {label:"Taxa Média Confirmação", value:"76%", color:"text-emerald-600",bg:"bg-emerald-50", border:"border-emerald-200"},
              {label:"Total Recusas",          value:"45",  color:"text-red-600",    bg:"bg-red-50",     border:"border-red-200"},
            ].map(c=>(<div key={c.label} className={`${c.bg} rounded-xl border ${c.border} p-4`}><p className={`text-2xl font-black ${c.color}`}>{c.value}</p><p className="text-xs text-muted-foreground font-medium mt-0.5">{c.label}</p></div>))}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/40">{["Município","Especialidade","Total","Confirmados","Recusados","Taxa"].map((h,i)=><th key={h} className={`px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i>=2?"text-right":"text-left"}`}>{h}</th>)}</tr></thead>
              <tbody>{confRows.map((r,i)=>(<tr key={i} className={`border-b border-border/60 hover:bg-accent/20 ${i%2?"bg-muted/10":""}`}><td className="px-5 py-3 text-xs font-medium">{r.municipality}</td><td className="px-5 py-3"><span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">{r.specialty}</span></td><td className="px-5 py-3 text-right text-xs font-bold">{r.total}</td><td className="px-5 py-3 text-right text-xs font-bold text-emerald-700">{r.confirmed}</td><td className="px-5 py-3 text-right text-xs font-bold text-red-600">{r.refused}</td><td className="px-5 py-3 text-right"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.rate>=80?"bg-emerald-50 text-emerald-700":r.rate>=70?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>{r.rate}%</span></td></tr>))}</tbody>
            </table>
          </div>
        </>
      )}

      {reportTab === "production" && (
        <>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <Activity size={14} className="text-blue-600 mt-0.5 shrink-0"/>
            <div>
              <p className="text-xs font-bold text-blue-800">Base de Faturamento — Presença confirmada por código de check-in</p>
              <p className="text-xs text-blue-700">Apenas atendimentos com código validado são contabilizados para fins de repasse municipal.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              {label:"Total Agendados",    value: PRODUCTION_DATA.reduce((s,r)=>s+r.total,0).toString(),   color:"text-primary",    bg:"bg-blue-50",    border:"border-blue-200"},
              {label:"Presenças Validadas",value: PRODUCTION_DATA.reduce((s,r)=>s+r.present,0).toString(), color:"text-emerald-700",bg:"bg-emerald-50", border:"border-emerald-200"},
              {label:"Faltas / Ausências", value: PRODUCTION_DATA.reduce((s,r)=>s+r.absent,0).toString(),  color:"text-red-600",    bg:"bg-red-50",     border:"border-red-200"},
              {label:"Repasse Estimado",   value:`R$ ${totalRepasse.toLocaleString("pt-BR")}`, color:"text-purple-700", bg:"bg-purple-50", border:"border-purple-200"},
            ].map(c=>(<div key={c.label} className={`${c.bg} rounded-xl border ${c.border} p-4`}><p className={`text-xl font-black ${c.color}`}>{c.value}</p><p className="text-xs text-muted-foreground font-medium mt-0.5">{c.label}</p></div>))}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Produção por Clínica Parceira</p>
              <span className="text-xs text-muted-foreground">Base: check-ins validados com código</span>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/40">
                {["Clínica Parceira","Cidade","Especialidade","Agendados","Presentes ✓","Ausentes","Taxa","Valor Unit.","Repasse Total"].map((h,i)=>(
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i>=3?"text-right":"text-left"}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {PRODUCTION_DATA.map((r, i) => {
                  const repasse = r.present * r.valueUnit;
                  return (
                    <tr key={i} className={`border-b border-border/60 hover:bg-accent/20 transition-colors ${i%2?"bg-muted/10":""}`}>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Building2 size={12} className="text-primary"/></div><p className="text-xs font-semibold">{r.clinic}</p></div></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.city}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">{r.specialty}</span></td>
                      <td className="px-4 py-3 text-right text-xs font-bold">{r.total}</td>
                      <td className="px-4 py-3 text-right"><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={10}/>{r.present}</span></td>
                      <td className="px-4 py-3 text-right"><span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={10}/>{r.absent}</span></td>
                      <td className="px-4 py-3 text-right"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.rate>=85?"bg-emerald-50 text-emerald-700":r.rate>=75?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>{r.rate}%</span></td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">R$ {r.valueUnit.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right"><span className="text-sm font-black text-purple-700">R$ {repasse.toLocaleString("pt-BR")}</span></td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/40 border-t-2 border-border">
                  <td className="px-4 py-3 text-xs font-bold" colSpan={3}>TOTAL</td>
                  <td className="px-4 py-3 text-right text-xs font-bold">{PRODUCTION_DATA.reduce((s,r)=>s+r.total,0)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-emerald-700">{PRODUCTION_DATA.reduce((s,r)=>s+r.present,0)}</td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-red-600">{PRODUCTION_DATA.reduce((s,r)=>s+r.absent,0)}</td>
                  <td className="px-4 py-3 text-right"><span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{Math.round(PRODUCTION_DATA.reduce((s,r)=>s+r.rate,0)/PRODUCTION_DATA.length)}%</span></td>
                  <td className="px-4 py-3"/>
                  <td className="px-4 py-3 text-right"><span className="text-base font-black text-purple-800">R$ {totalRepasse.toLocaleString("pt-BR")}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0"/>
            <div>
              <p className="text-xs font-bold text-amber-800">Aviso de Faturamento</p>
              <p className="text-xs text-amber-700">Os valores de repasse são estimativas baseadas na tabela SUS vigente. O pagamento final deve ser aprovado pelo setor financeiro do município após auditoria dos check-ins validados.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Audit ────────────────────────────────────────────────────────────────────────

export function AuditScreen() {
  const RC: Record<string,string> = {"Super Admin":"bg-purple-50 text-purple-700","Supervisor":"bg-blue-50 text-blue-700","Operador":"bg-gray-100 text-gray-600"};
  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Auditoria — Logs do Sistema</h1><p className="text-sm text-muted-foreground mt-0.5">Registro imutável · rastreamento por IP e usuário</p></div><button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary border border-border rounded-lg px-3 py-2 bg-card transition-colors"><FileDown size={13}/>CSV</button></div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"><Shield size={15} className="text-amber-600 mt-0.5 shrink-0"/><div><p className="text-sm font-semibold text-amber-800">Área de Segurança Restrita</p><p className="text-xs text-amber-700">Disponível apenas para Supervisor e Super Admin. Registros imutáveis.</p></div></div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">{["Data / Hora","Usuário","Perfil","Ação","Detalhe","IP"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>{AUDIT_LOGS.map((log,i)=>(<tr key={log.id} className={`border-b border-border/60 hover:bg-accent/20 ${i%2?"bg-muted/10":""}`}><td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{log.datetime}</td><td className="px-4 py-3 text-xs font-medium">{log.user}</td><td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RC[log.role]||"bg-gray-100 text-gray-600"}`}>{log.role}</span></td><td className="px-4 py-3"><span className="text-xs font-semibold bg-secondary px-2 py-1 rounded-md">{log.action}</span></td><td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.detail}</td><td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ip}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────────

export const VARIABLES = [{key:"[Nome]",desc:"Nome"},{key:"[Procedimento]",desc:"Procedimento"},{key:"[Data]",desc:"Data"},{key:"[Hora]",desc:"Hora"},{key:"[Unidade]",desc:"Unidade"}];
export const DEFAULT_TEMPLATE = `Olá, [Nome]! 👋\n\nVocê tem um atendimento de *[Procedimento]* no dia *[Data]* às *[Hora]* na unidade *[Unidade]*.\n\n⚠️ Atenção: o cancelamento é *definitivo*. Se clicou errado, entre em contato com a regulação.\n\nDigite *1* para ✅ Confirmar ou *2* para ❌ Cancelar.\n\n_Responda apenas com o número._`;

export function ChatbotScreen() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPass, setWrong]   = useState(false);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [saved, setSaved]       = useState(false);

  const tryUnlock = () => { if(password==="admin123"){setUnlocked(true);setWrong(false);}else{setWrong(true);setPassword("");} };
  const preview = template.replace(/\[Nome\]/g,"Cleonice Nunes Alves").replace(/\[Procedimento\]/g,"Mamografia").replace(/\[Data\]/g,"02/07/2025").replace(/\[Hora\]/g,"07:00").replace(/\[Unidade\]/g,"UBS Central");
  const renderPreview = (text:string) => text.split("\n").map((line,i,arr)=><span key={i}>{line.split(/(\*[^*]+\*|_[^_]+_)/g).map((part,j)=>part.startsWith("*")&&part.endsWith("*")?<strong key={j}>{part.slice(1,-1)}</strong>:part.startsWith("_")&&part.endsWith("_")?<em key={j} className="text-gray-500">{part.slice(1,-1)}</em>:<span key={j}>{part}</span>)}{i<arr.length-1&&<br/>}</span>);

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5 relative">
      <div className="flex items-start justify-between"><div><h1 className="text-xl font-semibold">Configuração do Chatbot</h1><p className="text-sm text-muted-foreground mt-0.5">Template da mensagem WhatsApp</p></div><div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50"><Lock size={11} className="text-purple-600"/><span className="text-xs font-bold text-purple-700">SUPER ADMIN ONLY</span></div></div>
      {!unlocked&&(<div className="absolute inset-0 z-20 flex items-start justify-center pt-20" style={{ background:"rgba(240,244,248,0.95)", backdropFilter:"blur(8px)" }}><div className="bg-card rounded-2xl border border-border shadow-2xl p-8 w-full max-w-sm text-center"><div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4"><Lock size={26} className="text-purple-600"/></div><h2 className="text-base font-bold mb-1">Área Técnica Protegida</h2><p className="text-sm text-muted-foreground mb-5">Restrita à equipe técnica.</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryUnlock()} placeholder="Senha de Super Admin" className={`w-full border rounded-lg px-4 py-2.5 text-sm bg-background outline-none mb-2 text-center tracking-widest transition-colors ${wrongPass?"border-red-400":"border-border focus:border-primary"}`}/>{wrongPass&&<p className="text-xs text-red-600 mb-2">Senha incorreta.</p>}<button onClick={tryUnlock} className="w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors">Autenticar</button><p className="text-[11px] text-muted-foreground mt-3 italic">Demo: "admin123"</p></div></div>)}
      {unlocked&&<div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-3"><Shield size={13} className="text-purple-600 shrink-0"/><p className="text-xs text-purple-700 font-medium flex-1">Sessão <strong>Super Admin</strong> ativa.</p><button onClick={()=>setUnlocked(false)} className="text-xs text-purple-600 font-semibold flex items-center gap-1"><Lock size={10}/>Bloquear</button></div>}
      <div className={`grid grid-cols-5 gap-6 ${!unlocked?"pointer-events-none select-none opacity-25":""}`}>
        <div className="col-span-3 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Variáveis</p><div className="flex flex-wrap gap-2">{VARIABLES.map(v=><button key={v.key} onClick={()=>setTemplate(t=>t+v.key)} title={v.desc} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-mono hover:bg-primary hover:text-white transition-colors"><Plus size={9}/>{v.key}</button>)}</div></div>
          <div className="bg-card rounded-xl border border-border overflow-hidden"><div className="px-4 py-3 border-b border-border flex items-center justify-between"><span className="text-sm font-semibold">Template</span><span className="text-xs font-mono text-muted-foreground">{template.length} chars</span></div><textarea value={template} onChange={e=>setTemplate(e.target.value)} className="w-full p-4 text-sm resize-none outline-none bg-transparent font-mono leading-relaxed" rows={10}/></div>
          <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${saved?"bg-emerald-600 text-white":"bg-primary text-white hover:bg-primary/90"}`}>{saved?"✓ Salvo!":"Salvar Template"}</button>
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 self-start">Pré-visualização</p>
          <div className="w-60 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl"><div className="bg-white rounded-[2rem] overflow-hidden"><div className="bg-gray-900 px-5 pt-2 pb-1"><span className="text-white text-[10px] font-semibold">9:41</span></div><div className="bg-[#075E54] px-3 py-2 flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"><Bot size={13} className="text-white"/></div><div><p className="text-white text-xs font-semibold">Bot AIVO</p><p className="text-white/60 text-[9px]">online</p></div></div><div className="bg-[#ECE5DD] p-3 min-h-64"><div className="bg-white rounded-b-xl rounded-tr-xl p-3 shadow-sm"><p className="text-[10.5px] text-gray-800 leading-relaxed whitespace-pre-wrap">{renderPreview(preview)}</p><p className="text-[9px] text-gray-400 text-right mt-1.5">09:14 ✓✓</p></div></div><div className="bg-[#F0F0F0] px-2 py-1.5 flex items-center gap-2"><div className="flex-1 bg-white rounded-full px-3 py-1.5"><p className="text-[10px] text-gray-400">Mensagem</p></div><div className="w-7 h-7 rounded-full bg-[#075E54] flex items-center justify-center"><Send size={11} className="text-white ml-0.5"/></div></div></div></div>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp ──────────────────────────────────────────────────────────────────────

export function WhatsAppScreen() {
  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="mb-6"><h1 className="text-xl font-semibold">Conexão WhatsApp</h1><p className="text-sm text-muted-foreground mt-0.5">Sessão via QR Code</p></div>
      <div className="max-w-xl space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><Wifi size={19} className="text-emerald-600"/></div><div className="flex-1"><p className="font-semibold text-sm text-emerald-800">WhatsApp conectado e operacional</p><p className="text-xs text-emerald-600 mt-0.5">+55 (67) 3XXX-XXXX · 3h 22min</p></div><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"/></div>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center"><p className="text-sm font-semibold mb-4">QR Code</p><div className="w-40 h-40 bg-white border border-border rounded-xl flex items-center justify-center"><div className="text-center"><CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2"/><p className="text-xs text-emerald-600 font-medium">Conectado</p></div></div><button className="mt-4 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"><RefreshCw size={11}/>Reconectar</button></div>
          <div className="bg-card rounded-xl border border-border p-5"><p className="text-sm font-semibold mb-4">Estatísticas</p>{[["Mensagens enviadas","47","text-primary"],["Confirmações","31","text-emerald-600"],["Cancelamentos","5","text-red-500"],["Taxa de resposta","76%","text-primary"]].map(([k,v,c])=>(<div key={k as string} className="flex justify-between py-2 border-b border-border/60 last:border-0"><span className="text-xs text-muted-foreground">{k}</span><span className={`text-sm font-bold ${c}`}>{v}</span></div>))}</div>
        </div>
      </div>
    </div>
  );
}

