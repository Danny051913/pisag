import { hash } from "bcryptjs"
import { sign } from "jsonwebtoken"
import cookie from "cookie"
import db from "../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" })
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Insert user into database
    const [result] = await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      "user",
    ])

    const userId = result.insertId

    // Get the created user
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [userId])

    const user = users[0]

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      }),
    )

    return res.status(201).json({
      message: "User created successfully",
      user,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
