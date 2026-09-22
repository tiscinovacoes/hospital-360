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
  Priority, Patient, Clinic,
  BASE_PATIENTS,
  STATUS_CFG, PRIORITY_CFG,
  PriorityBadge, WaIcon,
} from "./shared";
import {
  DashboardScreen, UploadScreen, QueueScreen, SpecialtyDetailScreen,
  PatientsScreen, PatientDetailScreen, ClinicDetailScreen, ClinicsScreen,
  ReportsScreen, AuditScreen, ChatbotScreen, WhatsAppScreen,
  SpecialtyGroup,
} from "./GestorScreens";

// ─── Types ──────────────────────────────────────────────────────────────────────

type AppProfile = "gestor" | "medico" | "recep-ubs" | "recep-reg" | "regulador" | "tfd";

type Screen =
  | "dashboard" | "upload" | "queue" | "patients" | "patient-detail"
  | "clinics" | "clinic-detail"
  | "reports" | "audit" | "chatbot" | "whatsapp" | "specialty-detail"
  | "doctor-agenda" | "doctor-record"
  | "recep-agenda"
  | "ubs-dashboard" | "ubs-agenda" | "ubs-cadastro"
  | "reg-dashboard" | "reg-agenda" | "reg-cadastro" | "reg-agendamento" | "reg-whatsapp"
  | "regulador-vagas" | "regulador-guias"
  | "tfd-viagens" | "tfd-frota" | "tfd-roteirizacao";

interface GuiaReg { id:string; paciente:string; cpf:string; municipio:string; especialidade:string; unidade:string; solicitadoEm:string; status:"pendente"|"aprovado"|"agendado"|"cancelado"; urgencia:"normal"|"urgente"|"critico"; obs?:string; }
const GUIAS_DATA: GuiaReg[] = [
  { id:"G-0091", paciente:"Valdineia Souza Pires",       cpf:"041.XXX.XXX-19", municipio:"Campo Grande",  especialidade:"Cardiologia",      unidade:"HNAS",                    solicitadoEm:"30/06/2025", status:"pendente",  urgencia:"critico",  obs:"Suspeita de IAM" },
  { id:"G-0092", paciente:"Roberto Alves Figueiredo",    cpf:"058.XXX.XXX-34", municipio:"Dourados",      especialidade:"Neurologia",       unidade:"HU-UFGD",                 solicitadoEm:"01/07/2025", status:"pendente",  urgencia:"urgente" },
  { id:"G-0093", paciente:"Cleide Martins Barbosa",      cpf:"072.XXX.XXX-07", municipio:"Três Lagoas",   especialidade:"Ortopedia",        unidade:"Inst. Ortopedia MS",      solicitadoEm:"01/07/2025", status:"pendente",  urgencia:"normal" },
  { id:"G-0094", paciente:"Laercio Pinheiro da Silva",   cpf:"063.XXX.XXX-55", municipio:"Corumbá",       especialidade:"Oncologia",        unidade:"INCA-RJ",                 solicitadoEm:"28/06/2025", status:"aprovado",  urgencia:"critico" },
  { id:"G-0095", paciente:"Ana Cláudia Torres",          cpf:"085.XXX.XXX-42", municipio:"Campo Grande",  especialidade:"Oftalmologia",     unidade:"Clínica Vista MS",        solicitadoEm:"29/06/2025", status:"aprovado",  urgencia:"normal" },
  { id:"G-0096", paciente:"Francisco Nunes Rabelo",      cpf:"033.XXX.XXX-71", municipio:"Ponta Porã",    especialidade:"Cardiologia",      unidade:"HNAS",                    solicitadoEm:"27/06/2025", status:"agendado",  urgencia:"urgente",  obs:"Consulta: 10/07 08:00" },
  { id:"G-0097", paciente:"Marinês Costa Carvalho",      cpf:"049.XXX.XXX-88", municipio:"Naviraí",       especialidade:"Reumatologia",     unidade:"Policlínica Norte",       solicitadoEm:"25/06/2025", status:"agendado",  urgencia:"normal" },
  { id:"G-0098", paciente:"Pedro Henrique Lacerda",      cpf:"076.XXX.XXX-13", municipio:"Campo Grande",  especialidade:"Dermatologia",     unidade:"Clínica Pele MS",         solicitadoEm:"20/06/2025", status:"cancelado", urgencia:"normal",   obs:"Paciente não compareceu" },
  { id:"G-0099", paciente:"Rosimere Santos Duarte",      cpf:"052.XXX.XXX-26", municipio:"Sidrolândia",   especialidade:"Neurologia",       unidade:"HU-UFGD",                 solicitadoEm:"18/06/2025", status:"cancelado", urgencia:"urgente",  obs:"Vaga cancelada pela unidade" },
];

interface VagaEspecialidade { especialidade:string; vagasMunicipal:number; vagasEstadual:number; usadasMunicipal:number; usadasEstadual:number; }
const VAGAS_DATA: VagaEspecialidade[] = [
  { especialidade:"Cardiologia",    vagasMunicipal:12, vagasEstadual:8,  usadasMunicipal:10, usadasEstadual:7 },
  { especialidade:"Neurologia",     vagasMunicipal:8,  vagasEstadual:6,  usadasMunicipal:5,  usadasEstadual:4 },
  { especialidade:"Ortopedia",      vagasMunicipal:20, vagasEstadual:15, usadasMunicipal:14, usadasEstadual:10 },
  { especialidade:"Oncologia",      vagasMunicipal:6,  vagasEstadual:10, usadasMunicipal:6,  usadasEstadual:9 },
  { especialidade:"Oftalmologia",   vagasMunicipal:15, vagasEstadual:5,  usadasMunicipal:8,  usadasEstadual:3 },
  { especialidade:"Reumatologia",   vagasMunicipal:10, vagasEstadual:4,  usadasMunicipal:7,  usadasEstadual:2 },
  { especialidade:"Dermatologia",   vagasMunicipal:18, vagasEstadual:6,  usadasMunicipal:11, usadasEstadual:5 },
  { especialidade:"Buco Maxilo",    vagasMunicipal:14, vagasEstadual:0,  usadasMunicipal:12, usadasEstadual:0 },
];

// TFD
interface ViagemTFD { id:string; paciente:string; cpf:string; municipioOrigem:string; destinoConsulta:string; especialidade:string; dataViagem:string; status:"solicitado"|"aprovado"|"agendado"|"concluido"|"cancelado"; acompanhante?:string; obs?:string; }
const VIAGENS_TFD: ViagemTFD[] = [
  { id:"TFD-441", paciente:"Valdineia Souza Pires",    cpf:"041.XXX.XXX-19", municipioOrigem:"Ponta Porã", destinoConsulta:"HNAS — Campo Grande",    especialidade:"Cardiologia",  dataViagem:"10/07/2025", status:"aprovado",   acompanhante:"José Souza" },
  { id:"TFD-442", paciente:"Laercio Pinheiro da Silva",cpf:"063.XXX.XXX-55", municipioOrigem:"Ponta Porã", destinoConsulta:"INCA — Rio de Janeiro",  especialidade:"Oncologia",    dataViagem:"12/07/2025", status:"aprovado",   obs:"Voo + van" },
  { id:"TFD-443", paciente:"Francisco Nunes Rabelo",   cpf:"033.XXX.XXX-71", municipioOrigem:"Ponta Porã", destinoConsulta:"HNAS — Campo Grande",    especialidade:"Cardiologia",  dataViagem:"10/07/2025", status:"agendado" },
  { id:"TFD-444", paciente:"Roberto Alves Figueiredo", cpf:"058.XXX.XXX-34", municipioOrigem:"Ponta Porã", destinoConsulta:"HU-UFGD — Dourados",     especialidade:"Neurologia",   dataViagem:"09/07/2025", status:"agendado" },
  { id:"TFD-445", paciente:"Cleide Martins Barbosa",   cpf:"072.XXX.XXX-07", municipioOrigem:"Ponta Porã", destinoConsulta:"Inst. Ortopedia MS",     especialidade:"Ortopedia",    dataViagem:"08/07/2025", status:"solicitado" },
  { id:"TFD-446", paciente:"Marinês Costa Carvalho",   cpf:"049.XXX.XXX-88", municipioOrigem:"Ponta Porã", destinoConsulta:"Policlínica Norte — CG", especialidade:"Reumatologia", dataViagem:"11/07/2025", status:"solicitado" },
  { id:"TFD-437", paciente:"Ana Paula Ferreira",       cpf:"021.XXX.XXX-03", municipioOrigem:"Ponta Porã", destinoConsulta:"HNAS — Campo Grande",    especialidade:"Cardiologia",  dataViagem:"03/07/2025", status:"concluido" },
  { id:"TFD-438", paciente:"Benedito Ramos",           cpf:"037.XXX.XXX-88", municipioOrigem:"Ponta Porã", destinoConsulta:"HU-UFGD — Dourados",     especialidade:"Neurologia",   dataViagem:"02/07/2025", status:"concluido" },
];

interface VeiculoFrota { id:string; placa:string; modelo:string; tipo:"Van"|"Micro-ônibus"|"Ambulância"; capacidade:number; alocados:number; status:"disponivel"|"em_uso"|"manutencao"; rota?:string; motorista?:string; }
const FROTA_TFD: VeiculoFrota[] = [
  { id:"V01", placa:"HST-2341", modelo:"Sprinter 415",     tipo:"Van",           capacidade:14, alocados:12, status:"em_uso",     rota:"Rota Campo Grande–HNAS",   motorista:"Antônio Borges" },
  { id:"V02", placa:"FKM-8812", modelo:"Volare W9",        tipo:"Micro-ônibus",  capacidade:28, alocados:21, status:"em_uso",     rota:"Rota Dourados–HU-UFGD",    motorista:"Paulo Sakata" },
  { id:"V03", placa:"JKR-4490", modelo:"Sprinter 515",     tipo:"Ambulância",    capacidade:2,  alocados:1,  status:"em_uso",     rota:"Emergência Cardiologia" },
  { id:"V04", placa:"HST-3377", modelo:"Sprinter 415",     tipo:"Van",           capacidade:14, alocados:0,  status:"disponivel",  motorista:"Cláudio Lima" },
  { id:"V05", placa:"BCV-1102", modelo:"Volare W9",        tipo:"Micro-ônibus",  capacidade:28, alocados:0,  status:"manutencao" },
  { id:"V06", placa:"FKM-9901", modelo:"Sprinter 415",     tipo:"Van",           capacidade:14, alocados:8,  status:"disponivel",  rota:"Pré-alocado 11/07" },
];

interface PassageiroRoteiro { nome:string; municipio:string; especialidade:string; horarioConsulta:string; }
const ROTEIRO_10JUL: PassageiroRoteiro[] = [
  { nome:"Valdineia Souza Pires",  municipio:"Campo Grande", especialidade:"Cardiologia", horarioConsulta:"08:00" },
  { nome:"Francisco Nunes Rabelo", municipio:"Ponta Porã",   especialidade:"Cardiologia", horarioConsulta:"09:30" },
  { nome:"Ana Cláudia Torres",     municipio:"Campo Grande", especialidade:"Oftalmologia",horarioConsulta:"10:00" },
  { nome:"Rosimere Santos Duarte", municipio:"Sidrolândia",  especialidade:"Neurologia",  horarioConsulta:"11:00" },
  { nome:"Pedro Lacerda",          municipio:"Campo Grande", especialidade:"Dermatologia",horarioConsulta:"14:00" },
];
// ─── Status & Priority configs ───────────────────────────────────────────────────

function ProfileSwitcher({ profile, onSwitch }: { profile: AppProfile; onSwitch: () => void }) {
  const cfg = {
    gestor:     { border:"border-[#4A9EE8]/40",  bg:"bg-[#4A9EE8]/10",  hover:"hover:bg-[#4A9EE8]/20",  dot:"bg-[#4A9EE8]",  icon:<ShieldAlert size={13} className="text-white"/>, label:"Gestor / Regulação"   },
    medico:     { border:"border-cyan-400/40",    bg:"bg-cyan-500/10",   hover:"hover:bg-cyan-500/20",   dot:"bg-cyan-500",   icon:<Stethoscope size={13} className="text-white"/>, label:"Portal do Médico"     },
    "recep-ubs":{ border:"border-violet-400/40",  bg:"bg-violet-500/10", hover:"hover:bg-violet-500/20", dot:"bg-violet-500", icon:<UserCheck size={13} className="text-white"/>,   label:"Recepção UBS"         },
    "recep-reg":{ border:"border-fuchsia-400/40", bg:"bg-fuchsia-500/10",hover:"hover:bg-fuchsia-500/20",dot:"bg-fuchsia-500",icon:<ClipboardList size={13} className="text-white"/>,label:"Recepção Regulação"   },
    regulador:  { border:"border-amber-400/40",   bg:"bg-amber-500/10",  hover:"hover:bg-amber-500/20",  dot:"bg-amber-500",  icon:<Kanban size={13} className="text-white"/>,       label:"Central de Regulação" },
    tfd:        { border:"border-emerald-400/40", bg:"bg-emerald-500/10",hover:"hover:bg-emerald-500/20",dot:"bg-emerald-500",icon:<Truck size={13} className="text-white"/>,         label:"Agente TFD"           },
  }[profile];
  return (
    <button onClick={onSwitch} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all ${cfg.border} ${cfg.bg} ${cfg.hover}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.dot}`}>{cfg.icon}</div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[11px] font-bold text-white leading-tight">{cfg.label}</p>
        <p className="text-[9px]" style={{ color:"rgba(200,216,235,0.5)" }}>Hub de Perfis</p>
      </div>
      <Repeat2 size={13} style={{ color:"rgba(200,216,235,0.45)" }}/>
    </button>
  );
}

// ─── Sidebar (Gestor mode) ── "Portal do Prestador" removed ─────────────────────

const NAV: { id:Screen; icon:React.ReactNode; label:string; badge?:number; divider?:boolean; locked?:boolean }[] = [
  { id:"dashboard",       icon:<LayoutDashboard size={15}/>, label:"Dashboard" },
  { id:"upload",          icon:<Upload size={15}/>,          label:"Upload de Listas",        divider:true },
  { id:"queue",           icon:<Users size={15}/>,           label:"Filas",                   badge:5 },
  { id:"patients",        icon:<User size={15}/>,            label:"Pacientes" },
  { id:"clinics",         icon:<Building2 size={15}/>,       label:"Clínicas Terceirizadas",  divider:true },
  { id:"reports",         icon:<BarChart2 size={15}/>,       label:"Relatórios",              divider:true },
  { id:"audit",           icon:<Shield size={15}/>,          label:"Auditoria (Logs)" },
  { id:"chatbot",         icon:<Bot size={15}/>,             label:"Config. Bot",             divider:true, locked:true },
  { id:"whatsapp",        icon:<Wifi size={15}/>,            label:"Conexão WhatsApp" },
];

function GestorSidebar({ active, onNav, onSwitchProfile }: { active:Screen; onNav:(s:Screen)=>void; onSwitchProfile:()=>void }) {
  const confirmed = BASE_PATIENTS.filter(p=>p.status==="confirmed").length;
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col overflow-y-auto" style={{ background:"var(--sidebar)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#4A9EE8] flex items-center justify-center shadow-md"><Activity size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(200,216,235,0.5)" }}>Regulação de Agendas</div></div>
        </div>
        <ProfileSwitcher profile="gestor" onSwitch={onSwitchProfile}/>
      </div>

      <nav className="flex-1 px-2 pb-2">
        {NAV.map(item => {
          const isActive = active===item.id||(active==="patient-detail"&&item.id==="patients")||(active==="clinic-detail"&&item.id==="clinics")||(active==="specialty-detail"&&item.id==="queue");
          return (
            <div key={item.id}>
              {item.divider&&<div className="my-1.5 mx-2 h-px" style={{ background:"rgba(255,255,255,0.07)" }}/>}
              <button onClick={()=>onNav(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"var(--sidebar-accent)"}:{color:"var(--sidebar-foreground)"}}>
                <span style={{ color:isActive?"#4A9EE8":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge&&!isActive&&<span className="bg-[#4A9EE8] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">{item.badge}</span>}
                {item.locked&&<Lock size={9} style={{ color:"rgba(200,216,235,0.3)" }}/>}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mx-2 mb-3 p-3 rounded-lg shrink-0" style={{ background:"rgba(255,255,255,0.05)" }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:"rgba(200,216,235,0.4)" }}>Hoje · 02/07</div>
        <div className="flex justify-between text-[11px] mb-1.5"><span style={{ color:"rgba(200,216,235,0.65)" }}>Confirmados</span><span className="font-bold text-emerald-400">{confirmed}/{BASE_PATIENTS.length}</span></div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full bg-emerald-400" style={{ width:`${(confirmed/BASE_PATIENTS.length)*100}%` }}/>
        </div>
      </div>

      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-[#4A9EE8]/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">AP</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium leading-tight truncate">Ana Paula</p><p className="text-[10px]" style={{ color:"rgba(200,216,235,0.4)" }}>Operador</p></div>
          <LogOut size={11} style={{ color:"rgba(200,216,235,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────────

// ─── Doctor Journey ───────────────────────────────────────────────────────────────

type ConsultaStatus = "aguardando" | "presente" | "em_atendimento" | "concluido" | "ausente";

interface ConsultaPatient {
  id: string; time: string; name: string; age: number; cpf: string; cns: string;
  procedure: string; priority?: Priority; status: ConsultaStatus;
  phone: string; lastVisit?: string; allergies?: string[]; checkinCode?: string;
}

const CONSULTA_STATUS_CFG: Record<ConsultaStatus, { label:string; bg:string; text:string; dot:string }> = {
  aguardando:      { label:"Aguardando",      bg:"bg-gray-100",    text:"text-gray-600",    dot:"bg-gray-400"    },
  presente:        { label:"Presente",        bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500" },
  em_atendimento:  { label:"Em Atendimento",  bg:"bg-cyan-50",     text:"text-cyan-700",    dot:"bg-cyan-500"    },
  concluido:       { label:"Concluído",       bg:"bg-blue-50",     text:"text-blue-700",    dot:"bg-blue-500"    },
  ausente:         { label:"Ausente",         bg:"bg-red-50",      text:"text-red-600",     dot:"bg-red-400"     },
};

const DOCTOR_AGENDA: ConsultaPatient[] = [
  { id:"d1",  time:"07:00", name:"Cleonice Nunes Alves",     age:54, cpf:"032.XXX.XXX-41", cns:"706 0XXX XXXX 0041", procedure:"Mamografia",         priority:"normal",        status:"concluido",      phone:"(67) 99331-7819", lastVisit:"15/04/2025", allergies:["Dipirona"],         checkinCode:"1234" },
  { id:"d2",  time:"07:30", name:"Benedita Almeida Rocha",   age:61, cpf:"044.XXX.XXX-27", cns:"706 0XXX XXXX 0027", procedure:"Mamografia",         priority:"normal",        status:"em_atendimento", phone:"(67) 99214-6631", lastVisit:"10/01/2025", allergies:[],                   checkinCode:"1234" },
  { id:"d3",  time:"08:00", name:"Sandra Regina Castro",     age:53, cpf:"067.XXX.XXX-90", cns:"706 0XXX XXXX 0090", procedure:"Ortopedia / Joelho", priority:"critical",      status:"presente",       phone:"(67) 99887-4421", lastVisit:"03/03/2025", allergies:["Penicilina","AAS"],  checkinCode:"1234" },
  { id:"d4",  time:"08:30", name:"Rosangela Ferreira Lima",  age:46, cpf:"091.XXX.XXX-22", cns:"706 0XXX XXXX 0022", procedure:"Buco Maxilo",        priority:"preferential",  status:"presente",       phone:"(67) 98877-3341", lastVisit:"—",          allergies:[],                   checkinCode:"1234" },
  { id:"d5",  time:"09:00", name:"Antônio Barbosa Neto",     age:70, cpf:"074.XXX.XXX-31", cns:"706 0XXX XXXX 0031", procedure:"Consulta Geral",     priority:"normal",        status:"aguardando",     phone:"(67) 99634-5507", lastVisit:"22/11/2024", allergies:[],                   checkinCode:"1234" },
  { id:"d6",  time:"09:30", name:"José Carlos Mendonça",     age:63, cpf:"055.XXX.XXX-19", cns:"706 0XXX XXXX 0019", procedure:"Ortopedia / Coluna", priority:"priority1",     status:"aguardando",     phone:"(67) 99423-6610", lastVisit:"01/06/2025", allergies:["Ibuprofeno"],       checkinCode:"1234" },
  { id:"d7",  time:"10:00", name:"Maria das Dores Souza",    age:59, cpf:"063.XXX.XXX-55", cns:"706 0XXX XXXX 0055", procedure:"Consulta Geral",     priority:"normal",        status:"aguardando",     phone:"(67) 98561-2298", lastVisit:"—",          allergies:[],                   checkinCode:"1234" },
  { id:"d8",  time:"10:30", name:"Francisca Oliveira Paz",   age:50, cpf:"082.XXX.XXX-64", cns:"706 0XXX XXXX 0064", procedure:"Mamografia",         priority:"normal",        status:"ausente",        phone:"(67) 98741-0033", lastVisit:"14/12/2024", allergies:[],                   checkinCode:"1234" },
];

// ── Médico Sidebar ──────────────────────────────────────────────────────────────

const MEDICO_NAV = [
  { id:"doctor-agenda", icon:<LayoutDashboard size={15}/>, label:"Agenda do Dia" },
];

function MedicoSidebar({ active, onNav, onSwitchProfile }: { active:Screen; onNav:(s:Screen)=>void; onSwitchProfile:()=>void }) {
  const concluidos = DOCTOR_AGENDA.filter(p=>p.status==="concluido").length;
  const total = DOCTOR_AGENDA.length;
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col overflow-y-auto" style={{ background:"#0B1F35", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-md"><Stethoscope size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(200,216,235,0.5)" }}>Portal do Médico</div></div>
        </div>
        <ProfileSwitcher profile="medico" onSwitch={onSwitchProfile}/>
      </div>

      {/* Doctor card */}
      <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(6,182,212,0.08)", border:"1px solid rgba(6,182,212,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center text-xs font-black text-cyan-300">DR</div>
          <div>
            <p className="text-[12px] font-bold text-white">Dr. Carlos Magalhães</p>
            <p className="text-[10px]" style={{ color:"rgba(200,216,235,0.5)" }}>CRM-MS 12.847</p>
          </div>
        </div>
        <p className="text-[10px]" style={{ color:"rgba(200,216,235,0.45)" }}>Ortopedia e Traumatologia</p>
        <div className="mt-2 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/><span className="text-[10px] text-cyan-400">Online · 02/07/2025</span></div>
      </div>

      <nav className="flex-1 px-2 pb-2">
        {MEDICO_NAV.map(item=>{
          const isActive = active===item.id || active==="doctor-record";
          return (
            <button key={item.id} onClick={()=>onNav(item.id as Screen)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"rgba(6,182,212,0.15)"}:{color:"rgba(196,214,236,0.7)"}}>
              <span style={{ color:isActive?"#06B6D4":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mx-2 mb-3 p-3 rounded-lg shrink-0" style={{ background:"rgba(255,255,255,0.05)" }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color:"rgba(200,216,235,0.4)" }}>Progresso do Dia</div>
        <div className="flex justify-between text-[11px] mb-1.5">
          <span style={{ color:"rgba(200,216,235,0.65)" }}>Concluídos</span>
          <span className="font-bold text-cyan-400">{concluidos}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width:`${(concluidos/total)*100}%` }}/>
        </div>
      </div>

      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">CM</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium leading-tight">Dr. Carlos Magalhães</p><p className="text-[10px]" style={{ color:"rgba(200,216,235,0.4)" }}>Médico</p></div>
          <LogOut size={11} style={{ color:"rgba(200,216,235,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ── Doctor Agenda Screen ────────────────────────────────────────────────────────

function DoctorAgendaScreen({ onStartConsulta }: { onStartConsulta:(p:ConsultaPatient)=>void }) {
  const [patients, setPatients] = useState<ConsultaPatient[]>(DOCTOR_AGENDA);
  const [finishModal, setFinishModal] = useState<{finished:ConsultaPatient; next:ConsultaPatient|null}|null>(null);
  const [codeModal, setCodeModal] = useState<ConsultaPatient|null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<"wrong"|"empty"|null>(null);

  const concluidos   = patients.filter(p=>p.status==="concluido").length;
  const presentes    = patients.filter(p=>p.status==="presente").length;
  const emAtendimento= patients.filter(p=>p.status==="em_atendimento").length;
  const aguardando   = patients.filter(p=>p.status==="aguardando").length;
  const ausentes     = patients.filter(p=>p.status==="ausente").length;

  const kpis = [
    { label:"Total do Dia",    value:String(patients.length), color:"text-foreground",  bg:"bg-secondary", border:"border-border",        icon:<Calendar size={15}/> },
    { label:"Concluídos",      value:String(concluidos),      color:"text-blue-700",    bg:"bg-blue-50",   border:"border-blue-200",       icon:<CheckCircle2 size={15} className="text-blue-600"/> },
    { label:"Em Atendimento",  value:String(emAtendimento),   color:"text-cyan-700",    bg:"bg-cyan-50",   border:"border-cyan-200",       icon:<Stethoscope size={15} className="text-cyan-600"/> },
    { label:"Presente / Fila", value:String(presentes),       color:"text-emerald-700", bg:"bg-emerald-50",border:"border-emerald-200",    icon:<UserCheck size={15} className="text-emerald-600"/> },
    { label:"Aguardando",      value:String(aguardando),      color:"text-gray-600",    bg:"bg-gray-100",  border:"border-gray-200",       icon:<Clock size={15} className="text-gray-500"/> },
    { label:"Ausentes",        value:String(ausentes),        color:"text-red-600",     bg:"bg-red-50",    border:"border-red-200",        icon:<XCircle size={15} className="text-red-500"/> },
  ];

  const openCodeModal = (p:ConsultaPatient) => { setCodeModal(p); setCodeInput(""); setCodeError(null); };

  const handleValidateCode = () => {
    if(!codeModal) return;
    const entered = codeInput.trim();
    if(!entered) { setCodeError("empty"); return; }
    if(entered !== codeModal.checkinCode) { setCodeError("wrong"); return; }
    const p = codeModal;
    setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"em_atendimento" as ConsultaStatus}:x));
    onStartConsulta({...p, status:"em_atendimento"});
    setCodeModal(null);
  };

  const handleIniciar = (p:ConsultaPatient) => openCodeModal(p);

  return (
    <div className="flex-1 overflow-y-auto p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Agenda do Dia</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Dr. Carlos Magalhães · Ortopedia · 02/07/2025</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-semibold text-cyan-700">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"/>Consultório 03 · Ativo
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-3">
        {kpis.map(k=>(
          <div key={k.label} className={`${k.bg} rounded-xl border ${k.border} p-4`}>
            <div className="flex items-center gap-2 mb-2">{k.icon}</div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Progresso do Período</span>
          <span className="text-sm font-bold text-cyan-600">{Math.round((concluidos/patients.length)*100)}% concluído</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          <div className="h-full bg-blue-500 transition-all" style={{ width:`${(concluidos/patients.length)*100}%` }}/>
          <div className="h-full bg-cyan-400 transition-all" style={{ width:`${(emAtendimento/patients.length)*100}%` }}/>
          <div className="h-full bg-emerald-400 transition-all" style={{ width:`${(presentes/patients.length)*100}%` }}/>
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"/>Concluídos</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"/>Em atend.</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"/>Presente</span>
        </div>
      </div>

      {/* Patient queue table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Users size={14} className="text-cyan-600"/>
          <span className="text-sm font-semibold">Fila de Pacientes</span>
          <span className="ml-auto text-xs text-muted-foreground">{patients.length} agendados</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Hora","Paciente / Dados","Procedimento","Prioridade","Status","Ação"].map((h,i)=>(
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i===5?"text-right":"text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p,i)=>{
              const scfg = CONSULTA_STATUS_CFG[p.status];
              const isCurrentlyIn = p.status==="em_atendimento";
              return (
                <tr key={p.id} className={`border-b border-border/60 transition-colors ${isCurrentlyIn?"bg-cyan-50/60 ring-1 ring-cyan-200":p.status==="presente"?"bg-emerald-50/40":p.status==="concluido"?"bg-blue-50/20":p.status==="ausente"?"bg-red-50/20 opacity-60":i%2===0?"hover:bg-accent/15":"bg-muted/10 hover:bg-accent/15"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {isCurrentlyIn&&<span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shrink-0"/>}
                      <span className="font-mono text-sm font-bold">{p.time}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isCurrentlyIn?"bg-cyan-500 text-white":"bg-secondary text-primary"}`}>{p.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.age} anos · {p.cpf}</p>
                        {p.allergies && p.allergies.length>0 && <p className="text-[9px] text-red-600 font-semibold mt-0.5">⚠ Alergia: {p.allergies.join(", ")}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5"><Stethoscope size={11} className="text-muted-foreground"/><span className="text-xs font-medium">{p.procedure}</span></div>
                  </td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={p.priority}/></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${scfg.bg} ${scfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot} shrink-0`}/>{scfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status==="aguardando"&&<span className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40"><Clock size={10}/>Aguardando recepção</span>}
                      {p.status==="presente"&&(
                        <button onClick={()=>handleIniciar(p)} className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-bold rounded-lg text-white transition-all active:scale-95 shadow-sm" style={{ background:"#0891B2" }}>
                          <Stethoscope size={12}/>Iniciar Atendimento
                        </button>
                      )}
                      {p.status==="em_atendimento"&&<span className="text-xs text-cyan-600 font-semibold flex items-center gap-1.5"><RefreshCw size={10} className="animate-spin"/>Em andamento</span>}
                      {p.status==="concluido"&&<span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5"><CheckCircle2 size={11}/>Finalizado</span>}
                      {p.status==="ausente"&&<span className="text-xs text-red-500 font-semibold flex items-center gap-1.5"><XCircle size={10}/>Não compareceu</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Code validation modal */}
      {codeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={()=>setCodeModal(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-[400px] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="px-6 py-5" style={{ background:"linear-gradient(135deg,#0B2545,#0E3460)" }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center"><Shield size={20} className="text-white"/></div>
                <div>
                  <p className="text-white font-bold text-sm">Validação de Presença</p>
                  <p className="text-white/60 text-xs mt-0.5">{codeModal.name} · {codeModal.procedure}</p>
                </div>
                <PriorityBadge priority={codeModal.priority}/>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Solicite ao paciente o código de 4 dígitos gerado no check-in da recepção.</p>
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all ${codeError==="wrong"?"border-red-400 bg-red-50":codeError==="empty"?"border-amber-400 bg-amber-50":"border-border focus-within:border-cyan-400"}`}>
                <QrCode size={16} className={`shrink-0 ${codeError?"text-red-400":"text-muted-foreground"}`}/>
                <input
                  value={codeInput}
                  onChange={e=>{ setCodeInput(e.target.value.replace(/\D/g,"").slice(0,4)); setCodeError(null); }}
                  onKeyDown={e=>e.key==="Enter"&&handleValidateCode()}
                  maxLength={4}
                  placeholder="0000"
                  autoFocus
                  className="flex-1 text-2xl font-black font-mono tracking-[0.5em] text-center outline-none bg-transparent placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:text-base"
                />
              </div>
              {codeError==="wrong"&&<p className="text-xs text-red-600 font-semibold">Código incorreto. Verifique com o paciente.</p>}
              {codeError==="empty"&&<p className="text-xs text-amber-600 font-semibold">Digite o código antes de confirmar.</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={()=>setCodeModal(null)} className="flex-1 py-2.5 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-muted transition-colors text-sm">Cancelar</button>
                <button onClick={handleValidateCode} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all active:scale-95 text-sm">
                  <Stethoscope size={14}/>Iniciar Atendimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {finishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl shadow-2xl w-[440px] overflow-hidden">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 px-6 py-5 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={30} className="text-white"/></div>
              <p className="text-white font-bold text-base">Atendimento Finalizado</p>
              <p className="text-white/70 text-sm mt-1">{finishModal.finished.name}</p>
            </div>
            <div className="p-6">
              {finishModal.next && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Próximo na Fila</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">{finishModal.next.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold">{finishModal.next.name}</p>
                      <p className="text-xs text-muted-foreground">{finishModal.next.time} · {finishModal.next.procedure}</p>
                    </div>
                    <PriorityBadge priority={finishModal.next.priority}/>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {finishModal.next && (
                  <button onClick={()=>{handleIniciar(finishModal.next!);setFinishModal(null);}} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors">
                    <Stethoscope size={15}/>Chamar Próximo
                  </button>
                )}
                <button onClick={()=>setFinishModal(null)} className="flex-1 py-2.5 border border-border text-muted-foreground font-semibold rounded-xl hover:bg-muted transition-colors">Voltar à Agenda</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Prontuário Eletrônico ───────────────────────────────────────────────────────

type ProntuarioTab = "evolucao" | "guias" | "prescricao" | "assinatura";

interface Medicamento { id:string; nome:string; dosagem:string; via:string; frequencia:string; duracao:string; instrucoes:string; }
interface Guia { id:string; tipo:"exame"|"procedimento"|"encaminhamento"; descricao:string; cid:string; urgencia:"eletivo"|"urgente"|"urgentissimo"; justificativa:string; }

function ProntuarioScreen({ patient, onBack, onFinalize }: { patient:ConsultaPatient; onBack:()=>void; onFinalize:(next:ConsultaPatient|null)=>void }) {
  const [tab, setTab] = useState<ProntuarioTab>("evolucao");
  const [evolucao, setEvolucao] = useState("");
  const [queixaPrincipal, setQueixaPrincipal] = useState("");
  const [exameFisico, setExameFisico] = useState("");
  const [conduta, setConduta] = useState("");
  const [cid, setCid] = useState("");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [guias, setGuias] = useState<Guia[]>([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddGuia, setShowAddGuia] = useState(false);
  const [newMed, setNewMed] = useState<Partial<Medicamento>>({});
  const [newGuia, setNewGuia] = useState<Partial<Guia>>({});
  const [assinatura, setAssinatura] = useState<"idle"|"signing"|"signed">("idle");
  const [certCode, setCertCode] = useState("");
  const [certError, setCertError] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Simulated next patient
  const nextPatient: ConsultaPatient | null = DOCTOR_AGENDA.find(p=>p.status==="presente"&&p.id!==patient.id) || null;

  // Signature canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(e.clientX-r.left, e.clientY-r.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if(!isDrawing) return;
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0A1628";
    ctx.lineTo(e.clientX-r.left, e.clientY-r.top);
    ctx.stroke();
    setHasSigned(true);
  };
  const endDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0,0,c.width,c.height);
    setHasSigned(false);
  };

  const handleAssinar = () => {
    if(certCode.trim()!=="1234"){setCertError(true);return;}
    if(!hasSigned){setCertError(false);setAssinatura("signing");setTimeout(()=>setAssinatura("signed"),1500);return;}
    setAssinatura("signing");
    setTimeout(()=>setAssinatura("signed"),1500);
  };

  const addMedicamento = () => {
    if(!newMed.nome) return;
    setMedicamentos(prev=>[...prev,{id:Date.now().toString(),...newMed as Medicamento}]);
    setNewMed({});
    setShowAddMed(false);
  };
  const addGuia = () => {
    if(!newGuia.descricao) return;
    setGuias(prev=>[...prev,{id:Date.now().toString(),...newGuia as Guia}]);
    setNewGuia({});
    setShowAddGuia(false);
  };

  const TABS: {id:ProntuarioTab; label:string; icon:React.ReactNode; badge?:number}[] = [
    {id:"evolucao",   label:"Evolução Clínica",  icon:<FileText size={13}/>},
    {id:"guias",      label:"Solicitações/Guias", icon:<ClipboardList size={13}/>, badge:guias.length||undefined},
    {id:"prescricao", label:"Prescrição",          icon:<Stethoscope size={13}/>,  badge:medicamentos.length||undefined},
    {id:"assinatura", label:"Assinatura Digital",  icon:<Shield size={13}/>},
  ];

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition-colors";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5";

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Patient header */}
      <div className="shrink-0 border-b border-border" style={{ background:"linear-gradient(135deg,#0B2545 0%,#0E3460 100%)" }}>
        <div className="px-7 py-4 flex items-center gap-5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ChevronRight size={13} className="rotate-180"/>Agenda
          </button>
          <div className="w-px h-5 bg-white/10"/>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/30 border-2 border-cyan-400/50 flex items-center justify-center text-base font-black text-cyan-200">{patient.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-sm">{patient.name}</p>
                <PriorityBadge priority={patient.priority}/>
                {patient.allergies && patient.allergies.length>0 && (
                  <span className="flex items-center gap-1 text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={8}/>ALERGIA: {patient.allergies.join(", ")}
                  </span>
                )}
              </div>
              <p className="text-white/60 text-xs mt-0.5">{patient.age} anos · CPF {patient.cpf} · CNS {patient.cns}</p>
              <p className="text-white/50 text-[10px]">Última consulta: {patient.lastVisit||"—"} · {patient.phone}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Procedimento</p>
              <p className="text-white font-semibold text-sm">{patient.procedure}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Horário</p>
              <p className="text-white font-semibold text-sm font-mono">{patient.time}</p>
            </div>
            <button onClick={()=>setShowFinalModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg">
              <CheckCircle2 size={15}/>Finalizar Atendimento
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-7 gap-0.5">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold border-b-2 transition-all relative ${tab===t.id?"border-cyan-400 text-white bg-white/5":"border-transparent text-white/45 hover:text-white/75 hover:bg-white/5"}`}>
              {t.icon}{t.label}
              {t.badge&&t.badge>0&&<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[9px] font-black text-white flex items-center justify-center">{t.badge}</span>}
              {t.id==="assinatura"&&assinatura==="signed"&&<span className="ml-1 text-emerald-400">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-background">

        {/* ── EVOLUÇÃO CLÍNICA ── */}
        {tab==="evolucao"&&(
          <div className="p-7 grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4"><FileText size={14} className="text-cyan-600"/><span className="font-semibold text-sm">Evolução Clínica</span><span className="ml-auto text-[10px] text-muted-foreground">02/07/2025 · Dr. Carlos Magalhães</span></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Queixa Principal</label>
                    <textarea value={queixaPrincipal} onChange={e=>setQueixaPrincipal(e.target.value)} rows={3} placeholder="Descreva a queixa principal do paciente…" className={`${inputCls} resize-none`}/>
                  </div>
                  <div>
                    <label className={labelCls}>Exame Físico</label>
                    <textarea value={exameFisico} onChange={e=>setExameFisico(e.target.value)} rows={3} placeholder="Dados do exame físico (PA, FC, peso, altura…)" className={`${inputCls} resize-none`}/>
                  </div>
                </div>
                <div className="mb-4">
                  <label className={labelCls}>Evolução / Anamnese <span className="text-muted-foreground font-normal">(SOAP)</span></label>
                  <textarea value={evolucao} onChange={e=>setEvolucao(e.target.value)} rows={7} placeholder="S — Subjetivo: O que o paciente relata&#10;O — Objetivo: Dados objetivos coletados&#10;A — Avaliação: Impressão diagnóstica&#10;P — Plano: Conduta adotada" className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Conduta</label>
                    <textarea value={conduta} onChange={e=>setConduta(e.target.value)} rows={3} placeholder="Orientações, retorno, encaminhamentos…" className={`${inputCls} resize-none`}/>
                  </div>
                  <div>
                    <label className={labelCls}>CID-10 Principal</label>
                    <input value={cid} onChange={e=>setCid(e.target.value)} placeholder="Ex: M17.1 — Artrose primária do joelho" className={inputCls}/>
                    <label className={`${labelCls} mt-3`}>CID Secundário</label>
                    <input placeholder="Opcional" className={inputCls}/>
                  </div>
                </div>
              </div>

              {/* Vital signs quick entry */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4"><Activity size={14} className="text-cyan-600"/><span className="font-semibold text-sm">Sinais Vitais</span></div>
                <div className="grid grid-cols-5 gap-3">
                  {[["PA","mmHg","120/80"],["FC","bpm","72"],["FR","irpm","16"],["Temp.","°C","36.5"],["SpO2","%","98"]].map(([l,u,p])=>(
                    <div key={l}>
                      <label className={labelCls}>{l} <span className="font-normal text-[9px]">({u})</span></label>
                      <input defaultValue={p as string} className={`${inputCls} text-center font-mono font-bold`}/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[["Peso","kg","—"],["Altura","cm","—"],["IMC","kg/m²","—"]].map(([l,u,p])=>(
                    <div key={l}>
                      <label className={labelCls}>{l} <span className="font-normal text-[9px]">({u})</span></label>
                      <input defaultValue={p as string} className={`${inputCls} text-center font-mono font-bold`}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — patient history */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Histórico do Paciente</p>
                {[
                  { label:"Última Consulta", value:patient.lastVisit||"Primeira vez" },
                  { label:"Alergias", value:patient.allergies?.join(", ")||"Nenhuma informada" },
                  { label:"Convênio", value:"SUS" },
                  { label:"Município", value:"Campo Grande / MS" },
                ].map(({label,value})=>(
                  <div key={label} className="py-2 border-b border-border/60 last:border-0">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-xs font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Consultas Anteriores</p>
                {[
                  {date:"15/04/2025", proc:"Mamografia", medico:"Dra. Silva"},
                  {date:"10/01/2025", proc:"Consulta Geral", medico:"Dr. Pereira"},
                ].map((h,i)=>(
                  <div key={i} className="py-2 border-b border-border/60 last:border-0 text-xs">
                    <p className="font-semibold">{h.proc}</p>
                    <p className="text-muted-foreground font-mono">{h.date} · {h.medico}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5"><AlertTriangle size={11}/>Alertas Clínicos</p>
                {patient.allergies && patient.allergies.length>0
                  ? patient.allergies.map(a=><p key={a} className="text-xs text-amber-700 mt-1">• Alergia a {a}</p>)
                  : <p className="text-xs text-amber-700">Nenhum alerta ativo</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── GUIAS / SOLICITAÇÕES ── */}
        {tab==="guias"&&(
          <div className="p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className="text-base font-semibold">Solicitações e Guias</h2><p className="text-xs text-muted-foreground">Exames, procedimentos e encaminhamentos</p></div>
              <button onClick={()=>setShowAddGuia(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors"><Plus size={13}/>Nova Solicitação</button>
            </div>

            {showAddGuia&&(
              <div className="bg-card rounded-xl border border-cyan-200 p-5">
                <p className="text-sm font-semibold mb-4">Nova Solicitação</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Tipo</label>
                    <div className="relative">
                      <select onChange={e=>setNewGuia(g=>({...g,tipo:e.target.value as Guia["tipo"]}))} className={`${inputCls} appearance-none`}>
                        <option value="exame">Solicitação de Exame</option>
                        <option value="procedimento">Solicitação de Procedimento</option>
                        <option value="encaminhamento">Encaminhamento</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Urgência</label>
                    <div className="relative">
                      <select onChange={e=>setNewGuia(g=>({...g,urgencia:e.target.value as Guia["urgencia"]}))} className={`${inputCls} appearance-none`}>
                        <option value="eletivo">Eletivo</option>
                        <option value="urgente">Urgente</option>
                        <option value="urgentissimo">Urgentíssimo</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Procedimento / Exame</label>
                    <input onChange={e=>setNewGuia(g=>({...g,descricao:e.target.value}))} placeholder="Ex: Ressonância Magnética de Joelho" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>CID-10</label>
                    <input onChange={e=>setNewGuia(g=>({...g,cid:e.target.value}))} placeholder="Ex: M17.1" className={inputCls}/>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Justificativa Clínica</label>
                    <textarea onChange={e=>setNewGuia(g=>({...g,justificativa:e.target.value}))} rows={2} placeholder="Descreva a necessidade clínica…" className={`${inputCls} resize-none`}/>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addGuia} className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors">Adicionar</button>
                  <button onClick={()=>setShowAddGuia(false)} className="px-4 py-2 text-muted-foreground text-sm rounded-lg hover:bg-muted transition-colors">Cancelar</button>
                </div>
              </div>
            )}

            {guias.length===0 && !showAddGuia && (
              <div className="py-16 text-center">
                <ClipboardList size={36} className="text-muted-foreground mx-auto mb-3 opacity-30"/>
                <p className="text-muted-foreground text-sm">Nenhuma solicitação emitida ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Solicitação" para começar.</p>
              </div>
            )}

            <div className="space-y-3">
              {guias.map((g,i)=>{
                const urgCfg: Record<string,{bg:string;text:string;label:string}> = {
                  eletivo:{bg:"bg-gray-100",text:"text-gray-600",label:"Eletivo"},
                  urgente:{bg:"bg-amber-100",text:"text-amber-700",label:"Urgente"},
                  urgentissimo:{bg:"bg-red-100",text:"text-red-700",label:"Urgentíssimo"},
                };
                const u = urgCfg[g.urgencia||"eletivo"];
                const tipoCfg: Record<string,string> = {exame:"📋 Exame",procedimento:"🔬 Procedimento",encaminhamento:"📨 Encaminhamento"};
                return (
                  <div key={g.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-muted-foreground">{tipoCfg[g.tipo||"exame"]}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.bg} ${u.text}`}>{u.label}</span>
                        {g.cid&&<span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded">{g.cid}</span>}
                      </div>
                      <p className="text-sm font-semibold">{g.descricao}</p>
                      {g.justificativa&&<p className="text-xs text-muted-foreground mt-1">{g.justificativa}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"><FileDown size={11}/>PDF</button>
                      <button onClick={()=>setGuias(prev=>prev.filter(x=>x.id!==g.id))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={12}/></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick templates */}
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Templates Rápidos</p>
              <div className="flex flex-wrap gap-2">
                {["Hemograma Completo","Glicemia em Jejum","TSH e T4 Livre","RX Joelho DP e Perfil","Ressonância Magnética","Ultrassom Abdominal","ECG","Densitometria Óssea"].map(t=>(
                  <button key={t} onClick={()=>setGuias(prev=>[...prev,{id:Date.now()+t,tipo:"exame",descricao:t,cid:"",urgencia:"eletivo",justificativa:""}])} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border rounded-lg bg-secondary hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-all">
                    <Plus size={9}/>{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRESCRIÇÃO ── */}
        {tab==="prescricao"&&(
          <div className="p-7 space-y-5">
            <div className="flex items-center justify-between">
              <div><h2 className="text-base font-semibold">Receituário / Prescrição</h2><p className="text-xs text-muted-foreground">Medicamentos e orientações farmacológicas</p></div>
              <button onClick={()=>setShowAddMed(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors"><Plus size={13}/>Adicionar Medicamento</button>
            </div>

            {showAddMed&&(
              <div className="bg-card rounded-xl border border-cyan-200 p-5">
                <p className="text-sm font-semibold mb-4">Novo Medicamento</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Medicamento (DCI)</label>
                    <input onChange={e=>setNewMed(m=>({...m,nome:e.target.value}))} placeholder="Ex: Paracetamol 500mg" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Dosagem</label>
                    <input onChange={e=>setNewMed(m=>({...m,dosagem:e.target.value}))} placeholder="Ex: 500mg" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Via de Administração</label>
                    <div className="relative">
                      <select onChange={e=>setNewMed(m=>({...m,via:e.target.value}))} className={`${inputCls} appearance-none`}>
                        <option>Via oral</option><option>Subcutânea</option><option>Intramuscular</option>
                        <option>Intravenosa</option><option>Tópico</option><option>Inalatório</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Frequência</label>
                    <div className="relative">
                      <select onChange={e=>setNewMed(m=>({...m,frequencia:e.target.value}))} className={`${inputCls} appearance-none`}>
                        <option>1x ao dia</option><option>2x ao dia</option><option>3x ao dia</option>
                        <option>4x ao dia</option><option>A cada 8h</option><option>A cada 6h</option>
                        <option>Uso contínuo</option><option>Se necessário</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Duração</label>
                    <input onChange={e=>setNewMed(m=>({...m,duracao:e.target.value}))} placeholder="Ex: 7 dias" className={inputCls}/>
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls}>Instruções especiais</label>
                    <input onChange={e=>setNewMed(m=>({...m,instrucoes:e.target.value}))} placeholder="Ex: Tomar após as refeições, evitar sol…" className={inputCls}/>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addMedicamento} className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition-colors">Adicionar</button>
                  <button onClick={()=>setShowAddMed(false)} className="px-4 py-2 text-muted-foreground text-sm rounded-lg hover:bg-muted transition-colors">Cancelar</button>
                </div>
              </div>
            )}

            {medicamentos.length===0 && !showAddMed && (
              <div className="py-16 text-center">
                <Stethoscope size={36} className="text-muted-foreground mx-auto mb-3 opacity-30"/>
                <p className="text-muted-foreground text-sm">Nenhum medicamento prescrito ainda.</p>
              </div>
            )}

            {medicamentos.length>0&&(
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Receituário</span>
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">{medicamentos.length} item{medicamentos.length!==1?"s":""}</span>
                  <div className="ml-auto text-[10px] text-muted-foreground">Dr. Carlos Magalhães · CRM-MS 12.847 · 02/07/2025</div>
                </div>
                <div className="divide-y divide-border">
                  {medicamentos.map((m,i)=>(
                    <div key={m.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-accent/10 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-black text-cyan-700 shrink-0">{i+1}</div>
                        <div>
                          <p className="text-sm font-bold">{m.nome}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.dosagem} · {m.via} · {m.frequencia} · {m.duracao}</p>
                          {m.instrucoes&&<p className="text-xs italic text-muted-foreground mt-0.5">{m.instrucoes}</p>}
                        </div>
                      </div>
                      <button onClick={()=>setMedicamentos(prev=>prev.filter(x=>x.id!==m.id))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"><X size={12}/></button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"><FileDown size={11}/>Imprimir Receituário</button>
                </div>
              </div>
            )}

            {/* Quick prescriptions */}
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Prescrições Rápidas</p>
              <div className="flex flex-wrap gap-2">
                {["Paracetamol 500mg · 3x/dia · 5 dias","Ibuprofeno 400mg · 3x/dia · 7 dias","Dipirona 1g · 4x/dia · 5 dias","Omeprazol 20mg · 1x/dia (jejum)","Losartana 50mg · 1x/dia"].map(t=>{
                  const [nome,...rest] = t.split(" · ");
                  return (
                    <button key={t} onClick={()=>setMedicamentos(prev=>[...prev,{id:Date.now()+t,nome,dosagem:"",via:"Via oral",frequencia:rest[0]||"",duracao:rest[1]||"",instrucoes:""}])} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border rounded-lg bg-secondary hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-all">
                      <Plus size={9}/>{nome}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ASSINATURA DIGITAL ── */}
        {tab==="assinatura"&&(
          <div className="p-7 max-w-2xl mx-auto space-y-5">
            <div className="flex items-center gap-2"><Shield size={16} className="text-cyan-600"/><h2 className="text-base font-semibold">Assinatura Digital via Certificado</h2></div>

            {/* Certificate info */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0"><Shield size={22} className="text-cyan-600"/></div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Certificado Digital — ICP-Brasil A3</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    {[
                      ["Titular","Dr. Carlos Magalhães"],["CRM","CRM-MS 12.847"],
                      ["CPF","055.XXX.XXX-12"],["Emitido por","CFM / ICP-Brasil"],
                      ["Validade","15/03/2027"],["Série","4A:B2:C3:D4:E5:F6"],
                    ].map(([k,v])=>(
                      <div key={k as string}><span className="text-muted-foreground">{k}: </span><span className="font-semibold">{v}</span></div>
                    ))}
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${assinatura==="signed"?"bg-emerald-100 text-emerald-700":"bg-gray-100 text-gray-600"}`}>
                  {assinatura==="signed"?"✓ Assinado":"Aguardando"}
                </div>
              </div>
            </div>

            {assinatura==="signed" ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3"/>
                <p className="font-bold text-emerald-800 text-base">Documentos assinados digitalmente</p>
                <p className="text-sm text-emerald-700 mt-1">Hash: <span className="font-mono">SHA256:a3b4c5d6e7f8…</span></p>
                <p className="text-xs text-emerald-600 mt-1">02/07/2025 às {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} · Dr. Carlos Magalhães · CRM-MS 12.847</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"><FileDown size={12}/>Baixar PDF Assinado</button>
                  <button onClick={()=>{setAssinatura("idle");setCertCode("");setHasSigned(false);clearCanvas();}} className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors">Reasinar</button>
                </div>
              </div>
            ) : (
              <>
                {/* Documents to sign */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Documentos para Assinar</p>
                  <div className="space-y-2">
                    {[
                      {label:"Evolução Clínica / Prontuário", ready:evolucao.length>0||queixaPrincipal.length>0},
                      {label:`Solicitações de Exame (${guias.length} guia${guias.length!==1?"s":""})`, ready:guias.length>0},
                      {label:`Receituário (${medicamentos.length} medicamento${medicamentos.length!==1?"s":""})`, ready:medicamentos.length>0},
                    ].map(d=>(
                      <div key={d.label} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        {d.ready ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0"/> : <Clock size={14} className="text-gray-300 shrink-0"/>}
                        <span className={`text-sm ${d.ready?"text-foreground font-medium":"text-muted-foreground"}`}>{d.label}</span>
                        {!d.ready&&<span className="ml-auto text-[10px] text-muted-foreground">vazio</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handwritten signature pad */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rubrica / Assinatura Manuscrita</p>
                    <button onClick={clearCanvas} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><RotateCcw size={10}/>Limpar</button>
                  </div>
                  <canvas
                    ref={canvasRef} width={540} height={120}
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                    className="w-full rounded-lg border-2 border-dashed border-border cursor-crosshair bg-white"
                    style={{ touchAction:"none" }}
                  />
                  <p className="text-[10px] text-muted-foreground text-center mt-1">Assine com o mouse ou touchpad</p>
                </div>

                {/* PIN entry */}
                <div className="bg-card rounded-xl border border-border p-5">
                  <label className={labelCls}>PIN do Certificado Digital</label>
                  <div className="flex gap-3">
                    <input
                      type="password" value={certCode} onChange={e=>{setCertCode(e.target.value);setCertError(false);}}
                      maxLength={6} placeholder="••••••"
                      className={`flex-1 border rounded-xl px-4 py-3 text-xl font-mono font-black text-center bg-background outline-none tracking-[0.5em] transition-colors ${certError?"border-red-400 bg-red-50":"border-border focus:border-cyan-400"}`}
                    />
                    <button
                      onClick={handleAssinar}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-bold text-sm rounded-xl hover:bg-cyan-700 active:scale-95 transition-all shadow-md"
                    >
                      {assinatura==="signing"?<><RefreshCw size={14} className="animate-spin"/>Assinando…</>:<><Shield size={14}/>Assinar</>}
                    </button>
                  </div>
                  {certError&&<p className="mt-2 text-xs text-red-600 font-semibold">PIN incorreto. <span className="font-normal">(Demo: 1234)</span></p>}
                  {!hasSigned&&certCode.length===0&&<p className="mt-2 text-xs text-muted-foreground">Assine no campo acima e insira o PIN para validar.</p>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Finalization modal */}
      {showFinalModal&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl shadow-2xl w-[460px] overflow-hidden">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 px-6 pt-6 pb-5 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={34} className="text-white"/>
              </div>
              <p className="text-white font-black text-lg">Finalizar Atendimento</p>
              <p className="text-white/75 text-sm mt-1">{patient.name}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  {v:guias.length, l:"Guias emitidas", color:"text-cyan-600"},
                  {v:medicamentos.length, l:"Medicamentos", color:"text-purple-600"},
                  {v:assinatura==="signed"?1:0, l:"Assinado digitalmente", color:"text-emerald-600"},
                ].map(({v,l,color})=>(
                  <div key={l} className="bg-muted/30 rounded-xl p-3">
                    <p className={`text-2xl font-black ${color}`}>{v}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{l}</p>
                  </div>
                ))}
              </div>

              {assinatura!=="signed"&&(
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0"/>
                  <p className="text-xs text-amber-700 font-medium">Os documentos <strong>não foram assinados digitalmente</strong>. Deseja finalizar mesmo assim?</p>
                </div>
              )}

              {nextPatient&&(
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ChevronRight size={11}/>Próximo na Fila</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-sm">{nextPatient.name.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{nextPatient.name}</p>
                      <p className="text-xs text-muted-foreground">{nextPatient.time} · {nextPatient.procedure} · {nextPatient.age} anos</p>
                    </div>
                    <PriorityBadge priority={nextPatient.priority}/>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={()=>{setShowFinalModal(false);onFinalize(nextPatient);}}
                  className="flex items-center justify-center gap-2 py-3 bg-cyan-600 text-white font-bold text-sm rounded-xl hover:bg-cyan-700 active:scale-95 transition-all shadow"
                >
                  <CheckCircle2 size={16}/>Confirmar Finalização
                </button>
                <button onClick={()=>setShowFinalModal(false)} className="py-3 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors">
                  Voltar ao Prontuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RecepPatient extends ConsultaPatient {
  checkinTime?: string;
  queuePosition?: number;
}

const _sharedAgenda: RecepPatient[] = DOCTOR_AGENDA.map(p => ({...p}));

function RecepAgendaScreen() {
  const [patients, setPatients]     = useState<RecepPatient[]>(_sharedAgenda.map(p=>({...p})));
  const [editPhoneId, setEditPhoneId] = useState<string|null>(null);
  const [editPhoneVal, setEditPhoneVal] = useState("");
  const [checkinQueue, setCheckinQueue] = useState<RecepPatient[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all"|"aguardando"|"presente"|"concluido"|"ausente">("all");
  const [searchQ, setSearchQ]       = useState("");
  const [lastCheckin, setLastCheckin] = useState<RecepPatient|null>(null);

  const checkedIn = patients.filter(p=>p.status==="presente"||p.status==="em_atendimento"||p.status==="concluido");
  const waiting   = patients.filter(p=>p.status==="aguardando");
  const inQueue   = patients.filter(p=>p.status==="presente");

  const confirmCheckin = (p: RecepPatient) => {
    const time = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const pos  = checkedIn.length + 1;
    setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"presente" as ConsultaStatus, checkinTime:time, queuePosition:pos}:x));
    setCheckinQueue(prev=>[...prev,{...p,status:"presente",checkinTime:time,queuePosition:pos}]);
    setLastCheckin({...p,status:"presente",checkinTime:time,queuePosition:pos});
  };

  const savePhone = (id:string) => {
    setPatients(prev=>prev.map(p=>p.id===id?{...p,phone:editPhoneVal||p.phone}:p));
    setEditPhoneId(null);
  };

  const undoAbsent = (id:string) => setPatients(prev=>prev.map(p=>p.id===id?{...p,status:"aguardando" as ConsultaStatus}:p));

  const filtered = patients.filter(p=>{
    const matchStatus = filterStatus==="all" || p.status===filterStatus;
    const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.phone.includes(searchQ);
    return matchStatus && matchSearch;
  });

  const statusTabs: {key:typeof filterStatus; label:string; count:number; dot:string}[] = [
    {key:"all",        label:"Todos",       count:patients.length,             dot:"bg-gray-400"},
    {key:"aguardando", label:"Aguardando",  count:waiting.length,              dot:"bg-gray-400"},
    {key:"presente",   label:"Presente",    count:inQueue.length,              dot:"bg-emerald-500"},
    {key:"concluido",  label:"Concluído",   count:patients.filter(p=>p.status==="concluido").length, dot:"bg-blue-500"},
    {key:"ausente",    label:"Ausente",     count:patients.filter(p=>p.status==="ausente").length,   dot:"bg-red-500"},
  ];

  const priorityWeight: Record<Priority|"undefined", number> = {critical:0,priority1:1,preferential:2,normal:3,undefined:4};

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">

      {/* Top check-in banner */}
      {lastCheckin && (
        <div className="shrink-0 px-7 pt-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">{lastCheckin.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-800">✓ Check-in registrado — {lastCheckin.name}</p>
              <p className="text-xs text-emerald-600">{lastCheckin.procedure} · Posição <strong>#{lastCheckin.queuePosition}</strong> na fila do médico · {lastCheckin.checkinTime}</p>
            </div>
            <PriorityBadge priority={lastCheckin.priority}/>
            <button onClick={()=>setLastCheckin(null)}><X size={14} className="text-emerald-500 hover:text-emerald-700"/></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Agenda do Dia</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Recepção 01 · 02/07/2025 · {patients.length} pacientes agendados</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"/>Maria Fernanda · Ativo
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            {label:"Agendados",    value:patients.length,                            color:"text-foreground",  bg:"bg-secondary",   border:"border-border",       icon:<Calendar size={14}/>},
            {label:"Check-in Feito",value:checkedIn.length,                         color:"text-emerald-700", bg:"bg-emerald-50",  border:"border-emerald-200",  icon:<CheckCircle2 size={14} className="text-emerald-600"/>},
            {label:"Na Fila do Médico",value:inQueue.length,                        color:"text-violet-700",  bg:"bg-violet-50",   border:"border-violet-200",   icon:<Stethoscope size={14} className="text-violet-600"/>},
            {label:"Aguardando Check-in",value:waiting.length,                      color:"text-gray-600",    bg:"bg-gray-100",    border:"border-gray-200",     icon:<Clock size={14} className="text-gray-500"/>},
            {label:"Ausentes",     value:patients.filter(p=>p.status==="ausente").length, color:"text-red-600",bg:"bg-red-50",    border:"border-red-200",      icon:<XCircle size={14} className="text-red-500"/>},
          ].map(k=>(
            <div key={k.label} className={`${k.bg} border ${k.border} rounded-xl p-4`}>
              <div className="flex items-center gap-1.5 mb-2 opacity-60">{k.icon}</div>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Queue order (checked in patients) */}
        {checkinQueue.length>0&&(
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-violet-50 flex items-center gap-2">
              <Stethoscope size={13} className="text-violet-600"/>
              <span className="text-sm font-semibold text-violet-800">Fila de Atendimento — Médico</span>
              <span className="ml-auto text-[10px] text-violet-600 font-semibold">{checkinQueue.length} paciente{checkinQueue.length!==1?"s":""} na fila</span>
            </div>
            <div className="divide-y divide-border">
              {[...checkinQueue]
                .sort((a,b)=>(priorityWeight[a.priority||"normal"] - priorityWeight[b.priority||"normal"]) || ((a.queuePosition||99)-(b.queuePosition||99)))
                .map((p,i)=>(
                <div key={p.id} className={`px-5 py-3 flex items-center gap-3 ${i===0?"bg-violet-50/60":""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${i===0?"bg-violet-600 text-white":"bg-secondary text-primary"}`}>#{i+1}</div>
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px] font-bold text-primary shrink-0">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      {i===0&&<span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-full">PRÓXIMO</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.procedure} · Check-in {p.checkinTime}</p>
                  </div>
                  <PriorityBadge priority={p.priority}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full agenda table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1">
              {statusTabs.map(t=>(
                <button key={t.key} onClick={()=>setFilterStatus(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterStatus===t.key?"bg-card shadow-sm text-foreground":"text-muted-foreground hover:text-foreground"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`}/>
                  {t.label}
                  <span className={`text-[10px] font-black ${filterStatus===t.key?"text-foreground":"text-muted-foreground"}`}>({t.count})</span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 border border-border rounded-lg px-3 bg-background">
              <Search size={12} className="text-muted-foreground"/>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar paciente…" className="text-xs py-2 outline-none bg-transparent w-40 placeholder:text-muted-foreground"/>
              {searchQ&&<button onClick={()=>setSearchQ("")}><X size={11} className="text-muted-foreground"/></button>}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["#","Hora","Paciente & Dados","Procedimento","Prioridade","Telefone","Status","Ações"].map((h,i)=>(
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i===7?"text-right":i<=1?"text-center":"text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const scfg  = CONSULTA_STATUS_CFG[p.status];
                const isIn  = p.status==="presente";
                const isDone= p.status==="concluido"||p.status==="em_atendimento";
                const isAbsent = p.status==="ausente";
                const editingPhone = editPhoneId===p.id;
                return (
                  <tr key={p.id} className={`border-b border-border/60 transition-colors group ${isIn?"bg-emerald-50/40 hover:bg-emerald-50":isAbsent?"bg-red-50/20 opacity-60":isDone?"bg-blue-50/20":i%2===0?"hover:bg-accent/15":"bg-muted/10 hover:bg-accent/15"}`}>
                    {/* Queue position */}
                    <td className="px-3 py-3 text-center">
                      {p.queuePosition
                        ? <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center mx-auto">#{p.queuePosition}</span>
                        : <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center mx-auto">{i+1}</span>}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="font-mono text-xs font-bold">{p.time}</span>
                      {p.checkinTime&&<p className="text-[9px] text-emerald-600 font-mono">✓ {p.checkinTime}</p>}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isIn?"bg-emerald-500 text-white":isDone?"bg-blue-500 text-white":"bg-secondary text-primary"}`}>{p.name.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-semibold leading-tight">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{p.age} anos · {p.cpf}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5"><Stethoscope size={10} className="text-muted-foreground shrink-0"/><span className="text-xs">{p.procedure}</span></div>
                    </td>

                    <td className="px-4 py-3"><PriorityBadge priority={p.priority}/></td>

                    {/* Editable phone */}
                    <td className="px-4 py-3">
                      {editingPhone ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1.5 border-2 border-violet-400 rounded-lg px-2 py-1 bg-white">
                            <Phone size={10} className="text-violet-500 shrink-0"/>
                            <input
                              value={editPhoneVal}
                              onChange={e=>setEditPhoneVal(e.target.value)}
                              onKeyDown={e=>{ if(e.key==="Enter") savePhone(p.id); if(e.key==="Escape"){setEditPhoneId(null);} }}
                              className="text-xs font-mono outline-none w-28 bg-transparent"
                              autoFocus
                            />
                          </div>
                          <button onClick={()=>savePhone(p.id)} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"><Check size={10}/></button>
                          <button onClick={()=>setEditPhoneId(null)} className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"><X size={10}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/phone">
                          <WaIcon/>
                          <span className="text-xs font-mono text-muted-foreground">{p.phone}</span>
                          <button
                            onClick={()=>{ setEditPhoneId(p.id); setEditPhoneVal(p.phone); }}
                            className="opacity-0 group-hover/phone:opacity-100 p-1 rounded hover:bg-violet-50 text-violet-500 transition-all"
                          ><Edit3 size={9}/></button>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${scfg.bg} ${scfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot} shrink-0`}/>
                        {scfg.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status==="aguardando"&&(
                          <button
                            onClick={()=>confirmCheckin(p)}
                            className="flex items-center gap-1.5.5 px-3.5.5 py-1.5 text-xs font-bold rounded-lg text-white transition-all active:scale-95 hover:opacity-90"
                            style={{ background:"#7C3AED" }}
                          ><CheckCircle2 size={10}/>PPaciente CChegou</button>
                        )}
                        {p.status==="presente"&&(
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"><CheckCircle2 size={11}/>Na fila</span>
                        )}
                        {p.status==="em_atendimento"&&(
                          <span className="flex items-center gap-1.5 text-xs text-cyan-600 font-semibold"><RefreshCw size={10} className="animate-spin"/>Em atendimento</span>
                        )}
                        {p.status==="concluido"&&(
                          <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold"><CheckCircle2 size={11}/>Concluído</span>
                        )}
                        {p.status==="ausente"&&(
                          <button onClick={()=>undoAbsent(p.id)} className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-muted transition-colors"><RotateCcw size={10}/>Desfazer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length===0&&(
            <div className="py-14 text-center">
              <Search size={32} className="text-muted-foreground mx-auto mb-3 opacity-30"/>
              <p className="text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
            </div>
          )}
        </div>

        {/* Summary footer */}
        <div className="grid grid-cols-3 gap-4 pb-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Ordem de Chegada</p>
            {checkinQueue.length===0
              ? <p className="text-xs text-muted-foreground">Nenhum check-in realizado ainda.</p>
              : checkinQueue.slice(0,5).map((p,i)=>(
                <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-border/60 last:border-0">
                  <span className="text-xs font-black text-violet-600 w-5">#{p.queuePosition}</span>
                  <span className="text-xs font-medium flex-1 truncate">{p.name.split(" ").slice(0,2).join(" ")}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p.checkinTime}</span>
                </div>
              ))
            }
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Por Prioridade</p>
            {(["critical","priority1","preferential","normal"] as Priority[]).map(pr=>{
              const count = patients.filter(p=>(p.priority||"normal")===pr&&p.status!=="ausente").length;
              if(!count) return null;
              const pcfg = PRIORITY_CFG[pr];
              return pcfg?(
                <div key={pr} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                  <PriorityBadge priority={pr}/>
                  <span className="text-xs font-bold">{count}</span>
                </div>
              ):null;
            })}
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Normal</span>
              <span className="text-xs font-bold">{patients.filter(p=>(p.priority||"normal")==="normal"&&p.status!=="ausente").length}</span>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Por Procedimento</p>
            {["Mamografia","Ortopedia","Buco Maxilo","Consulta Geral","Geral"].map(proc=>{
              const count = patients.filter(p=>p.procedure.includes(proc.split(" ")[0])).length;
              if(!count) return null;
              return (
                <div key={proc} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                  <span className="text-xs text-muted-foreground">{proc}</span>
                  <span className="text-xs font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Regulador Sidebar ────────────────────────────────────────────────────────────

function ReguladorSidebar({ active, onNav, onSwitchProfile }: { active:Screen; onNav:(s:Screen)=>void; onSwitchProfile:()=>void }) {
  const navItems: {id:Screen; icon:React.ReactNode; label:string; divider?:boolean}[] = [
    { id:"regulador-vagas",  icon:<BarChart2 size={15}/>,    label:"Painel de Vagas" },
    { id:"regulador-guias",  icon:<Kanban size={15}/>,       label:"Gestão de Guias", divider:true },
  ];
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col" style={{ background:"#1A1200", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-md"><Kanban size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(235,220,200,0.5)" }}>Central de Regulação</div></div>
        </div>
        <ProfileSwitcher profile="regulador" onSwitch={onSwitchProfile}/>
      </div>
      <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-xs font-black text-amber-300">RB</div>
          <div>
            <p className="text-[12px] font-bold text-white">Ricardo Borges</p>
            <p className="text-[10px]" style={{ color:"rgba(235,220,200,0.5)" }}>Regulador Municipal</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/><span className="text-[10px] text-amber-400">REMISSUS · Campo Grande</span></div>
      </div>
      <nav className="flex-1 px-2 pb-2">
        {navItems.map(item=>{
          const isActive = active===item.id;
          return (
            <div key={item.id}>
              {item.divider&&<div className="my-1.5 mx-2 h-px" style={{ background:"rgba(255,255,255,0.07)" }}/>}
              <button onClick={()=>onNav(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"rgba(245,158,11,0.2)"}:{color:"rgba(235,220,200,0.6)"}}>
                <span style={{ color:isActive?"#fbbf24":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>
      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">RB</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium truncate">Ricardo Borges</p><p className="text-[10px]" style={{ color:"rgba(235,220,200,0.4)" }}>Regulador</p></div>
          <LogOut size={11} style={{ color:"rgba(235,220,200,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ─── TFD Sidebar ─────────────────────────────────────────────────────────────────

function TFDSidebar({ active, onNav, onSwitchProfile }: { active:Screen; onNav:(s:Screen)=>void; onSwitchProfile:()=>void }) {
  const navItems: {id:Screen; icon:React.ReactNode; label:string}[] = [
    { id:"tfd-viagens",      icon:<Route size={15}/>,      label:"Gestão de Viagens" },
    { id:"tfd-frota",        icon:<Bus size={15}/>,         label:"Controle de Frota" },
    { id:"tfd-roteirizacao", icon:<Navigation size={15}/>, label:"Roteirização" },
  ];
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col" style={{ background:"#001A10", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md"><Truck size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(200,235,220,0.5)" }}>TFD — Logística</div></div>
        </div>
        <ProfileSwitcher profile="tfd" onSwitch={onSwitchProfile}/>
      </div>
      <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-xs font-black text-emerald-300">CL</div>
          <div>
            <p className="text-[12px] font-bold text-white">Cláudia Lopes</p>
            <p className="text-[10px]" style={{ color:"rgba(200,235,220,0.5)" }}>Agente TFD</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[10px] text-emerald-400">REME · Campo Grande</span></div>
      </div>
      <nav className="flex-1 px-2 pb-2">
        {navItems.map(item=>{
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>onNav(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"rgba(16,185,129,0.2)"}:{color:"rgba(200,235,220,0.6)"}}>
              <span style={{ color:isActive?"#34d399":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">CL</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium truncate">Cláudia Lopes</p><p className="text-[10px]" style={{ color:"rgba(200,235,220,0.4)" }}>Agente TFD</p></div>
          <LogOut size={11} style={{ color:"rgba(200,235,220,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ─── Recep Cadastro Screen ────────────────────────────────────────────────────────

function RecepCadastroScreen() {
  const [tab, setTab] = useState<"dados"|"endereco"|"historico"|"lgpd">("dados");
  const [saved, setSaved] = useState(false);
  const tabs: {id:typeof tab; label:string}[] = [
    {id:"dados",    label:"1 · Dados Pessoais"},
    {id:"endereco", label:"2 · Endereço"},
    {id:"historico",label:"3 · Histórico"},
    {id:"lgpd",     label:"4 · Consentimento LGPD"},
  ];
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Cadastro de Paciente</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Preencha todas as abas antes de salvar</p>
      </div>
      {saved && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0"/>
          <div><p className="text-sm font-bold text-emerald-800">Cadastro salvo com sucesso!</p><p className="text-xs text-emerald-600">Paciente registrado no sistema. Pronto para agendamento.</p></div>
          <button onClick={()=>setSaved(false)} className="ml-auto"><X size={14} className="text-emerald-500"/></button>
        </div>
      )}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-border">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 px-4 py-3.5 text-xs font-semibold transition-colors border-b-2 ${tab===t.id?"border-violet-500 text-violet-600 bg-violet-50":"border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>{t.label}</button>
          ))}
        </div>

        <div className="p-6">
          {tab==="dados" && (
            <div className="grid grid-cols-2 gap-5">
              {[
                {label:"Nome Completo",    placeholder:"Conforme documento oficial", span:true},
                {label:"Nome Social",      placeholder:"Se houver"},
                {label:"CPF",             placeholder:"000.000.000-00"},
                {label:"CNS",             placeholder:"000 0000 0000 0000"},
                {label:"Data de Nascimento",placeholder:"DD/MM/AAAA"},
                {label:"Sexo",            placeholder:"Selecionar"},
                {label:"Nome da Mãe",     placeholder:"", span:true},
                {label:"Telefone 1",      placeholder:"(67) 99999-9999"},
                {label:"Telefone 2",      placeholder:"Opcional"},
              ].map(f=>(
                <div key={f.label} className={f.span?"col-span-2":""}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all" placeholder={f.placeholder}/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Prioridade</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all">
                  <option>Normal</option><option>Preferencial (60+)</option><option>Prioridade 1</option><option>Crítico</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Município</label>
                <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all">
                  <option>Campo Grande</option><option>Dourados</option><option>Três Lagoas</option><option>Corumbá</option><option>Ponta Porã</option>
                </select>
              </div>
            </div>
          )}
          {tab==="endereco" && (
            <div className="grid grid-cols-2 gap-5">
              {[
                {label:"CEP",             placeholder:"00000-000"},
                {label:"Município",       placeholder:"Campo Grande"},
                {label:"Logradouro",      placeholder:"Rua, Av., Travessa...", span:true},
                {label:"Número",          placeholder:"S/N"},
                {label:"Complemento",     placeholder:"Apto, Casa, Bloco..."},
                {label:"Bairro",          placeholder:""},
                {label:"UF",              placeholder:"MS"},
              ].map(f=>(
                <div key={f.label} className={f.span?"col-span-2":""}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all" placeholder={f.placeholder}/>
                </div>
              ))}
            </div>
          )}
          {tab==="historico" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Condições Crônicas Conhecidas</label>
                  <textarea className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" rows={3} placeholder="Diabetes, HAS, asma..."/>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Medicamentos em Uso Contínuo</label>
                  <textarea className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" rows={3} placeholder="Metformina 850mg, Losartana 50mg..."/>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-bold text-amber-800 mb-1">Histórico importado do RNDS</p>
                <p className="text-xs text-amber-700">Nenhum registro encontrado para este CNS. Preencha manualmente se necessário.</p>
              </div>
            </div>
          )}
          {tab==="lgpd" && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">Autorização para Tratamento de Dados — LGPD</p>
                <p className="text-xs text-blue-800 leading-relaxed">De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), seus dados pessoais e de saúde serão utilizados exclusivamente para fins de atendimento e gestão de saúde pública. Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento.</p>
              </div>
              {[
                "Autorizo o armazenamento e uso dos meus dados para fins de atendimento na rede SUS.",
                "Autorizo o compartilhamento de informações de saúde entre unidades da rede REMISSUS.",
                "Concordo com o envio de notificações via WhatsApp para confirmação de consultas.",
              ].map((txt,i)=>(
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 accent-violet-500 w-4 h-4 shrink-0 cursor-pointer"/>
                  <span className="text-sm text-foreground group-hover:text-violet-700 transition-colors">{txt}</span>
                </label>
              ))}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Assinatura Digital (rubrica)</label>
                <div className="h-20 rounded-lg border-2 border-dashed border-border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">Espaço reservado para assinatura</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">* Campos obrigatórios devem ser preenchidos em todas as abas</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
            <button onClick={()=>setSaved(true)} className="px-5 py-2 rounded-lg bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors flex items-center gap-2"><Check size={14}/>Salvar Cadastro</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recep Agendamento Screen ─────────────────────────────────────────────────────

function RecepAgendamentoScreen() {
  const [selectedDay, setSelectedDay] = useState(10);
  const [selectedSlot, setSelectedSlot] = useState<string|null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const days = Array.from({length:14},(_,i)=>i+1);
  const slots = [
    {time:"07:00", status:"ocupado"}, {time:"07:30", status:"ocupado"}, {time:"08:00", status:"disponivel"},
    {time:"08:30", status:"disponivel"}, {time:"09:00", status:"bloqueado"}, {time:"09:30", status:"disponivel"},
    {time:"10:00", status:"ocupado"}, {time:"10:30", status:"disponivel"}, {time:"11:00", status:"disponivel"},
    {time:"11:30", status:"ocupado"}, {time:"13:00", status:"disponivel"}, {time:"13:30", status:"disponivel"},
    {time:"14:00", status:"bloqueado"}, {time:"14:30", status:"disponivel"}, {time:"15:00", status:"disponivel"},
    {time:"15:30", status:"ocupado"}, {time:"16:00", status:"disponivel"}, {time:"16:30", status:"disponivel"},
  ];
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Agendamento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Selecione a data e o horário disponível</p>
      </div>
      {confirmed && (
        <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-600"/><div><p className="text-sm font-bold text-emerald-800">Agendamento Confirmado!</p><p className="text-xs text-emerald-600">Dia 10/07/2025 às {selectedSlot} · Notificação WhatsApp será enviada ao paciente.</p></div>
          <button onClick={()=>setConfirmed(false)} className="ml-auto"><X size={14} className="text-emerald-500"/></button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Speciality + doctor selectors */}
          <div className="bg-card rounded-xl border border-border p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Especialidade</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all">
                <option>Clínica Geral</option><option>Ortopedia</option><option>Cardiologia</option><option>Ginecologia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Profissional</label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all">
                <option>Dr. Carlos Medeiros</option><option>Dra. Fernanda Rocha</option>
              </select>
            </div>
          </div>
          {/* Calendar strip */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground">Julho 2025</p>
              <div className="flex gap-1"><button className="p-1 rounded hover:bg-muted"><ChevronLeft size={14}/></button><button className="p-1 rounded hover:bg-muted"><ChevronRight size={14}/></button></div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map(d=>{
                const isSelected = d===selectedDay;
                const isToday = d===2;
                return (
                  <button key={d} onClick={()=>setSelectedDay(d)} className={`shrink-0 w-10 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${isSelected?"bg-violet-500 text-white":isToday?"bg-violet-50 border border-violet-300 text-violet-700":"hover:bg-muted text-muted-foreground"}`}>
                    <span className="text-[9px] font-normal">{["","Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d%7]||"Seg"}</span>
                    <span>{d}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Time slots */}
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm font-bold text-foreground mb-3">Horários — {selectedDay}/07/2025</p>
            <div className="grid grid-cols-6 gap-2">
              {slots.map(s=>{
                const isSelected = selectedSlot===s.time;
                const isDisp = s.status==="disponivel";
                return (
                  <button key={s.time} onClick={()=>isDisp&&setSelectedSlot(s.time)} className={`py-2 rounded-lg text-xs font-semibold text-center border transition-all ${isSelected?"bg-violet-500 border-violet-500 text-white":s.status==="ocupado"?"bg-muted border-border text-muted-foreground cursor-not-allowed line-through":s.status==="bloqueado"?"bg-red-50 border-red-200 text-red-400 cursor-not-allowed":"bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}>
                    {s.time}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              {[{c:"bg-emerald-400",l:"Disponível"},{c:"bg-muted",l:"Ocupado"},{c:"bg-red-300",l:"Bloqueado"},{c:"bg-violet-500",l:"Selecionado"}].map(l=>(
                <div key={l.l} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-sm ${l.c}`}/><span className="text-[11px] text-muted-foreground">{l.l}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Resumo do Agendamento</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Paciente</span><span className="font-semibold text-foreground">Rosangela Lima</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Especialidade</span><span className="font-semibold text-foreground">Clínica Geral</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Médico</span><span className="font-semibold text-foreground">Dr. Carlos Medeiros</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span className="font-semibold text-foreground">{selectedDay}/07/2025</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Horário</span><span className={`font-bold ${selectedSlot?"text-violet-600":"text-muted-foreground"}`}>{selectedSlot||"— selecione —"}</span></div>
            </div>
            <button onClick={()=>{if(selectedSlot)setConfirmed(true);}} disabled={!selectedSlot} className={`w-full mt-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${selectedSlot?"bg-violet-500 text-white hover:bg-violet-600":"bg-muted text-muted-foreground cursor-not-allowed"}`}>
              <Check size={14}/>Confirmar Agendamento
            </button>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Notificação</p>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-violet-500"/><span className="text-xs text-foreground">Enviar lembrete via WhatsApp 24h antes</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recep WhatsApp Screen ────────────────────────────────────────────────────────

function RecepWhatsAppScreen() {
  const waPatients = BASE_PATIENTS.map(p=>({...p, waStatus: p.status}));
  const stats = [
    {label:"Enviados",   val:waPatients.filter(p=>["sent","confirmed","refused","expired"].includes(p.status)).length, color:"text-blue-600", bg:"bg-blue-50 border-blue-200" },
    {label:"Confirmados",val:waPatients.filter(p=>p.status==="confirmed").length, color:"text-emerald-600", bg:"bg-emerald-50 border-emerald-200" },
    {label:"Recusados",  val:waPatients.filter(p=>p.status==="refused").length,   color:"text-orange-600", bg:"bg-orange-50 border-orange-200" },
    {label:"Sem resposta",val:waPatients.filter(p=>p.status==="expired").length,  color:"text-amber-600",  bg:"bg-amber-50 border-amber-200" },
  ];
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Status WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Notificações e confirmações de pacientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"><RefreshCw size={14}/>Atualizar</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s=>(
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-3">
          <Search size={14} className="text-muted-foreground"/>
          <input className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none" placeholder="Buscar paciente..."/>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">{["Paciente","Procedimento","Horário","Status WA","Ação"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody>
            {waPatients.map(p=>{
              const cfg = STATUS_CFG[p.status];
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><p className="font-semibold text-foreground">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.phone}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.procedure}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{p.time}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.text}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{cfg.label}</span></td>
                  <td className="px-4 py-3">
                    {p.status==="waiting"&&<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"><WaIcon/>Disparar</button>}
                    {p.status==="expired"&&<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"><Send size={11}/>Reenviar</button>}
                    {(p.status==="confirmed"||p.status==="sent")&&<span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Regulador Vagas Screen ───────────────────────────────────────────────────────

function ReguladorVagasScreen() {
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Painel de Vagas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Disponibilidade municipal e estadual por especialidade — 02/07/2025</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none"><option>Todas as origens</option><option>Municipal</option><option>Estadual</option></select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"><Plus size={14}/>Solicitar Vaga</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:"Vagas Municipais",  val:"103", used:"73", color:"text-amber-600",   bg:"bg-amber-50 border-amber-200"},
          {label:"Vagas Estaduais",   val:"54",  used:"40", color:"text-blue-600",    bg:"bg-blue-50 border-blue-200"},
          {label:"Crítico/Urgente",   val:"5",   used:"5",  color:"text-red-600",     bg:"bg-red-50 border-red-200"},
          {label:"% Ocupação Geral",  val:"73%", used:"",   color:"text-foreground",  bg:"bg-card border-border"},
        ].map(k=>(
          <div key={k.label} className={`rounded-xl p-4 border ${k.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.val}</p>
            {k.used&&<p className="text-[11px] text-muted-foreground">{k.used} em uso</p>}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-sm font-bold text-foreground">Vagas por Especialidade</p>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">{["Especialidade","Mun. Disponível","Mun. Usadas","Est. Disponível","Est. Usadas","Ocupação","Alerta"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody>
            {VAGAS_DATA.map(v=>{
              const totalDisp = v.vagasMunicipal + v.vagasEstadual;
              const totalUsado = v.usadasMunicipal + v.usadasEstadual;
              const pct = totalDisp > 0 ? Math.round((totalUsado/totalDisp)*100) : 0;
              const livresM = v.vagasMunicipal - v.usadasMunicipal;
              const livresE = v.vagasEstadual - v.usadasEstadual;
              const alert = pct>=90?"Crítico":pct>=75?"Atenção":null;
              return (
                <tr key={v.especialidade} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{v.especialidade}</td>
                  <td className="px-4 py-3"><span className={`font-bold ${livresM<=2?"text-red-500":"text-emerald-600"}`}>{livresM} livres</span><span className="text-muted-foreground text-xs"> / {v.vagasMunicipal}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{v.usadasMunicipal}</td>
                  <td className="px-4 py-3"><span className={`font-bold ${livresE<=1?"text-red-500":"text-emerald-600"}`}>{livresE} livres</span><span className="text-muted-foreground text-xs"> / {v.vagasEstadual}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{v.usadasEstadual}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${pct>=90?"bg-red-500":pct>=75?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${pct}%`}}/></div>
                      <span className="text-xs font-bold text-muted-foreground w-7 text-right">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {alert?<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${alert==="Crítico"?"bg-red-50 text-red-700 border border-red-200":"bg-amber-50 text-amber-700 border border-amber-200"}`}><AlertTriangle size={9}/>{alert}</span>:<span className="text-xs text-emerald-600 font-medium">OK</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TFD Viagens Screen ───────────────────────────────────────────────────────────

function TFDViagensScreen() {
  const [viagens, setViagens] = useState<ViagemTFD[]>(VIAGENS_TFD);
  const [filter, setFilter] = useState<ViagemTFD["status"]|"all">("all");

  const aprovar = (id:string) => setViagens(p=>p.map(v=>v.id===id&&v.status==="solicitado"?{...v,status:"aprovado"}:v));
  const agendar = (id:string) => setViagens(p=>p.map(v=>v.id===id&&v.status==="aprovado"?{...v,status:"agendado"}:v));
  const cancelar = (id:string) => setViagens(p=>p.map(v=>v.id===id?{...v,status:"cancelado"}:v));

  const statusCfg: Record<ViagemTFD["status"],{label:string;bg:string;text:string;dot:string}> = {
    solicitado:{label:"Solicitado", bg:"bg-gray-100",    text:"text-gray-700",    dot:"bg-gray-400"},
    aprovado:  {label:"Aprovado",  bg:"bg-blue-50",     text:"text-blue-700",    dot:"bg-blue-500"},
    agendado:  {label:"Agendado",  bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500"},
    concluido: {label:"Concluído", bg:"bg-violet-50",   text:"text-violet-700",  dot:"bg-violet-500"},
    cancelado: {label:"Cancelado", bg:"bg-red-50",      text:"text-red-700",     dot:"bg-red-500"},
  };

  const tabs: {key:ViagemTFD["status"]|"all"; label:string}[] = [
    {key:"all",        label:`Todas (${viagens.length})`},
    {key:"solicitado", label:`Solicitadas (${viagens.filter(v=>v.status==="solicitado").length})`},
    {key:"aprovado",   label:`Aprovadas (${viagens.filter(v=>v.status==="aprovado").length})`},
    {key:"agendado",   label:`Agendadas (${viagens.filter(v=>v.status==="agendado").length})`},
    {key:"concluido",  label:`Concluídas (${viagens.filter(v=>v.status==="concluido").length})`},
  ];

  const filtered = filter==="all" ? viagens : viagens.filter(v=>v.status===filter);

  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestão de Viagens TFD</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tratamento Fora de Domicílio — solicitações e aprovações</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"><Plus size={14}/>Nova Solicitação</button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setFilter(t.key)} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter===t.key?"bg-emerald-500 text-white":"bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(v=>{
          const cfg = statusCfg[v.status];
          return (
            <div key={v.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0"><Truck size={18} className="text-emerald-600"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-muted-foreground font-mono">{v.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{cfg.label}</span>
                </div>
                <p className="font-bold text-foreground">{v.paciente}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={10}/>{v.municipioOrigem} → {v.destinoConsulta}</span>
                  <span className="flex items-center gap-1"><Stethoscope size={10}/>{v.especialidade}</span>
                  <span className="flex items-center gap-1"><Calendar size={10}/>{v.dataViagem}</span>
                  {v.acompanhante&&<span className="flex items-center gap-1"><User size={10}/>Acompanhante: {v.acompanhante}</span>}
                </div>
                {v.obs&&<p className="text-[11px] text-amber-700 mt-1.5 bg-amber-50 px-2 py-1 rounded inline-block">{v.obs}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {v.status==="solicitado"&&<button onClick={()=>aprovar(v.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors">Aprovar</button>}
                {v.status==="aprovado"&&<button onClick={()=>agendar(v.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1"><Car size={11}/>Alocar Veículo</button>}
                {(v.status==="solicitado"||v.status==="aprovado")&&<button onClick={()=>cancelar(v.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">Cancelar</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TFD Frota Screen ─────────────────────────────────────────────────────────────

function TFDFrotaScreen() {
  const statusCfg: Record<VeiculoFrota["status"],{label:string;bg:string;text:string;dot:string;border:string}> = {
    disponivel:  {label:"Disponível",  bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500", border:"border-emerald-200"},
    em_uso:      {label:"Em Uso",      bg:"bg-blue-50",     text:"text-blue-700",    dot:"bg-blue-500",    border:"border-blue-200"},
    manutencao:  {label:"Manutenção",  bg:"bg-amber-50",    text:"text-amber-700",   dot:"bg-amber-500",   border:"border-amber-200"},
  };
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Controle de Frota</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Inventário e alocação de veículos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"><Plus size={14}/>Adicionar Veículo</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:"Frota Total",  val:"6",  sub:"veículos cadastrados", color:"text-foreground", bg:"bg-card border-border"},
          {label:"Em Operação",  val:"3",  sub:"em rota ativa",        color:"text-blue-600",   bg:"bg-blue-50 border-blue-200"},
          {label:"Disponíveis",  val:"2",  sub:"prontos para alocar",  color:"text-emerald-600",bg:"bg-emerald-50 border-emerald-200"},
        ].map(k=>(
          <div key={k.label} className={`rounded-xl p-4 border ${k.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-black ${k.color}`}>{k.val}</p>
            <p className="text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FROTA_TFD.map(v=>{
          const cfg = statusCfg[v.status];
          const pct = v.capacidade > 0 ? Math.round((v.alocados/v.capacidade)*100) : 0;
          return (
            <div key={v.id} className={`bg-card rounded-xl border p-4 transition-shadow hover:shadow-md ${cfg.border}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                    {v.tipo==="Ambulância"?<Zap size={18} className={cfg.text}/>:v.tipo==="Micro-ônibus"?<Bus size={18} className={cfg.text}/>:<Car size={18} className={cfg.text}/>}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{v.modelo}</p>
                    <p className="text-xs text-muted-foreground font-mono">{v.placa} · {v.tipo}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{cfg.label}</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Capacidade</span><span className="font-bold text-foreground">{v.alocados}/{v.capacidade} passageiros</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${pct>=90?"bg-red-500":pct>=70?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${pct}%`}}/></div>
                {v.rota&&<p className="flex items-center gap-1"><Route size={10}/>{v.rota}</p>}
                {v.motorista&&<p className="flex items-center gap-1"><User size={10}/>Motorista: {v.motorista}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TFD Roteirizacao Screen ──────────────────────────────────────────────────────

function TFDRoteirizacaoScreen() {
  const [printed, setPrinted] = useState(false);
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Roteirização</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Itinerários e listas de embarque — 10/07/2025</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"><Download size={14}/>Exportar PDF</button>
          <button onClick={()=>setPrinted(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"><ClipboardCheck size={14}/>Emitir Lista Embarque</button>
        </div>
      </div>
      {printed&&(
        <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-600"/><p className="text-sm font-bold text-emerald-800">Lista de embarque emitida e enviada aos motoristas!</p>
          <button onClick={()=>setPrinted(false)} className="ml-auto"><X size={14} className="text-emerald-500"/></button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-foreground">Rota HNAS — Campo Grande</p>
                <p className="text-xs text-muted-foreground">Veículo: HST-2341 · Sprinter 415 · Motorista: Antônio Borges</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">12/14 passageiros</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/30 border-b border-border">{["#","Paciente","Município","Especialidade","Consulta"].map(h=><th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
                <tbody>
                  {ROTEIRO_10JUL.map((p,i)=>(
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{String(i+1).padStart(2,"0")}</td>
                      <td className="px-3 py-2.5 font-semibold text-foreground">{p.nome}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.municipio}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.especialidade}</td>
                      <td className="px-3 py-2.5 font-mono text-sm font-bold text-emerald-700">{p.horarioConsulta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Resumo 10/07</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Passageiros</span><span className="font-bold text-foreground">12</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Destinos</span><span className="font-bold text-foreground">3 unidades</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Veículos</span><span className="font-bold text-foreground">2 veículos</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Saída</span><span className="font-bold text-emerald-700">06:30</span></div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Confirmação Embarque</p>
            <div className="space-y-2">
              {ROTEIRO_10JUL.map((p,i)=>(
                <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked={i<3} className="accent-emerald-500 w-3.5 h-3.5"/>
                  <span className="text-xs text-foreground truncate">{p.nome}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Hub ─────────────────────────────────────────────────────────────────

function HubScreen({ onSelect }: { onSelect:(p:AppProfile)=>void }) {
  const profiles: { id:AppProfile; label:string; desc:string; accent:string; iconBg:string; iconColor:string; tagBg:string; tagText:string; icon:React.ReactNode; screens:string[] }[] = [
    {
      id:"gestor", label:"Gestor / Regulação", desc:"Dashboard, filas, clínicas, relatórios e auditoria do sistema.",
      accent:"border-l-[#4A9EE8]", iconBg:"bg-blue-100", iconColor:"text-[#4A9EE8]", tagBg:"bg-blue-50", tagText:"text-blue-600",
      icon:<ShieldAlert size={20}/>, screens:["Dashboard","Filas","Clínicas","Relatórios","Auditoria"],
    },
    {
      id:"medico", label:"Portal do Médico", desc:"Agenda do dia, prontuário eletrônico e atendimento clínico.",
      accent:"border-l-cyan-500", iconBg:"bg-cyan-100", iconColor:"text-cyan-600", tagBg:"bg-cyan-50", tagText:"text-cyan-700",
      icon:<Stethoscope size={20}/>, screens:["Agenda do Dia","Prontuário","Atendimento"],
    },
    {
      id:"recep-ubs", label:"Recepção UBS", desc:"Fila da UBS, agenda do dia e cadastro de pacientes com CNS.",
      accent:"border-l-violet-500", iconBg:"bg-violet-100", iconColor:"text-violet-600", tagBg:"bg-violet-50", tagText:"text-violet-700",
      icon:<UserCheck size={20}/>, screens:["Dashboard UBS","Agenda / Check-in","Cadastro Paciente"],
    },
    {
      id:"recep-reg", label:"Recepção Regulação", desc:"Todas as filas, agendamentos, cadastro e status de notificações.",
      accent:"border-l-fuchsia-500", iconBg:"bg-fuchsia-100", iconColor:"text-fuchsia-600", tagBg:"bg-fuchsia-50", tagText:"text-fuchsia-700",
      icon:<ClipboardList size={20}/>, screens:["Dashboard Geral","Agendamentos","Agendar","Status WhatsApp"],
    },
    {
      id:"regulador", label:"Central de Regulação", desc:"Painel de vagas municipais/estaduais e gestão de guias.",
      accent:"border-l-amber-500", iconBg:"bg-amber-100", iconColor:"text-amber-600", tagBg:"bg-amber-50", tagText:"text-amber-700",
      icon:<Kanban size={20}/>, screens:["Painel de Vagas","Gestão de Guias"],
    },
    {
      id:"tfd", label:"Agente TFD", desc:"Viagens, frota e roteirização para tratamento fora do domicílio.",
      accent:"border-l-emerald-500", iconBg:"bg-emerald-100", iconColor:"text-emerald-600", tagBg:"bg-emerald-50", tagText:"text-emerald-700",
      icon:<Truck size={20}/>, screens:["Gestão de Viagens","Controle de Frota","Roteirização"],
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#4A9EE8] flex items-center justify-center shadow-lg shadow-[#4A9EE8]/25"><Activity size={21} className="text-white"/></div>
          <span className="text-3xl font-black text-slate-800 tracking-tight">AIVO</span>
        </div>
        <p className="text-sm text-slate-500">Sistema Integrado de Saúde Pública · Selecione o perfil de acesso</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
        {profiles.map(p=>(
          <button key={p.id} onClick={()=>onSelect(p.id)}
            className={`text-left p-5 rounded-2xl bg-white border border-slate-200 border-l-4 ${p.accent} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group`}>
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${p.iconBg}`}>
              <span className={p.iconColor}>{p.icon}</span>
            </div>
            <p className="font-bold text-sm text-slate-800 mb-1">{p.label}</p>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{p.desc}</p>
            <div className="flex flex-wrap gap-1">
              {p.screens.map(s=>(
                <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.tagBg} ${p.tagText}`}>{s}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <p className="mt-8 text-[11px] text-slate-400">AIVO · Regulação de Agendas · MS · v2.0</p>
    </div>
  );
}

// ─── Recepção UBS Sidebar ─────────────────────────────────────────────────────────

function RecepUBSSidebar({ active, onNav, onHub }: { active:Screen; onNav:(s:Screen)=>void; onHub:()=>void }) {
  const navItems: {id:Screen; icon:React.ReactNode; label:string}[] = [
    { id:"ubs-dashboard", icon:<LayoutDashboard size={15}/>, label:"Dashboard da Fila" },
    { id:"ubs-agenda",    icon:<ClipboardList size={15}/>,   label:"Agenda / Check-in" },
    { id:"ubs-cadastro",  icon:<UserPlus size={15}/>,        label:"Cadastro Paciente" },
  ];
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col" style={{ background:"#130F2A", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shadow-md"><UserCheck size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(200,216,235,0.5)" }}>Recepção UBS</div></div>
        </div>
        <button onClick={onHub} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
          <LayoutDashboard size={12} className="text-violet-400"/><span className="text-[11px] text-violet-300 font-semibold">Hub de Perfis</span>
          <Repeat2 size={11} className="text-violet-400 ml-auto"/>
        </button>
      </div>
      <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center text-xs font-black text-violet-300">MF</div>
          <div><p className="text-[12px] font-bold text-white">Maria Fernanda</p><p className="text-[10px]" style={{ color:"rgba(200,216,235,0.5)" }}>Recepcionista · UBS Central</p></div>
        </div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"/><span className="text-[10px] text-violet-400">Recepção 01 · 02/07/2025</span></div>
      </div>
      <nav className="flex-1 px-2 pb-2">
        {navItems.map(item=>{
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>onNav(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"rgba(139,92,246,0.22)"}:{color:"rgba(200,216,235,0.6)"}}>
              <span style={{ color:isActive?"#a78bfa":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">MF</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium truncate">Maria Fernanda</p><p className="text-[10px]" style={{ color:"rgba(200,216,235,0.4)" }}>Recepcionista UBS</p></div>
          <LogOut size={11} style={{ color:"rgba(200,216,235,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ─── Recepção Regulação Sidebar ───────────────────────────────────────────────────

function RecepRegSidebar({ active, onNav, onHub }: { active:Screen; onNav:(s:Screen)=>void; onHub:()=>void }) {
  const navItems: {id:Screen; icon:React.ReactNode; label:string}[] = [
    { id:"reg-dashboard",   icon:<LayoutDashboard size={15}/>, label:"Dashboard Geral" },
    { id:"reg-agenda",      icon:<ClipboardList size={15}/>,   label:"Agendamentos do Dia" },
    { id:"reg-cadastro",    icon:<UserPlus size={15}/>,        label:"Cadastro Paciente" },
    { id:"reg-agendamento", icon:<Calendar size={15}/>,        label:"Agendar" },
    { id:"reg-whatsapp",    icon:<Wifi size={15}/>,            label:"Status Notificações" },
  ];
  return (
    <aside className="w-[210px] shrink-0 h-screen flex flex-col" style={{ background:"#150820", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-fuchsia-500 flex items-center justify-center shadow-md"><ClipboardList size={15} className="text-white"/></div>
          <div><div className="text-white font-bold text-[13px]">AIVO</div><div className="text-[10px]" style={{ color:"rgba(235,200,255,0.5)" }}>Recepção Regulação</div></div>
        </div>
        <button onClick={onHub} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-colors">
          <LayoutDashboard size={12} className="text-fuchsia-400"/><span className="text-[11px] text-fuchsia-300 font-semibold">Hub de Perfis</span>
          <Repeat2 size={11} className="text-fuchsia-400 ml-auto"/>
        </button>
      </div>
      <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(217,70,239,0.08)", border:"1px solid rgba(217,70,239,0.2)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-500/40 flex items-center justify-center text-xs font-black text-fuchsia-300">JS</div>
          <div><p className="text-[12px] font-bold text-white">Júlia Santos</p><p className="text-[10px]" style={{ color:"rgba(235,200,255,0.5)" }}>Recepcionista · REMISSUS</p></div>
        </div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"/><span className="text-[10px] text-fuchsia-400">Regulação · 02/07/2025</span></div>
      </div>
      <nav className="flex-1 px-2 pb-2">
        {navItems.map(item=>{
          const isActive = active===item.id;
          return (
            <button key={item.id} onClick={()=>onNav(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-[12.5px] font-medium transition-all mb-0.5 ${isActive?"text-white":"hover:bg-white/5"}`} style={isActive?{background:"rgba(217,70,239,0.18)"}:{color:"rgba(235,200,255,0.6)"}}>
              <span style={{ color:isActive?"#e879f9":undefined, opacity:isActive?1:0.55 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-2 pb-4 shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-fuchsia-500/30 flex items-center justify-center shrink-0"><span className="text-[10px] text-white font-bold">JS</span></div>
          <div className="flex-1 min-w-0"><p className="text-[11px] text-white font-medium truncate">Júlia Santos</p><p className="text-[10px]" style={{ color:"rgba(235,200,255,0.4)" }}>Recep. Regulação</p></div>
          <LogOut size={11} style={{ color:"rgba(235,200,255,0.35)" }}/>
        </div>
      </div>
    </aside>
  );
}

// ─── UBS Dashboard Screen ─────────────────────────────────────────────────────────

function UBSDashboardScreen() {
  const [sharedPatients] = useState<RecepPatient[]>(_sharedAgenda.map(p=>({...p})));
  const presentes = sharedPatients.filter(p=>p.status==="presente"||p.status==="em_atendimento");
  const concluidos = sharedPatients.filter(p=>p.status==="concluido");
  const aguardando = sharedPatients.filter(p=>p.status==="aguardando");
  const ausentes = sharedPatients.filter(p=>p.status==="ausente");

  const priorityOrder: Record<string,number> = {critical:0,priority1:1,preferential:2,normal:3};

  const nextUp = [...aguardando].sort((a,b)=>(priorityOrder[a.priority||"normal"]||3)-(priorityOrder[b.priority||"normal"]||3)).slice(0,3);

  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Dashboard da Fila · UBS Central</h1>
        <p className="text-sm text-muted-foreground mt-0.5">02/07/2025 · Atualizado em tempo real</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {label:"Aguardando",   val:aguardando.length, color:"text-gray-600",    bg:"bg-card border-border"},
          {label:"Presente/Fila",val:presentes.length,  color:"text-emerald-600", bg:"bg-emerald-50 border-emerald-200"},
          {label:"Em Atendimento",val:sharedPatients.filter(p=>p.status==="em_atendimento").length, color:"text-cyan-600", bg:"bg-cyan-50 border-cyan-200"},
          {label:"Concluídos",   val:concluidos.length, color:"text-blue-600",    bg:"bg-blue-50 border-blue-200"},
        ].map(k=>(
          <div key={k.label} className={`rounded-xl p-4 border ${k.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Próximos a chamar */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><ChevronRight size={14} className="text-violet-500"/>Próximos na Fila</h2>
          {nextUp.length===0 ? <p className="text-sm text-muted-foreground">Nenhum aguardando</p> : (
            <div className="space-y-3">
              {nextUp.map((p,i)=>(
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-black text-violet-700 shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.procedure} · {p.time}</p>
                  </div>
                  <PriorityBadge priority={p.priority}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fila completa resumo */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-bold text-foreground mb-4">Resumo do Dia</h2>
          <div className="space-y-2">
            {sharedPatients.map(p=>{
              const colors: Record<ConsultaStatus,string> = {
                aguardando:"bg-gray-300", presente:"bg-emerald-500", em_atendimento:"bg-cyan-500", concluido:"bg-blue-500", ausente:"bg-red-400",
              };
              return (
                <div key={p.id} className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{p.time}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${colors[p.status]}`}/>
                  <span className="text-xs text-foreground truncate">{p.name}</span>
                  <PriorityBadge priority={p.priority}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── UBS Cadastro Screen (CNS-first) ─────────────────────────────────────────────

function UBSCadastroScreen() {
  const [cns, setCns] = useState("");
  const [found, setFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"dados"|"endereco"|"lgpd">("dados");

  const handleBuscarCNS = () => { if(cns.trim().length>=10) setFound(true); };

  const tabs: {id:typeof tab; label:string}[] = [
    {id:"dados",    label:"1 · Dados Pessoais"},
    {id:"endereco", label:"2 · Endereço"},
    {id:"lgpd",     label:"3 · Consentimento LGPD"},
  ];

  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Cadastro de Paciente</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Identifique o paciente pelo Cartão SUS (CNS) para pré-preencher os dados</p>
      </div>

      {saved&&(
        <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0"/>
          <div><p className="text-sm font-bold text-emerald-800">Cadastro salvo com sucesso!</p><p className="text-xs text-emerald-600">Paciente registrado e disponível para agendamento.</p></div>
          <button onClick={()=>setSaved(false)} className="ml-auto"><X size={14} className="text-emerald-500"/></button>
        </div>
      )}

      {/* CNS lookup — primary entry point */}
      <div className="bg-card rounded-2xl border-2 border-violet-500/30 p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><QrCode size={18} className="text-violet-600"/></div>
          <div>
            <p className="font-bold text-foreground">Cartão SUS (CNS)</p>
            <p className="text-xs text-muted-foreground">Informe o número CNS para puxar os dados automaticamente do sistema</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input value={cns} onChange={e=>setCns(e.target.value.replace(/\D/g,""))} className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background text-lg font-mono tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-500 transition-all" placeholder="706 0000 0000 0000" maxLength={18}/>
          <button onClick={handleBuscarCNS} className="px-5 py-3 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-600 transition-colors flex items-center gap-2"><Search size={15}/>Buscar</button>
        </div>
        {found&&(
          <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0"/>
            <p className="text-sm text-emerald-800"><strong>Dados encontrados no RNDS</strong> — campos preenchidos automaticamente. Revise e confirme.</p>
          </div>
        )}
      </div>

      {/* Form tabs */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 px-4 py-3.5 text-xs font-semibold transition-colors border-b-2 ${tab===t.id?"border-violet-500 text-violet-600 bg-violet-50":"border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>{t.label}</button>
          ))}
        </div>
        <div className="p-6">
          {tab==="dados"&&(
            <div className="grid grid-cols-2 gap-5">
              {[
                {label:"Nome Completo",     placeholder:found?"Rosangela Ferreira Lima":"Conforme documento", span:true},
                {label:"Nome Social",       placeholder:"Se houver"},
                {label:"CPF",              placeholder:found?"091.XXX.XXX-22":"000.000.000-00"},
                {label:"Data de Nascimento",placeholder:found?"30/01/1979":"DD/MM/AAAA"},
                {label:"Sexo",             placeholder:"Selecionar"},
                {label:"Nome da Mãe",      placeholder:found?"Zelinda Ferreira Lima":"", span:true},
                {label:"Telefone 1",       placeholder:found?"(67) 98877-3341":"(67) 99999-9999"},
                {label:"Telefone 2",       placeholder:"Opcional"},
                {label:"Município",        placeholder:found?"Dourados":"Selecionar"},
                {label:"Prioridade",       placeholder:"Normal"},
              ].map(f=>(
                <div key={f.label} className={f.span?"col-span-2":""}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input defaultValue={found&&f.placeholder!=="Selecionar"&&f.placeholder!=="Se houver"&&f.placeholder!=="Opcional"&&f.placeholder!=="Normal"?f.placeholder:""} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all" placeholder={f.placeholder}/>
                </div>
              ))}
            </div>
          )}
          {tab==="endereco"&&(
            <div className="grid grid-cols-2 gap-5">
              {["CEP","Município","Logradouro","Número","Complemento","Bairro","UF"].map((f,i)=>(
                <div key={f} className={i===2?"col-span-2":""}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{f}</label>
                  <input className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all" placeholder=""/>
                </div>
              ))}
            </div>
          )}
          {tab==="lgpd"&&(
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">Autorização LGPD — Lei nº 13.709/2018</p>
                <p className="text-xs text-blue-800 leading-relaxed">Seus dados serão utilizados exclusivamente para atendimento e gestão de saúde pública. Você pode acessar, corrigir ou solicitar exclusão a qualquer momento.</p>
              </div>
              {["Autorizo uso dos meus dados para atendimento na rede SUS.","Autorizo compartilhamento entre unidades REMISSUS.","Concordo com notificações via WhatsApp para confirmação de consultas."].map((txt,i)=>(
                <label key={i} className="flex items-start gap-3 cursor-pointer"><input type="checkbox" className="mt-0.5 accent-violet-500 w-4 h-4 shrink-0"/><span className="text-sm text-foreground">{txt}</span></label>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
          <button onClick={()=>setSaved(true)} className="px-5 py-2 rounded-lg bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 flex items-center gap-2"><Check size={14}/>Salvar Cadastro</button>
        </div>
      </div>
    </div>
  );
}

// ─── Recep Reg Dashboard (all queues) ─────────────────────────────────────────────

function RegDashboardScreen({ onNav }: { onNav:(s:Screen)=>void }) {
  const filas = [
    { specialty:"Clínica Geral",     total:24, presentes:8,  atendidos:6,  accent:"#8b5cf6" },
    { specialty:"Ginecologia",       total:12, presentes:5,  atendidos:4,  accent:"#ec4899" },
    { specialty:"Pediatria",         total:18, presentes:10, atendidos:7,  accent:"#f59e0b" },
    { specialty:"Ortopedia",         total:9,  presentes:2,  atendidos:2,  accent:"#3b82f6" },
    { specialty:"Mamografia",        total:8,  presentes:4,  atendidos:4,  accent:"#f43f5e" },
    { specialty:"Buco Maxilofacial", total:6,  presentes:1,  atendidos:0,  accent:"#10b981" },
  ];
  return (
    <div className="flex-1 overflow-auto bg-background p-7">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard de Filas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Todas as especialidades · 02/07/2025</p>
        </div>
        <button onClick={()=>onNav("reg-cadastro")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fuchsia-500 text-white text-sm font-medium hover:bg-fuchsia-600 transition-colors"><UserPlus size={14}/>Novo Paciente</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{label:"Total agendado",val:"77",color:"text-foreground",bg:"bg-card border-border"},{label:"Presentes",val:"30",color:"text-fuchsia-600",bg:"bg-fuchsia-50 border-fuchsia-200"},{label:"Em atendimento",val:"19",color:"text-blue-600",bg:"bg-blue-50 border-blue-200"},{label:"Ausências",val:"4",color:"text-red-500",bg:"bg-red-50 border-red-200"}].map(k=>(
          <div key={k.label} className={`rounded-xl p-4 border ${k.bg}`}><p className="text-xs text-muted-foreground mb-1">{k.label}</p><p className={`text-2xl font-black ${k.color}`}>{k.val}</p></div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-sm font-bold text-foreground mb-4">Filas por Especialidade</h2>
        <div className="space-y-3">
          {filas.map(f=>{
            const pct = Math.round((f.atendidos/f.total)*100);
            const presencePct = Math.round((f.presentes/f.total)*100);
            return (
              <div key={f.specialty} className="flex items-center gap-3">
                <div className="w-36 shrink-0"><p className="text-xs font-medium text-foreground truncate">{f.specialty}</p><p className="text-[10px] text-muted-foreground">{f.atendidos}/{f.total} atendidos</p></div>
                <div className="flex-1 relative h-5 bg-muted rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full rounded-full opacity-25" style={{ width:`${presencePct}%`, background:f.accent }}/>
                  <div className="absolute left-0 top-0 h-full rounded-full" style={{ width:`${pct}%`, background:f.accent }}/>
                </div>
                <div className="w-10 shrink-0 text-right text-[11px] font-bold" style={{ color:f.accent }}>{pct}%</div>
                <span className="text-[10px] text-muted-foreground shrink-0">{f.presentes} pres.</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Recep Reg Agenda (all appointments) ─────────────────────────────────────────

function RegAgendaScreen() {
  const [patients, setPatients] = useState<RecepPatient[]>(_sharedAgenda.map(p=>({...p})));
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all"|ConsultaStatus>("all");
  const [lastCheckin, setLastCheckin] = useState<RecepPatient|null>(null);

  const checkedIn = patients.filter(p=>["presente","em_atendimento","concluido"].includes(p.status));
  const confirmCheckin = (p: RecepPatient) => {
    const time = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    const pos = checkedIn.length + 1;
    setPatients(prev=>prev.map(x=>x.id===p.id?{...x,status:"presente" as ConsultaStatus,checkinTime:time,queuePosition:pos}:x));
    setLastCheckin({...p,status:"presente",checkinTime:time,queuePosition:pos});
  };

  const filtered = patients.filter(p=>{
    const matchStatus = filterStatus==="all" || p.status===filterStatus;
    const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusTabs: {key:typeof filterStatus; label:string; count:number; dot:string}[] = [
    {key:"all",label:"Todos",count:patients.length,dot:"bg-gray-400"},
    {key:"aguardando",label:"Aguardando",count:patients.filter(p=>p.status==="aguardando").length,dot:"bg-gray-400"},
    {key:"presente",label:"Presente",count:patients.filter(p=>p.status==="presente").length,dot:"bg-emerald-500"},
    {key:"concluido",label:"Concluído",count:patients.filter(p=>p.status==="concluido").length,dot:"bg-blue-500"},
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      {lastCheckin&&(
        <div className="shrink-0 px-7 pt-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0"/>
            <p className="text-sm font-bold text-emerald-800">✓ Check-in — {lastCheckin.name} · Posição #{lastCheckin.queuePosition}</p>
            <button onClick={()=>setLastCheckin(null)} className="ml-auto"><X size={13} className="text-emerald-500"/></button>
          </div>
        </div>
      )}
      <div className="shrink-0 px-7 pt-5 pb-4 flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Agendamentos do Dia</h1>
          <p className="text-sm text-muted-foreground">02/07/2025 · Todos os pacientes</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
          <Search size={13} className="text-muted-foreground shrink-0"/>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} className="text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 w-40" placeholder="Buscar..."/>
        </div>
      </div>
      <div className="shrink-0 px-7 flex gap-2 mb-4">
        {statusTabs.map(t=>(
          <button key={t.key} onClick={()=>setFilterStatus(t.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus===t.key?"bg-fuchsia-500 text-white":"bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`}/>{t.label} ({t.count})
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-7 pb-7">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">{["Horário","Paciente","Procedimento","Prioridade","Status","Ação"].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(p=>{
                const scfg = CONSULTA_STATUS_CFG[p.status];
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sm">{p.time}</td>
                    <td className="px-4 py-3"><p className="font-semibold text-foreground">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.phone}</p></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.procedure}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={p.priority}/></td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${scfg.bg} ${scfg.text}`}><span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`}/>{scfg.label}</span></td>
                    <td className="px-4 py-3">
                      {p.status==="aguardando"&&<button onClick={()=>confirmCheckin(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-500 text-white text-xs font-bold hover:bg-fuchsia-600 transition-colors"><Check size={11}/>Paciente Chegou</button>}
                      {p.status==="presente"&&<span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={11}/>Presente</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Gestão de Guias — redesigned ────────────────────────────────────────────────

function ReguladorGuiasScreenV2() {
  const [guias, setGuias] = useState<GuiaReg[]>(GUIAS_DATA);
  const [filterStatus, setFilterStatus] = useState<GuiaReg["status"]|"all">("all");
  const [filterUrgencia, setFilterUrgencia] = useState<GuiaReg["urgencia"]|"all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GuiaReg|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);

  const aprovar  = (id:string) => { setGuias(p=>p.map(g=>g.id===id?{...g,status:"aprovado"}:g)); setSuccessMsg("Guia aprovada com sucesso."); setSelected(null); setTimeout(()=>setSuccessMsg(null),3000); };
  const agendar  = (id:string) => { setGuias(p=>p.map(g=>g.id===id?{...g,status:"agendado"}:g)); setSuccessMsg("Guia agendada."); setSelected(null); setTimeout(()=>setSuccessMsg(null),3000); };
  const cancelar = (id:string) => { setGuias(p=>p.map(g=>g.id===id?{...g,status:"cancelado"}:g)); setSelected(null); };
  const reativar = (id:string) => setGuias(p=>p.map(g=>g.id===id?{...g,status:"pendente"}:g));

  const statusCfg: Record<GuiaReg["status"],{label:string;bg:string;text:string;dot:string;border:string}> = {
    pendente:  {label:"Pendente",  bg:"bg-amber-50",   text:"text-amber-800",  dot:"bg-amber-500",  border:"border-amber-200"},
    aprovado:  {label:"Aprovado",  bg:"bg-blue-50",    text:"text-blue-800",   dot:"bg-blue-500",   border:"border-blue-200"},
    agendado:  {label:"Agendado",  bg:"bg-emerald-50", text:"text-emerald-800",dot:"bg-emerald-500",border:"border-emerald-200"},
    cancelado: {label:"Cancelado", bg:"bg-red-50",     text:"text-red-800",    dot:"bg-red-500",    border:"border-red-200"},
  };

  const urgenciaCfg: Record<GuiaReg["urgencia"],{label:string;color:string;icon:React.ReactNode}> = {
    normal:  {label:"Normal",   color:"text-gray-500",   icon:<span/>},
    urgente: {label:"Urgente",  color:"text-orange-600", icon:<AlertTriangle size={11}/>},
    critico: {label:"Crítico",  color:"text-red-600",    icon:<Flame size={11}/>},
  };

  const statusTabs: {key:GuiaReg["status"]|"all"; label:string}[] = [
    {key:"all",       label:`Todas (${guias.length})`},
    {key:"pendente",  label:`Pendente (${guias.filter(g=>g.status==="pendente").length})`},
    {key:"aprovado",  label:`Aprovado (${guias.filter(g=>g.status==="aprovado").length})`},
    {key:"agendado",  label:`Agendado (${guias.filter(g=>g.status==="agendado").length})`},
    {key:"cancelado", label:`Cancelado (${guias.filter(g=>g.status==="cancelado").length})`},
  ];

  const filtered = guias.filter(g=>{
    const matchStatus = filterStatus==="all"||g.status===filterStatus;
    const matchUrg = filterUrgencia==="all"||g.urgencia===filterUrgencia;
    const matchSearch = !search||g.paciente.toLowerCase().includes(search.toLowerCase())||g.id.includes(search);
    return matchStatus&&matchUrg&&matchSearch;
  });

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 px-7 pt-7 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestão de Guias</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{guias.length} guias no sistema · REMISSUS</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"><Plus size={14}/>Nova Guia</button>
        </div>

        {successMsg&&(
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600"/><span className="text-sm font-semibold text-emerald-800">{successMsg}</span>
          </div>
        )}

        {/* Status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {statusTabs.map(t=>{
            const cfg = t.key!=="all" ? statusCfg[t.key] : null;
            return (
              <button key={t.key} onClick={()=>setFilterStatus(t.key)} className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${filterStatus===t.key?cfg?"border-transparent "+cfg.bg+" "+cfg.text:"bg-amber-500 text-white border-transparent":"border-border text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                {cfg&&<span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>}
                {t.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
            <Search size={12} className="text-muted-foreground shrink-0"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} className="text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 w-32" placeholder="Paciente ou ID..."/>
          </div>
          <select value={filterUrgencia} onChange={e=>setFilterUrgencia(e.target.value as typeof filterUrgencia)} className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none">
            <option value="all">Urgência: Todas</option>
            <option value="critico">Crítico</option>
            <option value="urgente">Urgente</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Table */}
        <div className={`flex-1 overflow-auto px-7 pb-7 transition-all ${selected?"w-1/2":""}`}>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["ID","Paciente","Município","Especialidade","Unidade","Urgência","Status","Ações"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g=>{
                  const cfg = statusCfg[g.status];
                  const urg = urgenciaCfg[g.urgencia];
                  const isSelected = selected?.id===g.id;
                  return (
                    <tr key={g.id} onClick={()=>setSelected(isSelected?null:g)} className={`border-b border-border/50 cursor-pointer transition-colors ${isSelected?"bg-amber-50/60 ring-1 ring-amber-300":g.urgencia==="critico"?"bg-red-50/20 hover:bg-red-50/40":"hover:bg-muted/20"}`}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground whitespace-nowrap">{g.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground whitespace-nowrap">{g.paciente}</p>
                        <p className="text-[10px] text-muted-foreground">{g.cpf}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{g.municipio}</td>
                      <td className="px-4 py-3 text-foreground text-xs whitespace-nowrap">{g.especialidade}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap max-w-[120px] truncate">{g.unidade}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${urg.color}`}>{urg.icon}{urg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" onClick={e=>e.stopPropagation()}>
                          {g.status==="pendente"  &&<button onClick={()=>aprovar(g.id)}  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors">Aprovar</button>}
                          {g.status==="aprovado"  &&<button onClick={()=>agendar(g.id)}  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Agendar</button>}
                          {g.status==="cancelado" &&<button onClick={()=>reativar(g.id)} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">Reativar</button>}
                          {g.status!=="cancelado" &&<button onClick={()=>cancelar(g.id)} className="px-2 py-1 rounded-md text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors">✕</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0&&(
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma guia encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected&&(
          <div className="w-80 shrink-0 border-l border-border overflow-auto bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-foreground">Detalhes da Guia</p>
              <button onClick={()=>setSelected(null)}><X size={14} className="text-muted-foreground hover:text-foreground"/></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                {label:"ID",           val:selected.id},
                {label:"Paciente",     val:selected.paciente},
                {label:"CPF",          val:selected.cpf},
                {label:"Município",    val:selected.municipio},
                {label:"Especialidade",val:selected.especialidade},
                {label:"Unidade",      val:selected.unidade},
                {label:"Solicitado em",val:selected.solicitadoEm},
              ].map(r=>(
                <div key={r.label} className="flex flex-col gap-0.5 py-2 border-b border-border/50 last:border-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-foreground text-xs">{r.val}</span>
                </div>
              ))}
              {selected.obs&&(
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-1">Observação</p>
                  <p className="text-xs text-amber-800">{selected.obs}</p>
                </div>
              )}
            </div>
            <div className="mt-5 space-y-2">
              {selected.status==="pendente"  &&<button onClick={()=>aprovar(selected.id)}  className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors">Aprovar Guia</button>}
              {selected.status==="aprovado"  &&<button onClick={()=>agendar(selected.id)}  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors">Confirmar Agendamento</button>}
              {selected.status==="cancelado" &&<button onClick={()=>reativar(selected.id)} className="w-full py-2.5 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-colors">Reativar Guia</button>}
              {selected.status!=="cancelado" &&<button onClick={()=>cancelar(selected.id)} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors">Cancelar Guia</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────────

export default function App() {
  const [showHub, setShowHub]             = useState(true);
  const [profile, setProfile]             = useState<AppProfile>("gestor");
  const [screen, setScreen]               = useState<Screen>("dashboard");
  const [detailPatient, setDetailPatient] = useState<Patient|null>(null);
  const [detailClinic, setDetailClinic]   = useState<Clinic|null>(null);
  const [detailSpecialty, setDetailSpec]  = useState<SpecialtyGroup|null>(null);
  const [activeConsulta, setActiveConsulta] = useState<ConsultaPatient|null>(null);
  const [finalizationNext, setFinalizationNext] = useState<ConsultaPatient|null>(null);
  const [showFinishBanner, setShowFinishBanner] = useState(false);

  const handleNav = (s:Screen) => {
    setScreen(s);
    if(s!=="patient-detail")   setDetailPatient(null);
    if(s!=="clinic-detail")    setDetailClinic(null);
    if(s!=="specialty-detail") setDetailSpec(null);
  };
  const handleDetail       = (p:Patient)       => { setDetailPatient(p); setScreen("patient-detail"); };
  const handleClinicDet    = (c:Clinic)        => { setDetailClinic(c);  setScreen("clinic-detail"); };
  const handleSpecialtyDet = (g:SpecialtyGroup)=> { setDetailSpec(g);   setScreen("specialty-detail"); };

  const defaultScreenForProfile = (p:AppProfile): Screen => {
    if(p==="gestor")     return "dashboard";
    if(p==="medico")     return "doctor-agenda";
    if(p==="recep-ubs")  return "ubs-dashboard";
    if(p==="recep-reg")  return "reg-dashboard";
    if(p==="regulador")  return "regulador-vagas";
    return "tfd-viagens";
  };

  const selectProfile = (p:AppProfile) => {
    setProfile(p);
    setScreen(defaultScreenForProfile(p));
    setShowHub(false);
  };

  const handleStartConsulta = (p: ConsultaPatient) => {
    setActiveConsulta(p);
    setScreen("doctor-record");
  };

  const handleFinalize = (next: ConsultaPatient|null) => {
    setFinalizationNext(next);
    setShowFinishBanner(true);
    setScreen("doctor-agenda");
    setActiveConsulta(null);
    setTimeout(()=>setShowFinishBanner(false), 5000);
  };

  if(showHub) return <HubScreen onSelect={selectProfile}/>;

  const goHub = () => setShowHub(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
      {profile==="gestor"    ? <GestorSidebar    active={screen} onNav={handleNav} onSwitchProfile={goHub}/>
      : profile==="medico"   ? <MedicoSidebar    active={screen} onNav={handleNav} onSwitchProfile={goHub}/>
      : profile==="recep-ubs"? <RecepUBSSidebar  active={screen} onNav={handleNav} onHub={goHub}/>
      : profile==="recep-reg"? <RecepRegSidebar  active={screen} onNav={handleNav} onHub={goHub}/>
      : profile==="regulador"? <ReguladorSidebar active={screen} onNav={handleNav} onSwitchProfile={goHub}/>
      : <TFDSidebar active={screen} onNav={handleNav} onSwitchProfile={goHub}/>
      }

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {showFinishBanner&&(
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-semibold">
            <CheckCircle2 size={18}/>
            Atendimento finalizado com sucesso!
            {finalizationNext&&<span className="text-emerald-200">Próximo: {finalizationNext.name}</span>}
            <button onClick={()=>setShowFinishBanner(false)}><X size={14} className="text-white/70 hover:text-white"/></button>
          </div>
        )}

        {profile==="recep-ubs" ? (
          <>
            {screen==="ubs-dashboard" && <UBSDashboardScreen/>}
            {screen==="ubs-agenda"    && <RecepAgendaScreen/>}
            {screen==="ubs-cadastro"  && <UBSCadastroScreen/>}
          </>
        ) : profile==="recep-reg" ? (
          <>
            {screen==="reg-dashboard"   && <RegDashboardScreen onNav={handleNav}/>}
            {screen==="reg-agenda"      && <RegAgendaScreen/>}
            {screen==="reg-cadastro"    && <RecepCadastroScreen/>}
            {screen==="reg-agendamento" && <RecepAgendamentoScreen/>}
            {screen==="reg-whatsapp"    && <RecepWhatsAppScreen/>}
          </>
        ) : profile==="medico" ? (
          <>
            {screen==="doctor-agenda" && <DoctorAgendaScreen onStartConsulta={handleStartConsulta}/>}
            {screen==="doctor-record" && activeConsulta && <ProntuarioScreen patient={activeConsulta} onBack={()=>setScreen("doctor-agenda")} onFinalize={handleFinalize}/>}
          </>
        ) : profile==="regulador" ? (
          <>
            {screen==="regulador-vagas" && <ReguladorVagasScreen/>}
            {screen==="regulador-guias" && <ReguladorGuiasScreenV2/>}
          </>
        ) : profile==="tfd" ? (
          <>
            {screen==="tfd-viagens"      && <TFDViagensScreen/>}
            {screen==="tfd-frota"        && <TFDFrotaScreen/>}
            {screen==="tfd-roteirizacao" && <TFDRoteirizacaoScreen/>}
          </>
        ) : (
          <>
            {screen==="dashboard"        && <DashboardScreen/>}
            {screen==="upload"           && <UploadScreen/>}
            {screen==="queue"            && <QueueScreen onSpecialtyDetail={handleSpecialtyDet}/>}
            {screen==="specialty-detail" && detailSpecialty && <SpecialtyDetailScreen grp={detailSpecialty} allPatients={BASE_PATIENTS} onBack={()=>setScreen("queue")}/>}
            {screen==="patients"         && <PatientsScreen onDetail={handleDetail}/>}
            {screen==="patient-detail"   && detailPatient && <PatientDetailScreen patient={detailPatient} onBack={()=>setScreen("patients")}/>}
            {screen==="clinics"          && <ClinicsScreen onClinicDetail={handleClinicDet}/>}
            {screen==="clinic-detail"    && detailClinic  && <ClinicDetailScreen clinic={detailClinic} onBack={()=>setScreen("clinics")}/>}

            {screen==="reports"        && <ReportsScreen/>}
            {screen==="audit"          && <AuditScreen/>}
            {screen==="chatbot"        && <ChatbotScreen/>}
            {screen==="whatsapp"       && <WhatsAppScreen/>}
          </>
        )}
      </main>
    </div>
  );
}
