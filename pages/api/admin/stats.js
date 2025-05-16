import db from "../../../lib/db"
import { withAdmin } from "../../../lib/auth-middleware"

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Get all counts in a single query for better performance
    const [[counts]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as userCount,
        (SELECT COUNT(*) FROM news) as newsCount,
        (SELECT COUNT(*) FROM forum_topics) as forumTopicsCount,
        (SELECT COUNT(*) FROM gallery_images) as imagesCount,
        (SELECT COUNT(*) FROM quizzes) as quizzesCount,
        (SELECT COUNT(*) FROM information_topics) as informationTopicsCount
    `)

    return res.status(200).json({ 
      stats: counts,
      admin: req.user // Include admin user info
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return res.status(500).json({ message: "Error fetching admin stats" })
  }
}

// Use the new withAdmin middleware
export default withAdmin(handler)
