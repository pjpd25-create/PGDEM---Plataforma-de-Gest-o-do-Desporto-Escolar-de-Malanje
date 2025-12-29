
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  authService, 
  User, 
  UserRole,
  MatchStatus,
  Game,
  RankingEntry,
  Athlete,
  School,
  AgeGroup,
  Infrastructure,
  Announcement,
  AuditLog,
  Notification,
  SYNC_EVENT,
  Municipality,
  Modality
} from './auth';

// --- DEFINIÇÕES DE NAVEGAÇÃO STITCH ---
type MainTab = 'DASHBOARD' | 'ADMIN' | 'SPORTS' | 'GAMES' | 'RANKING' | 'SUPERVISION' | 'REPORTS' | 'CONFIG';

// --- HOOKS ---
const useSync = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const handleSync = () => setTick(t => t + 1);
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);
  return tick;
};

// --- COMPONENTES ATÓMICOS ---
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={`material-symbols-outlined select-none ${className}`}>{name}</span>
);

const Badge: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${color}`}>
    {children}
  </span>
);

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${active ? 'bg-primary text-white shadow-lg translate-x-1' : 'text-gray-400 hover:bg-slate-50'}`}>
    <Icon name={icon} className="text-xl" />
    <span className="truncate">{label}</span>
  </button>
);

const TabBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase transition-all tracking-widest ${active ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}>
    {label}
  </button>
);

// --- COMPONENTES DE VISTA ---

const DashboardView: React.FC<{ user: User; snap: any }> = ({ user, snap }) => {
  const ranking = authService.calculateRanking('futebol').slice(0, 5);
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Atletas Ativos" value={snap.totalAthletes} icon="groups" color="text-secondary" />
        <MetricCard label="Escolas" value={snap.totalSchools} icon="business" color="text-primary" />
        <MetricCard label="Jogos Validados" value={snap.totalGames} icon="sports_handball" color="text-emerald-500" />
        <MetricCard label="Ações Pendentes" value={snap.pendingValidation} icon="pending" color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
            <Icon name="military_tech" className="text-secondary" /> Ranking Escolar (Futebol)
          </h3>
          <div className="space-y-3">
            {ranking.map((r, i) => (
              <div key={r.schoolName} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                  <span className={`size-8 rounded-full flex items-center justify-center font-black text-xs ${i < 3 ? 'bg-secondary text-white' : 'bg-slate-200 text-gray-400'}`}>{i + 1}</span>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{r.schoolName}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-400">{r.municipalityId}</p>
                  </div>
                </div>
                <p className="font-black text-primary text-xl">{r.points} <span className="text-[10px] text-gray-300">PTS</span></p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark p-10 rounded-[40px] text-white shadow-xl">
            <h4 className="font-black text-lg mb-4 flex items-center gap-2"><Icon name="campaign" /> Avisos</h4>
            <div className="space-y-4">
              <p className="text-[11px] font-bold opacity-80 uppercase leading-relaxed">Novo regulamento de basquetebol homologado pela Direção Provincial.</p>
              <button className="text-[10px] font-black uppercase underline decoration-secondary decoration-2 underline-offset-4">Ler comunicado</button>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h4 className="font-black text-gray-800 text-sm mb-6 uppercase tracking-widest">Atalhos</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-secondary hover:text-white transition-all group">
                <Icon name="person_add" />
                <span className="text-[9px] font-black uppercase">Atleta</span>
              </button>
              <button className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2 hover:bg-primary hover:text-white transition-all group">
                <Icon name="description" />
                <span className="text-[9px] font-black uppercase">Relato</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminManager: React.FC<{ user: User }> = ({ user }) => {
  const [subTab, setSubTab] = useState<'MUNIS' | 'SCHOOLS' | 'USERS' | 'COORDS'>('USERS');
  const [modal, setModal] = useState<any>(null);
  const munis = authService.getMunicipalities();
  const schools = authService.getSchools();
  const users = authService.getUsers();

  const canEdit = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_REGIONAL';

  return (
    <div className="space-y-8">
      <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl w-fit">
        <TabBtn active={subTab === 'USERS'} onClick={() => setSubTab('USERS')} label="Utilizadores & Perfis" />
        <TabBtn active={subTab === 'SCHOOLS'} onClick={() => setSubTab('SCHOOLS')} label="Escolas" />
        <TabBtn active={subTab === 'MUNIS'} onClick={() => setSubTab('MUNIS')} label="Municípios" />
        <TabBtn active={subTab === 'COORDS'} onClick={() => setSubTab('COORDS')} label="Coordenadores" />
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-primary tracking-tighter uppercase">Gestão Administrativa</h3>
          {canEdit && <button onClick={() => setModal({})} className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">Criar Novo</button>}
        </div>

        {subTab === 'USERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-gray-400">
                <tr>
                  <th className="p-6">Operador</th>
                  <th className="p-6">Perfil</th>
                  <th className="p-6">Território</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="text-xs font-bold text-gray-600 hover:bg-slate-50 transition-all">
                    <td className="p-6">
                      <p className="font-black text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-6"><Badge color="bg-primary/10 text-primary">{u.role}</Badge></td>
                    <td className="p-6 uppercase text-gray-400">{u.municipalityId || 'Sede Provincial'}</td>
                    <td className="p-6"><Badge color="bg-emerald-50 text-emerald-600">ATIVO</Badge></td>
                    <td className="p-6"><button className="text-secondary hover:underline">Gerir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(subTab === 'SCHOOLS' || subTab === 'MUNIS' || subTab === 'COORDS') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {subTab === 'SCHOOLS' ? schools.map(s => (
               <div key={s.id} className="p-8 bg-slate-50 rounded-[40px] border border-gray-50 group hover:bg-white hover:shadow-xl transition-all">
                 <Icon name="school" className="text-4xl text-primary mb-4" />
                 <h4 className="font-black text-gray-800 uppercase text-sm mb-1">{s.name}</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase">{s.municipalityId}</p>
               </div>
             )) : munis.map(m => (
               <div key={m.id} className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm flex flex-col justify-between group hover:border-secondary transition-all">
                 <h4 className="font-black text-xl text-primary mb-4">{m.name}</h4>
                 <div className="space-y-3">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Coord: {m.coordinatorName}</p>
                   <Badge color="bg-emerald-50 text-emerald-600">Homologado</Badge>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SportsManager: React.FC<{ user: User }> = ({ user }) => {
  const [subTab, setSubTab] = useState<'MODS' | 'GROUPS' | 'RULES' | 'COMPS' | 'CALENDAR'>('MODS');
  const modalities = authService.getModalities();
  const ageGroups = authService.getAgeGroups();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 p-2 bg-slate-100 rounded-2xl w-fit">
        <TabBtn active={subTab === 'MODS'} onClick={() => setSubTab('MODS')} label="Modalidades" />
        <TabBtn active={subTab === 'GROUPS'} onClick={() => setSubTab('GROUPS')} label="Escalões" />
        <TabBtn active={subTab === 'RULES'} onClick={() => setSubTab('RULES')} label="Regulamentos" />
        <TabBtn active={subTab === 'COMPS'} onClick={() => setSubTab('COMPS')} label="Competições" />
        <TabBtn active={subTab === 'CALENDAR'} onClick={() => setSubTab('CALENDAR')} label="Calendário" />
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm min-h-[500px]">
        {subTab === 'MODS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modalities.map(m => (
              <div key={m.id} className="p-10 bg-slate-50 rounded-[48px] border border-gray-50 flex items-center gap-8 group hover:bg-white hover:shadow-2xl transition-all">
                <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <Icon name={m.icon} className="text-4xl" />
                </div>
                <div>
                  <h4 className="font-black text-xl text-gray-800 uppercase tracking-tighter">{m.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">{m.type}</p>
                  <Badge color="bg-emerald-50 text-emerald-600">ATIVO</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'GROUPS' && (
          <div className="space-y-12">
            {modalities.map(mod => (
              <div key={mod.id} className="pb-10 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary"><Icon name={mod.icon} /></div>
                  <h5 className="font-black text-primary uppercase text-sm tracking-widest">{mod.name}</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {ageGroups.filter(ag => ag.modalityId === mod.id).map(ag => (
                    <div key={ag.id} className="p-6 bg-slate-50 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                      <div>
                        <p className="font-black text-gray-800 text-xs">{ag.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{ag.minAge}-{ag.maxAge} ANOS</p>
                      </div>
                      <Icon name="arrow_forward" className="text-gray-200 group-hover:text-primary transition-all" />
                    </div>
                  ))}
                  <button className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-gray-300 font-black text-[10px] uppercase hover:bg-slate-50 transition-all">Adicionar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(subTab === 'RULES' || subTab === 'COMPS' || subTab === 'CALENDAR') && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-30">
            <Icon name="construction" className="text-7xl text-primary" />
            <p className="font-black text-xs uppercase tracking-[0.3em]">Modulo em Implementação Final</p>
          </div>
        )}
      </div>
    </div>
  );
};

const GamesManager: React.FC<{ user: User }> = ({ user }) => {
  const [subTab, setSubTab] = useState<'SCHEDULED' | 'RESULTS' | 'VALIDATION' | 'HISTORY'>('SCHEDULED');
  const games = authService.getGames(user.role === 'COORDENADOR' ? { municipalityId: user.municipalityId } : undefined);

  const handleAction = (id: string, status: MatchStatus) => {
    authService.validateGame(id, user, status);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 p-2 bg-slate-100 rounded-2xl w-fit no-print">
        <TabBtn active={subTab === 'SCHEDULED'} onClick={() => setSubTab('SCHEDULED')} label="Jogos Agendados" />
        <TabBtn active={subTab === 'RESULTS'} onClick={() => setSubTab('RESULTS')} label="Lançar Resultados" />
        {user.role !== 'ESCOLA' && <TabBtn active={subTab === 'VALIDATION'} onClick={() => setSubTab('VALIDATION')} label="Validação Oficial" />}
        <TabBtn active={subTab === 'HISTORY'} onClick={() => setSubTab('HISTORY')} label="Histórico" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(subTab === 'VALIDATION' ? games.filter(g => g.status === 'PROVISORIO') : games).map(g => (
          <div key={g.id} className="bg-white p-12 rounded-[64px] border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-center mb-10">
              <Badge color={g.status === 'VALIDADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}>
                {g.status}
              </Badge>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-300 uppercase leading-none">{g.date}</p>
                <p className="text-[8px] font-bold text-primary uppercase mt-1">{g.municipalityId}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="w-1/3 text-center space-y-3">
                <div className="size-16 bg-slate-50 rounded-[28px] mx-auto flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                  {g.homeSchool.charAt(0)}
                </div>
                <p className="font-black text-gray-800 text-xs truncate uppercase px-2">{g.homeSchool}</p>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                  <span className="text-6xl font-black text-primary tracking-tighter">{g.homeScore}</span>
                  <span className="text-sm font-black text-gray-100 uppercase italic">vs</span>
                  <span className="text-6xl font-black text-primary tracking-tighter">{g.awayScore}</span>
                </div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{g.modalityId}</p>
              </div>

              <div className="w-1/3 text-center space-y-3">
                <div className="size-16 bg-slate-50 rounded-[28px] mx-auto flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
                  {g.awaySchool.charAt(0)}
                </div>
                <p className="font-black text-gray-800 text-xs truncate uppercase px-2">{g.awaySchool}</p>
              </div>
            </div>

            {(subTab === 'VALIDATION' || subTab === 'RESULTS') && (
              <div className="mt-12 pt-8 border-t border-gray-50 flex gap-4 no-print">
                 <button onClick={() => handleAction(g.id, 'VALIDADO')} className="flex-1 bg-primary text-white py-5 rounded-3xl font-black text-[10px] uppercase shadow-xl hover:scale-[1.02] transition-all">Homologar</button>
                 <button onClick={() => handleAction(g.id, 'REJEITADO')} className="px-8 bg-red-50 text-red-500 rounded-3xl font-black text-[10px] uppercase">Rejeitar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const RankingView: React.FC<{ user: User; isReport?: boolean }> = ({ user, isReport }) => {
  const [subTab, setSubTab] = useState<'PROV' | 'MUNI' | 'SCHOOL' | 'MOD'>('PROV');
  const modalities = authService.getModalities();
  const [modality, setModality] = useState('futebol');
  const ranking = authService.calculateRanking(modality, (subTab === 'MUNI' || user.role === 'COORDENADOR') ? user.municipalityId : undefined);
  const munis = authService.getMunicipalities();
  const currentMuniName = munis.find(m => m.id === user.municipalityId)?.name || 'Província de Malanje';

  return (
    <div className="space-y-12 print-container">
      {/* HEADER PRINT */}
      <div className="print-only text-center space-y-6 mb-16 border-b-4 border-primary pb-10">
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-[0.3em]">República de Angola</p>
          <p className="text-sm font-black uppercase tracking-[0.3em]">Governo Provincial de Malanje</p>
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Gabinete Provincial da Educação</p>
        </div>
        <div className="py-8 bg-slate-50 rounded-3xl">
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">Relatório de Mérito Desportivo</h2>
          <p className="text-xs font-black text-gray-400 mt-2 uppercase">Modalidade: {modalities.find(m => m.id === modality)?.name} • Malanje, {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 no-print">
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-primary tracking-tighter uppercase">Ranking & Estatísticas</h3>
          <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
            <TabBtn active={subTab === 'PROV'} onClick={() => setSubTab('PROV')} label="Provincial" />
            <TabBtn active={subTab === 'MUNI'} onClick={() => setSubTab('MUNI')} label="Municipal" />
            <TabBtn active={subTab === 'SCHOOL'} onClick={() => setSubTab('SCHOOL')} label="Escolar" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select value={modality} onChange={(e) => setModality(e.target.value)} className="bg-white border-0 ring-1 ring-gray-100 rounded-2xl px-6 py-4 font-black text-[10px] uppercase shadow-sm outline-none">
            {modalities.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={() => window.print()} className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all flex items-center gap-3">
            <Icon name="picture_as_pdf" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[56px] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 font-black text-[10px] uppercase text-gray-400 print:bg-white print:text-black">
            <tr>
              <th className="p-8">Posição</th>
              <th className="p-8">Instituição de Ensino</th>
              <th className="p-8 text-center">J</th>
              <th className="p-8 text-center">V</th>
              <th className="p-8 text-center">E</th>
              <th className="p-8 text-center">♀ Desemp.</th>
              <th className="p-8 text-center">PONTOS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ranking.map((r, i) => (
              <tr key={r.schoolName} className="text-xs font-bold hover:bg-slate-50 transition-all">
                <td className="p-8">
                  <div className={`size-10 rounded-full flex items-center justify-center font-black ${i < 3 ? 'bg-secondary text-white' : 'bg-slate-100 text-gray-400'} print:border print:border-black`}>
                    {i + 1}
                  </div>
                </td>
                <td className="p-8">
                  <p className="font-black text-gray-800 text-base leading-tight uppercase">{r.schoolName}</p>
                  <p className="text-[9px] uppercase text-gray-300 font-bold">{r.municipalityId}</p>
                </td>
                <td className="p-8 text-center text-gray-500">{r.played}</td>
                <td className="p-8 text-center text-emerald-600">{r.wins}</td>
                <td className="p-8 text-center text-gray-400">{r.draws}</td>
                <td className="p-8 text-center"><Badge color="bg-secondary/5 text-secondary border-secondary/10">{r.femaleCount}</Badge></td>
                <td className="p-8 text-center text-primary text-2xl font-black tracking-tighter">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="print-only pt-32 space-y-24">
        <div className="grid grid-cols-2 gap-24">
          <div className="text-center space-y-4">
            <div className="border-t-2 border-black w-64 mx-auto"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Responsável pelo Polo</p>
          </div>
          <div className="text-center space-y-4">
            <div className="border-t-2 border-black w-64 mx-auto"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Gabinete Provincial da Educação</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupervisionView: React.FC<{ user: User }> = ({ user }) => {
  const [subTab, setSubTab] = useState<'MONI' | 'EVAL' | 'OBS' | 'REPS'>('MONI');
  return (
    <div className="space-y-10">
      <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl w-fit">
        <TabBtn active={subTab === 'MONI'} onClick={() => setSubTab('MONI')} label="Monitorização" />
        <TabBtn active={subTab === 'EVAL'} onClick={() => setSubTab('EVAL')} label="Avaliação Escolar" />
        <TabBtn active={subTab === 'OBS'} onClick={() => setSubTab('OBS')} label="Obs. Técnicas" />
        <TabBtn active={subTab === 'REPS'} onClick={() => setSubTab('REPS')} label="Relatórios" />
      </div>

      <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
         <Icon name="visibility" className="text-7xl text-primary opacity-20 mb-6" />
         <p className="font-black text-gray-300 uppercase text-xs tracking-[0.4em]">Módulo de Supervisão Operacional Ativo</p>
         <p className="text-[9px] font-bold text-gray-300 mt-2 uppercase">Aguardando inserção de dados de campo</p>
      </div>
    </div>
  );
};

const ReportsManager: React.FC<{ user: User }> = ({ user }) => {
  const [subTab, setSubTab] = useState<'REPS' | 'EXPORTS' | 'ANNS' | 'NOTIFS'>('ANNS');
  const ann = authService.getAnnouncements();

  return (
    <div className="space-y-10">
       <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl w-fit">
        <TabBtn active={subTab === 'REPS'} onClick={() => setSubTab('REPS')} label="Relatórios" />
        <TabBtn active={subTab === 'EXPORTS'} onClick={() => setSubTab('EXPORTS')} label="Exportação" />
        <TabBtn active={subTab === 'ANNS'} onClick={() => setSubTab('ANNS')} label="Comunicados" />
        <TabBtn active={subTab === 'NOTIFS'} onClick={() => setSubTab('NOTIFS')} label="Notificações" />
      </div>

      <div className="space-y-6">
        {subTab === 'ANNS' && ann.map(a => (
          <div key={a.id} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute left-0 top-0 h-full w-3 ${a.priority === 'ALTA' ? 'bg-secondary' : 'bg-primary'}`}></div>
            <div className="flex justify-between items-start pl-4">
              <div className="space-y-3">
                <Badge color={a.priority === 'ALTA' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}>Prioridade {a.priority}</Badge>
                <h4 className="text-2xl font-black text-primary tracking-tighter uppercase">{a.title}</h4>
                <p className="text-gray-500 font-bold text-sm leading-relaxed max-w-4xl uppercase opacity-70">{a.content}</p>
                <p className="text-[9px] font-black text-gray-300 uppercase pt-4">Emitido por: {a.author} • {new Date(a.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}

        {subTab !== 'ANNS' && (
          <div className="bg-white p-16 rounded-[56px] border border-gray-100 shadow-sm text-center">
            <Icon name="folder_open" className="text-7xl text-primary opacity-10 mb-4" />
            <p className="font-black text-gray-300 uppercase text-xs">Sem ficheiros recentes para visualização</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTRUTURA PRINCIPAL ---

const MainDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  useSync();
  const [activeTab, setActiveTab] = useState<MainTab>('DASHBOARD');
  const snap = authService.getSystemSnapshot();
  const munis = authService.getMunicipalities();
  const currentMuniName = munis.find(m => m.id === user.municipalityId)?.name || 'Sede Provincial';

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD': return <DashboardView user={user} snap={snap} />;
      case 'ADMIN': return <AdminManager user={user} />;
      case 'SPORTS': return <SportsManager user={user} />;
      case 'GAMES': return <GamesManager user={user} />;
      case 'RANKING': return <RankingView user={user} />;
      case 'SUPERVISION': return <SupervisionView user={user} />;
      case 'REPORTS': return <ReportsManager user={user} />;
      case 'CONFIG': return <AdminManager user={user} />; // Reutilizando para exemplo
      default: return <DashboardView user={user} snap={snap} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background-light">
      {/* SIDEBAR STITCH */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0 no-print">
        <div className="p-10 flex items-center gap-4">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Icon name="school" className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary tracking-tighter leading-none">PGDEM</h1>
            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Malanje - Angola</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-6 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 mt-8">Painel</p>
          <NavBtn active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} icon="dashboard" label="Dashboard" />
          
          <p className="px-6 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4 mt-8">Módulos Operativos</p>
          {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_REGIONAL') && (
            <NavBtn active={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} icon="account_tree" label="Gestão Administrativa" />
          )}
          <NavBtn active={activeTab === 'SPORTS'} onClick={() => setActiveTab('SPORTS')} icon="sports_handball" label="Gestão Desportiva" />
          <NavBtn active={activeTab === 'GAMES'} onClick={() => setActiveTab('GAMES')} icon="stadium" label="Jogos & Resultados" />
          <NavBtn active={activeTab === 'RANKING'} onClick={() => setActiveTab('RANKING')} icon="military_tech" label="Ranking & Estatísticas" />
          
          {user.role !== 'ESCOLA' && (
            <NavBtn active={activeTab === 'SUPERVISION'} onClick={() => setActiveTab('SUPERVISION')} icon="visibility" label="Supervisão Desportiva" />
          )}
          <NavBtn active={activeTab === 'REPORTS'} onClick={() => setActiveTab('REPORTS')} icon="campaign" label="Relatórios & Comms" />
        </nav>

        <div className="p-8 space-y-4">
           <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
             <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-[10px] uppercase">{user.name.charAt(0)}</div>
             <div className="overflow-hidden">
               <p className="text-[10px] font-black text-gray-800 truncate">{user.name}</p>
               <p className="text-[8px] font-bold text-primary uppercase">{user.role}</p>
             </div>
           </div>
           <button onClick={onLogout} className="w-full py-3 text-red-400 font-black text-[10px] uppercase hover:text-red-600 transition-colors flex items-center justify-center gap-2">
             <Icon name="logout" className="text-lg" /> Encerrar Sessão
           </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-16 max-w-[1600px] mx-auto w-full">
        <header className="flex justify-between items-center mb-16 no-print">
          <div>
            <h2 className="text-4xl font-black text-primary tracking-tighter uppercase">
              {activeTab.replace('_', ' ')} {user.municipalityId && `- POLO ${currentMuniName.toUpperCase()}`}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sincronização em tempo real ativa</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('CONFIG')} className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-primary shadow-sm"><Icon name="settings" /></button>
             <NotificationCenter user={user} />
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          {renderContent()}
        </div>
      </main>

      <PGDEMBot user={user} currentMuniName={currentMuniName} />
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const MetricCard: React.FC<{ label: string; value: number | string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-4 hover:translate-y-[-8px] transition-all group">
    <div className={`size-14 rounded-2xl bg-slate-50 flex items-center justify-center ${color} group-hover:bg-primary group-hover:text-white transition-all`}>
      <Icon name={icon} className="text-3xl" />
    </div>
    <p className="text-5xl font-black text-gray-800 tracking-tighter">{value}</p>
    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
  </div>
);

const NotificationCenter: React.FC<{ user: User }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const notices = authService.getNotifications(user);
  const unread = notices.filter(n => !n.isRead).length;
  return (
    <div className="relative no-print">
      <button onClick={() => setOpen(!open)} className="p-3 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-secondary shadow-sm relative">
        <Icon name="notifications" className={`text-2xl ${unread > 0 ? 'text-secondary animate-pulse' : ''}`} />
        {unread > 0 && <span className="absolute -top-1 -right-1 size-5 bg-secondary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-6 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 z-[300] animate-in fade-in slide-in-from-top-5">
          <div className="bg-primary p-8 text-white flex justify-between items-center rounded-t-[32px]">
            <h4 className="font-black text-[10px] uppercase tracking-widest">Alertas Oficiais</h4>
            <button onClick={() => setOpen(false)}><Icon name="close" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notices.map(n => (
              <div key={n.id} onClick={() => authService.markAsRead(n.id)} className={`p-6 border-b border-gray-50 cursor-pointer ${n.isRead ? 'opacity-40' : 'bg-secondary/5'}`}>
                <p className="text-[10px] font-bold text-gray-700">{n.message}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="p-10 text-center text-[10px] font-black text-gray-300 uppercase">Sem notificações</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const PGDEMBot: React.FC<{ user: User, currentMuniName: string }> = ({ user, currentMuniName }) => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot', text: string }[]>([{ role: 'bot', text: `Bem-vindo à assistência PGDEM Malanje. Sou o assistente de suporte do polo ${currentMuniName}. Como posso ajudar?` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [msgs, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setMsgs(prev => [...prev, { role: 'user', text: userMsg }]); setInput(''); setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const snap = authService.getSystemSnapshot();
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', contents: userMsg,
        config: { systemInstruction: `Você é o PGDEM Bot, o assistente oficial do Desporto Escolar de Malanje. Use um tom institucional e formal. Responda ao usuário ${user.name} (${user.role}) do polo de ${currentMuniName}. Dados atuais: ${snap.totalAthletes} atletas, ${snap.totalSchools} escolas.` }
      });
      setMsgs(prev => [...prev, { role: 'bot', text: res.text || "Sem resposta." }]);
    } catch { setMsgs(prev => [...prev, { role: 'bot', text: "Erro de processamento da IA." }]); } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-10 right-10 size-16 bg-primary text-white rounded-2xl shadow-2xl z-[100] flex items-center justify-center border-4 border-white active:scale-90 transition-all no-print group hover:bg-secondary">
        <Icon name={open ? "close" : "forum"} className="text-3xl" />
      </button>
      {open && (
        <div className="fixed bottom-32 right-10 w-96 h-[600px] bg-white rounded-[48px] shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 border border-gray-100 no-print">
          <div className="bg-primary p-8 text-white shrink-0">
            <h3 className="font-black text-2xl tracking-tighter uppercase">PGDEM Bot</h3>
            <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-1">Módulo de Inteligência Artificial</p>
          </div>
          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-4 bg-slate-50/50 no-scrollbar">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-5 rounded-[32px] max-w-[85%] text-[11px] font-bold ${m.role === 'user' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-700 shadow-sm border border-gray-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[9px] font-black text-gray-300 animate-pulse px-4 uppercase">Sincronizando resposta...</div>}
          </div>
          <div className="p-6 bg-white flex gap-2 border-t border-slate-100 items-center">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Sua questão institucional..." className="flex-1 bg-slate-50 border-0 rounded-2xl px-6 py-4 text-xs font-bold outline-none" />
            <button onClick={handleSend} className="size-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-secondary transition-all"><Icon name="send" className="text-lg" /></button>
          </div>
        </div>
      )}
    </>
  );
};

const LoginScreen: React.FC<{ onLogin: (u: User, t: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [err, setErr] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { const res = await authService.login(email, pass); onLogin(res.user, res.token); }
    catch (e: any) { setErr(e.message); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background-light">
      <div className="max-w-md w-full bg-white rounded-[64px] shadow-2xl p-16 text-center border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="size-28 bg-primary rounded-[32px] flex items-center justify-center text-white mx-auto mb-12 shadow-2xl rotate-3">
          <Icon name="school" className="text-6xl" />
        </div>
        <h1 className="text-5xl font-black text-primary mb-2 tracking-tighter uppercase leading-none">PGDEM</h1>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-16 italic">Província de Malanje</p>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase ml-6">E-mail Institucional</p>
            <input type="email" placeholder="nome@malanje.gov.ao" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 rounded-[28px] px-8 py-6 text-xs font-bold border-0 ring-1 ring-gray-100 outline-none focus:ring-primary/20 transition-all" required />
          </div>
          <div className="space-y-1">
             <p className="text-[9px] font-black text-gray-400 uppercase ml-6">Senha de Acesso</p>
            <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-slate-50 rounded-[28px] px-8 py-6 text-xs font-bold border-0 ring-1 ring-gray-100 outline-none focus:ring-primary/20 transition-all" required />
          </div>
          {err && <p className="text-red-500 text-[9px] font-black uppercase text-center bg-red-50 py-4 rounded-2xl">{err}</p>}
          <button className="w-full bg-primary text-white py-8 rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl text-sm hover:scale-[1.02] active:scale-95 transition-all mt-6">Aceder à Plataforma</button>
        </form>
        <button onClick={() => authService.resetDatabase()} className="mt-20 text-[8px] font-black text-gray-200 uppercase tracking-widest underline italic hover:text-primary transition-colors">Limpar Sessão Local</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<{ user: User | null; isAuthenticated: boolean }>({ user: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  useEffect(() => { const saved = localStorage.getItem('pgdem_session'); if (saved) setAuthState(JSON.parse(saved)); setLoading(false); }, []);
  const handleLogin = (user: User, token: string) => { const state = { user, isAuthenticated: true }; setAuthState(state); localStorage.setItem('pgdem_session', JSON.stringify(state)); };
  const handleLogout = () => { setAuthState({ user: null, isAuthenticated: false }); localStorage.removeItem('pgdem_session'); };
  if (loading) return null;
  return authState.isAuthenticated ? <MainDashboard user={authState.user!} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />;
};

export default App;
