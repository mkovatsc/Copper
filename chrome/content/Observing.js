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

function ObserveEntry(uri, cb) {
	this.uri = uri;
	this.callback = cb;
}
ObserveEntry.prototype = {
	uri : null,
	callback: null
};

function Observing() {
	this.subscriptions = new Array();
	this.uri2token = new Array();
}

Observing.prototype = {
	subscriptions : null,
	uri2token: null,
	
	pending : null,
	
	subscribe : function(uri, cb) {
		// check for existing subscriptions
		for (t in this.subscriptions) {
			if (this.subscriptions[t]!=null && this.subscriptions[t].uri==uri) {
				this.unsubscribe(t);
				return;
			}
		}
		
		var token = 0;
		do {
			token = parseInt(Math.random()*0x10000);
		} while (token!=0 && this.subscriptions[token]!=null);
		
		this.pending = token;
		
		this.subscriptions[token] = new ObserveEntry(uri, cb);
		
		var subscribe = new CoapMessage(MSG_TYPE_CON, GET, uri);
		subscribe.setSubscription(60);
		subscribe.setToken(token);
		
		var that = this;
		client.send(subscribe, myBind(this,this.initSubscription));
		
		return token;
	},
	
	initSubscription : function(message) {
		dump('initSubscription()\n');
		if (!this.pending) {
			throw 'no subscription pending';
		}
		
		if (message.isOption(OPTION_SUB_LIFETIME) && message.getToken()==this.pending) {
			// server supports observing this resource
			this.subscriptions[this.pending].callback(message);
			this.pending = null;
			
			document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_unobserve.png';
			document.getElementById('toolbar_observe').label = 'Cancel ';
			
		} else {
			this.subscriptions[this.pending] = null;
			this.pending = null;
			dump('WARNING: Observerving not supported\n');
		}
	},

	unsubscribe : function(token) {
		if (this.subscriptions[token]!=null) {
			this.subscriptions[token] = null;
			document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_observe.png';
			document.getElementById('toolbar_observe').label = 'Observe';
		}
	},

	isRegisteredToken : function(token) {
		return (this.subscriptions[token]!=null);
	},
	
	getSubscriberCallback : function(token) {
		return this.subscriptions[token].callback;
	}
};