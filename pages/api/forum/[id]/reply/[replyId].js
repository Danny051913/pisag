import db from "../../../../../lib/db"
import { verifyToken } from "../../../../../lib/auth-middleware"

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { id, replyId } = req.query

  try {
    // Verify token
    const user = await verifyToken(req)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Check if reply exists and if user is author or admin
    const [replies] = await db.query("SELECT author_id FROM forum_replies WHERE id = ? AND topic_id = ?", [replyId, id])

    if (replies.length === 0) {
      return res.status(404).json({ message: "Reply not found" })
    }

    if (replies[0].author_id !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Delete reply
    await db.query("DELETE FROM forum_replies WHERE id = ?", [replyId])

    // Update topic's reply count
    await db.query("UPDATE forum_topics SET reply_count = reply_count - 1 WHERE id = ?", [id])

    return res.status(200).json({ message: "Reply deleted successfully" })
  } catch (error) {
    console.error("Error deleting reply:", error)
    return res.status(500).json({ message: "Error deleting reply" })
  }
}
