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
 *         Code handling Observing Resources
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

CopperChrome.ObserveEntry = function(uri, cb, token) {
	this.uri = uri;
	this.callback = cb;
	if (token!=null) {
		this.token = token;
	}
};
CopperChrome.ObserveEntry.prototype = {
	uri : null,
	callback: null,
	token : null
};

CopperChrome.Observing = function() {
	// maybe support multiple subscriptions via sidebar in the future
	//this.subscriptions = new Object();
};

CopperChrome.Observing.prototype = {
	
	pending : null,
	subscription : null,
	
	subscribe : function(uri, cb) {
		// check for existing subscriptions
		if (this.subscription) {
			this.unsubscribe();
			return;
		}
		
		dump('INFO: Subscribe ' + uri + '\n');
		
		this.pending = new CopperChrome.ObserveEntry(uri, cb);
		
		dump("PENDING: "+this.pending.uri + '\n');
		
		try {
			var subscribe = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, uri);
			subscribe.setObserve(0);
			subscribe.setToken(new Array(Math.random()*0x100, Math.random()*0x100));

			var that = this;
			CopperChrome.client.send(subscribe, CopperChrome.myBind(that, that.handle));
		} catch (ex) {
			alert('ERROR: Observing.subscribe ['+ex+']');
		}
	},

	unsubscribe : function(token) {
		if (this.subscription) {
			dump('INFO: Unsibscribing' + this.subscription.uri + '\n');
			CopperChrome.client.deRegisterToken(this.subscription.token);
			try {
				var rst = new CopperChrome.CoapMessage(Copper.MSG_TYPE_RST);
				rst.setToken(this.subscription.token);
				CopperChrome.client.send( rst );
			} catch (ex) {
				alert('ERROR: Observing.unsubscribe ['+ex+']');
			}
			this.subscription = null;
		}
		
		document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_observe.png';
		document.getElementById('toolbar_observe').label = 'Observe';
	},
	
	handle : function(message) {
		dump('INFO: Observing.handle()\n');

		
		if (this.pending) {
			// check if server supports observing this resource
			if (message.isOption(Copper.OPTION_OBSERVE)) {
				
				this.subscription = new CopperChrome.ObserveEntry(this.pending.uri, this.pending.callback, message.getTokenDefault());
				this.pending = null;
				
				var that = this;
				CopperChrome.client.registerToken(this.subscription.token, CopperChrome.myBind(that, that.handle));
				
				document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_unobserve.png';
				document.getElementById('toolbar_observe').label = 'Cancel ';

				this.subscription.callback(message);
				
			} else {
				this.pending = null;
				dump('WARNING: Observerving not supported by server\n');
				
				message.getCopperCode = function() { return 'Observerving not supported by server'; };
				
				// FIXME static call
				CopperChrome.defaultHandler(message);
			}
		} else if (this.subscription!=null) {
			this.subscription.callback(message);
		} else {
			throw 'Missing context for Observing.handle()';
		}
	}
};