"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Informe seu telefone com DDD.");
      return;
    }
    setError("");
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("phone", { phone, code, name, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Código inválido. Use 0000 (ambiente de demonstração).");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-black text-white">
          B
        </span>
        <h1 className="text-xl font-black text-navy-900">Entrar no {BRAND.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Peça em qualquer estabelecimento de Varjota em segundos.</p>
      </div>

      <Button
        variant="outline"
        className="mb-4 w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.6 7.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.5c-2 1.5-4.6 2.5-7.5 2.5-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.5 40.6 16.2 45 24 45z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.8l6.5 5.5C41.5 36 45 30.5 45 24c0-1.4-.1-2.7-.4-3.5z" />
        </svg>
        Continuar com Google
      </Button>

      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> ou <span className="h-px flex-1 bg-gray-200" />
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-700">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-brand-400"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-navy-700">Telefone</span>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(88) 99999-0000"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 outline-none focus:border-brand-400"
              />
            </div>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Entrar com telefone
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <p className="text-sm text-gray-500">
            Enviamos um código para <strong>{phone}</strong>. Ambiente de demonstração: use <strong>0000</strong>.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="0000"
            maxLength={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-brand-400"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando..." : "Confirmar código"}
          </Button>
          <button type="button" onClick={() => setStep("phone")} className="w-full text-center text-sm text-gray-400">
            Alterar telefone
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
