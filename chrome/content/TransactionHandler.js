/*
 * Copyright (c) 2010, Institute for Pervasive Computing, ETH Zurich.
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

function Transaction(myMessage, myTimer, myCB) {
	this.message = myMessage;
	this.timer = myTimer;
	this.cb = myCB;
	
	this.retries = 0;
}
Transaction.prototype = {
	message : null,
	timer : null,
	cb : null,
	
	retries : 0
};

function TransactionHandler(myClient, retrans) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0xFFFF);
	
	this.client = myClient;
	this.client.register( myBind(this, this.handle) );
	
	this.retransmissions = retrans!=null ? retrans : true;
	this.transactions = new Array();
}

TransactionHandler.prototype = {

	tid : 0,

	client : null,
	defaultCB : null,
	
	transactions : null,
	
	retransmissions : true,
	
	register : function(myCB) {
		this.defaultCB = myCB;
	},
	
	incTid : function() {
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
	},
	
	send : function(message, tidCB) {
		// set transaction ID for message
		message.setTID( this.incTid() );

		
		var that = this; // yes, that is really necessary for JavaScript...
		var timer = null;
		
		// store transaction if awaiting answer
		if (message.isConfirmable()) {
			if (this.retransmissions) {
				// schedule resend
				timer = window.setTimeout(function(){myBind(that,that.resend(message.getTID()));}, RESPONSE_TIMEOUT);
			} else {
				// also schedule 'not responding' timeout when retransmissions are disabled 
				timer = window.setTimeout(function(){myBind(that,that.resend(message.getTID()));}, 16*RESPONSE_TIMEOUT);
			}
			this.transactions[message.getTID()] = new Transaction(message, timer, tidCB);
		}
		
		dump('-sending CoAP message---\n'+message.getSummary());
		
		// and send
		this.client.send( message.serialize() );
	},
	
	resend : function(tid) {
		
		// check this.retransmissions, as they can be disabled intermediately
		if (this.retransmissions && this.transactions[tid] && this.transactions[tid].retries < MAX_RETRANSMIT) {
			
			var that = this;
			this.transactions[tid].retries = this.transactions[tid].retries+1;
			
			var timeout = RESPONSE_TIMEOUT*Math.pow(2,this.transactions[tid].retries);
			this.transactions[tid].timer = window.setTimeout(function(){myBind(that,that.resend(tid));}, timeout);
			
			dump('-re-sending CoAP message\nTransaction ID: '+tid+'\nTimeout: '+timeout+'\n------------------------\n');
			
			this.client.send( this.transactions[tid].packet.serialize() );
		} else {
			dump('-timeout----------------\nTransaction ID: '+tid+'\n------------------------\n');
			this.transactions[tid] = null;
			// TODO: find nicer way, maybe registered error CB
			this.defaultCB({getCode:function(){return 'Server not responding';}});
		}
	},
	
	handle : function(datagram) {
		// parse byte message to CoAP packet
		var message = new CoapMessage();
		message.parse(datagram);
		
		dump('-received CoAP message--\n'+message.getSummary());
		
		var callback = this.defaultCB;
		
		// handle transaction
		if (this.transactions[message.getTID()]) {
			if (this.transactions[message.getTID()].timer) window.clearTimeout(this.transactions[message.getTID()].timer);
			if (this.transactions[message.getTID()].cb) callback = this.transactions[message.getTID()].cb;
			
			// remove
			this.transactions[message.getTID()] = null;
		} else {
			dump('WARNING: TransactionHandler.handle [unknown transaction]\n');
		}
		
		// hand over to callback
		callback( message );
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
