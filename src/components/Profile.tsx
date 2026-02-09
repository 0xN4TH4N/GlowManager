"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, User as UserIcon, Lock, Fingerprint } from "lucide-react";
import { toast } from "sonner"; // Optionnel : utilise ta librairie de toast préférée
import { Badge } from "./ui/badge";

export default function AccountPage() {
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(false);

  // States pour les formulaires
  const [username, setUsername] = useState(user?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. Mise à jour du profil (Username)
  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles") // Ou ta table user/profile
        .update({ username })
        .eq("id", user?.id);

      if (error) throw error;
      
      if (user) setUser({ ...user, username });
      toast.success("Profil mis à jour !");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Changement de mot de passe
  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Mot de passe modifié avec succès");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Paramètres du compte</h1>
        <p className="text-muted-foreground text-sm">Gérez vos informations personnelles et la sécurité de votre accès.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general" className="text-xs font-bold uppercase">
            <UserIcon className="w-3.5 h-3.5 mr-2" /> Général
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-bold uppercase">
            <Lock className="w-3.5 h-3.5 mr-2" /> Sécurité
          </TabsTrigger>
          <TabsTrigger value="2fa" className="text-xs font-bold uppercase">
            <Fingerprint className="w-3.5 h-3.5 mr-2" /> A2F
          </TabsTrigger>
        </TabsList>

        {/* SECTION GÉNÉRALE */}
        <TabsContent value="general">
          <Card className="border-none bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Profil</CardTitle>
              <CardDescription>Modifiez votre nom d'utilisateur public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" value={user.email} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
              <Button 
                onClick={updateProfile} 
                disabled={loading}
                className="font-bold uppercase text-[10px]"
              >
                {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION SÉCURITÉ (MOT DE PASSE) */}
        <TabsContent value="security">
          <Card className="border-none bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Mot de passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={updatePassword} 
                disabled={loading || !newPassword}
                variant="secondary"
                className="font-bold uppercase text-[10px]"
              >
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION A2F */}
        <TabsContent value="2fa">
          <Card className="border-none bg-card/50 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Double Authentification (A2F)</CardTitle>
              </div>
              <CardDescription>
                Ajoutez une couche de sécurité supplémentaire à votre compte en utilisant une application d'authentification (Google Authenticator, Authy, etc.).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium mb-4">Statut : <Badge variant="outline" className="ml-2">Désactivé</Badge></p>
                <Button 
                  disabled 
                  variant="outline"
                  className="w-full font-bold uppercase text-[10px] opacity-50"
                >
                  Configurer l'A2F (Bientôt disponible)
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Note : La configuration de l'A2F nécessite une vérification par e-mail avant l'activation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
        <h4 className="text-destructive font-bold text-sm mb-1 uppercase">Zone de danger</h4>
        <p className="text-muted-foreground text-xs mb-4">La suppression de votre compte est irréversible et effacera toutes vos données.</p>
        <Button variant="destructive" className="font-bold uppercase text-[10px] h-9">
          Supprimer mon compte
        </Button>
      </div>
    </div>
  );
}