import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/custom-client';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { toast } from 'sonner';
import { validateEmail, normalizeEmail } from '@/utils/emailValidation';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setIsLoading(false);
        
        // Se não há usuário e estamos em uma rota protegida, redireciona para login
        const publicRoutes = ['/', '/login', '/register', '/pricing'];
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Getting existing session:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log('[NavigationEffect] Estado de navegação:', { user, profile, pathname: location.pathname });
      const publicRoutes = ['/', '/login', '/register', '/pricing'];
      
      if (user) {
        // Se estiver logado e tentar acessar rota pública
        if (publicRoutes.includes(location.pathname)) {
          console.log(`[NavigationEffect] Usuário logado tentando acessar rota pública (${location.pathname}), redirecionando para /dashboard`);
          navigate('/dashboard');
        }
      } else {
        // Se não estiver logado e tentar acessar rota protegida
        if (!publicRoutes.includes(location.pathname)) {
          console.log(`[NavigationEffect] Usuário não logado tentando acessar rota protegida (${location.pathname}), redirecionando para /login`);
          navigate('/login');
        }
      }
    }
  }, [isLoading, user, location.pathname, navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log(`[fetchProfile] Iniciando busca de perfil para ID: ${userId}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[fetchProfile] Erro ao buscar perfil:', error);
        if (error.code === 'PGRST116') {
          console.log('[fetchProfile] Perfil não encontrado (406), redirecionando para completar cadastro');
          setProfile(null);
          navigate('/complete-profile');
        } else {
          throw error;
        }
      } else if (data) {
        console.log('[fetchProfile] Perfil encontrado:', data);
        setProfile(data as Profile);
      } else {
        console.log('[fetchProfile] Nenhum perfil encontrado, redirecionando para completar cadastro');
        setProfile(null);
        navigate('/complete-profile');
      }
    } catch (error) {
      console.error('[fetchProfile] Erro no catch:', error);
      setProfile(null);
      toast.error('Erro ao carregar perfil. Por favor, tente novamente.');
    } finally {
      console.log('[fetchProfile] Finalizando loading');
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        toast.error('E-mail inválido', {
          description: emailValidation.message
        });
        return;
      }

      // Normalize email
      const trimmedEmail = normalizeEmail(email);
      
      console.log("Attempting sign in with:", trimmedEmail);
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ 
        email: trimmedEmail, 
        password 
      });
      
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      setIsLoading(false);
      const authError = error as AuthError;
      console.error("Sign in error:", authError);
      
      // Provide more specific error messages
      let errorMessage = 'Falha na autenticação';
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'E-mail ou senha incorretos';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        toast.error('E-mail inválido', {
          description: emailValidation.message
        });
        return;
      }

      // Normalize email
      const trimmedEmail = normalizeEmail(email);
      
      console.log("Attempting sign up with:", trimmedEmail);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      toast.success('Conta criada com sucesso!');
      navigate('/onboarding');
    } catch (error) {
      setIsLoading(false);
      const authError = error as AuthError;
      console.error("Sign up error:", authError);
      
      // Provide more specific error messages
      let errorMessage = 'Falha ao criar conta';
      if (authError.message.includes('email address is already registered')) {
        errorMessage = 'Este e-mail já está em uso';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpa o estado local
      setUser(null);
      setProfile(null);
      setSession(null);
      
      navigate('/');
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Falha ao sair');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Falha ao atualizar perfil');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
