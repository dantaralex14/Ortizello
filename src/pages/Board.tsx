import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import api from '../api/axios'

interface Card {
  id: number
  title: string
  description: string | null
  color: string
  due_date: string | null
  position: number
}

interface Column {
  id: number
  title: string
  position: number
  cards: Card[]
}

interface BoardData {
  id: number
  title: string
  color: string
  columns: Column[]
}

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState<BoardData | null>(null)
  const [newCardTitle, setNewCardTitle] = useState<Record<number, string>>({})
  const [addingCard, setAddingCard] = useState<number | null>(null)
  const [newColTitle, setNewColTitle] = useState('')
  const [showColForm, setShowColForm] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', color: '', due_date: '' })

  useEffect(() => { loadBoard() }, [id])

  async function loadBoard() {
    try {
      const res = await api.get(`/boards/${id}`)
      setBoard(res.data)
    } catch { navigate('/boards') }
  }

  async function addCard(columnId: number) {
    const title = newCardTitle[columnId]?.trim()
    if (!title) return
    const res = await api.post('/cards/', { title, column_id: columnId })
    setBoard(prev => {
      if (!prev) return prev
      return { ...prev, columns: prev.columns.map(col => col.id === columnId ? { ...col, cards: [...col.cards, res.data] } : col) }
    })
    setNewCardTitle(prev => ({ ...prev, [columnId]: '' }))
    setAddingCard(null)
  }

  async function deleteCard(cardId: number, columnId: number) {
    await api.delete(`/cards/${cardId}`)
    setBoard(prev => {
      if (!prev) return prev
      return { ...prev, columns: prev.columns.map(col => col.id === columnId ? { ...col, cards: col.cards.filter(c => c.id !== cardId) } : col) }
    })
  }

  async function addColumn() {
    if (!newColTitle.trim()) return
    const res = await api.post('/columns/', { title: newColTitle, board_id: Number(id) })
    setBoard(prev => prev ? { ...prev, columns: [...prev.columns, res.data] } : prev)
    setNewColTitle('')
    setShowColForm(false)
  }

  async function deleteColumn(colId: number) {
    if (!confirm('¿Eliminar esta columna y todas sus tarjetas?')) return
    await api.delete(`/columns/${colId}`)
    setBoard(prev => prev ? { ...prev, columns: prev.columns.filter(c => c.id !== colId) } : prev)
  }

  function openEdit(card: Card) {
    setEditingCard(card)
    setEditForm({
      title: card.title,
      description: card.description || '',
      color: card.color,
      due_date: card.due_date ? card.due_date.slice(0, 10) : ''
    })
  }

  async function saveEdit() {
    if (!editingCard) return
    await api.put(`/cards/${editingCard.id}`, {
      title: editForm.title,
      description: editForm.description,
      color: editForm.color,
      due_date: editForm.due_date || null
    })
    setBoard(prev => {
      if (!prev) return prev
      return {
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          cards: col.cards.map(c => c.id === editingCard.id ? { ...c, ...editForm, due_date: editForm.due_date || null } : c)
        }))
      }
    })
    setEditingCard(null)
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination || !board) return
    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId && source.index === destination.index) return
    const cardId = parseInt(draggableId)
    const destColId = parseInt(destination.droppableId)
    const newColumns = board.columns.map(col => ({ ...col, cards: [...col.cards] }))
    const srcCol = newColumns.find(c => c.id === parseInt(source.droppableId))!
    const destCol = newColumns.find(c => c.id === destColId)!
    const [moved] = srcCol.cards.splice(source.index, 1)
    destCol.cards.splice(destination.index, 0, moved)
    setBoard({ ...board, columns: newColumns })
    await api.put('/cards/move', { card_id: cardId, column_id: destColId, position: destination.index })
  }

  if (!board) return <div style={{ color: 'white', padding: '2rem' }}>Cargando...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/boards')} style={styles.btnOutline}>← Tableros</button>
          <span style={{ ...styles.logo, borderLeft: `4px solid ${board.color}`, paddingLeft: '0.75rem' }}>
            {board.title}
          </span>
        </div>
        <button onClick={() => setShowColForm(true)} style={styles.btnPrimary}>+ Columna</button>
      </nav>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.kanban} className="kanban-board">
          {board.columns.map(col => (
            <div key={col.id} style={styles.column} className="kanban-column">
              <div style={styles.colHeader}>
                <span style={styles.colTitle}>{col.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.badge}>{col.cards.length}</span>
                  <button onClick={() => deleteColumn(col.id)} style={styles.btnIcon}>🗑️</button>
                </div>
              </div>

              <Droppable droppableId={String(col.id)}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ ...styles.cardList, background: snapshot.isDraggingOver ? '#1a2035' : 'transparent' }}
                  >
                    {col.cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="kanban-card"
                            style={{
                              ...styles.card,
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.85 : 1,
                              boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
                              borderLeft: `3px solid ${card.color}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span {...provided.dragHandleProps} style={{ color: '#4a5568', cursor: 'grab', marginRight: '0.5rem', fontSize: '0.85rem' }}>⠿</span>
                              <p onClick={() => openEdit(card)} style={{ color: '#e2e8f0', fontSize: '0.9rem', flex: 1, cursor: 'pointer' }}>
                                {card.title}
                              </p>
                              <button onClick={() => deleteCard(card.id, col.id)} style={{ ...styles.btnIcon, fontSize: '0.75rem', marginLeft: '0.5rem' }}>✕</button>
                            </div>
                            {card.description && <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem' }}>{card.description}</p>}
                            {card.due_date && <p style={{ color: '#f7a85c', fontSize: '0.75rem', marginTop: '0.4rem' }}>📅 {new Date(card.due_date).toLocaleDateString('es-MX')}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {addingCard === col.id ? (
                <div style={{ padding: '0.5rem' }}>
                  <textarea
                    style={styles.textarea}
                    placeholder="Título de la tarjeta"
                    value={newCardTitle[col.id] || ''}
                    onChange={e => setNewCardTitle(prev => ({ ...prev, [col.id]: e.target.value }))}
                    autoFocus rows={2}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => addCard(col.id)} style={styles.btnPrimary}>Agregar</button>
                    <button onClick={() => setAddingCard(null)} style={styles.btnOutline}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingCard(col.id)} style={styles.btnAddCard}>+ Agregar tarjeta</button>
              )}
            </div>
          ))}

          {showColForm && (
            <div style={{ ...styles.column, minWidth: 240 }}>
              <input
                style={styles.input}
                placeholder="Nombre de la columna"
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addColumn()}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={addColumn} style={styles.btnPrimary}>Crear</button>
                <button onClick={() => setShowColForm(false)} style={styles.btnOutline}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </DragDropContext>

      {editingCard && (
        <div style={styles.overlay}>
          <div style={styles.modal} className="modal-anim">
            <h3 style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>Editar tarjeta</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={styles.label}>Título</label>
                <input style={styles.input} value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label style={styles.label}>Descripción</label>
                <textarea style={{ ...styles.textarea, height: 80 }} value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción opcional..." />
              </div>
              <div>
                <label style={styles.label}>Fecha límite</label>
                <input type="date" style={styles.input} value={editForm.due_date} onChange={e => setEditForm(prev => ({ ...prev, due_date: e.target.value }))} />
              </div>
              <div>
                <label style={styles.label}>Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {['#7c6af7', '#f75c7c', '#f7a85c', '#5cf7a8', '#5cb8f7', '#c45cf7', '#1e2433'].map(c => (
                    <div key={c} onClick={() => setEditForm(prev => ({ ...prev, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: editForm.color === c ? '3px solid white' : '3px solid transparent'
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={saveEdit} style={styles.btnPrimary}>Guardar</button>
                <button onClick={() => setEditingCard(null)} style={styles.btnOutline}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', background: '#1e2433',
    borderBottom: '1px solid #2d3748', position: 'sticky', top: 0, zIndex: 100
  },
  logo: { fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' },
  kanban: {
    display: 'flex', gap: '1rem', padding: '1.5rem 2rem',
    overflowX: 'auto', minHeight: 'calc(100vh - 65px)', alignItems: 'flex-start'
  },
  column: {
    background: '#1e2433', borderRadius: 12, padding: '1rem',
    minWidth: 280, maxWidth: 280, flexShrink: 0
  },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  colTitle: { color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem' },
  badge: { background: '#2d3748', color: '#94a3b8', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: '0.8rem' },
  cardList: { minHeight: 20, borderRadius: 8, transition: 'background 0.2s', padding: '0.25rem' },
  card: { background: '#0f1117', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem', cursor: 'default' },
  btnPrimary: { padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none', background: '#7c6af7', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' },
  btnOutline: { padding: '0.4rem 0.9rem', borderRadius: 8, border: '1px solid #2d3748', background: 'transparent', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' },
  btnIcon: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  btnAddCard: { width: '100%', padding: '0.5rem', borderRadius: 8, border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', marginTop: '0.5rem' },
  textarea: { width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #2d3748', background: '#0f1117', color: '#e2e8f0', fontSize: '0.9rem', resize: 'none', outline: 'none' },
  input: { width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #2d3748', background: '#0f1117', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#1e2433', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  label: { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' },
}