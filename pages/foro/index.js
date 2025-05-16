"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Forum.module.css"

export default function Foro({ initialTopics, categories, totalPages }) {
  const router = useRouter()
  const { session } = useSession()
  const [topics, setTopics] = useState(initialTopics)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchTopics = async (page, category = "") => {
    setLoading(true)
    try {
      const url = `/api/forum?page=${page}&limit=10${category ? `&category=${category}` : ""}`
      const res = await fetch(url)
      const data = await res.json()
      setTopics(data.topics)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching topics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    fetchTopics(page, selectedCategory)
  }

  const handleCategoryChange = (e) => {
    const category = e.target.value
    setSelectedCategory(category)
    fetchTopics(1, category)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Foro de Astronomía</title>
        <meta name="description" content="Foro de discusión sobre astronomía y espacio" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Foro de Astronomía</h1>

        <p className={styles.description}>
          Participa en conversaciones sobre astronomía, comparte tus conocimientos y resuelve tus dudas.
        </p>

        <div className={styles.actions}>
          {session ? (
            <Link href="/foro/crear" className={styles.button}>
              Crear Nuevo Tema
            </Link>
          ) : (
            <Link href="/auth/login" className={styles.button}>
              Inicia sesión para participar
            </Link>
          )}

          <div className={styles.filter}>
            <label htmlFor="category" className={styles.filterLabel}>
              Filtrar por categoría:
            </label>
            <select id="category" value={selectedCategory} onChange={handleCategoryChange} className={styles.select}>
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.topicsContainer}>
          <div className={styles.topicsHeader}>
            <span className={styles.topicTitle}>Tema</span>
            <span className={styles.topicAuthor}>Autor</span>
            <span className={styles.topicReplies}>Respuestas</span>
            <span className={styles.topicDate}>Última actividad</span>
          </div>

          {topics.map((topic) => (
            <div key={topic.id} className={styles.topicRow}>
              <div className={styles.topicInfo}>
                <Link href={`/foro/${topic.id}`} className={styles.topicTitle}>
                  {topic.title}
                </Link>
                <span className={styles.topicCategory}>{topic.category_name}</span>
              </div>
              <span className={styles.topicAuthor}>{topic.author_name}</span>
              <span className={styles.topicReplies}>{topic.reply_count}</span>
              <span className={styles.topicDate}>{new Date(topic.last_activity).toLocaleDateString("es-ES")}</span>
            </div>
          ))}

          {topics.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>No hay temas disponibles en este momento.</p>
              {session && <p>¡Sé el primero en crear un tema de discusión!</p>}
            </div>
          )}

          {loading && <div className={styles.loading}>Cargando...</div>}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              &laquo; Anterior
            </button>

            <span className={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              Siguiente &raquo;
            </button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          &larr; Volver al inicio
        </Link>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  // Fetch forum topics and categories from the API
  let initialTopics = []
  let categories = []
  let totalPages = 1

  try {
    const [topicsRes, categoriesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/forum?page=1&limit=10`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`),
    ])

    const topicsData = await topicsRes.json()
    const categoriesData = await categoriesRes.json()

    initialTopics = topicsData.topics || []
    totalPages = topicsData.totalPages || 1
    categories = categoriesData.categories || []
  } catch (error) {
    console.error("Error fetching forum data:", error)
  }

  return {
    props: {
      initialTopics,
      categories,
      totalPages,
    },
  }
}
