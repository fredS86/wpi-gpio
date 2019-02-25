/**
 * wpi-gpio - Wrapper around the WiringPi gpio command-line utility
 * https://github.com/gavinhungry/wpi-gpio
 */

(() => {
  'use strict';

  const tap = require('tap');
  const proxyquire = require('proxyquire');

  let cmds = [];
  let stdout = '';

  const gpio = proxyquire('../wpi-gpio', {
    child_process: {
      exec: (cmd, callback) => {
        cmds.push(cmd);
        callback(null, stdout, '');
      }
    }
  });

  tap.beforeEach(done => {
    cmds = [];
    gpio.BCM_GPIO = false;

    done();
  });

  tap.test('should set pin as input', t => {
    return gpio.input(3).then(() => {
      t.same(cmds, ['gpio mode 3 in'], 'input method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.input(3).then(() => {
        t.same(cmds, ['gpio -g mode 3 in'], 'input method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should set pin as output', t => {
    return gpio.output(4).then(() => {
      t.same(cmds, ['gpio mode 4 out'], 'output method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.output(4).then(() => {
        t.same(cmds, ['gpio -g mode 4 out'], 'output method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should set pin as output with initial value', t => {
    return gpio.output(5, 1).then(() => {
      t.same(cmds, ['gpio write 5 1', 'gpio mode 5 out'], 'output method with initial value executes correct commands');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.output(5, 1).then(() => {
        t.same(cmds, ['gpio -g write 5 1', 'gpio -g mode 5 out'], 'output method with initial value and BCM_GPIO executes correct commands');
      });
    });
  });

  tap.test('should set pin as input with pull-up resistor', t => {
    return gpio.pullUp(4).then(() => {
      t.same(cmds, ['gpio mode 4 up'], 'input method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.pullUp(4).then(() => {
        t.same(cmds, ['gpio -g mode 4 up'], 'input method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should set pin as input with pull-down resistor', t => {
    return gpio.pullDown(4).then(() => {
      t.same(cmds, ['gpio mode 4 down'], 'input method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.pullDown(4).then(() => {
        t.same(cmds, ['gpio -g mode 4 down'], 'input method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should set pin as input with tri-state', t => {
    return gpio.triState(4).then(() => {
      t.same(cmds, ['gpio mode 4 tri'], 'input method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.triState(4).then(() => {
        t.same(cmds, ['gpio -g mode 4 tri'], 'input method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should read pin value', t => {
    stdout = '1';
    return gpio.read(6).then(val => {
      t.same(cmds, ['gpio read 6'], 'read method executes correct command');
      t.equal(val, 1, 'read method returns numeric value');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.read(6).then(val => {
        t.same(cmds, ['gpio -g read 6'], 'read method with BCM_GPIO executes correct command');
      });
    });
  });

  // this test is duplicated by testing gpio.output with an initial value
  tap.test('should write pin value', t => {
    return gpio.write(7, 0).then(() => {
      t.same(cmds, ['gpio write 7 0'], 'write method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.write(7, 0).then(() => {
        t.same(cmds, ['gpio -g write 7 0'], 'write method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should write pin sequence', t => {
    return gpio.sequence(8, [0, 1, 0]).then(() => {
      t.same(cmds, [
        'gpio mode 8 out', 'gpio write 8 0', 'gpio write 8 1', 'gpio write 8 0'
      ], 'sequence method executes correct commands');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.sequence(8, [0, 1, 0]).then(() => {
        t.same(cmds, [
          'gpio -g mode 8 out', 'gpio -g write 8 0', 'gpio -g write 8 1', 'gpio -g write 8 0'
        ], 'sequence method with BCM_GPIO executes correct commands');
      });
    });
  });

  tap.test('should write pin tap sequence', t => {
    return gpio.tap(9).then(() => {
      t.same(cmds, [
        'gpio mode 9 out', 'gpio write 9 1', 'gpio write 9 0', 'gpio write 9 1'
      ], 'tap method executes correct commands');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.tap(9).then(() => {
        t.same(cmds, [
          'gpio -g mode 9 out', 'gpio -g write 9 1', 'gpio -g write 9 0', 'gpio -g write 9 1'
        ], 'tap method with BCM_GPIO executes correct commands');
      });
    });
  });

  tap.test('should detect a rising edge', t => {
    return gpio.rising(3).then(() => {
      t.same(cmds, ['gpio wfi 3 rising'], 'rising method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.rising(3).then(() => {
        t.same(cmds, ['gpio -g wfi 3 rising'], 'rising method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should detect a falling edge', t => {
    return gpio.falling(3).then(() => {
      t.same(cmds, ['gpio wfi 3 falling'], 'falling method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.falling(3).then(() => {
        t.same(cmds, ['gpio -g wfi 3 falling'], 'falling method with BCM_GPIO executes correct command');
      });
    });
  });

  tap.test('should detect a rising or falling edge', t => {
    return gpio.edge(3).then(() => {
      t.same(cmds, ['gpio wfi 3 both'], 'edge method executes correct command');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.edge(3).then(() => {
        t.same(cmds, ['gpio -g wfi 3 both'], 'edge method with BCM_GPIO executes correct command');
      });
    });
  });

  
  const callback = (t, maxTimes, edge, method) => {
    let expected = [];
    let i = 0;
    return (times) => { 
      expected.push(gpio.BCM_GPIO ? 'gpio -g wfi 3 ' + edge : 'gpio wfi 3 ' + edge);
      i++;
      if (times < maxTimes) {
        return true;
      } else {
        t.same(cmds, expected, method + ' method executes correct command, ' + times + ' times' + (gpio.BCM_GPIO ? ' with BCM_GPIO' : ''));
        t.equals(times, i, method + ' method uses callback ' + times + ' times' + (gpio.BCM_GPIO ? ' with BCM_GPIO' : ''));
        return false;
      } 
    };
  }

  tap.test('should detect 2 rising edges', t => {
    return gpio.irising(3, callback(t, 2, 'rising', 'irising')).then((val) => {
      t.equals(val, 2, 'irising method stops after 2 times');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.irising(3, callback(t, 2, 'rising', 'irising')).then((val) => {
        t.equals(val, 2, 'irising method stops after 2 times with BCM_GPIO');
      });
    });
  });

  tap.test('should detect 2 falling edges', t => {
    return gpio.ifalling(3, callback(t, 2, 'falling', 'ifalling')).then((val) => {
      t.equals(val, 2, 'ifalling method stops after 2 times');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.ifalling(3, callback(t, 2, 'falling', 'ifalling')).then((val) => {
        t.equals(val, 2, 'ifalling method stops after 2 times with BCM_GPIO');
      });
    });
  });

  tap.test('should detect 2 edges', t => {
    return gpio.iedge(3, callback(t, 2, 'both', 'iedge')).then((val) => {
      t.equals(val, 2, 'iedge method stops after 2 times');
    }).then(() => {
      cmds = [];
      gpio.BCM_GPIO = true;
      return gpio.iedge(3, callback(t, 2, 'both', 'iedge')).then((val) => {
        t.equals(val, 2, 'iedge method stops after 2 times with BCM_GPIO');
      });
    });
  });

})();
