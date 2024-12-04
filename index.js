import johnny from 'johnny-five'
import { fetchCurrentAlerts, fetchCurrentWeather } from './src/weather.js'
import {
  inmetDate,
  nextDate,
  nextPeriod,
  normalizeTempText,
  normalizeText,
  sleep,
  timePeriod
} from './src/utilities.js'
import components from './src/components.js'
import { scrollingText } from './src/display.js'

const board = new johnny.Board()
let triggeredGasAlert = false

const bootSystems = async () => {
  components.startComponents(board)
  const { display, workingLED, soundSystem } = components
  setUpGasHooks()
  soundSystem.off()
  display.print('EEEMTI Heitor')
  display.cursor(1, 0)
  display.print('Villa-Lobos')
  await sleep(3000)
  display.clear()
  display.print('Central')
  display.cursor(1, 0)
  display.print('Climatologica')
  await sleep(2000)
  display.clear()
  return normalRun()
}

const displayGasAlert = async (value) => {
  if (triggeredGasAlert) return

  components.soundSystem.on()
  components.soundSystem.blink(1000)
  components.display.clear()
  components.display.cursor(0, 0)
  components.display.print('ALERTA DE GAS')
  components.display.cursor(1, 0)
  components.display.print(value + ' ppm detectado')

  triggeredGasAlert = true
  await sleep(5000)
}

const setUpGasHooks = () => {
  const { gasSensor } = components
  gasSensor.on('change', async (value) => {
    console.log(value)
    if (value >= 600) await displayGasAlert(value)
    else {
      components.soundSystem.off()
    }
  })
}

const errorScreen = async () => {
  const { display, workingLED } = components
  display.clear()
  display.cursor(0, 0)
  display.print('Erro de conexao')
  display.cursor(1, 0)
  display.print('ao INMET')
  workingLED.blink(1000)
}

const normalRun = async () => {
  const { display, workingLED, soundSystem } = components
  display.clear()
  display.home().print('Conectando-se')
  display.cursor(1, 0)
  display.print('ao INMET...')
  const count = await globalThis.triggerWarning()

  const forecast = await fetchCurrentWeather()
  if (!forecast) return errorScreen()
  await homeScreen(forecast, count)
  await printFromSensor()
  return normalRun()
}

const printFromSensor = async () => {
  const [humidity, temperature] = await components.dht.read()
  const { display } = components

  display.clear()
  display.cursor(0, 0)
  display.print(`Temp A.: ${temperature} C`)
  display.cursor(1, 0)
  display.print(`Umid A.: ${humidity} %`)
  await sleep(5000)
}
const homeScreen = async (forecast, count) => {
  const { display } = components
  // get today's date
  const data = inmetDate()

  let currentPeriod = timePeriod()
  let currentData = data

  for (let i = 0; i < 3; i++) {
    await printCurrentStatus(forecast, currentData, currentPeriod, count)
    currentPeriod = nextPeriod(currentPeriod)
    if (currentPeriod === 'manha') {
      currentData = nextDate()
    }
    await sleep(5000)
    await printMoreStatus(forecast, currentData, currentPeriod)
    await sleep(5000)
  }

  display.clear()

}

const printCurrentStatus = (forecast, data, period, count) => {
  const { display } = components
  console.log('accessing', data, period)
  const { entidade, uf, temp_max, temp_min, dir_vento, int_vento, umidade_max, umidade_min } = forecast[data][period]
  console.log(`${entidade}/${uf}: max ${temp_max} min ${temp_min} umidade min ${umidade_min} max ${umidade_max}, v ${dir_vento} ${int_vento}`)
  display.clear()
  display.cursor(0, 0)
  display.home().print(`${entidade}, ${period}`)
  display.cursor(1, 0)
  display.print(`${temp_max}/${temp_min} ${umidade_min}-${umidade_max}%`)
  display.cursor(1, 14)
  display.print(`+${count}`)
}

const printMoreStatus = async (forecast, data, period) => {
  const { display } = components
  const { resumo, int_vento, dir_vento, temp_max_tende, temp_min_tende } = forecast[data][period]
  display.clear()
  display.home().print(resumo)
  display.cursor(1, 0)
  // drop last letter of int_vento

  display.print(`Vento ${int_vento.toLowerCase().slice(0, -1)} ${dir_vento}`)
  await sleep(3000)
  display.clear()
  display.home().print(`T min. ${normalizeTempText(temp_min_tende.toLowerCase())}`)
  display.cursor(1, 0)
  display.print(`T max. ${normalizeTempText(temp_max_tende.toLowerCase())}`)
  await sleep(3000)
}

const printAlert = async ({ alerta, perigo, tipo }) => {
  const { display, workingLED, soundSystem } = components
  console.log(`${perigo} de ${tipo.toLowerCase()}!`)
  workingLED.blink(1000)
  soundSystem.on()
  console.log(alerta)
  display.clear()
  display.cursor(0, 0)
  display.print(perigo)
  display.cursor(1, 0)
  display.print(tipo)
  // jump to last line and char at y2
  await sleep(5000)
  soundSystem.off()
  display.cursor(1, 0)
  //components.display.autoscroll().print(alerta)
  await scrollingText(1, normalizeText(alerta))
  await sleep(10_000)
}

globalThis.triggerWarning = async () => {
  const alerts = await fetchCurrentAlerts()
  if (!alerts) return errorScreen()
  if (alerts.length > 0) {
    await Promise.all(alerts.map(alert => printAlert(alert)))
  }

  return alerts.length
}

board.on('ready', bootSystems)