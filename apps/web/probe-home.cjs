const { chromium } = require('@playwright/test')

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(4000)

  const h1 = await page.getByRole('heading', { level: 1 }).allTextContents()
  console.log('H1:', JSON.stringify(h1))

  const contentLinks = await page
    .locator('main a')
    .evaluateAll((es) =>
      es.slice(0, 25).map((a) => (a.textContent || '').trim().slice(0, 60) + ' => ' + a.getAttribute('href')),
    )
  console.log('main links:', JSON.stringify(contentLinks, null, 1))

  const navButtons = await page
    .getByRole('navigation')
    .locator('button')
    .evaluateAll((es) => es.map((b) => (b.textContent || '').trim()))
  console.log('nav buttons:', JSON.stringify(navButtons))

  const dropdownOpen = await page
    .getByRole('button', { name: 'Nutrition Hub', exact: true })
    .hover()
    .then(async () => {
      await page.waitForTimeout(1500)
      return page
        .getByRole('menu')
        .count()
        .catch(() => 'err')
    })
  console.log('menus after hover:', dropdownOpen)

  const ulNav = await page
    .locator('nav')
    .evaluateAll((navs) => navs.map((n) => n.outerHTML.slice(0, 600)))
  console.log('nav html head:', ulNav.map((s) => s.replace(/\s+/g, ' ').slice(0, 500)))

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})