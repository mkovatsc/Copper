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
		
			var menuitem = document.createElement('menuitem');
			
			menuitem.setAttribute('label', Copper.getContentTypeName(i));
			menuitem.setAttribute('value', i);
			
			document.getElementById('popup_content_types').appendChild(menuitem);
		}
	}
};

CopperChrome.saveDebugContentTypes = function() {
	CopperChrome.prefManager.setBoolPref('extensions.copper.debug.options-enabled', document.getElementById('chk_debug_options').checked);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.content-type', document.getElementById('debug_option_content_type').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.max-age', document.getElementById('debug_option_max_age').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.proxy-uri', document.getElementById('debug_option_proxy_uri').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.etag', document.getElementById('debug_option_etag').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.uri-host', document.getElementById('debug_option_uri_host').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.location-path', document.getElementById('debug_option_location_path').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.uri-port', document.getElementById('debug_option_uri_port').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.location-query', document.getElementById('debug_option_location_query').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.observe', document.getElementById('debug_option_observe').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.token', document.getElementById('debug_option_token').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.block2', document.getElementById('debug_option_block2').value);
	CopperChrome.prefManager.setCharPref('extensions.copper.debug.options.block1', document.getElementById('debug_option_block1').value);
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
//		if (Copper.OPTION_PROXY_URI && document.getElementById('debug_option_proxy_uri').value!='') {
//			message.setProxyUri(document.getElementById('debug_option_proxy_uri').value);
//		}
		if (Copper.OPTION_ETAG && document.getElementById('debug_option_etag').value!='') {
			if (document.getElementById('debug_option_etag').value.substr(0,2)=='0x') {
				message.setETag(Copper.hex2bytes(document.getElementById('debug_option_etag').value));
			} else {
				message.setETag(Copper.str2bytes(document.getElementById('debug_option_etag').value));
			}
		}
		if (Copper.OPTION_URI_HOST && document.getElementById('debug_option_uri_host').value!='') {
			message.setUriHost(document.getElementById('debug_option_uri_host').value);
		}
		if (Copper.OPTION_LOCATION_PATH && document.getElementById('debug_option_location_path').value!='') {
			message.setLocationPath(document.getElementById('debug_option_location_path').value);
		}
try { // FIXME Find better solution for compile-and-go script error for undefined getters
		if (Copper.OPTION_URI_PORT && document.getElementById('debug_option_uri_port').value!='') {
			message.setUriPort(parseInt(document.getElementById('debug_option_uri_port').value));
		}
		if (Copper.OPTION_LOCATION_QUERY && document.getElementById('debug_option_location_query').value!='') {
			message.setLocationQuery(document.getElementById('debug_option_location_query').value);
		}
} catch (ex) { }
		if (Copper.OPTION_OBSERVE && document.getElementById('debug_option_observe').value!='') {
			message.setObserve(parseInt(document.getElementById('debug_option_observe').value));
		}
		if (Copper.OPTION_TOKEN && document.getElementById('debug_option_token').value!='') {
			if (document.getElementById('debug_option_token').value.substr(0,2)=='0x') {
				message.setToken(Copper.hex2bytes(document.getElementById('debug_option_token').value));
			} else {
				message.setToken(Copper.str2bytes(document.getElementById('debug_option_token').value));
			}
		}
		if (Copper.OPTION_BLOCK && document.getElementById('debug_option_block2').value!='') {
			message.setBlock(parseInt(document.getElementById('debug_option_block2').value), CopperChrome.blockSize);
		}
try { // FIXME Find better solution for compile-and-go script error for undefined getters
		if (Copper.OPTION_BLOCK1 && document.getElementById('debug_option_block1').value!='') {
			message.setBlock1(parseInt(document.getElementById('debug_option_block1').value), CopperChrome.blockSize);
		}
} catch (ex) { }
	}
} catch (ex) {
	alert('ERROR: CopperChrome.checkDebugOptions ['+ex+']');
}
};
