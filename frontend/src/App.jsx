import { Route, Routes } from 'react-router-dom'
import './App.css'
import LoginForm from './component/LoginForm'
import { useState } from 'react'
import ProtectedRoute from './component/ProtectedRoute'
import FileUploader from './screen/FileUploader'

function App() {
const [isAuthenticated, setAuth] = useState(false)
  return (
    <>
    <Routes>
      <Route path="/" element={<LoginForm onLogin={() => setAuth(true)} />} />
      <Route path="/FileUploader" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FileUploader /></ProtectedRoute>} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
    </>
  )
}

export default App
