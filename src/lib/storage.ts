import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Fora de public/: `next start` não serve arquivos escritos em public/ depois que o
// servidor sobe (o diretório estático é resolvido na inicialização), então servimos
// esses uploads por uma rota dinâmica (src/app/uploads/[filename]/route.ts) em vez de
// depender do serving estático do Next.
export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");

export class UploadError extends Error {}

function safeExtension(contentType: string, filename: string) {
  const fromName = path.extname(filename).replace(".", "").toLowerCase();
  if (fromName) return fromName;
  return contentType.split("/")[1] ?? "jpg";
}

/**
 * Salva uma imagem enviada pelo usuário e retorna a URL pública.
 *
 * Em produção (Vercel), configure BLOB_READ_WRITE_TOKEN e o upload vai para o
 * Vercel Blob. Sem o token (dev local ou qualquer host com filesystem persistente),
 * grava em storage/uploads e é servido por /uploads/[filename] — não serve para
 * deploy serverless sem disco persistente (ex: Vercel sem o token configurado).
 */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError("Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Imagem muito grande. O limite é 5MB.");
  }

  const ext = safeExtension(file.type, file.name);
  const filename = `${crypto.randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
