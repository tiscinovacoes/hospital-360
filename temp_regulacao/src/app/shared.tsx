import { UserCheck, AlertCircle, Flame } from "lucide-react";

export type PatientStatus =
  | "waiting" | "sent" | "confirmed" | "refused"
  | "failed" | "expired" | "cancelled";

export type Priority = "normal" | "preferential" | "priority1" | "critical";
export type CheckinStatus = "pending" | "present" | "absent";

export interface Patient {
  id: string; time: string; name: string; phone: string; phone2?: string; phone3?: string;
  procedure: string; unit: string; status: PatientStatus;
  isNextInQueue?: boolean; cpf?: string; cns?: string;
  birthDate?: string; mother?: string; municipality?: string;
  socialName?: string; checkinCode?: string;
  priority?: Priority;
  cancelledAt?: number;
  surveyDispatched?: boolean;
}

export interface Clinic {
  id: string; name: string; cnpj: string; address: string;
  phone: string; specialties: string[]; city: string;
}

export interface AuditLog {
  id: string; datetime: string; user: string; role: string;
  action: string; detail: string; ip: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

export const BASE_PATIENTS: Patient[] = [
  { id:"1",  time:"07:00", name:"Cleonice Nunes Alves",    phone:"(67) 99331-7819",                     procedure:"Mamografia",  unit:"UBS Central",       status:"confirmed", cpf:"032.XXX.XXX-41", cns:"706 0XXX XXXX 0041", birthDate:"14/03/1971", mother:"Maria de Lourdes Nunes",  municipality:"Campo Grande",  checkinCode:"4821", priority:"normal" },
  { id:"2",  time:"07:01", name:"Vania Facunda Medina",    phone:"(67) 99149-0507", phone2:"(67) 3321-0900", procedure:"Mamografia",  unit:"UBS Central",       status:"sent",      cpf:"047.XXX.XXX-88", cns:"706 0XXX XXXX 0088", birthDate:"22/07/1968", mother:"Facunda Souza Medina",    municipality:"Campo Grande",  checkinCode:"3347", priority:"normal" },
  { id:"3",  time:"07:40", name:"Emerson Jose de Jesus",   phone:"(67) 99272-4852",                     procedure:"Buco Maxilo", unit:"Policlínica Norte",  status:"cancelled", cpf:"018.XXX.XXX-77", cns:"706 0XXX XXXX 0077", birthDate:"05/11/1985", mother:"Aparecida Jose de Jesus", municipality:"Dourados",      checkinCode:"9903", priority:"normal",     cancelledAt: Date.now() - 180000 },
  { id:"4",  time:"07:40", name:"Rosangela Ferreira Lima", phone:"(67) 98877-3341", phone2:"(67) 3322-7711", procedure:"Buco Maxilo", unit:"Policlínica Norte",  status:"waiting",   isNextInQueue:true,   cpf:"091.XXX.XXX-22", cns:"706 0XXX XXXX 0022", birthDate:"30/01/1979", mother:"Zelinda Ferreira Lima",   municipality:"Dourados",      checkinCode:"1156", priority:"preferential" },
  { id:"5",  time:"08:15", name:"José Carlos Mendonça",    phone:"(67) 99423-6610",                     procedure:"Ortopedia",   unit:"HRAS",               status:"failed",    cpf:"055.XXX.XXX-19", cns:"706 0XXX XXXX 0019", birthDate:"19/06/1962", mother:"Neuza Mendonça",          municipality:"Corumbá",       checkinCode:"7784", priority:"priority1" },
  { id:"6",  time:"08:30", name:"Maria das Dores Souza",   phone:"(67) 98561-2298",                     procedure:"Mamografia",  unit:"UBS Central",       status:"confirmed", cpf:"063.XXX.XXX-55", cns:"706 0XXX XXXX 0055", birthDate:"08/09/1966", mother:"Rita de Cássia Souza",    municipality:"Campo Grande",  checkinCode:"2293", priority:"normal" },
  { id:"7",  time:"09:00", name:"Antônio Barbosa Neto",    phone:"(67) 99634-5507",                     procedure:"Geral",        unit:"UBS Sul",            status:"sent",      cpf:"074.XXX.XXX-31", cns:"706 0XXX XXXX 0031", birthDate:"27/02/1955", mother:"Gertrudes Barbosa",       municipality:"Três Lagoas",   checkinCode:"6612", priority:"normal" },
  { id:"8",  time:"09:20", name:"Francisca Oliveira Paz",  phone:"(67) 98741-0033", phone2:"(67) 3261-5533", procedure:"Geral",        unit:"UBS Sul",            status:"expired",   cpf:"082.XXX.XXX-64", cns:"706 0XXX XXXX 0064", birthDate:"14/12/1975", mother:"Benedita Oliveira",       municipality:"Ponta Porã",    checkinCode:"5530", priority:"normal" },
  { id:"9",  time:"10:00", name:"Luiz Henrique Ramos",     phone:"(67) 99102-8874",                     procedure:"Ortopedia",   unit:"HRAS",               status:"refused",   cpf:"039.XXX.XXX-08", cns:"706 0XXX XXXX 0008", birthDate:"03/04/1958", mother:"Helena Ramos",            municipality:"Naviraí",       checkinCode:"8871", priority:"normal" },
  { id:"10", time:"10:00", name:"Sandra Regina Castro",    phone:"(67) 99887-4421", phone2:"(67) 98880-1122", procedure:"Ortopedia",   unit:"HRAS",               status:"waiting",   isNextInQueue:true,   cpf:"067.XXX.XXX-90", cns:"706 0XXX XXXX 0090", birthDate:"11/07/1972", mother:"Conceição Castro",        municipality:"Campo Grande",  checkinCode:"4408", priority:"critical" },
  { id:"11", time:"10:30", name:"Benedita Almeida Rocha",  phone:"(67) 99214-6631",                     procedure:"Mamografia",  unit:"UBS Leste",          status:"confirmed", cpf:"044.XXX.XXX-27", cns:"706 0XXX XXXX 0027", birthDate:"20/05/1964", mother:"Joana Almeida",           municipality:"Campo Grande",  checkinCode:"3319", priority:"normal" },
  { id:"12", time:"11:00", name:"Paulo Siqueira Torres",   phone:"(67) 98430-2211",                     procedure:"Buco Maxilo", unit:"Policlínica Norte",  status:"confirmed", cpf:"076.XXX.XXX-13", cns:"706 0XXX XXXX 0013", birthDate:"14/08/1980", mother:"Vera Torres",             municipality:"Sidrolândia",   checkinCode:"7723", priority:"preferential" },
];

export const CLINICS: Clinic[] = [
  { id:"1", name:"Clínica Diagnóstica Campo Grande",  cnpj:"12.345.678/0001-90", address:"Av. Afonso Pena, 1234 — Centro",            phone:"(67) 3321-4455", specialties:["Mamografia","Ultrassonografia","Raio-X"],   city:"Campo Grande" },
  { id:"2", name:"Instituto de Ortopedia do MS",      cnpj:"23.456.789/0001-01", address:"Rua Dom Aquino, 567 — Bairro Amambai",       phone:"(67) 3322-8877", specialties:["Ortopedia","Fisioterapia","Reumatologia"],  city:"Campo Grande" },
  { id:"3", name:"Clínica Bucomaxilofacial Norte",    cnpj:"34.567.890/0001-12", address:"Av. Euler de Azambuja, 890 — Vila Planalto", phone:"(67) 3323-1100", specialties:["Buco Maxilo Facial","Implantodontia"],      city:"Dourados"     },
  { id:"4", name:"Centro de Diagnóstico Três Lagoas", cnpj:"45.678.901/0001-23", address:"Rua XV de Novembro, 321 — Centro",           phone:"(67) 3261-5533", specialties:["Geral","Cardiologia","Neurologia"],         city:"Três Lagoas"  },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id:"1",  datetime:"02/07/2025 09:47:22", user:"Ana Paula Rodrigues", role:"Operador",    action:"Disparou Fila",       detail:"Disparou a Fila de Mamografia (8 pacientes)",                 ip:"192.168.1.45" },
  { id:"2",  datetime:"02/07/2025 09:31:05", user:"Ana Paula Rodrigues", role:"Operador",    action:"Alterou status",      detail:"Alterou status de Cleonice Nunes Alves → Confirmado",          ip:"192.168.1.45" },
  { id:"3",  datetime:"02/07/2025 09:14:58", user:"Ana Paula Rodrigues", role:"Operador",    action:"Upload PDF",          detail:"Importou agenda_mamografia_jul.pdf (24 pacientes)",             ip:"192.168.1.45" },
  { id:"4",  datetime:"02/07/2025 08:55:10", user:"Carlos Eduardo Lima", role:"Supervisor",  action:"Editou paciente",     detail:"Editou telefone de José Carlos Mendonça",                       ip:"10.0.0.12"    },
  { id:"5",  datetime:"02/07/2025 08:40:33", user:"Carlos Eduardo Lima", role:"Supervisor",  action:"Avançou fila",        detail:"Chamou próximo: Rosangela Ferreira Lima (Buco Maxilo)",        ip:"10.0.0.12"    },
  { id:"6",  datetime:"01/07/2025 17:22:01", user:"root@corems",         role:"Super Admin", action:"Editou template bot", detail:"Alterou template de mensagem de confirmação",                  ip:"172.16.0.1"   },
  { id:"7",  datetime:"01/07/2025 16:47:44", user:"Ana Paula Rodrigues", role:"Operador",    action:"Disparou Fila",       detail:"Disparou a Fila de Ortopedia (12 pacientes)",                  ip:"192.168.1.45" },
  { id:"8",  datetime:"01/07/2025 14:30:19", user:"Carlos Eduardo Lima", role:"Supervisor",  action:"Upload PDF",          detail:"Importou agenda_buco_maxilo.pdf (18 pacientes)",                ip:"10.0.0.12"    },
];

export const WEEK_DATA = [
  { day:"Seg", confirmados:38, recusados:6  },
  { day:"Ter", confirmados:52, recusados:4  },
  { day:"Qua", confirmados:45, recusados:9  },
  { day:"Qui", confirmados:61, recusados:5  },
  { day:"Sex", confirmados:47, recusados:8  },
  { day:"Sáb", confirmados:28, recusados:3  },
  { day:"Dom", confirmados:12, recusados:1  },
];

export const SPECIALTY_DATA = [
  { name:"Mamografia",  confirmed:49, refused:7  },
  { name:"Ortopedia",   confirmed:38, refused:11 },
  { name:"Buco Maxilo", confirmed:33, refused:5  },
  { name:"Geral",       confirmed:63, refused:9  },
];

export const ACTIVITY_FEED = [
  { time:"09:47", color:"bg-blue-500",    msg:"Fila Mamografia disparada — 8 mensagens enviadas" },
  { time:"09:31", color:"bg-emerald-500", msg:"Cleonice Nunes Alves confirmou presença (Mamografia 07:00)" },
  { time:"09:22", color:"bg-red-500",     msg:"Emerson Jose de Jesus cancelou — próximo acionado automaticamente" },
  { time:"08:55", color:"bg-amber-500",   msg:"Francisca Oliveira Paz: timeout atingido — status → Expirado · próximo chamado" },
  { time:"08:40", color:"bg-primary",     msg:"PDF importado: agenda_mamografia_jul.pdf — 24 pacientes" },
  { time:"08:12", color:"bg-emerald-500", msg:"Maria das Dores Souza confirmou presença (Mamografia 08:30)" },
];

// ─── New profile mock data ────────────────────────────────────────────────────────

// Regulador
export const STATUS_CFG: Record<PatientStatus, { label:string; bg:string; text:string; dot:string }> = {
  waiting:   { label:"Aguardando Disparo",   bg:"bg-gray-100",    text:"text-gray-600",    dot:"bg-gray-400"    },
  sent:      { label:"Enviado / Ag. Resp.",  bg:"bg-blue-50",     text:"text-blue-700",    dot:"bg-blue-500"    },
  confirmed: { label:"Confirmado",           bg:"bg-emerald-50",  text:"text-emerald-700", dot:"bg-emerald-500" },
  refused:   { label:"Recusou",             bg:"bg-orange-50",   text:"text-orange-700",  dot:"bg-orange-400"  },
  failed:    { label:"Falha no Envio",       bg:"bg-red-50",      text:"text-red-700",     dot:"bg-red-500"     },
  expired:   { label:"Expirado / Timeout",   bg:"bg-amber-50",    text:"text-amber-700",   dot:"bg-amber-500"   },
  cancelled: { label:"Cancelado",            bg:"bg-slate-100",   text:"text-slate-600",   dot:"bg-slate-400"   },
};

export const PRIORITY_CFG: Record<Priority, { label:string; bg:string; text:string; border:string } | null> = {
  normal:       null,
  preferential: { label:"Preferencial",  bg:"bg-blue-50",   text:"text-blue-700",   border:"border-blue-200" },
  priority1:    { label:"Prioridade 1",  bg:"bg-orange-50", text:"text-orange-700", border:"border-orange-300" },
  critical:     { label:"Crítico",       bg:"bg-red-50",    text:"text-red-700",    border:"border-red-300" },
};

export const CHECKIN_CFG: Record<CheckinStatus, { label:string; bg:string; text:string }> = {
  pending: { label:"Aguardando",      bg:"bg-gray-100",   text:"text-gray-600"    },
  present: { label:"Presente ✓",     bg:"bg-emerald-50", text:"text-emerald-700" },
  absent:  { label:"Não Compareceu", bg:"bg-red-50",     text:"text-red-700"     },
};

export function StatusTag({ status }: { status: PatientStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`}/>{c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: Priority }) {
  if (!priority || !PRIORITY_CFG[priority]) return null;
  const c = PRIORITY_CFG[priority]!;
  const icons: Record<string, React.ReactNode> = {
    preferential: <UserCheck size={9}/>,
    priority1:    <AlertCircle size={9}/>,
    critical:     <Flame size={9}/>,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {icons[priority]}{c.label}
    </span>
  );
}

export function WaIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

export function calcAge(dob: string) {
  const [d, m, y] = dob.split("/").map(Number);
  const today = new Date(2025, 6, 2);
  const birth = new Date(y, m - 1, d);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0)   { months--; days   += 30; }
  if (months < 0) { years--;  months += 12; }
  return `${years} anos, ${months} meses e ${days} dias`;
}

// ─── Profile Switcher ────────────────────────────────────────────────────────────

