import type { JSX } from 'react'

function ContributionGrid({ weeks }: { weeks: any[] }): JSX.Element {
  return (
    <div id="grid">
      {weeks.map((week, x) =>
        week.contributionDays.map((day: any, y: number) => (
          <div
            key={week.week + '-' + y}
            className="box"
            data-level={
              day.contributionCount > 0
                ? day.contributionCount >= 20
                  ? 4
                  : day.contributionCount >= 10
                    ? 3
                    : day.contributionCount >= 5
                      ? 2
                      : 1
                : 0
            }
            style={{
              gridColumn: x + 1,
              gridRow: y + 1
            }}
            title={`${day.date}: ${day.contributionCount} contributions`}
          />
        ))
      )}
    </div>
  )
}

export default ContributionGrid 