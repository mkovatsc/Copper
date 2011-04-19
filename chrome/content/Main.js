/*
 * Copyright (c) 2011, Institute for Pervasive Computing, ETH Zurich.
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

var coapVersion = 3;
var blockSize = 32;

var hostname = '';
var port = 61616;
var path = '/';
var query = '';

var client = null;
var observer = null;

var resources = new Object();
var resourcesCached = true;


// Life cycle functions
////////////////////////////////////////////////////////////////////////////////

function init() {
	
	dump('\n\n\n\n\n');
	dump('==============================================================================\n');
	dump('=INITIALIZING COPPER==========================================================\n');
	dump('==============================================================================\n');
		
 	// set the Cu icon for all Copper tabs
	// TODO: There must be a more elegant way
	var tabbrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser").getNext().gBrowser;  
	for (var i=0; i<tabbrowser.browsers.length; ++i) {
		if (tabbrowser.mTabs[i].label=='Copper CoAP Browser')
		tabbrowser.setIcon(tabbrowser.mTabs[i], 'chrome://copper/skin/icon16.png');
	}
	
	
	// get settings from preferences
	var auto = null; // auto-method
	try {
		coapVersion = prefManager.getIntPref('extensions.copper.coap-version');
		blockSize = prefManager.getIntPref('extensions.copper.default-block-size');
		document.getElementById('toolbar_auto_discovery').checked = prefManager.getBoolPref('extensions.copper.auto-discover');
		document.getElementById('toolbar_retransmissions').checked = prefManager.getBoolPref('extensions.copper.retransmissions');
		auto = prefManager.getIntPref('extensions.copper.auto-request.method');
		
		// debug options
		document.getElementById('debug_options').checked = prefManager.getBoolPref('extensions.copper.debug.options-enabled');
		document.getElementById('debug_option_content_type').value = prefManager.getCharPref('extensions.copper.debug.options.content-type');
		document.getElementById('debug_option_max_age').value = prefManager.getCharPref('extensions.copper.debug.options.max-age');
		document.getElementById('debug_option_etag').value = prefManager.getCharPref('extensions.copper.debug.options.etag');
		document.getElementById('debug_option_uri_host').value = prefManager.getCharPref('extensions.copper.debug.options.uri-host');
		document.getElementById('debug_option_location_path').value = prefManager.getCharPref('extensions.copper.debug.options.location-path');
		document.getElementById('debug_option_observe').value = prefManager.getCharPref('extensions.copper.debug.options.observe');
		document.getElementById('debug_option_token').value = prefManager.getCharPref('extensions.copper.debug.options.token');
		document.getElementById('debug_option_block').value = prefManager.getCharPref('extensions.copper.debug.options.block');
	} catch (ex) {
		alert('WARNING: Could not load preferences. Using hardcoded defauls.');
	}
	
	
	// load CoAP implementation
	switch (coapVersion) {
		case 3: Components.utils.import("resource://modules/CoapPacket03.jsm"); break;
		default:
			alert('WARNING: CoAP version '+coapVersion+' not implemented. Using 03.');
			Components.utils.import("resource://modules/CoapPacket03.jsm"); break;
			coapVersion = 0;
	}
	document.getElementById('toolbar_version').label = 'CoAP ' + leadingZero(coapVersion,2) + ' ';
	
	// open location
	try {
		parseUri(document.location.href);
		
		// debug
		document.getElementById('debug_option_uri_path').value = path;
		document.getElementById('debug_option_query').value = query;
		// workaround to hide useless scrollbar
		document.getElementById('packet_header').focus();
		document.getElementById('packet_options').focus();
		
		// set up datagram and transaction layer
		var temp = new UdpClient(hostname, port);
		client = new TransactionHandler(temp, document.getElementById('toolbar_retransmissions').checked);
		client.registerCallback(defaultHandler);
		
		// enable observing
		observer = new Observing();
		
		// handle auto discover
		loadCachedResources();
		if (document.getElementById('toolbar_auto_discovery').checked) {
			discover();
		}
		updateResourceLinks();
		
		loadDefaultPayload();
		
		// handle auto-request after redirect
		if (auto) {
			switch (auto) {
				case 0:      break;
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
		// disable the toolbar
		var obj = document.getElementById('main_toolbar').firstChild;
		do {
			obj.setAttribute("disabled", "true");
		} while ( obj = obj.nextSibling);

		updateResourceLinks();
		
	    dump('ERROR: Main.init ['+ex+']\n');
	}
}

function unload() {
	// save as pref as persist does not work
	prefManager.setCharPref('extensions.copper.payloads.'+hostname+':'+port, document.getElementById('toolbar_payload').value);
	prefManager.setBoolPref('extensions.copper.auto-discover', document.getElementById('toolbar_auto_discovery').checked);
	prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
	
	// debug options
	prefManager.setBoolPref('extensions.copper.debug.options-enabled', document.getElementById('debug_options').checked);
	prefManager.setCharPref('extensions.copper.debug.options.content-type', document.getElementById('debug_option_content_type').value);
	prefManager.setCharPref('extensions.copper.debug.options.max-age', document.getElementById('debug_option_max_age').value);
	prefManager.setCharPref('extensions.copper.debug.options.etag', document.getElementById('debug_option_etag').value);
	prefManager.setCharPref('extensions.copper.debug.options.uri-host', document.getElementById('debug_option_uri_host').value);
	prefManager.setCharPref('extensions.copper.debug.options.location-path', document.getElementById('debug_option_location_path').value);
	prefManager.setCharPref('extensions.copper.debug.options.observe', document.getElementById('debug_option_observe').value);
	prefManager.setCharPref('extensions.copper.debug.options.token', document.getElementById('debug_option_token').value);
	prefManager.setCharPref('extensions.copper.debug.options.block', document.getElementById('debug_option_block').value);
	
	client.shutdown();
}


// CoAP message handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming messages, registered as default at TransactionHandler
function defaultHandler(message) {
	dump('INFO: defaultHandler()\n');

	updateLabel('info_code', message.getCode());
	// TODO: use nice table
	updateMessageInfo(message);
	
	// if message turns out to be block-wise transfer dispatch to corresponding handler
	if (message.isOption(OPTION_BLOCK)) {
		return blockwiseHandler(message);
	}
	
	updateLabel('packet_payload', message.getPayload());
	
	if (message.getContentType()==40) {
		updateResourceLinks( parseLinkFormat(message.getPayload()) );
	}
}

// Handle messages with block-wise transfer
function blockwiseHandler(message) {
	dump('INFO: blockwiseHandler()\n');
	
	updateLabel('info_code', ' (Blockwise)', true);
	
	if (message.isOption(OPTION_BLOCK)) {
		
		if (message.getBlockMore()) {
			
			if (message.getBlockSize()!=blockSize) {
				sendBlockwiseGet(0, blockSize);
			} else {
				sendBlockwiseGet(message.getBlockNumber()+1, blockSize);
			}
		}
		updateLabel('packet_payload', message.getPayload(), message.getBlockNumber()>0);
		
	} else {
		updateLabel('packet_payload', message.getPayload());
	}
}

//Handle messages with block-wise transfer
function observingHandler(message) {
	dump('INFO: observingHandler()\n');
	
	if (message.isOption(OPTION_OBSERVE)) {
		
		updateLabel('info_code', message.getCode() + ' (Observing)');
		// TODO: use nice table
		updateMessageInfo(message);
		
		updateLabel('packet_payload', message.getPayload());
	} else {
		updateLabel('info_code', 'Observing not supported');
	}
}

// Handle messages with link format payload 
function discoverHandler(message) {
	dump('INFO: discoverHandler()\n');
	if (message.getContentType()==40) {
		// link-format
		resourcesCached = false;
		
		updateResourceLinks( parseLinkFormat(message.getPayload()) );
	} else {
		alert('ERROR: Main.discoverHandler [no link format in payload]');
	}
}


// Toolbar commands
////////////////////////////////////////////////////////////////////////////////

function sendGet(uri) {
	try {
		client.cancelTransactions();
		
		uri = checkUri(uri, GET);
		
		var message = new CoapMessage(MSG_TYPE_CON, GET, uri);
		
		checkDebugOptions(message);
		
		clearLabels();	
		client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendGet ['+ex+']');
	}
}
function sendBlockwiseGet(num, size, uri) {
	try {
		client.cancelTransactions();
	
		if (!num) num = 0;
		if (!size) size = blockSize;
		uri = checkUri(uri, GET);
		
		var message = new CoapMessage(MSG_TYPE_CON, GET, uri);
		
		message.setBlock(num, size);
		
		checkDebugOptions(message);
		
		if (num=0) clearLabels();
		client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendBlockwiseGet ['+ex+']');
	}
}

//TODO: blockwise POST
function sendPost(pl, uri) {
	try {
		client.cancelTransactions();
	
		uri = checkUri(uri, POST);
		
		var message = new CoapMessage(MSG_TYPE_CON, POST, uri, pl);
		
		checkDebugOptions(message);
		
		clearLabels();
		client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendPost ['+ex+']');
	}
}

//TODO: blockwise PUT
function sendPut(pl, uri) {
	try {
		client.cancelTransactions();
		
		uri = checkUri(uri, PUT);
		
		var message = new CoapMessage(MSG_TYPE_CON, PUT, uri, pl);
		
		checkDebugOptions(message);
		
		clearLabels();
		client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendPut ['+ex+']');
	}
}

function sendDelete(uri) {
	try {
		client.cancelTransactions();
		
		uri = checkUri(uri, DELETE);
		
		var message = new CoapMessage(MSG_TYPE_CON, DELETE, uri);
		
		checkDebugOptions(message);
		
		clearLabels();
		client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendDelete ['+ex+']');
	}
}

function observe(uri) {
	try {
		client.cancelTransactions();
		
		uri = checkUri(uri, DELETE);

		observer.subscribe(uri, observingHandler);
		
	} catch (ex) {
		alert('ERROR: Main.sendDelete ['+ex+']');
	}
}

function discover() {
	try {
		var message = new CoapMessage(MSG_TYPE_CON, GET, WELL_KNOWN_RESOURCES);
		
		client.send( message, discoverHandler );
	} catch (ex) {
		alert('ERROR: Main.discover ['+ex+']');
	}
}

// like discover, but resets cached resources -- used for the button
function reDiscover() {
	dump('INFO: resetting cached resources\n');
	prefManager.setCharPref('extensions.copper.resources.'+hostname+':'+port, '' );
	resources = new Object();
	
	discover();
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
	
	var tokens = uri.match(/^(coap:)\/\/([a-z0-9-\.]+|\[[a-z0-9:]+(%[a-z0-9]+)?\])(:([0-9]{1,5}))?(\/?|(\/[^\/\?]+)+)(\/)?(\?(.*))?$/i);
	if (tokens) {
		//alert('Protocol: ' + tokens[1] + '\nHost: ' + tokens[2] + '\nPort: ' + tokens[5] + '\nPath: ' + tokens[6] + '\nQuery: ' + tokens[9] );
		
		// remove final / for non-root paths
		if (tokens[8]) {
			document.location.href = 'coap://'+tokens[2] + (tokens[3] ? tokens[3] : '') + tokens[6] + (tokens[9] ? tokens[9] : '');
			return;
		}
		
		hostname = tokens[2];
		port = tokens[5] ? tokens[5] : port;
		path = tokens[6] ? tokens[6] : path;
		query = tokens[10] ? tokens[10] : '';
		
		document.title = hostname + path;
		
		document.getElementById('info_authority').label = '' + hostname + ':' + port;
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
		if (method && (document.location.href != mainWindow.document.getElementById('urlbar').value.replace(/ /g, '%20'))) {
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

function checkDebugOptions(message) {
	if (document.getElementById('debug_options').checked) {
		if (document.getElementById('debug_option_content_type').value!='') {
			message.setContentType(parseInt(document.getElementById('debug_option_content_type').value));
		}
		if (document.getElementById('debug_option_max_age').value!='') {
			message.setMaxAge(parseInt(document.getElementById('debug_option_max_age').value));
		}
		if (document.getElementById('debug_option_etag').value!='') {
			message.setETag(parseInt(document.getElementById('debug_option_etag').value));
		}
		if (document.getElementById('debug_option_uri_host').value!='') {
			message.setUriHost(document.getElementById('debug_option_uri_host').value);
		}
		if (document.getElementById('debug_option_location_path').value!='') {
			message.setLocationPath(document.getElementById('debug_option_location_path').value);
		}
		if (document.getElementById('debug_option_observe').value!='') {
			message.setObserve(parseInt(document.getElementById('debug_option_observe').value));
		}
		if (document.getElementById('debug_option_token').value!='') {
			message.setToken(parseInt(document.getElementById('debug_option_token').value));
		}
		if (document.getElementById('debug_option_block').value!='') {
			message.setBlock(parseInt(document.getElementById('debug_option_block').value), blockSize);
		}
	}
}

// Load cached resource links from preferences
function loadCachedResources() {
	try {
		dump('INFO: loading cached resource links\n');
		resources = JSON.parse( prefManager.getCharPref('extensions.copper.resources.'+hostname+':'+port) );
	} catch( ex ) {
	    dump('INFO: no cached links for '+hostname+':'+port+' yet\n');
	}
	
	// add well-known resource to resource cache
	if (!resources[WELL_KNOWN_RESOURCES]) {
		resources[WELL_KNOWN_RESOURCES] = new Object();
		resources[WELL_KNOWN_RESOURCES]['ct'] = '40';
		resources[WELL_KNOWN_RESOURCES]['title'] = 'Resource discovery';
	}
}

// Load last used payload from preferences, otherwise use default payload
function loadDefaultPayload() {
	var pl = prefManager.getCharPref('extensions.copper.payloads.default');
	try {
		pl = prefManager.getCharPref('extensions.copper.payloads.'+hostname+':'+port);
	} catch( ex ) {
	    dump('INFO: no default payload for '+hostname+':'+port+' yet\n');
	}
	document.getElementById('toolbar_payload').value = pl;
}

function parseLinkFormat(data) {
	
	var links = new Object();
	
	// totally complicated but supports ',' and '\n' to seperate links and ',' as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*[^<"\s;,]+\s*=\s*([^<"\s;,]+|"([^"\\]*(\\.[^"\\]*)*)")\s*)*)/g);
	dump('-parsing link-format----------------------------\n');
	for (var i in format) {
		//dump(links[i]+'\n');
		var elems = format[i].match(/^<([^>]+)>\s*(;.+)?\s*$/);
				
		var uri = elems[1];
		// fix for Contiki implementation and others which omit the leading '/' in the link format
		if (uri.charAt(0)!='/') uri = '/'+uri;
		
		links[uri] = new Object();
		
		if (elems[2]) {
		
			var tokens = elems[2].match(/(;\s*[^<"\s;,]+\s*=\s*([^<"\s;,]+|"([^"\\]*(\\.[^"\\]*)*)"))/g);
		
			dump(' '+uri+' ('+tokens.length+')\n');
		
			for (var j in tokens) {
				//dump('  '+tokens[j]+'\n');
				var keyVal = tokens[j].match(/;\s*([^<"\s;,]+)\s*=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)")/);
				if (keyVal) {
					dump('   '+keyVal[1]+': '+(keyVal[3] ? keyVal[3] : keyVal[4].replace(/\\/g,''))+'\n');
					links[uri][keyVal[1]] = keyVal[3] ? keyVal[3] : keyVal[4].replace(/\\/g,'');
				}
			}
		} else {
			dump(' '+uri+' (no attributes)\n');
		}
	}
	dump(' -----------------------------------------------\n');
	
	return links;
}
function updateResourceLinks(add) {
	
	// merge links
	if (add) {
		for (uri in add) {
			if (!resources[uri]) {
				resources[uri] = add[uri];
				dump('INFO: adding '+uri+' to host resources\n');
			}
		}
	}
	
	// button container
	var list = document.getElementById('info_resources');
	while (list.hasChildNodes()) list.removeChild(list.firstChild);
	
	// sort by path
	var sorted = new Array();
	for (uri in resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (entry in sorted) {
		var uri = sorted[entry];
		
		var button = document.createElement("button");
		button.setAttribute("label", uri.replace(/%20/g, ' '));
		button.setAttribute("oncommand","document.location.href='coap://" + hostname + ":" + port + uri + "';");
		
		var tooltiptext = '';
		for (var attrib in resources[uri]) {
			if (tooltiptext) tooltiptext += ', ';
			tooltiptext += attrib + '=' + resources[uri][attrib];
		}
		button.setAttribute("tooltiptext", tooltiptext);
		
		if (resourcesCached) {
			button.setAttribute("style", "color: red;");
		}
		
		// highlight current resource
		if (uri==path) {
			button.setAttribute("style", "font-weight: bold; text-shadow: 2px 2px 3px #666666;");
			
		}
		
		list.appendChild(button);
	}
	
	// save in cache
	prefManager.setCharPref('extensions.copper.resources.'+hostname+':'+port, JSON.stringify(resources) );
}

function updateMessageInfo(message) {

	document.getElementById('packet_header_type').setAttribute('label', message.getType(true));
	document.getElementById('packet_header_oc').setAttribute('label', message.getOptionCount(true));
	document.getElementById('packet_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('packet_header_tid').setAttribute('label', message.getTID(true));
	
	var optionList = document.getElementById('packet_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	var options = message.getOptions();
	
	for (var i = 0; i < options.length; i++)
    {
        var row = document.createElement('listitem');
        
        var cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][0]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label',  options[i][1] );
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label',  options[i][2] );
        row.appendChild(cell);

        optionList.appendChild(row);
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
	updateLabel('packet_payload', '');

	document.getElementById('packet_header_type').setAttribute('label', '');
	document.getElementById('packet_header_oc').setAttribute('label', '');
	document.getElementById('packet_header_code').setAttribute('label', '');
	document.getElementById('packet_header_tid').setAttribute('label', '');
	
	var optionList = document.getElementById('packet_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
}

function leadingZero(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
}

function isPowerOfTwo(i) {
	return ((i & (i-1))==0);
}

function isArray(obj) {
    if (obj == null) return false;
    return obj.constructor == Array;
}

function isDefined(variable) {
    return (typeof(window[variable]) == 'undefined') ?  false : true;
}

// workaround for "this" losing scope when passing callback functions
function myBind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}

const toast = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification;
function popup(title, str) {
	toast('chrome://copper/skin/icon24.png',title,str);
};
