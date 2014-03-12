/*******************************************************************************
 * Copyright (c) 2014, Institute for Pervasive Computing, ETH Zurich.
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
 *         Debug options sidebar functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Debug options functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.initDebugContentTypes = function() {
	for (var i = 0; i<100; ++i) {
		var name = '';
		if ( (name = Copper.getContentTypeName(i))!='unknown') {
		
			var menuitem1 = document.createElement('menuitem');
			var menuitem2 = document.createElement('menuitem');
			
			menuitem1.setAttribute('label', Copper.getContentTypeName(i));
			menuitem1.setAttribute('value', i);
			menuitem2.setAttribute('label', Copper.getContentTypeName(i));
			menuitem2.setAttribute('value', i);
			
			document.getElementById('popup_content_types').appendChild(menuitem1);
			document.getElementById('popup_accepts').appendChild(menuitem2);
		}
	}
};

CopperChrome.loadDebugOptions = function() {
	document.getElementById('chk_debug_options').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.debug.options-enabled');
	document.getElementById('debug_option_content_type').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.content-type');
	document.getElementById('debug_option_max_age').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.max-age');
	document.getElementById('debug_option_proxy_uri').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.proxy-uri');
	document.getElementById('debug_option_proxy_scheme').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.debug.options.proxy-scheme');
	document.getElementById('debug_option_etag').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.etag');
	document.getElementById('debug_option_uri_host').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.uri-host');
	document.getElementById('debug_option_location_path').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.location-path');
	document.getElementById('debug_option_uri_port').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.uri-port');
	document.getElementById('debug_option_location_query').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.location-query');
	document.getElementById('debug_option_observe').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.observe');
	document.getElementById('debug_option_token').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.token');
	document.getElementById('debug_option_accept').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.accept');
	document.getElementById('debug_option_if_match').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.if-match');
	document.getElementById('debug_option_block2').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.block2');
	document.getElementById('debug_option_block1').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.block1');
	document.getElementById('debug_option_size2').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.size2');
	document.getElementById('debug_option_size1').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.size1');
	document.getElementById('chk_debug_option_block_auto').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.debug.options.block-auto');
	document.getElementById('debug_option_if_none_match').checked = CopperChrome.prefManager.getBoolPref('extensions.copper.debug.options.if-none-match');
	
	document.getElementById('debug_option_custom_number').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.custom-number');
	document.getElementById('debug_option_custom_value').value = CopperChrome.prefManager.getCharPref('extensions.copper.debug.options.custom-value');
};

CopperChrome.saveDebugOptions = function() {
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options-enabled', document.getElementById('chk_debug_options').checked);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.content-type', document.getElementById('debug_option_content_type').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.max-age', document.getElementById('debug_option_max_age').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.proxy-uri', document.getElementById('debug_option_proxy_uri').value);
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options.proxy-scheme', document.getElementById('debug_option_proxy_scheme').checked);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.etag', document.getElementById('debug_option_etag').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.uri-host', document.getElementById('debug_option_uri_host').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.location-path', document.getElementById('debug_option_location_path').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.uri-port', document.getElementById('debug_option_uri_port').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.location-query', document.getElementById('debug_option_location_query').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.observe', document.getElementById('debug_option_observe').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.token', document.getElementById('debug_option_token').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.accept', document.getElementById('debug_option_accept').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.if-match', document.getElementById('debug_option_if_match').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.block2', document.getElementById('debug_option_block2').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.block1', document.getElementById('debug_option_block1').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.size2', document.getElementById('debug_option_size2').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.size1', document.getElementById('debug_option_size1').value);
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options.block-auto', document.getElementById('chk_debug_option_block_auto').checked);
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options.if-none-match', document.getElementById('debug_option_if_none_match').checked);

	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.custom-number', document.getElementById('debug_option_custom_number').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.custom-value', document.getElementById('debug_option_custom_value').value);
};

CopperChrome.resetDebugOptions = function() {
	
	var list = document.getElementById('sidebar').getElementsByTagName('image');
	for (var i=0; i<list.length; ++i) {
		list[i].click();
	}
	
	list = document.getElementById('sidebar').getElementsByTagName('checkbox');
	for (var i=0; i<list.length; ++i) {
		list[i].checked = false;
	}
	
	list = document.getElementById('sidebar').getElementsByTagName('menulist');
	for (var i=0; i<list.length; ++i) {
		list[i].value = '';
	}
};

CopperChrome.checkDebugOptions = function(message) {
	try {
		if (document.getElementById('chk_debug_options').checked) {
			if (Copper.OPTION_CONTENT_TYPE && document.getElementById('debug_option_content_type').value!='') {
				if (document.getElementById('debug_option_content_type').selectedItem) {
					message.setContentType(parseInt(document.getElementById('debug_option_content_type').selectedItem.value));
				} else {
					message.setContentType(parseInt(document.getElementById('debug_option_content_type').value));
				}
			}
			if (Copper.OPTION_MAX_AGE && document.getElementById('debug_option_max_age').value!='') {
				message.setMaxAge(parseInt(document.getElementById('debug_option_max_age').value));
			}
try {
			if (Copper.OPTION_PROXY_URI && document.getElementById('debug_option_proxy_uri').value!='') {
				
				if (Copper.OPTION_PROXY_SCHEME && document.getElementById('debug_option_proxy_scheme').checked) {

					var uri = document.createElementNS("http://www.w3.org/1999/xhtml","a");
					
					uri.href = document.getElementById('debug_option_proxy_uri').value;
					//dump('PARSED:\n' + uri.protocol.slice(0, -1) + '\n' + uri.hostname + '\n' + uri.port + '\n' + uri.pathname + '\n' + uri.search + '\n');
					 
//					parser.protocol; // => "http:"
//					parser.hostname; // => "example.com"
//					parser.port; // => "3000"
//					parser.pathname; // => "/pathname/"
//					parser.search; // => "?search=test"
//					parser.hash; // => "#hash"
//					parser.host; // => "example.com:3000"
					
					message.setProxyScheme(uri.protocol.slice(0, -1));
					message.setUriHost(uri.hostname);
					if (uri.port!='') message.setUriPort(uri.port);
					message.setUri(uri.pathname.substr(1) + uri.search);
					
				} else {
					message.setProxyUri(document.getElementById('debug_option_proxy_uri').value);
				}
			}
} catch (ex) {}
			if (Copper.OPTION_ETAG && document.getElementById('debug_option_etag').value!='') {
				message.setETag(document.getElementById('debug_option_etag').value);
			}
			if (Copper.OPTION_URI_HOST && document.getElementById('debug_option_uri_host').value!='') {
				message.setUriHost(document.getElementById('debug_option_uri_host').value);
			}
			if (Copper.OPTION_LOCATION_PATH && document.getElementById('debug_option_location_path').value!='') {
				message.setLocationPath(document.getElementById('debug_option_location_path').value);
			}
try {
			if (Copper.OPTION_URI_PORT && document.getElementById('debug_option_uri_port').value!='') {
				message.setUriPort(parseInt(document.getElementById('debug_option_uri_port').value));
			}
} catch (ex) {}
try {
			if (Copper.OPTION_LOCATION_QUERY && document.getElementById('debug_option_location_query').value!='') {
				message.setLocationQuery(document.getElementById('debug_option_location_query').value);
			}
} catch (ex) {}
			if (Copper.OPTION_OBSERVE && document.getElementById('debug_option_observe').value!='') {
				message.setObserve(parseInt(document.getElementById('debug_option_observe').value));
			}
			if (Copper.OPTION_TOKEN && document.getElementById('debug_option_token').value!='') {
				message.setToken(document.getElementById('debug_option_token').value);
			}
try {
			if (Copper.OPTION_ACCEPT && document.getElementById('debug_option_accept').value!='') {
				if (document.getElementById('debug_option_accept').selectedItem) {
					message.setAccept(parseInt(document.getElementById('debug_option_accept').selectedItem.value));
				} else {
					message.setAccept(parseInt(document.getElementById('debug_option_accept').value));
				}
			}
} catch (ex) {}
try {
			if (Copper.OPTION_IF_MATCH && document.getElementById('debug_option_if_match').value!='') {
				message.setIfMatch(document.getElementById('debug_option_if_match').value);
			}
} catch (ex) {}
			if (Copper.OPTION_BLOCK && CopperChrome.behavior.blockSize!=0 && document.getElementById('debug_option_block2').value!='') {
				message.setBlock(parseInt(document.getElementById('debug_option_block2').value), CopperChrome.behavior.blockSize);
			}
try {
			if (Copper.OPTION_BLOCK1 && CopperChrome.behavior.blockSize!=0 && document.getElementById('debug_option_block1').value!='') {
				message.setBlock1(parseInt(document.getElementById('debug_option_block1').value), CopperChrome.behavior.blockSize, document.getElementById('debug_option_block1').value.match(/\+/));
			}
} catch (ex) {}
try {
		if (Copper.OPTION_SIZE && document.getElementById('debug_option_size2').value!='') {
			message.setSize(parseInt(document.getElementById('debug_option_size2').value));
		}
} catch (ex) {}
try {
		if (Copper.OPTION_SIZE1 && document.getElementById('debug_option_size1').value!='' && !CopperChrome.behavior.sendSize1) {
			message.setSize1(parseInt(document.getElementById('debug_option_size1').value));
		}
} catch (ex) {}
try {
			if (Copper.OPTION_IF_NONE_MATCH && document.getElementById('debug_option_if_none_match').checked) {
				message.setIfNoneMatch();
			}
} catch (ex) {}
	
			if (CopperChrome.coapVersion >= 12 && document.getElementById('debug_option_custom_number').value!='') {
				message.setCustom(document.getElementById('debug_option_custom_number').value, document.getElementById('debug_option_custom_value').value);
			}
		}
	} catch (ex) {
		alert('ERROR: CopperChrome.checkDebugOptions ['+ex+']');
	}
};
