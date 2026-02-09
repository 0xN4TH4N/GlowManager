import * as fal from "@fal-ai/serverless-client";
import { GenerationParameters, FalImageResponse } from "@/types";

/**
 * Configuration Fal AI (SERVER ONLY)
 */
if (typeof window === "undefined") {
  if (!process.env.FAL_KEY) {
    throw new Error("❌ FAL_KEY manquant dans les variables d’environnement");
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

export class NSFWService {
  /**
   * Text-to-Image — Nano Banana
   */
  static async generateImage(
    prompt: string,
    parameters: GenerationParameters = {}
  ): Promise<FalImageResponse> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("❌ Prompt vide");
    }

    const rawResult: any = await fal.subscribe("fal-ai/nano-banana", {
      input: {
        prompt,
        image_size:
          parameters.width && parameters.height
            ? `${parameters.width}x${parameters.height}`
            : "1024x1024",

        num_inference_steps: parameters.steps ?? 4,
        guidance_scale: parameters.guidance_scale ?? 3.5,
        num_images: parameters.num_images ?? 1,
        ...(parameters.seed !== undefined && { seed: parameters.seed }),
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          console.log("🎨 Nano Banana progress:", update.logs ?? []);
        }
      },
    });

    const data = rawResult?.data ?? rawResult;

    if (!data?.images || data.images.length === 0) {
      throw new Error("Aucune image générée par Fal AI (Nano Banana)");
    }

    return data as FalImageResponse;
  }

  /**
   * Image-to-Image (Edit) — Nano Banana
   * Basé sur l'API : https://fal.ai/models/fal-ai/nano-banana/edit/api
   */
  static async generateFromImage(
      prompt: string, 
      imageUrls: string | string[], // On accepte une ou plusieurs URLs
      parameters: GenerationParameters = {}
    ): Promise<FalImageResponse> {
      
      // On s'assure que imageUrls est toujours un tableau de strings
      const finalUrls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

      const input: any = {
        prompt: prompt,
        image_urls: finalUrls, // LE CHAMP CORRECT : pluriel + tableau
        num_images: 1,
        aspect_ratio: "auto",
        output_format: "png",
        // Note: Nano Banana Edit semble ignorer 'strength' ou 'steps' 
        // dans ce schéma spécifique, mais on peut les laisser si besoin.
      };

      const rawResult: any = await fal.subscribe("fal-ai/nano-banana/edit", {
        input,
        logs: true,
      });

      const data = rawResult?.data ?? rawResult;
      return data as FalImageResponse;
    }

  /**
   * Télécharge une image distante et la convertit en Blob
   */
  static async downloadImageAsBlob(imageUrl: string): Promise<Blob> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`❌ Téléchargement image échoué (${response.status})`);
    }
    return response.blob();
  }
}