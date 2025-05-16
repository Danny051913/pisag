import Head from "next/head"
import Link from "next/link"
import styles from "../../styles/Information.module.css"

export default function Informacion({ topics }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Información Astronómica | Portal de Astronomía</title>
        <meta name="description" content="Recursos educativos sobre astronomía, sistema solar, astrofísica y más" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Información Astronómica</h1>

        <p className={styles.description}>
          Explora nuestros recursos educativos sobre astronomía, sistema solar, astrofísica, misiones espaciales y más.
        </p>

        <div className={styles.topicsGrid}>
          {topics.map((topic) => (
            <Link key={topic.id} href={`/informacion/${topic.slug}`} className={styles.topicCard}>
              {topic.image_url && (
                <div className={styles.topicImageContainer}>
                  <img src={topic.image_url || "/placeholder.svg"} alt={topic.title} className={styles.topicImage} />
                </div>
              )}
              <div className={styles.topicContent}>
                <h2 className={styles.topicTitle}>{topic.title}</h2>
                <p className={styles.topicDescription}>{topic.description}</p>
              </div>
            </Link>
          ))}
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
  // Fetch information topics from the API
  let topics = []

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/information`)
    const data = await res.json()
    topics = data.topics || []
  } catch (error) {
    console.error("Error fetching information topics:", error)
  }

  return {
    props: {
      topics,
    },
  }
}
