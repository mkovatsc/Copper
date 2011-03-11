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

var prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
var coapVersion = prefManager.getIntPref('extensions.copper.coap-version');

var client = null;

var hostname = 'localhost';
var port = 61616;
var path = '/';
var query = '';

var resourcesCached = true;
var resources = new Array();

function init() {
 	var tabbrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser").getNext().gBrowser;  
	tabbrowser.setIcon(tabbrowser.selectedTab, 'chrome://copper/skin/icon16.png');
	document.getElementById('toolbar_auto_discovery').checked = prefManager.getBoolPref('extensions.copper.auto-discover');
	updateLabel('toolbar_version', 'CoAP version ' + leadingZero(coapVersion,2));
	
	// load CoAP implementation
	switch (coapVersion) {
		case 0: Components.utils.import("resource://mod/CoapPacket00.jsm"); break;
		case 3: Components.utils.import("resource://mod/CoapPacket03.jsm"); break;
		default:
			dump('WARNING: CoAP version '+coapVersion+' not implemented. Using 00.\n');
			alert('WARNING: CoAP version '+coapVersion+' not implemented. Using 00.');
			Components.utils.import("resource://mod/CoapPacket00.jsm"); break;
	}
	
	// add well-known resources
	resources[WELL_KNOWN_RESOURCES] = new Array();
	resources[WELL_KNOWN_RESOURCES]['n'] = 'Resource discovery';
	
	try {
		parseUri(document.location.href);
		
		client = new UdpClient(hostname, port, mainCoapHandler);
	
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
	} catch( ex ) {
	    dump('WARNING: Main.init ['+ex+']\n');
	}
}

function unload() {
	// save as pref as persist does not work
	prefManager.setCharPref('extensions.copper.payloads.'+hostname+':'+port, document.getElementById('toolbar_payload').value);
	prefManager.setBoolPref('extensions.copper.auto-discover', document.getElementById('toolbar_auto_discovery').checked);
	
	client.shutdown();
}


// Handle incoming packets, register with CoapClient
function mainCoapHandler(packet) {

	dump('-receiving CoAP packet--\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
	
	if (packet.tid==0 || packet.getOptions().match(/Content-type: \[int\] 40/)) {
		// discovery
		// TODO: append, not overwrite
		prefManager.setCharPref('extensions.copper.resources.'+hostname+':'+port, packet.payload);
		resourcesCached = false;
		parseLinkFormat(packet.payload);
		updateResourceLinks();
	}
	
	if (packet.tid!=0) {	
		updateLabel('info_code', packet.getCode());
		updateLabel('packet_header', 'Type: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions() );
		updateLabel('packet_payload', packet.payload);
		
	}
	
	//parseLinkFormat(packet.payload);
}


function discover() {
	var packet = new CoapPacket();
	packet.code = GET;
	packet.ack = 1;
	packet.tid = 0x0000;
	packet.setUri(WELL_KNOWN_RESOURCES);
	
	client.send( packet.serialize() );
}

function sendGet(uri) {
	if (!uri) uri = path + (query ? '?'+query : '');

	var packet = new CoapPacket();
	packet.code = GET;
	packet.ack = 1;
	packet.setUri(uri);
	
	dump('-sending CoAP packet----\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
	
	client.send( packet.serialize() );
}


function sendPost(pl, uri) {

	if (!uri) uri = path + (query ? '?'+query : '');
	
	var packet = new CoapPacket();
	packet.code = POST;
	packet.ack = 1;
	packet.setUri(uri);
	
	packet.payload = pl;
	
	dump('-sending CoAP packet----\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
	
	client.send( packet.serialize() );
}

function sendPut(pl, uri) {
	if (!uri) uri = path + (query ? '?'+query : '');
	
	var packet = new CoapPacket();
	packet.code = PUT;
	packet.ack = 1;
	packet.setUri(uri);
	
	packet.payload = pl;
	
	dump('-sending CoAP packet----\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
	
	client.send( packet.serialize() );
}

function sendDelete(uri) {
	if (!uri) uri = path + (query ? '?'+query : '');

	var packet = new CoapPacket();
	packet.code = DELETE;
	packet.ack = 1;
	packet.setUri(uri);
	
	dump('-sending CoAP packet----\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
	
	client.send( packet.serialize() );
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
		document.getElementById('info_authority').label = 'coap://' + hostname + ':' + port;
		setDefaultPayload();
	} else {
		// no valid URI
		document.getElementById('info_authority').label = 'Invalid URI';
		throw 'invalid URI';
	}
}

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

function updateLabel(id, value) {
	document.getElementById(id).value = value;
}

function leadingZero(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
}
