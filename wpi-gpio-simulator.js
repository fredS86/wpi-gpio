const gpio = module.exports;

const LOW = 0;
const HIGH = 1;
const OUTPUT = 0;
const INPUT = 1;

const _gpio = [];

getPin = (pin) => {
  const defaultPin = {
    mode: OUTPUT,
    value: LOW,
    readValue: LOW,
    rising: [],
    falling: [],
    edge: [],
    interval : undefined,
  };
  _gpio[pin] = _gpio[pin] || defaultPin;
  return _gpio[pin];
}

updateReadValue = (p) => {
  p.readValue = 1 - p.readValue;
  p.edge.forEach(cb => {
    cb.apply();
  });
  p.edge = [];
  if (p.readValue === HIGH) {
    p.rising.forEach(cb => {
      cb.apply();
    })
    p.rising = [];
  } else {
    p.falling.forEach(cb => {
      cb.apply();
    })
    p.falling = [];
  }
};
  
var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  _gpio.filter(p => {return p && p.mode === INPUT;}).forEach((p) => {console.log("pin", p);updateReadValue(p)});
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

/**
 * Set a pin mode
 *
 * @param {Number|String} pin
 * @param {Number} mode
 * @return {Promise}
 */
mode = (pin, mode) => {
  let p = getPin(pin);
  p.mode = mode;
  return Promise.resolve(0);
};

/**
 * Set an input pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.input = (pin) => { 
  return mode(pin, INPUT);
};

/**
 * Set an output pin
 *
 * @param {Number|String} pin
 * @param {Number} [value]
 * @return {Promise}
 */
gpio.output = (pin, value) => {
  return gpio.write(pin, value).then(() =>  {
    return mode(pin, OUTPUT);
  });
};

/**
 * Set the value of an output pin
 *
 * @param {Number|String} pin
 * @param {Number} val
 * @return {Promise}
 */
gpio.write = (pin, value) => {
  if (value === undefined) {
    return Promise.resolve();
  }
  getPin(pin).value = value ? HIGH : LOW;
  return Promise.resolve(0);
};

/**
 * Read the value of a pin
 *
 * @param {Number|String} pin
 * @return {Promise} -> {Number}
 */
gpio.read = (pin) => {
    let p = getPin(pin);
  if (p.mode === OUTPUT) {
    return Promise.resolve(p.value);
  } else {
    return Promise.resolve(p.readValue);
  }
};

/**
 * Set pull up resistor on a pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.pullUp = (pin) => {
  return Promise.resolve(0);
};

/**
 * Set pull down resistor on a pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.pullDown = (pin) => {
  return Promise.resolve(0);
};

/**
 * Set tri state for a pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.triState = (pin) => {
  return Promise.resolve(0);
};

/**
 * Non-busy wait for a rising edge of an input pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.rising = (pin) => {
    return new Promise((res, rej) => {
       let p = getPin(pin);
       p.rising.push(res);
    });
};

/**
 * Non-busy wait for a falling edge of an input pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.falling = (pin) => {
  return new Promise((res, rej) => {
    let p = getPin(pin);
    p.falling.push(res);
 });
};

/**
 * Non-busy wait for a rising or falling edge of an input pin
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.edge = (pin) => {
  return new Promise((res, rej) => {
    let p = getPin(pin);
    p.edge.push(res);
 });
};

/**
 * Infinite non-busy wait for a rising edge 
 * of an input pin. The loop breaks when the
 * callback returns a falsy value;
 *
 * @param {Number|String} pin
 * @param {Function} callback - function called each time a rising edge is detected
 * @return {Promise} -> Callback count
 */
gpio.irising = (pin, callback, times) => {
    times = times || 1;
    return gpio.rising(pin).then((val) => {
        return callback(times, val) ? gpio.irising(pin, callback, ++times) : Promise.resolve(times); 
    });
};

/**
 * Infinite non-busy wait for a falling edge 
 * of an input pin. The loop breaks when the
 * callback returns a falsy value;
 *
 * @param {Number|String} pin
 * @param {Function} callback - function called each time a falling edge is detected
 * @return {Promise} -> Callback count
 */
gpio.ifalling = (pin, callback, times) => {
    times = times || 1;
    return gpio.falling(pin).then((val) => {
        return callback(times, val) ? gpio.ifalling(pin, callback, ++times) : Promise.resolve(times); 
    });
};

/**
 * Infinite non-busy wait for a rising or
 * falling edge of an input pin. The loop
 * breaks when the callback returns a 
 * falsy value;
 *
 * @param {Number|String} pin
 * @param {Function} callback - function called each time a rising or falling edge is detected
 * @return {Promise} -> Callback count
 */
gpio.iedge = (pin, callback, times) => {
    times = times || 1;
    return gpio.edge(pin).then((val) => {
        return callback(times, val) ? gpio.iedge(pin, callback, ++times) : Promise.resolve(times); 
    });
};

/**
 * Set a sequence of values to an output pin
 *
 * @param {Number|String} pin
 * @param {Array} vals - values to write
 * @return {Promise}
 */
gpio.sequence = (pin, vals) => {
  return vals.reduce((p, val) => {
    return p.then(() =>  {
      return new Promise((res, rej) => {
        gpio.write(pin, val).then(() =>  {
          setTimeout(res, 100);
        });
      });
    });
  }, gpio.output(pin));
};

/**
 * Simulate "tapping" an output pin by toggling it once
 *
 * @param {Number|String} pin
 * @return {Promise}
 */
gpio.tap = pin => {
  return gpio.sequence(pin, [1, 0, 1]);
}

