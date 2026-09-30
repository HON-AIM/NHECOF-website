const { chromium } = require('@playwright/test')

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 412, height: 823 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36',
  })
  for (const u of ['/contact', '/resources', '/outreaches/pregnancy-nutrition-talk-kano', '/nutrition/articles/introducing-solid-foods']) {
    await page.goto('http://localhost:3000' + u, { waitUntil: 'domcontentloaded', timeout: 40000 })
    await page.waitForTimeout(3000)
    const r = await page.evaluate(() => {
      const q = (sel) => document.querySelector(sel)
      const inHead = !!document.head.querySelector('meta[name="description"]')
      const inBody = !!document.body.querySelector('meta[name="description"]')
      const headOgs = document.head.querySelectorAll('meta[property^="og:"]').length
      return { inHead, inBody, headOgs, titleInHead: !!document.head.querySelector('title') }
    })
    console.log(u, JSON.stringify(r))
  }
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})