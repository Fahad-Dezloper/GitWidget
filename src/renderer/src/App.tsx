import { useEffect, useState, type JSX } from 'react'
import GitHubStatsWidget from './components/GitHubStatsWidget'
import UpdateNotification from './components/UpdateNotification'

function App(): JSX.Element {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const onGitHubSignIn = (): void => {
    console.log("🔐 Starting GitHub sign in...")
    try {
      setLoading(true)
      window.electron.openGitHubAuth()
      
      // Reset loading state after 30 seconds in case something goes wrong
      setTimeout(() => {
        setLoading(false)
      }, 30000)
    } catch (e){
      console.error('❌ Failed to open GitHub auth:', e)
      setLoading(false)
    }
  }

  const onLogout = async (): Promise<void> => {
    console.log("🚪 Logging out...")
    try {
      await window.electron.invoke('logout')
      setToken(null)
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("❌ Logout failed:", error)
    }
  }

  useEffect(() => {
    console.log("🔄 Setting up authentication listeners...")
    
    // Get initial token
    if (window?.electron?.invoke) {
      window.electron
        .invoke('get-token')
        .then((storedToken) => {
          console.log("📋 Retrieved stored token:", storedToken ? "exists" : "none")
          setToken(storedToken || null)
        })
        .catch((err) => {
          console.error('❌ Failed to get token:', err)
        })
    } else {
      console.warn('⚠️ window.electron.invoke is undefined')
    }

    // Set up event listeners
    const authSuccessHandler = (newToken: string): void => {
      console.log("✅ Auth success received, setting token...")
      setToken(newToken)
      setLoading(false)
      setShowSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }
    
    const logoutHandler = (): void => {
      console.log("🚪 Logout event received, clearing token...")
      setToken(null)
    }

    // Register event listeners
    try {
      // @ts-ignore: Electron custom API for IPC event
      window.electron.on('auth-success', authSuccessHandler)
      // @ts-ignore: Electron custom API for IPC event
      window.electron.on('logged-out', logoutHandler)
      console.log("✅ Event listeners registered successfully")
    } catch (error) {
      console.error("❌ Failed to register event listeners:", error)
    }

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up event listeners...")
      try {
        // @ts-ignore: Electron custom API for IPC event
        window.electron.removeListener('auth-success', authSuccessHandler)
        // @ts-ignore: Electron custom API for IPC event
        window.electron.removeListener('logged-out', logoutHandler)
      } catch (error) {
        console.error("❌ Failed to remove event listeners:", error)
      }
    }
  }, [])

  return (
    <div className="widget-container">
      <UpdateNotification />
      {showSuccess && (
        <div className="auth-success-notification">
          ✅ Successfully signed in!
        </div>
      )}
      <div style={{padding: 12, width: '100%'}}>
        {!token ? (
          <button className='signin-btn' onClick={onGitHubSignIn} disabled={loading}>
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
