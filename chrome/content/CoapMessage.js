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
 *         A wrapper for the different CoAP versions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

/*
 * Constants that must be present in all CoAP version modules
 * 
 * GET, POST, DELETE, SUBSCRIBE
 * WELL_KNOWN_RESOURCES
 * RESPONSE_TIMEOUT, MAX_RETRANSMIT
 */

//create a request/ack, received responses use parse()
CopperChrome.CoapMessage = function(type, code, uri, pl) {
	this.packet = new Copper.CoapPacket();
	
	this.packet.type = type;
	this.packet.code = code ? code : 0;
	
	// URI
	if (uri!=null) {
		this.setUri(uri);
	}
	// payload
	if (pl!=null) {
		this.setPayload(pl);
	}
};

CopperChrome.CoapMessage.prototype = {
	packet : null,
	
	// message summary (e.g., for info/debug dumps)
	getSummary : function() {
		var ret = '';
		ret += ' Type: '+this.getType(true);
		ret += '\n Code: '+this.getCode(true);
		ret += '\n Transaction ID: '+this.getTID();
		ret += '\n Options:'+this.getOptions(true);
		ret += '\n Payload:\n'+this.getPayload();
		return ret;
	},
	
	// readable type
	getType : function(readable) {
		if (readable) {
			switch (parseInt(this.packet.type)) {
				case Copper.MSG_TYPE_CON: return 'Confirmable';
				case Copper.MSG_TYPE_NON: return 'Non-Confirmable';
				case Copper.MSG_TYPE_ACK: return 'Acknowledgment';
				case Copper.MSG_TYPE_RST: return 'Reset';
				default: return 'unknown ('+this.packet.type+')';
			}
		} else {
			return parseInt(this.packet.type);
		}
	},

	isConfirmable : function() {
		return this.packet.type==Copper.MSG_TYPE_CON;
	},
	
	getOptionCount : function() {
		return this.packet.optionCount;
	},
	
	// readable method or response code
	getCode : function(readable) {
		// codes are version specific
		return this.packet.getCode(readable);
	},
	setCode : function(code) {
		this.packet.code = code;
	},
	
	getTID : function() {
		return this.packet.tid;
	},
	setTID : function(id) {
		this.packet.tid = id;
	},
	
	
	/*
	 * Option definitions for different versions
	 * 
	draft-05                            draft-03                            draft-00
	const Copper.OPTION_CONTENT_TYPE = 1;		const Copper.OPTION_CONTENT_TYPE = 1;		const Copper.OPTION_CONTENT_TYPE = 0;
										MUST be supported, once
										
	const Copper.OPTION_MAX_AGE = 2;			const Copper.OPTION_MAX_AGE = 2;			const Copper.OPTION_MAX_AGE = 3;
										once
										
	const Copper.OPTION_PROXY_URI = 3;			
	
	const Copper.OPTION_ETAG = 4;				const Copper.OPTION_ETAG = 4;				const Copper.OPTION_ETAG = 4;
										SHOULD be included for cache refresh, multiple
										
	const Copper.OPTION_URI_HOST = 5;			const Copper.OPTION_URI_AUTH = 5;			const Copper.OPTION_URI = 1;
										MUST be supported by proxy
										SHOULD be included if known, once
										
	const Copper.OPTION_LOCATION_PATH = 6;		const Copper.OPTION_LOCATION = 6;
										MAY be included for 30x response, once
										
	const Copper.OPTION_URI_PORT = 7;
	
	const Copper.OPTION_LOCATION_QUERY = 8;
	
	const Copper.OPTION_URI_PATH = 9;			const Copper.OPTION_URI_PATH = 9;			const Copper.OPTION_URI = 1;
										MUST be supported, once
										
	const Copper.OPTION_OBSERVE = 10;			const Copper.OPTION_SUB_LIFETIME = 10;		const Copper.OPTION_SUB_LIFETIME = 6;
	
	const Copper.OPTION_TOKEN = 11;			const Copper.OPTION_TOKEN = 11;
										MUST be included for delayed response (SHOULD omit Uri), once
										If delayed and no option in req, return 240
										
	const Copper.OPTION_BLOCK = 13;			const Copper.OPTION_BLOCK = 13;
	
	const Copper.OPTION_NOOP = 14;				const Copper.OPTION_NOOP = 14;
	
	const Copper.OPTION_URI_QUERY = 15;		const Copper.OPTION_URI_QUERY = 15;		const Copper.OPTION_URI = 1;
										MUST be supported, once
																			const Copper.OPTION_URI_CODE = 2;
																			const Copper.OPTION_DATE = 5;
	*/
	
	// Copper.OPTION_CONTENT_TYPE:00+
	getContentType : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_CONTENT_TYPE);
		var opt = this.packet.getOption(Copper.OPTION_CONTENT_TYPE); // integer

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Content-Type', Copper.getContentTypeName(opt), opt);
		} else {
			return opt;
		}
	},
	setContentType : function(content) {
		if (content>0xFF) {
			dump('WARNING: CoapMessage.setContentType [must be 1 byte; ignoring]\n');
		} else {
			this.packet.setOption(Copper.OPTION_CONTENT_TYPE, content);
		}
	},
	
	// Copper.OPTION_MAX_AGE:00+
	getMaxAge : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_MAX_AGE);
		var opt = this.packet.getOption(Copper.OPTION_MAX_AGE); // integer
		
		if (optLen<=0) return null;

		if (readable) {
			
			var ret = '';
			var time = opt;
			
			if (time==0) {
				ret += '0 ';
			} else {
				// split into weeks, days, hours, minutes, and seconds
				var s = time % 60;
				time = Math.floor(time/60);
				var m = time % 60;
				time = Math.floor(time/60);
				var h = time % 24;
				time = Math.floor(time/24);
				var d = time % 7;
				time = Math.floor(time/7);
				var w = time;
				
				var y = 0;
				if (w>104) var y = Math.round(1212424351/60.0/60.0/24.0/365.25*100.0)/100.0;
				
				// only print from largest to smallest given unit
				if (w) ret += w+'w ';
				if (d||(w&&(h||m||s))) ret += d+'d ';
				if (h||((w||d)&&(m||s))) ret += h+'h ';
				if (m||((w||d||h)&&s)) ret += m+'m ';
				if (s) ret += s+'s ';
				if (y) ret += '(~'+y+'y) ';
			}
			
			return new Array('Max-Age', ret.substring(0, ret.length-1), optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setMaxAge : function(age) {
		if (age>0xFFFFFFFF) {
			age = (0xFFFFFFFF & age);
			dump('WARNING: CoapMessage.setMaxAge [max-age must be 1-4 bytes; masking to 4 bytes]\n');
		}
		this.packet.setOption(Copper.OPTION_MAX_AGE, age);
	},
	
	// Copper.OPTION_PROXY_URI:04+
	getProxyUri : function(readable) {
		
		if (CopperChrome.coapVersion < 4) {
			return null;
		}

		var optLen = this.packet.getOptionLength(Copper.OPTION_PROXY_URI);
		var opt = this.packet.getOption(Copper.OPTION_PROXY_URI); // string

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Proxy-Uri', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setProxyUri : function(proxy) {
		
		if (CopperChrome.coapVersion < 4) {
			dump('WARNING: CoapMessage.setProxyUri [Proxy-Uri only supported in coap-04+]\n');
			return;
		}
		
		this.packet.setOption(Copper.OPTION_PROXY_URI, proxy);
	},
	
	// Copper.OPTION_ETAG:00+
	getETag : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_ETAG);
		var opt = this.packet.getOption(Copper.OPTION_ETAG); // byte array

		if (optLen<=0) return null;

		if (readable) {
			return new Array('ETag', Copper.bytes2hex(opt), optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setETag : function(tag) {
		while (tag.length>Copper.ETAG_LENGTH) {
			tag.pop();
			dump('WARNING: CoapMessage.setETag [ETag must be 1-'+Copper.ETAG_LENGTH+' bytes; cropping to '+Copper.ETAG_LENGTH+' bytes]\n');
		}
		this.packet.setOption(Copper.OPTION_ETAG, tag);
	},
	
	// Copper.OPTION_URI_HOST:04+ / Copper.OPTION_URI_AUTH:03*renamed
	getUriHost : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_URI_HOST);
		var opt = this.packet.getOption(Copper.OPTION_URI_HOST); // string
		
		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Uri-Host', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setUriHost : function(host) {
		this.packet.setOption(Copper.OPTION_URI_HOST, host);
	},
	// Copper.OPTION_URI_PORT:04+
	getUriPort : function(readable) {
		
		if (CopperChrome.coapVersion < 4) {
			return null;
		}

		var optLen = this.packet.getOptionLength(Copper.OPTION_URI_PORT);
		var opt = this.packet.getOption(Copper.OPTION_URI_PORT); // int

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Uri-Port', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setUriPort : function(port) {
		
		if (CopperChrome.coapVersion < 4) {
			dump('WARNING: CoapMessage.setUriPort [Uri-Port only supported in coap-04+]\n');
			return;
		}
		
		this.packet.setOption(Copper.OPTION_URI_PORT, port);
	},
	// multiple Copper.OPTION_URI_PATH:04+ / Copper.OPTION_URI_PATH:03+
	getUriPath : function(readable) {
		// multiple Copper.OPTION_URI_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later

		var optLen = this.packet.getOptionLength(Copper.OPTION_URI_PATH);
		var opt = this.packet.getOption(Copper.OPTION_URI_PATH); // string

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Uri-Path', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	// Copper.OPTION_URI_QUERY:03+
	getUriQuery : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_URI_QUERY);
		var opt = this.packet.getOption(Copper.OPTION_URI_QUERY); // string

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Uri-Query', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	// convenience function
	getUri : function(readable) {
		
		var host = this.getUriHost();
		var port = this.getUriPort();
		var path = this.getUriPath();
		var query = this.getUriQuery();
		
		var uri = '';
		var decoded = 0;
		if (host) {
			uri += 'coap://' + host;
			++decoded;
		}
		if (port) {
			uri += ':' + port;
			++decoded;
		}
		if (path) {
			uri += '/' + path;
			++decoded;
		}
		if (query) {
			uri += '?' + query;
			++decoded;
		}

		if (decoded<=0) return null;
		
		if (readable) {
			return new Array('Uri', uri, decoded+(decoded==1 ? ' option' : ' options'));
		} else {
			return uri;
		}
	},
	setUri : function(uri) {
		// URI encoding is version specific
		this.packet.setUri(uri);
	},
	
	// multiple Copper.OPTION_LOCATION_PATH:04+ / Copper.OPTION_LOCATION:03*renamed
	getLocationPath : function(readable) {
		// multiple Copper.OPTION_LOCATION_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later
		
		var optLen = this.packet.getOptionLength(Copper.OPTION_LOCATION_PATH);
		var opt = this.packet.getOption(Copper.OPTION_LOCATION_PATH); // string

		if (optLen<=0) return null;
		
		if (readable) {
			if (opt.charAt(0)!='/') opt = '/' + opt;
			return new Array('Location-Path', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setLocationPath : function(path) {
		while (path.charAt(0)=='/') path = path.substr(1);
		
		this.packet.setOption(Copper.OPTION_LOCATION_PATH, path);
	},
	// Copper.OPTION_LOCATION_QUERY:05+
	getLocationQuery : function(readable) {
		
		if (CopperChrome.coapVersion < 5) {
			return null;
		}

		var optLen = this.packet.getOptionLength(Copper.OPTION_LOCATION_QUERY);
		var opt = this.packet.getOption(Copper.OPTION_LOCATION_QUERY); // string

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Location-Query', opt, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setLocationQuery : function(query) {
		
		if (CopperChrome.coapVersion < 5) {
			dump('WARNING: CoapMessage.setLocationQuery [Location-Query only supported in coap-05+]\n');
			return;
		}
		
		while (query.charAt(0)=='?') query = query.substr(1);
		
		this.packet.setOption(Copper.OPTION_LOCATION_QUERY, query);
	},
	// convenience function
	getLocation : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_LOCATION_PATH);
		var opt = this.packet.getOption(Copper.OPTION_LOCATION_PATH); // string
		
		var opt2 = null;
		var optLen2 = 0;

		if (CopperChrome.coapVersion >= 5) {
			if (this.packet.getOptionLength(Copper.OPTION_LOCATION_QUERY)) {
				opt += '?' + this.packet.getOption(Copper.OPTION_LOCATION_QUERY);
				optLen2 = this.packet.getOptionLength(Copper.OPTION_LOCATION_QUERY);
			}
		}
		
		if (optLen+optLen2<=0) return null;
		
		if (readable) {
			if (opt.charAt(0)!='/') opt = '/' + opt;
			return new Array('Location', opt, optLen2>0 ? '2 options' : '1 option');
		} else {
			return opt;
		}
	},
	
	// Copper.OPTION_TOKEN:03+
	getToken : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_TOKEN);
		var opt = this.packet.getOption(Copper.OPTION_TOKEN); // byte array, treat as int
		
		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Token', Copper.bytes2hex(opt), optLen+' byte(s)'); 
		} else {
			return opt;
		}
	},
	setToken : function(token) {
		while (token.length > Copper.TOKEN_LENGTH) {
			token.pop();
			dump('WARNING: CoapMessage.setToken [token must be 1-'+Copper.TOKEN_LENGTH+' bytes; masking to '+Copper.TOKEN_LENGTH+' bytes]\n');
		}
		this.packet.setOption(Copper.OPTION_TOKEN, token);
	},
	getTokenDefault : function() {
		var token = this.getToken();
		if (token!=null) {
			return token;
		} else {
			return new Array([0]);
		}
	},
	
	// Copper.OPTION_BLOCK2:06+ / Copper.OPTION_BLOCK:03+
	getBlock : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_BLOCK); // == Copper.OPTION_BLOCK2
		var opt = this.packet.getOption(Copper.OPTION_BLOCK); // integer

		if (optLen<=0) return null;
		
		if (readable) {
			var ret = this.getBlockNumber();
			if (this.getBlockMore()) ret += '+';
			ret += ' ('+this.getBlockSize()+' B/block)';
			
			var name = CopperChrome.coapVersion < 6 ? 'Block' : 'Block2';
			
			return new Array(name, ret, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setBlock : function(num, size) {
		var block = num << 4;
		var szx = 0;
		
		// check for power of two and correct size
		if (!Copper.isPowerOfTwo(size)) {
			dump('WARNING: CoapMessage.setBlock ['+size+' not a power of two; using next smaller power]\n');
		}
		if (size<16) {
			size = 16;
			dump('WARNING: CoapMessage.setBlock [block size must be >=16; using 16]\n');
		}
		if (size>1024) {
			size = 1024;
			dump('WARNING: CoapMessage.setBlock [block size must be <=1024; using 1024]\n');
		}
		
		size >>= 4;
		for (szx = 0; size; ++szx) size >>= 1;
		block |= szx - 1;
		
		this.packet.setOption(Copper.OPTION_BLOCK, block);
	},
	// convenience functions for block option parts
	getBlockNumber : function() {
		return (this.getBlock() >> 4);
	},
	getBlockSize : function() {
		return (16 << (0x07 & this.getBlock()));
	},
	getBlockMore : function() {
		return (0x08 & this.getBlock());
	},
	
	// Copper.OPTION_BLOCK1:06+
	getBlock1 : function(readable) {
		
		if (CopperChrome.coapVersion < 6) {
			return null;
		}
		
		var optLen = this.packet.getOptionLength(Copper.OPTION_BLOCK1);
		var opt = this.packet.getOption(Copper.OPTION_BLOCK1); // integer

		if (optLen<=0) return null;
		
		if (readable) {
			var ret = this.getBlock1Number();
			if (this.getBlock1More()) ret += '+';
			ret += ' ('+this.getBlock1Size()+' B/block)';
			return new Array('Block1', ret, optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setBlock1 : function(num, size) {
		
		if (CopperChrome.coapVersion < 6) {
			dump('WARNING: CoapMessage.setBlock1 [Block1 only supported in coap-06+]\n');
			return;
		}
		
		var block = num << 4;
		var szx = 0;
		
		// check for power of two and correct size
		if (!Copper.isPowerOfTwo(size)) {
			dump('WARNING: CoapMessage.setBlock1 ['+size+' not a power of two; using next smaller power]\n');
		}
		if (size<16) {
			size = 16;
			dump('WARNING: CoapMessage.setBlock1 [block size must be >=16; using 16]\n');
		}
		if (size>1024) {
			size = 1024;
			dump('WARNING: CoapMessage.setBlock1 [block size must be <=1024; using 1024]\n');
		}
		
		size >>= 4;
		for (szx = 0; size; ++szx) size >>= 1;
		block |= szx - 1;
		
		this.packet.setOption(Copper.OPTION_BLOCK1, block);
	},
	// convenience functions for block option parts
	getBlock1Number : function() {
		return (this.getBlock1() >> 4);
	},
	getBlock1Size : function() {
		return (16 << (0x07 & this.getBlock1()));
	},
	getBlock1More : function() {
		return (0x08 & this.getBlock1());
	},

	// Copper.OPTION_SUB_LIFETIME:draft-ietf-core-observe-00*renamed
	getObserve : function(readable) {
		var optLen = this.packet.getOptionLength(Copper.OPTION_OBSERVE);
		var opt = this.packet.getOption(Copper.OPTION_OBSERVE); // int

		if (optLen<=0) return null;
		
		if (readable) {
			return new Array('Observe', opt, optLen+' byte(s)'); 
		} else {
			return opt;
		}
	},
	setObserve : function(num) {
		if (num> 0xFFFFFFFF) time = 0xFFFFFFFF;
		this.packet.setOption(Copper.OPTION_OBSERVE, num);
	},
	
	// readable options list
	getOptions : function(readable) {
		
		if (readable) {
			var ret = '';
	
			if (this.getContentType()!=null) ret += '\n  ' + this.getContentType(true)[0] + ': ' + this.getContentType(true)[1] + ' ['+this.getContentType(true)[2]+']';
			if (this.getMaxAge()!=null) ret += '\n  ' + this.getMaxAge(true)[0] + ': ' + this.getMaxAge(true)[1] + ' ['+this.getMaxAge(true)[2]+']';
			if (this.getProxyUri()!=null) ret += '\n  ' + this.getProxyUri(true)[0] + ': ' + this.getProxyUri(true)[1] + ' ['+this.getProxyUri(true)[2]+']';
			if (this.getETag()!=null) ret += '\n  ' + this.getETag(true)[0] + ': ' + this.getETag(true)[1] + ' ['+this.getETag(true)[2]+']';
			if (this.getUri()!=null) ret += '\n  ' + this.getUri(true)[0] + ': ' + this.getUri(true)[1] + ' ['+this.getUri(true)[2]+']';
			if (this.getLocation()!=null) ret += '\n  ' + this.getLocation(true)[0] + ': ' + this.getLocation(true)[1] + ' ['+this.getLocation(true)[2]+']';
			if (this.getObserve()!=null) ret += '\n  ' + this.getObserve(true)[0] + ': ' + this.getObserve(true)[1] + ' ['+this.getObserve(true)[2]+']';
			if (this.getToken()!=null) ret += '\n  ' + this.getToken(true)[0] + ': ' + this.getToken(true)[1] + ' ['+this.getToken(true)[2]+']';
			if (this.getBlock()!=null) ret += '\n  ' + this.getBlock(true)[0] + ': ' + this.getBlock(true)[1] + ' ['+this.getBlock(true)[2]+']';
			if (this.getBlock1()!=null) ret += '\n  ' + this.getBlock1(true)[0] + ': ' + this.getBlock1(true)[1] + ' ['+this.getBlock1(true)[2]+']';
			
			return ret;
		} else {
			var ret = new Array();
			
			if (this.getContentType()!=null) ret.push(this.getContentType(true));
			if (this.getMaxAge()!=null) ret.push( this.getMaxAge(true) );
			if (this.getProxyUri()!=null) ret.push( this.getProxyUri(true) );
			if (this.getETag()!=null) ret.push( this.getETag(true) );
			if (this.getUri()!=null) ret.push( this.getUri(true) );
			if (this.getLocation()!=null) ret.push( this.getLocation(true) );
			if (this.getObserve()!=null) ret.push( this.getObserve(true) );
			if (this.getToken()!=null) ret.push( this.getToken(true) );
			if (this.getBlock()!=null) ret.push( this.getBlock(true) );
			if (this.getBlock1()!=null) ret.push( this.getBlock1(true) );
			
			return ret;
		}
	},
	
	// check if option is present
	isOption : function(optType) {
		var list = this.packet.getOptions();
		for (var i in list) {
			if (list[i]==optType) return true;
		}
		return false;
	},
	
	
	// payload functions
	getPayload : function() {
		return this.packet.payload;
	},
	setPayload : function(pl) {
		this.packet.payload = pl;
	},
	
	
	// convert message into datagram bytes
	serialize : function() {
		return this.packet.serialize();
	},
	
	// convert datagram bytes into message
	parse : function(datagram) {
		this.packet.parse(datagram);
	}
};
