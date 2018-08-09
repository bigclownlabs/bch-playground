const { ipcMain } = require("electron");
const ConfigStore = require("../utils/ConfigStore");

var settings = new ConfigStore("settings.json", {
    "language": "en",
    "mqtt.ip": "127.0.0.1"
});

function setup() {
    ipcMain.on("settings/get", (event, key) => {
        console.log("settings/get", key, settings.get(key));
        event.sender.send("settings/value/" + key , settings.get(key) )
    });

    ipcMain.on("settings/getAll", (event, dummy) => {
        event.sender.send("settings/all" , settings.getAll() )
    });

    ipcMain.on("settings/set", (event, data) => {
        console.log("settings/set", data);
        settings.set(data.key, data.value);
    });
}

module.exports = {
    setup
}
