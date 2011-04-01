/*
 * Copyright (c) 2010, Institute for Pervasive Computing, ETH Zurich.
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
 *         Implementation of draft-ietf-core-coap-03
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = [
						'VERSION',
						
						'MSG_TYPE_CON',
						'MSG_TYPE_NON',
						'MSG_TYPE_ACK',
						'MSG_TYPE_RST',
						
						'OPTION_CONTENT_TYPE',
						'OPTION_MAX_AGE',
						'OPTION_ETAG',
						'OPTION_URI_HOST',
						'OPTION_LOCATION_PATH',
						'OPTION_URI_PATH',
						'OPTION_SUB_LIFETIME',
						'OPTION_TOKEN',
						'OPTION_BLOCK',
						'OPTION_URI_QUERY',
						
						'CONTENT_TYPE_TEXT_PLAIN',
						'CONTENT_TYPE_TEXT_XML',
						'CONTENT_TYPE_TEXT_CSV',
						'CONTENT_TYPE_TEXT_HTML',
						'CONTENT_TYPE_IMAGE_GIF',
						'CONTENT_TYPE_IMAGE_JPEG',
						'CONTENT_TYPE_IMAGE_PNG',
						'CONTENT_TYPE_IMAGE_TIFF',
						'CONTENT_TYPE_AUDIO_RAW',
						'CONTENT_TYPE_VIDEO_RAW',
						'CONTENT_TYPE_APPLICATION_LINK_FORMAT',
						'CONTENT_TYPE_APPLICATION_XML',
						'CONTENT_TYPE_APPLICATION_OCTET_STREAM',
						'CONTENT_TYPE_APPLICATION_RDF_XML',
						'CONTENT_TYPE_APPLICATION_SOAP_XML',
						'CONTENT_TYPE_APPLICATION_ATOM_XML',
						'CONTENT_TYPE_APPLICATION_XMPP_XML',
						'CONTENT_TYPE_APPLICATION_EXI',
						'CONTENT_TYPE_APPLICATION_X_BXML',
						'CONTENT_TYPE_APPLICATION_FASTINFOSET',
						'CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET',
						'CONTENT_TYPE_APPLICATION_JSON',
						'CONTENT_TYPE_APPLICATION_X_OBIX_BINARY',
						
						'GET',
						'POST',
						'PUT',
						'DELETE',
						
						'WELL_KNOWN_RESOURCES',
						
						'RESPONSE_TIMEOUT',
						'MAX_RETRANSMIT',
						
						'CoapPacket'
						];

const VERSION = 1;

const MSG_TYPE_CON = 0;
const MSG_TYPE_NON = 1;
const MSG_TYPE_ACK = 2;
const MSG_TYPE_RST = 3;

const OPTION_CONTENT_TYPE = 1;
const OPTION_MAX_AGE = 2;
const OPTION_ETAG = 4;
const OPTION_URI_HOST = 5;
const OPTION_LOCATION_PATH = 6;
const OPTION_URI_PATH = 9;
const OPTION_SUB_LIFETIME = 10;
const OPTION_TOKEN = 11;
const OPTION_BLOCK = 13;
const OPTION_NOOP = 14;
const OPTION_URI_QUERY = 15;

const CODE_100_CONTINUE = 40;
const CODE_200_OK = 80;
const CODE_201_CREATED = 81;
const CODE_304_NOT_MODIFIED = 124;
const CODE_400_BAD_REQUEST = 160;
const CODE_404_NOT_FOUND = 164;
const CODE_405_METHOD_NOT_ALLOWED = 165;
const CODE_415_UNSUPPORTED_MADIA_TYPE = 175;
const CODE_500_INTERNAL_SERVER_ERROR = 200;
const CODE_502_BAD_GATEWAY = 202;
const CODE_503_SERVICE_UNAVAILABLE = 203;
const CODE_504_GATEWAY_TIMEOUT = 204;
const CODE_TOKEN_OPTION_REQUIRED = 240;
const CODE_URI_AUTHORITY_OPTION_REQUIRED = 241;
const CODE_CRITICAL_OPTION_NOT_SUPPORTED = 242;

const CONTENT_TYPE_TEXT_PLAIN = 0;
const CONTENT_TYPE_TEXT_XML = 1;
const CONTENT_TYPE_TEXT_CSV = 2;
const CONTENT_TYPE_TEXT_HTML = 3;
const CONTENT_TYPE_IMAGE_GIF = 21; // 03
const CONTENT_TYPE_IMAGE_JPEG = 22; // 03
const CONTENT_TYPE_IMAGE_PNG = 23; // 03
const CONTENT_TYPE_IMAGE_TIFF = 24; // 03
const CONTENT_TYPE_AUDIO_RAW = 25; // 03
const CONTENT_TYPE_VIDEO_RAW = 26; // 03
const CONTENT_TYPE_APPLICATION_LINK_FORMAT = 40;
const CONTENT_TYPE_APPLICATION_XML = 41;
const CONTENT_TYPE_APPLICATION_OCTET_STREAM = 42;
const CONTENT_TYPE_APPLICATION_RDF_XML = 43;
const CONTENT_TYPE_APPLICATION_SOAP_XML = 44;
const CONTENT_TYPE_APPLICATION_ATOM_XML = 45;
const CONTENT_TYPE_APPLICATION_XMPP_XML = 46;
const CONTENT_TYPE_APPLICATION_EXI = 47;
const CONTENT_TYPE_APPLICATION_X_BXML = 48;
const CONTENT_TYPE_APPLICATION_FASTINFOSET = 49;
const CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET = 50;
const CONTENT_TYPE_APPLICATION_JSON = 51;
const CONTENT_TYPE_APPLICATION_X_OBIX_BINARY = -1; // 04+

const GET = 1;
const POST = 2;
const PUT = 3;
const DELETE = 4;

const WELL_KNOWN_RESOURCES = '/.well-known/core';

const RESPONSE_TIMEOUT = 1000; // ms
const MAX_RETRANSMIT = 5;


function CoapPacket() {
	this.options = new Array();
	//                                       length, value as byte array
	this.options[OPTION_CONTENT_TYPE] = new Array(0, null);
	this.options[OPTION_MAX_AGE] = new Array(0, null);
	this.options[OPTION_ETAG] = new Array(0, null);
	this.options[OPTION_URI_HOST] = new Array(0, null);
	this.options[OPTION_LOCATION_PATH] = new Array(0, null);
	this.options[OPTION_URI_PATH] = new Array(0, null);
	this.options[OPTION_SUB_LIFETIME] = new Array(0, null);
	this.options[OPTION_TOKEN] = new Array(0, null);
	this.options[OPTION_BLOCK] = new Array(0, null);
	this.options[OPTION_NOOP] = new Array(0, null);
	this.options[OPTION_URI_QUERY] = new Array(0, null);
}

CoapPacket.prototype = {
	version : VERSION, // member for received packets
	type : MSG_TYPE_CON,
	optionCount : 0,
	code : GET,
	tid : 0x0777,
	options : null,
	payload : '',
	
	// readable method or response code
	getCode : function() {
		switch (parseInt(this.code)) {
			// methods
			case GET: return 'GET';
			case POST: return 'POST';
			case PUT: return 'PUT';
			case DELETE: return 'DELETE';
			// response codes
			case CODE_100_CONTINUE: return '100 Continue';
			case CODE_200_OK: return '200 OK';
			case CODE_201_CREATED: return '201 Created';
			case CODE_304_NOT_MODIFIED: return '304 Not Modified';
			case CODE_400_BAD_REQUEST: return '400 Bad Request';
			case CODE_404_NOT_FOUND: return '404 Not Found';
			case CODE_405_METHOD_NOT_ALLOWED: return '405 Method Not Allowed';
			case CODE_415_UNSUPPORTED_MADIA_TYPE: return '415 Unsupported Madia Type';
			case CODE_500_INTERNAL_SERVER_ERROR: return '500 Internal Server Error';
			case CODE_502_BAD_GATEWAY: return '502 Bad Gateway';
			case CODE_503_SERVICE_UNAVAILABLE: return '503 Service Unavailable';
			case CODE_504_GATEWAY_TIMEOUT: return '504 Gateway Timeout';
			case CODE_TOKEN_OPTION_REQUIRED: return 'Token Option required by server';
			case CODE_URI_AUTHORITY_OPTION_REQUIRED: return 'Uri-Authority Option required by server';
			case CODE_CRITICAL_OPTION_NOT_SUPPORTED: return 'Critical Option not supported';
			// ...
			default: return 'unknown ('+this.code+')';
		}
	},
	
	// get options that are set in the package
	getOptions : function() {
		var list = new Array();
		for (var optType in this.options) {
	    	if (this.options[optType][0]==0) {
				continue;
			} else {
				list.push(optType);
			}
		}
		return list;
	},
	
	// retrieve option
	getOptionLength : function(optType) {
		if (this.options[optType][0]!=null) { 
			return this.options[optType][0];
		} else {
			return -1;
		}
	},
	getOption : function(optType) {
		
		if (this.getOptionLength(optType)<=0) {
			return null;
		}
		
    	//var optLen = this.options[optType][0];
		var opt = this.options[optType][1];

		switch (parseInt(optType)) {
			// strings
			case OPTION_LOCATION_PATH:
			case OPTION_URI_HOST:
			case OPTION_URI_PATH:
			case OPTION_URI_QUERY:
				return bytes2str(opt);
				break;
			
			// byte arrays
			case OPTION_ETAG:
			case OPTION_TOKEN:
				return opt;
				break;
			
			// noop
			case OPTION_NOOP:
				return 0;
				break;
			
			// integers
			default:
				return bytes2int(opt);
		}
	},
	
	setOption : function(option, value) {
		switch (parseInt(option)) {
			// strings
			case OPTION_LOCATION_PATH:
			case OPTION_URI_HOST:
			case OPTION_URI_PATH:
			case OPTION_URI_QUERY:
				this.options[option][0] = value.length;
				this.options[option][1] = str2bytes(value);
				break;
			
			// byte arrays
			case OPTION_ETAG:
			case OPTION_TOKEN:
				this.options[option][0] = value.length;
				this.options[option][1] = value;
				break;
			
			// integers
			case OPTION_CONTENT_TYPE:
			case OPTION_MAX_AGE:
			case OPTION_SUB_LIFETIME:
			case OPTION_BLOCK:
				this.options[option][1] = int2bytes(value);
				this.options[option][0] = this.options[option][1].length;
				break;
			
			default:
				throw 'ERROR: CoapPacket.setOption [Unknown option]';
		}
		
		// recalculate option count
		this.optionCount = 0;
		for (var optType in this.options) {
	    	if (this.options[optType][0]>0) this.optionCount++;
	    }
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(uri) {
		var tokens = uri.match(/^(coap:\/\/[a-z0-9-\.]+)?(:[0-9]{1,5})?(\/?|(\/[^\/\?]+)+)(\?.*)?$/i);
		if (tokens) {
			
			var path = tokens[3];
			var query = tokens[5];
			
			while (path.charAt(0)=='/') path = path.substr(1);
			this.setOption(OPTION_URI_PATH, path);
			
			if (query) {
				while (query.charAt(0)=='?') query = query.substr(1);
				this.setOption(OPTION_URI_QUERY, query);
			}
			
		} else {
			throw 'ERROR: CoapPacket.setUri [invalid URI: '+uri+']';
		}
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
		// first byte: version, type, and option count
		tempByte  = (0x03 & VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.optionCount);
		byteArray.push(tempByte);
		
		// second byte: method or response code
	    byteArray.push(0xFF & this.code);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    // options
	    var optionDelta = 0;
	    for (var optType in this.options) {
	    	//dump('Checking option '+optType+'\n');
	    	if (this.options[optType][0]==0) {
				continue;
			} else {
		    	var optLen = this.options[optType][0];
				var opt = this.options[optType][1];
				//dump('  len: '+optLen+'\n');
				//dump('  opt: '+opt+'\n');
				
				// delta type encoding
				tempByte  = (0xFF & (optType-optionDelta)) << 4;
				
				// encode length
				if (optLen<15) {
					tempByte |= (0x0F & optLen);
					byteArray.push(tempByte);
				} else if (optLen<=270) {
					tempByte |= 0x0F;
					byteArray.push(tempByte);
					byteArray.push(0xFF & (optLen-15));
				} else {
					throw 'ERROR: CoapPacket.serialize [Option length larger that 270 is not supported]';
				}
				// add option value
				for(var i in opt) byteArray.push(opt[i]);
				
				optionDelta = optType;
			}
		}
		
	    // serialize as string
	    var message = bytes2str(byteArray);
        
	    // payload
	    message += this.payload;
	    
	    // finished
	    return message;
	},
	
	parse : function(packet) {
	
		// first byte: version, type, and option count
		var tempByte = packet.shift();
		
		this.version = 0xFF & ((tempByte & 0xC0) >> 6);
		if (this.version != VERSION) {
			throw 'ERROR: CoapPacket.parse [CoAP version '+this.version+' not supported]';
        }

		this.type = 0xFF & ((tempByte & 0x30) >> 4);
        if (this.type < 0 || this.type > 3) {
            throw 'ERROR: CoapPacket.parse [Wrong message type ('+this.type+')]';
        }

		this.optionCount = 0x0F & tempByte;
		
		// second byte: method or response code
        this.code = 0xFF &  packet.shift();

		// third and forth byte: transaction ID (TID)
        this.tid  = packet.shift() << 8;
        this.tid |= packet.shift();

        //read options
		var optionDelta = 0;
	    for (var i=0; i<this.optionCount; i++) {
	    
	    	tempByte = packet.shift();
	    	var optType = ((0xF0 & tempByte) >> 4) + optionDelta;
	    	var optLen = (0x0F & tempByte);
	    	
	    	dump('Parsing '+optType+' (delta '+((0xF0 & tempByte) >> 4)+', len '+optLen+')\n');
	    	
	    	// when the length is 15 or more, another byte is added as an 8-bit unsigned integer
	    	if (optLen==15) {
	    		optLen += packet.shift();
	    	}
	    	
	    	var opt = new Array();
	    	for (var j=0; j<optLen; j++) {
	    		opt.push(packet.shift());
	    	}
	    	
	    	// ignore unsupported types
	    	if (this.options[optType]) {
	    		this.options[optType][0] = optLen;
	    		this.options[optType][1] = opt;
	    	}
				
			optionDelta = optType;
		}
		
        //read payload
        var payloadBytes = new Array();
        while (packet.length) {
			payloadBytes.push(packet.shift());
		}
        this.payload = bytes2str(payloadBytes);
	}
};

//Helper functions
////////////////////////////////////////////////////////////////////////////////

function str2bytes(str) {
	var b = new Array(str.length);
	for (var i=0; i<str.length; i++) {
		b[i] = str.charCodeAt(i) & 0xFF;
	}
	return b;
}

function bytes2str(b) {
	var str = '';
    for (var i in b) str += String.fromCharCode(b[i] & 0xFF);
	return str;
}

function int2bytes(i) {
	var b = new Array();
	do {
		b.unshift(0xFF & i);
		i >>= 8;
	} while (i>0);
	return b;
}

function bytes2int(b) {
	var i = 0;
	for (var k in b) {
		i = (i << 8) | b[k];
	}
	return i;
}
