import { FormEvent, useContext, useState } from 'react'
import styles from '../styles/Home.module.css'
import { AuthContext } from '../contexts/AuthContext'

export default function Home() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {} = useContext(AuthContext)

  function hamdleSubmit(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <form onSubmit={hamdleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}
