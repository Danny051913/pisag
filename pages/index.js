"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../lib/auth"
import styles from "../styles/Home.module.css"

export default function Home({ latestNews }) {
  const { session, loading } = useSession()
  const router = useRouter()
  const [featuredImage, setFeaturedImage] = useState(null)

  useEffect(() => {
    // Fetch a random featured image
    fetch("/api/gallery/featured")
      .then((res) => res.json())
      .then((data) => {
        if (data.image) {
          setFeaturedImage(data.image)
        }
      })
      .catch((err) => console.error("Error fetching featured image:", err))
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Portal de Astronomía</title>
        <meta name="description" content="Portal de noticias y recursos sobre astronomía" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Bienvenido al Portal de Astronomía</h1>

        <div className={styles.hero}>
          {featuredImage && (
            <div className={styles.featuredImage}>
              <img
                src={featuredImage.url || "/placeholder.svg"}
                alt={featuredImage.title}
                className={styles.heroImage}
              />
              <p className={styles.imageCaption}>{featuredImage.title}</p>
            </div>
          )}
          <div className={styles.heroContent}>
            <p className={styles.description}>
              Explora el universo con noticias, foros y recursos sobre astronomía, astrofísica y exploración espacial.
            </p>
            {!session && !loading && (
              <div className={styles.cta}>
                <Link href="/auth/register" className={styles.button}>
                  Regístrate
                </Link>
                <Link href="/auth/login" className={styles.buttonOutline}>
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Últimas Noticias</h2>
          <div className={styles.grid}>
            {latestNews &&
              latestNews.map((news) => (
                <Link href={`/noticias/${news.id}`} key={news.id} className={styles.card}>
                  <h3>{news.title}</h3>
                  <p>{news.summary}</p>
                  <small className={styles.date}>{new Date(news.created_at).toLocaleDateString("es-ES")}</small>
                </Link>
              ))}
            <Link href="/noticias" className={styles.card}>
              <h3>Ver todas las noticias &rarr;</h3>
              <p>Accede a nuestro archivo completo de noticias astronómicas.</p>
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Explora</h2>
          <div className={styles.grid}>
            <Link href="/foro" className={styles.card}>
              <h3>Foro de Discusión &rarr;</h3>
              <p>Participa en conversaciones sobre astronomía con otros entusiastas.</p>
            </Link>
            <Link href="/galeria" className={styles.card}>
              <h3>Galería de Imágenes &rarr;</h3>
              <p>Explora impresionantes imágenes del cosmos.</p>
            </Link>
            <Link href="/tests" className={styles.card}>
              <h3>Tests de Conocimiento &rarr;</h3>
              <p>Pon a prueba tus conocimientos sobre astronomía.</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Portal de Astronomía © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  // Fetch latest news from the API
  let latestNews = []

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/news?limit=3`)
    const data = await res.json()
    latestNews = data.news || []
  } catch (error) {
    console.error("Error fetching news:", error)
  }

  return {
    props: {
      latestNews,
    },
  }
}
