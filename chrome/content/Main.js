/*
 * Copyright (c) 2010, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * This file is part of the Copper CoAP Browser.
 */
/**
 * \file
 *         Main program code for the Copper CoAP Browser
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);

var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
var coapVersion = prefManager.getIntPref('extensions.copper.coap-version');

var client = null;

var hostname = 'localhost';
var port = 61616;
var path = '/';
var query = '';

var blockSize = 32;

var resourcesCached = true;
var resources = new Array();


// Life cycle functions
////////////////////////////////////////////////////////////////////////////////

function init() {
	
 	// set the Cu icon for all Copper tabs
	// TODO: There must be a more elegant way
	var tabbrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser").getNext().gBrowser;  
	for (var i=0; i<tabbrowser.browsers.length; ++i) {
		if (tabbrowser.mTabs[i].label=='Copper CoAP Browser')
		tabbrowser.setIcon(tabbrowser.mTabs[i], 'chrome://copper/skin/icon16.png');
	}
	
	// get settings from preferences
	document.getElementById('toolbar_auto_discovery').checked = prefManager.getBoolPref('extensions.copper.auto-discover');
	document.getElementById('toolbar_retransmissions').checked = prefManager.getBoolPref('extensions.copper.retransmissions');
	blockSize = prefManager.getIntPref('extensions.copper.default-block-size');
	
	// load CoAP implementation
	switch (coapVersion) {
		case 0: Components.utils.import("resource://mod/CoapPacket00.jsm"); break;
		case 3: Components.utils.import("resource://mod/CoapPacket03.jsm"); break;
		default:
			dump('WARNING: CoAP version '+coapVersion+' not implemented. Using 00.\n');
			alert('WARNING: CoAP version '+coapVersion+' not implemented. Using 00.');
			Components.utils.import("resource://mod/CoapPacket00.jsm"); break;
			coapVersion = 0;
	}
	updateLabel('toolbar_version', 'CoAP version ' + leadingZero(coapVersion,2));
	
	// add well-known resource to resource cache
	resources[WELL_KNOWN_RESOURCES] = new Array();
	resources[WELL_KNOWN_RESOURCES]['n'] = 'Resource discovery';
	
	// open location
	try {
		parseUri(document.location.href);
		
		var temp = new UdpClient(hostname, port);
		client = new TransactionHandler(temp, document.getElementById('toolbar_retransmissions').checked);
		client.register(defaultHandler);
	
		// handle auto discover
		if (document.getElementById('toolbar_auto_discovery').checked) {
			discover();
		} else {
			try {
				parseLinkFormat(prefManager.getCharPref('extensions.copper.resources.'+hostname+':'+port));
			} catch( ex ) {
			    dump('INFO: Main.init [no cache for '+hostname+':'+port+' yet]\n');
			}
		}
		updateResourceLinks();
		
		// handle auto-request after redirect
		var auto = prefManager.getIntPref('extensions.copper.auto-request.method');
		if (auto) {
			switch (auto) {
				case GET:    sendGet(); break;
				case POST:   sendPost(prefManager.getCharPref('extensions.copper.auto-request.payload')); break;
				case GUT:    sendPut(prefManager.getCharPref('extensions.copper.auto-request.payload')); break;
				case DELETE: sendDelete(); break;
				default: dump('WARNING: Main.init [unknown method for auto-request: '+auto+']\n');
			}
			
			// reset auto-request
			prefManager.setIntPref('extensions.copper.auto-request.method', 0);
			prefManager.setCharPref('extensions.copper.auto-request.payload', '');
		}
		
	} catch( ex ) {
	    dump('WARNING: Main.init ['+ex+']\n');
	}
}

function unload() {
	// save as pref as persist does not work
	prefManager.setCharPref('extensions.copper.payloads.'+hostname+':'+port, document.getElementById('toolbar_payload').value);
	prefManager.setBoolPref('extensions.copper.auto-discover', document.getElementById('toolbar_auto_discovery').checked);
	prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
	
	client.shutdown();
}


// CoAP packet handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming packets, registered as default at TransactionHandler
function defaultHandler(packet) {
	dump('defaultHandler()\n');

	updateLabel('info_code', packet.getCode());
	updateLabel('packet_header', 'Type: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions() );
	
	// if message turns out to be block-wise transfer dispatch to corresponding handler
	if (packet.options[OPTION_BLOCK][1]) {
		return blockwiseHandler(packet);
	}
	
	updateLabel('packet_payload', packet.payload);
}

// Handle packets with block-wise transfer
function blockwiseHandler(packet) {
	dump('blockwiseHandler()\n');
	
	if (packet.options[OPTION_BLOCK][1]) {
		
		var block = 0;
		// byte array to int
		for (var k in packet.options[OPTION_BLOCK][1]) {
			block = (block << 8) | packet.options[OPTION_BLOCK][1][k];
		}
		
		//alert((16 << ((0x07 & block)))+' - '+blockSize);
		if (block & 0x08) {
			if ((16 << ((0x07 & block)))!=blockSize) {
				sendGet(null, 0, blockSize);
			} else {
				sendGet(null, ((~0x0f & block) >> 4)+1, blockSize);
			}
		}
		updateLabel('packet_payload', packet.payload, true);
		
	} else {
		updateLabel('packet_payload', packet.payload);
	}
}

// Handle packets with link format payload 
function discoverHandler(packet) {
	dump('discoverHandler()\n');
	if (packet.getOptions().match(/Content-type: \[int\] 40/)) {
		// discovery
		// TODO: append, not overwrite
		prefManager.setCharPref('extensions.copper.resources.'+hostname+':'+port, packet.payload);
		resourcesCached = false;
		parseLinkFormat(packet.payload);
		updateResourceLinks();
	} else {
		alert('ERROR: Main.discoverHandler [no link format in payload]');
	}
}


// Toolbar commands
////////////////////////////////////////////////////////////////////////////////

function sendGet(uri, num, size) {
	
	client.cancelTransactions();
	
	uri = checkUri(uri, GET);
	
	var packet = new CoapPacket();
	packet.code = GET;
	packet.ack = 1;
	packet.setUri(uri);
	
	if (num!=null) {
		if (!size) size = blockSize;
		packet.setBlock(num, size);
	}
	
	if (!num) clearLabels();
	
	client.send( packet );
}

function sendPost(pl, uri) {
	
	client.cancelTransactions();

	uri = checkUri(uri, POST);
	
	var packet = new CoapPacket();
	packet.code = POST;
	packet.ack = 1;
	packet.setUri(uri);
	
	packet.payload = pl;
	
	clearLabels();
	client.send( packet );
}

function sendPut(pl, uri) {
	
	client.cancelTransactions();
	
	uri = checkUri(uri, PUT);
	
	var packet = new CoapPacket();
	packet.code = PUT;
	packet.ack = 1;
	packet.setUri(uri);
	
	packet.payload = pl;
	
	clearLabels();
	client.send( packet );
}

function sendDelete(uri) {
	
	client.cancelTransactions();

	uri = checkUri(uri, DELETE);

	var packet = new CoapPacket();
	packet.code = DELETE;
	packet.ack = 1;
	packet.setUri(uri);
	
	clearLabels();
	client.send( packet );
}

function discover() {
	var packet = new CoapPacket();
	packet.code = GET;
	packet.ack = 1;
	packet.setUri(WELL_KNOWN_RESOURCES);
	
	clearLabels();
	client.send( packet, discoverHandler );
}

// Addon settings
////////////////////////////////////////////////////////////////////////////////

function settingRetransmissions() {
	client.setRetransmissions(document.getElementById('toolbar_retransmissions').checked);
	prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
}


// Helper functions
////////////////////////////////////////////////////////////////////////////////

function parseUri(uri) {

/*	
	( 'coap:' )
    ( '//' Uri-Authority ) only if Uri-Authority is present
    ( '/' Uri-Path )
    ( '?'  Uri-Query ) only if Uri-Query is present
*/
	
	var tokens = uri.match(/^(coap:)\/\/([a-z0-9-\.]+|\[[a-z0-9:]+\])(:([0-9]{1,5}))?(\/?|(\/[^\/\?]+)+)(\?(.*))?$/i);
	if (tokens) {
		//alert('Protocol: ' + tokens[1] + '\nHost: ' + tokens[2] + '\nPort: ' + tokens[4] + '\nPath: ' + tokens[5] + '\nQuery: ' + tokens[7] );
		
		// autocomplete URI with /
		if (!tokens[5]) {
			document.location.href = 'coap://'+tokens[2]+tokens[3]+'/';
			return;
		}
		
		hostname = tokens[2];
		port = tokens[4] ? tokens[4] : port;
		path = tokens[5] ? tokens[5] : path;
		query = tokens[8] ? tokens[8] : '';
		
		//alert(hostname + ':' + port + path);
		document.title = hostname + ':' + port;
		document.getElementById('info_authority').label = '' + hostname + ':' + port;
		setDefaultPayload();
	} else {
		// no valid URI
		document.getElementById('info_authority').label = 'Invalid URI';
		throw 'invalid URI';
	}
}

// Set the default URI and also check for modified Firefox URL bar
function checkUri(uri, method, pl) {
	if (!uri) {
		// when urlbar was changed without pressing enter, redirect and perform request
		if (method && (document.location.href != mainWindow.document.getElementById('urlbar').value)) {
			//alert('You edited the URL bar:\n'+document.location.href+'\n'+mainWindow.document.getElementById('urlbar').value);
			
			// schedule the request to start automatically at new location
			prefManager.setIntPref('extensions.copper.auto-request.method', method);
			prefManager.setCharPref('extensions.copper.auto-request.payload', String(pl));
			// redirect
			document.location.href = mainWindow.document.getElementById('urlbar').value;
		}
		return path + (query ? '?'+query : '');
	} else {
		return uri;
	}
}

// Load last used payload from preferences, otherwise use default payload
function setDefaultPayload() {
	var pl = prefManager.getCharPref('extensions.copper.payloads.default');
	try {
		pl = prefManager.getCharPref('extensions.copper.payloads.'+hostname+':'+port);
	} catch( ex ) {
	    dump('INFO: Main.init [no default payload for '+hostname+':'+port+' yet]\n');
	}
	document.getElementById('toolbar_payload').value = pl;
}

function parseLinkFormat(data) {
	
	// totally complicated but supports ',' and '\n' to seperate links and ',' as well as '\"' within quoted strings
	var links = data.match(/(<[^>]+>\s*(;\s*[^<"\s;,]+\s*=\s*([^<"\s;,]+|"([^"\\]*(\\.[^"\\]*)*)")\s*)*)/g);
	dump('-parsing links----------\n');
	for (var i in links) {
		//dump(links[i]+'\n');
		var elems = links[i].match(/^<([^>]+)>\s*(;.+)\s*$/);
		
		var uri = elems[1];
		// fix for Contiki implementation and others which omit the leading '/' in the link format
		if (uri.charAt(0)!='/') uri = '/'+uri;
		
		var tokens = elems[2].match(/(;\s*[^<"\s;,]+\s*=\s*([^<"\s;,]+|"([^"\\]*(\\.[^"\\]*)*)"))/g);
		
		var attribs = new Array();
		
		dump(uri+' ('+tokens.length+')\n');
		
		for (var j in tokens) {
			//dump('  '+tokens[j]+'\n');
			var keyVal = tokens[j].match(/;\s*([^<"\s;,]+)\s*=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)")/);
			if (keyVal) {
				dump('   '+keyVal[1]+': '+(keyVal[3] ? keyVal[3] : keyVal[4].replace(/\\/g,''))+'\n');
				attribs[keyVal[1]] = keyVal[3] ? keyVal[3] : keyVal[4].replace(/\\/g,'');
			}
		}
		resources[uri] = attribs;
	}
	dump('------------------------\n');
}
function updateResourceLinks() {
	var list = document.getElementById('info_resources');
	while (list.hasChildNodes()) list.removeChild(list.firstChild);
	
	for (uri in resources) {
		var button = document.createElement("button");
		button.setAttribute("label", uri);
		button.setAttribute("tooltiptext",resources[uri]['n']);
		button.setAttribute("oncommand","document.location.href='coap://" + hostname + ":" + port + uri + "';");
		
		if (resourcesCached) {
			button.setAttribute("style", "color: red;");
		}
		
		list.appendChild(button);
	}
}

function updateLabel(id, value, append) {
	if (append) {
		document.getElementById(id).value += value;
	} else {
		document.getElementById(id).value = value;
	}
}

function clearLabels() {
	updateLabel('info_code', '');
	updateLabel('packet_header', '');
	updateLabel('packet_payload', '');
}

function leadingZero(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
}


// workaround for "this" losing scope when passing callback functions
function myBind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}