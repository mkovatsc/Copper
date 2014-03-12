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
 * \file   Implementation of draft-ietf-core-coap-12
 *
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

var EXPORTED_SYMBOLS = [];
Components.utils.import("resource://drafts/common.jsm");

// Constants
////////////////////////////////////////////////////////////////////////////////

Copper.__defineGetter__("VERSION", function() { return 1; });
Copper.__defineGetter__("DRAFT", function() { return 13; });

Copper.__defineGetter__("MSG_TYPE_CON", function() { return 0; });
Copper.__defineGetter__("MSG_TYPE_NON", function() { return 1; });
Copper.__defineGetter__("MSG_TYPE_ACK", function() { return 2; });
Copper.__defineGetter__("MSG_TYPE_RST", function() { return 3; });

Copper.__defineGetter__("OPTION_IF_MATCH", function() { return 1; });
Copper.__defineGetter__("OPTION_URI_HOST", function() { return 3; });
Copper.__defineGetter__("OPTION_ETAG", function() { return 4; });
Copper.__defineGetter__("OPTION_IF_NONE_MATCH", function() { return 5; });
Copper.__defineGetter__("OPTION_URI_PORT", function() { return 7; });
Copper.__defineGetter__("OPTION_LOCATION_PATH", function() { return 8; });
Copper.__defineGetter__("OPTION_URI_PATH", function() { return 11; });
Copper.__defineGetter__("OPTION_CONTENT_TYPE", function() { return 12; }); // for API compatibility
Copper.__defineGetter__("OPTION_CONTENT_FORMAT", function() { return 12; });
Copper.__defineGetter__("OPTION_MAX_AGE", function() { return 14; });
Copper.__defineGetter__("OPTION_URI_QUERY", function() { return 15; });
Copper.__defineGetter__("OPTION_ACCEPT", function() { return 17; });
Copper.__defineGetter__("OPTION_TOKEN", function() { return 19; }); // for API compatibility
Copper.__defineGetter__("OPTION_LOCATION_QUERY", function() { return 20; });
Copper.__defineGetter__("OPTION_PROXY_URI", function() { return 35; });
Copper.__defineGetter__("OPTION_PROXY_SCHEME", function() { return 39; });
Copper.__defineGetter__("OPTION_SIZE1", function() { return 60; });

Copper.__defineGetter__("OPTION_OBSERVE", function() { return 6; });

Copper.__defineGetter__("OPTION_BLOCK", function() { return 23; }); // for API compatibility
Copper.__defineGetter__("OPTION_BLOCK2", function() { return 23; });
Copper.__defineGetter__("OPTION_BLOCK1", function() { return 27; });
Copper.__defineGetter__("OPTION_SIZE", function() { return 28; }); // for API compatibility
Copper.__defineGetter__("OPTION_SIZE2", function() { return 28; });


Copper.__defineGetter__("CODE_2_01_CREATED", function() { return 65; });
Copper.__defineGetter__("CODE_2_02_DELETED", function() { return 66; });
Copper.__defineGetter__("CODE_2_03_VALID", function() { return 67; });
Copper.__defineGetter__("CODE_2_04_CHANGED", function() { return 68; });
Copper.__defineGetter__("CODE_2_05_CONTENT", function() { return 69; });
Copper.__defineGetter__("CODE_2_31_CONTINUE", function() { return 95; });

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

// CoAP draft-12 implementation
////////////////////////////////////////////////////////////////////////////////

Copper.CoapPacket = function() {
	// WARNING: Must be sorted by option number for serialization
	this.options = new Array();
	//                                       length, value as byte array
	this.options[Copper.OPTION_CONTENT_TYPE] = new Array(0, null);
	this.options[Copper.OPTION_MAX_AGE] = new Array(0, null);
	this.options[Copper.OPTION_PROXY_URI] = new Array(0, null);
	this.options[Copper.OPTION_PROXY_SCHEME] = new Array(0, null);
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
	this.options[Copper.OPTION_URI_QUERY] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK2] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK1] = new Array(0, null);
	this.options[Copper.OPTION_SIZE2] = new Array(0, null);
	this.options[Copper.OPTION_SIZE1] = new Array(0, null);
	this.options[Copper.OPTION_IF_NONE_MATCH] = new Array(0, null);

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
				case Copper.CODE_2_01_CREATED: return '2.01 Created';
				case Copper.CODE_2_02_DELETED: return '2.02 Deleted';
				case Copper.CODE_2_03_VALID: return '2.03 Valid';
				case Copper.CODE_2_04_CHANGED: return '2.04 Changed';
				case Copper.CODE_2_05_CONTENT: return '2.05 Content';
				case Copper.CODE_2_31_CONTINUE: return '2.31 Continue';
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
				case Copper.CODE_4_15_UNSUPPORTED_MEDIA_TYPE: return '4.15 Unsupported Content-Format';
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
	    	if (Array.isArray(this.options[optTypeIt][1])) {
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
		
		var opt = this.options[optType][1];
		
		// only set options are arrays
		if (!Array.isArray(opt)) {
			return null;
		}

		switch (parseInt(optType)) {
			// strings
			case Copper.OPTION_URI_HOST:
			case Copper.OPTION_URI_PATH:
			case Copper.OPTION_URI_QUERY:
			case Copper.OPTION_LOCATION_PATH:
			case Copper.OPTION_LOCATION_QUERY:
			case Copper.OPTION_PROXY_URI:
			case Copper.OPTION_PROXY_SCHEME:
				return Copper.bytes2str(opt);
				break;

			// integers
			case Copper.OPTION_URI_PORT:
			case Copper.OPTION_CONTENT_FORMAT:
			case Copper.OPTION_MAX_AGE:
			case Copper.OPTION_ACCEPT:
			case Copper.OPTION_IF_NONE_MATCH:
			case Copper.OPTION_OBSERVE:
			case Copper.OPTION_BLOCK2:
			case Copper.OPTION_BLOCK1:
			case Copper.OPTION_SIZE2:
			case Copper.OPTION_SIZE1:
				return Copper.bytes2int(opt);
			
			// byte arrays
			case Copper.OPTION_ETAG:
			case Copper.OPTION_TOKEN:
			case Copper.OPTION_IF_MATCH:
			default:
				return Copper.bytes2hex(opt);
				break;
			
		}
		return null;
	},
	
	setOption : function(option, value) {
		switch (parseInt(option)) {
			// strings
			case Copper.OPTION_PROXY_URI:
			case Copper.OPTION_PROXY_SCHEME:
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
			case Copper.OPTION_SIZE2:
			case Copper.OPTION_SIZE1:
			case Copper.OPTION_IF_NONE_MATCH:
				this.options[option][1] = Copper.int2bytes(value);
				this.options[option][0] = this.options[option][1].length;
				break;
			
			default:
				this.options[option] = new Array(value.length, value);
				dump('WARNING: Setting custom option '+option+': '+value+'\n');
		}
	},
	
	// for convenience and consistent API over the versions 
	setUri : function(inputUri) {
		
		var uri = document.createElementNS("http://www.w3.org/1999/xhtml","a");
/*
 * <a> tag as parser:
 * 
 *		parser.protocol; // => "http:"
 *		parser.hostname; // => "example.com"
 *		parser.port; // => "3000"
 *		parser.pathname; // => "/pathname/"
 *		parser.search; // => "?search=test"
 *		parser.hash; // => "#hash"
 *		parser.host; // => "example.com:3000"
 */
		uri.href = inputUri;
		//dump('PARSED:\n' + uri.protocol.slice(0, -1) + '\n' + uri.hostname + '\n' + uri.port + '\n' + uri.pathname + '\n' + uri.search + '\n');
		
		if (CopperChrome.behavior.sendUriHost && uri.hostname!='' && !uri.hostname.match(/[0-9a-f]{0,4}(:?:[0-9a-f]{0,4})+/)) {
			this.setOption(Copper.OPTION_URI_HOST, uri.hostname);
		}
		if (uri.pathname.length>1) {
			this.setOption(Copper.OPTION_URI_PATH, uri.pathname.substr(1));
		}
		if (uri.search.length>1) {
			this.setOption(Copper.OPTION_URI_QUERY, uri.search.substr(1));
		}
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
	    // first byte: version, type, and option count
		tempByte  = (0x03 & Copper.VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.type) << 4;
		tempByte |= (0x0F & this.options[Copper.OPTION_TOKEN][0]);
		
		byteArray.push(tempByte);
		
		// second byte: method or response code
	    byteArray.push(0xFF & this.code);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >>> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    for (var i=0; i<this.options[Copper.OPTION_TOKEN][0] && i<Copper.TOKEN_LENGTH; ++i) {
	    	byteArray.push(0xFF & this.options[Copper.OPTION_TOKEN][1][i]);
	    }
	    
	    // options
	    this.optionCount = 0;
	    var optNumber = 0;
	    for (var optTypeIt in this.options) {
	    	
	    	if (!Array.isArray(this.options[optTypeIt][1]) || optTypeIt==Copper.OPTION_TOKEN) {
				continue;
			} else {
				
				var splitOption = new Array();
				if (optTypeIt==Copper.OPTION_LOCATION_PATH ||
					optTypeIt==Copper.OPTION_LOCATION_QUERY ||
					optTypeIt==Copper.OPTION_URI_PATH ||
					optTypeIt==Copper.OPTION_URI_QUERY) {
	    			
	    			var separator = '/'; // 0x002F
	    			if (optTypeIt==Copper.OPTION_LOCATION_QUERY || optTypeIt==Copper.OPTION_URI_QUERY) {
	    				separator = '&'; // 0x0026
	    			}
				
	    			if (Copper.bytes2str(this.options[optTypeIt][1])!="") {
					var splitString = Copper.bytes2str(this.options[optTypeIt][1]).split(separator);
					for (var s in splitString) {
						//dump(splitString[s]+'\n');
						splitOption.push(Copper.str2bytes(splitString[s]));
					}
	    			}
				} else {
					splitOption.push(this.options[optTypeIt][1]);
				}
				
				while ((opt = splitOption.shift())) {
				
					var optDelta = optTypeIt - optNumber;
				
					var delta = this.optionNibble(optDelta);
					var len = this.optionNibble(opt.length);
					
					byteArray.push(0xFF & (delta<<4 | len));
					
					if (delta==13) {
						byteArray.push(optDelta-13);
					} else if (delta==14) {
						byteArray.push( (optDelta-269)>>>8 );
						byteArray.push( 0xFF & (optDelta-269) );
					}
					if (len==13) {
						byteArray.push(opt.length-13);
					} else if (len==14) {
						byteArray.push( (opt.length)>>>8 );
						byteArray.push( 0xFF & (opt.length-269) );
					}
					
					//dump('INFO: Serializing option '+optTypeIt+' (delta '+optDelta+', len '+opt.length+')\n');
			    	// add option value
					for(var i in opt) byteArray.push(opt[i]);
					
					this.optionCount++;

					optNumber = optTypeIt;
				}
			}
		}
	    
	    // option terminator
	    if (this.payload.length>0) {
			byteArray.push(0xFF);
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

        this.options[Copper.OPTION_TOKEN][0] = 0x0F & tempByte;
        if (this.options[Copper.OPTION_TOKEN][0]>0) this.options[Copper.OPTION_TOKEN][1] = new Array();
        
        this. code = packet.shift();

		// third and forth byte: transaction ID (TID)
        this.tid  = packet.shift() << 8;
        this.tid |= packet.shift();
		
		for (var i=0; i<this.options[Copper.OPTION_TOKEN][0]; ++i) {
			this.options[Copper.OPTION_TOKEN][1].push(packet.shift());
		}

        //read options
		var optType = 0;
		while ((tempByte = packet.shift())>0) {
			if (tempByte!=0xFF) {
				optDelta = ((0xF0 & tempByte) >>> 4);
		    	optLen = (0x0F & tempByte);
		    	
		    	if (optDelta==13) {
		    		optDelta += packet.shift();
				} else if (optDelta==14) {
					optDelta += 255;
					optDelta += packet.shift()<<8;
					optDelta += 0xFF & packet.shift();
				}
				if (optLen==13) {
					optLen += packet.shift();
				} else if (optLen==14) {
					optLen += 255;
					optLen += packet.shift()<<8;
					optLen += 0xFF & packet.shift();
				}
				
				optType += optDelta;
				
				//dump('INFO: Reading option '+optType+'\n');
				
				var opt = new Array(0);
		    	
			    for (var j=0; j<optLen; j++) {
			    	opt.push(packet.shift());
			    }
		    	
		    	// parse Option into Array
		    	
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
				
				this.options[optType] = new Array(optLen, opt);
		    	
			} else {
				this.payload = packet;
				break;
			}
		}
	    
	},
	
	optionNibble : function(value) {
		if (value<13) {
			return (0xFF & value);
		} else if (value<=0xFF+13) {
			return 13;
		} else if (value<=0xFFFF+269) {
			return 14;
		} else {
			throw 'ERROR: CoapPacket.serialize [Nibble value larger that 526345 is not supported]';
		}
	}
};
