
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login API call
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, always succeed
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    }, 1500);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <svg 
          viewBox="0 0 24 24" 
          className="h-8 w-8 text-brandBlue-600"
          fill="currentColor"
        >
          <path d="M17.6 6.32C16.27 4.8 14.27 4 12 4C7.59 4 4 7.59 4 12c0 1.47.5 2.89 1.44 4.09L4.55 20l3.96-.87c1.17.79 2.56 1.2 3.99 1.2h.03c4.41 0 8-3.59 8-8c0-2.52-1.17-4.58-2.93-6.01zM12 20c-1.29 0-2.56-.36-3.65-1.05l-.24-.14l-2.61.57l.57-2.55l-.16-.25c-.78-1.07-1.18-2.38-1.18-3.74c0-3.58 2.92-6.5 6.5-6.5c2.02 0 3.77.92 4.95 2.35C17.42 10.12 18 11.97 18 12.17c0 3.58-2.92 6.5-6.5 6.5zM16.25 13.97c-.19-.1-1.12-.55-1.3-.61c-.17-.06-.3-.09-.42.09c-.12.19-.47.61-.58.74c-.11.13-.21.14-.4.05c-1.07-.54-1.77-.97-2.47-2.2c-.19-.32.19-.3.54-1c.06-.11.03-.21-.02-.3c-.05-.08-.42-1.01-.58-1.38c-.15-.36-.31-.31-.42-.32c-.11 0-.24-.03-.36-.03s-.33.05-.5.24c-.17.19-.64.63-.64 1.53c0 .9.67 1.77.76 1.89c.09.12 1.24 1.97 3.05 2.69c1.13.45 1.57.49 2.13.41c.34-.05 1.12-.46 1.28-.9c.16-.45.16-.83.11-.91c-.05-.08-.19-.14-.38-.24z"/>
        </svg>
        <span className="text-2xl font-semibold text-gray-800">WhatsApp Lead Pilot</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Entrar na plataforma</CardTitle>
          <CardDescription className="text-center">
            Digite seu e-mail e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-brandBlue-600 hover:text-brandBlue-700">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-brandBlue-600 hover:text-brandBlue-700 font-medium">
              Cadastre-se
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500">
            Ao entrar, você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700">
              Termos de Serviço
            </a>
            {" "}e{" "}
            <a href="#" className="underline underline-offset-4 hover:text-gray-700">
              Política de Privacidade
            </a>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
