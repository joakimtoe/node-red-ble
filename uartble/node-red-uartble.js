module.exports = function(RED) {
    "use strict";
    var UartBLE = require("node-uartble");

    function UartBLENode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.topic = n.topic;
        this.ble_addr = n.ble_addr;
        if (this.ble_addr === "") { this.ble_addr = undefined; }
        var node = this;
        node.discovering = false;

        node.loop = setInterval(function() {
          if (!node.discovering) {
              node.status({fill:"blue", shape:"dot", text:"discovering..."});
              node.discovering = true;
              UartBLE.discover(function(UartBLE) {
                  node.status({fill:"blue", shape:"dot", text:"connecting"});
                  //node.UartBLE = UartBLE;
                  node.log("found ble_app_uart: " + UartBLE._peripheral.uuid);
                  node.topic = node.topic || UartBLE._peripheral.uuid;

                  UartBLE.on('disconnect', function() {
                      node.discovering = false;
                      node.status({fill:"red", shape:"ring", text:"disconnected"});
                      node.log("disconnected ",node.uuid);
                  });

                  UartBLE.connectAndSetUp(function(error) {
                      node.log("connected to ble_app_uart: " + UartBLE._peripheral.uuid);
                      node.status({fill:"green", shape:"dot", text:"connected"});

                      node.UartBLE = UartBLE;

                      UartBLE.on('dataRecvd', function(data){
                          node.log('dataRecvd: ' + data);
                          var data_str = data.toString('utf8')
                          var msg = { payload:data_str }
                          node.send(msg);
                      });

                      UartBLE.start(function(error, data) {
                        node.log('Started: ' + data);
                      });
                  });
              });
          }
        },15000);

        node.on('input', function(msg) {
            //new Buffer('Hei på deg verden!')
            if (node.UartBLE) {
                node.UartBLE.send(Buffer(msg.payload), function(){
                    node.log('Sent!');
                });
            }
        });

        node.on("close", function() {
          if (node.loop) { clearInterval(node.loop); }
          if (node.UartBLE) { node.UartBLE.disconnect(function() {node.log('Disconnect');}); }
        });
    }
    RED.nodes.registerType("uartBLE", UartBLENode);
}
