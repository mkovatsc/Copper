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
 *         Code handling transactions for the CoAP protocol
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

CopperChrome.Transaction = function(myMessage, myTimer) {
	this.message = myMessage;
	this.timer = myTimer;
	
	this.retries = 0;
	
	this.rttStart = new Date().getTime();
};
CopperChrome.Transaction.prototype = {
	message : null,
	timer : null,
	
	rttStart : 0,
	
	retries : 0
};

CopperChrome.TransactionHandler = function(myClient, retrans) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0xFFFF);
	
	this.client = myClient;
	this.client.register( CopperChrome.myBind(this, this.handle) );
	
	this.retransmissions = retrans!=null ? retrans : true;
	this.transactions = new Object();
	this.requests = new Object();
	this.registeredTokens = new Object();
	this.registeredTIDs = new Object();
	this.dupFilter = new Array();
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
		this.tid = 0xFFFF & (this.tid+1); 
		return this.tid;
	},
	
	setRetransmissions : function(onoff) {
		this.retransmissions = onoff;
	},
	
	cancelTransactions : function() {
		for (var t in this.transactions) {
			// only cancel default transactions corresponding to the user requests
			if (this.transactions[t] && this.transactions[t].cb==null) {
				if (this.transactions[t].timer) {
					window.clearTimeout(this.transactions[t].timer);
				}
				delete this.transactions[t];
				dump('INFO: TransactionHandler.cancelTransactions [cancelled transaction '+t+']\n');
			}
		}
		this.requests = new Object();
		this.registeredTokens = new Object();
		this.registeredTIDs = new Object();
		
		// cancel subscriptions as well
		if (CopperChrome.observer) {
			CopperChrome.observer.unsubscribe();
		}
	},
	
	registerToken : function(token, cb) {
		dump('INFO: Registering token '+Copper.bytes2hex(token)+'\n');
		this.registeredTokens[token] = cb;
	},
	
	deRegisterToken : function(token) {
		if (this.registeredTokens[token]) {
			dump('INFO: Deregistering token '+Copper.bytes2hex(token)+'\n');
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
			this.transactions[message.getTID()] = new CopperChrome.Transaction(message, timer);
		}
		
		// store request callback through token matching
		if (message.getType()==Copper.MSG_TYPE_CON || message.getType()==Copper.MSG_TYPE_NON) {
			while (this.requests[message.getTokenDefault()]!=null || this.registeredTokens[message.getTokenDefault()]!=null) {
				dump('INFO: Default token already in use\n');
				message.setToken(new Array([parseInt(Math.random()*0x100)]));
			}
			this.requests[message.getTokenDefault()] = reqCB==null ? this.defaultCB : reqCB;
			
			// also save callback by TID
			this.registeredTIDs[message.getTID()] = this.requests[message.getTokenDefault()];
		}
		
		// and send
		dump('=sending CoAP message===\n');
		dump(message.getSummary()+'\n');
		dump(' =======================\n');
		this.client.send( message.serialize() );
	},
	
	resend : function(tid) {
		
		// check this.retransmissions, as they can be disabled intermediately
		if (this.retransmissions && this.transactions[tid] && this.transactions[tid].retries < Copper.MAX_RETRANSMIT) {
			
			var that = this;
			this.transactions[tid].retries = this.transactions[tid].retries+1;
			
			var timeout = Copper.RESPONSE_TIMEOUT*Math.pow(2,this.transactions[tid].retries);
			this.transactions[tid].timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(tid));}, timeout);
			
			dump('=re-sending CoAP message\n');
			dump(' Transaction ID: '+tid+'\n');
			dump(' New timeout: '+timeout+'\n');
			dump(' =======================\n');
			this.client.send( this.transactions[tid].message.serialize() );
		} else {
			dump('=timeout================\n');
			dump(' Transaction ID: '+tid+'\n');
			dump(' =======================\n');
			delete this.transactions[tid];
			// TODO: find nicer way, maybe registered error CB
			this.client.errorCallback( {getCopperCode:function(){return 'Server not responding';}});
		}
	},
	
	handle : function(datagram) {
		// parse byte message to CoAP message
		var message = new CopperChrome.CoapMessage();
		message.parse(datagram);
		
		dump('=received CoAP message==\n');
		dump(message.getSummary()+'\n');
		dump(' =======================\n');
		
		// handle transaction
		if (this.transactions[message.getTID()]) {
			if (this.transactions[message.getTID()].timer) window.clearTimeout(this.transactions[message.getTID()].timer);
			
			// calculate round trip time
			var ms = (new Date().getTime() - this.transactions[message.getTID()].rttStart);
			message.getRTT = function() { return ms; };
			
			// clear transaction
			delete this.transactions[message.getTID()];
			
			// add to duplicates filter
			this.dupFilter.unshift(message.getTID());
			if (this.dupFilter.length>10) this.dupFilter.pop();
			
		// filter duplicates
		} else if (this.dupFilter.indexOf(message.getTID()) !== -1) {
			dump('INFO: Dropping duplicate (Transaction ID: '+message.getTID()+')\n');
			return;
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
			
			var infoReset = '';
			
			// RST also allowed for NON since 06
			if (message.getType()==Copper.MSG_TYPE_CON || message.getType()==Copper.MSG_TYPE_NON) {
				this.reset(message.getTID(), message.getToken());
				infoReset = ' (sent RST)';
			}
			
			if (CopperChrome.showUnknownTransactions) {
				// hack for additional info
				message.getCopperCode = function() { return 'Unknown token'+infoReset; };
				
				this.defaultCB(message);
			}
			return;
		}
		
		// ack all successfully received CON messages
		if (message.getType()==Copper.MSG_TYPE_CON) {
			this.ack(message.getTID());
		}
		
		if (callback) {
			callback(message);
		}
	},
	
	ack : function(tid) {
		var ack = new CopperChrome.CoapMessage(Copper.MSG_TYPE_ACK);
		ack.setTID( tid );
		
		this.send( ack );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending ACK for transaction '+tid);
	},
	
	reset : function(tid, token) {
		var rst = new CopperChrome.CoapMessage(Copper.MSG_TYPE_RST);
		rst.setTID( tid );
		if (token!=null) {
			rst.setToken(token);
		}
		
		this.send( rst );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending RST for transaction '+tid);
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
