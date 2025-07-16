import { useEffect, useState, type JSX } from 'react'
import GitHubStatsWidget from './components/GitHubStatsWidget'

function App(): JSX.Element {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onGitHubSignIn = (): void => {
    setLoading(true)
    window.electron.openGitHubAuth()
  }

  const onLogout = async (): Promise<void> => {
    await window.electron.invoke('logout')
    setToken(null)
  }

  useEffect((): void => {
    if (window?.electron?.invoke) {
      window.electron
        .invoke('get-token')
        .then((storedToken) => {
          setToken(storedToken || null)
        })
        .catch((err) => {
          console.error('❌ Failed to get token:', err)
        })
    } else {
      console.warn('⚠️ window.electron.invoke is undefined')
    }

    // Listen for auth-success and logged-out events from main
    const handler = (_event: unknown, newToken: string): void => {
      setToken(newToken)
      setLoading(false)
    }
    const logoutHandler = (): void => {
      setToken(null)
      setLoading(false)
    }
    // @ts-ignore: Electron custom API for IPC event
    window.electron.on('auth-success', handler)
    // @ts-ignore: Electron custom API for IPC event
    window.electron.on('logged-out', logoutHandler)
    // Return undefined to match void return type
    return undefined
  }, [])

  return (
    <div className="widget-container">
      {/* <div className="widget-header">
        <span>GitHub Widget</span>
        {token && (
          <button title="Logout" onClick={onLogout}>
            ×
          </button>
        )}
      </div> */}
      <div style={{ padding: 16 }}>
        {!token ? (
          <button onClick={onGitHubSignIn} disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
            {loading ? 'Loading...' : 'Sign in with GitHub'}
          </button>
        ) : (
          <GitHubStatsWidget token={token} onLogout={onLogout} />
        )}
      </div>
    </div>
  )
}

export default App
