"use server"

import type { FormState } from "@/lib/types"
import { parseContactForm, type ContactField } from "@/lib/validation"

export async function sendContactMessage(
  _prev: FormState<ContactField>,
  formData: FormData
): Promise<FormState<ContactField>> {
  const parsed = parseContactForm(formData)
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifică datele introduse.",
      errors: parsed.errors,
      values: parsed.values,
    }
  }

  // TODO: integrate with a backend (email, CRM etc.) using `parsed.data`.
  return {
    status: "success",
    message:
      "Mesajul este valid. Trimiterea efectivă va fi activată în curând.",
  }
}
