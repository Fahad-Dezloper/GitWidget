/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, type JSX } from 'react'
import ContributionGrid from './ContributionGrid'
import colorsData from '../../../../colors.json'
import { useRef } from 'react'

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
  // @ts-ignore: colorsData is a JSON object with dynamic keys for language colors
  return colorsData[lang]?.color || '#444'
}

function GitHubStatsWidget({
  token,
  // @ts-ignore: onLogout is a function
  onLogout
}: {
  token: string,
  onLogout: () => void
}): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [contribWeeks, setContribWeeks] = useState<ContributionWeek[] | null>(null)
  const [languages, setLanguages] = useState<{ [lang: string]: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration] = useState<number>(3)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick)
    } else {
      document.removeEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

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

  // @ts-ignore: intentional
  const totalLangCount = languages
    ? Object.values(languages).reduce((sum, count) => sum + count, 0)
    : 0

  const topLanguages = languages
    ? Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
    : []

  // Filter contribWeeks by selected duration
  let filteredWeeks = contribWeeks
  if (contribWeeks) {
    const today = new Date()
    const monthsAgo = new Date(today)
    monthsAgo.setMonth(today.getMonth() - duration)
    filteredWeeks = contribWeeks.filter((week) => {
      // week.firstDay is ISO string
      const weekDate = new Date(week.firstDay)
      return weekDate >= monthsAgo
    })
  }

  // Calculate widget width (e.g. 16px per week + padding)
  const weekCount = filteredWeeks ? filteredWeeks.length : 0
  const widgetWidth = 16 * weekCount + 32 // 16px per week, 32px padding

  return (
    <div className={'hover-container github-widget-container'} style={{ width: widgetWidth }}>
      {/* <div className="settings-menu-wrapper">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="settings-gear-btn logout-btn-hover"
          onMouseEnter={() => setMenuOpen(true)}
        >
          <SettingsGearIcon size={22} />
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className="settings-menu"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <div className="settings-menu-tabs">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setDuration(opt.value)
                    setMenuOpen(false)
                  }}
                  className={
                    'settings-menu-tab' + (duration === opt.value ? ' selected' : '')
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <hr className="settings-menu-divider" />
            <button
              onClick={onLogout}
              className="settings-menu-logout"
            >
              Logout
            </button>
          </div>
        )}
      </div> */}
      {filteredWeeks && <ContributionGrid weeks={filteredWeeks} />}
      {topLanguages.length > 0 && (
        <div className="language-bar-container">
          {/* @ts-ignore: i know motherfucker */}
          {topLanguages.map(([lang, count]) => {
            return (
              <div key={lang} className="language-bar-cont" style={{ position: 'relative' }}>
                <div
                  className="language-bar"
                  style={{
                    backgroundColor: getLangColor(lang),
                    position: 'relative'
                  }}
                ></div>
                {/* show name and percentage on hover */}
                {/* <div className="lang-tooltip">
                    {lang}: {percentage}%
                  </div> */}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GitHubStatsWidget
