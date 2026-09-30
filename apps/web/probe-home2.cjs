const { chromium } = require('@playwright/test')

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  const hs = await page.getByRole('heading').allTextContents()
  console.log('HEADINGS:', JSON.stringify(hs))
  const ol = await page.locator('a[href*="/outreaches/"]').count()
  console.log('outreach detail links:', ol)
  const outreachLink = await page.locator('a[href*="/outreaches/"]').first().getAttribute('href').catch(() => null)
  console.log('first outreach href:', outreachLink)
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})