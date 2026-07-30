import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage, UploadError } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  try {
    const url = await uploadImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload failed", error);
    return NextResponse.json({ error: "Falha ao enviar imagem. Tente novamente." }, { status: 500 });
  }
}
