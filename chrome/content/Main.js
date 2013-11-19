/*******************************************************************************
 * Copyright (c) 2013, Institute for Pervasive Computing, ETH Zurich.
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
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
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
 * This file is part of the Copper CoAP browser.
 ******************************************************************************/
/**
 * \file
 *         Main program code for the Copper CoAP Browser
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// namespace
Components.utils.import("resource://drafts/common.jsm");

// file IO
Components.utils.import("resource://gre/modules/NetUtil.jsm");

CopperChrome.mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);

CopperChrome.prefManager = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);

CopperChrome.coapVersion = 13;

CopperChrome.hostname = '';
CopperChrome.port = -1;
CopperChrome.path = '/';
CopperChrome.query = '';

CopperChrome.client = null;
CopperChrome.observer = null;

CopperChrome.resources = new Object();
CopperChrome.resourcesCached = true;

CopperChrome.payloadFile = '';
CopperChrome.payloadFileLoaded = false;
CopperChrome.payloadFileData = null;

CopperChrome.uploadMethod = 0;
CopperChrome.uploadBlocks = null;

CopperChrome.behavior = {
	requests: 'con',
	retransmission: true,
	sendDuplicates: false,
	showUnknown: false,
	rejectUnknown: true,
	sendUriHost: false,
	sendSize1: false,
	blockSize: 0,
	observeToken: true,
	observeCancellation: 'lazy'
};

// Life cycle functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.main = function() {
	
	dump(Array(5).join('\n'));
	dump('==============================================================================\n');
	dump('=INITIALIZING COPPER==========================================================\n');
	dump('==============================================================================\n');
		
 	// set the Cu icon for all Copper tabs
	// TODO: There must be a more elegant way
	var tabbrowser = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getEnumerator("navigator:browser").getNext().gBrowser;  
	for (var i=0; i<tabbrowser.browsers.length; ++i) {
		if (tabbrowser.mTabs[i].label=='Copper CoAP Browser')
		tabbrowser.setIcon(tabbrowser.mTabs[i], 'chrome://copper/skin/Cu_16.png');
	}
	
	// get settings from preferences
	var onloadAction = null;
	try {
		CopperChrome.coapVersion = CopperChrome.prefManager.getIntPref('extensions.copper.coap-version');
		
		document.getElementById('resource_split').setAttribute('state', CopperChrome.prefManager.getBoolPref('extensions.copper.use-tree') ? 'open' : 'collapsed');
		document.getElementById('resource_split').hidden = !CopperChrome.prefManager.getBoolPref('extensions.copper.use-tree');
		
		onloadAction = CopperChrome.prefManager.getCharPref('extensions.copper.onload-action');
		
		CopperChrome.loadBehavior();
		CopperChrome.loadDebugOptions();
		
		if (CopperChrome.prefManager.getBoolPref('extensions.copper.plugtest.menu')) {
			document.getElementById('menu_plugtest').hidden = false;
			CopperChrome.loadPlugtest();
		}
		
	} catch (ex) {
		window.setTimeout(
				function() { window.alert('WARNING: Could not load preferences; using hardcoded defauls.'+ex); },
				0);
	}
	
	try {
		// keep dangerous object loader local
		let loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
		
		switch (CopperChrome.coapVersion) {
			case 3:
				loader.loadSubScript("resource://drafts/CoapPacket03.jsm");
				break;
			case 6:
				loader.loadSubScript("resource://drafts/CoapPacket06.jsm");
				break;
			case 7:
			case 8:
				loader.loadSubScript("resource://drafts/CoapPacket07.jsm");
				break;
			case 12:
				loader.loadSubScript("resource://drafts/CoapPacket12.jsm");
				break;
			case 13:
				loader.loadSubScript("resource://drafts/CoapPacket13.jsm");
				break;
			case 18:
				loader.loadSubScript("resource://drafts/CoapPacket18.jsm");
				break;
			default:
				window.setTimeout(
						function() { window.alert('WARNING: CoAP version '+CopperChrome.coapVersion+' not implemented. Using draft 18.'); },
						0);
				loader.loadSubScript("resource://drafts/CoapPacket18.jsm");
				CopperChrome.coapVersion = 18;
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
		
		// set up datagram and transaction layer
		var temp = new CopperChrome.UdpClient(CopperChrome.hostname, CopperChrome.port);
		temp.registerErrorCallback(CopperChrome.errorHandler);
		CopperChrome.client = new CopperChrome.TransactionHandler(temp, CopperChrome.behavior.retransmissions);
		CopperChrome.client.registerCallback(CopperChrome.defaultHandler);
		
		// enable observing
		CopperChrome.observer = new CopperChrome.Observing();
		
		CopperChrome.loadCachedResources();
		CopperChrome.updateResourceLinks();
		
		CopperChrome.loadLastPayload();
		
		
		// handle auto-request after redirect
		if (onloadAction!='') {
			
			dump('INFO: Main.init [onloadAction: '+onloadAction+']\n');
			
			window.setTimeout(
					'CopperChrome.'+onloadAction+'();',
					0);
			
			// reset onloadAction
			CopperChrome.prefManager.setCharPref('extensions.copper.onload-action', '');
		}
		
	} catch( ex ) {
		CopperChrome.errorHandler({getCopperCode:function(){return ex;},getPayload:function(){return '';}});
		
	    dump('ERROR: Main.init ['+ex+']\n');
	}
};

CopperChrome.unload = function() {
	// shut down socket required for refresh (F5), client might be null for parseUri() redirects
	if (CopperChrome.client!=null) {
		CopperChrome.client.shutdown();
	}
	
	CopperChrome.saveBehavior();
	CopperChrome.savePayload();
	CopperChrome.saveDebugOptions();
	CopperChrome.savePlugtest();
};


// Toolbar commands
////////////////////////////////////////////////////////////////////////////////

CopperChrome.userGet = function() {
	CopperChrome.client.cancelTransactions();
	var uri = CopperChrome.checkUri(null, 'userGet');
	
	CopperChrome.sendGet(uri);
};
CopperChrome.userPost = function() {
	CopperChrome.client.cancelTransactions();
	var uri = CopperChrome.checkUri(null, 'userPost');
	
	CopperChrome.sendPost(uri);
};
CopperChrome.userPut = function() {
	CopperChrome.client.cancelTransactions();
	var uri = CopperChrome.checkUri(null, 'userPut');
	
	CopperChrome.sendPut(uri);
};
CopperChrome.userDelete = function() {
	CopperChrome.client.cancelTransactions();
	var uri = CopperChrome.checkUri(null, 'userDelete');

	CopperChrome.sendDelete(uri);
};
CopperChrome.userObserve = function() {
	var uri = CopperChrome.checkUri(uri, 'observe');
	
	CopperChrome.observe(uri);
};

CopperChrome.userDiscover = function() {
	dump('INFO: resetting cached resources\n');
	document.getElementById('toolbar_discover').image = 'chrome://copper/skin/spinner.gif';
	CopperChrome.prefManager.setCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port, '' );
	CopperChrome.resources = new Object();
	
	CopperChrome.discover();
};


// Request commands
////////////////////////////////////////////////////////////////////////////////

CopperChrome.sendGet = function(uri, callback) {
	try {
		if (!uri) throw 'No URI specified';
		
		if (CopperChrome.behavior.blockSize!=0) {
			CopperChrome.sendBlockwiseGet(uri, parseInt(document.getElementById('debug_option_block2').value), CopperChrome.behavior.blockSize);
			return;
		}
		
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), Copper.GET, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message, callback );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.sendGet ['+ex+']');
	}
};
CopperChrome.sendBlockwiseGet = function(uri, num, size) {
	try {
		if (!uri) throw 'No URI specified';
		if (!num) num = 0;
		if (!size) size = CopperChrome.behavior.blockSize;
		
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), Copper.GET, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		// (re)set to useful block option
		message.setBlock(num, size);
		
		CopperChrome.clearLabels(num==0);
		CopperChrome.client.send( message, CopperChrome.blockwiseHandler );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.sendBlockwiseGet ['+ex+']');
	}
};

CopperChrome.sendPost = function(uri, callback) {
	CopperChrome.doUpload(Copper.POST, uri, callback);
};

CopperChrome.sendPut = function(uri, callback) {
	CopperChrome.doUpload(Copper.PUT, uri, callback);
};

CopperChrome.doUpload = function(method, uri, callback) {
	try {
		if (!uri) throw 'No URI specified';
		
		uri = CopperChrome.checkUri(uri, method);
		
		let pl = '';
		
		if (document.getElementById('toolbar_payload_mode').value=='page') {
			pl = Copper.str2bytes(document.getElementById('payload_text_page').value);
		} else {
			if (!CopperChrome.payloadFileLoaded) {
				// file loading as async, wait until done
				window.setTimeout(function() {CopperChrome.doUpload(method,uri);}, 50);
				return;
			}
			pl = Copper.data2bytes(CopperChrome.payloadFileData);
		}
		
		// store payload in case server requests blockwise upload
		CopperChrome.uploadMethod = method; // POST or PUT
		CopperChrome.uploadBlocks = pl;
		
		// blockwise uploads
		if (CopperChrome.behavior.blockSize!=0 && pl.length > CopperChrome.behavior.blockSize) {
			CopperChrome.doBlockwiseUpload(uri, parseInt(document.getElementById('debug_option_block1').value), CopperChrome.behavior.blockSize);
			return;
		}
		
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), method, uri, pl);
		
		CopperChrome.checkDebugOptions(message);
		
		if (CopperChrome.behavior.sendSize1) {
			dump('INFO: Send auto Size1 option\n');
			message.setSize1(pl.length);
			document.getElementById('debug_option_size1').value = pl.length;
		}
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message, callback );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.doUpload ['+ex+']');
	}
}

CopperChrome.doBlockwiseUpload = function(uri, num, size) {
	try {
		if (!uri) throw 'No URI specified';
		if (!num) num = 0;
		if (!size) size = CopperChrome.behavior.blockSize;
		
		if (CopperChrome.uploadBlocks==null || CopperChrome.uploadMethod==0) {
			throw 'No upload in progress, cancelling';
		}
		if ( (num>0) && (size*(num-1) > CopperChrome.uploadBlocks.length)) { // num-1, as we are called with the num to send, not was has been send
			throw 'Debug Block1 out of payload scope';
		}
	
		let more = false;
		let pl = CopperChrome.uploadBlocks.slice(size*num, size*(num+1));
		
		if (CopperChrome.uploadBlocks.length > (num+1) * size) { // num+1, as we start counting at 0...
			more = true;
		}
		
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), CopperChrome.uploadMethod, uri, pl);
		
		CopperChrome.checkDebugOptions(message);
		
		if (CopperChrome.behavior.sendSize1) {
			dump('INFO: Send auto Size1 option\n');
			message.setSize1(CopperChrome.uploadBlocks.length);
			document.getElementById('debug_option_size1').value = CopperChrome.uploadBlocks.length;
		}
		
		message.setBlock1(num, size, more);
		
		CopperChrome.clearLabels(num==0);
		CopperChrome.client.send( message, CopperChrome.blockwiseHandler );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.doBlockwiseUpload ['+ex+']');
	}
};

CopperChrome.sendDelete = function(uri, callback) {
	try {
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), Copper.DELETE, uri);
		
		CopperChrome.checkDebugOptions(message);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message, callback );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.sendDelete ['+ex+']');
	}
};

CopperChrome.observe = function(uri) {
	try {
		CopperChrome.observer.subscribe(uri, CopperChrome.observingHandler);
		
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.observe ['+ex+']');
	}
};

CopperChrome.discover = function(block, size) {
	try {
		var message = new CopperChrome.CoapMessage(CopperChrome.getRequestType(), Copper.GET, Copper.WELL_KNOWN_RESOURCES);
		
		if (block!=null) {
			if (size==null) size = CopperChrome.behavior.blockSize;
			message.setBlock(block, size);
		} 
		
		CopperChrome.client.send( message, CopperChrome.discoverHandler );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.discover ['+ex+']');
	}
};

// Sends a CoAP ping which is an empty CON message
CopperChrome.ping = function() {
	try {
		CopperChrome.client.cancelTransactions();
		
		var message = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON);
		
		CopperChrome.clearLabels();
		CopperChrome.client.send( message );
	} catch (ex) {
		CopperChrome.client.cancelTransactions();
		alert('ERROR: Main.ping ['+ex+']');
	}
};