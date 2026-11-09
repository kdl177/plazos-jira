# Devpost submission texts (English, paste as they are)

Fill `[YOUTUBE URL]` before submitting. The repo is private: make it public (or add the judges) before Submit if the source link is required.

## Project name

Plazos: court deadlines for Jira

## Tagline

Spanish procedural deadlines computed, confirmed and watched inside the Jira issue, with a Rovo agent that answers "what expires this week?"

## Category and bonus prizes

Category: Apps for Specialized Industries (legal). Bonus prize: Best Agents (Rovo). The agent module `plazos-agent` uses two actions, `compute-deadline` and `list-deadlines`, that run the same engine as the issue panel.

## About the project

### Inspiration

Law firms in Spain compute procedural deadlines by hand. Article 183 of the Organic Law of the Judiciary excludes weekends, holidays, the whole of August and the days from 24 December to 6 January, unless the matter is urgent. Deadlines in months run date to date and move to the next working day when they land on a non-working one. Each court adds its regional and local holidays. A wrong date can mean a lost case, and the firms we work with in Málaga still keep these dates on paper calendars. We had already written and tested this engine for a desktop tool. Codegeist was the reason to put it where the work already is: inside the issue.

### What it does

The "Court deadline" panel in the issue takes the notification date, the amount and the unit (business days, calendar days or months) and proposes the last day of the deadline. It writes that date to the Jira due date, so boards, filters and reminders keep working. The lawyer confirms the proposal or corrects it; confirmed dates never move on their own. Each project keeps its own regional and local holidays in a settings page, and changing them recomputes every proposed deadline in the project. A daily trigger comments on the issue when a deadline is 7, 3 or 1 days away, due today, or overdue, once per level. The Rovo agent "Deadline Clerk" computes deadlines on request and lists the ones that expire within a given number of days, using app actions rather than doing arithmetic itself.

### How we built it

Forge with UI Kit for the issue panel and the project settings page, a resolver backed by the Key-Value Store, the Jira REST API for due dates and comments, a scheduled trigger for the daily watch, and a rovo:agent module with two actions. The deadline engine is a 90-line module with no dependencies and 11 tests that run with node:test, ported from a Python tool whose test cases cover August, the Christmas break, Easter, urgent matters, months without an equivalent day and calendar days.

### Challenges we ran into

Date arithmetic across time zones: the engine works on ISO date strings and UTC midnight so a deadline never shifts by a day depending on where the server runs. Keeping confirmed dates stable while proposed ones follow the holiday calendar needed a clear rule, which is now one line in the settings resolver.

### What we learned

A Rovo agent that is told never to compute dates itself, and given actions that do, gives the same answer as the panel every time. That matters more than a clever prompt when the answer is a court deadline.

### What's next

Other jurisdictions are a calendar swap: the engine takes a holiday set and three exclusion rules. We plan to add a Confluence macro that lists a client's deadlines and a Marketplace listing.

## How the project meets the technology requirement

The app is built on Forge and integrates with Jira (issue panel, project settings page, due date and comments through the Jira REST API, scheduled trigger) and with Rovo (agent with two actions). The manifest declares `jira:issuePanel`, `jira:projectSettingsPage`, `rovo:agent`, `action`, `scheduledTrigger` and `function` modules. All data stays in Forge storage.

## Links

- Installation link for judges: https://developer.atlassian.com/console/install/252c9fc9-2160-4557-8138-775e3ad9a04b?signature=AYABePgAEkwnWGb8KAaMtxcz0M0AAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucB6BtUm%2BHjnP4PAt6IVubV2gAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDNauoA6mUmGEMGPsXwIBEIA7qyCkAK0EK6AclsqtKYRhCQtOPKtQViWty1ss%2FUTAGgo%2FemPMFxDnEdQflyz4TEAGG5i20qaHLy28Bq4AB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgHVggt10LW1LdJu2HbIMEIGAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM1OhCuO7y2Sm%2Bjm%2F%2FAgEQgDuvkwX8bk%2FJsKAMHqHqgLVaW2WkFqzcrMFUcjNPq8lCnVl9pnuR9OmbraCyou3GpP2%2Bs%2B5dLR6t7dJLggAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEASiK%2Ffb61unZXQufMv2Dtw8AAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzlR%2B%2F7ajofn%2F3HDr4CARCAO8UiBP5fnLcUNEhLZzAXIMGyKHwvRDnNMQcBTB8bMGIeUpKt5H42Ax4ZI77ZfkGfQcZazuSWN5NBLdIGAgAAAAAMAAAQAAAAAAAAAAAAAAAAAGhfz3F%2FiDM%2BOjSqCoWLU5%2F%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADKDZYCyKsDVrCzIO%2B%2BqkZ%2BM%2BJgWrpNX4fpddLZIrvPQ0Nzt8FiufWSPQrVN5o%2FsS6JZZZleGXCkmCfV9NQ%2BAmeNXU4%3D&product=jira
- Demo video: `[YOUTUBE URL]`
- Source: https://github.com/kdl177/plazos-jira
- Testing instructions: see README.md, section "Testing instructions for judges".

## Built with

forge, jira, rovo, react, node.js

## Video script (target 2 min 40 s; judges may stop at 3 min)

| Time | On screen | Voice |
|---|---|---|
| 0:00 | Paper calendar with August crossed out, then a Jira issue | "In Spain a ten-day court deadline is rarely ten days. August does not count, Christmas does not count, each court has its own holidays, and a wrong date can lose the case. Firms still do this by hand." |
| 0:15 | Issue view, Court deadline panel. Type 2026-07-24, 10, Business days. Compute. | "Plazos lives in the issue. Notification date, ten business days, compute. 7 September: five days of July, five of September. The Jira due date is set." |
| 0:55 | Press Confirm. Show board with due date. | "The lawyer confirms, or corrects the date if the court says otherwise. Confirmed dates never move." |
| 1:15 | Project settings, Court holidays. Add 2 April Maundy Thursday. Back to a second issue: 2 business days from 1 April now gives 7 April. | "Each project keeps its regional and local holidays. Add one and every proposed deadline in the project is recomputed." |
| 1:45 | Rovo chat, Deadline Clerk. Ask "Which court deadlines expire within 60 days?" Table appears. Then "Compute a 2 month deadline from 15 June 2026". | "The Deadline Clerk agent answers from the same engine. It never does the arithmetic itself; it calls the app." |
| 2:20 | Issue with the daily comment "Court deadline expires within 3 days". | "Every day the app comments on issues that are close or overdue. Once per level, never spam." |
| 2:35 | README on screen, engine tests passing. | "Built on Forge with UI Kit, the Jira REST API, a scheduled trigger and a Rovo agent. Eleven tests cover the rules. Plazos: court deadlines for Jira." |
