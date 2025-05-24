import { Route, Routes } from 'react-router-dom'
import FileUploader from '../screen/FileUploader'
import './App.css'
import LoginForm from './component/LoginForm'

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/FileUploader" element={<FileUploader />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
    </>
  )
}

export default App
