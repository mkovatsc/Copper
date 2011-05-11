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
 *         Copper module namespace
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = ['Copper'];

/**
 * Copper module namespace.
 */
if ("undefined" == typeof(Copper)) {
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

Copper.str2bytes = function(str) {
	var b = new Array(str.length);
	for (var i=0; i<str.length; i++) {
		b[i] = str.charCodeAt(i) & 0xFF;
	}
	return b;
};

Copper.bytes2str = function(b) {
	var str = '';
  for (var i in b) str += String.fromCharCode(b[i] & 0xFF);
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
