import db from "../../../lib/db"
import { verifyToken } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return getCategories(req, res)
    case "POST":
      return createCategory(req, res)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get all categories
async function getCategories(req, res) {
  try {
    const [categories] = await db.query("SELECT * FROM categories ORDER BY name")

    return res.status(200).json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return res.status(500).json({ message: "Error fetching categories" })
  }
}

// Create a new category (admin only)
async function createCategory(req, res) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const { name, slug, description } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" })
    }

    // Check if slug already exists
    const [existingCategories] = await db.query("SELECT id FROM categories WHERE slug = ?", [slug])

    if (existingCategories.length > 0) {
      return res.status(409).json({ message: "Category with this slug already exists" })
    }

    const [result] = await db.query("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)", [
      name,
      slug,
      description || null,
    ])

    const [newCategory] = await db.query("SELECT * FROM categories WHERE id = ?", [result.insertId])

    return res.status(201).json(newCategory[0])
  } catch (error) {
    console.error("Error creating category:", error)
    return res.status(500).json({ message: "Error creating category" })
  }
}
