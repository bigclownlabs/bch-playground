"use strict";

const { ipcMain } = require("electron");
const mqtt = require("mqtt");
const { getSettings } = require("../utils/Settings");

const defaultUrl = "127.0.0.1:1883";

// Window list contain reference to itself and MQTT client as well as subscribed topics and messages
let windowList = [];

function setup(ip = defaultUrl, view) {
    var carry = {
        client: mqtt.connect("mqtt://" + ip),
        topics: [],
        history: [],
        view: view
    }
    carry.client.on("message", (topic, message) => {
        var _parse = { topic, payload: message.toString('utf8'), time: new Date().getHours() + ":" + new Date().getMinutes() };
        carry.view.send("mqtt:client:message", _parse);
    })
    carry.client.on("connect", () => {
        carry.view.send("mqtt:client:connected", true);
    })
    carry.client.on("disconnect", () => {
        carry.view.send("mqtt:client:disconnect", true);
    })
    return carry;
}

function findWindow(id) {
    return windowList.find((item) => item.view.id == id);
}

/* TODO?
// Returns subscribed topics and messages for window
ipcMain.on("mqtt:client:history", (event) => {
    console.log("Getting history");
    var window = findWindow(event.sender.id)
    if (window.client.connected && window != null) {
        console.log(window.history);
        window.view.send("mqtt:client:history", window.history);
    }
})

ipcMain.on("mqtt:client:subscribed", (event) => {
    console.log("Getting topics");
    var window = findWindow(event.sender.id)
    if (window.client.connected && window != null) {
        console.log(window.topics);
        window.view.send("mqtt:client:subscribed", window.topics);
    }
})
*/
ipcMain.on("mqtt:client:publish", (event, data) => {
    var window = findWindow(event.sender.id);
    if (window != null && window.client.connected) {
        window.client.publish(data.topic, data.payload);
    }
})

ipcMain.on("mqtt:client:subscribe", (event, data) => {
    var window = findWindow(event.sender.id);
    if (window != null && window.client.connected) {
        window.topics.push(data);
        window.client.subscribe(data);
    }
})

ipcMain.on("mqtt:client:unsubscribe", (event, data) => {
    var window = findWindow(event.sender.id);
    if (window != null && window.client.connected) {
        //window.topics.push(data);
        window.client.unsubscribe(data);
    }
})

// Notify this background that view wants to subscribe to MQTT
ipcMain.on("mqtt:window:subscribe", (event, data) => {
    var window = findWindow(event.sender.id);
    if (window == null) {
        var settings = getSettings();
        if (settings.mqttLog.connectionType[0] == "WebsocketsMQTT") {
            data = settings.mqttLog.websocketsIp + ":8083";
        }
        windowList.push(setup(data, event.sender));
    }
})

// Notify this background that view wants to unsubscribe to MQTT
ipcMain.on("mqtt:window:unsubscribe", (event, data) => {
    var window = findWindow(event.sender.id);
    if (window != null) {
        window.client.end();
        var index = windowList.indexOf(window);
        if (index > -1) {
            windowList.splice(index, 1);
        }
    }
})

module.exports = { setup };
