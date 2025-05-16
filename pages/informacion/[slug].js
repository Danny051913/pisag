"use client"

import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import styles from "../../styles/InformationTopic.module.css"

export default function InformacionTema({ topic, subtopics }) {
  const router = useRouter()

  if (router.isFallback) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!topic) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Tema no encontrado</title>
        </Head>
        <main className={styles.main}>
          <h1 className={styles.title}>Tema no encontrado</h1>
          <p>El tema que buscas no existe o ha sido eliminado.</p>
          <Link href="/informacion" className={styles.backLink}>
            &larr; Volver a información
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{topic.title} | Información Astronómica</title>
        <meta name="description" content={topic.description} />
      </Head>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.header}>
            {topic.image_url && (
              <div className={styles.heroImage}>
                <img src={topic.image_url || "/placeholder.svg"} alt={topic.title} className={styles.topicImage} />
              </div>
            )}

            <h1 className={styles.title}>{topic.title}</h1>
            <p className={styles.description}>{topic.description}</p>
          </header>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: topic.content }} />
        </article>

        {subtopics.length > 0 && (
          <section className={styles.subtopics}>
            <h2 className={styles.subtopicsTitle}>Temas relacionados</h2>

            <div className={styles.subtopicsGrid}>
              {subtopics.map((subtopic) => (
                <Link key={subtopic.id} href={`/informacion/${subtopic.slug}`} className={styles.subtopicCard}>
                  <h3 className={styles.subtopicTitle}>{subtopic.title}</h3>
                  <p className={styles.subtopicDescription}>{subtopic.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <Link href="/informacion" className={styles.backLink}>
          &larr; Volver a información
        </Link>
      </footer>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const [topicRes, subtopicsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/information/${params.slug}`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/information/${params.slug}/related`),
    ])

    if (!topicRes.ok) {
      return { props: { topic: null, subtopics: [] } }
    }

    const topic = await topicRes.json()
    const subtopicsData = await subtopicsRes.json()

    return {
      props: {
        topic,
        subtopics: subtopicsData.topics || [],
      },
    }
  } catch (error) {
    console.error("Error fetching topic data:", error)
    return {
      props: {
        topic: null,
        subtopics: [],
      },
    }
  }
}
