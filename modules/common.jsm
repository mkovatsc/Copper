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

//Helper functions
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
	var b = new Array();
	do {
		b.unshift(0xFF & i);
		i >>>= 8;
	} while (i>0);
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
	for (var k in b) {
		hex += Copper.leadingZero(b[k].toString(16).toUpperCase());
	}
	//convert to unsigned int
	return hex;
};
