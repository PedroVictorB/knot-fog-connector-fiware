import * as socket from 'socket.io-client';
import { iota } from '../config';

const iotaUrl = `http://${iota.host}:${iota.port}`;

class Connector {
  async start() {
    this.ioc = socket.connect(iotaUrl);

    // TODO: Remove events after tests
    this.ioc.on('error', () => { console.log('Socket error.'); });
    this.ioc.on('disconnect', () => { console.log('Socket disconnect.'); });
    this.ioc.on('reconnect', () => { console.log('Socket reconnected.'); });
    this.ioc.on('reconnect_attempt', () => { console.log('Socket attempt.'); });
    this.ioc.on('reconnecting', () => { console.log('Socket reconnecting.'); });
    this.ioc.on('reconnect_error', () => { console.log('Socket reconnect error.'); });
    this.ioc.on('reconnect_failed', () => { console.log('Socket reconnect failed.'); });

    return new Promise((resolve, reject) => {
      this.ioc.on('connect', () => { resolve(`Connected to ${iotaUrl}`); });
      this.ioc.on('connect_error', () => { reject(new Error(`Connection to ${iotaUrl} error.`)); });
      this.ioc.on('connect_timeout', () => { reject(new Error(`Connection to ${iotaUrl} timeout.`)); });
    });
  }

  async addDevice(device) {
    return new Promise((resolve, reject) => {
      this.ioc.emit('addDevice', device, (response) => {
        if (response === 'ok') {
          resolve(response);
        } else {
          reject(new Error(`Error adding device ${device.id}: ${response}`));
        }
      });
    });
  }

  async removeDevice(id) {
    return new Promise((resolve, reject) => {
      this.ioc.emit('removeDevice', id, (response) => {
        if (response === 'ok') {
          resolve(response);
        } else {
          reject(new Error(`Error removing device ${id}: ${response}`));
        }
      });
    });
  }

  async listDevices() {
    return new Promise((resolve, reject) => {
      this.ioc.emit('listDevices', (response) => {
        if (response) {
          resolve(response);
        } else {
          reject(new Error(`Listing devices: ${response}`));
        }
      });
    });
  }

  // Device (fog) to cloud

  async publishData(id, data) {
    return new Promise((resolve, reject) => {
      this.ioc.emit('publishData', id, data, (response) => {
        if (response === 'ok') {
          resolve(response);
        } else {
          reject(new Error(`Error updating data for device ${id}: ${response}`));
        }
      });
    });
  }

  async updateSchema(id, schema) {
    return new Promise((resolve, reject) => {
      this.ioc.emit('updateSchema', id, schema, (response) => {
        if (response === 'ok') {
          resolve(response);
        } else {
          reject(new Error(`Error updating schema for device ${id}: ${response}`));
        }
      });
    });
  }

  async updateProperties(id, properties) {
    return new Promise((resolve, reject) => {
      this.ioc.emit('updateProperties', id, properties, (response) => {
        if (response === 'ok') {
          resolve(response);
        } else {
          reject(new Error(`Error updating properties for device ${id}: ${response}`));
        }
      });
    });
  }

  // Cloud to device (fog)

  // cb(event) where event is { id, config: {} }
  onConfigUpdated(cb) {
    this.ioc.on('onConfigUpdated', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, properties: {} }
  onPropertiesUpdated(cb) {
    this.ioc.on('onPropertiesUpdated', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, sensorId }
  onDataRequested(cb) {
    this.ioc.on('onDataRequested', (data) => {
      cb(data);
    });
  }

  // cb(event) where event is { id, sensorId, data }
  onDataUpdated(cb) {
    this.ioc.on('onDataUpdated', (device, attributes) => {
      const sensorId = device.id;
      let id = null;
      const data = attributes.value;
      const sat = device.staticAttributes;
      for (let i = 0; i < sat.length; i += 1) {
        if (sat[i].name === 'thing') {
          id = sat[i].value;
        }
      }
      cb(id, sensorId, data);
    });
  }
}

export { Connector }; // eslint-disable-line import/prefer-default-export
