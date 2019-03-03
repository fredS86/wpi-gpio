const execSync = require('child_process').execSync;

try {
  execSync('gpio readall')
  var gpio = require('./wpi-gpio');
} catch(e) {
  console.log('gpio not working => using simulator');
  gpio = require('./wpi-gpio-simulator');
}

module.exports = gpio;
