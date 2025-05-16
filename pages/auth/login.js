"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Auth.module.css"

export default function Login() {
  const router = useRouter()
  const { session, loading, login } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { redirect } = router.query

  // Redirect if already logged in
  useEffect(() => {
    if (session && !loading) {
      router.push(redirect || "/")
    }
  }, [session, loading, router, redirect])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Por favor ingresa tu email y contraseña")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const success = await login(email, password)

      if (success) {
        router.push(redirect || "/")
      } else {
        setError("Email o contraseña incorrectos")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Ocurrió un error al iniciar sesión")
      setIsSubmitting(false)
    }
  }

  if (loading || session) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Iniciar Sesión | Portal de Astronomía</title>
        <meta name="description" content="Inicia sesión en el Portal de Astronomía" />
      </Head>

      <main className={styles.main}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Iniciar Sesión</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className={styles.authLinks}>
            <p>
              ¿No tienes una cuenta?{" "}
              <Link href={`/auth/register${redirect ? `?redirect=${redirect}` : ""}`} className={styles.authLink}>
                Regístrate
              </Link>
            </p>
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
