"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/ForumCreate.module.css"

export default function CrearTema({ categories }) {
  const router = useRouter()
  const { session, loading } = useSession()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/login?redirect=/foro/crear")
    }
  }, [session, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !categoryId) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category_id: categoryId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error al crear el tema")
      }

      const data = await res.json()
      router.push(`/foro/${data.topic.id}`)
    } catch (error) {
      console.error("Error creating topic:", error)
      setError(error.message || "Ocurrió un error al crear el tema")
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!session) {
    return null // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Crear Nuevo Tema | Foro de Astronomía</title>
        <meta name="description" content="Crear un nuevo tema en el foro de astronomía" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Crear Nuevo Tema</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Título:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título descriptivo"
              required
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Categoría:
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              Contenido:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido de tu tema"
              rows={10}
              required
              className={styles.textarea}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Creando..." : "Crear Tema"}
            </button>
            <Link href="/foro" className={styles.cancelButton}>
              Cancelar
            </Link>
          </div>
        </form>
      </main>

      <footer className={styles.footer}>
        <Link href="/foro" className={styles.backLink}>
          &larr; Volver al foro
        </Link>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  // Fetch categories from the API
  let categories = []

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`)
    const data = await res.json()
    categories = data.categories || []
  } catch (error) {
    console.error("Error fetching categories:", error)
  }

  return {
    props: {
      categories,
    },
  }
}
