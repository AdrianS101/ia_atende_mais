import { NavLink } from '@/components/SimpleNavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { getCurrentUser, login } from '@/services/authService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LoginUsuario = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.tipo === 'admin') {
        navigate('/painel-admin');
      } else {
        navigate('/painel-usuario');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await login(email, password);

      if (user.tipo === 'admin') {
        toast.error('Use o login de administrador para acessar');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login realizado com sucesso!');

      navigate('/painel-usuario');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-cyan-bright to-cyan-glow mb-4 shadow-glow">
            <span className="text-primary-foreground font-bold text-2xl">IA</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">IA ATENDE MAIS</h1>
          <p className="text-muted-foreground">Login do Cliente</p>
        </div>

        <div className="bg-card p-8 rounded-xl border border-border shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-secondary border-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="space-y-2">
              <NavLink to="/register" label="Registrar-se" />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <NavLink to="/login-admin" label="Acessar como Administrador" />
        </div>
      </div>
    </div>
  );
};

export default LoginUsuario;
