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
 *         Implementation of draft-shelby-core-coap
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = [
						'VERSION',
						
						'MSG_TYPE_REQUEST',
						'MSG_TYPE_RESPONSE',
						'MSG_TYPE_NOTIFY',
						
						'OPTION_CONTENT_TYPE',
						'OPTION_URI',
						'OPTION_URI_CODE',
						'OPTION_MAX_AGE',
						'OPTION_ETAG',
						'OPTION_DATE',
						'OPTION_SUBSCRIPTION_LIFETIME',
						
						'CODE_200_OK',
						'CODE_201_CREATED',
						'CODE_304_NOT_MODIFIED',
						'CODE_401_UNAUTHORIZED',
						'CODE_403_FORBIDDEN',
						'CODE_404_NOT_FOUND',
						'CODE_405_METHOD_NOT_ALLOWED',
						'CODE_409_CONFLICT',
						'CODE_415_UNSUPPORTED_MADIA_TYPE',
						'CODE_500_INTERNAL_SERVER_ERROR',
						'CODE_503_SERVICE_UNAVAILABLE',
						'CODE_504_GATEWAY_TIMEOUT',
						
						'GET',
						'POST',
						'PUT',
						'DELETE',
						'SUBSCRIBE',
						
						'WELL_KNOWN_RESOURCES',
						
						'CoapPacket'
						];

const VERSION = 0;

const MSG_TYPE_REQUEST = 0;
const MSG_TYPE_RESPONSE = 1;
const MSG_TYPE_NOTIFY = 2;

const OPTION_CONTENT_TYPE = 0;
const OPTION_URI = 1;
const OPTION_URI_CODE = 2;
const OPTION_MAX_AGE = 3;
const OPTION_ETAG = 4;
const OPTION_DATE = 5;
const OPTION_SUBSCRIPTION_LIFETIME = 6;

const CODE_200_OK = 0;
const CODE_201_CREATED = 1;
const CODE_304_NOT_MODIFIED = 14;
const CODE_400_BAD_REQUEST = 20;
const CODE_401_UNAUTHORIZED = 21;
const CODE_403_FORBIDDEN = 23;
const CODE_404_NOT_FOUND = 24;
const CODE_405_METHOD_NOT_ALLOWED = 25;
const CODE_409_CONFLICT = 29;
const CODE_415_UNSUPPORTED_MADIA_TYPE = 35;
const CODE_500_INTERNAL_SERVER_ERROR = 40;
const CODE_503_SERVICE_UNAVAILABLE = 43;
const CODE_504_GATEWAY_TIMEOUT = 44;

const GET = 0;
const POST = 1;
const PUT = 2;
const DELETE = 3;
const SUBSCRIBE = 4;

const WELL_KNOWN_RESOURCES = '/.well_known/resources';

function CoapPacket() {
	this.options = new Array();
}

CoapPacket.prototype = {
	version : VERSION,
	type : MSG_TYPE_REQUEST,
	optionCount : 0,
	ack: 0,
	code : GET,
	tid : 0x0777,
	options : null,
	payload : '',
	
	// readable type
	getType : function() {
		switch (parseInt(this.type)) {
			case MSG_TYPE_REQUEST: return 'REQUEST';
			case MSG_TYPE_RESPONSE: return 'RESPONSE';
			case MSG_TYPE_NOTIFY: return 'NOTIFY';
			default: return 'unknown';
		}
	},
	
	// readable method or response code
	getCode : function(readable) {
		if (this.type==MSG_TYPE_REQUEST) {
			// method
			switch (parseInt(this.code)) {
				case GET: return 'GET';
				case POST: return 'POST';
				case PUT: return 'PUT';
				case DELETE: return 'DELETE';
				case SUBSCRIBE: return 'SUBSCRIBE';
				default: return 'unknown';
			}
		} else {
			// response code
			switch (parseInt(this.code)) {
				case CODE_200_OK: return '200 OK';
				case CODE_201_CREATED: return '201 CREATED';
				case CODE_304_NOT_MODIFIED: return '304 NOT MODIFIED';
				case CODE_400_BAD_REQUEST: return '400 BAD REQUEST';
				case CODE_401_UNAUTHORIZED: return '401 UNAUTHORIZED';
				case CODE_403_FORBIDDEN: return '403 FORBIDDEN';
				case CODE_404_NOT_FOUND: return '404 NOT FOUND';
				case CODE_405_METHOD_NOT_ALLOWED: return '405 METHOD NOT ALLOWED';
				case CODE_409_CONFLICT: return '409 CONFLICT';
				case CODE_415_UNSUPPORTED_MADIA_TYPE: return '415 UNSUPPORTED MADIA TYPE';
				case CODE_500_INTERNAL_SERVER_ERROR: return '500 INTERNAL SERVER ERROR';
				case CODE_503_SERVICE_UNAVAILABLE: return '503 SERVICE UNAVAILABLE';
				case CODE_504_GATEWAY_TIMEOUT: return '504 GATEWAY TIMEOUT';
				default: return 'unknown';
			}
		}
	},
	
	// readable option type
	getOptType : function(type) {
		switch (parseInt(type)) {
			case OPTION_CONTENT_TYPE: return 'CONTENT-TYPE';
			case OPTION_URI: return 'URI';
			case OPTION_URI_CODE: return 'URI-CODE';
			case OPTION_MAX_AGE: return 'MAX-AGE';
			case OPTION_ETAG: return 'ETAG';
			case OPTION_DATE: return 'DATE';
			case OPTION_SUBSCRIPTION_LIFETIME: return 'SUBSCRIPTION-LIFETIME';
			default: return 'unknown';
		}
	},
	
	getOptions : function() {
		var ret = '';
		for (var optType in this.options) {
			ret += this.getOptType(optType)+': '+ this.options[optType]+'; ';
		}
		return ret;
	},
	
	setOption : function(option, value) {
		// typing hence byte representation is weak in JavaScript, better be safe than sorry...
		switch (parseInt(option)) {
			case OPTION_URI:
				//dump('Setting URI ' + value + '\n');
				this.options[option] = str2bytes(value);
				break;
			default:
				dump('ERROR: CoapPacket.setOption [Unknown option ('+option+')]\n')
				throw 'ERROR: CoapPacket.setOption [Unknown option ('+option+')]';
		}
		this.optionCount++;
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(uri) {
		this.setOption(OPTION_URI, uri);
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
		// first byte: version, type, and option count
		tempByte  = (0x03 & VERSION) << 6;
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.optionCount);
		byteArray.push(tempByte);
		
		// second byte: method or response code
		switch (this.type) {
			case MSG_TYPE_REQUEST:
	            tempByte  = (0x01 & this.ack) << 7;
	            tempByte |= (0x07 & this.code);
	            break;
	        case MSG_TYPE_RESPONSE:
	        	tempByte =  (0x3F & this.code);
	            break;
	        case MSG_TYPE_NOTIFY:
	            tempByte  = (0x01 & this.mustAcknowladge) << 7;
	            tempByte |= (0x3F & this.code);
	            break;
	    }
	    byteArray.push(tempByte);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    // options
	    //dump(this.options.length + ' options ' + ': ' + this.options);
	    for (var optType in this.options) {
			var opt = this.options[optType];
			var optLen = opt.length;
			
			tempByte = (0x1F & optType) << 3;
			
			// encode length
			if (optLen <= 4) {
				tempByte |= (0x3 & optLen);
				byteArray.push(tempByte);
			} else if (optLen <= 1024) {
				tempByte |= 0x04 | (0x03 & (optLen >> 8));
				byteArray.push(tempByte);
				byteArray.push(0xFF & optLen);
			} else {
				dump('ERROR: CoapPacket.serialize [Option length larger that 1024 is not supported]\n')
				throw 'ERROR: CoapPacket.serialize [Option length larger that 1024 is not supported]';
			}
			// add value
			for(var i in opt) byteArray.push(opt[i]);
		}
	    
	    // serialize as string
	    var message = bytes2str(byteArray);
        
	    // payload
	    message += this.payload;
	    
	    // finished
	    return message;
	},
	
	parse : function(packet) {
	
		var tempByte = packet.shift();
		
		this.version = 0xFF & ((tempByte & 0xC0) >> 6);
		if (this.version != VERSION) {
			dump('ERROR: CoapPacket.parse [CoAP version '+this.version+' not supported]\n');
			throw 'ERROR: CoapPacket.parse [CoAP version '+this.version+' not supported]';
        }

		this.type = 0xFF & ((tempByte & 0x30) >> 4);
        if (this.type < 0 || this.type > 2) {
        	dump('ERROR: CoapPacket.parse [Wrong message type ('+this.type+')]\n')
            throw 'ERROR: CoapPacket.parse [Wrong message type ('+this.type+')]';
        }

		this.optionCount = 0xFF & (tempByte & 0x0F);
		
		tempByte = packet.shift();
            
        switch (this.type) {
			case MSG_TYPE_REQUEST:
                this.ack = (tempByte >> 7) & 0x01;
                this.code = tempByte & 0x0F;
                break;
            case MSG_TYPE_RESPONSE:
                this.ack = 0;
                this.code = tempByte & 0x1F;
                break;
            case MSG_TYPE_NOTIFY:
                this.ack = (tempByte >> 7) & 0x01;
                this.code = tempByte & 0x1F;
                break;
		}

        this.tid = tempByte = packet.shift() << 8;
        this.tid = this.tid | packet.shift();

        //read options
        for (var i = 0; i < this.optionCount && i < 1; i++) {
            tempByte = packet.shift();
            var optType = (tempByte >> 3) & 0x1F;
            var optLen = tempByte & 0x3;
            if ((tempByte & 0x04) == 0x04) {
                optLen = (optLen << 8) | packet.shift();
            }
            
	    	var opt = new Array();
	    	for (var j=0; j<optLen; j++) {
	    		opt.push(packet.shift());
	    	}
	    	
	    	this.options[optType] = opt;
        }

        //read payload
        var payloadBytes = new Array();
        while (packet.length) {
			payloadBytes.push(packet.shift());
		}
        this.payload = bytes2str(payloadBytes);
	}
};

/*
function readableMethod(num) {
	switch (parseInt(num)) {
		case GET: return 'GET';
		case POST: return 'POST';
		case PUT: return 'PUT';
		case DELETE: return 'DELETE';
		case SUBSCRIBE: return 'SUBSCRIBE';
		default: return 'unknown';
	}
}

function readableCode(num) {
	switch (parseInt(num)) {
		case CODE_200_OK: return '200 OK';
		case CODE_201_CREATED: return '201 CREATED';
		case CODE_304_NOT_MODIFIED: return '304 NOT MODIFIED';
		case CODE_400_BAD_REQUEST: return '400 BAD REQUEST';
		case CODE_401_UNAUTHORIZED: return '401 UNAUTHORIZED';
		case CODE_403_FORBIDDEN: return '403 FORBIDDEN';
		case CODE_404_NOT_FOUND: return '404 NOT FOUND';
		case CODE_405_METHOD_NOT_ALLOWED: return '405 METHOD NOT ALLOWED';
		case CODE_409_CONFLICT: return '409 CONFLICT';
		case CODE_415_UNSUPPORTED_MADIA_TYPE: return '415 UNSUPPORTED MADIA TYPE';
		case CODE_500_INTERNAL_SERVER_ERROR: return '500 INTERNAL SERVER ERROR';
		case CODE_503_SERVICE_UNAVAILABLE: return '503 SERVICE UNAVAILABLE';
		case CODE_504_GATEWAY_TIMEOUT: return '504 GATEWAY TIMEOUT';
		default: return 'unknown';
	}
}

function readableOption(num) {
	switch (parseInt(num)) {
		case OPTION_CONTENT_TYPE: return 'CONTENT-TYPE';
		case OPTION_URI: return 'URI';
		case OPTION_URI_CODE: return 'URI-CODE';
		case OPTION_MAX_AGE: return 'MAX-AGE';
		case OPTION_ETAG: return 'ETAG';
		case OPTION_DATE: return 'DATE';
		case OPTION_SUBSCRIPTION_LIFETIME: return 'SUBSCRIPTION-LIFETIME';
		default: return 'unknown';
	}
}
*/

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
