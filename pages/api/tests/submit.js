import db from "../../../lib/db" 

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()
  const { userId, testId, answers, score } = req.body
  try {
    await db.query(
      "INSERT INTO test_results (user_id, test_id, answers, score) VALUES (?, ?, ?, ?)",
      [userId, testId, JSON.stringify(answers), score]
    )
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: "Error al guardar el resultado" })
  }
}