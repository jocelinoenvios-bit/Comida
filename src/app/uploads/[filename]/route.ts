import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { LOCAL_UPLOADS_DIR } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// UUID + extensão — o mesmo formato gerado em uploadImage(). Rejeita qualquer coisa
// fora desse padrão (evita path traversal via nome de arquivo arbitrário).
const SAFE_FILENAME = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|gif)$/i;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: "Nome de arquivo inválido." }, { status: 400 });
  }

  const ext = filename.split(".").pop()!.toLowerCase();

  try {
    const data = await readFile(path.join(LOCAL_UPLOADS_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }
}
