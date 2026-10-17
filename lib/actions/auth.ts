"use server"

import { redirect } from "next/navigation"

import { createSession, deleteSession, verifyCredentials } from "@/lib/auth"
import type { FormState } from "@/lib/types"

export async function login(
  _prev: FormState<"username">,
  formData: FormData
): Promise<FormState<"username">> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!verifyCredentials(username, password)) {
    // Slow down repeated guessing.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      status: "error",
      message: "Utilizator sau parolă incorecte.",
      values: { username },
    }
  }

  await createSession()
  redirect("/dash")
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/dash/login")
}
