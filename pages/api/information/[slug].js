import db from "../../../lib/db"
import { verifyToken } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  const { slug } = req.query

  switch (req.method) {
    case "GET":
      return getTopicBySlug(req, res, slug)
    case "PUT":
      return updateTopic(req, res, slug)
    case "DELETE":
      return deleteTopic(req, res, slug)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get a single information topic by slug
async function getTopicBySlug(req, res, slug) {
  try {
    const [topics] = await db.query(
      `
      SELECT t.*, p.title as parent_title
      FROM information_topics t
      LEFT JOIN information_topics p ON t.parent_id = p.id
      WHERE t.slug = ?
    `,
      [slug],
    )

    if (topics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    return res.status(200).json(topics[0])
  } catch (error) {
    console.error("Error fetching information topic:", error)
    return res.status(500).json({ message: "Error fetching information topic" })
  }
}

// Update an information topic (admin only)
async function updateTopic(req, res, slug) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    // Check if topic exists
    const [existingTopics] = await db.query("SELECT id FROM information_topics WHERE slug = ?", [slug])
    
    if (existingTopics.length === 0) {
      return res.status(404).json({ message: "Topic not found" })
    }

    const topicId = existingTopics[0].id
    const { title, newSlug, description, content, image_url, parent_id } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" })
    }

    // If slug is being changed, check if new slug already exists
    if (newSlug && newSlug !== slug) {
      const [existingWithNewSlug] = await db.query(
        "SELECT id FROM information_topics WHERE slug = ? AND id != ?",
        [newSlug, topicId]
      )
      
      if (existingWithNewSlug.length > 0) {\
        return res.status(409).json({ message: "Topic with this slug
