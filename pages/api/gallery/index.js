import db from "../../../lib/db"
import { withAuth, withOptionalAuth } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return withOptionalAuth(getImages)(req, res)
    case "POST":
      return withAuth(uploadImage)(req, res)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get images with pagination and optional filtering
async function getImages(req, res) {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 12
  const offset = (page - 1) * limit
  const category = req.query.category || null

  try {
    // Build base query
    const baseQuery = `
      FROM gallery_images i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      ${category ? 'WHERE i.category_id = ?' : ''}
    `

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      category ? [category] : []
    )

    // Get paginated results
    const [images] = await db.query(
      `SELECT i.*, 
        u.name as user_name,
        c.name as category_name
        ${baseQuery}
        ORDER BY i.created_at DESC 
        LIMIT ? OFFSET ?`,
      [...(category ? [category] : []), limit, offset]
    )

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return res.status(200).json({
      images,
      page,
      totalPages,
      totalItems: total,
      currentUser: req.user
    })
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return res.status(500).json({ message: "Error fetching gallery images" })
  }
}

// Upload new image
async function uploadImage(req, res) {
  const { title, description, imageUrl, categoryId } = req.body

  if (!title || !imageUrl || !categoryId) {
    return res.status(400).json({ message: "Title, image URL and category are required" })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO gallery_images (title, description, image_url, category_id, user_id, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title, description || null, imageUrl, categoryId, req.user.id]
    )

    const [image] = await db.query(
      `SELECT i.*, u.name as user_name, c.name as category_name
       FROM gallery_images i
       LEFT JOIN users u ON i.user_id = u.id
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = ?`,
      [result.insertId]
    )

    return res.status(201).json({
      message: "Image uploaded successfully",
      image: image[0]
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return res.status(500).json({ message: "Error uploading image" })
  }
}
