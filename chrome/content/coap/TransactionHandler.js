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
 *         Code handling message transactions for the CoAP protocol
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

Copper.Transaction = function(myMessage, myTimer) {
	this.message = myMessage;
	this.timer = myTimer;
	
	this.rttStart = new Date().getTime();
	
	return this;
};
Copper.Transaction.prototype = {
	message : null,
	timer : null,
	
	rttStart : 0
};

Copper.TransactionHandler = function(myClient) {
	
	this.client = myClient;
	this.client.register( Copper.myBind(this, this.handle) );
	
	this.midGenerator = parseInt(Math.random()*0x10000);
	
	this.transactions = new Object();
	this.requests = new Object();
	this.registeredTokens = new Object();
	this.registeredMIDs = new Object();
	this.dupFilter = new Array();
	this.dupCache = new Object();
	
	return this;
};

Copper.TransactionHandler.prototype = {

	midGenerator : 0,

	client : null,
	defaultCB : null,
	
	transactions : null,
	
	requests : null,
	registeredTokens : null,
	registeredMIDs : null,
	
	dupFilter : null,
	dupCache : null,
	
	registerCallback : function(myCB) {
		this.defaultCB = myCB;
	},
	
	nextMID : function() {
		this.midGenerator = (this.midGenerator+1) % 0x10000;
		//return Math.pow(2, this.midGenerator) % 419;
		return this.midGenerator;
	},
	
	stopRetransmission : function(token) {
		for (let mid in this.transactions) {
			if (this.transactions[mid].message.getToken()==token) {
				if (this.transactions[mid].timer) {
					window.clearTimeout(this.transactions[mid].timer);
				}
				Copper.logEvent('INFO: Stopping MID '+mid);
				delete this.transactions[mid];
			}
		}
	},
	
	stopRetransmissions : function() {
		for (let mid in this.transactions) {
			if (this.transactions[mid].timer) {
				window.clearTimeout(this.transactions[mid].timer);
			}
			Copper.logEvent('INFO: Stopping MID '+mid);
			delete this.transactions[mid];
		}
	},
	
	cancelTransactions : function() {
		this.stopRetransmissions();
		
		this.requests = new Object();
		this.registeredTokens = new Object();
		this.registeredMIDs = new Object();
		
		Copper.observer.clean();
	},
	
	registerToken : function(token, cb) {
		Copper.logEvent('INFO: Registering token '+token);
		this.registeredTokens[token] = cb;
	},
	
	deRegisterToken : function(token) {
		if (this.registeredTokens[token]) {
			Copper.logEvent('INFO: Deregistering token '+token);
			delete this.registeredTokens[token];
		}
		for (let i in this.registeredTokens) {
			if (this.registeredTokens[i]) Copper.logEvent('  '+i);
		}
	},
	
	send : function(message, reqCB) {
		
		if (this.client.ended) return;

        if(null != reqCB) {
            if(0 == Copper.hostname.indexOf('[ff0') || 0 == Copper.hostname.indexOf('224'))
                reqCB.isMulticast = true;
            else 
                reqCB.isMulticast = false;
        }

		
		// set MID for message
		if (message.getMID()==-1) {
			message.setMID( this.nextMID() );
		}
		
		var that = this; // coping with the JavaScript scope...
		var timer = null;
		
		// store reliable transaction
		if (message.isConfirmable()) {
			if (Copper.behavior.retransmissions) {
				// schedule resend without RANDOM_FACTOR since we already have human jitter
				timer = window.setTimeout(function(){Copper.myBind(that,that.resend(message.getMID()));}, Copper.RESPONSE_TIMEOUT);
			} else {
				// also schedule 'not responding' timeout when retransmissions are disabled 
				timer = window.setTimeout(function(){Copper.myBind(that,that.resend(message.getMID()));}, 16000); // 16 seconds
			}
			Copper.logEvent('INFO: Storing MID '+ message.getMID());
			this.transactions[message.getMID()] = new Copper.Transaction(message, timer);
		}
		
		// store request callback through token matching
		if (message.isRequest()) {
			
			while (this.requests[message.getToken()]!=null && this.registeredTokens[message.getToken()]==null) {
				Copper.logEvent('INFO: Default token already in use');
				message.setToken([parseInt(Math.random()*0x100), parseInt(Math.random()*0x100)]);
			}
			this.requests[message.getToken()] = reqCB===undefined ? this.defaultCB : reqCB;
			
			// also save callback by MID
			this.registeredMIDs[message.getMID()] = this.requests[message.getToken()];
		
		// store notification (needed for NON)
		} else if (message.isResponse() && message.getObserve()!=null) {
			this.registeredMIDs[message.getMID()] = reqCB;
		
		// store ping
		} else if (message.getType()==Copper.MSG_TYPE_CON && message.getCode()==0) {
			this.registeredMIDs[message.getMID()] = reqCB;
		}

		Copper.logMessage(message, true);
		
		this.client.send( Copper.serialize(message) );
	},
	
    unregister(mid, tid) {
				delete this.requests[tid];
				delete this.registeredMIDs[mid];
    },
    
	resend : function(mid) {
		if (Copper.behavior.retransmissions && this.transactions[mid]!==undefined && (this.transactions[mid].message.getRetries() < Copper.MAX_RETRANSMIT)) {
			
			var that = this;
			this.transactions[mid].message.incRetries();
			
			var timeout = Copper.RESPONSE_TIMEOUT*Math.pow(2,this.transactions[mid].message.getRetries());
			this.transactions[mid].timer = window.setTimeout(function(){Copper.myBind(that,that.resend(mid));}, timeout);
			
			Copper.logMessage(this.transactions[mid].message, true);
			
			this.client.send( Copper.serialize(this.transactions[mid].message) );
			
			Copper.popup(Copper.hostname+':'+Copper.port, 'Re-transmitting message '+mid+' ('+this.transactions[mid].message.getRetries()+'/'+Copper.MAX_RETRANSMIT+')');
		
		} else {
			Copper.logWarning('Message ' + mid + ' timed out.');
			this.cancelTransactions();
			delete this.transactions[mid];
		}
	},
	
	handle : function(datagram, from) {
		// parse byte message to CoAP message
		let message = Copper.parse(datagram);
        // Common case is to stop listening except when using multicast
        let stoppedListening = true;
        message.from = from;
		
		Copper.logMessage(message, false);
		
		if (this.transactions[message.getMID()]) {
			// calculate round trip time
			var ms = (new Date().getTime() - this.transactions[message.getMID()].rttStart);
			message.getRTT = function() { return ms; };
			Copper.logEvent('INFO: MID ' +message.getMID() + ' has RTT ' + ms + ' ms');

			// stop retransmission
			Copper.logEvent('INFO: Closing MID ' + message.getMID() );
			if (this.transactions[message.getMID()].timer) window.clearTimeout(this.transactions[message.getMID()].timer);
			
			// clear transaction
			delete this.transactions[message.getMID()];
			
		// filter duplicates
		} else if (this.dupFilter.findIndex(function (element, index, array) { 
            return (element.mid == message.getMID() && 
                    element.addr == message.from.address && 
                    element.port == message.from.port);}) != -1) {
			
			if (message.getType()==Copper.MSG_TYPE_CON) {
				var reply = this.dupCache[message.getMID()];
				if (reply) {
					Copper.logEvent('INFO: Replying to duplicate (Message ID: '+message.getMID()+')');
					this.send(reply);
				} else if (message.getType()==Copper.MSG_TYPE_CON) {
					Copper.logEvent('INFO: Acknowledging duplicate (Message ID: '+message.getMID()+')');
					this.ack(message.getMID());
				}
			} else {
				Copper.logEvent('INFO: Ignoring duplicate (Message ID: '+message.getMID()+')');
			}
			return;
		
		// implicit acknowledgement
		} else if (message.isResponse()) {
			
		}

		// callback for message
		var callback = null;
			
		// Requests
		if (message.isRequest()) {
			
			callback = null;
			
		// Responses
		} else if (message.isResponse()) {
			// request matching by token
			if (this.requests[message.getToken()]) {
				
				// separate response
				if (!this.registeredMIDs[message.getMID()]) {
					if (message.getType()==Copper.MSG_TYPE_CON || message.getType()==Copper.MSG_TYPE_NON) {
						Copper.logEvent('INFO: Separate response for token: '+message.getToken() );
						// stop retransmission if implicit acknowledgement
						this.stopRetransmission(message.getToken());
					}
				}
				
				callback = this.requests[message.getToken()];
				if(callback.isMulticast === undefined || callback.isMulticast === false) {
                    // multicast may receive multiple messages from different servers with same mid
                    // so we will not delete the callbacks just yet
				    delete this.requests[message.getToken()];
				    delete this.registeredMIDs[message.getMID()];
                } else {
                    stoppedListening = false;
                }
			
			// check registered Tokens, e.g., subscriptions
			} else if (this.registeredTokens[message.getToken()]) {
				callback = this.registeredTokens[message.getToken()];
			
			// error
			} else {
				Copper.logEvent('INFO: Received unknown token');
				
				if (Copper.behavior.showUnknown) {
					// hack for additional info
					message.getCopperCode = function() { return 'Unknown token'; };
					this.defaultCB(message);
				}
				
				if (message.getType()==Copper.MSG_TYPE_CON || (message.getType()==Copper.MSG_TYPE_NON && Copper.behavior.rejectUnknown)) {
					Copper.logEvent('INFO: Rejecting unknown token');
					this.reset(message.getMID());
				}
				
				return;
			}
			
		// Empty messages
		} else {
			callback = this.registeredMIDs[message.getMID()];
			
			delete this.registeredMIDs[message.getMID()];
			
			// separate response
			if (message.getType()==Copper.MSG_TYPE_ACK && message.getCode()==Copper.EMPTY) {
				message.getCopperCode = function() { return 'Separate response inbound'; };
			}
		}
		
		// callback might set reply for message used by deduplication
		if (callback) {
			try {
				callback(message, stoppedListening);
			} catch (ex) {
				ex.message = 'Message callback failed:\n' + ex.message;
				Copper.logError(ex);
			}
		}
		
		// piggyback response or ack received CON messages
		if (message.reply) {
			this.send(message.reply);
		} else if (message.getType()==Copper.MSG_TYPE_CON) {
			this.ack(message.getMID());
		}
		
		// add to duplicates filter
		if (message.getType()!=Copper.MSG_TYPE_RST) {
			this.dupFilter.unshift({mid:message.getMID(), addr:message.from.address, port: message.from.port});
			if (message.reply) this.dupCache[message.getMID()] = message.reply;
			if (this.dupFilter.length>10) {
				delete this.dupCache[this.dupFilter.pop()];
			}
		}
	},

	ack : function(mid) {
		var ack = new Copper.CoapMessage(Copper.MSG_TYPE_ACK);
		ack.setMID( mid );
		Copper.popup(Copper.hostname+':'+Copper.port, 'Sending ACK for message '+mid);
		this.send( ack );
	},
	
	reset : function(mid) {
		var rst = new Copper.CoapMessage(Copper.MSG_TYPE_RST);
		rst.setMID( mid );
		Copper.popup(Copper.hostname+':'+Copper.port, 'Sending RST for message '+mid);
		this.send( rst );
	},
	
	shutdown : function() {
		this.client.shutdown();
	}
};
