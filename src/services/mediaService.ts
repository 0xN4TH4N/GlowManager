import { supabase } from '@/lib/supabase';
import { MediaItem, ContentType, MediaType } from '@/types';
import { FalService } from './falService';

export class MediaService {
  // --- GESTION DES DOSSIERS ---
  static async getFolders(contentType: ContentType) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('content_type', contentType)
      .order('name');
    if (error) throw error;
    return data || [];
  }

  static async createFolder(name: string, contentType: ContentType) {
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, content_type: contentType }])
      .select().single();
    if (error) throw error;
    return data;
  }

  static async renameFolder(oldName: string, newName: string, contentType: ContentType) {
    const { error: fErr } = await supabase.from('folders').update({ name: newName }).eq('name', oldName).eq('content_type', contentType);
    if (fErr) throw fErr;
    const { error: mErr } = await supabase.from('media').update({ folder_name: newName }).eq('folder_name', oldName).eq('content_type', contentType);
    if (mErr) throw mErr;
  }

  static async deleteFolder(folderName: string, contentType: ContentType, deleteContent: boolean = false) {
    if (deleteContent) {
      const { data: files } = await supabase.from('media').select('id').eq('folder_name', folderName).eq('content_type', contentType);
      if (files) await Promise.all(files.map(f => this.deleteMedia(f.id)));
    } else {
      await supabase.from('media').update({ folder_name: 'Général' }).eq('folder_name', folderName).eq('content_type', contentType);
    }
    await supabase.from('folders').delete().eq('name', folderName).eq('content_type', contentType);
  }

  // --- GESTION DES MÉDIAS ---
  // Récupère les médias filtrés par Type (SFW/NSFW) et potentiellement par dossier
  static async getAllMedia(contentType: ContentType, folder?: string): Promise<MediaItem[]> {
    let query = supabase.from('media')
      .select('*')
      .eq('content_type', contentType)
      .eq('is_finalized', true)
      .order('created_at', { ascending: false });
    
    // Si on demande un dossier précis (ex: "Général"), on filtre
    if (folder && folder !== 'All') {
      query = query.eq('folder_name', folder);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapToMediaItem);
  }

  // --- MÉTHODE REQUISE PAR L'API GENERATE ---
  static async downloadAndStoreImage(falUrl: string, userId: string, filename: string): Promise<string> {
    const response = await fetch(falUrl);
    const blob = await response.blob();
    const filePath = `${userId}/ai/${Date.now()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filePath, blob, { contentType: 'image/png' });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('generated-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  static async uploadFile(file: File, meta: { userId: string; contentType: ContentType; folder: string }): Promise<MediaItem> {
    const filePath = `${meta.userId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error: sErr } = await supabase.storage.from('generated-images').upload(filePath, file);
    if (sErr) throw sErr;

    const { data: urlData } = supabase.storage.from('generated-images').getPublicUrl(filePath);
    const { data, error: dbErr } = await supabase.from('media').insert([{
      user_id: meta.userId,
      url: urlData.publicUrl,
      type: file.type.includes('video') ? 'video' : 'photo',
      content_type: meta.contentType,
      folder_name: meta.folder,
      is_finalized: true,
    }]).select().single();

    if (dbErr) throw dbErr;
    return this.mapToMediaItem(data);
  }

  static async finalizeMedia(id: string): Promise<void> {
    const { error } = await supabase.from('media').update({ is_finalized: true }).eq('id', id);
    if (error) throw error;
  }

  static async deleteMedia(id: string): Promise<void> {
    const { data: media } = await supabase.from('media').select('url').eq('id', id).single();
    if (media?.url.includes('generated-images')) {
      const path = media.url.split('/generated-images/')[1];
      if (path) await supabase.storage.from('generated-images').remove([path]);
    }
    await supabase.from('media').delete().eq('id', id);
  }

  static async downloadFile(url: string, filename: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static mapToMediaItem(data: any): MediaItem {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      contentType: data.content_type,
      url: data.url,
      folder: data.folder_name || 'Général',
      createdAt: data.created_at,
      isFinalized: data.is_finalized,
      prompt: data.prompt,
    };
  }
}