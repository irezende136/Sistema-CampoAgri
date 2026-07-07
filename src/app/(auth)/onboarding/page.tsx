import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  if (ctx.organizationId) redirect("/dashboard");

  return <OnboardingForm />;
}
