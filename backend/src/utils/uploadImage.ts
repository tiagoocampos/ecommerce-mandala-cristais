import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

// Limite de fotos ADICIONAIS por produto (total = 1 principal + 8).
// Manter igual a MAX_EXTRA_IMAGES em frontend/src/lib/productImages.ts
export const MAX_EXTRA_IMAGES = 8;

/** Sobe a imagem para o Cloudinary (pasta "products") e devolve a secure_url. */
export async function uploadImage(buffer: Buffer, originalName: string): Promise<string> {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "products",
                resource_type: "image",
                public_id: `${Date.now()}-${originalName.split(".")[0]}`,
            },
            (error, result) => {
                if (error || !result) reject(error ?? new Error("Upload sem resposta"));
                else resolve(result as { secure_url: string });
            }
        );
        Readable.from(buffer).pipe(uploadStream);
    });
    return result.secure_url;
}

/**
 * public_id a partir da URL do Cloudinary:
 * .../upload/v1699999999/products/1699999999-nome.jpg → products/1699999999-nome
 */
export function publicIdFromUrl(url: string): string | null {
    const marker = "/upload/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    const path = url.slice(index + marker.length).replace(/^v\d+\//, "");
    const withoutExtension = path.replace(/\.[a-z0-9]+$/i, "");
    return decodeURIComponent(withoutExtension) || null;
}

/** Apaga do Cloudinary (best-effort: falha é só logada, não derruba a operação). */
export async function deleteImageByUrl(url: string): Promise<void> {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
        console.error(`[imagens] Falha ao apagar ${publicId} no Cloudinary:`, error);
    }
}
