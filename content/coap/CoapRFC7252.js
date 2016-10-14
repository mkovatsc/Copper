/*******************************************************************************
 * Copyright (c) 2015, Institute for Pervasive Computing, ETH Zurich.
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
 *******************************************************************************/
/**
 * \file   Implementation of RFC 7252
 *
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

// Constants
////////////////////////////////////////////////////////////////////////////////

Copper.__defineGetter__("VERSION", function() { return 1; });
Copper.__defineGetter__("DEFAULT_PORT", function() { return 5683; });
Copper.__defineGetter__("RESPONSE_TIMEOUT", function() { return 2000; }); // ms
Copper.__defineGetter__("RESPONSE_RANDOM_FACTOR", function() { return 1.5; }); // ms
Copper.__defineGetter__("MAX_RETRANSMIT", function() { return 4; });
Copper.__defineGetter__("ETAG_LENGTH", function() { return 8; });
Copper.__defineGetter__("TOKEN_LENGTH", function() { return 8; });

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
Copper.__defineGetter__("OPTION_CONTENT_FORMAT", function() { return 12; });
Copper.__defineGetter__("OPTION_MAX_AGE", function() { return 14; });
Copper.__defineGetter__("OPTION_URI_QUERY", function() { return 15; });
Copper.__defineGetter__("OPTION_ACCEPT", function() { return 17; });
Copper.__defineGetter__("OPTION_LOCATION_QUERY", function() { return 20; });
Copper.__defineGetter__("OPTION_PROXY_URI", function() { return 35; });
Copper.__defineGetter__("OPTION_PROXY_SCHEME", function() { return 39; });
Copper.__defineGetter__("OPTION_SIZE1", function() { return 60; });

Copper.__defineGetter__("OPTION_OBSERVE", function() { return 6; });

Copper.__defineGetter__("OPTION_BLOCK2", function() { return 23; });
Copper.__defineGetter__("OPTION_BLOCK1", function() { return 27; });
Copper.__defineGetter__("OPTION_SIZE2", function() { return 28; });

Copper.__defineGetter__("EMPTY", function() { return 0; });

Copper.__defineGetter__("GET", function() { return 1; });
Copper.__defineGetter__("POST", function() { return 2; });
Copper.__defineGetter__("PUT", function() { return 3; });
Copper.__defineGetter__("DELETE", function() { return 4; });

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
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_X_OBIX_BINARY", function() { return 51; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_CBOR", function() { return 60; }); // 04
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT", function() { return 1541; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV", function() { return 1542; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON", function() { return 1543; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE", function() { return 1544; });

Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_THING_DESCRIPTION_JSON", function() { return 65200; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_BULLETIN_BOARD_JSON", function() { return 65201; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_LIGHTING_CONFIG_JSON", function() { return 65202; });
Copper.__defineGetter__("CONTENT_TYPE_APPLICATION_LIGHTING_JSON", function() { return 65203; });

Copper.__defineGetter__("WELL_KNOWN_RESOURCES", function() { return '/.well-known/core'; });

//Registries
////////////////////////////////////////////////////////////////////////////////

Copper.getCodeName = function(code) {
	switch (parseInt(code)) {
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
	default: return Math.floor(code/32)+'.'+(code % 32)+' Unknown by Copper';
	}
};

Copper.getOptionName = function(number) {
	switch (parseInt(number)) {
	case Copper.OPTION_CONTENT_FORMAT: return 'Content-Format';
	case Copper.OPTION_MAX_AGE: return 'Max-Age';
	case Copper.OPTION_ACCEPT: return 'Accept';
	
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
	
	case Copper.OPTION_BLOCK2: return 'Block2';
	case Copper.OPTION_BLOCK1: return 'Block1';
	
	case Copper.OPTION_SIZE2: return 'Size2';
	case Copper.OPTION_SIZE1: return 'Size1';
	
	default: return 'Unknown '+number;
	}
};

Copper.getContentFormatName = function(type) {
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
	case Copper.CONTENT_TYPE_APPLICATION_CBOR: return 'application/cbor'; break;
	case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT: return 'application/vnd.oma.lwm2m+text'; break;
	case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV: return 'application/vnd.oma.lwm2m+tlv'; break;
	case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON: return 'application/vnd.oma.lwm2m+json'; break;
	case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE: return 'application/vnd.oma.lwm2m+opaque'; break;
	default: return 'unknown/unknown';
	}
};

// CoAP RFC 7252 implementation
////////////////////////////////////////////////////////////////////////////////

Copper.serialize = function(message) {
	let byteArray = new Array();
	let tempByte = 0x00;
	
    // first byte: version, type, and token length
	tempByte  = (0x03 & Copper.VERSION) << 6; // using const for sending packets
	tempByte |= (0x03 & message.type) << 4;
	tempByte |= (0x0F & message.token.length);
	
	byteArray.push(tempByte);
	
	// second byte: method or response code
    byteArray.push(0xFF & message.code);
    
    // third and forth byte: message ID (MID)
    byteArray.push(0xFF & (message.mid >>> 8));
    byteArray.push(0xFF & message.mid);
    
    for (let i in message.token) {
    	byteArray.push(0xFF & message.token[i]);
    }
    
    // options
    message.optionCount = 0;
    let optNumber = 0;
    
    for (let optTypeIt in message.options) {
    	
    	if (!Array.isArray(message.options[optTypeIt][1])) {
			continue;
		} else {
			
			Copper.logEvent("SERIALIZE: Option "+Copper.getOptionName(optTypeIt));
			
			let splitOption = new Array();
			if (optTypeIt==Copper.OPTION_LOCATION_PATH ||
				optTypeIt==Copper.OPTION_LOCATION_QUERY ||
				optTypeIt==Copper.OPTION_URI_PATH ||
				optTypeIt==Copper.OPTION_URI_QUERY) {
    			
    			let separator = '/'; // 0x002F
    			if (optTypeIt==Copper.OPTION_LOCATION_QUERY || optTypeIt==Copper.OPTION_URI_QUERY) {
    				separator = '&'; // 0x0026
    			}
			
    			if (Copper.bytes2str(message.options[optTypeIt][1])!="") {
					let splitString = Copper.bytes2str(message.options[optTypeIt][1]).split(separator);
					for (let s in splitString) {
						splitOption.push(Copper.str2bytes(splitString[s]));
					}
    			}
			} else {
				splitOption.push(message.options[optTypeIt][1]);
			}
			
			while ((opt = splitOption.shift())) {
			
				let optDelta = optTypeIt - optNumber;
			
				let delta = Copper.optionNibble(optDelta);
				let len = Copper.optionNibble(opt.length);
				
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
				
				// add option value
				for (let i in opt) byteArray.push(opt[i]);
				
				message.optionCount++;

				optNumber = optTypeIt;
			}
		}
	}
    
    // option terminator
    if (message.payload.length>0) {
		byteArray.push(0xFF);
    }
	
    // serialize as string
    let packet = Copper.bytes2data(byteArray);
    
    // payload
    packet += Copper.bytes2data(message.payload);
    
    // finished
    return packet;
};
	
Copper.parse = function(packet) {
	
	Copper.logEvent('PACKET (hex): ' + packet.map(function(x){return x.toString(16).toUpperCase();}));
	
	// first byte: version, type, and option count
	let tempByte = packet.shift();
	let tokenLength = parseInt(0x0F & tempByte);
	let version = 0xFF & ((tempByte & 0xC0) >>> 6);
	if (version != Copper.VERSION) {
		throw new Error('Cannot parse CoAP version '+version);
    }

	// create the message
	var message = new Copper.CoapMessage( 0x03 & ((tempByte) >>> 4), packet.shift() );
    
	// third and forth byte: message ID (MID)
    message.mid  = packet.shift() << 8;
    message.mid |= packet.shift();
	
    Copper.logEvent("PARSE: Token length = "+tokenLength);
	for (let i=0; i<tokenLength; ++i) {
		message.token.push(packet.shift());
	}
	Copper.logEvent("PARSE: Token = "+message.getToken());

    // read options
	let optNumber = 0;
	
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
			
			optNumber += optDelta;
			
			let opt = new Array(0);
	    	
		    for (let j=0; j<optLen; j++) {
		    	opt.push(packet.shift());
		    }
		    
			Copper.logEvent('PARSE: Option '+Copper.getOptionName(optNumber) + " = " + opt);
	    	
			// parse Option into Array
			if (optNumber==Copper.OPTION_LOCATION_PATH ||
    			optNumber==Copper.OPTION_LOCATION_QUERY ||
    			optNumber==Copper.OPTION_URI_PATH ||
    			optNumber==Copper.OPTION_URI_QUERY) {
    			
    			var separator = 0x002F; // /
    			if (optNumber==Copper.OPTION_LOCATION_QUERY || optNumber==Copper.OPTION_URI_QUERY) {
    				separator = 0x0026; // &
    			}
    			
    			if (message.options[optNumber][0]>0) {
    				optLen += 1 + message.options[optNumber][0];
    				opt = message.options[optNumber][1].concat(separator).concat(opt);
    			}
    		}
			
			message.options[optNumber] = new Array(optLen, opt);
	    	
		} else {
			message.payload = packet;
			break;
		}
	}
	
	return message;
};


//Protocol helper functions
////////////////////////////////////////////////////////////////////////////////
	
Copper.optionNibble = function(value) {
	if (value < 13) {
		return (0xFF & value);
	} else if (value <= 0xFF+13) {
		return 13;
	} else if (value <= 0xFFFF+269) {
		return 14;
	} else {
		throw new Error('Option delta/length larger than 65804 not allowed');
	}
};

Copper.isPowerOfTwo = function(i) {
	return ((i & (i-1))==0);
};

Copper.leadingZero = function(num, len) {
	if (!len) len = 2;
	num = ''+num;
	while (num.length<len) num = '0'+num;
	return num;
};

//for the string-oriented socket interface
Copper.bytes2data = function(b) {
	var str = '';
	for (let i in b) {
		str += String.fromCharCode(b[i] & 0xFF);
	}
	return str;
};

Copper.data2bytes = function(data) {
	var b = new Array(0);
	for (let i=0; i<data.length; i++) {
		b.push(0xFF & data.charCodeAt(i));
	}
	return b;
};

Copper.utf8 = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.copper.encode-utf-8');

Copper.str2bytes = function(str) {

	let b = new Array(0);
	
	if (str!=null) {
		for (let i=0; i<str.length; i++) {
			let c = str.charCodeAt(i);
			
			if (c < 128 || !Copper.utf8) {
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
	}
	
	return b;
};

Copper.bytes2str = function(b) {

	let str = '';
	var replaced = 0;
	for (let i=0; i<b.length; ++i) {
		
		let c = b[i] & 0xFF;
		
		if (c == 10 || (c >= 32 && c < 127)) {
			str += String.fromCharCode(c);
		} else if(Copper.utf8 && c >= 192 && c < 224 && (i+1 < b.length) && (b[i+1] & 0xc0) == 0x80) {
			let c1 = c & 0x1f;
			let c2 = b[i+1] & 0x3F;
			str += String.fromCharCode((c1 << 6) | c2);
			i += 1;
		} else if (Copper.utf8 && c >= 224 && c < 240 && (i+2 < b.length) && (b[i+1] & 0xc0) == 0x80 && (b[i+2] & 0xc0) == 0x80) {
			let c1 = c & 0x0f;
			let c2 = b[i+1] & 0x3F;
			let c3 = b[i+2] & 0x3F;
			str += String.fromCharCode((c1 << 12) | (c2 << 6) | c3);
			i += 2;
		} else if (Copper.utf8 && c >= 240 && i+3 < b.length) {
			// 4-byte UTF-8
			str += String.fromCharCode(0xFFFD); // char '�'
			replaced++;
			i += 3;
		} else if (Copper.utf8 && c >= 128) {
			// Incomplete UTF-8 encoding
			str += String.fromCharCode(0xFFFD); // char '�'
			replaced++;
		} else {
			if (c < 32) {
				str += String.fromCharCode(0x2400 + c); // replacement character block
			} else {
				str += String.fromCharCode(0xFFFD); // char '�'
				replaced++;
			}
//			str += "\\x" + (c < 16 ? "0" : "") + c.toString(16);
		}
	}
	if (replaced > 0) {
		Copper.logEvent('bytes2str: replaced ' + replaced + ' invalid characters');
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
	for (let k in b) {
		i = (i << 8) | b[k];
	}
	//convert to unsigned int
	return i>>>0;
};

Copper.hex2bytes = function(h) {
	var b = new Array();
	for (let i=h.length-2; i>0; i-=2) {
		b.unshift(parseInt(('0x'+h.substr(i,2)).replace(/xx/, 'x')));
	}
	return b;
};

Copper.bytes2hex = function(b) {
	
	if (!b || !Array.isArray(b) || b.length==0) {
		return 'empty';
	}
	
	var hex = '0x';
	for (let k in b) {
		if (b[k]!==undefined) {
			hex += Copper.leadingZero(b[k].toString(16).toUpperCase());
		} else {
			hex += '--';
		}
	}
	
	return hex;
};

Copper.str2hex = function(s) {
	var temp;
	if (s.substr(0,2)=='0x') {
		temp = Copper.hex2bytes(s);
	} else {
		temp = Copper.str2bytes(s);
	}
	
	return Copper.bytes2hex(temp);
};

Copper.float2bytes = function(value) {
    var bytes = 0;
    switch (value) {
        case Number.POSITIVE_INFINITY: bytes = 0x7F800000; break;
        case Number.NEGATIVE_INFINITY: bytes = 0xFF800000; break;
        case +0.0: bytes = 0x40000000; break;
        case -0.0: bytes = 0xC0000000; break;
        default:
            if (Number.isNaN(value)) { bytes = 0x7FC00000; break; }

            if (value <= -0.0) {
                bytes = 0x80000000;
                value = -value;
            }

            var exponent = Math.floor(Math.log(value) / Math.log(2));
            var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;

            exponent += 127;
            if (exponent >= 0xFF) {
                exponent = 0xFF;
                significand = 0;
            } else if (exponent < 0) exponent = 0;

            bytes = bytes | (exponent << 23);
            bytes = bytes | (significand & ~(-1 << 23));
        break;
    }
    return bytes;
};

Copper.double2bytes = function(value) {

	var hiWord = 0, loWord = 0;
	switch (value) {
	    case Number.POSITIVE_INFINITY: hiWord = 0x7FF00000; break;
	    case Number.NEGATIVE_INFINITY: hiWord = 0xFFF00000; break;
	    case +0.0: hiWord = 0x40000000; break;
	    case -0.0: hiWord = 0xC0000000; break;
	    default:
	        if (Number.isNaN(value)) { hiWord = 0x7FF80000; break; }
	
	        if (value <= -0.0) {
	            hiWord = 0x80000000;
	            value = -value;
	        }
	
	        var exponent = Math.floor(Math.log(value) / Math.log(2));
	        var significand = Math.floor((value / Math.pow(2, exponent)) * Math.pow(2, 52));
	
	        loWord = significand & 0xFFFFFFFF;
	        significand /= Math.pow(2, 32);
	
	        exponent += 1023;
	        if (exponent >= 0x7FF) {
	            exponent = 0x7FF;
	            significand = 0;
	        } else if (exponent < 0) exponent = 0;
	
	        hiWord = hiWord | (exponent << 20);
	        hiWord = hiWord | (significand & ~(-1 << 20));
	    break;
	}
	
	let bytes = new Array(0);

	bytes.unshift( loWord>>24 & 0xFF );
	bytes.unshift( loWord>>16 & 0xFF );
	bytes.unshift( loWord>>8 & 0xFF );
	bytes.unshift( loWord>>0 & 0xFF );
	bytes.unshift( hiWord>>24 & 0xFF );
	bytes.unshift( hiWord>>16 & 0xFF );
	bytes.unshift( hiWord>>8 & 0xFF );
	bytes.unshift( hiWord>>0 & 0xFF );
	
	return bytes;
};
