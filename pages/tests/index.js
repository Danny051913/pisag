"use client"

import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Tests.module.css"

export default function TestsIndex() {
  const router = useRouter()
  const { session } = useSession()
  const [lastScore, setLastScore] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("lastTestScore")
      if (data) {
        setLastScore(JSON.parse(data))
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Tests de Conocimiento | Portal de Astronomía</title>
        <meta name="description" content="Pon a prueba tus conocimientos sobre astronomía." />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Tests de Conocimiento</h1>
        {lastScore && (
          <div className={styles.scoreMessage}>
            Última calificación: {lastScore.score} de {lastScore.total}
          </div>
        )}
        <ul className={styles.testList}>
          <li>
            <Link href="/tests/astronomia-basica" className={styles.testLink}>
              Test de Astronomía Básica
            </Link>
          </li>
        </ul>
      </main>
    </div>
  )
}