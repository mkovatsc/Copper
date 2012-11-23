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
		proxy : false,
		originServer : ''
};

CopperChrome.loadPlugtest = function() {
	CopperChrome.plugtest.proxy = CopperChrome.prefManager.getBoolPref('extensions.copper.plugtest.proxy');
	CopperChrome.plugtest.originServer = CopperChrome.prefManager.getCharPref('extensions.copper.plugtest.origin-server');
	
	document.getElementById('menu_plugtest_proxy').setAttribute('checked', CopperChrome.plugtest.proxy);
};
CopperChrome.savePlugtest = function() {
	CopperChrome.prefManager.setBoolPref('extensions.copper.plugtest.proxy', CopperChrome.plugtest.proxy);
	CopperChrome.prefManager.setCharPref('extensions.copper.plugtest.origin-server', CopperChrome.plugtest.originServer);
};

CopperChrome.testSetProxy = function(target) {
	CopperChrome.plugtest.proxy = target.getAttribute('checked')=='true';
	if (CopperChrome.plugtest.proxy) CopperChrome.plugtest.originServer = prompt('Origin server base URI (coap://authority[:port])', CopperChrome.plugtest.originServer);
};



CopperChrome.testCheckUri = function(uri) {
	
	if (CopperChrome.plugtest.proxy) {
		document.getElementById('chk_debug_options').checked = true;
		document.getElementById('debug_option_proxy_uri').value = CopperChrome.plugtest.originServer + uri;
		
		uri = '/';
	} else {
		CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + uri;
	}
	
	return uri;
};

// Test scripts
////////////////////////////////////////////////////////////////////////////////

CopperChrome.testCore01 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore02 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore03 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore04 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendDelete( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore05 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore06 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore07 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore08 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendDelete( CopperChrome.testCheckUri('/test') );
};

CopperChrome.testCore09 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/separate') );
};

CopperChrome.testCore10 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/test') );
};

CopperChrome.testCore11 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/separate') );
};

CopperChrome.testCore12 = function() {
	CopperChrome.testCore01(); // default Token is default
};

CopperChrome.testCore13 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/seg1/seg2/seg3') );
};

CopperChrome.testCore14 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/query?first=1&second=2&third=3') );
};

CopperChrome.testCore15 = function() {
	CopperChrome.testCore01(); // but lossy
};
CopperChrome.testCore16 = function() {
	CopperChrome.testCore09(); // but lossy
};

CopperChrome.testCore17 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/separate') );
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
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost( CopperChrome.testCheckUri('/location-query') );
};

CopperChrome.testCore20a = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = '0';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/multi-format') );
};
CopperChrome.testCore20b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = '41';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/multi-format') );
};
CopperChrome.testCore21a = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore21b = function() {
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_21a first and ensure the response contains the ETag option.');
		return;
	}
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_etag').value = document.getElementById('packet_options_etag').getAttribute('label');
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/test') );
};
CopperChrome.testCore21c = function() {
	CopperChrome.testCore21b();
};

CopperChrome.testCore22a = function() {
	CopperChrome.testCore21a();
};
CopperChrome.testCore22b = function() {
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_22a first and ensure the response contains the ETag option.');
		return;
	}
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut( CopperChrome.testCheckUri('/test') );
	
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
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPut( CopperChrome.testCheckUri('/test') );
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
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Small payload';
	
	CopperChrome.sendPost( CopperChrome.testCheckUri('/location-query') );
};

CopperChrome.testLink01 = function() {
	CopperChrome.reDiscover();
};

CopperChrome.testLink02 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?rt=Type1') );
};
CopperChrome.testLink03 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?rt=*') );
};
CopperChrome.testLink04 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?rt=Type2') );
};
CopperChrome.testLink05 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?if=If*') );
};
CopperChrome.testLink06 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?sz=*') );
};
CopperChrome.testLink07 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?href=/link1') );
};
CopperChrome.testLink08 = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?href=/link*') );
};

CopperChrome.testLink09a = function() {
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/.well-known/core?ct=40') );
};
CopperChrome.testLink09b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'application/link-format';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/path') );
};
CopperChrome.testLink09c = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/path/sub1') );
};

CopperChrome.testBlock01 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_block2').value = '0';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/large') );
};
CopperChrome.testBlock02 = function() {
	CopperChrome.resetDebugOptions();
	
	document.getElementById('menu_behavior_block_size_64').click();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/large') );
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
	CopperChrome.updateBehavior();

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.sendPut( CopperChrome.testCheckUri('/large-update') );
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
	CopperChrome.updateBehavior();

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.sendPost( CopperChrome.testCheckUri('/large-create') );
};

CopperChrome.testObs01 = function() {
	if (document.getElementById('toolbar_observe').label == 'Cancel ') {
		CopperChrome.behavior.observeCancellation = 'rst';
		CopperChrome.updateBehavior();
		document.getElementById('toolbar_observe').click();
	}
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.observeToken = true;
	CopperChrome.updateBehavior();
	
	CopperChrome.testCheckUri('/obs');
	
	document.getElementById('toolbar_observe').click();
};
CopperChrome.testObs02 = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_observe').value = '0';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.showUnknown = true;
	CopperChrome.behavior.rejectUnknown = false;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( CopperChrome.testCheckUri('/obs') );
};
CopperChrome.testObs03 = function() {
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		alert('Run OBS_01 first and wait for notifications.');
		return;
	}
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.observeCancellation = 'get';
	CopperChrome.updateBehavior();
	
	CopperChrome.testCheckUri('/obs');
	
	document.getElementById('toolbar_observe').click();
};
CopperChrome.testObs04 = function() {
	alert('The Max-Age entry option turns red when the representation becomes stale.');
	
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		CopperChrome.testObs01();
	}
};
CopperChrome.testObs05 = function() {
	document.location.reload();
};
CopperChrome.testObs06 = function() {
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		alert('Run OBS_01 first and wait for notifications.');
		return;
	}
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.observeCancellation = 'rst';
	CopperChrome.updateBehavior();
	
	CopperChrome.testCheckUri('/obs');
	
	document.getElementById('toolbar_observe').click();
};
CopperChrome.testObs08 = function() {
	if (document.getElementById('toolbar_observe').label != 'Cancel ' || !document.getElementById('packet_options_content-format')) {
		alert('Run OBS_01 first and wait for notifications with the Content-Format option.');
		return;
	}

	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = parseInt( Math.random() * 0x10000);
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'random Content-Format ' + document.getElementById('debug_option_content_type').value;
	
	CopperChrome.doUpload(Copper.PUT, CopperChrome.testCheckUri('/obs') ); // does not call cancelTransactions()
};
CopperChrome.testObs09 = function() {
	if (document.getElementById('toolbar_observe').label != 'Cancel ' || !document.getElementById('packet_options_content-format')) {
		alert('Run OBS_01 first and wait for notifications with the Content-Format option.');
		return;
	}
	
	alert('Due to Firefox\'s stream-based UDP API, the ACK and the notification are probably concatenated.\n(One message appears to be missing, the other has a funny payload.)');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = document.getElementById('packet_options_content-format').getAttribute('label');
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = false; // set to false to avoid retransmission due to concatenation problem
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = document.getElementById('debug_option_content_type').value;
	
	CopperChrome.doUpload(Copper.PUT, CopperChrome.testCheckUri('/obs') ); // does not call cancelTransactions()
};
