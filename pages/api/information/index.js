import db from "../../../lib/db"
import { withAuth, withOptionalAuth } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return withOptionalAuth(getTopics)(req, res)
    case "POST":
      return withAuth(createTopic)(req, res)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get information topics with pagination and filtering
async function getTopics(req, res) {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const category = req.query.category || null
  const search = req.query.search || null

  try {
    // Build base query with search functionality
    const baseQuery = `
      FROM information_topics t
      LEFT JOIN users u ON t.author_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
      ${category ? 'AND t.category_id = ?' : ''}
      ${search ? 'AND (t.title LIKE ? OR t.content LIKE ?)' : ''}
    `

    const searchParams = search ? [`%${search}%`, `%${search}%`] : []
    const queryParams = [
      ...(category ? [category] : []),
      ...searchParams
    ]

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      queryParams
    )

    // Get paginated results
    const [topics] = await db.query(
      `SELECT t.*, 
        u.name as author_name,
        c.name as category_name
        ${baseQuery}
        ORDER BY t.created_at DESC 
        LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      topics,
      page,
      totalPages,
      totalItems: total,
      currentUser: req.user
    })
  } catch (error) {
    console.error("Error fetching information topics:", error)
    return res.status(500).json({ message: "Error fetching information topics" })
  }
}

// Create new information topic
async function createTopic(req, res) {
  const { title, content, categoryId, slug } = req.body

  if (!title || !content || !categoryId || !slug) {
    return res.status(400).json({ message: "Title, content, category and slug are required" })
  }

  try {
    // Check if slug is unique
    const [existing] = await db.query(
      "SELECT id FROM information_topics WHERE slug = ?",
      [slug]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: "Slug must be unique" })
    }

    const [result] = await db.query(
      `INSERT INTO information_topics (title, content, slug, category_id, author_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, content, slug, categoryId, req.user.id]
    )

    const [topic] = await db.query(
      `SELECT t.*, u.name as author_name, c.name as category_name
       FROM information_topics t
       LEFT JOIN users u ON t.author_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    )

    return res.status(201).json({
      message: "Topic created successfully",
      topic: topic[0]
    })
  } catch (error) {
    console.error("Error creating information topic:", error)
    return res.status(500).json({ message: "Error creating information topic" })
  }
}
