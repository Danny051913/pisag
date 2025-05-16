import db from "../../../../lib/db"
import { verifyToken } from "../../../../lib/auth-middleware"

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case "GET":
      return getTopicById(req, res, id)
    case "PUT":
      return updateTopic(req, res, id)
    case "DELETE":
      return deleteTopic(req, res, id)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get a single forum topic by ID
async function getTopicById(req, res, id) {
  try {
    // Increment view count
    await db.query("UPDATE forum_topics SET view_count = view_count + 1 WHERE id = ?", [id])

    const [topics] = await db.query(
      `SELECT t.*, u.name as author_name, c.name as category_name
       FROM forum_topics t
       LEFT JOIN users u ON t.author_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id],
    )

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    return res.status(200).json(topics[0])
  } catch (error) {
    console.error("Error fetching forum topic:", error)
    return res.status(500).json({ message: "Error fetching forum topic" })
  }
}

// Update a forum topic (author or admin only)
async function updateTopic(req, res, id) {
  try {
    // Verify token
    const user = await verifyToken(req)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Check if topic exists and if user is author or admin
    const [topics] = await db.query("SELECT author_id FROM forum_topics WHERE id = ?", [id])

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    if (topics[0].author_id !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" })
    }

    const { title, content, category_id } = req.body

    if (!title || !content || !category_id) {
      return res.status(400).json({ message: "Title, content and category are required" })
    }

    await db.query(
      `UPDATE forum_topics 
       SET title = ?, content = ?, category_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, content, category_id, id],
    )

    const [updatedTopic] = await db.query(
      `SELECT t.*, u.name as author_name, c.name as category_name
       FROM forum_topics t
       LEFT JOIN users u ON t.author_id = u.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id],
    )

    return res.status(200).json(updatedTopic[0])
  } catch (error) {
    console.error("Error updating forum topic:", error)
    return res.status(500).json({ message: "Error updating forum topic" })
  }
}

// Delete a forum topic (author or admin only)
async function deleteTopic(req, res, id) {
  try {
    // Verify token
    const user = await verifyToken(req)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Check if topic exists and if user is author or admin
    const [topics] = await db.query("SELECT author_id FROM forum_topics WHERE id = ?", [id])

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    if (topics[0].author_id !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Delete topic (replies will be deleted automatically due to CASCADE)
    await db.query("DELETE FROM forum_topics WHERE id = ?", [id])

    return res.status(200).json({ message: "Topic deleted successfully" })
  } catch (error) {
    console.error("Error deleting forum topic:", error)
    return res.status(500).json({ message: "Error deleting forum topic" })
  }
}
