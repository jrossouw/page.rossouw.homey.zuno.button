'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

const alarm_channel = 1;
const switch_channel = 2;
const voltage_channel = 3;

class MyDevice extends ZwaveDevice {

  onNodeInit({ node }) {

    // enable debugging
    this.enableDebug();

    this.log('Print the node info to the console');
    this.printNode();

    this.log('Log node');
    this.log(node);

    this.registerCapability('alarm_motion', 'NOTIFICATION', {
      multiChannelNodeId: alarm_channel,
      get: 'ALARM_GET',
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerReportListener('NOTIFICATION', 'NOTIFICATION_REPORT', (report) => {
      if (report) {
        switch (report['Notification Type']) {
          case 'Home Security':
            this.log(report);
            this.setCapabilityValue('alarm_motion', report['Event'] !== 0);
            break;
          default:
          // Do nothing
        }
      }
    });

    this.registerCapability('onoff', 'SWITCH_BINARY', {
      multiChannelNodeId: switch_channel,
      get: 'SWITCH_BINARY_GET',
      set: 'SWITCH_BINARY_SET',
      report: 'SWITCH_BINARY_REPORT',
      getOpts: {
        getOnOnline: true,
        pollInterval: 'poll_interval', // maps to device settings
      },
      setParserV1: (input) => {
        this.log('SetParser:', input);
        this.setSwitch(input);
      },
      reportParser: (report) => this.multiChannelReportParser(report, switch_channel),
    });

    this.registerCapability('measure_voltage', 'SENSOR_MULTILEVEL', {
      multiChannelNodeId: 3,
      get: 'SENSOR_MULTILEVEL_GET',
      getOpts: {
        getOnOnline: true,
      },
      report: 'SENSOR_MULTILEVEL_REPORT',
      reportParser: (report) => this.multiChannelReportParser(report, voltage_channel),
    });

    this.registerSetting('64', value => new Buffer([value]));
    this.registerSetting('65', value => new Buffer([value]));

    this.log('MyDevice onNodeInit');
  }

  multiChannelReportParser(report, channel) {
    this.log('Received report');
    this.log(report);
    let value = null;
    if (channel === voltage_channel) {
      value = report['Sensor Value (Parsed)'];
      this.log('Voltage value ', value);
    }
    if (channel === alarm_channel) {
      this.log(report['Alarm Level (Raw)'][0]);
      value = true;
      this.log('Alarm level ', value);
    }
    return value;
  }

  async setSwitch(value) {
    try {
      const switchNode = this.node.MultiChannelNodes['2'];
      this.log(switchNode);
      await switchNode.CommandClass.COMMAND_CLASS_BASIC.BASIC_SET({ Value: value });
    } catch (err) {
      this.error(err);
    }
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
