"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/NewsDetail.module.css"

export default function NoticiaDetalle({ noticia }) {
  const router = useRouter()
  const { session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)

  if (router.isFallback) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!noticia) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Noticia no encontrada</title>
        </Head>
        <main className={styles.main}>
          <h1 className={styles.title}>Noticia no encontrada</h1>
          <p>La noticia que buscas no existe o ha sido eliminada.</p>
          <Link href="/noticias" className={styles.backLink}>
            &larr; Volver a noticias
          </Link>
        </main>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta noticia?")) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/news/${noticia.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/noticias")
      } else {
        const data = await res.json()
        alert(`Error: ${data.message || "No se pudo eliminar la noticia"}`)
        setIsDeleting(false)
      }
    } catch (error) {
      console.error("Error deleting news:", error)
      alert("Ocurrió un error al eliminar la noticia")
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{noticia.title} | Portal de Astronomía</title>
        <meta name="description" content={noticia.summary} />
      </Head>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{noticia.title}</h1>
            <div className={styles.meta}>
              <time dateTime={noticia.created_at} className={styles.date}>
                {new Date(noticia.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {noticia.category && <span className={styles.category}>{noticia.category}</span>}
            </div>
          </header>

          {noticia.image_url && (
            <div className={styles.imageContainer}>
              <img src={noticia.image_url || "/placeholder.svg"} alt={noticia.title} className={styles.image} />
              {noticia.image_caption && <p className={styles.imageCaption}>{noticia.image_caption}</p>}
            </div>
          )}

          <div className={styles.summary}>{noticia.summary}</div>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: noticia.content }} />

          {session && session.user.role === "admin" && (
            <div className={styles.adminActions}>
              <Link href={`/admin/noticias/editar/${noticia.id}`} className={styles.editButton}>
                Editar
              </Link>
              <button onClick={handleDelete} disabled={isDeleting} className={styles.deleteButton}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          )}
        </article>
      </main>

      <footer className={styles.footer}>
        <Link href="/noticias" className={styles.backLink}>
          &larr; Volver a noticias
        </Link>
      </footer>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/news/${params.id}`)

    if (!res.ok) {
      return { props: { noticia: null } }
    }

    const noticia = await res.json()

    return {
      props: {
        noticia,
      },
    }
  } catch (error) {
    console.error("Error fetching news detail:", error)
    return {
      props: {
        noticia: null,
      },
    }
  }
}
