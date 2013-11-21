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
 *         Code handling message transactions for the CoAP protocol
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

CopperChrome.Transaction = function(myMessage, myTimer) {
	this.message = myMessage;
	this.timer = myTimer;
	
	this.retries = 0;
	
	this.rttStart = new Date().getTime();
	
	return this;
};
CopperChrome.Transaction.prototype = {
	message : null,
	timer : null,
	
	rttStart : 0,
	
	retries : 0
};

CopperChrome.TransactionHandler = function(myClient, retrans) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0x10000);
	
	this.client = myClient;
	this.client.register( CopperChrome.myBind(this, this.handle) );
	
	this.retransmissions = retrans!=null ? retrans : true;
	this.transactions = new Object();
	this.requests = new Object();
	this.registeredTokens = new Object();
	this.registeredTIDs = new Object();
	this.dupFilter = new Array();
	
	return this;
};

CopperChrome.TransactionHandler.prototype = {

	tid : 0,

	client : null,
	defaultCB : null,
	
	transactions : null,
	
	requests : null,
	registeredTokens : null,
	registeredTIDs : null,
	
	dupFilter : null,
	
	retransmissions : true,
	
	registerCallback : function(myCB) {
		this.defaultCB = myCB;
	},
	
	incTID : function() {
		if (!CopperChrome.behavior.sendDuplicates) {
			this.tid = 0xFFFF & (this.tid+1);
		}
		return this.tid;
	},
	
	setRetransmissions : function(onoff) {
		this.retransmissions = onoff;
	},
	
	stopRetransmissions : function() {
		for (var t in this.transactions) {
			// only cancel default transactions corresponding to the user requests
			if (this.transactions[t] && this.transactions[t].cb==null) {
				if (this.transactions[t].timer) {
					window.clearTimeout(this.transactions[t].timer);
				}
				delete this.transactions[t];
				dump('INFO: TransactionHandler.cancelTransactions [cancelled message '+t+']\n');
			}
		}
	},
	
	cancelTransactions : function() {
		this.stopRetransmissions();
		
		this.requests = new Object();
		this.registeredTokens = new Object();
		this.registeredTIDs = new Object();
		
		// cancel subscriptions as well
		if (CopperChrome.observer) {
			CopperChrome.observer.unsubscribe();
		}

		document.getElementById('toolbar_discover').image = 'chrome://copper/skin/tool_discover.png';
	},
	
	registerToken : function(token, cb) {
		dump('INFO: Registering token '+token+'\n');
		this.registeredTokens[token] = cb;
	},
	
	deRegisterToken : function(token) {
		if (this.registeredTokens[token]) {
			dump('INFO: Deregistering token '+token+'\n');
			delete this.registeredTokens[token];
		}
		for (i in this.registeredTokens) {
			if (this.registeredTokens[i]) dump('  '+i+'\n');
		}
	},
	
	send : function(message, reqCB) {
		
		// set transaction ID for message
		if (message.getType()==Copper.MSG_TYPE_CON || message.getType()==Copper.MSG_TYPE_NON) {
			message.setTID( this.incTID() );
		}
		
		var that = this; // struggling with the JavaScript scope thing...
		var timer = null;
		
		// store reliable transaction
		if (message.isConfirmable()) {
			if (this.retransmissions) {
				// schedule resend
				timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(message.getTID()));}, Copper.RESPONSE_TIMEOUT);
			} else {
				// also schedule 'not responding' timeout when retransmissions are disabled 
				timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(message.getTID()));}, 16000); // 16 seconds
			}
			dump('INFO: Storing transaction '+ message.getTID()+ '\n');
			this.transactions[message.getTID()] = new CopperChrome.Transaction(message, timer);
		}
		
		// store request callback through token matching
		if (message.isRequest()) {
			
			while (this.requests[message.getTokenDefault()]!=null && this.registeredTokens[message.getTokenDefault()]==null) {
				dump('INFO: Default token already in use\n');
				message.setToken(new Array([parseInt(Math.random()*0x100)]));
			}
			this.requests[message.getTokenDefault()] = reqCB==null ? this.defaultCB : reqCB;
			
			// also save callback by TID
			this.registeredTIDs[message.getTID()] = this.requests[message.getTokenDefault()];
		// store ping
		} else if (message.getType()==Copper.MSG_TYPE_CON && message.getCode()==0) {
			this.registeredTIDs[message.getTID()] = CopperChrome.pingHandler;
		}
		
		// and send
		dump(Array('=sending CoAP message===',
				   message.getSummary(),
				   ' =======================',
				   '').join('\n'));
		this.client.send( message.serialize() );
	},
	
	resend : function(tid) {
		
		// check this.retransmissions, as they can be disabled intermediately
		if (this.retransmissions && this.transactions[tid] && this.transactions[tid].retries < Copper.MAX_RETRANSMIT) {
			
			var that = this;
			this.transactions[tid].retries = this.transactions[tid].retries+1;
			
			var timeout = Copper.RESPONSE_TIMEOUT*Math.pow(2,this.transactions[tid].retries);
			this.transactions[tid].timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(tid));}, timeout);
			
			dump(Array('=re-sending CoAP message',
					   ' Message ID: '+tid,
					   ' New timeout: '+timeout,
					   ' =======================',
					   '').join('\n'));
			this.client.send( this.transactions[tid].message.serialize() );
			
			CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Re-transmitting message '+tid+' ('+this.transactions[tid].retries+'/'+Copper.MAX_RETRANSMIT+')');
		} else {
			dump(Array('=timeout================',
					   ' Message ID: '+tid,
					   ' =======================',
					   '').join('\n'));
			delete this.transactions[tid];
			// TODO: find nicer way, maybe registered error CB
			this.client.errorCallback( {getCopperCode:function(){return 'Server not responding';}});
		}
	},
	
	handle : function(datagram) {
		// parse byte message to CoAP message
		var message = new CopperChrome.CoapMessage();
		message.parse(datagram);
		
		dump(Array('=received CoAP message==',
				   message.getSummary(),
				   ' =======================',
				   '').join('\n'));
		
		// handle transaction
		if (this.transactions[message.getTID()]) {
			dump('INFO: Closing message ' + message.getTID() + '\n');
			if (this.transactions[message.getTID()].timer) window.clearTimeout(this.transactions[message.getTID()].timer);
			
			// calculate round trip time
			var ms = (new Date().getTime() - this.transactions[message.getTID()].rttStart);
			message.getRTT = function() { return ms; };
			
			// clear transaction
			delete this.transactions[message.getTID()];
			
		// filter duplicates
		} else if (this.dupFilter.indexOf(message.getTID()) != -1) {
			
			if (message.getType()==Copper.MSG_TYPE_CON) {
				dump('INFO: Acking duplicate (Message ID: '+message.getTID()+')\n');
				this.ack(message.getTID());
			} else {
				dump('INFO: Ignoring duplicate (Message ID: '+message.getTID()+')\n');
			}
			return;
		}
		
		// add to duplicates filter
		if (message.getType()!=Copper.MSG_TYPE_RST) {
			this.dupFilter.unshift(message.getTID());
			if (this.dupFilter.length>10) this.dupFilter.pop();
		}
		
		// find callback
		var callback = null;
		
		// check for separate response first
		if (message.getType()==Copper.MSG_TYPE_ACK && message.getCode()==0) {
			callback = this.registeredTIDs[message.getTID()];
			delete this.registeredTIDs[message.getTID()];
			
			message.getCopperCode = function() { return 'Separate response inbound'; };
		
		// request matching by token
		} else if (this.requests[message.getTokenDefault()]) {
			
			if (!this.registeredTIDs[message.getTID()]) {
				if (message.getType()!=Copper.MSG_TYPE_CON && message.getType()!=Copper.MSG_TYPE_NON) {
					dump('WARNING: TransactionHandler.handle [wrong type for separate from server: '+message.getType(true)+']\n');
				} else {
					dump('INFO: Incoming separate reponse (Token: '+message.getTokenDefault()+')\n');
					this.stopRetransmissions();
				}
			}

			callback = this.requests[message.getTokenDefault()];
			delete this.requests[message.getTokenDefault()];
			delete this.registeredTIDs[message.getTID()];
		
		// check registered Tokens, e.g., subscriptions
		} else if (this.registeredTokens[message.getTokenDefault()]) {
			callback = this.registeredTokens[message.getTokenDefault()];

		// fallback to TID
		} else if (this.registeredTIDs[message.getTID()]) {
			callback = this.registeredTIDs[message.getTID()];
			delete this.registeredTIDs[message.getTID()];
		
		// error
		} else {
			dump('WARNING: TransactionHandler.handle [unknown token]\n');
			
			if (CopperChrome.behavior.showUnknown) {
				// hack for additional info
				message.getCopperCode = function() { return 'Unknown token'; };
				
				callback = defaultCB;
			}
		}
		
		if (callback) {
			// ack all successfully received CON messages
			if (message.getType()==Copper.MSG_TYPE_CON) {
				this.ack(message.getTID());
			}
			callback(message);
		} else {
			// only reject NONs when set in
			if (message.getType()==Copper.MSG_TYPE_CON || message.getType()==Copper.MSG_TYPE_NON && CopperChrome.behavior.rejectUnknown) {
				this.reset(message.getTID());
			}
		}
	},
	
	ack : function(tid) {
		var ack = new CopperChrome.CoapMessage(Copper.MSG_TYPE_ACK);
		ack.setTID( tid );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending ACK for message '+tid);
		this.send( ack );
	},
	
	reset : function(tid) {
		var rst = new CopperChrome.CoapMessage(Copper.MSG_TYPE_RST);
		rst.setTID( tid );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending RST for message '+tid);
		this.send( rst );
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
