import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return { session };
}
