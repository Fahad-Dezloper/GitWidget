import { useEffect, useState, type JSX } from 'react'
import ContributionGrid from './ContributionGrid'

function GitHubStatsWidget({
  token,
  onLogout
}: {
  token: string
  onLogout: () => void
}): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [contribWeeks, setContribWeeks] = useState<any[] | null>(null)
  const [languages, setLanguages] = useState<{ [lang: string]: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect((): void => {
    async function fetchStats(): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        // Fetch user login from GitHub API
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${token}` }
        })
        const user = await userRes.json()
        const login = user.login
        // Fetch contribution data from GitHub GraphQL API
        const graphRes = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            Authorization: `bearer ${token}`,
            'Content-Type': 'application/json'
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
            variables: { login }
          })
        })
        const graphData = await graphRes.json()
        const weeks = graphData.data.user.contributionsCollection.contributionCalendar.weeks
        setContribWeeks(weeks)

        // Fetch language stats from GitHub API
        const reposRes = await fetch(user.repos_url + '?per_page=100', {
          headers: { Authorization: `token ${token}` }
        })
        const repos = await reposRes.json()
        const langTotals: { [lang: string]: number } = {}
        for (const repo of repos) {
          if (!repo.fork) {
            const langsRes = await fetch(repo.languages_url, {
              headers: { Authorization: `token ${token}` }
            })
            const langs = await langsRes.json()
            for (const [lang, count] of Object.entries(langs)) {
              langTotals[lang] = (langTotals[lang] || 0) + (count as number)
            }
          }
        }
        setLanguages(langTotals)
      } catch {
        setError('Failed to fetch GitHub stats.')
      }
      setLoading(false)
    }
    fetchStats()
  }, [token])

  if (loading) return <div>Loading GitHub stats...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {/* <button onClick={onLogout}>Logout</button> */}
      {/* <h2>GitHub Contribution Graph</h2> */}
      {contribWeeks && <ContributionGrid weeks={contribWeeks} />}
      {/* <h2>Language Usage</h2> */}
      {/* {languages && (
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(languages).map(([lang, count]) => (
            <div key={lang} style={{ textAlign: 'center' }}>
              <div
                className='language-bar'
              />
              <div>{lang}</div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  )
}

export default GitHubStatsWidget 