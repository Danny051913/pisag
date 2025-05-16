import db from "../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Get a random featured image
    const [images] = await db.query(
      `SELECT i.*, c.name as category_name
       FROM gallery_images i
       LEFT JOIN categories c ON i.category_id = c.id
       ORDER BY RAND()
       LIMIT 1`,
    )

    if (images.length === 0) {
      return res.status(404).json({ message: "No images found" })
    }

    return res.status(200).json({ image: images[0] })
  } catch (error) {
    console.error("Error fetching featured image:", error)
    return res.status(500).json({ message: "Error fetching featured image" })
  }
}
