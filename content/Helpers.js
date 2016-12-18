/*******************************************************************************
 * Copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.
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
 * This file is part of the Copper (Cu) CoAP user-agent.
 ******************************************************************************/
/**
 * \file
 *         Helper functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Helper functions
////////////////////////////////////////////////////////////////////////////////

Copper.getRequestType = function() {
	return Copper.behavior.requests=='con' ? Copper.MSG_TYPE_CON : Copper.MSG_TYPE_NON;
};

//TODO write nice generic settings object (settings['requests'] = 'bool';) and generate load/update/save code
// Load behavior options from preferences
Copper.loadBehavior = function() {
	Copper.behavior.requests = Copper.prefManager.getCharPref('extensions.copper.behavior.requests');
	Copper.behavior.retransmissions = Copper.prefManager.getBoolPref('extensions.copper.behavior.retransmissions');
	Copper.behavior.sendDuplicates = Copper.prefManager.getBoolPref('extensions.copper.behavior.send-duplicates');
	Copper.behavior.showUnknown = Copper.prefManager.getBoolPref('extensions.copper.behavior.show-unknown');
	Copper.behavior.rejectUnknown = Copper.prefManager.getBoolPref('extensions.copper.behavior.reject-unknown');
	Copper.behavior.sendUriHost = Copper.prefManager.getBoolPref('extensions.copper.behavior.send-uri-host');
	Copper.behavior.sendSize1 = Copper.prefManager.getBoolPref('extensions.copper.behavior.send-size1');
	Copper.behavior.blockSize = Copper.prefManager.getIntPref('extensions.copper.behavior.block-size');
	Copper.behavior.observeToken = Copper.prefManager.getBoolPref('extensions.copper.behavior.observe-token');
	Copper.behavior.observeCancellation = Copper.prefManager.getCharPref('extensions.copper.behavior.observe-cancellation');
	
	// init menu
	Copper.updateBehavior();
};
Copper.loadWindow = function() {
	document.getElementById('view_tree_box').setAttribute('width', Copper.prefManager.getCharPref('extensions.copper.window.view-tree-box'));
	document.getElementById('view_tree_split').setAttribute('state', Copper.prefManager.getCharPref('extensions.copper.window.view-tree-state'));
	document.getElementById('view_log_box').setAttribute('height', Copper.prefManager.getCharPref('extensions.copper.window.view-log-box'));
	document.getElementById('view_log_split').setAttribute('state', Copper.prefManager.getCharPref('extensions.copper.window.view-log-state'));
	document.getElementById('view_debug_split').setAttribute('state', Copper.prefManager.getCharPref('extensions.copper.window.view-debug-state'));
	document.getElementById('tabs_payload').selectedIndex = Copper.prefManager.getIntPref('extensions.copper.window.view-tab-index');
};
// sync XUL menu with behavior object
Copper.updateBehavior = function() {
	document.getElementById('menu_behavior_requests_' + Copper.behavior.requests).setAttribute('checked', 'true');
	document.getElementById('menu_behavior_retransmissions').setAttribute('checked', Copper.behavior.retransmissions);
	document.getElementById('menu_behavior_send_duplicates').setAttribute('checked', Copper.behavior.sendDuplicates);
	document.getElementById('menu_behavior_show_unknown').setAttribute('checked', Copper.behavior.showUnknown);
	document.getElementById('menu_behavior_reject_unknown').setAttribute('checked', Copper.behavior.rejectUnknown);
	document.getElementById('menu_behavior_send_uri_host').setAttribute('checked', Copper.behavior.sendUriHost);
	document.getElementById('menu_behavior_send_size1').setAttribute('checked', Copper.behavior.sendSize1);
	document.getElementById('menu_behavior_block_size_' + Copper.behavior.blockSize).setAttribute('checked', 'true');
	document.getElementById('menu_behavior_token_observe').setAttribute('checked', Copper.behavior.observeToken);
	document.getElementById('menu_behavior_observe_' + Copper.behavior.observeCancellation).setAttribute('checked', 'true');
	
	Copper.behaviorUpdate({id: 'menu_behavior_block_size', value: Copper.behavior.blockSize});
};
// sync behavior object with XUL menu (callback)
Copper.behaviorUpdate = function(target) {
	if (target.id.substr(0,22)=='menu_behavior_requests') {
		Copper.behavior.requests = target.value;
	} else if (target.id=='menu_behavior_retransmissions') {
		Copper.behavior.retransmissions = target.getAttribute('checked')=='true'; 
		Copper.endpoint.setRetransmissions(Copper.behavior.retransmissions);
	} else if (target.id=='menu_behavior_send_duplicates') {
		Copper.behavior.sendDuplicates = target.getAttribute('checked')=='true';
	} else if (target.id=='menu_behavior_show_unknown') {
		Copper.behavior.showUnknown = target.getAttribute('checked')=='true';
	} else if (target.id=='menu_behavior_reject_unknown') {
		Copper.behavior.rejectUnknown = target.getAttribute('checked')=='true';
	} else if (target.id=='menu_behavior_send_uri_host') {
		Copper.behavior.sendUriHost = target.getAttribute('checked')=='true';
	} else if (target.id=='menu_behavior_send_size1') {
		Copper.behavior.sendSize1 = target.getAttribute('checked')=='true';
	} else if (target.id.substr(0,24)=='menu_behavior_block_size') {
		Copper.behavior.blockSize = target.value;
		document.getElementById('menu_behavior_block_size_' + Copper.behavior.blockSize).setAttribute('checked', 'true');
		if (Copper.behavior.blockSize==0) {
			document.getElementById('debug_option_block1').setAttribute('disabled', 'true');
			document.getElementById('debug_option_block2').setAttribute('disabled', 'true');
			document.getElementById('chk_debug_option_block_auto').setAttribute('disabled', 'true');
		} else {
			document.getElementById('debug_option_block1').removeAttribute('disabled');
			document.getElementById('debug_option_block2').removeAttribute('disabled');
			document.getElementById('chk_debug_option_block_auto').removeAttribute('disabled');
		}
	} else if (target.id=='menu_behavior_token_observe') {
		Copper.behavior.observeToken = target.getAttribute('checked')=='true';
	} else if (target.id.substr(0,21)=='menu_behavior_observe') {
		Copper.behavior.observeCancellation = target.value;
	}
};
// save to preferences
Copper.saveBehavior = function() {
	Copper.prefManager.setCharPref('extensions.copper.behavior.requests', Copper.behavior.requests);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.retransmissions', Copper.behavior.retransmissions);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-duplicates', Copper.behavior.sendDuplicates);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.show-unknown', Copper.behavior.showUnknown);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.reject-unknown', Copper.behavior.rejectUnknown);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-uri-host', Copper.behavior.sendUriHost);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.send-size1', Copper.behavior.sendSize1);
	Copper.prefManager.setIntPref('extensions.copper.behavior.block-size', Copper.behavior.blockSize);
	Copper.prefManager.setBoolPref('extensions.copper.behavior.observe-token', Copper.behavior.observeToken);
	Copper.prefManager.setCharPref('extensions.copper.behavior.observe-cancellation', Copper.behavior.observeCancellation);
};
// save to preferences
Copper.saveWindow = function() {
	Copper.prefManager.setCharPref('extensions.copper.window.view-tree-scroll', document.getElementById('resource_tree').treeBoxObject.getFirstVisibleRow());
	Copper.prefManager.setCharPref('extensions.copper.window.view-tree-box', document.getElementById('view_tree_box').getAttribute('width'));
	Copper.prefManager.setCharPref('extensions.copper.window.view-tree-state', document.getElementById('view_tree_split').getAttribute('state'));
	Copper.prefManager.setCharPref('extensions.copper.window.view-log-box', document.getElementById('view_log_box').getAttribute('height'));
	Copper.prefManager.setCharPref('extensions.copper.window.view-log-state', document.getElementById('view_log_split').getAttribute('state'));
	Copper.prefManager.setCharPref('extensions.copper.window.view-debug-state', document.getElementById('view_debug_split').getAttribute('state'));
	Copper.prefManager.setIntPref('extensions.copper.window.view-tab-index', document.getElementById('tabs_payload').selectedIndex);
};

//Load last used payload from preferences, otherwise use default payload
Copper.loadPayload = function() {
	
	Copper.logEvent('INFO: loading payload from extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.*');
	
	try {
		Copper.payload.mode = Copper.prefManager.getCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.mode');
		Copper.payload.file = Copper.prefManager.getCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.file');
		
		document.getElementById('toolbar_payload_mode_' + Copper.payload.mode).setAttribute('checked', 'true');		
		document.getElementById('payload_text').value = Copper.prefManager.getCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.text');
		
		if (Copper.payload.file!='') {
			Copper.loadPayloadFileByName(Copper.payload.file);
		}
	} catch (ex) {
	    Copper.logEvent('INFO: no stored payload for '+Copper.hostname+':'+Copper.port);
	}
};

Copper.payloadUpdate = function(target) {
	
	if (target.id=='toolbar_payload_mode_text') {
		Copper.payload.mode = 'text';
		document.getElementById('tabs_payload').selectedIndex = 3;
		document.getElementById('payload_text').focus();
		Copper.logEvent('INFO: Selected text payload');
	} else if (target.id=='toolbar_payload_mode_file') {
		Copper.logEvent('INFO: Selected file payload');
		if (Copper.payload.file=='' || Copper.payload.data==null) {
			if (Copper.selectPayloadFile()) {
				Copper.payload.mode = 'file';
			} else {
				document.getElementById('toolbar_payload_filename').label = "Choose file...";
			}
		} else {
			Copper.payload.mode = 'file';
		}
	} else if (target.id=='toolbar_payload_filename') {
		Copper.selectPayloadFile();
	} else {
		Copper.logWarning("Unknown payload preference: "+target.id+"="+target.value);
	}
}

Copper.savePayload = function() {
	if (Copper.hostname!='') {
		Copper.prefManager.setCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.mode', Copper.payload.mode);
		Copper.prefManager.setCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.text', document.getElementById('payload_text').value);
		Copper.prefManager.setCharPref('extensions.copper.payloads.'+Copper.hostname+':'+Copper.port+'.file', Copper.payload.file);
	}
};

Copper.loadPayloadFileByName = function(filename) {
	
	try {
	
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);  
		file.initWithPath(filename);
		
		Copper.loadPayloadFile(file);
	} catch (ex) {
		Copper.logError(ex);
	}
};

Copper.selectPayloadFile = function() {
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	
	Copper.payload.file = '';
	Copper.payload.data = null;
	Copper.payload.loaded = false;

	let fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select payload file", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	let rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		Copper.payload.file = fp.file.path;
		Copper.loadPayloadFile(fp.file);
		return true;
	} else {
		return false;
	}
};

Copper.loadPayloadFile = function(file) {
	var channel = NetUtil.newChannel(file);
	NetUtil.asyncFetch(channel,
			function(inputStream, status) {
				if (!Components.isSuccessCode(status)) {  
					Copper.logError(new Error(status));
					return;
				}
				Copper.payload.data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				document.getElementById('toolbar_payload_filename').label = file.leafName;
				Copper.logEvent("INFO: Loaded payload file '" + file.path + "'");
				Copper.payload.loaded = true;
			}
		);
};

//Load cached resource links from preferences
Copper.loadCachedResources = function() {
	
	try {
		Copper.logEvent('INFO: loading cached resource links');
		let loadRes = Copper.prefManager.getCharPref('extensions.copper.resources.'+Copper.hostname+':'+Copper.port);
		Copper.resources = JSON.parse( unescape(loadRes) );
	} catch (ex) {
	    Copper.logEvent('INFO: no cached links for '+Copper.hostname+':'+Copper.port);
	}
};


Copper.parseUri = function(inputUri) {

/*	
	( 'coap:' )
    ( '//' Uri-Authority )
    ( '/'  Uri-Path )
    ( '?'  Uri-Query )
*/

	var uri;
	
	try {
		var uriParser = Components.classes["@mozilla.org/network/io-service;1"]
	    	.getService(Components.interfaces.nsIIOService)
	    	.newURI(inputUri, null, null);
		
		uri = uriParser.QueryInterface(Components.interfaces.nsIURL);
	} catch (ex) {
		// cannot parse URI
		throw new Error('Invalid URI');
	}
	
	// redirect to omit subsequent slash, refs (#), and params (;)
	if (uri.filePath!='/' && uri.fileName=='') {
		document.location.href = uri.prePath + uri.filePath.substring(0, uri.filePath.length-1) + (uri.query!='' ? '?'+uri.query : '');
		throw new Error('Redirect');
	} else if (uri.ref!='') {
		document.location.href = uri.prePath + uri.filePath + (uri.query!='' ? '?'+uri.query : '');
		throw new Error('Redirect');
	} else if (uri.filePath.match(/\/{2,}/)) {
		document.location.href = uri.prePath + uri.filePath.replace(/\/{2,}/g, '/') + (uri.query!='' ? '?'+uri.query : '');
		throw new Error('Redirect');
	}
	
	if (uri.port>0xFFFF) {
		throw new Error('Illeagal port');
	}
	
	Copper.hostname = uri.host;
	if (Copper.hostname.indexOf(':')!=-1) Copper.hostname = '['+Copper.hostname+']';
	
	Copper.port = uri.port!=-1 ? uri.port : Copper.DEFAULT_PORT;
	Copper.path = decodeURI(uri.filePath); // as for 06 and as a server workaround for 03
	Copper.query = decodeURI(uri.query); // as for 06 and as aserver workaround for 03
	
	document.title = Copper.hostname + ':' + Copper.port;
};

// Set the default URI and also check for modified Firefox URL bar
Copper.checkUri = function(uri, caller) {

	if (!uri) {
		uri = decodeURI(Copper.mainWindow.document.getElementById('urlbar').value);
	} else if (uri.indexOf('coap://')!=0) {
		// URI must be absolute
		if (uri.indexOf('/')!=0) uri = '/' + uri;
		// convert to full URI
		uri = 'coap://' + Copper.hostname + ':' + Copper.port + uri;
	}
		
	var uri2 = decodeURI(document.location.href);
	
	// when urlbar was changed without pressing enter, redirect and perform request
	if (caller && (uri!=uri2)) {
		
		// schedule the request to start automatically at new location
		Copper.prefManager.setCharPref('extensions.copper.onload-action', ''+caller);
		
		Copper.logEvent('INFO: Redirecting\n      from ' + uri2 + '\n      to   ' + uri);
		document.location.href = uri;
		
		// required to stop execution for redirect
		throw new Error('Redirect');
	} else {
		return Copper.path + (Copper.query ? '?'+Copper.query : '');
	}
};

Copper.parseCBOR = function(data) {
	try {
		let abs = data.length;
		let ab = new ArrayBuffer(abs);
		let abv = new DataView(ab);
		for(var i=0; i < abs; i++)
			abv.setUint8(i, data[i]);
		let ret = Copper.cbor.decode(ab);
		return ret;
	} catch(ex) {
		Copper.logError(new Error('Cannot parse CBOR'), true);
		return new Object();
	}
};

Copper.createCBOR = function (obj) {
    let ab = Copper.cbor.encode(obj);
    let abv = new DataView(ab);
    let abs = abv.byteLength;
    let a = new Array(abs);
    for(var i=0; i < abs; i++)
        a[i] = abv.getUint8(i, abv[i]);
    return a;
}

Copper.parseLinkFormat = function(data) {
	
	var links = new Object();
	
	// totally complicated but supports ',' and '\n' to separate links and ',' as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*\w+\s*(=\s*(\w+|"([^"\\]*(\\.[^"\\]*)*)")\s*)?)*)/g);
	Copper.logEvent('-parsing link-format----------------------------');
	for (var i in format) {
		//Copper.logEvent(links[i]+'\n');
		var elems = format[i].match(/^<([^>\?]+)[^>]*>\s*(;.+)?\s*$/);
				
		var uri = elems[1];

		if (uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/)) {
			// absolute URI
		} else {
			// fix for old Contiki implementation and others which omit the leading '/' in the link format
			if (uri.charAt(0)!='/') uri = '/'+uri;
		}
		
		links[uri] = new Object();
		
		if (elems[2]) {
		
			var tokens = elems[2].match(/(;\s*\w+\s*(=\s*(\w+|"([^\\"]*(\\.[^"\\]*)*)"))?)/g);
		
			Copper.logEvent(' '+uri+' ('+tokens.length+')');
		
			for (var j in tokens) {
				//Copper.logEvent('  '+tokens[j]+'\n');
				var keyVal = tokens[j].match(/;\s*([^<"\s;,=]+)\s*(=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)"))?/);
				if (keyVal) {
					//Copper.logEvent(keyVal[0]+'\n');
					//Copper.logEvent('   '+keyVal[1] + (keyVal[2] ? (': '+ (keyVal[4] ? keyVal[4] : keyVal[5].replace(/\\/g,''))) : ''));
					
					if (links[uri][keyVal[1]]!=null) {
						
						if (!Array.isArray(links[uri][keyVal[1]])) {
							let temp = links[uri][keyVal[1]]; 
							links[uri][keyVal[1]] = new Array(0);
							links[uri][keyVal[1]].push(temp);
						}
						
						links[uri][keyVal[1]].push(keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true);
						
					} else {
						
						links[uri][keyVal[1]] = keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true;
					}
				}
			}
		} else {
			Copper.logEvent(' '+uri+' (no attributes)');
		}
	}
	Copper.logEvent('------------------------------------------------');
	
	return links;
};

Copper.updateResourceLinks = function(add) {
	
	// merge links
	if (add) {
		for (var uri in add) {
			if (!Copper.resources[uri]) {
				Copper.resources[uri] = add[uri];
				Copper.logEvent('INFO: adding '+uri+' to host resources');
			}
		}
	}
	
	// add well-known resource to resource cache
	if (!Copper.resources[Copper.WELL_KNOWN_RESOURCES]) {
		Copper.resources[Copper.WELL_KNOWN_RESOURCES] = new Object();
		Copper.resources[Copper.WELL_KNOWN_RESOURCES]['ct'] = 40;
		Copper.resources[Copper.WELL_KNOWN_RESOURCES]['title'] = 'Resource discovery';
	}
	
	Copper.clearTree();
	
	// sort by path
	let sorted = new Array();
	for (var uri in Copper.resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (var entry in sorted) {

		let uri = sorted[entry];
		// add to tree view
		Copper.addTreeResource( decodeURI(uri), Copper.resources[uri] );
	}
	
	// restore scroll position
	document.getElementById('resource_tree').treeBoxObject.scrollToRow(Copper.prefManager.getCharPref('extensions.copper.window.view-tree-scroll'));
	
	// save in cache
	let saveRes = JSON.stringify(Copper.resources);
	if (Copper.hostname!='') Copper.prefManager.setCharPref('extensions.copper.resources.'+Copper.hostname+':'+Copper.port, escape(saveRes));
};

Copper.displayMessageInfo = function(message) {
	
	if (message.getCopperCode) {
		Copper.updateLabel('info_code', 'Copper: '+message.getCopperCode());
	} else {
		Copper.updateLabel('info_code', message.getCode(true));
	}

	document.getElementById('packet_header_type').setAttribute('label', message.getType(true));
	document.getElementById('packet_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('packet_header_mid').setAttribute('label', message.getMID());
	document.getElementById('packet_header_token').setAttribute('label', message.getToken(true));
	
	let optionList = document.getElementById('packet_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	
	let options = message.getOptions(false)
	
	for (let i in options) {
		
        let row = document.createElement('listitem');
        
        let cell = document.createElement('listcell');
        cell.setAttribute('label', options[i][0]);
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label',  options[i][1] );
        cell.setAttribute('id',  'packet_options_'+options[i][0].toLowerCase() );
        row.appendChild(cell);

        cell = document.createElement('listcell');
        cell.setAttribute('label',  options[i][2] );
        row.appendChild(cell);
        
        if (options[i][0]=='ETag') {
        	// might be cleaner with bind()
        	var etagValueCopy = options[i][1];
        	row.addEventListener('dblclick', function(event) {
        		if (event.button == 0) { // left
        			document.getElementById('debug_option_etag').value = etagValueCopy;
        		} else { // right
        			document.getElementById('debug_option_if_match').value = etagValueCopy;
        		}
        	});
        	row.setAttribute('tooltiptext', 'Double-click for Debug Control: Left for ETag, right for If-Match');
        }
        
        if (options[i][0]=='Max-Age') {
        	var maxAgeHandle = row;
        	window.setTimeout(function() { maxAgeHandle.style.backgroundColor='red'; maxAgeHandle.style.color='white'; }, options[i][1]*1000);
        }
        
        optionList.appendChild(row);
        
        if (options[i][0]=='Location-Path') {
        	Copper.updateResourceLinks( Copper.parseLinkFormat( '<'+options[i][1]+'>' ) );
        }
    }
};

Copper.displayCache = null;
Copper.displayInvalid = false;

Copper.displayPayload = function(message) {
	
	if (message.getPayload().length<1) {
		return;
	}
	
	// complete payload or first received block
	if (!message.isOption(Copper.OPTION_BLOCK2) || message.getBlock2Number()==0 || Copper.displayCache==null) {
		Copper.displayCache = new Copper.CoapMessage(0,0);
		Copper.displayCache.setContentType(message.getContentFormat());
		
		if (message.isOption(Copper.OPTION_BLOCK2) && message.getBlock2Number()!=0) {
			document.getElementById('info_payload').label='Partial Payload ('+message.getPayload().length+')';
			Copper.displayInvalid = true;
		} else {
			document.getElementById('info_payload').label='Payload ('+message.getPayload().length+')';
			Copper.displayInvalid = false;
		}
	
	// additional blocks
	} else {
		document.getElementById('info_payload').label='Combined Payload ('+ (Copper.displayCache.getPayload().length + message.getPayload().length)  +')';
	}
	
	Copper.displayCache.setBlock2(message.getBlock2());
	Copper.displayCache.appendPayload(message.getPayload());
	
	switch (Copper.displayCache.getContentFormat()) {
		case Copper.CONTENT_TYPE_IMAGE_GIF:
		case Copper.CONTENT_TYPE_IMAGE_JPEG:
		case Copper.CONTENT_TYPE_IMAGE_PNG:
		case Copper.CONTENT_TYPE_IMAGE_TIFF:
			Copper.renderImage(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_AUDIO_RAW:
		case Copper.CONTENT_TYPE_VIDEO_RAW:
		case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
		case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			// only render full representation to avoid slow down
			if (!message.getBlock2More()) Copper.renderBinary(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_EXI:
			if (!message.getBlock2More()) Copper.renderBinary(Copper.displayCache);
			Copper.renderEXI(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_JSON:
		case Copper.CONTENT_TYPE_APPLICATION_THING_DESCRIPTION_JSON:
		case Copper.CONTENT_TYPE_APPLICATION_LIGHTING_CONFIG_JSON:
		case Copper.CONTENT_TYPE_APPLICATION_LIGHTING_JSON:
		case Copper.CONTENT_TYPE_APPLICATION_BULLETIN_BOARD_JSON:
			Copper.renderText(Copper.displayCache);
			// only render full representation to avoid parsing errors
			if (!Copper.displayInvalid && !message.getBlock2More()) Copper.renderJSON(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_CBOR:
			if (!Copper.displayInvalid && !message.getBlock2More()) Copper.renderBinary(Copper.displayCache);
			if (!Copper.displayInvalid && !message.getBlock2More()) Copper.renderCBOR(Copper.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT:
			Copper.renderText(Copper.displayCache);
			Copper.renderLinkFormat(Copper.displayCache);
			break;
		default:
			Copper.renderText(Copper.displayCache);
	}
	
	if (!message.getBlock2More()) {
		delete Copper.displayCache;
		Copper.displayInvalid = false;
	}
};

Copper.updateLabel = function(id, value, append) {
	if (append) {
		document.getElementById(id).value += value;
	} else {
		document.getElementById(id).value = value;
	}
};

Copper.clearLabels = function(full) {
	
	if (full || full==null) {
		Copper.updateLabel('info_code', '');
		Copper.updateLabel('packet_payload', '');
		document.getElementById('info_payload').label='Payload';
	
		document.getElementById('packet_header_type').setAttribute('label', '');
		document.getElementById('packet_header_code').setAttribute('label', '');
		document.getElementById('packet_header_mid').setAttribute('label', '');
		document.getElementById('packet_header_token').setAttribute('label', '');
		
		document.getElementById('tabs_payload').selectedIndex = 0;
		
		var optionList = document.getElementById('packet_options');
		while (optionList.getRowCount()) optionList.removeItemAt(0);
	}
	document.getElementById('group_head').setAttribute('style', '');
	document.getElementById('group_payload').setAttribute('style', '');
};

Copper.negotiateBlockSize = function(message) {
	var size = message.getBlock2Size();
	if (Copper.behavior.blockSize==0) {
		Copper.behavior.blockSize = size;
		Copper.updateBehavior();
	
		Copper.popup(Copper.hostname+':'+Copper.port, 'Negotiated block size: '+size);
	} else if (Copper.behavior.blockSize < size) {
		size = Copper.behavior.blockSize;
	}
	return size;
};

// workaround for "this" losing scope when passing callback functions
Copper.myBind = function(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
};

Copper.popup = function(title, str) {
	try {
		Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification('chrome://copper/skin/Cu_32.png',title,str);
	} catch (ex) {
		Copper.logEvent("WARNING: You are probably running Mac OS without Growl, which is required for notifications.")
	}
};

Copper.payloadFontSize = 100;
Copper.decPayloadFontSize = function() {
	Copper.payloadFontSize -= 10;
	document.getElementById('tabs_style').style.fontSize=Copper.payloadFontSize+'%';
};
Copper.incPayloadFontSize = function() {
	Copper.payloadFontSize += 10;
	document.getElementById('tabs_style').style.fontSize=Copper.payloadFontSize+'%';
};
