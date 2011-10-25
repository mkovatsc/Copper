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
 *         Message handler functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// CoAP message handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming messages, registered as default at TransactionHandler
CopperChrome.defaultHandler = function(message) {
	dump('INFO: defaultHandler()\n');
	
	// if message turns out to be block-wise transfer dispatch to corresponding handler
	if (message.isOption && message.isOption(Copper.OPTION_BLOCK)) {
		return CopperChrome.blockwiseHandler(message);
	}
	
	if (message.getRTT) document.getElementById('info_host').label = '' + CopperChrome.hostname + ':' + CopperChrome.port + ' (RTT: ' + message.getRTT() + 'ms)';
	
	CopperChrome.updateMessageInfo(message);
	CopperChrome.updateLabel('packet_payload', message.getPayload());
	document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
	
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat(message.getPayload()) );
	}
};

// Handle messages with block-wise transfer
CopperChrome.blockwiseHandler = function(message) {
	dump('INFO: blockwiseHandler()\n');
	
	CopperChrome.updateMessageInfo(message);
	CopperChrome.updateLabel('info_code', ' (Blockwise)', true);
	
	if (message.isOption(Copper.OPTION_BLOCK)) {
		
		if (message.getBlockMore()) {
			if ( document.getElementById('chk_debug_options').checked ) {
				// automatically count up
				document.getElementById('debug_option_block2').value++;
			} else {
				// block size negotiation
				if (message.getBlockSize() > CopperChrome.blockSize) {
					CopperChrome.sendBlockwiseGet(0, CopperChrome.blockSize);
				} else {
					CopperChrome.sendBlockwiseGet(message.getBlockNumber()+1, message.getBlockSize());
				}
			}
		}
		CopperChrome.updateLabel('packet_payload', message.getPayload(), message.getBlockNumber()>0);
		document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
		
		if (!message.getBlockMore()) {
			if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
				CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( document.getElementById('packet_payload').value ) );
			}
		}
		
	}
};

//Handle messages with block-wise transfer
CopperChrome.observingHandler = function(message) {
	dump('INFO: observingHandler()\n');
	
	if (message.isOption(Copper.OPTION_OBSERVE)) {
		
		CopperChrome.updateMessageInfo(message);
		CopperChrome.updateLabel('info_code', ' (Observing)', true);
		
		CopperChrome.updateLabel('packet_payload', message.getPayload());
		document.getElementById('info_payload').label='Payload ('+document.getElementById('packet_payload').value.length+')';
	} else {
		CopperChrome.updateLabel('info_code', 'Observing not supported');
	}
};

// Handle messages with link format payload
CopperChrome.discoverCache = new String(); 
CopperChrome.discoverHandler = function(message) {
	dump('INFO: discoverHandler()\n');
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		
		if (message.isOption(Copper.OPTION_BLOCK)) {
			
			if (message.getBlockMore()) {
				
				// give in, as browser could request large blocks and server might be constrained
				if (message.getBlockSize() > CopperChrome.blockSize) {
					CopperChrome.discover(0, CopperChrome.blockSize);
				} else {
					CopperChrome.discover(message.getBlockNumber()+1, message.getBlockSize());
				}
			}
			
			if (message.getBlockNumber()==0) {
				dump('INFO: Starting new discover cache\n');
				CopperChrome.discoverCache = new String(); 
			}
			
			CopperChrome.discoverCache += message.getPayload();
			
			if (!message.getBlockMore()) {
				dump('INFO: Appending discover cache\n');
				// link-format
				CopperChrome.resourcesCached = false;
				CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( CopperChrome.discoverCache ) );
			}
		} else {
			// link-format
			CopperChrome.resourcesCached = false;
			CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( message.getPayload() ) );
		}
	} else {
		alert('ERROR: Main.discoverHandler [Content-Type is '+message.getContentType()+', not \'application/link-format\']');
	}
};

CopperChrome.errorHandler = function(message) {
	dump('INFO: errorHandler()\n');

	// disable the toolbar
	var obj = document.getElementById('main_toolbar').firstChild;
	do {
		// children of toolbaritems need to be disabled manually
		if (obj.nodeName=='toolbaritem') {
			
			var obj2 = obj.firstChild;
			do {
				obj2.setAttribute("disabled", "true");
			} while ( obj2 = obj2.nextSibling);
		} else {
			obj.setAttribute("disabled", "true");
		}
	} while ( obj = obj.nextSibling);
	
	document.getElementById('group_host').setAttribute('style', 'display: none;');
	document.getElementById('group_head').setAttribute('style', 'display: none;');
	document.getElementById('group_payload').setAttribute('style', 'display: none;');
	
	CopperChrome.updateLabel('info_code', 'Copper: '+ message.getCopperCode());
};