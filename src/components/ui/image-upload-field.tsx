"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function ImageUploadField({
  label,
  value,
  onChange,
  aspectClassName = "aspect-video",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar imagem.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-navy-700">{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border-2 border-dashed bg-gray-50",
          aspectClassName,
          dragOver ? "border-brand-400 bg-brand-50" : "border-gray-200",
        )}
      >
        {value ? (
          <>
            <Image src={value} alt={label} fill sizes="400px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy-700 shadow"
              aria-label="Remover imagem"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-brand-500"
          >
            {uploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            <span className="text-xs font-medium">
              {uploading ? "Enviando..." : "Clique ou arraste uma imagem"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <button
        type="button"
        onClick={() => setShowUrlField((s) => !s)}
        className="mt-1.5 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-brand-600"
      >
        <Link2 size={12} /> ou colar uma URL de imagem
      </button>
      {showUrlField && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
      )}
    </div>
  );
}
