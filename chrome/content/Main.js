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

// namespace
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
CopperChrome.port = -1;
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
		document.getElementById('debug_option_proxy_uri').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.proxy-uri');
		document.getElementById('debug_option_etag').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.etag');
		document.getElementById('debug_option_uri_host').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.uri-host');
		document.getElementById('debug_option_location_path').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.location-path');
		document.getElementById('debug_option_uri_port').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.uri-port');
		document.getElementById('debug_option_location_query').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.location-query');
		document.getElementById('debug_option_observe').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.observe');
		document.getElementById('debug_option_token').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.token');
		document.getElementById('debug_option_block2').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.block2');
		document.getElementById('debug_option_block1').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.block1');
	} catch (ex) {
		window.setTimeout(
				function() { window.alert('WARNING: Could not load preferences; using hardcoded defauls.'+ex); },
				0);
	}
	
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	try {
		switch (CopperChrome.coapVersion) {
			case 3:
				loader.loadSubScript("resource://modules/CoapPacket03.jsm");
				break;
			case 6:
				loader.loadSubScript("resource://modules/CoapPacket06.jsm");
				break;
			default:
				window.setTimeout(
						function() { window.alert('WARNING: CoAP version '+CopperChrome.coapVersion+' not implemented. Using 03.'); },
						0);
				loader.loadSubScript("resource://modules/CoapPacket03.jsm");
				CopperChrome.coapVersion = 3;
				break;
		}
		document.getElementById('toolbar_version').label = 'CoAP ' + Copper.leadingZero(CopperChrome.coapVersion,2) + ' ';
		CopperChrome.initDebugContentTypes();
		
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
		if (CopperChrome.port!=Copper.DEFAULT_PORT) document.getElementById('debug_option_uri_port').value = CopperChrome.port;
		if (CopperChrome.path!='/') document.getElementById('debug_option_uri_path').value = CopperChrome.path;
		document.getElementById('debug_option_uri_query').value = CopperChrome.query;
		
		// set up datagram and transaction layer
		var temp = new CopperChrome.UdpClient(CopperChrome.hostname, CopperChrome.port);
		temp.registerErrorCallback(CopperChrome.errorHandler);
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
		CopperChrome.errorHandler({getCopperCode:function(){return ex;},getPayload:function(){return '';}});
		
	    dump('ERROR: Main.init ['+ex+']\n');
	}
};

CopperChrome.unload = function() {
	// shut down socket, required for refresh (F5)
	this.client.shutdown();
	
	// save as pref as persist does not work
	if (CopperChrome.hostname!='') CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port, document.getElementById('toolbar_payload').value);
	CopperChrome.prefManager.setBoolPref('extensions.copper.auto-discover', document.getElementById('toolbar_auto_discovery').checked);
	CopperChrome.prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
	
	// debug options
	CopperChrome.saveDebugContentTypes();
};


// Settings callbacks
////////////////////////////////////////////////////////////////////////////////

CopperChrome.settingRetransmissions = function() {
	//a click must notify client
	CopperChrome.client.setRetransmissions(document.getElementById('toolbar_retransmissions').checked);
	CopperChrome.prefManager.setBoolPref('extensions.copper.retransmissions', document.getElementById('toolbar_retransmissions').checked);
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
