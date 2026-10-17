// Generates a passwordHash for an ADMIN user, to paste into Prisma Studio.
// Usage: bun run admin:hash-password
import { hashPassword } from "../lib/password"

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const { stdin, stdout } = process
    stdout.write(question)
    stdin.setRawMode?.(true)
    stdin.setEncoding("utf8")
    stdin.resume()

    let value = ""
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") process.exit(130) // Ctrl+C
        if (char === "\r" || char === "\n") {
          stdin.off("data", onData)
          stdin.setRawMode?.(false)
          stdin.pause()
          stdout.write("\n")
          resolve(value)
          return
        }
        value = char === "\u007f" ? value.slice(0, -1) : value + char
      }
    }
    stdin.on("data", onData)
  })
}

const password = await askHidden("Parolă nouă: ")
if (password.length < 12) {
  console.error("Parola trebuie să aibă cel puțin 12 caractere.")
  process.exit(1)
}
if ((await askHidden("Confirmă parola: ")) !== password) {
  console.error("Parolele nu coincid.")
  process.exit(1)
}

console.log("\nCopiază valoarea în câmpul passwordHash al utilizatorului:\n")
console.log(await hashPassword(password))
