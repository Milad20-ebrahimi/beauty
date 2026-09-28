"use server";

import { redirect } from "next/navigation";
import { clearCustomerSession } from "@/lib/auth";

export async function logoutCustomer() {
  await clearCustomerSession();
  redirect("/");
}
