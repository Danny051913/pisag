"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Tests.module.css"

export default function TestDetail({ test }) {
  const router = useRouter()
  const { session, loading } = useSession() 

  
  if (loading) {
    return <div>Cargando...</div>
  }

  
  if (!session) {
    if (typeof window !== "undefined") {
      router.replace("/auth/login")
    }
    return null
  }}


const TESTS = {
  "astronomia-basica": {
    title: "Test de Astronomía Básica",
    questions: [
      {
        question: "¿Qué estudia la astronomía?",
        options: ["Los océanos y mares de la tierra."
            , "El universo, incluyendo planetas, estrellas y galaxias."
            , "La composición química de los alimentos"
            , "El comportamiento de los seres vivos"],
        answer: 1,
      },
      {
        question: "¿Cuál de los siguientes cuerpos celestes es una estrella?",
        options: [
          "La luna",
          "Marte",
          "El sol",
          "Europa",
        ],
        answer: 2,
      },
      {
        question: "¿Qué rama de la ciencia se encarga de analizar el origen y evolución del universo?",
        options: [
          "Astrobiología",
          "Cosmología",
          "Astrofísica",
          "Geología",
        ],
        answer: 1,
      },
      {
        question: "¿Cuál es el principal objetivo de la astronomia?",
        options: [
          "Estudiar la atmosfera terrestre",
          "Analiazr la estructura interna de la tierra",
          "Investigar el origen, evolución y movimiento de los cuerpos celestes",
          "Desarrollar nuevas tecnologías para la exploración espacial",
        ],
        answer: 2,
      },
      {
        question: "Qué herramienta se utiliza para observar los astros?",
        options: [
          "Telescopio",
          "Microscopio",
          "Espectroscopio",
          "Barómetro",
        ],
        answer: 0,
      }
    ],
  },
}

export default function TestDetail({ test }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!test) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Test no encontrado</title>
        </Head>
        <main className={styles.main}>
          <h1 className={styles.title}>Test no encontrado</h1>
          <Link href="/tests" className={styles.backLink}>
            &larr; Volver a tests
          </Link>
        </main>
      </div>
    )
  }

  const handleOption = (idx) => setSelected(idx)

  const handleNext = () => {
    if (selected === test.questions[current].answer) {
      setScore(score + 1)
    }
    if (current < test.questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{test.title} | Portal de Astronomía</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{test.title}</h1>
        {!finished ? (
          <div className={styles.questionBlock}>
            <h2 className={styles.question}>
              {test.questions[current].question}
            </h2>
            <ul className={styles.options}>
              {test.questions[current].options.map((opt, idx) => (
                <li key={idx}>
                  <button
                    className={`${styles.optionButton} ${selected === idx ? styles.selected : ""}`}
                    onClick={() => handleOption(idx)}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={selected === null}
            >
              {current === test.questions.length - 1 ? "Finalizar" : "Siguiente"}
            </button>
          </div>
        ) : (
          <div className={styles.resultBlock}>
            <h2>¡Test finalizado!</h2>
            <p>
              Puntaje: {score} de {test.questions.length}
            </p>
            <Link href="/tests" className={styles.backLink}>
              &larr; Volver a tests
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const test = TESTS[params.id] || null
  return {
    props: { test },
  }
}