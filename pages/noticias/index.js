"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useSession } from "../../lib/auth"
import styles from "../../styles/News.module.css"

export default function Noticias({ initialNews, totalPages }) {
  const { session } = useSession()
  const [news, setNews] = useState(initialNews)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchNews = async (page) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/news?page=${page}&limit=10`)
      const data = await res.json()
      setNews(data.news)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    fetchNews(page)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Noticias de Astronomía</title>
        <meta name="description" content="Últimas noticias sobre astronomía y espacio" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Noticias de Astronomía</h1>

        <p className={styles.description}>
          Mantente al día con los últimos descubrimientos, misiones espaciales y eventos astronómicos.
        </p>

        {session && session.user.role === "admin" && (
          <div className={styles.adminActions}>
            <Link href="/admin/noticias/crear" className={styles.button}>
              Crear Nueva Noticia
            </Link>
          </div>
        )}

        <div className={styles.newsGrid}>
          {news.map((item) => (
            <article key={item.id} className={styles.newsCard}>
              <Link href={`/noticias/${item.id}`}>
                <h2 className={styles.newsTitle}>{item.title}</h2>
              </Link>
              <p className={styles.newsSummary}>{item.summary}</p>
              <div className={styles.newsFooter}>
                <span className={styles.newsDate}>{new Date(item.created_at).toLocaleDateString("es-ES")}</span>
                <Link href={`/noticias/${item.id}`} className={styles.readMore}>
                  Leer más
                </Link>
              </div>
            </article>
          ))}
        </div>

        {news.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p>No hay noticias disponibles en este momento.</p>
          </div>
        )}

        {loading && <div className={styles.loading}>Cargando...</div>}

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
  // Fetch news from the API
  let initialNews = []
  let totalPages = 1

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/news?page=1&limit=10`)
    const data = await res.json()
    initialNews = data.news || []
    totalPages = data.totalPages || 1
  } catch (error) {
    console.error("Error fetching news:", error)
  }

  return {
    props: {
      initialNews,
      totalPages,
    },
  }
}
