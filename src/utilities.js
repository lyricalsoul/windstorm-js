export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// removes some portuguese chars (acentos). meaning é -> e, ã -> a, ú -> u, etc
export const normalizeText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// gets what time it is and returns a string, either manha, tarde or noite
export const timePeriod = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) {
    return 'manha'
  } else if (hour >= 12 && hour < 18) {
    return 'tarde'
  } else {
    return 'noite'
  }
}

const padZero = num => num < 10 ? `0${num}` : num

// returns the date in a way inmet reads it. e.g., 28/08/2024, 27/08/2006.
export const inmetDate = () => {
  const date = new Date()
  const day = padZero(date.getDate())
  const month = padZero(date.getMonth() + 1)
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const nextPeriod = (period) => {
  switch (period) {
    case 'manha':
      return 'tarde'
    case 'tarde':
      return 'noite'
    case 'noite':
      return 'manha'
  }
}

export const nextDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const day = padZero(date.getDate())
  const month = padZero(date.getMonth() + 1)
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const normalizeTempText = (t) => {
  return normalizeText(t)
    .toLowerCase()
    .replace('em ', '')
    .replace('ligeira ', '')
    .replace('elevacao', 'elevando')
}

export const delay = ms => {
  const start = Date.now()
  let now = start
  while (now - start < ms) {
    now = Date.now()
  }
}

export const getMicrosecond = () => {
  const hrTime = process.hrtime()
  return hrTime[0] * 1000000 + hrTime[1] / 1000
}

export const delayMicroseconds = us => {
  const start = getMicrosecond()
  let now = start
  while (now - start < us) {
    now = getMicrosecond()
  }
}

export const digitalReadPin = (board, pin) => {
  return new Promise((res) => {
    pin.read((error, value) => {
      if (error) {
        res(-2)
      } else {
        res(value)
      }
    })
  })
}

const timeForMicro = process.hrtime()
const usMicro = timeForMicro[0] * 1000000 + timeForMicro[1] / 1000

// returns the uptime in microseconds
export const micros = () => {
  const time = process.hrtime()
  return time[0] * 1000000 + time[1] / 1000 - usMicro
}

// gets the time of the day in 24h format (0-24)
export const timeOfDay = () => {
  const date = new Date()
  return date.getHours()
}

// returns the day of the year (0-366)
export const dayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}