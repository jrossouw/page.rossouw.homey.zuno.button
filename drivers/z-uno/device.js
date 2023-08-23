'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class MyDevice extends ZwaveDevice {

  async onMeshInit() {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    // register the `onoff` capability with COMMAND_CLASS_SWITCH_BINARY while overriding the default system
    // capability handler
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

    this.registerCapabilityListener('onoff', async (value, opts) => {
      console.log(`Sending ${value}`);
      try {
        console.log(this.node.MultiChannelNodes[1].CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET);
        const result = this.node.MultiChannelNodes[1].CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_GET();
        this.log(result);
        await this.node.MultiChannelNodes[1].CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET({
          'Target Value': value ? 'on/enable' : 'off/disable',
          'Duration': 'Default',
        });
        return Promise.resolve();
      } catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
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
        getOnStart: true,
      },
      report: 'ALARM_REPORT',
      reportParser: (report) => this.multiChannelReportParser(report, 3),
    });

    // register a settings parser
    this.registerSetting('always_on', (value) => new Buffer([value === true ? 0 : 1]));

    // Set configuration value that is defined in manifest
    await this.configurationSet({ id: 'motion_threshold' }, 10);

    // Or set configuration value that is not defined in manifest
    await this.configurationSet({ index: 1, size: 2 }, 10);

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
