import db from "../../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { id } = req.query

  try {
    // Check if topic exists
    const [topics] = await db.query("SELECT id FROM forum_topics WHERE id = ?", [id])

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    // Get replies for the topic
    const [replies] = await db.query(
      `SELECT r.*, u.name as author_name
       FROM forum_replies r
       LEFT JOIN users u ON r.author_id = u.id
       WHERE r.topic_id = ?
       ORDER BY r.created_at ASC`,
      [id],
    )

    return res.status(200).json({ replies })
  } catch (error) {
    console.error("Error fetching replies:", error)
    return res.status(500).json({ message: "Error fetching replies" })
  }
}
