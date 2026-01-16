const MEEP_API_BASE = 'https://portal-api.meep.cloud';

interface MeepLoginResponse {
  success: boolean;
  message?: string;
}

interface MeepValidateResponse {
  success: boolean;
  token?: string;
  user?: MeepUserData;
  message?: string;
}

interface MeepVerifyTokenResponse {
  success: boolean;
  user?: MeepUserData;
  message?: string;
}

export interface MeepUserData {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
  locations?: string[];
}

class MeepAuthManager {
  private static TOKEN_KEY = 'meep_auth_token';
  private static USER_KEY = 'meep_user_data';

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  static getUserData(): MeepUserData | null {
    const data = sessionStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  static setUserData(userData: MeepUserData): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export async function meepLogin(username: string, password: string): Promise<MeepLoginResponse> {
  try {
    const response = await fetch(`${MEEP_API_BASE}/api/mfa/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Credenciais inválidas',
      };
    }

    return {
      success: true,
      message: 'Código MFA enviado para seu email',
    };
  } catch (error) {
    console.error('Erro ao fazer login Meep:', error);
    return {
      success: false,
      message: 'Erro de conexão com o servidor',
    };
  }
}

export async function meepValidate(username: string, code: string): Promise<MeepValidateResponse> {
  try {
    const response = await fetch(`${MEEP_API_BASE}/api/mfa/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Código inválido',
      };
    }

    if (data.token) {
      MeepAuthManager.setToken(data.token);
      if (data.user) {
        MeepAuthManager.setUserData(data.user);
      }
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error) {
    console.error('Erro ao validar código MFA:', error);
    return {
      success: false,
      message: 'Erro de conexão com o servidor',
    };
  }
}

export async function meepVerifyToken(token: string): Promise<MeepVerifyTokenResponse> {
  try {
    const response = await fetch(`${MEEP_API_BASE}/api/mfa/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Token inválido',
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Erro ao verificar token Meep:', error);
    return {
      success: false,
      message: 'Erro de conexão com o servidor',
    };
  }
}

export { MeepAuthManager };
