import { requireMerchantEstablishment } from "@/server/merchant";
import type { OpeningHours } from "@/lib/constants";
import { HoursForm } from "./hours-form";

export const metadata = { title: "Horário de funcionamento" };

export default async function PainelHorarioPage() {
  const { establishment } = await requireMerchantEstablishment();
  const hours = JSON.parse(establishment.openingHoursJson) as OpeningHours;

  return <HoursForm establishmentId={establishment.id} initial={hours} />;
}
