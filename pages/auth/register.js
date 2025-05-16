"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "../../lib/auth"
import styles from "../../styles/Auth.module.css"

export default function Register() {
  const router = useRouter()
  const { session, loading, register } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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

    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const success = await register(name, email, password)

      if (success) {
        router.push(redirect || "/")
      } else {
        setError("No se pudo crear la cuenta. El email podría estar en uso.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Ocurrió un error al crear la cuenta")
      setIsSubmitting(false)
    }
  }

  if (loading || session) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Registro | Portal de Astronomía</title>
        <meta name="description" content="Regístrate en el Portal de Astronomía" />
      </Head>

      <main className={styles.main}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Crear Cuenta</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Nombre:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>

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
                placeholder="Al menos 6 caracteres"
                required
                minLength={6}
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Contraseña:
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className={styles.authLinks}>
            <p>
              ¿Ya tienes una cuenta?{" "}
              <Link href={`/auth/login${redirect ? `?redirect=${redirect}` : ""}`} className={styles.authLink}>
                Inicia sesión
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
