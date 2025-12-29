
/**
 * PGDEM CENTRAL DATABASE ENGINE - V30 (Announcements & Communications)
 * Motor de Soberania de Dados com Catálogo Completo da Província de Malanje
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_REGIONAL' | 'COORDENADOR' | 'ESCOLA';
export type MatchStatus = 'AGENDADO' | 'PROVISORIO' | 'VALIDADO' | 'REJEITADO';
export type EntityStatus = 'ATIVO' | 'SUSPENSO' | 'INATIVO';
export type NotificationType = 'INFO' | 'ALERT' | 'SUCCESS' | 'ERROR';
export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA';

export const SYNC_EVENT = 'PGDEM_STITCH_SYNC';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  municipalityId?: string;
  schoolName?: string;
  lastLogin: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: Priority;
  targetRole?: UserRole;
}

export interface Infrastructure {
  id: string;
  name: string;
  type: 'PAVILHAO' | 'CAMPO' | 'POLIDESPORTIVO';
  municipalityId: string;
  status: EntityStatus;
}

export interface Notification {
  id: string;
  userId?: string;
  role?: UserRole;
  municipalityId?: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}

export interface Municipality {
  id: string;
  name: string;
  status: EntityStatus;
  coordinatorName: string;
}

export interface Modality {
  id: string;
  name: string;
  icon: string;
  status: EntityStatus;
  type: 'COLECTIVA' | 'INDIVIDUAL';
}

export interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  modalityId: string;
}

export interface School {
  id: string;
  name: string;
  municipalityId: string;
  address: string;
  directorName: string;
  contact: string;
}

export interface Athlete {
  id: string;
  name: string;
  biNumber: string;
  gender: 'M' | 'F';
  birthDate: string;
  schoolId: string;
  municipalityId: string;
  status: EntityStatus;
}

export interface Game {
  id: string;
  modalityId: string;
  municipalityId: string;
  homeSchool: string;
  awaySchool: string;
  homeScore: number;
  awayScore: number;
  date: string;
  status: MatchStatus;
  updatedBy: string;
  validatedBy?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  env: 'PROD' | 'STAGING';
  origin: string;
}

export interface RankingEntry {
  schoolName: string;
  municipalityId: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  femaleCount: number;
}

const DB_KEYS = {
  USERS: 'pgdem_v30_users',
  GAMES: 'pgdem_v30_games',
  ATHLETES: 'pgdem_v30_athletes',
  SCHOOLS: 'pgdem_v30_schools',
  AUDIT: 'pgdem_v30_audit',
  NOTIFICATIONS: 'pgdem_v30_notifications',
  MUNICIPALITIES: 'pgdem_v30_muni',
  MODALITIES: 'pgdem_v30_mod',
  AGE_GROUPS: 'pgdem_v30_age',
  INFRA: 'pgdem_v30_infra',
  ANNOUNCEMENTS: 'pgdem_v30_ann'
};

const INITIAL_MUNICIPALITIES: Municipality[] = [
  { id: 'malanje', name: 'Malanje', status: 'ATIVO', coordinatorName: 'Coord. Malanje Sede' },
  { id: 'calandula', name: 'Calandula', status: 'ATIVO', coordinatorName: 'Coord. Calandula' },
  { id: 'cacuso', name: 'Cacuso', status: 'ATIVO', coordinatorName: 'Coord. Cacuso' },
  { id: 'cangandala', name: 'Cangandala', status: 'ATIVO', coordinatorName: 'Coord. Cangandala' }
];

const INITIAL_USERS: User[] = [
  { id: "admin-prov", name: "Dr. Diretor Provincial", email: "admin@malanje.gov.ao", password: "admin123", role: "SUPER_ADMIN", lastLogin: new Date().toISOString() },
  { id: "admin-norte", name: "Administrador Regional Norte", email: "admin.norte@malanje.gov.ao", password: "admin_norte123", role: "ADMIN_REGIONAL", lastLogin: new Date().toISOString() },
  { id: "coord-malanje", name: "Coordenador de Malanje", email: "coord_malanje@malanje.gov.ao", password: "malanje123", role: "COORDENADOR", municipalityId: "malanje", lastLogin: new Date().toISOString() },
  { id: "escola-malanje", name: "Prof. Escola 11 de Novembro", email: "escola_malanje@malanje.gov.ao", password: "escola123", role: "ESCOLA", municipalityId: "malanje", schoolName: "Escola 11 de Novembro", lastLogin: new Date().toISOString() },
  { id: "coord-cacuso", name: "Inspetor de Cacuso", email: "coord_cacuso@malanje.gov.ao", password: "cacuso123", role: "COORDENADOR", municipalityId: "cacuso", lastLogin: new Date().toISOString() }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', title: 'Abertura das Inscrições 2025', content: 'Estão abertas as inscrições para a fase provincial dos jogos escolares. Todos os coordenadores municipais devem homologar as listas de atletas até ao dia 15 do próximo mês.', date: new Date().toISOString(), author: 'Direção Provincial', priority: 'ALTA' },
  { id: 'ann-2', title: 'Novo Regulamento de Xadrez', content: 'Consulte a nova adenda ao regulamento técnico de xadrez para o escalão Sub-14.', date: new Date().toISOString(), author: 'Secção Técnica', priority: 'MEDIA' }
];

// Fixed: Define missing initial constants
const INITIAL_INFRA: Infrastructure[] = [
  { id: 'inf-1', name: 'Pavilhão Arena Malanje', type: 'PAVILHAO', municipalityId: 'malanje', status: 'ATIVO' },
  { id: 'inf-2', name: 'Campo 1º de Maio', type: 'CAMPO', municipalityId: 'malanje', status: 'ATIVO' }
];

const INITIAL_MODALITIES: Modality[] = [
  { id: 'futebol', name: 'Futebol', icon: 'sports_soccer', status: 'ATIVO', type: 'COLECTIVA' },
  { id: 'basquetebol', name: 'Basquetebol', icon: 'sports_basketball', status: 'ATIVO', type: 'COLECTIVA' },
  { id: 'xadrez', name: 'Xadrez', icon: 'tactic', status: 'ATIVO', type: 'INDIVIDUAL' }
];

const INITIAL_AGE_GROUPS: AgeGroup[] = [
  { id: 'sub-14-fut', name: 'Sub-14 Masculino', minAge: 12, maxAge: 14, modalityId: 'futebol' },
  { id: 'sub-16-fut', name: 'Sub-16 Masculino', minAge: 14, maxAge: 16, modalityId: 'futebol' }
];

const getStore = <T>(key: string, initial: T[] = []): T[] => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const setStore = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(SYNC_EVENT));
};

export const authService = {
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    const users = getStore<User>(DB_KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user && String(user.password) === pass.trim()) {
      user.lastLogin = new Date().toISOString();
      setStore(DB_KEYS.USERS, users);
      authService.logAction(user.id, user.name, 'LOGIN', 'Acesso autorizado.', user.municipalityId || 'PROVINCIAL');
      return { user, token: btoa(user.email) };
    }
    throw new Error("Credenciais institucionais inválidas ou utilizador não semeado.");
  },

  logAction: (userId: string, userName: string, action: string, details: string, origin: string) => {
    const logs = getStore<AuditLog>(DB_KEYS.AUDIT);
    const newLog: AuditLog = { 
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), userId, userName, action, details, env: 'PROD', origin
    };
    setStore(DB_KEYS.AUDIT, [newLog, ...logs].slice(0, 5000));
  },

  getSystemHealth: () => {
    const start = performance.now();
    getStore(DB_KEYS.GAMES);
    const end = performance.now();
    return {
      dbLatency: `${(end - start).toFixed(2)}ms`,
      syncStatus: 'ONLINE',
      storageUsed: `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`,
      uptime: '99.9%',
      lastBackup: new Date().toLocaleDateString()
    };
  },

  // Fixed: Implement getSystemSnapshot
  getSystemSnapshot: () => {
    const athletes = getStore<Athlete>(DB_KEYS.ATHLETES);
    const schools = getStore<School>(DB_KEYS.SCHOOLS);
    const games = getStore<Game>(DB_KEYS.GAMES);
    return {
      totalAthletes: athletes.length,
      totalSchools: schools.length,
      totalGames: games.filter(g => g.status === 'VALIDADO').length,
      pendingValidation: games.filter(g => g.status === 'PROVISORIO').length
    };
  },

  exportFullBackup: () => {
    const data = {
      timestamp: new Date().toISOString(),
      entities: {
        users: getStore(DB_KEYS.USERS),
        games: getStore(DB_KEYS.GAMES),
        athletes: getStore(DB_KEYS.ATHLETES),
        schools: getStore(DB_KEYS.SCHOOLS),
        audit: getStore(DB_KEYS.AUDIT),
        ageGroups: getStore(DB_KEYS.AGE_GROUPS),
        infra: getStore(DB_KEYS.INFRA),
        announcements: getStore(DB_KEYS.ANNOUNCEMENTS)
      }
    };
    return JSON.stringify(data, null, 2);
  },

  getAnnouncements: () => getStore<Announcement>(DB_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS),
  saveAnnouncement: (ann: Announcement, user: User) => {
    const list = getStore<Announcement>(DB_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const idx = list.findIndex(i => i.id === ann.id);
    if (idx > -1) list[idx] = ann; else list.push({ ...ann, id: `ann-${Date.now()}`, author: user.name, date: new Date().toISOString() });
    setStore(DB_KEYS.ANNOUNCEMENTS, list);
    authService.logAction(user.id, user.name, 'PUBLISH_ANN', ann.title, user.municipalityId || 'PROVINCIAL');
  },
  deleteAnnouncement: (id: string, user: User) => {
    const list = getStore<Announcement>(DB_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setStore(DB_KEYS.ANNOUNCEMENTS, list.filter(i => i.id !== id));
    authService.logAction(user.id, user.name, 'DELETE_ANN', id, user.municipalityId || 'PROVINCIAL');
  },

  getUsers: () => getStore<User>(DB_KEYS.USERS, INITIAL_USERS),
  saveUser: (u: User, admin: User) => {
    if (admin.role !== 'SUPER_ADMIN') throw new Error("Permissão negada.");
    const list = getStore<User>(DB_KEYS.USERS, INITIAL_USERS);
    const idx = list.findIndex(i => i.id === u.id);
    if (idx > -1) list[idx] = { ...list[idx], ...u };
    else list.push({ ...u, id: `u-${Date.now()}`, lastLogin: new Date().toISOString() });
    setStore(DB_KEYS.USERS, list);
  },

  // Fixed: Now uses defined INITIAL_INFRA
  getInfrastructures: (muniId?: string) => {
    const all = getStore<Infrastructure>(DB_KEYS.INFRA, INITIAL_INFRA);
    return muniId ? all.filter(i => i.municipalityId === muniId) : all;
  },
  saveInfrastructure: (infra: Infrastructure, user: User) => {
    const list = getStore<Infrastructure>(DB_KEYS.INFRA, INITIAL_INFRA);
    const idx = list.findIndex(i => i.id === infra.id);
    if (idx > -1) list[idx] = infra; else list.push({ ...infra, id: `inf-${Date.now()}` });
    setStore(DB_KEYS.INFRA, list);
  },

  getMunicipalities: () => getStore<Municipality>(DB_KEYS.MUNICIPALITIES, INITIAL_MUNICIPALITIES),
  // Fixed: Now uses defined INITIAL_MODALITIES
  getModalities: () => getStore<Modality>(DB_KEYS.MODALITIES, INITIAL_MODALITIES),

  // Fixed: Now uses defined INITIAL_AGE_GROUPS
  getAgeGroups: (modalityId?: string) => {
    const all = getStore<AgeGroup>(DB_KEYS.AGE_GROUPS, INITIAL_AGE_GROUPS);
    return modalityId ? all.filter(ag => ag.modalityId === modalityId) : all;
  },
  saveAgeGroup: (ag: AgeGroup, user: User) => {
    const list = getStore<AgeGroup>(DB_KEYS.AGE_GROUPS, INITIAL_AGE_GROUPS);
    const idx = list.findIndex(i => i.id === ag.id);
    if (idx > -1) list[idx] = ag; else list.push({ ...ag, id: `ag-${Date.now()}` });
    setStore(DB_KEYS.AGE_GROUPS, list);
  },

  deleteAgeGroup: (id: string, user: User) => {
    const list = getStore<AgeGroup>(DB_KEYS.AGE_GROUPS, INITIAL_AGE_GROUPS);
    const filtered = list.filter(ag => ag.id !== id);
    setStore(DB_KEYS.AGE_GROUPS, filtered);
  },

  getSchools: (municipalityId?: string) => {
    const all = getStore<School>(DB_KEYS.SCHOOLS);
    return municipalityId ? all.filter(s => s.municipalityId === municipalityId) : all;
  },
  saveSchool: (s: School, user: User) => {
    const list = getStore<School>(DB_KEYS.SCHOOLS);
    const idx = list.findIndex(i => i.id === s.id);
    if (idx > -1) list[idx] = s; else list.push({ ...s, id: `sc-${Date.now()}` });
    setStore(DB_KEYS.SCHOOLS, list);
  },

  getAthletes: (filter?: { schoolName?: string; municipalityId?: string }) => {
    let athletes = getStore<Athlete>(DB_KEYS.ATHLETES);
    if (filter?.schoolName) athletes = athletes.filter(a => a.schoolId === filter.schoolName);
    if (filter?.municipalityId) athletes = athletes.filter(a => a.municipalityId === filter.municipalityId);
    return athletes;
  },
  saveAthlete: (a: Athlete, user: User) => {
    const list = getStore<Athlete>(DB_KEYS.ATHLETES);
    const idx = list.findIndex(i => i.id === a.id);
    if (idx > -1) list[idx] = a; 
    else {
      if (list.find(i => i.biNumber === a.biNumber)) throw new Error("Atleta já inscrito.");
      list.push({ ...a, id: `at-${Date.now()}` });
    }
    setStore(DB_KEYS.ATHLETES, list);
  },

  getGames: (filter?: { schoolName?: string; municipalityId?: string }) => {
    let games = getStore<Game>(DB_KEYS.GAMES);
    if (filter?.schoolName) games = games.filter(g => g.homeSchool === filter.schoolName || g.awaySchool === filter.schoolName);
    if (filter?.municipalityId) games = games.filter(g => g.municipalityId === filter.municipalityId);
    return games;
  },
  saveGameResult: (game: Game, user: User) => {
    const games = getStore<Game>(DB_KEYS.GAMES);
    const index = games.findIndex(g => g.id === game.id);
    const updatedGame = { ...game, status: (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_REGIONAL' ? 'VALIDADO' : 'PROVISORIO') as MatchStatus, updatedBy: user.id };
    if (index > -1) games[index] = updatedGame; else { updatedGame.id = `game-${Date.now()}`; games.push(updatedGame); }
    setStore(DB_KEYS.GAMES, games);
  },

  validateGame: (id: string, user: User, status: MatchStatus) => {
    const games = getStore<Game>(DB_KEYS.GAMES);
    const game = games.find(g => g.id === id);
    if (game) {
      game.status = status; game.validatedBy = user.id;
      setStore(DB_KEYS.GAMES, games);
    }
  },

  calculateRanking: (modalityId: string, municipalityId?: string): RankingEntry[] => {
    const games = getStore<Game>(DB_KEYS.GAMES).filter(g => g.status === 'VALIDADO' && g.modalityId === modalityId);
    const filteredGames = municipalityId ? games.filter(g => g.municipalityId === municipalityId) : games;
    const athletes = getStore<Athlete>(DB_KEYS.ATHLETES);
    const ranking: Record<string, RankingEntry> = {};
    filteredGames.forEach(g => {
      [g.homeSchool, g.awaySchool].forEach(s => {
        if (!ranking[s]) {
          const femaleInSchool = athletes.filter(a => a.schoolId === s && a.gender === 'F').length;
          ranking[s] = { schoolName: s, municipalityId: g.municipalityId, points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, femaleCount: femaleInSchool };
        }
      });
      const home = ranking[g.homeSchool], away = ranking[g.awaySchool];
      home.played++; away.played++;
      home.goalsFor += g.homeScore; home.goalsAgainst += g.awayScore;
      away.goalsFor += g.awayScore; away.goalsAgainst += g.homeScore;
      if (g.homeScore > g.awayScore) { home.points += 3; home.wins++; away.losses++; }
      else if (g.homeScore < g.awayScore) { away.points += 3; away.wins++; home.losses++; }
      else { home.points += 1; away.points += 1; home.draws++; away.draws++; }
    });
    return Object.values(ranking).sort((a, b) => b.points - a.points || b.wins - a.wins);
  },

  // Fixed: Implement getAuditLogs
  getAuditLogs: () => getStore<AuditLog>(DB_KEYS.AUDIT),

  getNotifications: (user: User) => {
    const all = getStore<Notification>(DB_KEYS.NOTIFICATIONS);
    return all.filter(n => (n.userId === user.id) || (n.role === user.role && (!n.municipalityId || n.municipalityId === user.municipalityId)));
  },

  // Fixed: Implement markAsRead
  markAsRead: (id: string) => {
    const list = getStore<Notification>(DB_KEYS.NOTIFICATIONS);
    const idx = list.findIndex(n => n.id === id);
    if (idx > -1) {
      list[idx].isRead = true;
      setStore(DB_KEYS.NOTIFICATIONS, list);
    }
  },

  resetDatabase: () => {
    localStorage.clear(); window.location.reload();
  }
};
