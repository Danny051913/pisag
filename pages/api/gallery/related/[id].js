import db from "../../../../lib/db"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { id } = req.query
  const limit = Number.parseInt(req.query.limit) || 4

  try {
    // Get the category of the current image
    const [currentImage] = await db.query("SELECT category_id FROM gallery_images WHERE id = ?", [id])

    if (currentImage.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    const categoryId = currentImage[0].category_id

    // Get related images from the same category, excluding the current image
    const [images] = await db.query(
      `SELECT i.*, c.name as category_name
       FROM gallery_images i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.category_id = ? AND i.id != ?
       ORDER BY RAND()
       LIMIT ?`,
      [categoryId, id, limit],
    )

    return res.status(200).json({ images })
  } catch (error) {
    console.error("Error fetching related images:", error)
    return res.status(500).json({ message: "Error fetching related images" })
  }
}
