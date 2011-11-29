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
 *         Helper functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Helper functions
////////////////////////////////////////////////////////////////////////////////

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
	} else if (url.ref!='' || url.param!='') {
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

// Load cached resource links from preferences
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

CopperChrome.savePayload = function() {
	if (CopperChrome.hostname!='') {
		CopperChrome.prefManager.setIntPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.mode', document.getElementById('toolbar_payload_mode').selectedIndex);
		
		CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.line', document.getElementById('payload_text_line').value);
		CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.page', document.getElementById('payload_text_page').value);
		CopperChrome.prefManager.setCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.file', CopperChrome.payloadFile);
	}
};

// Load last used payload from preferences, otherwise use default payload
CopperChrome.loadDefaultPayload = function() {
	
	document.getElementById('toolbar_payload_mode').selectedIndex = 0;
	document.getElementById('payload_text_line').value = CopperChrome.prefManager.getCharPref('extensions.copper.default-payload');
	
	try {
		document.getElementById('toolbar_payload_mode').selectedIndex = CopperChrome.prefManager.getIntPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.mode');
		
		document.getElementById('payload_text_line').value = CopperChrome.prefManager.getCharPref('extensions.copper.payloads.'+CopperChrome.hostname+':'+CopperChrome.port+'.line');
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
		for (var uri in add) {
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
	for (var uri in CopperChrome.resources) {
		sorted.push(uri);
	}
	sorted.sort();
	
	for (var entry in sorted) {
		let uri = sorted[entry];
		
		var button = document.createElement('button');
		button.setAttribute('label', decodeURI(uri));
		
		button.addEventListener('click', function() {
			document.location.href = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + uri;
        }, true);
		
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
        
        if (options[i][0]=='Location') {
        	CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( '<'+options[i][1]+'>' ) );
        }
    }
};

CopperChrome.displayPayload = function(message) {
	
	if (message.getPayload().length<1) {
		return;
	}
	
	switch (message.getContentType()) {
		case Copper.CONTENT_TYPE_IMAGE_GIF:
		case Copper.CONTENT_TYPE_IMAGE_JPEG:
		case Copper.CONTENT_TYPE_IMAGE_PNG:
		case Copper.CONTENT_TYPE_IMAGE_TIFF:
			CopperChrome.renderImage(message);
			break;
		case Copper.CONTENT_TYPE_AUDIO_RAW:
		case Copper.CONTENT_TYPE_VIDEO_RAW:
		case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
		case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			CopperChrome.renderBinary(message);
			break;
		case Copper.CONTENT_TYPE_APPLICATION_EXI:
			CopperChrome.renderEXI(message);
			break;
		default:
			CopperChrome.renderText(message);
	}

	if (message.isOption(Copper.OPTION_BLOCK)) {
		// convert back to get number of bytes (UTF-8 chars)
		document.getElementById('info_payload').label='Combined Payload ('+ document.getElementById('packet_payload').value.length +')';
	} else {
		document.getElementById('info_payload').label='Payload ('+message.getPayload().length+')';
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
	Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification('chrome://copper/skin/icon24.png',title,str);
};
