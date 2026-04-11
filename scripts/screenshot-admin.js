// Run: node scripts/screenshot-admin.js <siteUrl> <adminEmail> <adminPassword>
// Example: node scripts/screenshot-admin.js https://yoursite.netlify.app admin@example.com yourpassword

const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT_DIR = path.join(__dirname, 'screenshots')

const [,, SITE_URL, EMAIL, PASSWORD] = process.argv

if (!SITE_URL || !EMAIL || !PASSWORD) {
  console.error('Usage: node scripts/screenshot-admin.js <siteUrl> <adminEmail> <adminPassword>')
  process.exit(1)
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const pages = [
  { name: 'dashboard',       path: '/admin/dashboard' },
  { name: 'clients',         path: '/admin/clients' },
  { name: 'invoices',        path: '/admin/invoices' },
  { name: 'marketing-plans', path: '/admin/marketing-plans' },
  { name: 'documents',       path: '/admin/documents' },
  { name: 'contacts',        path: '/admin/contacts' },
  { name: 'client-portal',   path: '/client/dashboard' },
]

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  // Login
  console.log('Logging in...')
  await page.goto(`${SITE_URL}/auth/login`, { waitUntil: 'networkidle2' })
  await page.screenshot({ path: path.join(OUT_DIR, '00-login.png'), fullPage: true })

  await page.type('input[type="email"]', EMAIL)
  await page.type('input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
  await page.screenshot({ path: path.join(OUT_DIR, '01-after-login.png'), fullPage: true })
  console.log('Logged in. Current URL:', page.url())

  for (const p of pages) {
    try {
      console.log(`Capturing ${p.name}...`)
      await page.goto(`${SITE_URL}${p.path}`, { waitUntil: 'networkidle2', timeout: 15000 })
      await new Promise(r => setTimeout(r, 1200)) // let animations settle
      await page.screenshot({
        path: path.join(OUT_DIR, `${p.name}.png`),
        fullPage: true,
      })
      console.log(`  saved ${p.name}.png`)
    } catch (e) {
      console.warn(`  failed ${p.name}:`, e.message)
    }
  }

  await browser.close()
  console.log(`\nDone. Screenshots in: ${OUT_DIR}`)
})()
