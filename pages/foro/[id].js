"use client"

import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/ForumTopic.module.css"

export default function ForoTema({ initialTopic, initialReplies }) {
  const router = useRouter()
  const { session } = useSession()
  const [topic, setTopic] = useState(initialTopic)
  const [replies, setReplies] = useState(initialReplies)
  const [newReply, setNewReply] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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
          <Link href="/foro" className={styles.backLink}>
            &larr; Volver al foro
          </Link>
        </main>
      </div>
    )
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()

    if (!session) {
      router.push("/auth/login")
      return
    }

    if (!newReply.trim()) {
      setError("La respuesta no puede estar vacía")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/forum/${topic.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newReply }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error al enviar la respuesta")
      }

      const data = await res.json()

      // Add the new reply to the list
      setReplies([...replies, data.reply])
      setNewReply("")

      // Update the topic's reply count and last activity
      setTopic({
        ...topic,
        reply_count: topic.reply_count + 1,
        last_activity: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error submitting reply:", error)
      setError(error.message || "Ocurrió un error al enviar tu respuesta")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const res = await fetch(`/api/forum/${topic.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error al eliminar el tema")
      }

      router.push("/foro")
    } catch (error) {
      console.error("Error deleting topic:", error)
      alert(error.message || "Ocurrió un error al eliminar el tema")
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta respuesta? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const res = await fetch(`/api/forum/${topic.id}/reply/${replyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Error al eliminar la respuesta")
      }

      // Remove the deleted reply from the list
      setReplies(replies.filter((reply) => reply.id !== replyId))

      // Update the topic's reply count
      setTopic({
        ...topic,
        reply_count: topic.reply_count - 1,
      })
    } catch (error) {
      console.error("Error deleting reply:", error)
      alert(error.message || "Ocurrió un error al eliminar la respuesta")
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{topic.title} | Foro de Astronomía</title>
        <meta name="description" content={`Discusión sobre ${topic.title}`} />
      </Head>

      <main className={styles.main}>
        <div className={styles.topicHeader}>
          <h1 className={styles.title}>{topic.title}</h1>
          <div className={styles.topicMeta}>
            <span className={styles.category}>{topic.category_name}</span>
            <span className={styles.author}>
              Creado por <strong>{topic.author_name}</strong>
            </span>
            <span className={styles.date}>
              {new Date(topic.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {session && (session.user.id === topic.author_id || session.user.role === "admin") && (
            <div className={styles.topicActions}>
              <Link href={`/foro/editar/${topic.id}`} className={styles.editButton}>
                Editar
              </Link>
              <button onClick={handleDeleteTopic} className={styles.deleteButton}>
                Eliminar
              </button>
            </div>
          )}
        </div>

        <div className={styles.topicContent}>
          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: topic.content }} />
        </div>

        <div className={styles.repliesSection}>
          <h2 className={styles.repliesTitle}>Respuestas ({topic.reply_count})</h2>

          {replies.length === 0 ? (
            <div className={styles.noReplies}>
              <p>Aún no hay respuestas. ¡Sé el primero en responder!</p>
            </div>
          ) : (
            <div className={styles.repliesList}>
              {replies.map((reply) => (
                <div key={reply.id} className={styles.replyItem}>
                  <div className={styles.replyHeader}>
                    <span className={styles.replyAuthor}>{reply.author_name}</span>
                    <span className={styles.replyDate}>
                      {new Date(reply.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {session && (session.user.id === reply.author_id || session.user.role === "admin") && (
                      <div className={styles.replyActions}>
                        <button onClick={() => handleDeleteReply(reply.id)} className={styles.deleteReplyButton}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.replyContent} dangerouslySetInnerHTML={{ __html: reply.content }} />
                </div>
              ))}
            </div>
          )}

          {session ? (
            <form onSubmit={handleSubmitReply} className={styles.replyForm}>
              <h3 className={styles.replyFormTitle}>Responder</h3>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={5}
                  required
                  className={styles.textarea}
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                {isSubmitting ? "Enviando..." : "Enviar respuesta"}
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <p>Debes iniciar sesión para responder a este tema.</p>
              <Link href={`/auth/login?redirect=/foro/${topic.id}`} className={styles.loginButton}>
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <Link href="/foro" className={styles.backLink}>
          &larr; Volver al foro
        </Link>
      </footer>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const [topicRes, repliesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/forum/${params.id}`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/forum/${params.id}/replies`),
    ])

    if (!topicRes.ok) {
      return { props: { initialTopic: null, initialReplies: [] } }
    }

    const topic = await topicRes.json()
    const repliesData = await repliesRes.json()

    return {
      props: {
        initialTopic: topic,
        initialReplies: repliesData.replies || [],
      },
    }
  } catch (error) {
    console.error("Error fetching topic data:", error)
    return {
      props: {
        initialTopic: null,
        initialReplies: [],
      },
    }
  }
}
