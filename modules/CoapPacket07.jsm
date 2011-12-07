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
 *         Implementation of draft-ietf-core-coap-07/08
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = [];
Components.utils.import("resource://drafts/common.jsm");

// Constants
////////////////////////////////////////////////////////////////////////////////

Copper.__defineGetter__("VERSION", function() { return 1; });
Copper.__defineGetter__("DRAFT", function() { return 7; });

Copper.__defineGetter__("MSG_TYPE_CON", function() { return 0; });
Copper.__defineGetter__("MSG_TYPE_NON", function() { return 1; });
Copper.__defineGetter__("MSG_TYPE_ACK", function() { return 2; });
Copper.__defineGetter__("MSG_TYPE_RST", function() { return 3; });

Copper.__defineGetter__("OPTION_CONTENT_TYPE", function() { return 1; });
Copper.__defineGetter__("OPTION_MAX_AGE", function() { return 2; });
Copper.__defineGetter__("OPTION_PROXY_URI", function() { return 3; });
Copper.__defineGetter__("OPTION_ETAG", function() { return 4; });
Copper.__defineGetter__("OPTION_URI_HOST", function() { return 5; });
Copper.__defineGetter__("OPTION_LOCATION_PATH", function() { return 6; });
Copper.__defineGetter__("OPTION_URI_PORT", function() { return 7; });
Copper.__defineGetter__("OPTION_LOCATION_QUERY", function() { return 8; });
Copper.__defineGetter__("OPTION_URI_PATH", function() { return 9; });
Copper.__defineGetter__("OPTION_OBSERVE", function() { return 10; });
Copper.__defineGetter__("OPTION_TOKEN", function() { return 11; });
Copper.__defineGetter__("OPTION_ACCEPT", function() { return 12; });
Copper.__defineGetter__("OPTION_IF_MATCH", function() { return 13; });
Copper.__defineGetter__("OPTION_FENCE_POST", function() { return 14; });
Copper.__defineGetter__("OPTION_URI_QUERY", function() { return 15; });
Copper.__defineGetter__("OPTION_BLOCK", function() { return 17; }); // for API compatibility
Copper.__defineGetter__("OPTION_BLOCK2", function() { return 17; });
Copper.__defineGetter__("OPTION_BLOCK1", function() { return 19; });
Copper.__defineGetter__("OPTION_IF_NONE_MATCH", function() { return 21; });

Copper.__defineGetter__("CODE_2_01_CREATED", function() { return 65; });
Copper.__defineGetter__("CODE_2_02_DELETED", function() { return 66; });
Copper.__defineGetter__("CODE_2_03_VALID", function() { return 67; });
Copper.__defineGetter__("CODE_2_04_CHANGED", function() { return 68; });
Copper.__defineGetter__("CODE_2_05_CONTENT", function() { return 69; });

Copper.__defineGetter__("CODE_4_00_BAD_REQUEST", function() { return 128; });
Copper.__defineGetter__("CODE_4_01_UNAUTHORIZED", function() { return 129; });
Copper.__defineGetter__("CODE_4_02_BAD_OPTION", function() { return 130; });
Copper.__defineGetter__("CODE_4_03_FORBIDDEN", function() { return 131; });
Copper.__defineGetter__("CODE_4_04_NOT_FOUND", function() { return 132; });
Copper.__defineGetter__("CODE_4_05_METHOD_NOT_ALLOWED", function() { return 133; });
Copper.__defineGetter__("CODE_4_06_NOT_ACCEPTABLE", function() { return 134; });
Copper.__defineGetter__("CODE_4_08_REQUEST_ENTITY_INCOMPLETE", function() { return 136; });
Copper.__defineGetter__("CODE_4_12_PRECONDITION_FAILED", function() { return 140; });
Copper.__defineGetter__("CODE_4_13_REQUEST_ENTITY_TOO_LARGE", function() { return 141; });
Copper.__defineGetter__("CODE_4_15_UNSUPPORTED_MEDIA_TYPE", function() { return 143; });

Copper.__defineGetter__("CODE_5_00_INTERNAL_SERVER_ERROR", function() { return 160; });
Copper.__defineGetter__("CODE_5_01_NOT_IMPLEMENTED", function() { return 161; });
Copper.__defineGetter__("CODE_5_02_BAD_GATEWAY", function() { return 162; });
Copper.__defineGetter__("CODE_5_03_SERVICE_UNAVAILABLE", function() { return 163; });
Copper.__defineGetter__("CODE_5_04_GATEWAY_TIMEOUT", function() { return 164; });
Copper.__defineGetter__("CODE_5_05_PROXYING_NOT_SUPPORTED", function() { return 165; });

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
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_FASTINFOSET", function() { return 48; }); // 04
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET", function() { return 49; }); // 04
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_JSON", function() { return 50; }); // 04
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_X_OBIX_BINARY", function() { return 51; }); // 04

Copper.__defineGetter__("GET", function() { return 1; });
Copper.__defineGetter__("POST", function() { return 2; });
Copper.__defineGetter__("PUT", function() { return 3; });
Copper.__defineGetter__("DELETE", function() { return 4; });

Copper.__defineGetter__("WELL_KNOWN_RESOURCES", function() { return '/.well-known/core'; });

Copper.__defineGetter__("RESPONSE_TIMEOUT", function() { return 2000; }); // ms
Copper.__defineGetter__("RESPONSE_RANDOM_FACTOR", function() { return 1.5; }); // ms
Copper.__defineGetter__("MAX_RETRANSMIT", function() { return 4; });
Copper.__defineGetter__("ETAG_LENGTH", function() { return 8; });
Copper.__defineGetter__("TOKEN_LENGTH", function() { return 8; });

Copper.__defineGetter__("DEFAULT_PORT", function() { return 5683; });

// General version-specific functions
////////////////////////////////////////////////////////////////////////////////

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

// CoAP draft-06 implementation
////////////////////////////////////////////////////////////////////////////////

Copper.CoapPacket = function() {
	this.options = new Array();
	//                                       length, value as byte array
	this.options[Copper.OPTION_CONTENT_TYPE] = new Array(0, null);
	this.options[Copper.OPTION_MAX_AGE] = new Array(0, null);
	this.options[Copper.OPTION_PROXY_URI] = new Array(0, null);
	this.options[Copper.OPTION_ETAG] = new Array(0, null);
	this.options[Copper.OPTION_URI_HOST] = new Array(0, null);
	this.options[Copper.OPTION_LOCATION_PATH] = new Array(0, null);
	this.options[Copper.OPTION_URI_PORT] = new Array(0, null);
	this.options[Copper.OPTION_LOCATION_QUERY] = new Array(0, null);
	this.options[Copper.OPTION_URI_PATH] = new Array(0, null);
	this.options[Copper.OPTION_OBSERVE] = new Array(0, null);
	this.options[Copper.OPTION_TOKEN] = new Array(0, null);
	this.options[Copper.OPTION_ACCEPT] = new Array(0, null);
	this.options[Copper.OPTION_IF_MATCH] = new Array(0, null);
	this.options[Copper.OPTION_FENCE_POST] = new Array(0, null);
	this.options[Copper.OPTION_URI_QUERY] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK2] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK1] = new Array(0, null);
	this.options[Copper.OPTION_IF_NONE_MATCH] = new Array(0, null);

	this.tid = parseInt(Math.random()*0x10000);
};

Copper.CoapPacket.prototype = {
	version :     Copper.VERSION, // member for received packets
	type :        Copper.MSG_TYPE_CON,
	optionCount : 0,
	code :        Copper.GET,
	tid :         0,
	options :     null,
	payload :     '',
	
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
				case Copper.CODE_2_01_CREATED: return '2.01 Created';
				case Copper.CODE_2_02_DELETED: return '2.02 Deleted';
				case Copper.CODE_2_03_VALID: return '2.03 Valid';
				case Copper.CODE_2_04_CHANGED: return '2.04 Changed';
				case Copper.CODE_2_05_CONTENT: return '2.05 Content';
				case Copper.CODE_4_00_BAD_REQUEST: return '4.00 Bad Request';
				case Copper.CODE_4_01_UNAUTHORIZED: return '4.01 Unauthorized';
				case Copper.CODE_4_02_BAD_OPTION: return '4.02 Bad Option';
				case Copper.CODE_4_03_FORBIDDEN: return '4.03 Forbidden';
				case Copper.CODE_4_04_NOT_FOUND: return '4.04 Not Found';
				case Copper.CODE_4_05_METHOD_NOT_ALLOWED: return '4.05 Method Not Allowed';
				case Copper.CODE_4_06_NOT_ACCEPTABLE: return '4.06 Not Acceptable';
				case Copper.CODE_4_08_REQUEST_ENTITY_INCOMPLETE: return '4.08 Request Entity Incomplete';
				case Copper.CODE_4_12_PRECONDITION_FAILED: return '4.12 Precondition Failed';
				case Copper.CODE_4_13_REQUEST_ENTITY_TOO_LARGE: return '4.13 Request Entity Too Large';
				case Copper.CODE_4_15_UNSUPPORTED_MEDIA_TYPE: return '4.15 Unsupported Media Type';
				case Copper.CODE_5_00_INTERNAL_SERVER_ERROR: return '5.00 Internal Server Error';
				case Copper.CODE_5_01_NOT_IMPLEMENTED: return '5.01 Not Implemented';
				case Copper.CODE_5_02_BAD_GATEWAY: return '5.02 Bad Gateway';
				case Copper.CODE_5_03_SERVICE_UNAVAILABLE: return '5.03 Service Unavailable';
				case Copper.CODE_5_04_GATEWAY_TIMEOUT: return '5.04 Gateway Timeout';
				case Copper.CODE_5_05_PROXYING_NOT_SUPPORTED: return '5.05 Proxying Not Supported';
				// ...
				default: return Math.floor(this.code/32)+'.'+(this.code % 32)+' Unknown by Copper';
			}
		} else {
			return parseInt(this.code);
		}
	},
	
	// get options that are set in the package
	getOptions : function() {
		var list = new Array();
		for (var optTypeIt in this.options) {
	    	if (this.options[optTypeIt][0]==0) {
				continue;
			} else {
				list.push(optTypeIt);
			}
		}
		return list;
	},
	
	// retrieve option
	getOptionLength : function(optType) {
		//dump('getOptionLength: '+optType+'\n');

		if (this.options[optType]!=null && this.options[optType][0]!=null) {
			return this.options[optType][0];
		} else {
			return -1;
		}
	},
	getOption : function(optType) {
		//dump('getOption: '+optType+'\n');
		
		if (this.getOptionLength(optType)<=0) {
			return null;
		}
		
    	//var optLen = this.options[optType][0];
		var opt = this.options[optType][1];

		switch (parseInt(optType)) {
			// strings
			case Copper.OPTION_PROXY_URI:
			case Copper.OPTION_LOCATION_PATH:
			case Copper.OPTION_URI_HOST:
			case Copper.OPTION_LOCATION_QUERY:
			case Copper.OPTION_URI_PATH:
			case Copper.OPTION_URI_QUERY:
				return Copper.bytes2str(opt);
				break;
			
			// byte arrays
			case Copper.OPTION_ETAG:
			case Copper.OPTION_TOKEN:
			case Copper.OPTION_IF_MATCH:
				return opt;
				break;
			
			// delta fence post
			case Copper.OPTION_FENCE_POST:
				return null;
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
			case Copper.OPTION_PROXY_URI:
			case Copper.OPTION_LOCATION_PATH:
			case Copper.OPTION_LOCATION_QUERY:
			case Copper.OPTION_URI_HOST:
			case Copper.OPTION_URI_PATH:
			case Copper.OPTION_URI_QUERY:
				this.options[option][0] = value.length;
				this.options[option][1] = Copper.str2bytes(value);
				break;
			
			// byte arrays
			case Copper.OPTION_ETAG:
			case Copper.OPTION_TOKEN:
			case Copper.OPTION_IF_MATCH:
				this.options[option][0] = value.length;
				this.options[option][1] = value;
				break;
				
			// special arrays
			case -1:
				this.options[option][0] += 1;
				if (this.options[option][1]==null) this.options[option][1] = new Array(0);
				this.options[option][1][ this.options[option][0] ] = value;
				this.options[option][0] += 1;
				break;
			
			// integers
			case Copper.OPTION_CONTENT_TYPE:
			case Copper.OPTION_MAX_AGE:
			case Copper.OPTION_URI_PORT:
			case Copper.OPTION_OBSERVE:
			case Copper.OPTION_ACCEPT:
			case Copper.OPTION_BLOCK2:
			case Copper.OPTION_BLOCK1:
			case Copper.OPTION_IF_NONE_MATCH:
				this.options[option][1] = Copper.int2bytes(value);
				this.options[option][0] = this.options[option][1].length;
				break;
			
			default:
				dump('WARNING: CoapPacket.setOption [Ignoring unknown option '+option+': '+value+']\n');
		}
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(uri) {
		/*
		var parsedUri = Components.classes["@mozilla.org/network/io-service;1"]
    	.getService(Components.interfaces.nsIIOService)
    	.newURI(uri, null, null);
	
		var url = parsedUri.QueryInterface(Components.interfaces.nsIURL);
		dump('setUri PARSED:\n' + url.host + '\n' + url.port + '\n' + url.port + '\n' + url.filePath + '\n' + url.query);
		*/

		var tokens = uri.match(/^(coap:\/\/[a-z0-9-\.]+(%[a-z0-9]+)?)?(:[0-9]{1,5})?(\/?|(\/[^\/\?]+)+)(\?.*)?$/i);
		if (tokens) {
			

			var path = tokens[4];
			var query = tokens[6];
			
			/*
			if (url.host && url.host.indexOf(':')==-1) {
				
				this.setOption(Copper.OPTION_URI_HOST, url.host);
			}
			if (url.port) {
				this.setOption(Copper.OPTION_URI_PORT, url.port);
			}
			*/
			
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
		
		// first byte: set after options are serialized and option count is known
		byteArray.push(0x00);
		
		// second byte: method or response code
	    byteArray.push(0xFF & this.code);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >>> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    // options
	    this.optionCount = 0;
	    var optionDelta = 0;
	    for (var optTypeIt in this.options) {
	    	if (this.options[optTypeIt][0]==0) {
				continue;
			} else {
				var opt = this.options[optTypeIt][1];
				
				// fence posting
				while (optTypeIt-optionDelta > 15) {
					let fenceDelta = Copper.OPTION_FENCE_POST - (optionDelta % Copper.OPTION_FENCE_POST);
					tempByte  = (0xFF & fenceDelta) << 4;
					byteArray.push(tempByte);
					optionDelta += fenceDelta;
					
					this.optionCount++;
					//dump('INFO: Serializing fence post (delta '+ fenceDelta+')\n');
				}
				
				var splitOption = new Array();
				if (optTypeIt==Copper.OPTION_LOCATION_PATH ||
					optTypeIt==Copper.OPTION_LOCATION_QUERY ||
					optTypeIt==Copper.OPTION_URI_PATH ||
					optTypeIt==Copper.OPTION_URI_QUERY) {
	    			
	    			var separator = '/'; // 0x002F
	    			if (optTypeIt==Copper.OPTION_LOCATION_QUERY || optTypeIt==Copper.OPTION_URI_QUERY) {
	    				separator = '&'; // 0x0026
	    			}
				
					var splitString = Copper.bytes2str(opt).split(separator);
					for (var s in splitString) {
						//dump(splitString[s]+'\n');
						splitOption.push(Copper.str2bytes(splitString[s]));
					}
				} else {
					splitOption.push(opt);
				}
				
				while ((opt = splitOption.shift())) {
					//dump('INFO: Serializing option '+optTypeIt+' (delta '+(optTypeIt-optionDelta)+', len '+opt.length+')\n');
			    	
					// delta type encoding
					tempByte  = (0xFF & (optTypeIt-optionDelta)) << 4;
					
					// encode length
					if (opt.length<15) {
						tempByte |= (0x0F & opt.length);
						byteArray.push(tempByte);
					} else if (opt.length<=270) {
						tempByte |= 0x0F;
						byteArray.push(tempByte);
						byteArray.push(0xFF & (opt.length-15));
					} else {
						throw 'ERROR: CoapPacket.serialize [Option length larger that 270 is not supported]';
					}
					// add option value
					for(var i in opt) byteArray.push(opt[i]);
					
					this.optionCount++;
					optionDelta = optTypeIt;
				} 
			}
		}
	    
	    // first byte: version, type, and option count
		tempByte  = (0x03 & Copper.VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.optionCount);
		
		byteArray[0] = tempByte;
		
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
	    	if (optLen==0) {
	    		optLen = 1;
	    		opt.push(0);
	    	} else {
		    	for (var j=0; j<optLen; j++) {
		    		opt.push(packet.shift());
		    	}
	    	}
	    	
	    	// only supported types
	    	if (this.options[optType]) {
	    	
				if (optType==Copper.OPTION_LOCATION_PATH ||
	    			optType==Copper.OPTION_LOCATION_QUERY ||
	    			optType==Copper.OPTION_URI_PATH ||
	    			optType==Copper.OPTION_URI_QUERY) {
	    			
	    			var separator = 0x002F; // /
	    			if (optType==Copper.OPTION_LOCATION_QUERY || optType==Copper.OPTION_URI_QUERY) {
	    				separator = 0x0026; // &
	    			}
	    			
	    			if (this.options[optType][0]>0) {
	    				optLen += 1 + this.options[optType][0];
	    				opt = this.options[optType][1].concat(separator).concat(opt);
	    			}
	    		}
				
				if (optType==Copper.OPTION_FENCE_POST) {
					this.options[optType][0] += 1;
				} else {
	    		
	    		this.options[optType][0] = optLen;
	    		this.options[optType][1] = opt;
				}
	    	}
				
			optionDelta = optType;
		}
		
        // read payload, treat as raw data, convert later
	    this.payload = new Array();
        while (packet.length) {
        	this.payload.push(packet.shift());
		}
	}
};
