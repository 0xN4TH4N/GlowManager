'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MediaService } from '@/services/mediaService';
import { GenerationParameters } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Image as ImageIcon, Sparkles, Check, Trash2, MonitorPlay } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Videos() {
  const { 
    user, 
    mediaItems, 
    setMediaItems, 
    selectedMedia, 
    currentGeneration, 
    setCurrentGeneration, 
    isGenerating, 
    setIsGenerating 
  } = useAppStore();

  const [prompt, setPrompt] = useState('');
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>([]);
  const [generationMode, setGenerationMode] = useState<'sfw' | 'nsfw'>('sfw');
  
  // Paramètres techniques
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [steps, setSteps] = useState(4);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [strength, setStrength] = useState(0.75);

  /**
   * EFFET : Charge TOUTES les photos du mode sélectionné (SFW/NSFW)
   * On ignore le filtre par dossier ici pour avoir accès à toute la bibliothèque
   */
  useEffect(() => {
    const fetchAllModeMedia = async () => {
      if (user) {
        // On ne passe pas de 3ème argument (folder) pour récupérer TOUT le contenu du mode
        const media = await MediaService.getAllMedia(generationMode);
        setMediaItems(media);
      }
    };
    fetchAllModeMedia();
  }, [user, generationMode, setMediaItems]);

  // Gestion de la sélection de référence via le store (si on vient de la Database)
  useEffect(() => {
    if (selectedMedia) {
      setSelectedReferenceIds(prev => 
        prev.includes(selectedMedia.id) ? prev : [...prev, selectedMedia.id]
      );
      if (selectedMedia.prompt) setPrompt(selectedMedia.prompt);
    }
  }, [selectedMedia]);

  const toggleReference = (id: string) => {
    setSelectedReferenceIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    setIsGenerating(true);

    try {
      const parameters: GenerationParameters = {
        width, height, steps, 
        guidance_scale: guidanceScale, 
        strength, num_images: 1,
      };

      const selectedUrls = mediaItems
        .filter((m) => selectedReferenceIds.includes(m.id))
        .map((m) => m.url);

      const endpoint = generationMode === 'sfw' ? '/api/generate' : '/api/generate-nsfw';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImageUrls: selectedUrls, 
          parameters,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de génération');
      setCurrentGeneration(data.generation);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!currentGeneration) return;
    try {
      await MediaService.finalizeMedia(currentGeneration.id);
      setCurrentGeneration(null);
      // Rafraîchir la bibliothèque pour inclure la nouvelle image
      const media = await MediaService.getAllMedia(generationMode);
      setMediaItems(media);
    } catch (error) {
      console.error("Erreur validation:", error);
    }
  };

  const handleDiscard = async () => {
    if (!currentGeneration) return;
    try {
      await MediaService.deleteMedia(currentGeneration.id);
      setCurrentGeneration(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  // Filtrage local pour l'affichage de la grille de sélection
  const displayPhotos = mediaItems.filter(
    (item) => item.contentType === generationMode && item.isFinalized
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* PANNEAU DE CONFIGURATION */}
      <div className="xl:col-span-7 space-y-6">
        <Card className="border-none shadow-2xl bg-card/20 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Inférence Studio</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold opacity-50">Génération par transfert de style & IP-Adapter</CardDescription>
                </div>
              </div>
              
              <div className="flex bg-muted p-1 rounded-xl border border-white/5">
                <Button 
                  variant={generationMode === 'sfw' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setGenerationMode('sfw')}
                  className="h-8 text-[10px] font-black px-4"
                >SFW</Button>
                <Button 
                  variant={generationMode === 'nsfw' ? 'destructive' : 'ghost'} 
                  size="sm" 
                  onClick={() => setGenerationMode('nsfw')}
                  className="h-8 text-[10px] font-black px-4"
                >NSFW</Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-8">
            {/* GRILLE DE RÉFÉRENCES (TOUS DOSSIERS CONFONDUS) */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-[11px] uppercase tracking-[0.2em] font-black text-primary">
                  Bibliothèque de Références ({selectedReferenceIds.length})
                </Label>
                <span className="text-[9px] font-bold opacity-30 uppercase">Tous les dossiers inclus</span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 border-2 border-dashed border-white/5 rounded-2xl bg-black/20 max-h-[220px] overflow-y-auto custom-scrollbar">
                {displayPhotos.length === 0 ? (
                  <div className="col-span-full py-10 flex flex-col items-center opacity-20">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-[10px] font-bold uppercase">Accès à la Database...</p>
                  </div>
                ) : (
                  displayPhotos.map((item) => (
                    <div
                      key={item.id}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        selectedReferenceIds.includes(item.id) 
                          ? 'border-primary ring-4 ring-primary/20 scale-95' 
                          : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                      onClick={() => toggleReference(item.id)}
                    >
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      {selectedReferenceIds.includes(item.id) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="text-white h-6 w-6 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PROMPT & PARAMÈTRES */}
            <div className="space-y-4">
              <Label className="text-[11px] uppercase tracking-[0.2em] font-black text-primary">Instructions Créatives</Label>
              <Textarea
                placeholder="Décrivez la scène, la tenue et l'éclairage..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-black/20 border-white/5 rounded-2xl resize-none text-sm italic p-4 focus:border-primary/50 transition-colors"
              />
            </div>

            <Tabs defaultValue="intel" className="w-full">
              <TabsList className="w-full bg-black/20 border border-white/5 h-12 p-1 rounded-2xl">
                <TabsTrigger value="format" className="flex-1 text-[10px] font-black uppercase tracking-widest">Dimensions</TabsTrigger>
                <TabsTrigger value="intel" className="flex-1 text-[10px] font-black uppercase tracking-widest">Intelligence</TabsTrigger>
              </TabsList>
              
              <TabsContent value="format" className="pt-6 grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase opacity-50">Largeur (px)</Label>
                  <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="bg-black/20 border-white/5 h-11" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase opacity-50">Hauteur (px)</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="bg-black/20 border-white/5 h-11" />
                </div>
              </TabsContent>

              <TabsContent value="intel" className="pt-6 space-y-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase opacity-50">Influence Référence (Strength)</Label>
                    <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">{strength}</span>
                  </div>
                  <Slider value={[strength]} min={0} max={1} step={0.01} onValueChange={(v) => setStrength(v[0])} className="py-2" />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
              {isGenerating ? (
                <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> <span className="uppercase font-black tracking-widest text-xs">Calcul de l'image...</span></>
              ) : (
                <><Sparkles className="mr-3 h-5 w-5" /> <span className="uppercase font-black tracking-widest text-xs">Lancer la Génération</span></>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MONITORING / PREVIEW (Partie droite corrigée) */}
      <div className="xl:col-span-5 xl:sticky xl:top-24">
        <Card className="bg-black/40 border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sortie Moniteur</span>
            </div>
          </div>

          <div className="aspect-[3/4] flex items-center justify-center p-8">
             {isGenerating ? (
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-[9px] font-bold uppercase tracking-tighter opacity-30">Inférence en cours...</p>
                </div>
             ) : currentGeneration ? (
               <div className="relative group w-full h-full animate-in fade-in zoom-in-95 duration-500">
                <img src={currentGeneration.images[0]} alt="Result" className="w-full h-full object-cover rounded-3xl shadow-2xl" />
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                  <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700 h-12 rounded-xl font-black uppercase text-[10px]">Conserver</Button>
                  <Button onClick={handleDiscard} variant="destructive" className="h-12 rounded-xl font-black uppercase text-[10px]">Supprimer</Button>
                </div>
               </div>
             ) : (
                <div className="text-center opacity-10">
                  <ImageIcon className="h-24 w-24 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Aucun Signal</p>
                </div>
             )}
          </div>
        </Card>
      </div>
    </div>
  );
}