import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { MeepAuthManager } from "@/lib/meep-auth-manager";

type AppRole = "admin" | "rh" | "gestor" | "modo_tv";
type AppSector = 
  | "administrativo"
  | "canais"
  | "comercial"
  | "compliance"
  | "compras"
  | "cs"
  | "cs_meep"
  | "cs_mee"
  | "desenvolvimento"
  | "eventos"
  | "financeiro"
  | "implantacao"
  | "integracoes"
  | "logistica"
  | "marketing"
  | "produto"
  | "prospeccao"
  | "rh"
  | "suporte"
  | "suporte_tecnico";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  sector: AppSector[] | null;
  created_at: string;
  updated_at: string;
}

interface MeepLoginResult {
  error: Error | null;
  needsRegistration?: boolean;
  meepData?: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  sectors: AppSector[];
  isLoading: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isModoTV: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithMeep: (email: string, meepToken: string) => Promise<MeepLoginResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleData) {
        setRole(roleData.role as AppRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching profile/role:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(() => fetchProfileAndRole(session.user.id), 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear Meep auth data as well
    MeepAuthManager.clearToken();
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const loginWithMeep = async (email: string, meepToken: string): Promise<MeepLoginResult> => {
    try {
      // Call edge function to authenticate with Meep token
      const { data, error } = await supabase.functions.invoke("meep-supabase-auth", {
        body: { email, meepToken },
      });

      if (error) {
        console.error("Meep auth error:", error);
        return { error: new Error("Erro ao autenticar com Meep") };
      }

      if (data.error) {
        return { error: new Error(data.error) };
      }

      // User not registered in local system
      if (data.status === "user_not_registered") {
        return {
          error: null,
          needsRegistration: true,
          meepData: data.meepData,
        };
      }

      // User authenticated, verify OTP to create Supabase session
      if (data.token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: "magiclink",
        });

        if (verifyError) {
          console.error("OTP verification error:", verifyError);
          return { error: new Error("Erro ao criar sessão") };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error in loginWithMeep:", error);
      return { error: error instanceof Error ? error : new Error("Erro inesperado") };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    sectors: profile?.sector ?? [],
    isLoading,
    isApproved: profile?.is_approved ?? false,
    isAdmin: role === "admin",
    isGestor: role === "gestor",
    isModoTV: role === "modo_tv",
    signIn,
    signUp,
    signOut,
    refreshProfile,
    loginWithMeep,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
