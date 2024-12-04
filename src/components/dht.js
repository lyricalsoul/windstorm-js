import johnny from 'johnny-five'
import { delay, delayMicroseconds, digitalReadPin } from '../utilities.js'

export class DHT {
  constructor (board, pin) {
    this.board = board
    this.pin = new johnny.Sensor(pin)
  }

  async read () {
    /*
    // BUFFER TO RECEIVE
uint8_t bits[5];
uint8_t cnt = 7;
uint8_t idx = 0;

// EMPTY BUFFER
for (int i=0; i< 5; i++) bits[i] = 0;

// REQUEST SAMPLE
pinMode(pin, OUTPUT);
digitalWrite(pin, LOW);
delay(18);
digitalWrite(pin, HIGH);
delayMicroseconds(40);
pinMode(pin, INPUT);
     */
    let bits = []
    let cnt = 7
    let idx = 0

    // EMPTY BUFFER
    bits = [0, 0, 0, 0, 0]

    // REQUEST SAMPLE
    this.board.pinMode(this.pin, 2)
    this.board.digitalWrite(this.pin, 0)
    delay(18)
    this.board.digitalWrite(this.pin, 1)
    delayMicroseconds(40)

    /*
    unsigned int loopCnt = 10000;
while(digitalRead(pin) == LOW)
if (loopCnt-- == 0) return -2;

loopCnt = 10000;
while(digitalRead(pin) == HIGH)
if (loopCnt-- == 0) return -2;
     */

    let loopCnt = 10000
    while (await digitalReadPin(this.board, this.pin) === 0) {
      if (loopCnt-- === 0) return -2
    }

    loopCnt = 10000
    while (await digitalReadPin(this.board, this.pin) === 1) {
      if (loopCnt-- === 0) return -2
    }

    /*
    for (int i=0; i<40; i++)
{
loopCnt = 10000;
while(digitalRead(pin) == LOW)
  if (loopCnt-- == 0) return -2;

unsigned long t = micros();

loopCnt = 10000;
while(digitalRead(pin) == HIGH)
  if (loopCnt-- == 0) return -2;

if ((micros() - t) > 40) bits[idx] |= (1 << cnt);
if (cnt == 0)   // next byte?
{
  cnt = 7;    // restart at MSB
  idx++;      // next byte!
}
else cnt--;
}
     */
    for (let i = 0; i < 40; i++) {
      loopCnt = 10000
      while (await digitalReadPin(this.board, this.pin) === 0) {
        if (loopCnt-- === 0) return -2
      }

      let t = Date.now()

      loopCnt = 10000
      while (await digitalReadPin(this.board, this.pin) === 1) {
        if (loopCnt-- === 0) return -2
      }

      if ((Date.now() - t) > 40) bits[idx] |= (1 << cnt)
      if (cnt === 0) {
        cnt = 7
        idx++
      } else {
        cnt--
      }
    }

    const humidity = bits[0]
    const temp = bits[2]

    let sum = bits[0] + bits[2]
    if (bits[4] !== sum) {
      return -1
    }

    return [humidity, temp]
  }
}