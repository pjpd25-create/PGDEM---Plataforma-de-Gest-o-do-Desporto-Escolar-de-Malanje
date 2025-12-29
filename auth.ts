
/**
 * PGDEM AUTH SERVICE
 * Lógica de Autenticação e Autorização Institucional
 */

export type UserRole = 'SUPER_ADMIN' | 'COORDENADOR' | 'ESCOLA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  municipalityId?: string;
  schoolId?: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RegistrationRequest {
  institutionName: string;
  municipality: string;
  responsibleName: string;
  email: string;
  password?: string;
}

// Mock de base de dados - Mutável para persistência em memória durante a sessão
let MOCK_USERS: Record<string, any> = {
  "admin@malanje.gov.ao": {
    id: "1",
    name: "Dr. António Manuel",
    password: "123",
    role: "SUPER_ADMIN",
    lastLogin: new Date().toISOString()
  },
  "coord.cacuso@malanje.gov.ao": {
    id: "2",
    name: "Eng. Pedro Santos",
    password: "123",
    role: "COORDENADOR",
    municipalityId: "cacuso",
    lastLogin: new Date().toISOString()
  },
  "direcao@escola4fevereiro.ao": {
    id: "3",
    name: "Prof. Maria Isabel",
    password: "123",
    role: "ESCOLA",
    municipalityId: "malanje",
    schoolId: "4fevereiro",
    lastLogin: new Date().toISOString()
  }
};

export const authService = {
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS[email];
    if (foundUser && foundUser.password === pass) {
      const { password, ...userWithoutPass } = foundUser;
      const token = btoa(`${email}:${Date.now()}`);
      return { user: userWithoutPass as User, token };
    }
    throw new Error("Email ou palavra-passe incorretos.");
  },

  registerRequest: async (data: RegistrationRequest): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    if (MOCK_USERS[data.email]) {
      throw new Error("Este email já está registado.");
    }

    // Registo imediato com a senha fornecida
    MOCK_USERS[data.email] = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.responsibleName,
      password: data.password,
      role: "ESCOLA",
      municipalityId: data.municipality.toLowerCase(),
      lastLogin: new Date().toISOString()
    };
    
    return true;
  },

  logout: () => {
    localStorage.removeItem('pgdem_session');
  }
};
