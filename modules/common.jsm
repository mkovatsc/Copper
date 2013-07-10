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
 *         Copper module namespace
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = ['Copper'];

/**
 * Copper module namespace.
 */
if ('undefined' == typeof(Copper)) {
	var Copper = { };
};


// Registries
////////////////////////////////////////////////////////////////////////////////

Copper.getOptionName = function(number) {
	switch (parseInt(number)) {
		case Copper.OPTION_CONTENT_TYPE:
		case Copper.OPTION_CONTENT_FORMAT: return 'Content-Format';
		case Copper.OPTION_MAX_AGE: return 'Max-Age';
		case Copper.OPTION_ACCEPT: return 'Accept';
		case Copper.OPTION_TOKEN: return 'Token';

		case Copper.OPTION_URI_HOST: return 'Uri-Host';
		case Copper.OPTION_URI_PORT: return 'Uri-Port';
		case Copper.OPTION_URI_PATH: return 'Uri-Path';
		case Copper.OPTION_URI_QUERY: return 'Uri-Query';

		case Copper.OPTION_LOCATION_PATH: return 'Location-Path';
		case Copper.OPTION_LOCATION_QUERY: return 'Location-Query';

		case Copper.OPTION_PROXY_URI: return 'Proxy-Uri';
		case Copper.OPTION_PROXY_SCHEME: return 'Proxy-Scheme';

		case Copper.OPTION_IF_MATCH: return 'If-Match';
		case Copper.OPTION_IF_NONE_MATCH: return 'If-None-Match';
		case Copper.OPTION_ETAG: return 'ETag';

		case Copper.OPTION_OBSERVE: return 'Observe';

		case Copper.OPTION_BLOCK:
		case Copper.OPTION_BLOCK2: return 'Block2';
		case Copper.OPTION_BLOCK1: return 'Block1';
		case Copper.OPTION_SIZE:
		case Copper.OPTION_SIZE2: return 'Size2';
		case Copper.OPTION_SIZE1: return 'Size1';
		
		default: return 'Unknown '+number;
	}
	return '';
};

Copper.getContentTypeName = function(type) {
	switch (type) {
		case Copper.CONTENT_TYPE_TEXT_PLAIN: return 'text/plain'; break;
		case Copper.CONTENT_TYPE_TEXT_XML: return 'text/xml'; break;
		case Copper.CONTENT_TYPE_TEXT_CSV: return 'text/csv'; break;
		case Copper.CONTENT_TYPE_TEXT_HTML: return 'text/html'; break;
		case Copper.CONTENT_TYPE_IMAGE_GIF: return 'image/gif'; break;
		case Copper.CONTENT_TYPE_IMAGE_JPEG: return 'image/jpeg'; break;
		case Copper.CONTENT_TYPE_IMAGE_PNG: return 'image/png'; break;
		case Copper.CONTENT_TYPE_IMAGE_TIFF: return 'image/tiff'; break;
		case Copper.CONTENT_TYPE_AUDIO_RAW: return 'audio/raw'; break;
		case Copper.CONTENT_TYPE_VIDEO_RAW: return 'video/raw'; break;
		case Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT: return 'application/link-format'; break;
		case Copper.CONTENT_TYPE_APPLICATION_XML: return 'application/xml'; break;
		case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM: return 'application/octet-stream'; break;
		case Copper.CONTENT_TYPE_APPLICATION_RDF_XML: return 'application/rdf+xml'; break;
		case Copper.CONTENT_TYPE_APPLICATION_SOAP_XML: return 'application/soap+xml'; break;
		case Copper.CONTENT_TYPE_APPLICATION_ATOM_XML: return 'application/atom+xml'; break;
		case Copper.CONTENT_TYPE_APPLICATION_XMPP_XML: return 'application/xmpp+xml'; break;
		case Copper.CONTENT_TYPE_APPLICATION_EXI: return 'application/exi'; break;
		case Copper.CONTENT_TYPE_APPLICATION_FASTINFOSET: return 'application/fastinfoset'; break;
		case Copper.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET: return 'application/soap+fastinfoset'; break;
		case Copper.CONTENT_TYPE_APPLICATION_JSON: return 'application/json'; break;
		case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY: return 'application/x-obix-binary'; break;
		default: return 'unknown';
	}
	return '';
};

// Protocol helper functions
////////////////////////////////////////////////////////////////////////////////

Copper.isPowerOfTwo = function(i) {
	return ((i & (i-1))==0);
};

Copper.leadingZero = function(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
};

// for the string-oriented socket interface
Copper.bytes2data = function(b) {
	var str = '';
	for (var i in b) {
		str += String.fromCharCode(b[i] & 0xFF);
	}
	return str;
};
Copper.data2bytes = function(data) {
	var b = new Array(0);
	for (var i=0; i<data.length; i++) {
		b.push(0xFF & data.charCodeAt(i));
	}
	return b;
};

Copper.str2bytes = function(str) {
	var utf8 = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.copper.encode-utf-8');

	var b = new Array(0);
	
	for (var i=0; i<str.length; i++) {
		let c = str.charCodeAt(i);
		
		if (c < 128 || !utf8) {
			b.push(0xFF & c);
		} else if((c > 127) && (c < 2048)) {
			b.push(0xFF & ((c >> 6) | 192));
			b.push(0xFF & ((c & 63) | 128));
		} else {
			b.push(0xFF & ((c >> 12) | 224));
			b.push(0xFF & (((c >> 6) & 63) | 128));
			b.push(0xFF & ((c & 63) | 128));
		}
	}
	return b;
};
Copper.bytes2str = function(b) {
	var utf8 = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.copper.encode-utf-8');

	var str = '';
	for (var i=0; i<b.length; ++i) {
		
		let c = b[i] & 0xFF;
		
		if (c < 128 || !utf8) {
			str += String.fromCharCode(c);
		} else if((c > 191) && (c < 224) && (i+1 < b.length)) {
			let c2 = b[i+1] & 0xFF;
			str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 1;
		} else if (c < 240 && (i+2 < b.length)) {
			let c2 = b[i+1] & 0xFF;
			let c3 = b[i+2] & 0xFF;
			str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 2;
		} else if (i+3 < b.length) {
			dump('WARNING: 4-byte UTF-8\n');
			str += String.fromCharCode(2592); // char ▒
			i += 3;
		} else {
			dump('ERROR: Incomplete UTF-8 encoding\n');
		}
	}
	return str;
};

Copper.int2bytes = function(i) {
	var b = new Array(0);
	while (i>0) {
		b.unshift(0xFF & i);
		i >>>= 8;
	}
	return b;
};

Copper.bytes2int = function(b) {
	var i = 0;
	for (var k in b) {
		i = (i << 8) | b[k];
	}
	//convert to unsigned int
	return i>>>0;
};

Copper.hex2bytes = function(h) {
	var b = new Array();
	for (var i=h.length-2; i>0; i-=2) {
		b.unshift(parseInt(('0x'+h.substr(i,2)).replace(/xx/, 'x')));
	}
	return b;
};

Copper.bytes2hex = function(b) {
	var hex = '0x';
	if (Array.isArray(b) && b.length==0) {
		hex += '00';
	} else {
		for (var k in b) {
			hex += Copper.leadingZero(b[k].toString(16).toUpperCase());
		}
	}
	
	return hex;
};
