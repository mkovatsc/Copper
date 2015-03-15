/*******************************************************************************
 * Copyright (c) 2014, Institute for Pervasive Computing, ETH Zurich.
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
 ******************************************************************************/
/**
 * \file
 *         Message handler functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// CoAP message handlers
////////////////////////////////////////////////////////////////////////////////

// Handle normal incoming messages, registered as default at TransactionHandler
Copper.defaultHandler = function(message) {
	
	Copper.logEvent('INFO: defaultHandler()');
	
	// late blocksize negotiation
	if (message.isOption(Copper.OPTION_BLOCK2) && Copper.downloadMethod!=0
			|| message.isOption(Copper.OPTION_BLOCK1) && Copper.uploadMethod!=0) {
		return Copper.blockwiseHandler(message);
	}
	
	Copper.displayMessageInfo(message);
	Copper.displayPayload(message);
	
	if (message.getRTT) Copper.updateLabel('info_code', ' (RTT ' + message.getRTT() + ' ms)', true);
	
	if (message.getContentFormat()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		Copper.updateResourceLinks( Copper.parseLinkFormat( document.getElementById('packet_payload').value ) );
	}
};

//Handle ping responses
Copper.pingHandler = function(message) {
	Copper.logEvent('INFO: pingHandler()');
	
	Copper.displayMessageInfo(message);
	Copper.updateLabel('info_code', 'Pong: Remote responds to CoAP');
	if (message.getRTT) Copper.updateLabel('info_code', ' (RTT ' + message.getRTT() + ' ms)', true);
};

// Handle messages with block-wise transfer
Copper.blockwiseHandler = function(message) {
	Copper.logEvent('INFO: blockwiseHandler()');
	
	Copper.displayMessageInfo(message);
	Copper.updateLabel('info_code', ' (Blockwise)', true); // call after displayMessageInfo()
	Copper.displayPayload(message);
	
	if (message.isOption(Copper.OPTION_BLOCK1)) {
		
		// block size negotiation
		let size = message.getBlock1Size();
		if (Copper.behavior.blockSize!=0 && Copper.behavior.blockSize < size) {
			size = Copper.behavior.blockSize;
		}
		// calculate offset first to continue with correct num (if block size differs)
		let offset = message.getBlock1Size() * (message.getBlock1Number() + 1);
		let num = offset/size;
		
		if (message.isSuccess() && Copper.uploadBlocks!=null && offset < Copper.uploadBlocks.length) {
			
			Copper.updateLabel('info_code', ' (Uploading...)', true);

			// automatically count up
			document.getElementById('debug_option_block1').value = num;
			if (offset+size < Copper.uploadBlocks.length) document.getElementById('debug_option_block1').value += '+';
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked ) {
				Copper.sendBlockwise1(Copper.mainWindow.document.getElementById('urlbar').value, num, size);
				return;
			}
		} else {
			// finished
			Copper.uploadMethod = 0;
			Copper.uploadBlocks = null;
			document.getElementById('debug_option_block1').value = ''; // important when continuing with Block1
			
			Copper.updateLabel('info_code', ' (Upload finished)', true); // call after displayMessageInfo()

			// call custom callback
			if (Copper.uploadHandler) {
				Copper.uploadHandler(message);
				Copper.uploadHandler = null;
			}
		}
	}

	if (message.isOption(Copper.OPTION_BLOCK2)) {
		if (message.getBlock2More()) {
			
			// block size negotiation
			let size = Copper.negotiateBlockSize(message);
			let offset = message.getBlock2Offset();
			let num = offset/size;
			
			// automatically count up
			document.getElementById('debug_option_block2').value = num;				
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked) {
				Copper.sendBlockwise2(Copper.mainWindow.document.getElementById('urlbar').value, num, size);
			}
		} else {
			// finished
			Copper.downloadMethod = 0;
			document.getElementById('debug_option_block2').value = '';

			Copper.updateLabel('info_code', ' (Download finished)', true); // call after displayMessageInfo()
			
			if (message.getContentFormat()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
				Copper.updateResourceLinks( Copper.parseLinkFormat( document.getElementById('packet_payload').value ) );
			}
			
			// call custom callback
			if (Copper.downloadHandler) {
				Copper.downloadHandler(message);
				Copper.downloadHandler = null;
			}
		}
	}
	
};

//Handle messages with block-wise transfer
Copper.observingHandler = function(message) {
	Copper.logEvent('INFO: observingHandler()');
	
	Copper.displayMessageInfo(message);
	if (message.isOption(Copper.OPTION_OBSERVE)) {
		Copper.updateLabel('info_code', ' (Observing)', true); // call after displayMessageInfo()
	} else {
		Copper.updateLabel('info_code', ' (Observing stopped)', true); // call after displayMessageInfo()
	}
	Copper.displayPayload(message);
	
	//TODO duplicated code from blockwise handler
	if (message.isOption(Copper.OPTION_BLOCK2)) {
		
		Copper.updateLabel('info_code', ' (Blockwise)', true); // call after displayMessageInfo()
		
		if (message.getBlock2More()) {
			
			Copper.downloadMethod = Copper.GET;
			
			// block size negotiation
			let size = Copper.negotiateBlockSize(message);
			let offset = message.getBlock2Offset();
			let num = offset/size;
			
			Copper.sendBlockwise2(Copper.mainWindow.document.getElementById('urlbar').value, num, size);
		}
	}
};

// Handle messages with link format payload
Copper.discoverCache = new String(); 
Copper.discoverHandler = function(message) {
	
	Copper.logEvent('INFO: discoverHandler()');
	
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) return;
	
	if (message.getContentFormat()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		
		Copper.updateLabel('info_code', 'Discovering');
		
		if (message.isOption(Copper.OPTION_BLOCK2)) {
			
			if (message.getBlock2More()) {

				// block size negotiation
				let size = Copper.negotiateBlockSize(message);
				let offset = message.getBlock2Offset();
				let num = offset/size;
				Copper.discover(num, size);
			}
			
			if (message.getBlock2Number()==0) {
				Copper.logEvent('INFO: Starting new discover cache');
				Copper.discoverCache = new String(); 
			}
			
			Copper.discoverCache += Copper.bytes2str( message.getPayload() );
			
			if (!message.getBlock2More()) {
				Copper.logEvent('INFO: Appending discover cache');
				// link-format
				Copper.resourcesCached = false;
				Copper.updateResourceLinks( Copper.parseLinkFormat( Copper.discoverCache ) );

				document.getElementById('toolbar_discover').image = 'chrome://copper/skin/tool_discover.png';
			}
		} else {
			// link-format
			Copper.resourcesCached = false;
			Copper.updateResourceLinks( Copper.parseLinkFormat( Copper.bytes2str( message.getPayload() ) ) );

			document.getElementById('toolbar_discover').image = 'chrome://copper/skin/tool_discover.png';
		}
	} else {
		Copper.logWarning(new Error("Discovery requires 'application/link-format', but received "+message.getContentFormat()));
	}
};

Copper.errorHandler = function(message) {
	Copper.logEvent('INFO: errorHandler()');
	
	document.getElementById('group_head').setAttribute('style', 'display: none;');
	document.getElementById('group_payload').setAttribute('style', 'display: none;');
	
	Copper.updateLabel('info_code', message.getCopperCode());
	
	Copper.endpoint.cancelTransactions();
};
