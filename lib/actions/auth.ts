"use server"

import { redirect } from "next/navigation"

import { createSession, deleteSession, verifyCredentials } from "@/lib/auth"
import type { FormState } from "@/lib/types"

export async function login(
  _prev: FormState<"email">,
  formData: FormData
): Promise<FormState<"email">> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const userId =
    email && password ? await verifyCredentials(email, password) : null
  if (userId === null) {
    // Slow down repeated guessing.
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      status: "error",
      message: "Email sau parolă incorecte.",
      values: { email },
    }
  }

  await createSession(userId)
  redirect("/dash")
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/dash/login")
}
