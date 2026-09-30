const fs = require('fs')

async function main() {
  const ua = 'Opera/9.80 (Windows NT 6.1; U; en) Presto/2.12.388 Version/12.16'
  const grab = async (fam) => {
    const css = await fetch('https://fonts.googleapis.com/css?family=' + fam, { headers: { 'User-Agent': ua } }).then((r) => r.text())
    const url = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)][0][1]
    return fetch(url, { headers: { 'User-Agent': ua } }).then((r) => r.arrayBuffer())
  }
  const n = await grab('Fraunces:500')
  fs.writeFileSync('src/assets/fonts/Fraunces-500-normal.woff', Buffer.from(n))
  const i = await grab('Fraunces:500italic')
  fs.writeFileSync('src/assets/fonts/Fraunces-500-italic.woff', Buffer.from(i))
  const head = (b) => [...new Uint8Array(b, 0, 4)].map((x) => String.fromCharCode(x)).join('')
  console.log('normal', n.byteLength, JSON.stringify(head(n)), 'italic', i.byteLength, JSON.stringify(head(i)))
}
main()