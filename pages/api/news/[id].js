import db from "../../../lib/db"
import { verifyToken } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case "GET":
      return getNewsById(req, res, id)
    case "PUT":
      return updateNews(req, res, id)
    case "DELETE":
      return deleteNews(req, res, id)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get a single news article by ID
async function getNewsById(req, res, id) {
  try {
    const [news] = await db.query(
      `SELECT n.*, u.name as author_name, c.name as category_name
       FROM news n
       LEFT JOIN users u ON n.author_id = u.id
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`,
      [id],
    )

    if (news.length === 0) {
      return res.status(404).json({ message: "News not found" })
    }

    return res.status(200).json(news[0])
  } catch (error) {
    console.error("Error fetching news:", error)
    return res.status(500).json({ message: "Error fetching news" })
  }
}

// Update a news article (admin only)
async function updateNews(req, res, id) {
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

    // Check if news exists
    const [existingNews] = await db.query("SELECT id FROM news WHERE id = ?", [id])

    if (existingNews.length === 0) {
      return res.status(404).json({ message: "News not found" })
    }

    await db.query(
      `UPDATE news 
       SET title = ?, summary = ?, content = ?, image_url = ?, image_caption = ?, category_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, summary, content, image_url || null, image_caption || null, category_id || null, id],
    )

    const [updatedNews] = await db.query(
      `SELECT n.*, u.name as author_name, c.name as category_name
       FROM news n
       LEFT JOIN users u ON n.author_id = u.id
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`,
      [id],
    )

    return res.status(200).json(updatedNews[0])
  } catch (error) {
    console.error("Error updating news:", error)
    return res.status(500).json({ message: "Error updating news" })
  }
}

// Delete a news article (admin only)
async function deleteNews(req, res, id) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    // Check if news exists
    const [existingNews] = await db.query("SELECT id FROM news WHERE id = ?", [id])

    if (existingNews.length === 0) {
      return res.status(404).json({ message: "News not found" })
    }

    await db.query("DELETE FROM news WHERE id = ?", [id])

    return res.status(200).json({ message: "News deleted successfully" })
  } catch (error) {
    console.error("Error deleting news:", error)
    return res.status(500).json({ message: "Error deleting news" })
  }
}
