const { chromium } = require('@playwright/test')

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/nutrition/articles?category=myths-facts', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForTimeout(2500)
  const hs = await page.getByRole('heading').allTextContents()
  console.log('HEADINGS:', JSON.stringify(hs))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})