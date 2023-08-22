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
        getOnStart: false,
      },
      report: 'SENSOR_MULTILEVEL_REPORT',
      reportParser: (report) => this.VoltageReportParser(report),
    });

    // register a settings parser
    this.registerSetting('always_on', (value) => new Buffer([value === true ? 0 : 1]));

    // register a report listener
    this.registerReportListener(
      'SWITCH_BINARY',
      'SWITCH_BINARY_REPORT',
      (rawReport, parsedReport) => {
        this.log('registerReportListener', rawReport, parsedReport);
      },
    );

    // Set configuration value that is defined in manifest
    await this.configurationSet({ id: 'motion_threshold' }, 10);

    // Or set configuration value that is not defined in manifest
    await this.configurationSet({ index: 1, size: 2 }, 10);

    this.log('MyDevice onNodeInit');
  }

  VoltageReportParser(report) {
    this.log('Received report');
    this.log(report);
    const voltageValue = report['Sensor Value (Parsed)'];
    this.log('Voltage value', voltageValue);
    return voltageValue;
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
