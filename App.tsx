
import React, { useState, useEffect } from 'react';
import { authService, User, AuthState, RegistrationRequest } from './auth';

// --- COMPONENTES AUXILIARES ---

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const StatCard: React.FC<{ label: string; value: string; icon: string; colorClass: string; iconColor: string }> = ({ label, value, icon, colorClass, iconColor }) => (
  <div className={`flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm border-l-4 ${colorClass} relative overflow-hidden group hover:shadow-md transition-all h-full`}>
    <div className={`absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity`}>
      <Icon name={icon} className="text-6xl" />
    </div>
    <div className="flex items-center gap-2">
      <div className={`flex items-center justify-center size-9 rounded-lg ${iconColor}/10 ${iconColor}`}>
        <Icon name={icon} className="text-xl" />
      </div>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

// --- COMPONENTES DE TELA ---

const LoginScreen: React.FC<{ onLogin: (u: User, t: string) => void }> = ({ onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'SUCCESS'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [regData, setRegData] = useState<RegistrationRequest>({
    institutionName: '', municipality: 'Malanje', responsibleName: '', email: '', password: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, token } = await authService.login(email, password);
      onLogin(user, token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.registerRequest(regData);
      setView('SUCCESS');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="bg-primary p-8 text-center text-white">
          <Icon name={view === 'REGISTER' ? 'person_add' : 'school'} className="text-5xl mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">PGDEM MALANJE</h1>
          <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Gestão do Desporto Escolar</p>
        </div>
        
        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2"><Icon name="error" className="text-sm" /> {error}</div>}

          {view === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="exemplo@malanje.gov.ao" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Palavra-passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="••••••••" required />
              </div>
              <button disabled={loading} className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? 'A processar...' : 'Entrar'}
              </button>
              <button type="button" onClick={() => setView('REGISTER')} className="w-full text-xs font-bold text-primary hover:underline mt-2">Criar conta para nova escola</button>
            </form>
          ) : view === 'REGISTER' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input type="text" placeholder="Nome da Instituição" value={regData.institutionName} onChange={(e) => setRegData({...regData, institutionName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required />
              <div className="grid grid-cols-2 gap-2">
                <select value={regData.municipality} onChange={(e) => setRegData({...regData, municipality: e.target.value})} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none">
                  <option>Malanje</option><option>Cacuso</option><option>Calandula</option>
                </select>
                <input type="text" placeholder="Responsável" value={regData.responsibleName} onChange={(e) => setRegData({...regData, responsibleName: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required />
              </div>
              <input type="email" placeholder="Email Institucional" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required />
              <input type="password" placeholder="Definir Palavra-passe" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required minLength={3} />
              <button disabled={loading} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-lg">Confirmar Registo</button>
              <button type="button" onClick={() => setView('LOGIN')} className="w-full text-xs font-bold text-gray-500 hover:underline">Voltar</button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <Icon name="check_circle" className="text-6xl text-green-500" />
              <h2 className="text-xl font-bold text-secondary">Registo Efetuado!</h2>
              <p className="text-sm text-gray-500">Utilize o email e a palavra-passe que definiu para entrar.</p>
              <button onClick={() => setView('LOGIN')} className="w-full bg-secondary text-white font-bold py-3.5 rounded-xl">Ir para Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isBotOpen, setIsBotOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f6f7]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 sticky top-0 h-screen p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
            <Icon name="school" className="text-xl" />
          </div>
          <div>
            <h1 className="font-bold text-secondary tracking-tight">PGDEM</h1>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Painel de Gestão</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold text-sm"><Icon name="dashboard" /> Início</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all"><Icon name="school" /> Escolas</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all"><Icon name="emoji_events" /> Rankings</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all"><Icon name="groups" /> Atletas</button>
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-all mt-auto"><Icon name="logout" /> Sair</button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile/Tablet */}
        <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Icon name="school" className="text-primary" />
            <span className="font-bold text-secondary text-lg">PGDEM</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Icon name="notifications" /></button>
            <button onClick={onLogout} className="size-9 rounded-full bg-red-50 flex items-center justify-center text-red-400"><Icon name="logout" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6 pb-24 lg:pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-secondary">Olá, {user.name.split(' ')[0]}</h2>
              <p className="text-gray-500 font-medium">Dashboard provincial de Malanje.</p>
            </div>
            <div className="w-full md:w-64">
              <select className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary">
                <option>Toda a Província</option>
                <option>Malanje</option>
                <option>Cacuso</option>
              </select>
            </div>
          </div>

          {/* Grid de Estatísticas Responsivo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Municípios" value="14" icon="map" colorClass="border-primary" iconColor="text-primary" />
            <StatCard label="Escolas" value="120" icon="school" colorClass="border-secondary" iconColor="text-secondary" />
            <StatCard label="Atletas" value="3.450" icon="groups" colorClass="border-primary/60" iconColor="text-primary" />
            <StatCard label="Modalidades" value="8" icon="sports_soccer" colorClass="border-secondary/60" iconColor="text-secondary" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico Género */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-6">Género</h3>
              <div className="flex flex-col items-center gap-6">
                <div className="relative size-32 rounded-full shadow-inner" style={{ background: 'conic-gradient(#c01b58 0% 60%, #1e3a8a 60% 100%)' }}>
                  <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                    <span className="text-xl font-bold text-gray-800">3.4k</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="text-xs font-bold text-gray-600">Masculino</span>
                    <span className="font-bold text-primary">60%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                    <span className="text-xs font-bold text-gray-600">Feminino</span>
                    <span className="font-bold text-secondary">40%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progresso Municípios */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Atletas por Município</h3>
                <Icon name="trending_up" className="text-gray-300" />
              </div>
              <div className="space-y-6">
                <ProgressRow label="Malanje" value="1,240" percent="85%" color="bg-primary" />
                <ProgressRow label="Cacuso" value="850" percent="65%" color="bg-secondary" />
                <ProgressRow label="Cangandala" value="620" percent="45%" color="bg-secondary/60" />
                <ProgressRow label="Calandula" value="340" percent="25%" color="bg-primary/40" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Navegação Mobile Inferior */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        <button className="text-primary"><Icon name="dashboard" /></button>
        <button className="text-gray-300"><Icon name="school" /></button>
        <div className="relative -top-8">
          <button className="size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"><Icon name="add" className="text-3xl" /></button>
        </div>
        <button className="text-gray-300"><Icon name="emoji_events" /></button>
        <button className="text-gray-300"><Icon name="person" /></button>
      </nav>

      {/* PGDEM Bot Floating Action */}
      <button onClick={() => setIsBotOpen(!isBotOpen)} className="fixed bottom-24 lg:bottom-8 right-6 size-14 bg-white border border-gray-100 shadow-xl rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform z-40">
        <Icon name="smart_toy" />
      </button>

      {isBotOpen && (
        <div className="fixed inset-4 lg:inset-auto lg:right-8 lg:bottom-24 lg:w-96 lg:h-[500px] bg-white rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden border border-gray-100">
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2"><Icon name="smart_toy" /> Assistente PGDEM</span>
            <button onClick={() => setIsBotOpen(false)}><Icon name="close" /></button>
          </div>
          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%]">Olá! Como posso ajudar na gestão do desporto escolar hoje?</div>
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <input type="text" placeholder="Escreva aqui..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary" />
            <button className="bg-primary text-white size-10 rounded-xl flex items-center justify-center"><Icon name="send" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProgressRow: React.FC<{ label: string; value: string; percent: string; color: string }> = ({ label, value, percent, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-400">{value} Atletas</span>
    </div>
    <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: percent }}></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, token: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pgdem_session');
    if (saved) setAuthState(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (user: User, token: string) => {
    const state = { user, token, isAuthenticated: true };
    setAuthState(state);
    localStorage.setItem('pgdem_session', JSON.stringify(state));
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-bold tracking-[0.3em] text-primary animate-pulse">PGDEM MALANJE</p>
    </div>
  );

  return authState.isAuthenticated ? <Dashboard user={authState.user!} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />;
};

export default App;
