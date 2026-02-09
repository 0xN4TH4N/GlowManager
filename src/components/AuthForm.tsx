'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles } from 'lucide-react';

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useAppStore((state) => state.setUser);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata.username || 'User',
          createdAt: data.user.created_at,
        };
        setUser(user);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            username: registerUsername,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          username: registerUsername,
          createdAt: data.user.created_at,
        };
        setUser(user);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 antialiased">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl">
        <CardHeader className="space-y-4 pt-10 pb-6 text-center">
          <div className="flex justify-center">
            <div className="bg-white text-black p-2 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tighter text-white uppercase">
              AI Studio
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs tracking-wide">
              ENTREZ VOS IDENTIFIANTS POUR ACCÉDER AU DASHBOARD
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-800 border-zinc-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Connexion</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-white/20"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" title="password" className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-white/20"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2 rounded text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 mt-2 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SE CONNECTER'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="register-username" className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Nom d'utilisateur</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="johndoe"
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-white/20"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-email" className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-white/20"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="register-password" title="password" className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-white/20"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-tighter italic">
                    Minimum 6 caractères
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2 rounded text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 mt-2 h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CRÉER UN COMPTE"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}