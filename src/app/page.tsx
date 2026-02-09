"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAppStore } from "@/store/useAppStore"
import AuthForm from "@/components/AuthForm"
import { 
  Loader2, Sparkles, MessageSquare, Users, 
  DollarSign, BarChart3, Plus, ArrowUpRight, 
  Settings2, Eye
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PlatformDashboard() {
  const { user } = useAppStore()

  return (
    <SidebarProvider>
      <AppSidebar/>
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          
          {/* TOP SECTION: GLOBAL PERFORMANCE */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Command Center</h2>
              <p className="text-muted-foreground text-sm">Gestion des modèles IA, flux de messages et revenus abonnés.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="font-bold uppercase text-[10px] tracking-widest h-9">
                <Plus className="w-3 h-3 mr-2" /> New Model
              </Button>
              <Button size="sm" variant="outline" className="font-bold uppercase text-[10px] tracking-widest h-9">
                <BarChart3 className="w-3 h-3 mr-2" /> Analytics
              </Button>
            </div>
          </div>

          {/* KEY METRICS GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value="$12,840" detail="+15% this week" icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
            <MetricCard title="Active Models" value="8" detail="3 Training" icon={<Sparkles className="w-4 h-4 text-blue-500" />} />
            <MetricCard title="Total Subscribers" value="1,240" detail="New: 42 today" icon={<Users className="w-4 h-4 text-purple-500" />} />
            <MetricCard title="Messages Sent" value="85.4k" detail="98% AI Response" icon={<MessageSquare className="w-4 h-4 text-orange-500" />} />
          </div>

          {/* MAIN CONTENT SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: MODEL MANAGEMENT (CRUD PREVIEW) */}
            <Card className="lg:col-span-2 border-none bg-card/40 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold uppercase tracking-tight">Modèles IA Actifs</CardTitle>
                  <CardDescription>Visualisez et éditez vos personas IA.</CardDescription>
                </div>
                <Button variant="ghost" size="icon"><Settings2 className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Lila Nova", type: "OnlyFans", status: "Active", income: "$4.2k" },
                  { name: "Aris AI", type: "Chatting", status: "Training", income: "$0" },
                  { name: "Luna Dark", type: "Exclusive", status: "Active", income: "$1.8k" },
                ].map((model, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-background/50 hover:bg-muted/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-black text-xs">
                        {model.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{model.name}</span>
                          <Badge variant={model.status === "Active" ? "default" : "secondary"} className="text-[8px] h-4 uppercase">
                            {model.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{model.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-black">{model.income}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Earnings</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowUpRight className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* COLUMN 3: RECENT ACTIVITY & CHATTING FLOW */}
            <Card className="border-none bg-card/40 shadow-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold uppercase tracking-tight">Live Feed</CardTitle>
                <CardDescription>Flux des interactions en temps réel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium leading-none">
                        <span className="font-bold">Subscriber_92</span> a débloqué un média de <span className="text-primary">Lila Nova</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Il y a {i * 5} min</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest mt-4">
                  View Full Logs
                </Button>
              </CardContent>
            </Card>
          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function MetricCard({ title, value, detail, icon }: { title: string, value: string, detail: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none bg-card/40 shadow-none hover:bg-card/60 transition-colors cursor-pointer group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black italic">{value}</div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">
          {detail}
        </p>
      </CardContent>
    </Card>
  )
}