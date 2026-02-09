'use client';

import { useState, useEffect, useRef } from 'react';
import { MediaService } from '@/services/mediaService';
import { useAppStore } from '@/store/useAppStore';
import { 
  Folder, FolderPlus, Trash2, Edit2, Download, 
  Upload, CheckCircle2, Loader2, X, Plus, MoreHorizontal,
  Grid2X2, Eye, ShieldAlert, Image as ImageIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Gallery() {
  const { user, mediaItems, setMediaItems } = useAppStore();
  const [activeTab, setActiveTab] = useState<'sfw' | 'nsfw'>('sfw');
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState('Général');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newFolderInput, setNewFolderInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refreshData(); }, [activeTab, activeFolder]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [f, m] = await Promise.all([
        MediaService.getFolders(activeTab),
        MediaService.getAllMedia(activeTab, activeFolder)
      ]);
      setFolders(f);
      setMediaItems(m);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setLoading(true);
    try {
      await MediaService.uploadFile(e.target.files[0], {
        userId: user.id,
        contentType: activeTab,
        folder: activeFolder
      });
      refreshData();
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (oldName: string) => {
    const name = prompt("Nouveau nom du dossier :", oldName);
    if (name && name !== oldName) {
      await MediaService.renameFolder(oldName, name, activeTab);
      setActiveFolder(name);
      refreshData();
    }
  };

  const deleteSelection = async () => {
    if (!confirm(`Supprimer ${selectedIds.length} assets ?`)) return;
    await Promise.all(selectedIds.map(id => MediaService.deleteMedia(id)));
    setSelectedIds([]);
    refreshData();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden border rounded-3xl bg-card/30 backdrop-blur-xl">
      
      {/* --- SIDEBAR EXPLORER --- */}
      <aside className="w-72 border-r flex flex-col bg-muted/20">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Classification</h3>
            <Tabs value={activeTab} onValueChange={(v) => {setActiveTab(v as any); setActiveFolder('Général')}} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-background/50 border p-1">
                <TabsTrigger value="sfw" className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  SFW
                </TabsTrigger>
                <TabsTrigger value="nsfw" className="text-[10px] font-bold uppercase data-[state=active]:bg-destructive data-[state=active]:text-white">
                  NSFW
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator className="opacity-50" />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Directories</h3>
              <Badge variant="outline" className="text-[9px] font-mono opacity-50 border-none">{folders.length}</Badge>
            </div>
            
            <ScrollArea className="h-[45vh] -mx-2 px-2">
              <div className="space-y-1">
                {folders.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setActiveFolder(f.name)}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFolder === f.name ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className={`h-4 w-4 ${activeFolder === f.name ? 'fill-current' : 'opacity-40'}`} />
                      <span className="truncate uppercase tracking-tight">{f.name}</span>
                    </div>
                    {f.name !== 'Général' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-3 w-3"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-bold uppercase text-[10px] min-w-[140px]">
                          <DropdownMenuItem className="gap-2" onClick={() => handleRename(f.name)}>
                            <Edit2 className="h-3.5 w-3.5"/> Renommer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive gap-2 focus:bg-destructive focus:text-white" onClick={() => MediaService.deleteFolder(f.name, activeTab).then(refreshData)}>
                            <Trash2 className="h-3.5 w-3.5"/> Détruire
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="mt-auto p-4 bg-muted/30 border-t">
          <div className="flex gap-2">
            <Input 
              placeholder="NEW FOLDER" 
              value={newFolderInput} 
              onChange={e => setNewFolderInput(e.target.value)} 
              className="h-9 text-[10px] font-black bg-background uppercase border-none focus-visible:ring-1 shadow-inner" 
            />
            <Button size="icon" className="h-9 w-9 shrink-0 shadow-xl" onClick={() => { if(newFolderInput) MediaService.createFolder(newFolderInput, activeTab).then(() => {setNewFolderInput(''); refreshData();})}}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col bg-background/20 relative">
        <header className="flex justify-between items-center p-8 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">{activeFolder}</h2>
              {activeTab === 'nsfw' && <Badge variant="destructive" className="text-[8px] uppercase tracking-widest"><ShieldAlert className="h-3 w-3 mr-1"/> NSFW</Badge>}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Grid2X2 className="h-3 w-3" />}
              {mediaItems.length} Assets in storage
            </p>
          </div>
          
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                <Button variant="destructive" size="sm" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-destructive/20" onClick={deleteSelection}>
                  <Trash2 className="h-3.5 w-3.5 mr-2"/> Delete ({selectedIds.length})
                </Button>
                <Button variant="outline" size="sm" className="h-10 px-4" onClick={() => setSelectedIds([])}>
                  <X className="h-3.5 w-3.5"/>
                </Button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*,video/*" />
            <Button onClick={() => fileInputRef.current?.click()} className="h-10 px-8 text-[10px] font-black uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl">
              <Upload className="h-3.5 w-3.5 mr-2" /> Upload Asset
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 px-8">
          {loading && mediaItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Accessing Database...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-12">
              {mediaItems.map(item => (
                <div 
                  key={item.id} 
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border-2 ${selectedIds.includes(item.id) ? 'border-primary ring-4 ring-primary/20 scale-[0.98]' : 'border-transparent bg-muted/40 hover:shadow-2xl hover:-translate-y-1'}`}
                  onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                >
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" loading="lazy" />
                  
                  {/* Overlay interactif */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  {/* Bouton de sélection (haut gauche) */}
                  <div className="absolute top-4 left-4">
                    <div className={`transition-all duration-300 rounded-full flex items-center justify-center border-2 ${selectedIds.includes(item.id) ? 'bg-primary border-primary h-6 w-6' : 'bg-black/20 border-white/20 h-6 w-6 opacity-0 group-hover:opacity-100'}`}>
                      <CheckCircle2 className={`h-4 w-4 ${selectedIds.includes(item.id) ? 'text-white' : 'text-white/40'}`} />
                    </div>
                  </div>

                  {/* Actions rapides (bas droite) */}
                  <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl shadow-2xl bg-white text-black hover:bg-primary hover:text-white border-none transition-colors" onClick={(e) => {e.stopPropagation(); MediaService.downloadFile(item.url, `asset-${item.id}.png`);}}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}