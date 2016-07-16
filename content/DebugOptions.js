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

Copper.initDebugContentFormats = function() {
	for (var i = 0; i<100; ++i) {
		var name = '';
		if ( (name = Copper.getContentFormatName(i))!='unknown/unknown') {
		
			var menuitem1 = document.createElement('menuitem');
			var menuitem2 = document.createElement('menuitem');
			
			menuitem1.setAttribute('label', Copper.getContentFormatName(i));
			menuitem1.setAttribute('value', i);
			menuitem2.setAttribute('label', Copper.getContentFormatName(i));
			menuitem2.setAttribute('value', i);
			
			document.getElementById('popup_content_types').appendChild(menuitem1);
			document.getElementById('popup_accepts').appendChild(menuitem2);
		}
	}
};

Copper.loadDebugOptions = function() {
	document.getElementById('chk_debug_options').checked = Copper.prefManager.getBoolPref('extensions.copper.debug.options-enabled');
	document.getElementById('debug_option_content_format').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.content-format');
	document.getElementById('debug_option_max_age').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.max-age');
	document.getElementById('debug_option_proxy_uri').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.proxy-uri');
	document.getElementById('debug_option_proxy_scheme').checked = Copper.prefManager.getBoolPref('extensions.copper.debug.options.proxy-scheme');
	document.getElementById('debug_option_etag').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.etag');
	document.getElementById('debug_option_uri_host').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.uri-host');
	document.getElementById('debug_option_location_path').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.location-path');
	document.getElementById('debug_option_uri_port').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.uri-port');
	document.getElementById('debug_option_location_query').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.location-query');
	document.getElementById('debug_option_observe').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.observe');
	document.getElementById('debug_option_token').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.token');
	document.getElementById('debug_option_accept').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.accept');
	document.getElementById('debug_option_if_match').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.if-match');
	document.getElementById('debug_option_block2').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.block2');
	document.getElementById('debug_option_block1').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.block1');
	document.getElementById('debug_option_size2').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.size2');
	document.getElementById('debug_option_size1').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.size1');
	document.getElementById('chk_debug_option_block_auto').checked = Copper.prefManager.getBoolPref('extensions.copper.debug.options.block-auto');
	document.getElementById('debug_option_if_none_match').checked = Copper.prefManager.getBoolPref('extensions.copper.debug.options.if-none-match');
	
	document.getElementById('debug_option_custom_number').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.custom-number');
	document.getElementById('debug_option_custom_value').value = Copper.prefManager.getCharPref('extensions.copper.debug.options.custom-value');
};

Copper.saveDebugOptions = function() {
	Copper.prefManager.setBoolPref('extensions.copper.debug.options-enabled', document.getElementById('chk_debug_options').checked);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.content-format', document.getElementById('debug_option_content_format').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.max-age', document.getElementById('debug_option_max_age').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.proxy-uri', document.getElementById('debug_option_proxy_uri').value);
	Copper.prefManager.setBoolPref('extensions.copper.debug.options.proxy-scheme', document.getElementById('debug_option_proxy_scheme').checked);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.etag', document.getElementById('debug_option_etag').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.uri-host', document.getElementById('debug_option_uri_host').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.location-path', document.getElementById('debug_option_location_path').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.uri-port', document.getElementById('debug_option_uri_port').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.location-query', document.getElementById('debug_option_location_query').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.observe', document.getElementById('debug_option_observe').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.token', document.getElementById('debug_option_token').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.accept', document.getElementById('debug_option_accept').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.if-match', document.getElementById('debug_option_if_match').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.block2', document.getElementById('debug_option_block2').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.block1', document.getElementById('debug_option_block1').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.size2', document.getElementById('debug_option_size2').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.size1', document.getElementById('debug_option_size1').value);
	Copper.prefManager.setBoolPref('extensions.copper.debug.options.block-auto', document.getElementById('chk_debug_option_block_auto').checked);
	Copper.prefManager.setBoolPref('extensions.copper.debug.options.if-none-match', document.getElementById('debug_option_if_none_match').checked);

	Copper.prefManager.setCharPref('extensions.copper.debug.options.custom-number', document.getElementById('debug_option_custom_number').value);
	Copper.prefManager.setCharPref('extensions.copper.debug.options.custom-value', document.getElementById('debug_option_custom_value').value);
};

Copper.resetDebugOptions = function() {
	
	var list = document.getElementById('sidebar').getElementsByTagName('image');
	for (var i=0; i<list.length; ++i) {
		list[i].click();
	}
	
	list = document.getElementById('sidebar').getElementsByTagName('checkbox');
	for (var i=0; i<list.length; ++i) {
		list[i].checked = false;
	}
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	list = document.getElementById('sidebar').getElementsByTagName('menulist');
	for (var i=0; i<list.length; ++i) {
		list[i].value = '';
	}
};

Copper.checkDebugOptions = function(message) {
	try {
		if (document.getElementById('chk_debug_options').checked) {

			if (document.getElementById('debug_option_content_format').value != '') {
				if (document.getElementById('debug_option_content_format').selectedItem) {
					message.setContentType(parseInt(document.getElementById('debug_option_content_format').selectedItem.value));
				} else {
					message.setContentType(parseInt(document.getElementById('debug_option_content_format').value));
				}
			}
			if (document.getElementById('debug_option_max_age').value != '') {
				message.setMaxAge(parseInt(document.getElementById('debug_option_max_age').value));
			}

			if (document.getElementById('debug_option_proxy_uri').value != '') {

				if (document.getElementById('debug_option_proxy_scheme').checked) {

					let uri = document.createElementNS("http://www.w3.org/1999/xhtml", "a");

					uri.href = document.getElementById('debug_option_proxy_uri').value;
					// Copper.logEvent('PARSED:\n' + uri.protocol.slice(0, -1) + '\n' + uri.hostname + '\n' + uri.port + '\n' + uri.pathname + '\n' + uri.search );

					// parser.protocol; // => "http:"
					// parser.hostname; // => "example.com"
					// parser.port; // => "3000"
					// parser.pathname; // => "/pathname/"
					// parser.search; // => "?search=test"
					// parser.hash; // => "#hash"
					// parser.host; // => "example.com:3000"

					message.setProxyScheme(uri.protocol.slice(0, -1));
					message.setUriHost(uri.hostname);
					if (uri.port != '') message.setUriPort(uri.port);
					message.setUri(uri.pathname.substr(1) + uri.search);

				} else {
					message.setProxyUri(document.getElementById('debug_option_proxy_uri').value);
				}
			}

			if (document.getElementById('debug_option_etag').value != '') {
				message.setETag(document.getElementById('debug_option_etag').value);
			}
			if (document.getElementById('debug_option_uri_host').value != '') {
				message.setUriHost(document.getElementById('debug_option_uri_host').value);
			}
			if (document.getElementById('debug_option_location_path').value != '') {
				message.setLocationPath(document.getElementById('debug_option_location_path').value);
			}

			if (document.getElementById('debug_option_uri_port').value != '') {
				message.setUriPort(parseInt(document.getElementById('debug_option_uri_port').value));
			}

			if (document.getElementById('debug_option_location_query').value != '') {
				message.setLocationQuery(document.getElementById('debug_option_location_query').value);
			}

			if (document.getElementById('debug_option_observe').value != '') {
				message.setObserve(parseInt(document.getElementById('debug_option_observe').value));
			}
			if (document.getElementById('debug_option_token').value != '') {
				message.setToken(document.getElementById('debug_option_token').value);
			}

			if (document.getElementById('debug_option_accept').value != '') {
				if (document.getElementById('debug_option_accept').selectedItem) {
					message.setAccept(parseInt(document.getElementById('debug_option_accept').selectedItem.value));
				} else {
					message.setAccept(parseInt(document.getElementById('debug_option_accept').value));
				}
			}

			if (document.getElementById('debug_option_if_match').value != '') {
				message.setIfMatch(document.getElementById('debug_option_if_match').value);
			}

			if (Copper.behavior.blockSize != 0 && document.getElementById('debug_option_block2').value != '') {
				message.setBlock2(parseInt(document.getElementById('debug_option_block2').value), Copper.behavior.blockSize);
			}

			if (Copper.behavior.blockSize != 0 && document.getElementById('debug_option_block1').value != '') {
				message.setBlock1(parseInt(document.getElementById('debug_option_block1').value), Copper.behavior.blockSize, document
						.getElementById('debug_option_block1').value.match(/\+/));
			}

			if (document.getElementById('debug_option_size2').value != '') {
				message.setSize2(parseInt(document.getElementById('debug_option_size2').value));
			}

			if (document.getElementById('debug_option_size1').value != '' && !Copper.behavior.sendSize1) {
				message.setSize1(parseInt(document.getElementById('debug_option_size1').value));
			}

			if (Copper.OPTION_IF_NONE_MATCH && document.getElementById('debug_option_if_none_match').checked) {
				message.setIfNoneMatch();
			}

			if (document.getElementById('debug_option_custom_number').value != '') {
				message.setCustom(document.getElementById('debug_option_custom_number').value, document.getElementById('debug_option_custom_value').value);
			}
		}
	} catch (ex) {
		Copper.logError(ex);
	}
};
