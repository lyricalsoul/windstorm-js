import components from './components.js'
import { sleep } from './utilities.js'

const H_LIMIT = 16
const V_LIMIT = 2

export const scrollingText = async (y, text, continuing = false, past = null) => {
  if (y >= V_LIMIT) {
    y = 0
  }

  const length = text.length
  const txt = text.substring(0, H_LIMIT)
  if ((txt.length < H_LIMIT) && continuing) {
    components.display.setCursor(0, y)
    // remove H_LIMIT - txt.length first chars from past, append txt and print
    const removing = past.substring(txt.length, H_LIMIT)
    components.display.print(removing + txt)
  } else {
    components.display.setCursor(0, y)
    components.display.print(txt)
  }

  if (length > H_LIMIT) {
    await sleep(1000)
    return scrollingText(y, text.replace(txt, ''), true, txt)
  }
}