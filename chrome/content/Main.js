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

Components.utils.import("resource://modules/common.jsm");



CopperChrome.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);

CopperChrome.prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

CopperChrome.coapVersion = 3;
CopperChrome.blockSize = 32;
CopperChrome.showUnknownTransactions = true;

CopperChrome.hostname = '';
CopperChrome.port = 61616;
CopperChrome.path = '/';
CopperChrome.query = '';

CopperChrome.client = null;
CopperChrome.observer = null;

CopperChrome.resources = new Object();
CopperChrome.resourcesCached = true;


// Life cycle functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.main = function() {
	
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
		CopperChrome.coapVersion = CopperChrome.prefManager.getIntPref('extensions.copper.coap-version');
		CopperChrome.blockSize = CopperChrome.prefManager.getIntPref('extensions.copper.default-block-size');
		CopperChrome.showUnknownTransactions = CopperChrome.prefManager.getBoolPref('extensions.copper.show-unknown-transactions');
		
		document.getElementById('toolbar_auto_discovery').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.auto-discover');
		document.getElementById('toolbar_retransmissions').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.retransmissions');
		
		auto = CopperChrome.prefManager.getIntPref('extensions.copper.auto-request.method');
		
		// debug options
		document.getElementById('chk_debug_options').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.debug.options-enabled');
		
		document.getElementById('debug_option_content_type').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.content-type');
		document.getElementById('debug_option_max_age').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.max-age');
		document.getElementById('debug_option_etag').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.etag');
		document.getElementById('debug_option_uri_host').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.uri-host');
		document.getElementById('debug_option_location_path').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.location-path');
		document.getElementById('debug_option_observe').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.observe');
		document.getElementById('debug_option_token').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.token');
		document.getElementById('debug_option_block').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.block');
	} catch (ex) {
		window.setTimeout(
				function() { window.alert('WARNING: Could not load preferences; using hardcoded defauls.'+ex); },
				0);
	}
	
	
	// load CoAP implementation
	try {
		switch (CopperChrome.coapVersion) {
			case 3:
				Components.utils.import("resource://modules/CoapPacket03.jsm");
				break;
			default:
				window.setTimeout(
						function() { window.alert('WARNING: CoAP version '+CopperChrome.coapVersion+' not implemented. Using 03.'); },
						0);			
				Components.utils.import("resource://modules/CoapPacket03.jsm"); break;
				CopperChrome.coapVersion = 3;
		}
		document.getElementById('toolbar_version').label = 'CoAP ' + CopperChrome.leadingZero(CopperChrome.coapVersion,2) + ' ';
	} catch (ex) {
		window.setTimeout(
				function() { window.alert('ERROR: Could not load protocol module ['+ex+']'); },
				0);
	}
	
	// open location
	try {
		// Header table workaround to hide useless scrollbar
		document.getElementById('packet_header').focus();
		document.getElementById('packet_options').focus();
		
		CopperChrome.parseUri(document.location.href);
		
		// debug options set by URI
		document.getElementById('debug_option_uri_path').value = CopperChrome.path;
		document.getElementById('debug_option_query').value = CopperChrome.query;
		
		// set up datagram and transaction layer
		var temp = new CopperChrome.UdpClient(CopperChrome.hostname, CopperChrome.port);
		CopperChrome.client = new CopperChrome.TransactionHandler(temp, document.getElementById('toolbar_retransmissions').checked);
		CopperChrome.client.registerCallback(CopperChrome.defaultHandler);
		
		// enable observing
		CopperChrome.observer = new CopperChrome.Observing();
		
		// handle auto discover
		CopperChrome.loadCachedResources();
		if (document.getElementById('toolbar_auto_discovery').checked) {
			CopperChrome.discover();
		}
		CopperChrome.updateResourceLinks();
		
		CopperChrome.loadDefaultPayload();
		
		// handle auto-request after redirect
		if (auto) {
			switch (auto) {
				case 0:             break;
				case Copper.GET:    CopperChrome.sendGet(); break;
				case Copper.POST:   CopperChrome.sendPost(CopperChrome.prefManager.getCharPref('extensions.copper.auto-request.payload')); break;
				case Copper.PUT:    CopperChrome.sendPut(CopperChrome.prefManager.getCharPref('extensions.copper.auto-request.payload')); break;
				case Copper.DELETE: CopperChrome.sendDelete(); break;
				default: dump('WARNING: Main.init [unknown method for auto-request: '+auto+']\n');
			}
			
			// reset auto-request
			CopperChrome.prefManager.setIntPref('extensions.copper.auto-request.method', 0);
			CopperChrome.prefManager.setCharPref('extensions.copper.auto-request.payload', '');
		}
		
	} catch( ex ) {
		// disable the toolbar
		var obj = document.getElementById('main_toolbar').firstChild;
		do {
			// children of toolbaritems need to be disabled manually
			if (obj.nodeName=='toolbaritem') {
				
				var obj2 = obj.firstChild;
				do {
					obj2.setAttribute("disabled", "true");
				} while ( obj2 = obj2.nextSibling);
			} else {
				obj.setAttribute("disabled", "true");
			}
		} while ( obj = obj.nextSibling);
		
	    dump('ERROR: Main.init ['+ex+']\n');
	}
};

CopperChrome.unload = function() {
	// save as pref as persist does not work
	if (CopperChrome.hostname!='') CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port, document.getElementById('toolbar_payload').value);
	CopperChrome.prefManager.setBoolPref('extensions.copper.auto-discover', document.getElementById('toolbar_auto_discovery').checked);
	CopperChrome.prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
	
	// debug options
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options-enabled', document.getElementById('chk_debug_options').checked);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.content-type', document.getElementById('debug_option_content_type').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.max-age', document.getElementById('debug_option_max_age').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.etag', document.getElementById('debug_option_etag').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.uri-host', document.getElementById('debug_option_uri_host').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.location-path', document.getElementById('debug_option_location_path').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.observe', document.getElementById('debug_option_observe').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.token', document.getElementById('debug_option_token').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.block', document.getElementById('debug_option_block').value);
	
	CopperChrome.client.shutdown();
};


// CoAP message handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming messages, registered as default at TransactionHandler
CopperChrome.defaultHandler = function(message) {
	dump('INFO: defaultHandler()\n');
	
	// if message turns out to be block-wise transfer dispatch to corresponding handler
	if (message.isOption && message.isOption(Copper.OPTION_BLOCK)) {
		return CopperChrome.blockwiseHandler(message);
	}
	
	CopperChrome.updateMessageInfo(message);
	CopperChrome.updateLabel('packet_payload', message.getPayload());
	document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
	
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat(message.getPayload()) );
	}
};

// Handle messages with block-wise transfer
CopperChrome.blockwiseHandler = function(message) {
	dump('INFO: blockwiseHandler()\n');
	
	CopperChrome.updateMessageInfo(message);
	CopperChrome.updateLabel('info_code', ' (Blockwise)', true);
	
	if (message.isOption(Copper.OPTION_BLOCK)) {
		
		if (message.getBlockMore()) {
			
			// TODO: give in, as browser could request large blocks and server might be constrained
			if (message.getBlockSize()>CopperChrome.blockSize) {
				CopperChrome.sendBlockwiseGet(0, CopperChrome.blockSize);
			} else {
				CopperChrome.sendBlockwiseGet(message.getBlockNumber()+1, message.getBlockSize());
			}
		}
		CopperChrome.updateLabel('packet_payload', message.getPayload(), message.getBlockNumber()>0);
		document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
		
		if (!message.getBlockMore()) {
			if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
				CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( document.getElementById('packet_payload').value ) );
			}
		}
		
	} else {
		CopperChrome.updateLabel('packet_payload', message.getPayload());
		document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
	}
};

//Handle messages with block-wise transfer
CopperChrome.observingHandler = function(message) {
	dump('INFO: observingHandler()\n');
	
	if (message.isOption(Copper.OPTION_OBSERVE)) {
		
		CopperChrome.updateMessageInfo(message);
		CopperChrome.updateLabel('info_code', ' (Observing)', true);
		
		CopperChrome.updateLabel('packet_payload', message.getPayload());
		document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
	} else {
		CopperChrome.updateLabel('info_code', 'Observing not supported');
	}
};

// Handle messages with link format payload 
CopperChrome.discoverHandler = function(message) {
	dump('INFO: discoverHandler()\n');
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		// link-format
		CopperChrome.resourcesCached = false;
		
		CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat(message.getPayload()) );
	} else {
		alert('ERROR: Main.discoverHandler [no link format in payload]');
	}
};


// Toolbar commands
////////////////////////////////////////////////////////////////////////////////

CopperChrome.sendGet = function(uri) {
	try {
		CopperChrome.client.cancelTransactions();
		
		uri = CopperChrome.checkUri(uri, Copper.GET);
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();	
		CopperChrome.client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendGet ['+ex+']');
	}
};
CopperChrome.sendBlockwiseGet = function(num, size, uri) {
	try {
		CopperChrome.client.cancelTransactions();
	
		if (!num) num = 0;
		if (!size) size = CopperChrome.blockSize;
		uri = CopperChrome.checkUri(uri, Copper.GET);
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		// (re)set to useful block option
		message.setBlock(num, size);
		
		if (num=0) CopperChrome.clearLabels();
		CopperChrome.client.send( message, CopperChrome.blockwiseHandler );
	} catch (ex) {
		alert('ERROR: Main.sendBlockwiseGet ['+ex+']');
	}
};

//TODO: blockwise POST
CopperChrome.sendPost = function(pl, uri) {
	try {
		CopperChrome.client.cancelTransactions();
	
		uri = CopperChrome.checkUri(uri, Copper.POST);
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.POST, uri, pl);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendPost ['+ex+']');
	}
};

//TODO: blockwise PUT
CopperChrome.sendPut = function(pl, uri) {
	try {
		CopperChrome.client.cancelTransactions();
		
		uri = CopperChrome.checkUri(uri, Copper.PUT);
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.PUT, uri, pl);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendPut ['+ex+']');
	}
};

CopperChrome.sendDelete = function(uri) {
	try {
		CopperChrome.client.cancelTransactions();
		
		uri = CopperChrome.checkUri(uri, Copper.DELETE);
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.DELETE, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message );
	} catch (ex) {
		alert('ERROR: Main.sendDelete ['+ex+']');
	}
};

CopperChrome.observe = function(uri) {
	try {
		//CopperChrome.client.cancelTransactions();
		
		uri = CopperChrome.checkUri(uri);

		CopperChrome.observer.subscribe(uri, CopperChrome.observingHandler);
		
	} catch (ex) {
		alert('ERROR: Main.observe ['+ex+']');
	}
};

CopperChrome.discover = function() {
	try {
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, Copper.WELL_KNOWN_RESOURCES);
		
		CopperChrome.client.send( message, CopperChrome.discoverHandler );
	} catch (ex) {
		alert('ERROR: Main.discover ['+ex+']');
	}
};

// like discover, but resets cached resources -- used for the button
CopperChrome.reDiscover = function() {
	dump('INFO: resetting cached resources\n');
	CopperChrome.prefManager.setCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port, '' );
	CopperChrome.resources = new Object();
	
	CopperChrome.discover();
};

// Addon settings
////////////////////////////////////////////////////////////////////////////////

CopperChrome.settingRetransmissions = function() {
	CopperChrome.client.setRetransmissions(document.getElementById('toolbar_retransmissions').checked);
	CopperChrome.prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
};


// Helper functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.parseUri = function(uri) {

/*	
	( 'coap:' )
    ( '//' Uri-Authority ) only if Uri-Authority is present
    ( '/' Uri-Path )
    ( '?'  Uri-Query ) only if Uri-Query is present
*/

	try {
		var parsedUri = Components.classes["@mozilla.org/network/io-service;1"]
	    	.getService(Components.interfaces.nsIIOService)
	    	.newURI(uri, null, null);
		
		var url = parsedUri.QueryInterface(Components.interfaces.nsIURL);
		
		// redirect to omit subsequent slash, refs (#), and params (;) 
		if (url.filePath!='/' && url.fileName=='') {
			document.location.href = url.prePath + url.filePath.substring(0, url.filePath.length-1) + (url.query!='' ? '?'+url.query : '');
			return;
		} else if (url.ref!='' || url.param!='') {
			document.location.href = url.prePath + url.filePath + (url.query!='' ? '?'+url.query : '');
			return;
		}
		
		if (url.port>0xFFFF) {
			throw 'Illeagal port';
		}
		
		// DNS lookup
		try {
			var ns = Components.classes["@mozilla.org/network/dns-service;1"].createInstance(Components.interfaces.nsIDNSService).resolve(url.host, 0);
			
			var addresses = '';
			while (ns.hasMore()) {
				addresses += ns.getNextAddrAsString()+'\n';
			}
			if (addresses!='') document.getElementById('info_host').setAttribute('tooltiptext', addresses);
			
		} catch (ex) {
			throw 'Cannot resolve host';
		}
		
		CopperChrome.hostname = url.host;
		if (CopperChrome.hostname.indexOf(':')!=-1) CopperChrome.hostname = '['+CopperChrome.hostname+']';
		
		CopperChrome.port = url.port!=-1 ? url.port : CopperChrome.port;
		CopperChrome.path = url.filePath;
		CopperChrome.query = url.query;
		
		document.title = CopperChrome.hostname + CopperChrome.path;
		document.getElementById('info_host').label = '' + CopperChrome.hostname + ':' + CopperChrome.port;
		
	} catch(ex) {
		// cannot parse URI
		document.getElementById('group_host').setAttribute('style', 'display: none;');
		document.getElementById('group_head').setAttribute('style', 'display: none;');
		document.getElementById('group_payload').setAttribute('style', 'display: none;');
		CopperChrome.updateLabel('info_code', 'Copper: '+ ex);
		throw 'invalid URI: '+ex;
	}
};

// Set the default URI and also check for modified Firefox URL bar
CopperChrome.checkUri = function(uri, method, pl) {
	if (!uri) {
		var parsedUri = Components.classes["@mozilla.org/network/simple-uri;1"].getService(Components.interfaces.nsIURI);

		parsedUri.spec = CopperChrome.mainWindow.document.getElementById('urlbar').value;
		
		// when urlbar was changed without pressing enter, redirect and perform request
		if (method && (document.location.href!=parsedUri.spec)) {
			//alert('You edited the URL bar:\n'+document.location.href+'\n'+parsedUri.spec);
			
			// schedule the request to start automatically at new location
			CopperChrome.prefManager.setIntPref('extensions.copper.auto-request.method', method);
			CopperChrome.prefManager.setCharPref('extensions.copper.auto-request.payload', String(pl));
			
			// redirect
			document.location.href = parsedUri.spec;
		}
		return CopperChrome.path + (CopperChrome.query ? '?'+CopperChrome.query : '');
	} else {
		return uri;
	}
};

CopperChrome.checkDebugOptions = function(message) {
	if (document.getElementById('chk_debug_options').checked) {
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
			message.setBlock(parseInt(document.getElementById('debug_option_block').value), CopperChrome.blockSize);
		}
	}
};

// Load cached resource links from preferences
CopperChrome.loadCachedResources = function() {
	try {
		dump('INFO: loading cached resource links\n');
		CopperChrome.resources = JSON.parse( CopperChrome.prefManager.getCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port) );
	} catch( ex ) {
	    dump('INFO: no cached links for '+CopperChrome.hostname+':'+CopperChrome.port+' yet\n');
	}
	
	// add well-known resource to resource cache
	if (!CopperChrome.resources[Copper.WELL_KNOWN_RESOURCES]) {
		CopperChrome.resources[Copper.WELL_KNOWN_RESOURCES] = new Object();
		CopperChrome.resources[Copper.WELL_KNOWN_RESOURCES]['ct'] = '40';
		CopperChrome.resources[Copper.WELL_KNOWN_RESOURCES]['title'] = 'Resource discovery';
	}
};

// Load last used payload from preferences, otherwise use default payload
CopperChrome.loadDefaultPayload = function() {
	var pl = CopperChrome.prefManager.getCharPref('extensions.copper.default-payload');
	try {
		pl = CopperChrome.prefManager.getCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port);
	} catch( ex ) {
	    dump('INFO: no default payload for '+CopperChrome.hostname+':'+CopperChrome.port+' yet\n');
	}
	document.getElementById('toolbar_payload').value = pl;
};

CopperChrome.parseLinkFormat = function(data) {
	
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
};

CopperChrome.updateResourceLinks = function(add) {
	
	// merge links
	if (add) {
		for (uri in add) {
			if (!CopperChrome.resources[uri]) {
				CopperChrome.resources[uri] = add[uri];
				dump('INFO: adding '+uri+' to host resources\n');
			}
		}
	}
	
	// button container
	var list = document.getElementById('info_resources');
	while (list.hasChildNodes()) list.removeChild(list.firstChild);
	
	// sort by path
	var sorted = new Array();
	for (uri in CopperChrome.resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (entry in sorted) {
		var uri = sorted[entry];
		
		var button = document.createElement('button');
		button.setAttribute('label', decodeURI(uri));
		button.setAttribute('oncommand',"document.location.href='coap://" + CopperChrome.hostname + ':' + CopperChrome.port + uri + "';");
		
		var tooltiptext = '';
		for (var attrib in CopperChrome.resources[uri]) {
			if (tooltiptext) tooltiptext += ', ';
			tooltiptext += attrib + '=' + CopperChrome.resources[uri][attrib];
		}
		button.setAttribute('tooltiptext', tooltiptext);
		
		if (CopperChrome.resourcesCached) {
			button.setAttribute('style', 'color: red;');
		}
		
		// highlight current resource
		if (uri==CopperChrome.path) {
			button.setAttribute('style', 'font-weight: bold; text-shadow: 2px 2px 3px #666666;');
		}
		
		list.appendChild(button);
	}
	
	// save in cache
	if (CopperChrome.hostname!='') CopperChrome.prefManager.setCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port, JSON.stringify(CopperChrome.resources) );
};

CopperChrome.updateMessageInfo = function(message) {
	
	if (message.getCopperCode) {
		CopperChrome.updateLabel('info_code', 'Copper: '+message.getCopperCode());
	} else {
		CopperChrome.updateLabel('info_code', message.getCode());
	}

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
};

CopperChrome.updateLabel = function(id, value, append) {
	if (append) {
		document.getElementById(id).value += value;
	} else {
		document.getElementById(id).value = value;
	}
};

CopperChrome.clearLabels = function() {
	CopperChrome.updateLabel('info_code', '');
	CopperChrome.updateLabel('packet_payload', '');
	document.getElementById('info_payload').label='Payload';

	document.getElementById('packet_header_type').setAttribute('label', '');
	document.getElementById('packet_header_oc').setAttribute('label', '');
	document.getElementById('packet_header_code').setAttribute('label', '');
	document.getElementById('packet_header_tid').setAttribute('label', '');
	
	var optionList = document.getElementById('packet_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
};

CopperChrome.leadingZero = function(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
};

CopperChrome.isPowerOfTwo = function(i) {
	return ((i & (i-1))==0);
};

// workaround for "this" losing scope when passing callback functions
CopperChrome.myBind = function(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
};

CopperChrome.popup = function(title, str) {
	Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification('chrome://copper/skin/icon24.png',title,str);
};
