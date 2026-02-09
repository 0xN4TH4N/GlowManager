import { NextRequest, NextResponse } from 'next/server';
import { FalService } from '@/services/falService';
import { MediaService } from '@/services/mediaService';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, referenceImageUrls, userId, parameters, contentType } = body;

    if (!prompt || !userId) return NextResponse.json({ error: 'Data missing' }, { status: 400 });

    // 1. Génération via Fal
    const result = (referenceImageUrls?.length > 0) 
      ? await FalService.generateFromImage(prompt, referenceImageUrls, parameters)
      : await FalService.generateImage(prompt, parameters);

    if (!result?.images?.[0]?.url) throw new Error('Generation failed');

    // 2. Upload vers Storage
    const permanentUrl = await MediaService.downloadAndStoreImage(result.images[0].url, userId, `gen.png`);

    // 3. Insertion DB : On force le dossier 'Général' et le 'contentType' reçu
    const { data: mediaData, error: dbError } = await supabase
      .from('media')
      .insert([{
        user_id: userId,
        url: permanentUrl,
        type: 'photo',
        content_type: contentType || 'sfw', // Important : SFW ou NSFW
        prompt: prompt,
        parameters: parameters,
        folder_name: 'Général', // Classement automatique ici
        is_finalized: false
      }])
      .select().single();

    if (dbError) throw dbError;
    const savedMedia = mediaData as { id: string, created_at: string };

    return NextResponse.json({
      success: true,
      generation: {
        id: savedMedia.id,
        images: [permanentUrl],
        prompt,
        createdAt: savedMedia.created_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}