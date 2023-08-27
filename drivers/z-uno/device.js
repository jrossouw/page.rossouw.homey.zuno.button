'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class MyDevice extends ZwaveDevice {

  onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.log(node);

    this.registerCapability('onoff', 'SWITCH_BINARY', {
      multiChannelNodeId: 1,
      getOpts: {
        // Only use these options when a device doesn't automatically report its values
        getOnStart: true, // get the initial value on app start (only use for non-battery devices)
        // getOnOnline: true, // use only for battery devices
        pollInterval: 'poll_interval', // maps to device settings
      },
      getParserV3: (value, opts) => ({}),
    });

    this.registerCapability('measure_voltage', 'SENSOR_MULTILEVEL', {
      multiChannelNodeId: 2,
      get: 'SENSOR_MULTILEVEL_GET',
      getOpts: {
        getOnStart: true,
      },
      report: 'SENSOR_MULTILEVEL_REPORT',
      reportParser: (report) => this.multiChannelReportParser(report, 2),
    });

    this.registerCapability('alarm_motion', 'ALARM', {
      multiChannelNodeId: 3,
      get: 'SENSOR_ALARM_GET',
      getOpts: {
        getOnStart: false,
      },
      report: 'ALARM_REPORT',
      reportParser: (report) => this.multiChannelReportParser(report, 3),
    });

    this.log('MyDevice onNodeInit');
  }

  multiChannelReportParser(report, channel) {
    this.log('Received report');
    this.log(report);
    let value = null;
    if (channel === 2) {
      value = report['Sensor Value (Parsed)'];
      this.log('Voltage value ', value);
    }
    if (channel === 3) {
      const level = report['Alarm level'];
      value = level === 0;
      this.log('Alarm level ', value);
    }
    return value;
  }

  // Overwrite the default setting save message
  customSaveMessage(oldSettings, newSettings, changedKeysArr) {
    return {
      en: 'Test message',
    };
  }

  // Overwrite the onSettings method, and change the Promise result
  async onSettings(oldSettings, newSettings, changedKeysArr) {
    await super.onSettings(oldSettings, newSettings, changedKeysArr);
    return 'Success!';
  }

}

module.exports = MyDevice;
