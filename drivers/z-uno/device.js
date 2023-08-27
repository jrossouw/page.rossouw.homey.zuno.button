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
        getOnOnline: true,
        pollInterval: 'poll_interval', // maps to device settings
      },
      getParserV3: (value, opts) => ({}),
    });

    this.registerCapability('measure_voltage', 'SENSOR_MULTILEVEL', {
      multiChannelNodeId: 2,
      get: 'SENSOR_MULTILEVEL_GET',
      getOpts: {
        getOnOnline: true,
      },
      report: 'SENSOR_MULTILEVEL_REPORT',
      reportParser: (report) => this.multiChannelReportParser(report, 2),
    });

    this.registerCapability('alarm_motion', 'ALARM', {
      multiChannelNodeId: 3,
      get: 'ALARM_GET',
      getOpts: {
        getOnOnline: true,
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
      this.log(report['Alarm Level (Raw)'][0]);
      value = true;
      this.log('Alarm level ', value);
    }
    return value;
  }

  async getAlarmValue() {
    try {
      const answer = await this.node.MultiChannelNodes['3'].CommandClass['COMMAND_CLASS_ALARM'].ALARM_GET();
      this.log('Alarm GET Answer: ');
      this.log(answer['Alarm Level (Raw)'][0]);
      return answer;
    } catch (err) {
      this.error(err);
      return 0;
    }
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
