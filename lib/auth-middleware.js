import { verify } from "jsonwebtoken"
import db from "./db"

// Verify JWT token from cookies
export async function verifyToken(req) {
  try {
    const { auth_token } = req.cookies

    if (!auth_token) {
      return null
    }

    // Verify token
    const decoded = verify(auth_token, process.env.JWT_SECRET)

    // Get user from database
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id])

    if (users.length === 0) {
      return null
    }

    return users[0]
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Middleware to protect routes
export async function withAuth(handler) {
  return async (req, res) => {
    const user = await verifyToken(req)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    req.user = user
    return handler(req, res)
  }
}

// Middleware to protect admin routes
export async function withAdmin(handler) {
  return async (req, res) => {
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" })
    }

    req.user = user
    return handler(req, res)
  }
}

// Middleware to optionally include user data
export async function withOptionalAuth(handler) {
  return async (req, res) => {
    const user = await verifyToken(req)
    req.user = user || null
    return handler(req, res)
  }
}
