import { useEffect, useState, type JSX } from 'react'
import Versions from './components/Versions'

// Helper to render a simple SVG contribution grid
function ContributionGrid({ weeks }: { weeks: any[] }): JSX.Element {
  const cellSize = 12;
  const cellGap = 2;
  return (
    <svg width={weeks.length * (cellSize + cellGap)} height={7 * (cellSize + cellGap)}>
      {weeks.map((week, x) =>
        week.contributionDays.map((day: any, y: number) => (
          <rect
            key={week.week + '-' + y}
            x={x * (cellSize + cellGap)}
            y={y * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            fill={day.contributionCount > 0 ? '#39d353' : '#ebedf0'}
            stroke="#ccc"
          >
            <title>{`${day.date}: ${day.contributionCount} contributions`}</title>
          </rect>
        ))
      )}
    </svg>
  );
}

function GitHubStatsWidget({ token, onLogout }: { token: string, onLogout: () => void }): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [contribWeeks, setContribWeeks] = useState<any[] | null>(null);
  const [languages, setLanguages] = useState<{[lang: string]: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    async function fetchStats(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        // Fetch user login from GitHub API
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${token}` }
        });
        const user = await userRes.json();
        const login = user.login;
        // Fetch contribution data from GitHub GraphQL API
        const graphRes = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query($login: String!) {
                user(login: $login) {
                  contributionsCollection {
                    contributionCalendar {
                      weeks {
                        contributionDays {
                          color
                          contributionCount
                          date
                        }
                        firstDay
                      }
                    }
                  }
                }
              }
            `,
            variables: { login },
          }),
        });
        const graphData = await graphRes.json();
        const weeks = graphData.data.user.contributionsCollection.contributionCalendar.weeks;
        setContribWeeks(weeks);

        // Fetch language stats from GitHub API
        const reposRes = await fetch(user.repos_url + '?per_page=100', {
          headers: { Authorization: `token ${token}` }
        });
        const repos = await reposRes.json();
        const langTotals: {[lang: string]: number} = {};
        for (const repo of repos) {
          if (!repo.fork) {
            const langsRes = await fetch(repo.languages_url, {
              headers: { Authorization: `token ${token}` }
            });
            const langs = await langsRes.json();
            for (const [lang, count] of Object.entries(langs)) {
              langTotals[lang] = (langTotals[lang] || 0) + (count as number);
            }
          }
        }
        setLanguages(langTotals);
      } catch {
        setError('Failed to fetch GitHub stats.');
      }
      setLoading(false);
    }
    fetchStats();
  }, [token]);

  if (loading) return <div>Loading GitHub stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={onLogout}>Logout</button>
      <h2>GitHub Contribution Graph</h2>
      {contribWeeks && <ContributionGrid weeks={contribWeeks} />}
      <h2>Language Usage</h2>
      {languages && (
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(languages).map(([lang, count]) => (
            <div key={lang} style={{ textAlign: 'center' }}>
              <div style={{ background: '#eee', width: 40, height: Math.max(10, count / 1000), margin: '0 auto' }} />
              <div>{lang}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      console.warn('⚠️ window.electron.invoke is undefined');
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
    return undefined;
  }, [])

  return (
    <>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          {!token && (
            <button onClick={onGitHubSignIn} disabled={loading}>
              {loading ? 'Loading...' : 'Sign in with GitHub'}
            </button>
          )}
        </div>
      </div>
      {token && <GitHubStatsWidget token={token} onLogout={onLogout} />}
      <Versions></Versions>
    </>
  )
}

export default App
