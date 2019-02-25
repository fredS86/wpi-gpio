/**
 * wpi-gpio - Wrapper around the WiringPi gpio command-line utility
 * https://github.com/gavinhungry/wpi-gpio
 */

(() =>  {
  'use strict';

  const exec = require('child_process').exec;

  const gpio = module.exports;
  gpio.BCM_GPIO = false;

  /**
   * Exec a call to gpio
   *
   * @param {String} method
   * @param {Number|String} pin
   * @param {Array} [args]
   * @return {Promise}
   */
  let gpioExec = (method, pin, args) => {
    pin = parseInt(pin, 10) || 0;
    args = args || [];

    let flag = gpio.BCM_GPIO ? '-g' : '';
    let cmd = ['gpio', flag, method, pin, args.join(' ')].join(' ');
    cmd = cmd.replace(/\s+/g, ' ').trim();

    return new Promise((res, rej) => {
      exec(cmd, (err, stdout, stderr) => {
        return err ? rej(stderr) : res(stdout);
      });
    });
  };

  /**
   * Set an input pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.input = pin => {
    return gpioExec('mode', pin, ['in']);
  };

  /**
   * Set an output pin
   *
   * @param {Number|String} pin
   * @param {Number} [val]
   * @return {Promise}
   */
  gpio.output = (pin, val) => {
    return gpio.write(pin, val).then(() =>  {
      return gpioExec('mode', pin, ['out']);
    });
  };

  /**
   * Set pull up resistor on a pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.pullUp = pin => {
    return gpioExec('mode', pin, ['up']);
  };

  /**
   * Set pull down resistor on a pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.pullDown = pin => {
    return gpioExec('mode', pin, ['down']);
  };

  /**
   * Set tri state for a pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.triState = pin => {
    return gpioExec('mode', pin, ['tri']);
  };

  /**
   * Read the value of a pin
   *
   * @param {Number|String} pin
   * @return {Promise} -> {Number}
   */
  gpio.read = pin => {
    return gpioExec('read', pin).then(val => {
      return parseInt(val, 10);
    });
  };

  /**
   * Set the value of an output pin
   *
   * @param {Number|String} pin
   * @param {Number} val
   * @return {Promise}
   */
  gpio.write = (pin, val) => {
    if (val === undefined) {
      return Promise.resolve();
    }

    return gpioExec('write', pin, [val ? 1 : 0]);
  };

  /**
   * Non-busy wait for a rising edge of an input pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.rising = (pin) => {
    return gpioExec('wfi', pin, ['rising']);
  };

  /**
   * Non-busy wait for a falling edge of an input pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.falling = (pin) => {
    return gpioExec('wfi', pin, ['falling']);
  };

  /**
   * Non-busy wait for a rising or falling edge of an input pin
   *
   * @param {Number|String} pin
   * @return {Promise}
   */
  gpio.edge = (pin) => {
    return gpioExec('wfi', pin, ['both']);
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
  };

})();
