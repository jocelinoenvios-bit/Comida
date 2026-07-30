"use client";

import { useState, useTransition } from "react";
import { StarRatingInput } from "./ui/star-rating";
import { Button } from "./ui/button";
import { createReview } from "@/server/actions/reviews";
import { useRouter } from "next/navigation";

export function ReviewForm({ orderId }: { orderId: string }) {
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit() {
    if (!food || !service || !delivery) {
      setError("Avalie comida, atendimento e entrega.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await createReview({ orderId, foodRating: food, serviceRating: service, deliveryRating: delivery, comment });
      if (!res.ok) {
        setError(res.message || "Não foi possível enviar sua avaliação.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Avalie seu pedido</h2>
      <div className="space-y-4">
        <StarRatingInput label="Comida" value={food} onChange={setFood} />
        <StarRatingInput label="Atendimento" value={service} onChange={setService} />
        <StarRatingInput label="Entrega" value={delivery} onChange={setDelivery} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte como foi sua experiência (opcional)"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-brand-400"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleSubmit} disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </div>
    </div>
  );
}
