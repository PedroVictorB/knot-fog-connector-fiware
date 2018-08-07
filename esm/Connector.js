import * as socket from 'socket.io-client';
import { iota } from '../config';

const iotaUrl = `http://${iota.host}:${iota.port}`;

class Connector {
  async start() { // eslint-disable-line no-empty-function
    this.ioc = socket.connect(iotaUrl);
    console.log(this.ioc);
    if (this.ioc.connected) {
      return Promise.resolve(`Connected to ${iotaUrl}`);
    }
    return Promise.reject(new Error(`Error connecting to IoT Agent (${iotaUrl})`));
  }

  async addDevice(device) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.emit('addDevice', device, (response) => {
      if (response === 'ok') {
        return Promise.resolve(`Device ${device.id} added`);
      }
      return Promise.reject(new Error(`Error adding device ${device.id}: ${response}`));
    });
  }

  async removeDevice(id) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.emit('removeDevice', id, (response) => {
      if (response === 'ok') {
        return Promise.resolve(`Device ${id} removed`);
      }
      return Promise.reject(new Error(`Error removing device ${id}: ${response}`));
    });
  }

  // Device (fog) to cloud

  async publishData(id, data) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.emit('publishData', id, data, (response) => {
      if (response === 'ok') {
        return Promise.resolve(`Device ${id} data published`);
      }
      return Promise.reject(new Error(`Error updating data for device ${id}: ${response}`));
    });
  }

  async updateSchema(id, schema) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.emit('updateSchema', id, schema, (response) => {
      if (response === 'ok') {
        return Promise.resolve(`Device ${id} schema updated`);
      }
      return Promise.reject(new Error(`Error updating schema for device ${id}: ${response}`));
    });
  }

  async updateProperties(id, properties) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.emit('updateProperties', id, properties, (response) => {
      if (response === 'ok') {
        return Promise.resolve(`Device ${id} properties updated`);
      }
      return Promise.reject(new Error(`Error updating properties for device ${id}: ${response}`));
    });
  }

  // Cloud to device (fog)

  // cb(event) where event is { id, config: {} }
  onConfigUpdated(cb) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.on('onConfigUpdated', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, properties: {} }
  onPropertiesUpdated(cb) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.on('onPropertiesUpdated', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, sensorId }
  onDataRequested(cb) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.on('onDataRequested', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, sensorId, data }
  onDataUpdated(cb) { // eslint-disable-line no-empty-function,no-unused-vars
    this.ioc.on('onDataUpdated', (data) => {
      cb(data);
    });
  }

  onTest() {
    this.ioc.emit('123');
  }
}

export { Connector }; // eslint-disable-line import/prefer-default-export
