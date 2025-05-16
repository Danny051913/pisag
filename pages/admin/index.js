"use client"

import { useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Admin.module.css"

export default function AdminDashboard({ stats }) {
  const router = useRouter()
  const { session, loading } = useSession()

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!session || session.user.role !== "admin")) {
      router.push("/")
    }
  }, [session, loading, router])

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!session || session.user.role !== "admin") {
    return null // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Panel de Administración | Portal de Astronomía</title>
        <meta name="description" content="Panel de administración del Portal de Astronomía" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Panel de Administración</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h2 className={styles.statTitle}>Usuarios</h2>
            <p className={styles.statValue}>{stats.userCount}</p>
            <Link href="/admin/usuarios" className={styles.statLink}>
              Ver usuarios
            </Link>
          </div>

          <div className={styles.statCard}>
            <h2 className={styles.statTitle}>Noticias</h2>
            <p className={styles.statValue}>{stats.newsCount}</p>
            <Link href="/admin/noticias" className={styles.statLink}>
              Gestionar noticias
            </Link>
          </div>

          <div className={styles.statCard}>
            <h2 className={styles.statTitle}>Temas del Foro</h2>
            <p className={styles.statValue}>{stats.forumTopicsCount}</p>
            <Link href="/admin/foro" className={styles.statLink}>
              Gestionar foro
            </Link>
          </div>

          <div className={styles.statCard}>
            <h2 className={styles.statTitle}>Imágenes</h2>
            <p className={styles.statValue}>{stats.imagesCount}</p>
            <Link href="/admin/galeria" className={styles.statLink}>
              Gestionar galería
            </Link>
          </div>

          <div className={styles.statCard}>
            <h2 className={styles.statTitle}>Tests</h2>
            <p className={styles.statValue}>{stats.quizzesCount}</p>
            <Link href="/admin/tests" className={styles.statLink}>
              Gestionar tests
            </Link>
          </div>
        </div>

        <div className={styles.adminActions}>
          <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>

          <div className={styles.actionsGrid}>
            <Link href="/admin/noticias/crear" className={styles.actionCard}>
              <h3 className={styles.actionTitle}>Crear Noticia</h3>
              <p className={styles.actionDescription}>Publica una nueva noticia en el portal</p>
            </Link>

            <Link href="/admin/galeria/subir" className={styles.actionCard}>
              <h3 className={styles.actionTitle}>Subir Imagen</h3>
              <p className={styles.actionDescription}>Añade una nueva imagen a la galería</p>
            </Link>

            <Link href="/admin/tests/crear" className={styles.actionCard}>
              <h3 className={styles.actionTitle}>Crear Test</h3>
              <p className={styles.actionDescription}>Crea un nuevo test de conocimientos</p>
            </Link>

            <Link href="/admin/informacion/crear" className={styles.actionCard}>
              <h3 className={styles.actionTitle}>Añadir Contenido</h3>
              <p className={styles.actionDescription}>Añade nuevo contenido educativo</p>
            </Link>
          </div>
        </div>
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
  // Fetch admin dashboard stats
  let stats = {
    userCount: 0,
    newsCount: 0,
    forumTopicsCount: 0,
    imagesCount: 0,
    quizzesCount: 0,
    informationTopicsCount: 0,
  }

  try {
    const res = await fetch("http://localhost:3000/api/admin/stats")
    const data = await res.json()
    stats = data.stats
  } catch (error) {
    console.error("Error fetching admin stats:", error)
  }

  return {
    props: {
      stats,
    },
  }
}
