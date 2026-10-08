// Manter igual a MAX_EXTRA_IMAGES em backend/src/utils/uploadImage.ts
export const MAX_EXTRA_IMAGES = 8;

// Mesmos limites do multer no backend
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/** Mensagem de erro se o arquivo não puder ser enviado; null se estiver ok. */
export function validateImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `"${file.name}": use JPEG ou PNG.`;
    if (file.size > MAX_IMAGE_BYTES) return `"${file.name}": cada imagem pode ter no máximo 5 MB.`;
    return null;
}
