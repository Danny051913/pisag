import db from "../../../../lib/db"
import { verifyToken } from "../../../../lib/auth-middleware"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { id } = req.query

  try {
    // Verify token
    const user = await verifyToken(req)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Check if topic exists
    const [topics] = await db.query("SELECT id FROM forum_topics WHERE id = ?", [id])

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    const { content } = req.body

    if (!content) {
      return res.status(400).json({ message: "Content is required" })
    }

    // Create reply
    const [result] = await db.query("INSERT INTO forum_replies (topic_id, content, author_id) VALUES (?, ?, ?)", [
      id,
      content,
      user.id,
    ])

    // Update topic's reply count and last activity
    await db.query("UPDATE forum_topics SET reply_count = reply_count + 1, last_activity = NOW() WHERE id = ?", [id])

    // Get the created reply
    const [replies] = await db.query(
      `SELECT r.*, u.name as author_name
       FROM forum_replies r
       LEFT JOIN users u ON r.author_id = u.id
       WHERE r.id = ?`,
      [result.insertId],
    )

    return res.status(201).json({ reply: replies[0] })
  } catch (error) {
    console.error("Error creating reply:", error)
    return res.status(500).json({ message: "Error creating reply" })
  }
}
