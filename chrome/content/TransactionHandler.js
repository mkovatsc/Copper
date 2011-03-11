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

function Transaction(myPacket, myTimer, myCB) {
	this.packet = myPacket;
	this.timer = myTimer;
	this.cb = myCB;
	
	this.retries = 0;
}
Transaction.prototype = {
	packet : null,
	timer : null,
	cb : null,
	
	retries : 0
}

function TransactionHandler(myClient) {
	
	this.tid = 0xFFFF & parseInt( Math.random() * 0xFFFF);
	
	this.client = myClient;
	this.client.register( myBind(this, this.handle) );
	
	this.retransmissions = true;
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
	
	send : function(packet, tidCB) {
		// set packet transaction ID
		packet.tid = this.incTid();
		
		// store transaction if awaiting answer
		if (packet.ack==1 && this.retransmissions) {
			// yes, that is really necessary for JavaScript...
			var that = this;
			this.transactions[packet.tid] = new Transaction(packet, window.setTimeout(function(){myBind(that,that.resend(packet.tid));}, RESPONSE_TIMEOUT), tidCB);
		}
		
		dump('-sending CoAP packet----\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
		
		// and send
		this.client.send( packet.serialize() );
	},
	
	resend : function(tid) {
		
		if (this.transactions[tid] && this.transactions[tid].retries < MAX_RETRANSMIT) {
			
			var that = this;
			this.transactions[tid].retries = this.transactions[tid].retries+1;
			
			var timeout = RESPONSE_TIMEOUT*Math.pow(2,this.transactions[tid].retries);
			this.transactions[tid].timer = window.setTimeout(function(){myBind(that,that.resend(tid));}, timeout);
			
			dump('-re-sending CoAP packet-\nTransaction ID: '+tid+'\nTimeout: '+timeout+'\n------------------------\n');
			
			this.client.send( this.transactions[tid].packet.serialize() );
		} else {
			// TODO: find nicer way
			this.defaultCB({getCode:function(){return 'Server not responding';}});
		}
	},
	
	handle : function(message) {
		// parse byte message to CoAP packet
		var packet = new CoapPacket();
		packet.parse(message);
		
		dump('-receiving CoAP packet--\nType: '+packet.getType()+'\nCode: '+packet.getCode()+'\nTransaction ID: '+packet.tid+'\nOptions: '+packet.getOptions()+'\nPayload: '+packet.payload+'\n------------------------\n');
		
		var callback = this.defaultCB;
		
		// handle transaction
		if (this.transactions[packet.tid]) {
			window.clearTimeout(this.transactions[packet.tid].timer);
			if (this.transactions[packet.tid].cb) callback = this.transactions[packet.tid].cb;
			
			// remove
			this.transactions[packet.tid] = null;
		} else {
			dump('WARNING: TransactionHandler.handle [unknown transaction]\n')
		}
		
		// hand over to callback
		callback( packet );
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
}
