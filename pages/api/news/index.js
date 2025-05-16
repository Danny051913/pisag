import db from "../../../lib/db"
import { verifyToken } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return getNews(req, res)
    case "POST":
      return createNews(req, res)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get news with pagination
async function getNews(req, res) {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const categoryId = req.query.category || null

  try {
    let query = `
      SELECT n.*, u.name as author_name, c.name as category_name
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
    `
    let countQuery = `SELECT COUNT(*) as total FROM news`
    const queryParams = []

    if (categoryId) {
      query += ` WHERE n.category_id = ?`
      countQuery += ` WHERE category_id = ?`
      queryParams.push(categoryId)
    }

    query += ` ORDER BY n.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(limit, offset)

    const [news] = await db.query(query, queryParams)
    const [countResult] = await db.query(countQuery, categoryId ? [categoryId] : [])

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      news,
      page,
      totalPages,
      totalItems: total,
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return res.status(500).json({ message: "Error fetching news" })
  }
}

// Create a new news article (admin only)
async function createNews(req, res) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const { title, summary, content, image_url, image_caption, category_id } = req.body

    if (!title || !summary || !content) {
      return res.status(400).json({ message: "Title, summary and content are required" })
    }

    const [result] = await db.query(
      `INSERT INTO news (title, summary, content, image_url, image_caption, author_id, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, summary, content, image_url || null, image_caption || null, user.id, category_id || null],
    )

    const [newNews] = await db.query(
      `SELECT n.*, u.name as author_name, c.name as category_name
       FROM news n
       LEFT JOIN users u ON n.author_id = u.id
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`,
      [result.insertId],
    )

    return res.status(201).json(newNews[0])
  } catch (error) {
    console.error("Error creating news:", error)
    return res.status(500).json({ message: "Error creating news" })
  }
}
