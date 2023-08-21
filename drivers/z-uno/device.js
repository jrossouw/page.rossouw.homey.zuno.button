'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class MyDevice extends ZwaveDevice {

  async onNodeInit() {
    // Register capabilities & command classes
    this.registerCapability('onoff', 'SWITCH_BINARY', { multiChannelNodeId: 2 });
    this.registerCapability('measure_battery', 'BATTERY', {
      multiChannelNodeId: 3,
      get: 'SWITCH_MULTILEVEL_GET',
      getOpts: {
        getOnStart: true,
      },
      report: 'SWITCH_MULTILEVEL_REPORT',
      reportParser: (report) => this.voltageReportParser(report),
    });

    this.log('MyDevice onNodeInit');
  }

  voltageReportParser(report) {
    const voltageValue = Math.round((report['Value (Raw)'].readUIntBE(0, 1) / 99) * 10);
    this.log('Voltage mode', voltageValue);
    return voltageValue;
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.registerCapabilityListener('onoff', async (value) => {
      await this.setCapabilityValue({ on: value });
      this._setCapabilityValue('onoff', 'SWITCH_BINARY', value);
    });

    this.log('MyDevice has been initialized');
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
