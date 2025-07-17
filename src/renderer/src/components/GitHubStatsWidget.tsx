import { useEffect, useState, type JSX } from 'react'
import ContributionGrid from './ContributionGrid'
import colorsData from '../../../../colors.json'
import { LogoutIcon } from './LogoutComponent'
import { SettingsGearIcon } from './SettingsIcon'

const CACHE_KEY = 'github-stats-cache'
const CACHE_DURATION = 5 * 60 * 60 * 1000 // 5 hours in milliseconds

interface ContributionDay {
  color: string
  contributionCount: number
  date: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
  firstDay: string
}

interface CachedData {
  timestamp: number
  contribWeeks: ContributionWeek[]
  languages: { [lang: string]: number }
}

// Helper to get color for a language
function getLangColor(lang: string): string {
  // @ts-ignore
  return colorsData[lang]?.color || '#444'
}

function GitHubStatsWidget({
  token,
  onLogout
}: {
  token: string
  onLogout: () => void
}): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [contribWeeks, setContribWeeks] = useState<ContributionWeek[] | null>(null)
  const [languages, setLanguages] = useState<{ [lang: string]: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect((): void => {
    async function fetchStats(): Promise<void> {
      setLoading(true)
      setError(null)

      const cachedDataJSON = localStorage.getItem(CACHE_KEY)
      if (cachedDataJSON) {
        const cachedData: CachedData = JSON.parse(cachedDataJSON)
        if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
          setContribWeeks(cachedData.contribWeeks)
          setLanguages(cachedData.languages)
          setLoading(false)
          return
        }
      }

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
        const weeks: ContributionWeek[] =
          graphData.data.user.contributionsCollection.contributionCalendar.weeks
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

        const dataToCache: CachedData = {
          timestamp: Date.now(),
          contribWeeks: weeks,
          languages: langTotals
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache))
      } catch {
        setError('Failed to fetch GitHub stats.')
      }
      setLoading(false)
    }
    fetchStats()
  }, [token])

  if (loading) return <div>Loading GitHub stats...</div>
  if (error) return <div>{error}</div>

  const totalLangCount = languages
    ? Object.values(languages).reduce((sum, count) => sum + count, 0)
    : 0

  // Get top 4 languages
  const topLanguages = languages
    ? Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
    : []

  return (
    <div className="hover-container">
      <button onClick={onLogout} className="logout-btn-hover">
        <SettingsGearIcon size={22} />
      </button>
      {contribWeeks && <ContributionGrid weeks={contribWeeks} />}
      {topLanguages.length > 0 && (
        <div className="language-bar-container" style={{ justifyContent: 'flex-start', position: "relative", zIndex: 10 }}>
          {topLanguages.map(([lang, count]) => {
            const percentage = ((count / totalLangCount) * 100).toFixed(1)
            return (
              <div key={lang} style={{ position: 'relative' }}>
                <div
                  className="language-bar"
                  style={{
                    backgroundColor: getLangColor(lang),
                  }}
                  title={`${lang}: ${percentage}%`}
                />
                {/* Tooltip */}
                <div className="lang-tooltip" style={{ zIndex: 1000 }}>
                  {lang}: {percentage}%
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GitHubStatsWidget
