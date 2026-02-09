"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAppStore } from "@/store/useAppStore"
import AuthForm from "@/components/AuthForm"
import { Loader2 } from "lucide-react"

export default function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  const { setUser, isAuthenticated, logout } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Vérifier la session actuelle au chargement
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            username: session.user.user_metadata.username || "User",
            createdAt: session.user.created_at,
          })
        }
      } catch (error) {
        console.error("Auth init error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 2. Écouter les changements d'état en temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || "User",
          createdAt: session.user.created_at,
        })
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, logout])

  // Écran de chargement initial
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Si non connecté, on affiche le formulaire d'authentification
  if (!isAuthenticated) {
    return <AuthForm />
  }

  // Si connecté, on affiche le contenu de l'application (Sidebar, Pages, etc.)
  return <>{children}</>
}