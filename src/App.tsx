import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Boards from './pages/Boards'
import Board from './pages/Board'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/boards" element={token ? <Boards /> : <Navigate to="/login" />} />
        <Route path="/board/:id" element={token ? <Board /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/boards" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App