import johnny from 'johnny-five'
import { DHT } from './components/dht.js'

export class SystemsComponents {
  boardReady = false
  _workingLED
  _display
  _soundSystem
  _gasSensor
  _dhtSensor

  initialize (board) {
    this._workingLED = new johnny.Led(8)
    this._display = new johnny.LCD({
      rows: 2,
      cols: 16,
      backlight: 6,
      pins: [12, 11, 5, 4, 3, 2]
    })
    this._soundSystem = new johnny.Led(13)
    this._gasSensor = new johnny.Sensor('A2')
    this._dhtSensor = new DHT(board, 'A2')
  }

  startComponents () {
    this.boardReady = true
    this.initialize()
  }

  get workingLED () {
    return this._workingLED
  }

  get display () {
    return this._display
  }

  get soundSystem () {
    return this._soundSystem
  }

  get gasSensor () {
    return this._gasSensor
  }

  get dht () {
    return this._dhtSensor
  }
}

export default new SystemsComponents()