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
 *         Content-type rendering functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Rendering functions
////////////////////////////////////////////////////////////////////////////////

CopperChrome.renderText = function(message) {
	CopperChrome.updateLabel('packet_payload', Copper.bytes2str(message.getPayload()), message.getBlockNumber()>0);
	document.getElementById('tabs_payload').selectedIndex = 0;
};

CopperChrome.partialImage = '';

CopperChrome.renderImage = function(message) {
	CopperChrome.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlockNumber()>0);
	
	// TODO block management
	if (message.getBlockNumber()==0 || !message.isOption(Copper.OPTION_BLOCK)) {
		CopperChrome.partialImage='';
	}
	CopperChrome.partialImage += Copper.bytes2data(message.getPayload());
	
	document.getElementById('test_img').src='data:'+Copper.getContentTypeName(message.getContentType())+';base64,'+btoa( CopperChrome.partialImage );
	document.getElementById('tabs_payload').selectedIndex = 1;
};

CopperChrome.renderBinary = function(message) {
	
	var pl = message.getPayload();
	for (var i in pl) {
		
		CopperChrome.updateLabel('packet_payload', Copper.leadingZero(pl[i].toString(16).toUpperCase()), true);
		
		if (i % 16 == 15) {
			CopperChrome.updateLabel('packet_payload', ' | ', true);
			for (var j=i-15; j<=i; ++j) {
				if (pl[j] < 32) {
					CopperChrome.updateLabel('packet_payload', '·', true);
				} else {
					CopperChrome.updateLabel('packet_payload', String.fromCharCode(pl[j] & 0xFF), true);
				}
			}
			CopperChrome.updateLabel('packet_payload', '\n', true);
		} else if (i % 2 == 1) {
			CopperChrome.updateLabel('packet_payload', ' ', true);
		}
	}
	
	// incomplete lines
	if ((parseInt(i)+1) % 16 != 0) {
		// complete line with spaces
		for (var j=0; j<39-((parseInt(i)+1)%16)*2 - ((parseInt(i)+1)%16)/2; ++j) {
			CopperChrome.updateLabel('packet_payload', ' ', true);
		}
		
		CopperChrome.updateLabel('packet_payload', ' | ', true);
		for (var j=i-(i%16); j<=i; ++j) {
			if (pl[j] < 32) {
				CopperChrome.updateLabel('packet_payload', '·', true);
			} else {
				CopperChrome.updateLabel('packet_payload', String.fromCharCode(pl[j] & 0xFF), true);
			}
		}
	}
	
	document.getElementById('tabs_payload').selectedIndex = 0;
};

CopperChrome.renderEXI = function(message) {
	CopperChrome.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlockNumber()>0);
	document.getElementById('tabs_payload').selectedIndex = 0;
};
