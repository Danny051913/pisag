import db from "../../../lib/db"
import { withAuth, withOptionalAuth } from "../../../lib/auth-middleware"

// Main handler
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

// Get forum topics with pagination
async function getTopics(req, res) {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit
  const categoryId = req.query.category || null

  try {
    // Build base query
    const baseQuery = `
      FROM forum_topics t
      LEFT JOIN users u ON t.author_id = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      ${categoryId ? 'WHERE t.category_id = ?' : ''}
    `

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      categoryId ? [categoryId] : []
    )

    // Get paginated results
    const [topics] = await db.query(
      `SELECT t.*, 
        u.name as author_name, 
        c.name as category_name
        ${baseQuery}
        ORDER BY t.last_activity DESC 
        LIMIT ? OFFSET ?`,
      [...(categoryId ? [categoryId] : []), limit, offset]
    )

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      topics,
      page,
      totalPages,
      totalItems: total,
      currentUser: req.user // Include current user info if available
    })
  } catch (error) {
    console.error("Error fetching forum topics:", error)
    return res.status(500).json({ message: "Error fetching forum topics" })
  }
}

// Create new topic
async function createTopic(req, res) {
  const { title, content, categoryId } = req.body

  if (!title || !content || !categoryId) {
    return res.status(400).json({ message: "Title, content and category are required" })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO forum_topics (title, content, category_id, author_id, created_at, last_activity) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [title, content, categoryId, req.user.id]
    )

    const [topic] = await db.query(
      `SELECT t.*, u.name as author_name, c.name as category_name
       FROM forum_topics t
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
    console.error("Error creating forum topic:", error)
    return res.status(500).json({ message: "Error creating forum topic" })
  }
}
