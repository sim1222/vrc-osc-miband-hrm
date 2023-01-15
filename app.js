const osc = require("osc");
const WebSocket = require('ws');
const open = require('open');

const server = new WebSocket.Server({ port: 3228});

let vrchatOSC = new osc.UDPPort({
    remoteAddress: "localhost",
    remotePort: 9000,
    metadata: true
});

let sendToChatbox = "false";
let chatboxText = "❤{HR} bpm";

vrchatOSC.open();
open('https://sim1222.github.io/vrc-osc-miband-hrm/html/');
console.log("Waiting for connection from browser...");

server.on('connection', ws => {
    console.log("Connected. Waiting for data...");
    ws.on('message', function message(data) {
        let chatbox_text = JSON.parse(data).text;
        let data_string = data.toString();
        if(chatbox_text) {
            chatboxText = chatbox_text;
        } else if(data_string === "true" || data_string === "false") {
            sendToChatbox = data_string;
        } else {
            if (data === "0") {
                console.log("Got heart rate: 0 bpm, skipping parameter update...");
            } else {
                console.log('Got heart rate: %s bpm', data);
                let heartrate = {
                    address: "/avatar/parameters/Heartrate",
                    args:
                        {
                            type: "f",
                            // value: data / 127 - 1
                            value: data / 255
                        }
                };
                let heartrate2 = {
                    address: "/avatar/parameters/Heartrate2",
                    args:
                        {
                            type: "f",
                            value: data/255
                        }
                };
                let heartrate3 = {
                    address: "/avatar/parameters/Heartrate3",
                    args:
                        {
                            type: "i",
                            value: data
                        }
                };
                // let calories = {
                //     address: "/avatar/parameters/Calories",
                //     args:
                //     {
                //         type: "f",
                //         value: data / 255
                //     }
                // }
                vrchatOSC.send(heartrate);
                vrchatOSC.send(heartrate2);
                vrchatOSC.send(heartrate3);

                if(sendToChatbox === "true") {

                    let text = chatboxText.replace("{HR}", data_string)+"    "
                    // console.log('send '+ text);

                    let heartrate_chatbox = {
                        address: "/chatbox/input",
                        args: [
                            { type: "s", value: text},
                            { type: "T", value: true}
                        ],
                    };

                    vrchatOSC.send(heartrate_chatbox);
                }
            }
        }
    });
});