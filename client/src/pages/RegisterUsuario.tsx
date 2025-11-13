import { NavLink } from '@/components/SimpleNavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { getCurrentUser, register } from '@/services/authService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterUsuario = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            // já logado - redireciona conforme tipo
            if (user.tipo === 'admin') navigate('/painel-admin');
            else if (user.onboardingId) navigate('/painel-usuario');
            else navigate('/onboarding');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            const { user, token } = await register(nome, email, password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Registro realizado com sucesso!');
            navigate('/onboarding');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao registrar');
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
                    <p className="text-muted-foreground">Registro de Cliente</p>
                </div>

                <div className="bg-card p-8 rounded-xl border border-border shadow-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Nome</label>
                            <Input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome completo"
                                required
                                className="bg-secondary border-border"
                            />
                        </div>

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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirme a Senha</label>
                            <PasswordInput
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
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
                            {loading ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <NavLink to="/login" label="Voltar ao Login" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterUsuario;
