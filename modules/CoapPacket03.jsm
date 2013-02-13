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
 *         Implementation of draft-ietf-core-coap-03
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = [];
Components.utils.import("resource://drafts/common.jsm");

// Constants
////////////////////////////////////////////////////////////////////////////////

Copper.__defineGetter__("VERSION", function() { return 1; });
Copper.__defineGetter__("DRAFT", function() { return 3; });

Copper.__defineGetter__("MSG_TYPE_CON", function() { return 0; });
Copper.__defineGetter__("MSG_TYPE_NON", function() { return 1; });
Copper.__defineGetter__("MSG_TYPE_ACK", function() { return 2; });
Copper.__defineGetter__("MSG_TYPE_RST", function() { return 3; });

Copper.__defineGetter__("OPTION_CONTENT_TYPE", function() { return 1; });
Copper.__defineGetter__("OPTION_MAX_AGE", function() { return 2; });
Copper.__defineGetter__("OPTION_ETAG", function() { return 4; });
Copper.__defineGetter__("OPTION_URI_HOST", function() { return 5; }); // renamed
Copper.__defineGetter__("OPTION_LOCATION_PATH", function() { return 6; }); // renamed
Copper.__defineGetter__("OPTION_URI_PATH", function() { return 9; });
Copper.__defineGetter__("OPTION_OBSERVE", function() { return 10; }); // renamed
Copper.__defineGetter__("OPTION_TOKEN", function() { return 11; });
Copper.__defineGetter__("OPTION_BLOCK", function() { return 13; });
Copper.__defineGetter__("OPTION_FENCE_POST", function() { return 14; });
Copper.__defineGetter__("OPTION_URI_QUERY", function() { return 15; });

Copper.__defineGetter__("CODE_100_CONTINUE", function() { return 40; });
Copper.__defineGetter__("CODE_200_OK", function() { return 80; });
Copper.__defineGetter__("CODE_201_CREATED", function() { return 81; });
Copper.__defineGetter__("CODE_304_NOT_MODIFIED", function() { return 124; });
Copper.__defineGetter__("CODE_400_BAD_REQUEST", function() { return 160; });
Copper.__defineGetter__("CODE_404_NOT_FOUND", function() { return 164; });
Copper.__defineGetter__("CODE_405_METHOD_NOT_ALLOWED", function() { return 165; });
Copper.__defineGetter__("CODE_415_UNSUPPORTED_MADIA_TYPE", function() { return 175; });
Copper.__defineGetter__("CODE_500_INTERNAL_SERVER_ERROR", function() { return 200; });
Copper.__defineGetter__("CODE_502_BAD_GATEWAY", function() { return 202; });
Copper.__defineGetter__("CODE_503_SERVICE_UNAVAILABLE", function() { return 203; });
Copper.__defineGetter__("CODE_504_GATEWAY_TIMEOUT", function() { return 204; });
Copper.__defineGetter__("CODE_TOKEN_OPTION_REQUIRED", function() { return 240; });
Copper.__defineGetter__("CODE_URI_AUTHORITY_OPTION_REQUIRED", function() { return 241; });
Copper.__defineGetter__("CODE_CRITICAL_OPTION_NOT_SUPPORTED", function() { return 242; });

Copper.__defineGetter__("CONTENT_TYPE_TEXT_PLAIN", function() { return 0; });
Copper.__defineGetter__("CONTENT_TYPE_TEXT_XML", function() { return 1; });
Copper.__defineGetter__("CONTENT_TYPE_TEXT_CSV", function() { return 2; });
Copper.__defineGetter__("CONTENT_TYPE_TEXT_HTML", function() { return 3; });
Copper.__defineGetter__("CONTENT_TYPE_IMAGE_GIF", function() { return 21; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_IMAGE_JPEG", function() { return 22; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_IMAGE_PNG", function() { return 23; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_IMAGE_TIFF", function() { return 24; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_AUDIO_RAW", function() { return 25; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_VIDEO_RAW", function() { return 26; }); // 03
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_LINK_FORMAT", function() { return 40; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_XML", function() { return 41; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_OCTET_STREAM", function() { return 42; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_RDF_XML", function() { return 43; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_SOAP_XML", function() { return 44; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_ATOM_XML", function() { return 45; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_XMPP_XML", function() { return 46; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_EXI", function() { return 47; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_X_BXML", function() { return 48; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_FASTINFOSET", function() { return 49; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET", function() { return 50; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_JSON", function() { return 51; });

Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_X_OBIX_BINARY", function() { return -1; }); // 04

Copper.__defineGetter__("GET", function() { return 1; });
Copper.__defineGetter__("POST", function() { return 2; });
Copper.__defineGetter__("PUT", function() { return 3; });
Copper.__defineGetter__("DELETE", function() { return 4; });

Copper.__defineGetter__("WELL_KNOWN_RESOURCES", function() { return '/.well-known/core'; });

Copper.__defineGetter__("RESPONSE_TIMEOUT", function() { return 1000; }); // ms
Copper.__defineGetter__("MAX_RETRANSMIT", function() { return 5; });
Copper.__defineGetter__("ETAG_LENGTH", function() { return 4; });
Copper.__defineGetter__("TOKEN_LENGTH", function() { return 2; });

Copper.__defineGetter__("DEFAULT_PORT", function() { return 61616; });

// CoAP draft-03 implementation
////////////////////////////////////////////////////////////////////////////////

Copper.CoapPacket = function() {
	this.options = new Array();
	//                                       length, value as byte array
	this.options[Copper.OPTION_CONTENT_TYPE] = new Array(0, null);
	this.options[Copper.OPTION_MAX_AGE] = new Array(0, null);
	this.options[Copper.OPTION_ETAG] = new Array(0, null);
	this.options[Copper.OPTION_URI_HOST] = new Array(0, null);
	this.options[Copper.OPTION_LOCATION_PATH] = new Array(0, null);
	this.options[Copper.OPTION_URI_PATH] = new Array(0, null);
	this.options[Copper.OPTION_OBSERVE] = new Array(0, null);
	this.options[Copper.OPTION_TOKEN] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK] = new Array(0, null);
	this.options[Copper.OPTION_FENCE_POST] = new Array(0, null);
	this.options[Copper.OPTION_URI_QUERY] = new Array(0, null);

	this.tid = parseInt(Math.random()*0x10000);
	
	this.payload = new Array(0);
	
	return this;
};

Copper.CoapPacket.prototype = {
	version :     Copper.VERSION, // member for received packets
	type :        Copper.MSG_TYPE_CON,
	optionCount : 0,
	code :        Copper.GET,
	tid :         0,
	options :     null,
	payload :     null,
	
	// readable method or response code
	getCode : function(readable) {
		if (readable) {
			switch (parseInt(this.code)) {
				// empty
				case 0: return 'EMPTY';
				// methods
				case Copper.GET: return 'GET';
				case Copper.POST: return 'POST';
				case Copper.PUT: return 'PUT';
				case Copper.DELETE: return 'DELETE';
				// response codes
				case Copper.CODE_100_CONTINUE: return '100 Continue';
				case Copper.CODE_200_OK: return '200 OK';
				case Copper.CODE_201_CREATED: return '201 Created';
				case Copper.CODE_304_NOT_MODIFIED: return '304 Not Modified';
				case Copper.CODE_400_BAD_REQUEST: return '400 Bad Request';
				case Copper.CODE_404_NOT_FOUND: return '404 Not Found';
				case Copper.CODE_405_METHOD_NOT_ALLOWED: return '405 Method Not Allowed';
				case Copper.CODE_415_UNSUPPORTED_MADIA_TYPE: return '415 Unsupported Madia Type';
				case Copper.CODE_500_INTERNAL_SERVER_ERROR: return '500 Internal Server Error';
				case Copper.CODE_502_BAD_GATEWAY: return '502 Bad Gateway';
				case Copper.CODE_503_SERVICE_UNAVAILABLE: return '503 Service Unavailable';
				case Copper.CODE_504_GATEWAY_TIMEOUT: return '504 Gateway Timeout';
				case Copper.CODE_TOKEN_OPTION_REQUIRED: return 'Token Option required by server';
				case Copper.CODE_URI_AUTHORITY_OPTION_REQUIRED: return 'Uri-Authority Option required by server';
				case Copper.CODE_CRITICAL_OPTION_NOT_SUPPORTED: return 'Critical Option not supported';
				// ...
				default: return 'unknown ('+this.code+')';
			}
		} else {
			return parseInt(this.code);
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
		if (this.options[optType]!=null && this.options[optType][0]!=null) {
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
			case Copper.OPTION_LOCATION_PATH:
			case Copper.OPTION_URI_HOST:
			case Copper.OPTION_URI_PATH:
			case Copper.OPTION_URI_QUERY:
				return Copper.bytes2str(opt);
				break;
			
			// byte arrays
			case Copper.OPTION_ETAG:
			case Copper.OPTION_TOKEN:
				return Copper.bytes2hex(opt);
				break;
			
			// delta fence post
			case Copper.OPTION_FENCE_POST:
				return 0;
				break;
			
			// integers
			default:
				return Copper.bytes2int(opt);
		}
		return null;
	},
	
	setOption : function(option, value) {
		switch (parseInt(option)) {
			// strings
			case Copper.OPTION_LOCATION_PATH:
			case Copper.OPTION_URI_HOST:
			case Copper.OPTION_URI_PATH:
			case Copper.OPTION_URI_QUERY:
				this.options[option][0] = value.length;
				this.options[option][1] = Copper.str2bytes(value);
				break;
			
			// byte arrays
			case Copper.OPTION_ETAG:
			case Copper.OPTION_TOKEN:
				this.options[option][0] = value.length;
				this.options[option][1] = value;
				break;
			
			// integers
			case Copper.OPTION_CONTENT_TYPE:
			case Copper.OPTION_MAX_AGE:
			case Copper.OPTION_OBSERVE:
			case Copper.OPTION_BLOCK:
				this.options[option][1] = Copper.int2bytes(value);
				this.options[option][0] = this.options[option][1].length;
				break;
			
			default:
				dump('WARNING: CoapPacket.setOption [Ignoring unknown option '+option+': '+value+']\n');
		}
		
		// recalculate option count
		this.optionCount = 0;
		for (var optType in this.options) {
	    	if (this.options[optType][0]>0) this.optionCount++;
	    }
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(uri) {
		var tokens = uri.match(/^(coap:\/\/[a-z0-9-\.]+(%[a-z0-9]+)?)?(:[0-9]{1,5})?(\/?|(\/[^\/\?]+)+)(\?.*)?$/i);
		if (tokens) {
			
			var path = tokens[4];
			var query = tokens[6];
			
			// omit leading slash
			while (path.charAt(0)=='/') path = path.substr(1);
			
			this.setOption(Copper.OPTION_URI_PATH, path);
			
			if (query) {
				while (query.charAt(0)=='?') query = query.substr(1);
				this.setOption(Copper.OPTION_URI_QUERY, query);
			}
			
		} else {
			throw 'ERROR: CoapPacket.setUri [invalid URI: '+uri+']';
		}
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
		// first byte: version, type, and option count
		tempByte  = (0x03 & Copper.VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.optionCount);
		byteArray.push(tempByte);
		
		// second byte: method or response code
	    byteArray.push(0xFF & this.code);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >>> 8));
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
	    var message = Copper.bytes2data(byteArray);
        
	    // payload
	    message += Copper.bytes2data(this.payload);
	    
	    // finished
	    return message;
	},
	
	parse : function(packet) {
	
		// first byte: version, type, and option count
		var tempByte = packet.shift();
		
		this.version = 0xFF & ((tempByte & 0xC0) >>> 6);
		if (this.version != Copper.VERSION) {
			throw 'ERROR: CoapPacket.parse [CoAP version '+this.version+' not supported]';
        }

		this.type = 0xFF & ((tempByte & 0x30) >>> 4);
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
	    	var optType = ((0xF0 & tempByte) >>> 4) + optionDelta;
	    	var optLen = (0x0F & tempByte);
	    	
	    	//dump('INFO: parsing option '+optType+' (delta '+((0xF0 & tempByte) >>> 4)+', len '+optLen+')\n');
	    	
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
		
	    // remaining array is the payload
	    this.payload = packet;
	}
};
