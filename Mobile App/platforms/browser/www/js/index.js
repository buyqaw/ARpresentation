function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function UpdateTable(updating) {
    var out = '';
    for (var i = 0; i < updating.length; i++) {
      out = out + '<tr><td><img src="';
      out = out + updating[i]["img"] + '" class="w3-left w3-circle w3-margin-right" style="width:35px"></td><td>';
      out = out + updating[i]["text"] + "</td><td><i>";
      out = out + updating[i]["time"] + '</i></td></tr>';
    }
    document.getElementById("update").innerHTML = out;
}

// only works for ASCII characters
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// Nordic UART Service
var SERVICE_UUID = '000000FF-B5A3-F393-E0A9-E50E24DCCA9E';
var TX_UUID = '000000F0-B5A3-F393-E0A9-E50E24DCCA9E';
var RX_UUID = '000000F1-B5A3-F393-E0A9-E50E24DCCA9E';
var update = []


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        sendButton.addEventListener('touchstart', this.updateCharacteristicValue, false);
    },
    onDeviceReady: function() {
      // var today = new Date();
      // var time = today.getHours() + ":" + today.getMinutes();
      // var update[0] = {"text": "Приложение включилось", "img": "img/on.png", "time": time};
      // UpdateTable(update);

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(app.onBluetoothStateChange);

        // 2 different ways to create the service: API calls or JSON
        //app.createService();
        app.createServiceJSON();

    },
    createService: function() {
        // https://learn.adafruit.com/introducing-the-adafruit-bluefruit-le-uart-friend/uart-service
        // Characteristic names are assigned from the point of view of the Central device

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        Promise.all([
            blePeripheral.createService(SERVICE_UUID),
            blePeripheral.addCharacteristic(SERVICE_UUID, TX_UUID, property.WRITE, permission.WRITEABLE),
            blePeripheral.addCharacteristic(SERVICE_UUID, RX_UUID, property.READ | property.NOTIFY, permission.READABLE),
            blePeripheral.publishService(SERVICE_UUID),
            blePeripheral.startAdvertising(SERVICE_UUID, 'UART')
        ]).then(
            function() { console.log ('Created UART Service'); },
            app.onError
        );

        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
    },
    createServiceJSON: function() {
        // https://learn.adafruit.com/introducing-the-adafruit-bluefruit-le-uart-friend/uart-service
        // Characteristic names are assigned from the point of view of the Central device

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        var uartService = {
            uuid: SERVICE_UUID,
            characteristics: [
                {
                    uuid: TX_UUID,
                    properties: property.WRITE,
                    permissions: permission.WRITEABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Transmit'
                        }
                    ]
                },
                {
                    uuid: RX_UUID,
                    properties: property.READ | property.NOTIFY,
                    permissions: permission.READABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Receive'
                        }
                    ]
                }
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(uartService),
            blePeripheral.startAdvertising(uartService.uuid, 'UART')
        ]).then(
            function() { outputDiv.innerHTML = 'Вкл.'; },
            app.onError
        );
    },
    updateCharacteristicValue: function() {
        var input = '1';
        var bytes = stringToBytes(input.value);

        var success = function() {
            outputDiv.innerHTML += messageInput.value + '<br/>';
            console.log('Updated RX value to ' + input.value);
        };
        var failure = function() {
            console.log('Error updating RX value.');
        };

        blePeripheral.setCharacteristicValue(SERVICE_UUID, RX_UUID, bytes).
            then(success, failure);

    },
    didReceiveWriteRequest: function(request) {
        var message = bytesToString(request.value);
        console.log(message);
        if(message!="0"){
          // var today = new Date();
          // var time = today.getHours() + ":" + today.getMinutes();
          // update[update.length] = {"text": "Вы зашли в ЗК", "img": "img/zk.jpg", "time": time};
          // UpdateTable(update);
          rps();
        }
    },
    onBluetoothStateChange: function(state) {
        console.log('Bluetooth State is', state);
        if(state == "off"){
          outputDiv.innerHTML = 'Выкл.';
        }

    }
};


function rps() {
    var computerScore = document.getElementById('exit');
    var number = computerScore.innerHTML;
    number++;
    computerScore.innerHTML = number;
}

app.initialize();
