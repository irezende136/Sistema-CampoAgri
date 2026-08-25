"use client";

import { createContext, useContext } from "react";
import type { OrgRole } from "@/lib/auth/context";
import type { Ctx } from "@/lib/offline/repo";

export type ClientOrgContext = Ctx & { role: OrgRole; email: string | null };

const OrgCtx = createContext<ClientOrgContext | null>(null);

export function OrgContextProvider({
  value,
  children,
}: {
  value: ClientOrgContext;
  children: React.ReactNode;
}) {
  return <OrgCtx.Provider value={value}>{children}</OrgCtx.Provider>;
}

export function useOrgCtx(): ClientOrgContext {
  const ctx = useContext(OrgCtx);
  if (!ctx) throw new Error("useOrgCtx precisa estar dentro de <OrgContextProvider>");
  return ctx;
}
