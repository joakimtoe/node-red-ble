# Node-RED BLE Nodes
Node-RED nodes for interfacing Bluetooth Low Energy devices.

## Install
* Node-RED BLE nodes are using [noble](https://github.com/sandeepmistry/noble) and [noble-device](https://github.com/sandeepmistry/noble-device) Node.js modules. So first install the prerequisites for [these](https://github.com/sandeepmistry/noble#prerequisites).
* To install the BLE nodes use npm: `npm install node-red-contrib-ble`

## uartBLE
A node for interfacing Nordic Semiconductor's ble_app_uart SDK example running on Nordic's development kits:  
http://developer.nordicsemi.com/  
http://infocenter.nordicsemi.com/

## genericBLE
A node for interfacing any BLE peripheral device. In the node settings specify the service UUID, characteristic UUID and if the characteristic supports write, read and/or notifications.
