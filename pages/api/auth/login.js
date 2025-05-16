import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import cookie from "cookie"
import db from "../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    // Get user from database
    const [users] = await db.query("SELECT id, name, email, password, role FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    // Compare passwords
    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

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

    // Set cookie with improved security settings
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax", // Changed from strict to lax for better compatibility
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }),
    )

    console.log('aaaaaaaaaaaa', cookie); // This should not be undefined

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token, // Include token in response for client-side storage if needed
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
