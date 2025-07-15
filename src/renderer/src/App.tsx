import { useEffect, useState } from 'react'
import Versions from './components/Versions'

function App(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(null)
  const onGitHubSignIn = (): void => {
    // @ts-ignore (define in dts)
    window.electron.openGitHubAuth()
  }

  useEffect(() => {
    // @ts-ignore (define in dts)
    if (window?.electron?.invoke) {
      window.electron
      // @ts-ignore (define in dts)
        .invoke('get-token')
        .then((storedToken) => {
          setToken(storedToken || null)
        })
        .catch((err) => {
          console.error('❌ Failed to get token:', err)
        })
    } else {
      console.warn('⚠️ window.electron.invoke is undefined');
    }
  }, [])

  // const onSignOut = (): void => {
  //   // @ts-ignore (define in dts)
  //   window.electron.invoke('set-token', null);
  //   setToken(null)
  // }

  // const onSetToken = (token: string): void => {
  //   // @ts-ignore (define in dts)
  //   window.electron.invoke('set-token', token);
  //   setToken(token)
  // }

  return (
    <>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
          <div className="action">
              <button onClick={() => onGitHubSignIn()}>Sign in with GitHub</button>
            </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
