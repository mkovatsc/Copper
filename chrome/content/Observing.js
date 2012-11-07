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
	
	return this;
};
CopperChrome.ObserveEntry.prototype = {
	uri : null,
	callback: null,
	token : null,
	lastTID: -1
};

CopperChrome.Observing = function() {
	// maybe support multiple subscriptions via sidebar in the future
	//this.subscriptions = new Object();
	
	return this;
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
		
		dump('INFO: Subscribing to ' + uri + '\n');
		
		var subscribe = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, uri); // always use CON

		// add all debug options
		CopperChrome.checkDebugOptions(subscribe);
		
		// set token depending on the behavior config
		if (CopperChrome.behavior.observeToken && !subscribe.getToken()) {
			subscribe.setToken( new Array(parseInt(Math.random()*0x100), parseInt(Math.random()*0x100)) );
			// update debug options
			if (document.getElementById('chk_debug_options').checked) {
				document.getElementById('debug_option_token').value = subscribe.getToken();
			}
		}
		
		this.pending = new CopperChrome.ObserveEntry(uri, cb, subscribe.getToken());

		var that = this;
		CopperChrome.client.registerToken(subscribe.getToken(), CopperChrome.myBind(that, that.handle));
		
		try {
			
			if (CopperChrome.coapVersion < 4) {
				subscribe.setObserve(60);
			} else {
				subscribe.setObserve(0);
			}

			var that = this;
			CopperChrome.clearLabels();
			CopperChrome.client.send(subscribe, CopperChrome.myBind(that, that.handle));
		} catch (ex) {
			alert('ERROR: Observing.subscribe ['+ex+']');
		}
	},

	unsubscribe : function(token) {
		if (this.subscription) {
			dump('INFO: Unsibscribing ' + this.subscription.uri + '\n');
			CopperChrome.client.deRegisterToken(this.subscription.token);
			
			if (CopperChrome.behavior.observeCancellation=='rst' && this.subscription.lastTID!=-1) {
				// Send a RST (with new message ID)
				try {
					var rst = new CopperChrome.CoapMessage(Copper.MSG_TYPE_RST);
					rst.setTID(this.subscription.lastTID);
					CopperChrome.client.send( rst );
				} catch (ex) {
					alert('ERROR: Observing.unsubscribe ['+ex+']');
				}
			} else if (CopperChrome.behavior.observeCancellation=='get') {
				try {
					let uri = CopperChrome.checkUri(); // get current URI
					var get = new CopperChrome.CoapMessage(Copper.MSG_TYPE_CON, Copper.GET, uri); // always use CON
					get.setToken(this.subscription.token);
					CopperChrome.clearLabels();
					CopperChrome.client.send( get );
				} catch (ex) {
					alert('ERROR: Observing.unsubscribe ['+ex+']');
				}
			}
			
			CopperChrome.updateLabel('info_code', 'Copper: Cancelled', false); // call after displayMessageInfo()
			
			this.subscription = null;
		}
		
		
		document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_observe.png';
		document.getElementById('toolbar_observe').label = 'Observe';
	},
	
	handle : function(message) {

		if (this.pending) {
			
			// check if server supports observing this resource
			if (message.isOption(Copper.OPTION_OBSERVE)) {
				
				this.subscription = new CopperChrome.ObserveEntry(this.pending.uri, this.pending.callback, message.getToken());
				this.pending = null;
				
				document.getElementById('toolbar_observe').image = 'chrome://copper/skin/tool_unobserve.png';
				document.getElementById('toolbar_observe').label = 'Cancel ';

				this.subscription.lastTID = message.getTID();
				this.subscription.callback(message);
				
			} else {
				
				CopperChrome.client.deRegisterToken(this.pending.token);
				this.pending = null;
				
				message.getCopperCode = function() { return 'Resource not observable'; };
				
				CopperChrome.defaultHandler(message);
			}
		} else if (this.subscription!=null) {
			this.subscription.lastTID = message.getTID();
			this.subscription.callback(message);
		} else {
			// somehow it must have gotten here
			CopperChrome.client.deRegisterToken(message.getToken());
			
			throw 'Missing context for Observing.handle()';
		}
	}
};