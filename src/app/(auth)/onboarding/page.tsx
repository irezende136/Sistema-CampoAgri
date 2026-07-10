import { redirect } from "next/navigation";
import { getOrgContext, requireTermsAccepted } from "@/lib/auth/context";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export default async function OnboardingPage() {
  await requireTermsAccepted("/onboarding");
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  if (ctx.organizationId) redirect("/dashboard");

  return <OnboardingForm />;
}
