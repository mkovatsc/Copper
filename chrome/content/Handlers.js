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
CopperChrome.defaultHandler = function(message) {
	dump('INFO: defaultHandler()\n');
	
	// late blocksize negotiation
	if (message.isOption(Copper.OPTION_BLOCK) && CopperChrome.downloadMethod!=0
			|| message.isOption(Copper.OPTION_BLOCK1) && CopperChrome.uploadMethod!=0) {
		return CopperChrome.blockwiseHandler(message);
	}

	if (message.getRTT) document.getElementById('info_host').label = '' + CopperChrome.hostname + ':' + CopperChrome.port + ' (RTT: ' + message.getRTT() + 'ms)';
	
	CopperChrome.displayMessageInfo(message);
	CopperChrome.displayPayload(message);
	
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( document.getElementById('packet_payload').value ) );
	}
};

//Handle ping responses
CopperChrome.pingHandler = function(message) {
	dump('INFO: pingHandler()\n');
	
	if (message.getRTT) document.getElementById('info_host').label = '' + CopperChrome.hostname + ':' + CopperChrome.port + ' (RTT: ' + message.getRTT() + 'ms)';

	CopperChrome.displayMessageInfo(message);
	CopperChrome.updateLabel('info_code', 'Pong: Remote responds to CoAP');
};

// Handle messages with block-wise transfer
CopperChrome.blockwiseHandler = function(message) {
	dump('INFO: blockwiseHandler()\n');
	
	CopperChrome.displayMessageInfo(message);
	CopperChrome.updateLabel('info_code', ' (Blockwise)', true); // call after displayMessageInfo()
	CopperChrome.displayPayload(message);
	
	if (message.isOption(Copper.OPTION_BLOCK1)) {
		
		// block size negotiation
		let size = message.getBlock1Size();
		if (CopperChrome.behavior.blockSize!=0 && CopperChrome.behavior.blockSize < size) {
			size = CopperChrome.behavior.blockSize;
		}
		// calculate offset first to continue with correct num (if block size differs)
		let offset = message.getBlock1Size() * (message.getBlock1Number() + 1);
		let num = offset/size;
		
		if (message.isSuccess() && CopperChrome.uploadBlocks!=null && offset < CopperChrome.uploadBlocks.length) {
			
			CopperChrome.updateLabel('info_code', ' (Uploading...)', true);

			// automatically count up
			document.getElementById('debug_option_block1').value = num;
			if (offset+size < CopperChrome.uploadBlocks.length) document.getElementById('debug_option_block1').value += '+';
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked ) {
				CopperChrome.sendBlockwise1(document.location.href, num, size);
				return;
			}
		} else {
			// finished
			CopperChrome.uploadMethod = 0;
			CopperChrome.uploadBlocks = null;
			document.getElementById('debug_option_block1').value = ''; // important when continuing with Block1
			
			CopperChrome.updateLabel('info_code', ' (Upload finished)', true); // call after displayMessageInfo()

			// call custom callback
			if (CopperChrome.uploadHandler) {
				CopperChrome.uploadHandler(message);
				CopperChrome.uploadHandler = null;
			}
		}
	}

	if (message.isOption(Copper.OPTION_BLOCK)) {
		if (message.getBlockMore()) {
			
			// block size negotiation
			let size = CopperChrome.negotiateBlockSize(message);
			let offset = message.getBlockOffset();
			let num = offset/size;
			
			// automatically count up
			document.getElementById('debug_option_block2').value = num;				
			
			if ( !document.getElementById('chk_debug_options').checked || document.getElementById('chk_debug_option_block_auto').checked) {
				CopperChrome.sendBlockwise2(document.location.href, num, size);
			}
		} else {
			// finished
			CopperChrome.downloadMethod = 0;
			document.getElementById('debug_option_block2').value = '';

			CopperChrome.updateLabel('info_code', ' (Download finished)', true); // call after displayMessageInfo()
			
			if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
				CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( document.getElementById('packet_payload').value ) );
			}
			
			// call custom callback
			if (CopperChrome.downloadHandler) {
				CopperChrome.downloadHandler(message);
				CopperChrome.downloadHandler = null;
			}
		}
	}
	
};

//Handle messages with block-wise transfer
CopperChrome.observingHandler = function(message) {
	dump('INFO: observingHandler()\n');
	
	CopperChrome.displayMessageInfo(message);
	if (message.isOption(Copper.OPTION_OBSERVE)) {
		CopperChrome.updateLabel('info_code', ' (Observing)', true); // call after displayMessageInfo()
	} else {
		CopperChrome.updateLabel('info_code', ' (Observing stopped)', true); // call after displayMessageInfo()
	}
	CopperChrome.displayPayload(message);
	
	//TODO duplicated code from blockwise handler
	if (message.isOption(Copper.OPTION_BLOCK)) {
		
		CopperChrome.updateLabel('info_code', ' (Blockwise)', true); // call after displayMessageInfo()
		
		if (message.getBlockMore()) {
			
			CopperChrome.downloadMethod = Copper.GET;
			
			// block size negotiation
			let size = CopperChrome.negotiateBlockSize(message);
			let offset = message.getBlockOffset();
			let num = offset/size;
			
			CopperChrome.sendBlockwise2(document.location.href, num, size);
		}
	}
};

// Handle messages with link format payload
CopperChrome.discoverCache = new String(); 
CopperChrome.discoverHandler = function(message) {
	dump('INFO: discoverHandler()\n');
	if (message.getContentType()==Copper.CONTENT_TYPE_APPLICATION_LINK_FORMAT) {
		
		if (message.isOption(Copper.OPTION_BLOCK)) {
			
			if (message.getBlockMore()) {

				// block size negotiation
				let size = CopperChrome.negotiateBlockSize(message);
				let offset = message.getBlockOffset();
				let num = offset/size;
				
				CopperChrome.discover(num, size);
			}
			
			if (message.getBlockNumber()==0) {
				dump('INFO: Starting new discover cache\n');
				CopperChrome.discoverCache = new String(); 
			}
			
			CopperChrome.discoverCache += Copper.bytes2str( message.getPayload() );
			
			if (!message.getBlockMore()) {
				dump('INFO: Appending discover cache\n');
				// link-format
				CopperChrome.resourcesCached = false;
				CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( CopperChrome.discoverCache ) );

				document.getElementById('toolbar_discover').image = 'chrome://copper/skin/tool_discover.png';
			}
		} else {
			// link-format
			CopperChrome.resourcesCached = false;
			CopperChrome.updateResourceLinks( CopperChrome.parseLinkFormat( Copper.bytes2str( message.getPayload() ) ) );

			document.getElementById('toolbar_discover').image = 'chrome://copper/skin/tool_discover.png';
		}
	} else {
		alert('ERROR: Main.discoverHandler [Content-Type is '+message.getContentType()+', not \'application/link-format\']');
	}
};

CopperChrome.errorHandler = function(message) {
	dump('INFO: errorHandler()\n');
	
	document.getElementById('group_head').setAttribute('style', 'display: none;');
	document.getElementById('group_payload').setAttribute('style', 'display: none;');
	
	CopperChrome.updateLabel('info_code', 'Copper: '+ message.getCopperCode());
	
	CopperChrome.client.cancelTransactions();
};
