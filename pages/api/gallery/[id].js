import db from "../../../lib/db"
import { verifyToken } from "../../../lib/auth-middleware"

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case "GET":
      return getImageById(req, res, id)
    case "PUT":
      return updateImage(req, res, id)
    case "DELETE":
      return deleteImage(req, res, id)
    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}

// Get a single image by ID
async function getImageById(req, res, id) {
  try {
    const [images] = await db.query(
      `SELECT i.*, c.name as category_name
       FROM gallery_images i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = ?`,
      [id],
    )

    if (images.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    return res.status(200).json(images[0])
  } catch (error) {
    console.error("Error fetching image:", error)
    return res.status(500).json({ message: "Error fetching image" })
  }
}

// Update an image (admin only)
async function updateImage(req, res, id) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const { title, description, url, source, category_id } = req.body

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" })
    }

    // Check if image exists
    const [existingImages] = await db.query("SELECT id FROM gallery_images WHERE id = ?", [id])

    if (existingImages.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    await db.query(
      `UPDATE gallery_images 
       SET title = ?, description = ?, url = ?, source = ?, category_id = ?
       WHERE id = ?`,
      [title, description || null, url, source || null, category_id || null, id],
    )

    const [updatedImage] = await db.query(
      `SELECT i.*, c.name as category_name
       FROM gallery_images i
       LEFT JOIN categories c ON i.category_id = c.id
       WHERE i.id = ?`,
      [id],
    )

    return res.status(200).json(updatedImage[0])
  } catch (error) {
    console.error("Error updating image:", error)
    return res.status(500).json({ message: "Error updating image" })
  }
}

// Delete an image (admin only)
async function deleteImage(req, res, id) {
  try {
    // Verify token and check if user is admin
    const user = await verifyToken(req)

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" })
    }

    // Check if image exists
    const [existingImages] = await db.query("SELECT id FROM gallery_images WHERE id = ?", [id])

    if (existingImages.length === 0) {
      return res.status(404).json({ message: "Image not found" })
    }

    await db.query("DELETE FROM gallery_images WHERE id = ?", [id])

    return res.status(200).json({ message: "Image deleted successfully" })
  } catch (error) {
    console.error("Error deleting image:", error)
    return res.status(500).json({ message: "Error deleting image" })
  }
}
