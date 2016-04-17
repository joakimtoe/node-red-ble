module.exports = function(RED) {
    "use strict";
    var NobleDevice = require("noble-device");

    function GenBLENode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.topic = n.topic;
        this.bleaddr = n.bleaddr;
        this.serviceuuid = n.serviceuuid;
        this.charuuid = n.charuuid;
        this.readtype = n.readtype;
        this.writetype = n.writetype;
        this.notiftype = n.notiftype;
        if (this.bleaddr === "") { this.bleaddr = undefined; }
        var node = this;
        node.discovering = false;

        node.log('Generating GenBLE');
        var GenBLE = function(peripheral) {
            NobleDevice.call(this, peripheral);
            this.onDataRecvBinded = this.onDataRecv.bind(this);
        };
        GenBLE.SCAN_UUIDS = [node.serviceuuid];
        NobleDevice.Util.inherits(GenBLE, NobleDevice);

        GenBLE.prototype.onDataRecv = function(data) {
          this.emit('dataRecvd', data);
        };

        node.loop = setInterval(function() {
          if (!node.discovering) {
              node.status({fill:"blue", shape:"dot", text:"discovering..."});
              node.discovering = true;
              GenBLE.discover(function(GenBLE) {
                  node.status({fill:"blue", shape:"dot", text:"connecting"});
                  //node.UartGenBLE = UartGenBLE;
                  node.log("found: " + GenBLE._peripheral.uuid);
                  node.topic = node.topic || GenBLE._peripheral.uuid;

                  GenBLE.on('disconnect', function() {
                      node.discovering = false;
                      node.status({fill:"red", shape:"ring", text:"disconnected"});
                      node.log("disconnected ",node.bleaddr);
                  });

                  GenBLE.connectAndSetUp(function(error) {
                      node.log("connected to: " + GenBLE._peripheral.uuid);
                      node.status({fill:"green", shape:"dot", text:"connected"});

                      node.GenBLE = GenBLE;

                      GenBLE.on('dataRecvd', function(data){
                          node.log('dataRecvd: ' + data);
                          //var data_str = data.toString('utf8')
                          var msg = { payload:data }
                          node.send(msg);
                      });

                      if (node.notiftype) {
                          GenBLE.notifyCharacteristic(node.serviceuuid, node.charuuid, true, GenBLE.onDataRecvBinded, function(error) {
                            node.log('Started: ' + error);
                          });
                      }
                  });
              });
          }
        },15000);

        node.on('input', function(msg) {
            //new Buffer('Hei på deg verden!')
            if (node.writetype) {
                if (node.GenBLE) {
                    node.GenBLE.writeDataCharacteristic(node.serviceuuid, node.charuuid, Buffer(msg.payload), function(){
                        node.log('Sent!');
                    });
                }
            }
        });

        node.on("close", function() {
          if (node.loop) { clearInterval(node.loop); }
          if (node.GenBLE) { node.GenBLE.disconnect(function() {node.log('Disconnect');}); }
        });
    }
    RED.nodes.registerType("genericBLE", GenBLENode);
}
