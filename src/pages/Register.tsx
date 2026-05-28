import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    try {
      await api.post('/auth/register', { username, password })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear cuenta')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Ortizello</h1>
        <p style={styles.sub}>Crea tu cuenta</p>
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Confirmar contraseña"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit">Crear cuenta</button>
        </form>
        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#7c6af7' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f1117, #1a1f2e)'
  },
  card: {
    background: '#1e2433', borderRadius: 16,
    padding: '2.5rem', width: '100%', maxWidth: 380,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
  },
  logo: { fontSize: '2rem', fontWeight: 800, color: '#7c6af7', textAlign: 'center' },
  sub: { color: '#64748b', textAlign: 'center', marginBottom: '2rem', marginTop: '0.3rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: {
    padding: '0.75rem 1rem', borderRadius: 8,
    border: '1px solid #2d3748', background: '#0f1117',
    color: '#e2e8f0', fontSize: '0.95rem', outline: 'none'
  },
  btn: {
    padding: '0.75rem', borderRadius: 8, border: 'none',
    background: '#7c6af7', color: 'white',
    fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem'
  },
  error: { color: '#fc8181', fontSize: '0.85rem', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }
}