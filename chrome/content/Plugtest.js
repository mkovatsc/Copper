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
 *         Automated Plugtests
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */


CopperChrome.plugtest = {
		useProxy : false,
		proxy : ''
};

CopperChrome.loadPlugtest = function() {
	CopperChrome.plugtest.useProxy = CopperChrome.prefManager.getBoolPref('extensions.copper.plugtest.use-proxy');
	CopperChrome.plugtest.proxy = CopperChrome.prefManager.getCharPref('extensions.copper.plugtest.proxy');
	
	document.getElementById('menu_plugtest_proxy').setAttribute('checked', CopperChrome.plugtest.useProxy);
};
CopperChrome.savePlugtest = function() {
	CopperChrome.prefManager.setBoolPref('extensions.copper.plugtest.use-proxy', CopperChrome.plugtest.useProxy);
	CopperChrome.prefManager.setCharPref('extensions.copper.plugtest.proxy', CopperChrome.plugtest.proxy);
};

CopperChrome.testSetProxy = function(target) {
	CopperChrome.plugtest.useProxy = target.getAttribute('checked')=='true';
	if (CopperChrome.plugtest.useProxy) CopperChrome.plugtest.proxy = prompt(target.id + '?'+CopperChrome.plugtest.useProxy, CopperChrome.plugtest.proxy);
};

CopperChrome.testCore01 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendGet('/test');
};
CopperChrome.testCore02 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost('/test');
};
CopperChrome.testCore03 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut('/test');
};
CopperChrome.testCore04 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendDelete('/test');
};
CopperChrome.testCore05 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendGet('/test');
};
CopperChrome.testCore06 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost('/test');
};
CopperChrome.testCore07 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut('/test');
};
CopperChrome.testCore08 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendDelete('/test');
};

CopperChrome.testCore09 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/separate';
	
	CopperChrome.sendGet('/separate');
};

CopperChrome.testCore10 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendGet('/test');
};

CopperChrome.testCore11 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/separate';
	
	CopperChrome.sendGet('/separate');
};

CopperChrome.testCore12 = function() {
	CopperChrome.testCore01(); // default Token is default
};

CopperChrome.testCore13 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/seg1/seg2/seg3';
	
	CopperChrome.sendGet('/seg1/seg2/seg3');
};

CopperChrome.testCore14 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/query?first=1&second=2&third=3';
	
	CopperChrome.sendGet('/query?first=1&second=2&third=3');
};

CopperChrome.testCore15 = function() {
	CopperChrome.testCore01(); // but lossy
};
CopperChrome.testCore16 = function() {
	CopperChrome.testCore09(); // but lossy
};

CopperChrome.testCore17 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/separate';
	
	CopperChrome.sendGet('/separate');
};

CopperChrome.testCore18 = function() {
	CopperChrome.testCore02(); // focus on Location-Path
};
CopperChrome.testCore19 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/location-query';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost('/location-query');
};

CopperChrome.testCore20a = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = '0';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/multi-format';
	
	CopperChrome.sendGet('/multi-format');
};
CopperChrome.testCore20b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = '41';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/multi-format';
	
	CopperChrome.sendGet('/multi-format');
};
CopperChrome.testCore21a = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendGet('/test');
};
CopperChrome.testCore21b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_etag').value = document.getElementById('packet_options_etag').getAttribute('label');
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';
	
	CopperChrome.sendGet('/test');
};
CopperChrome.testCore21c = function() {
	CopperChrome.testCore21b();
};

CopperChrome.testCore22a = function() {
	CopperChrome.testCore21a();
};
CopperChrome.testCore22b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut('/test');
};
CopperChrome.testCore22c = function() {
	CopperChrome.testCore22b();
};

CopperChrome.testCore23a = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_none_match').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/test';

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut('/test');
};
CopperChrome.testCore23b = function() {
	CopperChrome.testCore23a();
};

CopperChrome.testCore24 = function() {
	CopperChrome.testCore02();
};

CopperChrome.testCore25 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/location-query';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost('/location-query');
};

CopperChrome.testLink01 = function() {
	CopperChrome.reDiscover();
};

CopperChrome.testLink02 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?rt=Type1';
	
	CopperChrome.sendGet('/.well-known/core?rt=Type1');
};
CopperChrome.testLink03 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?rt=*';
	
	CopperChrome.sendGet('/.well-known/core?rt=*');
};
CopperChrome.testLink04 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?rt=Type2';
	
	CopperChrome.sendGet('/.well-known/core?rt=Type2');
};
CopperChrome.testLink05 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?if=If*';
	
	CopperChrome.sendGet('/.well-known/core?if=If*');
};
CopperChrome.testLink06 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?sz=*';
	
	CopperChrome.sendGet('/.well-known/core?sz=*');
};
CopperChrome.testLink07 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?href=/link1';
	
	CopperChrome.sendGet('/.well-known/core?href=/link1');
};
CopperChrome.testLink08 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?href=/link*';
	
	CopperChrome.sendGet('/.well-known/core?href=/link*');
};

CopperChrome.testLink09a = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/.well-known/core?ct=40';
	
	CopperChrome.sendGet('/.well-known/core?ct=40');
};
CopperChrome.testLink09b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'application/link-format';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/path';
	
	CopperChrome.sendGet('/path');
};
CopperChrome.testLink09c = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/path/sub1';
	
	CopperChrome.sendGet('/path/sub1');
};

CopperChrome.testBlock01 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_block2').value = '0';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/large';
	
	CopperChrome.sendGet('/large');
};
CopperChrome.testBlock02 = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	document.getElementById('menu_behavior_block_size_64').click();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/large';
	
	CopperChrome.sendGet('/large');
};
CopperChrome.testBlock03 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	document.getElementById('debug_option_block1').value = '0';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	    document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/large-update';
	
	CopperChrome.sendPut('/large-update');
};
CopperChrome.testBlock04 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	document.getElementById('debug_option_block1').value = '0';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	    document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + '/large-create';
	
	CopperChrome.sendPost('/large-create');
};
