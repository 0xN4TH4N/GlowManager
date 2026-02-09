'use client';

import { useState, useEffect, useRef } from 'react';
import { MediaService } from '@/services/mediaService';
import { useAppStore } from '@/store/useAppStore';
import { 
  Folder, FolderPlus, Trash2, Edit2, Download, 
  Upload, CheckSquare, Square, MoreVertical, Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function Database() {
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

  return (
    <div className="flex h-[85vh] gap-8 overflow-hidden p-2">
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col gap-6">
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
          {(['sfw', 'nsfw'] as const).map((t) => (
            <Button
              key={t}
              variant={activeTab === t ? 'secondary' : 'ghost'}
              className={`flex-1 text-[10px] font-bold uppercase tracking-wider h-8 ${activeTab === t && 'shadow-sm bg-background'}`}
              onClick={() => { setActiveTab(t); setActiveFolder('Général'); }}
            >
              {t}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {folders.map(f => (
            <div key={f.id} className="group relative flex items-center">
              <button 
                onClick={() => setActiveFolder(f.name)}
                className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeFolder === f.name ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                <Folder className={`h-4 w-4 ${activeFolder === f.name ? 'opacity-100' : 'opacity-40'}`} />
                {f.name}
              </button>
              
              {f.name !== 'Général' && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-0.5 scale-90 origin-right transition-all">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRename(f.name)}><Edit2 className="h-3 w-3"/></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => MediaService.deleteFolder(f.name, activeTab).then(refreshData)}><Trash2 className="h-3 w-3"/></Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border/50">
          <Input 
            placeholder="Nouveau dossier..." 
            value={newFolderInput} 
            onChange={e => setNewFolderInput(e.target.value)} 
            className="h-9 text-xs bg-muted/30 border-none focus-visible:ring-1" 
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => { if(newFolderInput) MediaService.createFolder(newFolderInput, activeTab).then(() => {setNewFolderInput(''); refreshData();})}}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col gap-6">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-tighter">{activeFolder}</h2>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              {loading ? 'Synchronisation...' : `${mediaItems.length} assets synchronisés`}
            </p>
          </div>
          
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300">
                <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-bold uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => { Promise.all(selectedIds.map(id => MediaService.deleteMedia(id))).then(() => {setSelectedIds([]); refreshData();})}}>
                  <Trash2 className="h-3.5 w-3.5 mr-2"/> Supprimer ({selectedIds.length})
                </Button>
                <Button variant="outline" size="sm" className="h-10 px-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => setSelectedIds([])}>
                  <X className="h-3.5 w-3.5 mr-2"/> Annuler
                </Button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*,video/*" />
            <Button onClick={() => fileInputRef.current?.click()} className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
              <Upload className="h-3.5 w-3.5 mr-2" /> Upload Asset
            </Button>
          </div>
        </header>

        {loading && mediaItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Chargement de la database</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 overflow-y-auto pr-2 pb-10 custom-scrollbar">
            {mediaItems.map(item => (
              <div 
                key={item.id} 
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${selectedIds.includes(item.id) ? 'border-primary ring-8 ring-primary/10 scale-[0.98]' : 'border-transparent bg-muted hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1'}`}
                onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
              >
                <img src={item.url} className="w-full h-full object-cover" alt="" loading="lazy" />
                
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${selectedIds.includes(item.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                <div className="absolute top-4 left-4">
                  {selectedIds.includes(item.id) ? (
                    <div className="bg-primary p-1 rounded-lg shadow-lg"><CheckSquare className="text-white h-5 w-5" /></div>
                  ) : (
                    <Square className="text-white/70 h-6 w-6" />
                  )}
                </div>

                <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-2xl backdrop-blur-md bg-white/90" onClick={(e) => {e.stopPropagation(); MediaService.downloadFile(item.url, `asset-${item.id}.png`);}}>
                    <Download className="h-4 w-4 text-black" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}