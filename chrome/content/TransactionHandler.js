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

CopperChrome.Transaction = function(myMessage, myTimer, myCB) {
	this.message = myMessage;
	this.timer = myTimer;
	this.cb = myCB;
	
	this.retries = 0;
};
CopperChrome.Transaction.prototype = {
	message : null,
	timer : null,
	cb : null,
	
	retries : 0
};

CopperChrome.TransactionHandler = function(myClient, retrans) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0xFFFF);
	
	this.client = myClient;
	this.client.register( CopperChrome.myBind(this, this.handle) );
	
	this.retransmissions = retrans!=null ? retrans : true;
	this.transactions = new Object();
};

CopperChrome.TransactionHandler.prototype = {

	tid : 0,

	client : null,
	defaultCB : null,
	
	transactions : null,
	
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
				this.transactions[t] = null;
				dump('INFO: TransactionHandler.cancelTransactions [cancelled transaction '+t+']\n');
			}
		}
		
		// cancel subscriptions as well
		if (CopperChrome.observer) {
			CopperChrome.observer.unsubscribe();
		}
	},
	
	send : function(message, tidCB) {
		// set transaction ID for message
		if (message.getType()!=Copper.MSG_TYPE_ACK && message.getType()!=Copper.MSG_TYPE_RST) {
			message.setTID( this.incTID() );
		}
		
		var that = this; // yes, that is really necessary for JavaScript...
		var timer = null;
		
		// store transaction if awaiting answer
		if (message.isConfirmable()) {
			if (this.retransmissions) {
				// schedule resend
				timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(message.getTID()));}, Copper.RESPONSE_TIMEOUT);
			} else {
				// also schedule 'not responding' timeout when retransmissions are disabled 
				timer = window.setTimeout(function(){CopperChrome.myBind(that,that.resend(message.getTID()));}, 16000); // 16 seconds
			}
			this.transactions[message.getTID()] = new CopperChrome.Transaction(message, timer, tidCB);
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
			this.transactions[tid] = null;
			// TODO: find nicer way, maybe registered error CB
			this.defaultCB( {getCopperCode:function(){return 'Server not responding';}});
		}
	},
	
	handle : function(datagram) {
		// parse byte message to CoAP message
		var message = new CopperChrome.CoapMessage();
		message.parse(datagram);
		
		dump('=received CoAP message==\n');
		dump(message.getSummary()+'\n');
		dump(' =======================\n');
		
		var callback = this.defaultCB;
		
		// handle transaction
		if (this.transactions[message.getTID()]) {
			if (this.transactions[message.getTID()].timer) window.clearTimeout(this.transactions[message.getTID()].timer);
			if (this.transactions[message.getTID()].cb) callback = this.transactions[message.getTID()].cb;
			
			// remove
			this.transactions[message.getTID()] = null;
			
		// handle observing
		} else if (CopperChrome.observer && message.getToken() && CopperChrome.observer.isRegisteredToken(message.getToken())) {
			dump('=observing==============\n');
			callback = CopperChrome.observer.getSubscriberCallback(message.getToken());

			// handle confirmables
			if (message.getType()==Copper.MSG_TYPE_CON) {
				this.ack(message.getTID());
			}
			
		} else {
			dump('WARNING: TransactionHandler.handle [unknown transaction and token]\n');
			
			var infoReset = '';
			
			// handle confirmables
			if (message.getType()==Copper.MSG_TYPE_CON) {
				this.reset(message.getTID());
				infoReset = ' (sent RST)';
			}
			
			if (CopperChrome.showUnknownTransactions) {
				// hack for additional info
				message.getCopperCode = function() { return 'Unknown transaction'+infoReset; };
			} else {
				return;
			}
		}
		
		// hand over to callback
		if (callback) {
			callback( message );
		}
	},
	
	ack : function(tid) {
		var ack = new CopperChrome.CoapMessage(Copper.MSG_TYPE_ACK);
		ack.setTID( tid );
		
		this.send( ack );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending ACK for transaction '+tid);
	},
	
	reset : function(tid) {
		var rst = new CopperChrome.CoapMessage(Copper.MSG_TYPE_RST);
		rst.setTID( tid );
		
		this.send( rst );
		CopperChrome.popup(CopperChrome.hostname+':'+CopperChrome.port, 'Sending RST for transaction '+tid);
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
