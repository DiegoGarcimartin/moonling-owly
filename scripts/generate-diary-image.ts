/**
 * gen:diary — captura el diario clínico como PNG de alta resolución.
 *
 * Requisitos previos:
 *   1. npx playwright install chromium   (una sola vez)
 *   2. npm run dev                        (en otra terminal, puerto 5174)
 *
 * Uso:
 *   npm run gen:diary
 *
 * Salida: diario-caso.png en la raíz del proyecto (2× DPR, ~2244 × ~1600 px).
 * Para cambiar el nombre del niño, edita CHILD_NAME en src/pages/DiaryPreviewPage.tsx.
 */

import { chromium } from 'playwright'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH  = resolve(__dirname, '..', 'diario-caso.png')
const URL       = 'http://localhost:5174/diary-preview'

const browser = await chromium.launch()
const context = await browser.newContext({ deviceScaleFactor: 2 })
const page    = await context.newPage()

// Viewport ancho para que el doc (1122px) no quede escalado por el sheet
await page.setViewportSize({ width: 1300, height: 900 })

console.log(`→ Abriendo ${URL}`)
await page.goto(URL)
await page.waitForLoadState('networkidle')

// Esperar a que las fuentes estén listas y los ResizeObserver hayan corrido
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

// Verificar que el elemento existe y está visible
const el = page.locator('#printable-doc')
await el.waitFor({ state: 'visible', timeout: 10_000 })

// Guardar PNG
await el.screenshot({ path: OUT_PATH })
console.log(`✓ Guardado en: ${OUT_PATH}`)

await browser.close()
process.exit(0)
