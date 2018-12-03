/*
TuyAPI node.js

Derived from
Dave Gutheinz's TP-LinkHub - Version 1.0

Forked and updated to work with latestcodetheweb/tuyapi
-Ecallegari

*/

//##### Options for this program ###################################
var logFile = "yes"	//	Set to no to disable error.log file.
var hubPort = 8083	//	Synched with Device Handlers.
//##################################################################

//---- Determine if old Node version, act accordingly -------------
console.log("Node.js Version Detected:   " + process.version)
var oldNode = "no"
if (process.version == "v6.0.0-pre") {
	oldNode ="yes"
	logFile = "no"
}

//---- Program set up and global variables -------------------------
var http = require('http')
var net = require('net')
var fs = require('fs')
const TuyaDevice = require('tuyapi')

var server = http.createServer(onRequest)

//---- Start the HTTP Server Listening to SmartThings --------------
server.listen(hubPort)
console.log("TuyAPI Hub Console Log")
logResponse("\n\r" + new Date() + "\rTuyAPI Hub Error Log")

//---- Command interface to Smart Things ---------------------------
function onRequest(request, response){
	var command = 	request.headers["command"]
	var deviceIP = 	request.headers["tuyapi-ip"]
	
	var cmdRcvd = "\n\r" + new Date() + "\r\nIP: " + deviceIP + " sent command " + command
	console.log(" ")
	console.log(cmdRcvd)
		
	switch(command) {
		//---- (BridgeDH - Poll for Server APP ------------------
		case "pollServer":
			response.setHeader("cmd-response", "ok")
			response.end()
			var respMsg = "Server Poll response sent to SmartThings"
			console.log(respMsg)
		break

		//---- TP-Link Device Command ---------------------------
		case "deviceCommand":
			processDeviceCommand(request, response)
			break
	
		default:
			response.setHeader("cmd-response", "InvalidHubCmd")
			response.end()
			var respMsg = "#### Invalid Command ####"
			var respMsg = new Date() + "\n\r#### Invalid Command from IP" + deviceIP + " ####\n\r"
			console.log(respMsg)
			logResponse(respMsg)
	}
}

//---- Send deviceCommand and send response to SmartThings ---------
function processDeviceCommand(request, response) {
	
	var deviceIP = request.headers["tuyapi-ip"]
	var deviceID = request.headers["tuyapi-devid"]
	var localKey = request.headers["tuyapi-localkey"]
	var command =  request.headers["tuyapi-command"]

//ec        var dps = request.headers["dps"]
//ec        var action = request.headers["action"]

//#################################################
//ADDED LINES
//ec	var deviceNo = request.headers["deviceno"]
//ec	response.setHeader("deviceNo", deviceNo)
//#################################################
//ec	response.setHeader("action", action)

	var respMsg = "deviceCommand sending to IP: " + deviceIP + " Command: " + command 

	console.log(respMsg)

	var tuya = new TuyaDevice({
//	  type: 'outlet',
	  id: deviceID,
	  key: localKey,
	  ip: deviceIP
	  });

	switch(command) {
		case "off":
	
		tuya.get().then(status => {
			console.log('Status:', status);

	  	tuya.set({set: false}).then(result => {
    			console.log('Result of setting status to off: ' + result);
			response.setHeader("cmd-response", !status );
	    		response.setHeader("tuyapi-onoff", "off");
			console.log("Status (off) sent to SmartThings.");
			response.end();
			return;
			});
		});
		break

		case "on":
		tuya.get().then(status => {
			console.log('Status:', status);

	  	tuya.set({set: true}).then(result => {
    			console.log('Result of setting status to on: ' + result);
			response.setHeader("cmd-response", !status );
	    		response.setHeader("tuyapi-onoff", "on");
			console.log("Status (on) sent to SmartThings.");
			response.end();
			return;
			});
		});

		break

		case "status":
    		tuya.get().then(status => {
			console.log('New status:', status);
			
			response.setHeader("cmd-response", status);
			if (status == "true") {
				response.setHeader("tuyapi-onoff", "on");
			}
			else if (status == "false") {
				response.setHeader("tuyapi-onoff", "off");
			}
			//response.setHeader("tuyapi-onoff", status);
			console.log("Status (" + status + ") sent to SmartThings.");
			response.end();
			return;// Ecallegari
		});
		break

		default:
//ecallegari			tuya.destroy();
			console.log('Unknown request');
			return; //Eugene
	
	}  	
}

//----- Utility - Response Logging Function ------------------------
function logResponse(respMsg) {
	if (logFile == "yes") {
		fs.appendFileSync("error.log", "\r" + respMsg)
	}
}

