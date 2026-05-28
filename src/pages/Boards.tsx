import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Board {
  id: number
  title: string
  color: string
  created_at: string
}

const COLORS = ['#7c6af7', '#f75c7c', '#f7a85c', '#5cf7a8', '#5cb8f7', '#c45cf7']

const BG_PATTERNS: Record<string, string> = {
  '#7c6af7': 'linear-gradient(135deg, #1a1035 0%, #2d1b69 50%, #1a1035 100%)',
  '#f75c7c': 'linear-gradient(135deg, #1a0f14 0%, #4a1020 50%, #1a0f14 100%)',
  '#f7a85c': 'linear-gradient(135deg, #1a1208 0%, #4a2e0a 50%, #1a1208 100%)',
  '#5cf7a8': 'linear-gradient(135deg, #081a12 0%, #0a4a2e 50%, #081a12 100%)',
  '#5cb8f7': 'linear-gradient(135deg, #08121a 0%, #0a2e4a 50%, #08121a 100%)',
  '#c45cf7': 'linear-gradient(135deg, #150835 0%, #3d0a69 50%, #150835 100%)',
}

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([])
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#7c6af7')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { loadBoards() }, [])

  async function loadBoards() {
    try {
      const res = await api.get('/boards/')
      setBoards(res.data)
    } catch { logout() }
  }

  async function createBoard(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/boards/', { title, color })
      setBoards([res.data, ...boards])
      setTitle('')
      setShowForm(false)
    } finally { setCreating(false) }
  }

  async function deleteBoard(id: number) {
    if (!confirm('¿Eliminar este tablero?')) return
    await api.delete(`/boards/${id}`)
    setBoards(boards.filter(b => b.id !== id))
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : 'U'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14' }}>
      <nav style={styles.nav}>
        <span style={styles.logo}>⬡ Ortizello</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>+ Nuevo tablero</button>
          <div style={styles.avatar} title={user.username}>{initials}</div>
          <button onClick={logout} style={styles.btnOutline}>Salir</button>
        </div>
      </nav>

      <div style={{ padding: '2.5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: 700 }}>Mis tableros</h2>
          <p style={{ color: '#4a5568', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Hola, <span style={{ color: '#7c6af7' }}>{user.username}</span> — tienes {boards.length} tablero{boards.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={styles.grid} className="boards-grid">
          {boards.map(board => (
            <div
              key={board.id}
              className="board-card"
              style={{
                ...styles.boardCard,
                background: BG_PATTERNS[board.color] || BG_PATTERNS['#7c6af7'],
              }}
            >
              <div onClick={() => navigate(`/board/${board.id}`)} style={{ flex: 1, cursor: 'pointer', padding: '1.25rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: board.color, marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', boxShadow: `0 4px 12px ${board.color}66`
                }}>📋</div>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '0.4rem', fontSize: '1rem' }}>
                  {board.title}
                </h3>
                <p style={{ color: '#4a5568', fontSize: '0.78rem' }}>
                  {board.created_at ? new Date(board.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
              <div style={{ padding: '0 1.25rem 1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => deleteBoard(board.id)} style={styles.btnDelete} title="Eliminar tablero">🗑️</button>
              </div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 3, background: board.color, borderRadius: '0 0 12px 12px'
              }} />
            </div>
          ))}

          <div onClick={() => setShowForm(true)} className="create-card" style={styles.createCard}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#2d3748' }}>+</div>
            <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>Nuevo tablero</p>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={styles.modal} className="modal-anim">
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Nuevo tablero</h3>
            <p style={{ color: '#4a5568', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Dale un nombre y elige un color para identificarlo
            </p>
            <form onSubmit={createBoard} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  placeholder="Ej: Proyecto personal, Trabajo..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required autoFocus
                />
              </div>
              <div>
                <label style={styles.label}>Color</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setColor(c)} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: color === c ? '3px solid white' : '3px solid transparent',
                      boxShadow: color === c ? `0 0 12px ${c}` : 'none',
                      transition: 'all 0.2s'
                    }} />
                  ))}
                </div>
              </div>
              <div style={{
                height: 60, borderRadius: 10,
                background: BG_PATTERNS[color] || BG_PATTERNS['#7c6af7'],
                border: `1px solid ${color}44`,
                display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.75rem'
              }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: color }} />
                <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                  {title || 'Vista previa'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" style={{ ...styles.btnPrimary, flex: 1, padding: '0.75rem' }} disabled={creating}>
                  {creating ? 'Creando...' : 'Crear tablero'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={styles.btnOutline}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', background: '#0d1017',
    borderBottom: '1px solid #1a2035', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { fontSize: '1.4rem', fontWeight: 800, color: '#7c6af7', letterSpacing: '-0.5px' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c6af7, #c45cf7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'default'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem'
  },
  boardCard: {
    borderRadius: 12, display: 'flex', flexDirection: 'column',
    border: '1px solid #1a2035', position: 'relative', overflow: 'hidden',
  },
  createCard: {
    borderRadius: 12, border: '2px dashed #1a2035',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 140, cursor: 'pointer',
  },
  btnPrimary: {
    padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none',
    background: '#7c6af7', color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
  },
  btnOutline: {
    padding: '0.5rem 1.2rem', borderRadius: 8,
    border: '1px solid #2d3748', background: 'transparent',
    color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer'
  },
  btnDelete: {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', opacity: 0.5, padding: '0.25rem'
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#0d1017', borderRadius: 16, padding: '2rem',
    width: '100%', maxWidth: 420, border: '1px solid #1a2035',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
  },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
    border: '1px solid #1a2035', background: '#0a0d14',
    color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' as const
  },
  label: { color: '#4a5568', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }
}