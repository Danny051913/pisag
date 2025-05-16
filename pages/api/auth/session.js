import { verify } from "jsonwebtoken"
import db from "../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  // Get token from cookies
  const { auth_token } = req.cookies

  if (!auth_token) {
    return res.status(200).json({ user: null })
  }

  try {
    // Verify token
    const decoded = verify(auth_token, process.env.JWT_SECRET)

    // Get user from database
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id])

    if (users.length === 0) {
      return res.status(200).json({ user: null })
    }

    const user = users[0]

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Session verification error:", error)
    return res.status(200).json({ user: null })
  }
}
