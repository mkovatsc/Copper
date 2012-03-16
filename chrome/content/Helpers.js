/*******************************************************************************
 * Copyright (c) 2012, Institute for Pervasive Computing, ETH Zurich.
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
 *         Helper functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Helper functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.getRequestType = function() {
	return CopperChrome.behavior.requests=='con' ? Copper.MSG_TYPE_CON : Copper.MSG_TYPE_NON;
};

// Load behavior options from preferences and init menu
CopperChrome.loadBehavior = function() {
	CopperChrome.behavior.requests = CopperChrome.prefManager.getCharPref('extensions.copper.behavior.requests');
	CopperChrome.behavior.retransmissions = CopperChrome.prefManager.getBoolPref('extensions.copper.behavior.retransmissions');
	CopperChrome.behavior.sendDuplicates = CopperChrome.prefManager.getBoolPref('extensions.copper.behavior.send-duplicates');
	CopperChrome.behavior.showUnknown = CopperChrome.prefManager.getBoolPref('extensions.copper.behavior.show-unknown');
	CopperChrome.behavior.rejectUnknown = CopperChrome.prefManager.getBoolPref('extensions.copper.behavior.reject-unknown');
	CopperChrome.behavior.blockSize = CopperChrome.prefManager.getIntPref('extensions.copper.behavior.block-size');
	CopperChrome.behavior.observeToken = CopperChrome.prefManager.getBoolPref('extensions.copper.behavior.observe-token');
	CopperChrome.behavior.observeCancellation = CopperChrome.prefManager.getCharPref('extensions.copper.behavior.observe-cancellation');
	
	document.getElementById('menu_behavior_requests_' + CopperChrome.behavior.requests).setAttribute('checked', 'true');
	document.getElementById('menu_behavior_retransmissions').setAttribute('checked', CopperChrome.behavior.retransmissions);
	document.getElementById('menu_behavior_send_duplicates').setAttribute('checked', CopperChrome.behavior.sendDuplicates);
	document.getElementById('menu_behavior_show_unknown').setAttribute('checked', CopperChrome.behavior.showUnknown);
	document.getElementById('menu_behavior_reject_unknown').setAttribute('checked', CopperChrome.behavior.rejectUnknown);
	document.getElementById('menu_behavior_block_size_' + CopperChrome.behavior.blockSize).setAttribute('checked', 'true');
	document.getElementById('menu_behavior_token_observe').setAttribute('checked', CopperChrome.behavior.observeToken);
	document.getElementById('menu_behavior_observe_' + CopperChrome.behavior.observeCancellation).setAttribute('checked', 'true');
	
};

CopperChrome.saveBehavior = function() {
	CopperChrome.prefManager.setCharPref('extensions.copper.behavior.requests', CopperChrome.behavior.requests);
	CopperChrome.prefManager.setBoolPref('extensions.copper.behavior.retransmissions', CopperChrome.behavior.retransmissions);
	CopperChrome.prefManager.setBoolPref('extensions.copper.behavior.send-duplicates', CopperChrome.behavior.sendDuplicates);
	CopperChrome.prefManager.setBoolPref('extensions.copper.behavior.show-unknown', CopperChrome.behavior.showUnknown);
	CopperChrome.prefManager.setBoolPref('extensions.copper.behavior.reject-unknown', CopperChrome.behavior.rejectUnknown);
	CopperChrome.prefManager.setIntPref('extensions.copper.behavior.block-size', CopperChrome.behavior.blockSize);
	CopperChrome.prefManager.setBoolPref('extensions.copper.behavior.observe-token', CopperChrome.behavior.observeToken);
	CopperChrome.prefManager.setCharPref('extensions.copper.behavior.observe-cancellation', CopperChrome.behavior.observeCancellation);
};

//Load last used payload from preferences, otherwise use default payload
CopperChrome.loadDefaultPayload = function() {
	
	document.getElementById('toolbar_payload_mode').selectedIndex = 0;
	//document.getElementById('payload_text_line').value = CopperChrome.prefManager.getCharPref('extensions.copper.default-payload');
	
	try {
		document.getElementById('toolbar_payload_mode').selectedIndex = CopperChrome.prefManager.getIntPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.mode');
		
		//document.getElementById('payload_text_line').value = CopperChrome.prefManager.getCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.line');
		document.getElementById('payload_text_page').value = CopperChrome.prefManager.getCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.page');
		CopperChrome.payloadFile = CopperChrome.prefManager.getCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.file');
		
		if (CopperChrome.payloadFile!='') {
			CopperChrome.loadPayloadFileByName(CopperChrome.payloadFile);
		}
		
		CopperChrome.checkPayload();
	} catch( ex ) {
	    dump('INFO: no default payload for '+CopperChrome.hostname+':'+CopperChrome.port+' yet\n');
	}
};

CopperChrome.savePayload = function() {
	if (CopperChrome.hostname!='') {
		CopperChrome.prefManager.setIntPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.mode', document.getElementById('toolbar_payload_mode').selectedIndex);
		CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.page', document.getElementById('payload_text_page').value);
		CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.file', CopperChrome.payloadFile);
	}
};

CopperChrome.loadPayloadFileByName = function(filename) {
	
	try {
	
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);  
		file.initWithPath(filename);
		
		CopperChrome.loadPayloadFile(file);
	} catch (ex) {
		alert('ERROR: Main.loadPayloadFileByName [' + ex + ']');
	}
};

CopperChrome.loadPayloadFile = function(file) {
	var channel = NetUtil.newChannel(file);
	NetUtil.asyncFetch(channel,
			function(inputStream, status) {
				if (!Components.isSuccessCode(status)) {  
					alert('ERROR: Main.payloadFile ['+status+']');
					return;  
				}
				CopperChrome.payloadFileData = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				document.getElementById('toolbar_payload_file').label = file.leafName;
				CopperChrome.payloadFileLoaded = true;
				dump('INFO: loaded "' + file.path + '"\n');
			}
		);
};

CopperChrome.checkPayload = function() {
	if (document.getElementById('toolbar_payload_mode').value=='page') {
		document.getElementById('tabs_payload').selectedIndex = 3;
		document.getElementById('payload_text_page').focus();
	} else if (document.getElementById('toolbar_payload_mode').value=='file' && CopperChrome.payloadFile=='') {
		CopperChrome.selectPayloadFile();
	}
}

CopperChrome.selectPayloadFile = function() {
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	
	CopperChrome.payloadFile = '';
	CopperChrome.payloadFileData = null;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select payload file", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		CopperChrome.payloadFile = fp.file.path;
		CopperChrome.loadPayloadFile(fp.file);
	} else {
		CopperChrome.payloadFile = '';
		CopperChrome.payloadFileData = null;
		CopperChrome.payloadFileLoaded = false;
		document.getElementById('toolbar_payload_file').label = "Select...";
		document.getElementById('toolbar_payload_mode').selectedIndex = 0;
	}
};

//Load cached resource links from preferences
CopperChrome.loadCachedResources = function() {
	
	try {
		dump('INFO: loading cached resource links\n');
		let loadRes = CopperChrome.prefManager.getCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port);
		CopperChrome.resources = JSON.parse( unescape(loadRes) );
		
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


CopperChrome.parseUri = function(uri) {

/*	
	( 'coap:' )
    ( '//' Uri-Authority )
    ( '/'  Uri-Path )
    ( '?'  Uri-Query )
*/

	var url;
	
	try {
		var parsedUri = Components.classes["@mozilla.org/network/io-service;1"]
	    	.getService(Components.interfaces.nsIIOService)
	    	.newURI(uri, null, null);
		
		url = parsedUri.QueryInterface(Components.interfaces.nsIURL);
	} catch(ex) {
		// cannot parse URI
		throw 'Invalid URI';
	}
	
	// redirect to omit subsequent slash, refs (#), and params (;)
	if (url.filePath!='/' && url.fileName=='') {
		document.location.href = url.prePath + url.filePath.substring(0, url.filePath.length-1) + (url.query!='' ? '?'+url.query : '');
		throw 'Redirect';
	} else if (url.ref!='') {
		document.location.href = url.prePath + url.filePath + (url.query!='' ? '?'+url.query : '');
		throw 'Redirect';
	} else if (url.filePath.match(/\/{2,}/)) {
		document.location.href = url.prePath + url.filePath.replace(/\/{2,}/g, '/') + (url.query!='' ? '?'+url.query : '');
		throw 'Redirect';
	}
	
	if (url.port>0xFFFF) {
		throw 'Illeagal port';
	}
	
	// DNS lookup
	try {
		var ns = Components.classes["@mozilla.org/network/dns-service;1"].createInstance(Components.interfaces.nsIDNSService).resolve(url.host.replace(/%.+$/, ''), 0);
		
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
	
	CopperChrome.port = url.port!=-1 ? url.port : Copper.DEFAULT_PORT;
	CopperChrome.path = decodeURI(url.filePath); // as for 06 and as a server workaround for 03
	CopperChrome.query = decodeURI(url.query); // as for 06 and as aserver workaround for 03
	
	document.title = CopperChrome.hostname + CopperChrome.path;
	document.getElementById('info_host').label = CopperChrome.hostname + ':' + CopperChrome.port;
};

// Set the default URI and also check for modified Firefox URL bar
CopperChrome.checkUri = function(uri, method) {
	if (!uri) {
		// document.location.href uses different encoding than urlbar value; parse to nsIURI to compare
		var uriParser = Components.classes["@mozilla.org/network/simple-uri;1"].getService(Components.interfaces.nsIURI);

		//uriParser.spec = decodeURI(CopperChrome.mainWindow.document.getElementById('urlbar').value);
		var uri1 = decodeURI(CopperChrome.mainWindow.document.getElementById('urlbar').value);
		//uriParser.spec;
		
		//uriParser.spec = decodeURI(document.location.href);
		var uri2 = decodeURI(document.location.href);
		//uriParser.spec;
		
		// when urlbar was changed without pressing enter, redirect and perform request
		if (method && (uri1!=uri2)) {
			//alert('You edited the URL bar:\n'+uri1+'\n'+uri2);
			
			// schedule the request to start automatically at new location
			CopperChrome.prefManager.setIntPref('extensions.copper.auto-request.method', method);
			
			// redirect
			document.location.href = uri1;
		}
		return CopperChrome.path + (CopperChrome.query ? '?'+CopperChrome.query : '');
	} else {
		return uri;
	}
};

CopperChrome.parseLinkFormat = function(data) {
	
	var links = new Object();
	
	// totally complicated but supports ',' and '\n' to seperate links and ',' as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*\w+\s*(=\s*(\w+|"([^"\\]*(\\.[^"\\]*)*)")\s*)?)*)/g);
	dump('-parsing link-format----------------------------\n');
	for (var i in format) {
		//dump(links[i]+'\n');
		var elems = format[i].match(/^<([^>\?]+)[^>]*>\s*(;.+)?\s*$/);
				
		var uri = elems[1];
		// fix for Contiki implementation and others which omit the leading '/' in the link format
		if (uri.charAt(0)!='/') uri = '/'+uri;
		
		links[uri] = new Object();
		
		if (elems[2]) {
		
			var tokens = elems[2].match(/(;\s*\w+\s*(=\s*(\w+|"([^\\"]*(\\.[^"\\]*)*)"))?)/g);
		
			dump(' '+uri+' ('+tokens.length+')\n');
		
			for (var j in tokens) {
				//dump('  '+tokens[j]+'\n');
				var keyVal = tokens[j].match(/;\s*([^<"\s;,=]+)\s*(=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)"))?/);
				if (keyVal) {
					dump(keyVal[0]+'\n');
					dump('   '+keyVal[1] + (keyVal[2] ? (': '+ (keyVal[4] ? keyVal[4] : keyVal[5].replace(/\\/g,''))) : '') + '\n');
					
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
			dump(' '+uri+' (no attributes)\n');
		}
	}
	dump(' -----------------------------------------------\n');
	
	// add well-known resource to resource cache
	if (!links[Copper.WELL_KNOWN_RESOURCES]) {
		links[Copper.WELL_KNOWN_RESOURCES] = new Object();
		links[Copper.WELL_KNOWN_RESOURCES]['ct'] = 40;
		links[Copper.WELL_KNOWN_RESOURCES]['title'] = 'Resource discovery';
	}
	
	return links;
};

CopperChrome.updateResourceLinks = function(add) {
	
	// merge links
	if (add) {
		for (var uri in add) {
			if (!CopperChrome.resources[uri]) {
				CopperChrome.resources[uri] = add[uri];
				dump('INFO: adding '+uri+' to host resources\n');
			}
		}
	}
	
	// clear views
	CopperChrome.clearList();
	CopperChrome.clearTree();
	
	// sort by path
	var sorted = new Array();
	for (var uri in CopperChrome.resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (var entry in sorted) {

		let uri = sorted[entry];

		if (CopperChrome.prefManager.getBoolPref('extensions.copper.use-tree')) {
			// add to tree view
			CopperChrome.addTreeResource( decodeURI(uri), CopperChrome.resources[uri] );
		} else {
			// add to list view
			CopperChrome.addListResource( decodeURI(uri), CopperChrome.resources[uri] );
		}
	}
	
	// save in cache
	let saveRes = JSON.stringify(CopperChrome.resources);
	if (CopperChrome.hostname!='') CopperChrome.prefManager.setCharPref('extensions.copper.resources.'+CopperChrome.hostname+':'+CopperChrome.port, escape(saveRes));
};

CopperChrome.displayMessageInfo = function(message) {
	
	if (message.getCopperCode) {
		CopperChrome.updateLabel('info_code', 'Copper: '+message.getCopperCode());
	} else {
		CopperChrome.updateLabel('info_code', message.getCode(true));
	}

	document.getElementById('packet_header_type').setAttribute('label', message.getType(true));
	document.getElementById('packet_header_oc').setAttribute('label', message.getOptionCount(true));
	document.getElementById('packet_header_code').setAttribute('label', message.getCode(true));
	document.getElementById('packet_header_tid').setAttribute('label', message.getTID(true));
	
	var optionList = document.getElementById('packet_options');
	while (optionList.getRowCount()) optionList.removeItemAt(0);
	var options = message.getOptions();
	
	for (var i=0; i < options.length; i++)
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
        
        if (options[i][0]=='Location') {
        	CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( '<'+options[i][1]+'>' ) );
        }
    }
};

CopperChrome.displayCache = null;

CopperChrome.displayPayload = function(message) {
	
	if (message.getPayload().length<1) {
		return;
	}
	
	// TODO block management
	if (!message.isOption(Copper.OPTION_BLOCK) || message.getBlockNumber()==0 || CopperChrome.displayCache==null) {
		CopperChrome.displayCache = new CopperChrome.CoapMessage(0,0);
		CopperChrome.displayCache.setContentType(message.getContentType());
		document.getElementById('info_payload').label='Payload ('+message.getPayload().length+')';
	} else {
		document.getElementById('info_payload').label='Combined Payload ('+ (CopperChrome.displayCache.getPayload().length + message.getPayload().length)  +')';
	}
		
	CopperChrome.displayCache.appendPayload(message.getPayload());
	
	switch (CopperChrome.displayCache.getContentType()) {
		case Copper.CONTENT_TYPE_IMAGE_GIF:
		case Copper.CONTENT_TYPE_IMAGE_JPEG:
		case Copper.CONTENT_TYPE_IMAGE_PNG:
		case Copper.CONTENT_TYPE_IMAGE_TIFF:
			CopperChrome.renderBinary(CopperChrome.displayCache);
			CopperChrome.renderImage(CopperChrome.displayCache);
			break;
		case Copper.CONTENT_TYPE_AUDIO_RAW:
		case Copper.CONTENT_TYPE_VIDEO_RAW:
		case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
		case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			CopperChrome.renderBinary(CopperChrome.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_EXI:
			CopperChrome.renderBinary(CopperChrome.displayCache);
			CopperChrome.renderEXI(CopperChrome.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_JSON:
			CopperChrome.renderText(CopperChrome.displayCache);
			CopperChrome.renderJSON(CopperChrome.displayCache);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT:
			CopperChrome.renderText(CopperChrome.displayCache);
			CopperChrome.renderLinkFormat(CopperChrome.displayCache);
			break;
		default:
			CopperChrome.renderText(CopperChrome.displayCache);
	}
	
	if (!message.getBlockMore()) {
		delete CopperChrome.displayCache;
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

// workaround for "this" losing scope when passing callback functions
CopperChrome.myBind = function(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
};

CopperChrome.popup = function(title, str) {
	Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification('chrome://copper/skin/Cu_32.png',title,str);
};
