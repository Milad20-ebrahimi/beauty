"use server";
import { clearAdminSession, clearCustomerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export async function logoutFromHeader() { await Promise.all([clearAdminSession(),clearCustomerSession()]); redirect("/"); }
