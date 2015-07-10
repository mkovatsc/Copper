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
 * \file
 *         A wrapper for the different CoAP versions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

//create a request/ack, received responses use parse()
Copper.CoapMessage = function(type, code, uri, pl) {
	
	this.options = new Object();
	this.options[Copper.OPTION_CONTENT_FORMAT] = new Array(0, null);
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
	this.options[Copper.OPTION_ACCEPT] = new Array(0, null);
	this.options[Copper.OPTION_IF_MATCH] = new Array(0, null);
	this.options[Copper.OPTION_URI_QUERY] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK2] = new Array(0, null);
	this.options[Copper.OPTION_BLOCK1] = new Array(0, null);
	this.options[Copper.OPTION_SIZE2] = new Array(0, null);
	this.options[Copper.OPTION_SIZE1] = new Array(0, null);
	this.options[Copper.OPTION_IF_NONE_MATCH] = new Array(0, null);
	
	this.type = (type!==undefined) ? type : Copper.MSG_TYPE_CON;
	this.code = (code!==undefined) ? code : Copper.EMPTY;
	
	this.mid = -1;
	this.retries = 0;
	this.token = new Array(0);
	
	if (uri!==undefined) this.setUri( uri );
	if (pl!==undefined) {
		this.setPayload( pl );
	} else {
		this.payload = new Array(0);
	}
	
	return this;
};

Copper.CoapMessage.prototype = {
		
	version : Copper.VERSION,
	
	// message summary (e.g., for info/debug dumps)
	getSummary : function() {
		let ret = '';
		ret += ' Type: '+this.getType(true);
		ret += '\n Code: '+this.getCode(true);
		ret += '\n Message ID: '+this.getMID();
		ret += '\n Token: '+this.getToken();
		if (Object.keys(this.options).length > 0) {
			ret += '\n Options: '+this.getOptions(true);
		}
		if (this.getPayload().length > 0) {
			ret += '\n Payload: '+this.getPayload().length+' bytes';
			if (this.isPrintable(this.getContentFormat())) {
				ret += '\n'+Copper.bytes2str(this.getPayload());
			}
		}
		return ret;
	},
	
	// readable type
	getType : function(readable) {
		if (readable) {
			switch (parseInt(this.type)) {
				case Copper.MSG_TYPE_CON: return 'CON';
				case Copper.MSG_TYPE_NON: return 'NON';
				case Copper.MSG_TYPE_ACK: return 'ACK';
				case Copper.MSG_TYPE_RST: return 'RST';
				default: return 'unknown ('+this.type+')';
			}
		} else {
			return parseInt(this.type);
		}
	},
	setType : function(type) {
		this.type = type;
	},

	isConfirmable : function() {
		return this.type==Copper.MSG_TYPE_CON;
	},
	
	getOptionCount : function() {
		return this.optionCount;
	},
	
	getCode : function(readable) {
		if (readable) {
			return Copper.getCodeName(this.code);
		} else {
			return parseInt(this.code);
		}
	},
	setCode : function(code) {
		this.code = code;
	},
	
	isRequest: function() {
		return this.getCode()>=1 && this.getCode()<=31;
	},
	isResponse: function() {
		return this.getCode()>=64;
	},
	
	isSuccess: function() {
		return Math.floor(this.getCode() / 32) == 2;
	},
	isClientError: function() {
		return Math.floor(this.getCode() / 32) == 4;
	},
	isServerError: function() {
		return Math.floor(this.getCode() / 32) == 5;
	},
	
	getMID : function() {
		return this.mid;
	},
	setMID : function(id) {
		this.mid = id;
	},

	getToken : function() {
		// return token as string for easy use as object key
		return Copper.bytes2hex(this.token);
	},
	setToken : function(token) {
		if (!token) {
			token = new Array(0);
		} else if (token=='empty') {
			token = new Array(0);
		} else if (!Array.isArray(token)) {
			if (token.substr(0,2)=='0x') {
				token = Copper.hex2bytes(token);
			} else {
				token = Copper.str2bytes(token);
			}
		}
		
		while (token.length > Copper.TOKEN_LENGTH) {
			token.pop();
			Copper.logEvent('WARNING: Token must be 1-'+Copper.TOKEN_LENGTH+' bytes; cutting to '+Copper.TOKEN_LENGTH+' bytes]');
		}
		
		delete this.token;
		this.token = token;
	},
	
	// readable options list
	getOptions : function(asString) {
		
		if (asString) {
			let ret = '';

			for (let o in this.options) {
				
				if (Array.isArray(this.options[o][1])) {
					
					if (ret!='') ret += ', ';
					
					let name = Copper.getOptionName(o);
					let val = this.getOption(o);
					let info = this.options[o][0];
					
					switch (parseInt(o)) {
			    		case Copper.OPTION_BLOCK2:
			    			val = this.getBlock2Number();
			    			val += '/'+this.getBlock2More();
			    			val += '/'+this.getBlock2Size();
							break;
			    		case Copper.OPTION_BLOCK1:
			    			val = this.getBlock1Number();
			    			val += '/'+this.getBlock1More();
			    			val += '/'+this.getBlock1Size();
							break;
					}
					
					ret += name + ': ' + val;
				}
			}

			return ret;
		} else {
			let ret = new Array();
			
			for (let o in this.options) {
		    	if (Array.isArray(this.options[o][1])) {
		    		var name = Copper.getOptionName(o);
		    		var value = this.getOption(o);
		    		var info = this.options[o][0]+' byte' + (this.options[o][0]!=1 ? 's' : '');
		    		
		    		switch (parseInt(o)) {
			    		case Copper.OPTION_URI_PATH:
			    		case Copper.OPTION_LOCATION_PATH:
			    			value = '/' + value;
			    			break;
			    		case Copper.OPTION_CONTENT_FORMAT:
			    			info = value;
			    			value = Copper.getContentFormatName(value);
			    			break;
			    		case Copper.OPTION_ACCEPT:
			    			info = value;
			    			value = Copper.getContentFormatName(value);
			    			break;
			    		case Copper.OPTION_IF_NONE_MATCH:
			    			info = '';
			    			value = 'Set';
			    			break;
			    		case Copper.OPTION_BLOCK2:
			    			value = this.getBlock2Number();
			    			if (this.getBlock2More()) value += '+';
							value += ' ('+this.getBlock2Size()+' B/block)';
							break;
			    		case Copper.OPTION_BLOCK1:
			    			value = this.getBlock1Number();
			    			if (this.getBlock1More()) value += '+';
							value += ' ('+this.getBlock1Size()+' B/block)';
							break;
		    		}
		    		
		    		ret.push(new Array(name, value, info));
		    	}
			}
			
			return ret;
		}
	},
	// check if option is present
	isOption : function(optNumber) {
		if (this.options[optNumber]!==undefined && Array.isArray(this.options[optNumber][1])) {
			return true;
		} else {
			return false;
		}
	},
	// retrieve option
	getOptionLength : function(optNumber) {
		if (this.options[optNumber]!=null && this.options[optNumber][0]!=null) {
			return this.options[optNumber][0];
		} else {
			return -1;
		}
	},
	getOption : function(optNumber) {
		var opt = this.options[optNumber][1];
		
		// only set options are arrays
		if (!Array.isArray(opt)) {
			return null;
		}

		switch (parseInt(optNumber)) {
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
			case Copper.OPTION_IF_MATCH:
				return Copper.bytes2hex(opt);
			default:
				return Copper.bytes2hex(opt);
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
			case Copper.OPTION_CONTENT_FORMAT:
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
				Copper.logEvent("WARNING: Setting custom option '"+option+"': "+value);
		}
	},
	
	
	getContentFormat : function(readable) {
		var opt = this.getOption(Copper.OPTION_CONTENT_FORMAT); // integer

		if (opt==null) return null;
		
		if (readable) {
			return new Array(Copper.getContentFormatName(opt), opt);
		} else {
			return opt;
		}
	},
	setContentType : function(content) {
		if (content>0xFFFF) {
			Copper.logWarning('Ignoring Content-Format larger than 65535.');
		} else {
			this.setOption(Copper.OPTION_CONTENT_FORMAT, content);
		}
	},
	
	// Copper.OPTION_MAX_AGE:00+
	getMaxAge : function(readable) {
		var optLen = this.getOptionLength(Copper.OPTION_MAX_AGE);
		var opt = this.getOption(Copper.OPTION_MAX_AGE); // integer
		
		if (opt==null) return null;

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
			
			return new Array(ret.substring(0, ret.length-1), optLen+' byte(s)');
		} else {
			return opt;
		}
	},
	setMaxAge : function(age) {
		if (age>0xFFFFFFFF) {
			age = (0xFFFFFFFF & age);
			Copper.logWarning('Ignoring Max-Age larger than 2³²');
		}
		this.setOption(Copper.OPTION_MAX_AGE, age);
	},
	
	// Copper.OPTION_PROXY_URI:04+
	getProxyUri : function(readable) {
		return this.getOption(Copper.OPTION_PROXY_URI); // string
	},
	setProxyUri : function(proxy) {
		this.setOption(Copper.OPTION_PROXY_URI, proxy);
	},
	
	// Copper.OPTION_PROXY_URI:04+
	getProxyScheme : function(readable) {
		return this.getOption(Copper.OPTION_PROXY_SCHEME); // string
	},
	setProxyScheme : function(scheme) {
		this.setOption(Copper.OPTION_PROXY_SCHEME, scheme);
	},
	
	// Copper.OPTION_ETAG:00+
	getETag : function() {
		return this.getOption(Copper.OPTION_ETAG); // byte array
	},
	setETag : function(tag) {
		
		if (!Array.isArray(tag)) {
			Copper.logEvent('INFO: Converting ETag to byte array');
			if (tag.substr(0,2)=='0x') {
				tag = Copper.hex2bytes(tag);
			} else {
				tag = Copper.str2bytes(tag);
			}
		}
		
		if (tag.length>Copper.ETAG_LENGTH) {
			Copper.logWarning('Reducing ETag from '+tag.length+' to '+Copper.ETAG_LENGTH+' bytes.');
			tag = tag.slice(0, Copper.ETAG_LENGTH-1);
		}
		
		this.setOption(Copper.OPTION_ETAG, tag);
	},
	
	// Copper.OPTION_URI_HOST:04+ / Copper.OPTION_URI_AUTH:03*renamed
	getUriHost : function() {
		return this.getOption(Copper.OPTION_URI_HOST); // string
	},
	setUriHost : function(host) {
		this.setOption(Copper.OPTION_URI_HOST, host);
	},
	// Copper.OPTION_URI_PORT:04+
	getUriPort : function() {
		return this.getOption(Copper.OPTION_URI_PORT); // int
	},
	setUriPort : function(port) {
		this.setOption(Copper.OPTION_URI_PORT, port);
	},
	// multiple Copper.OPTION_URI_PATH:04+ / Copper.OPTION_URI_PATH:03+
	getUriPath : function() {
		// multiple Copper.OPTION_URI_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later

		return this.getOption(Copper.OPTION_URI_PATH); // string
	},
	// Copper.OPTION_URI_QUERY:03+
	getUriQuery : function() {
		return this.getOption(Copper.OPTION_URI_QUERY); // string
	},
	// convenience function
	getUri : function(readable) {
		
		let host = this.getUriHost();
		let port = this.getUriPort();
		let path = this.getUriPath();
		let query = this.getUriQuery();
		
		let uri = '';
		let decoded = 0;
		let multiple = null;
		
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
			multiple = path.match(/\//g);
			decoded += 1 + (multiple!=null ? multiple.length : 0);
		}
		if (query) {
			uri += '?' + query;
			multiple = query.match(/&/g);
			decoded += 1 + (multiple!=null ? multiple.length : 0);
		}

		if (decoded<=0) return null;
		
		if (readable) {
			return new Array('Uri', uri, decoded+(decoded==1 ? ' option' : ' options'));
		} else {
			return uri;
		}
	}, 
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
		
		if (uri.hostname!='' // set
			&& Copper.behavior.sendUriHost // enabled
			&& !uri.hostname.match(/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/) // no IPv4 literal
			&& !uri.hostname.match(/^[0-9a-f]{0,4}(:?:[0-9a-f]{1,4})+$/i)) { // no IPv6 literal
			this.setOption(Copper.OPTION_URI_HOST, uri.hostname);
		}
		if (uri.pathname.length>1) {
			this.setOption(Copper.OPTION_URI_PATH, decodeURI(uri.pathname.substr(1)));
		}
		if (uri.search.length>1) {
			this.setOption(Copper.OPTION_URI_QUERY, uri.search.substr(1));
		}
	},
	
	// multiple Copper.OPTION_LOCATION_PATH:04+ / Copper.OPTION_LOCATION:03*renamed
	getLocationPath : function() {
		// multiple Copper.OPTION_LOCATION_PATH options should be concatinated during datagram parsing
		// TODO: maybe use a string array later
		
		return this.getOption(Copper.OPTION_LOCATION_PATH); // string
	},
	setLocationPath : function(path) {
		while (path.charAt(0)=='/') path = path.substr(1);
		
		this.setOption(Copper.OPTION_LOCATION_PATH, path);
	},
	// Copper.OPTION_LOCATION_QUERY:05+
	getLocationQuery : function() {
		return this.getOption(Copper.OPTION_LOCATION_QUERY); // string
	},
	setLocationQuery : function(query) {
		while (query.charAt(0)=='?') query = query.substr(1);
		
		this.setOption(Copper.OPTION_LOCATION_QUERY, query);
	},
	// convenience function
	getLocation : function(readable) {
		var optLen = this.getOptionLength(Copper.OPTION_LOCATION_PATH);
		var opt = this.getOption(Copper.OPTION_LOCATION_PATH); // string
		
		var optLen2 = 0;
		
		if (this.getOptionLength(Copper.OPTION_LOCATION_QUERY)) {
			opt += '?' + this.getOption(Copper.OPTION_LOCATION_QUERY);
			optLen2 = this.getOptionLength(Copper.OPTION_LOCATION_QUERY);
		}
		
		if (optLen+optLen2<=0) return null;
		
		if (readable) {
			var multiple = opt.match(/\/|&/g);
			var decoded = 1 + (multiple!=null ? multiple.length : 0) + (optLen2>0 ? 1 : 0);
			if (opt.charAt(0)!='/') opt = '/' + opt;
			return new Array(opt, decoded+(decoded==1 ? ' option' : ' options'));
		} else {
			if (opt) opt = '/'+opt;
			return opt;
		}
	},
	
	// Copper.OPTION_ACCEPT:07+
	getAccept : function() {
		return this.getOption(Copper.OPTION_ACCEPT); // integer
	},
	setAccept : function(content) {
		if (content>0xFFFF) {
			Copper.logWarning('Ignoring Accept Content-Format larger than 65535.');
		} else {
			this.setOption(Copper.OPTION_ACCEPT, content);
		}
	},
	
	// Copper.OPTION_IF_MATCH:07+
	getIfMatch : function() {
		return this.getOption(Copper.OPTION_IF_MATCH); // byte array
	},
	setIfMatch : function(tag) {
		if (!Array.isArray(tag)) {
			Copper.logEvent('INFO: Converting ETag to byte array');
			if (tag.substr(0,2)=='0x') {
				tag = Copper.hex2bytes(tag);
			} else {
				tag = Copper.str2bytes(tag);
			}
		}
		
		while (tag.length>Copper.ETAG_LENGTH) {
			Copper.logWarning('Reducing ETag from '+tag.length+' to '+Copper.ETAG_LENGTH+' bytes.');
			tag = tag.slice(0, Copper.ETAG_LENGTH-1);
		}
		this.setOption(Copper.OPTION_IF_MATCH, tag);
	},
	
	// Copper.OPTION_BLOCK2:06+ / Copper.OPTION_BLOCK:03+
	getBlock2 : function(readable) {
		var opt = this.getOption(Copper.OPTION_BLOCK2); // integer

		if (opt==null) return null;
		
		if (readable) {
			var ret = this.getBlock2Number();
			if (this.getBlock2More()) ret += '+';
			ret += ' ('+this.getBlock2Size()+' B/block)';
			
			return ret;
		} else {
			return opt;
		}
	},
	setBlock2 : function(num, size, more) {
				
		if (size!==undefined) {
		
			let block = num << 4;
			
			let szx = 0;
			
			// check for power of two and correct size
			if (!Copper.isPowerOfTwo(size)) {
				Copper.logEvent('INFO: Block2 size '+size+' not a power of two; using next smaller power.');
			}
			if (size<16) {
				size = 16;
				Copper.logEvent('INFO: Block2 size must be >=16; using 16.');
			}
			if (size>1024) {
				size = 1024;
				Copper.logEvent('INFO: Block2 size must be <=1024; using 1024.');
			}
			
			// size encoding
			size >>= 4;
			for (szx = 0; size; ++szx) size >>= 1;
			block |= (szx - 1);
			
			if (more!==undefined) {
				block |= more ? 0x08 : 0x00;
			}
			
			this.setOption(Copper.OPTION_BLOCK2, block);
			
		} else {
			this.setOption(Copper.OPTION_BLOCK2, num);
		}
	},
	// convenience functions for block option parts
	getBlock2Number : function() {
		return (this.getBlock2() >> 4);
	},
	getBlock2Size : function() {
		return (16 << (0x07 & this.getBlock2()));
	},
	getBlock2More : function() {
		return (parseInt(0x08 & this.getBlock2())!=0) ? 1 : 0;
	},
	getBlock2Offset : function() {
		return this.getBlock2Size() * (this.getBlock2Number() + 1);
	},
	
	// Copper.OPTION_BLOCK1:06+
	getBlock1 : function(readable) {
		var opt = this.getOption(Copper.OPTION_BLOCK1); // integer

		if (opt==null) return null;
		
		if (readable) {
			var ret = this.getBlock1Number();
			if (this.getBlock1More()) ret += '+';
			ret += ' ('+this.getBlock1Size()+' B/block)';
			
			return ret;
		} else {
			return opt;
		}
	},
	setBlock1 : function(num, size, more) {
		let block = num << 4;
		let szx = 0;
		
		// check for power of two and correct size
		if (!Copper.isPowerOfTwo(size)) {
			Copper.logEvent('INFO: Block1 size '+size+' not a power of two; using next smaller power.');
		}
		if (size<16) {
			size = 16;
			Copper.logEvent('INFO: Block1 size must be >=16; using 16.');
		}
		if (size>1024) {
			size = 1024;
			Copper.logEvent('INFO: Block1 size must be <=1024; using 1024.');
		}
		
		size >>= 4;
		for (szx = 0; size; ++szx) size >>= 1;
		block |= szx - 1;
		if (more) {
			block |= 0x08;
		}
		
		this.setOption(Copper.OPTION_BLOCK1, block);
	},
	// convenience functions for block option parts
	getBlock1Number : function() {
		return (this.getBlock1() >> 4);
	},
	getBlock1Size : function() {
		return (16 << (0x07 & this.getBlock1()));
	},
	getBlock1More : function() {
		return (0x08 & this.getBlock1()) ? 1 : 0;
	},
	getBlock1Offset : function() {
		return this.getBlock1Size() * (this.getBlock1Number() + 1);
	},

	// Copper.OPTION_SIZE2:18+ / Copper.OPTION_SIZE:09+
	getSize : function() {
		return this.getOption(Copper.OPTION_SIZE2); // integer
	},
	setSize2 : function(num) {
		if (num>0xFFFFFFFF) {
			Copper.logWarning('Ignoring Size2 larger than 2³²');
		} else {
			this.setOption(Copper.OPTION_SIZE2, num);
		}
	},
	// Copper.OPTION_SIZE1:18+
	getSize1 : function() {
		return this.getOption(Copper.OPTION_SIZE1); // integer
	},
	setSize1 : function(num) {
		if (num>0xFFFFFFFF) {
			Copper.logWarning('Ignoring Size1 larger than 2³²');
		} else {
			this.setOption(Copper.OPTION_SIZE1, num);
		}
	},
	
	// Copper.OPTION_IF_NONE_MATCH:07+
	getIfNoneMatch : function() {
		var opt = this.getOption(Copper.OPTION_IF_NONE_MATCH); // byte array

		return (opt==null ? null : 'none');
	},
	setIfNoneMatch : function() {
		// only set option with length 0 (int=0)
		this.setOption(Copper.OPTION_IF_NONE_MATCH, 0);
	},

	// Copper.OPTION_SUB_LIFETIME:draft-ietf-core-observe-00*renamed
	getObserve : function() {
		return this.getOption(Copper.OPTION_OBSERVE); // int
	},
	setObserve : function(num) {
		if (num> 0xFFFFFF) num = num % 0xFFFFFF;
		this.setOption(Copper.OPTION_OBSERVE, num);
	},
	
	setCustom : function(num, value) {
		if (Copper.getOptionName(num).match(/^Unknown/)) {
			if (value.substr(0,2)=='0x') {
				this.setOption(parseInt(num), Copper.hex2bytes(value));
			} else {
				this.setOption(parseInt(num), Copper.str2bytes(value));
			}
		} else {
			throw new Error('Cannot set '+Copper.getOptionName(num)+' as custom option');
		}
	},
	
	// payload functions
	getPayload : function() {
		return this.payload;
	},
	getPayloadText : function() {
		return Copper.bytes2str(this.payload);
	},
	setPayload : function(pl) {
		if (!Array.isArray(pl)) pl = Copper.str2bytes(pl);
		this.payload = pl;
	},
	appendPayload : function(pl) {
		this.payload = this.payload.concat(pl);
	},
	isPrintable : function(ct) {
		if (ct==null) ct = this.getContentFormat();
		
		switch (ct) {
			case Copper.CONTENT_TYPE_TEXT_PLAIN:
			case Copper.CONTENT_TYPE_TEXT_XML:
			case Copper.CONTENT_TYPE_TEXT_CSV:
			case Copper.CONTENT_TYPE_TEXT_HTML:
			case Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT:
			case Copper.CONTENT_TYPE_APPLICATION_XML:
			case Copper.CONTENT_TYPE_APPLICATION_RDF_XML:
			case Copper.CONTENT_TYPE_APPLICATION_SOAP_XML:
			case Copper.CONTENT_TYPE_APPLICATION_ATOM_XML:
			case Copper.CONTENT_TYPE_APPLICATION_XMPP_XML:
			case Copper.CONTENT_TYPE_APPLICATION_JSON:
			case Copper.CONTENT_TYPE_APPLICATION_CBOR:
			case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT:
			case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON:
			case null:
				return true;
				
			case Copper.CONTENT_TYPE_IMAGE_GIF:
			case Copper.CONTENT_TYPE_IMAGE_JPEG:
			case Copper.CONTENT_TYPE_IMAGE_PNG:
			case Copper.CONTENT_TYPE_IMAGE_TIFF:
			case Copper.CONTENT_TYPE_AUDIO_RAW:
			case Copper.CONTENT_TYPE_VIDEO_RAW:
			case Copper.CONTENT_TYPE_APPLICATION_OCTET_STREAM:
			case Copper.CONTENT_TYPE_APPLICATION_EXI:
			case Copper.CONTENT_TYPE_APPLICATION_FASTINFOSET:
			case Copper.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET:
			case Copper.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY:
			case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV:
			case Copper.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE:
			default:
				return false;
		}
	},
	
	
	// convert message into datagram bytes
	serialize : function() {
		return Copper.serialize();
	},
	
	// convert datagram bytes into message
	parse : function(datagram) {
		this.parse(datagram);
	},
	
	getRetries : function() {
		return this.retries;
	},
	
	incRetries : function() {
		++this.retries;
	},
	
	// maybe more arguments needed 
	respond : function(code, payload, format) {
		this.reply = new CoapMessage(Copper.MSG_TYPE_ACK, code, null, payload);
		this.reply.setMID(this.getMID());
		this.reply.setToken(this.getToken());
		
		if (format) this.reply.setContentType(format);
	},
	
	getReply : function() {
		return this.reply;
	}
};
