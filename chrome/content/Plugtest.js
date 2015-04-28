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
 *         Automated Plugtests
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Copper.plugtest = {
		list : null,
		current : 0,
		proxy : false,
		originServer : ''
};

Copper.loadPlugtest = function() {	
	Copper.plugtest.list = document.getElementById('menu_plugtest_popup').getElementsByTagName('menuitem');
	Copper.plugtest.current = Copper.prefManager.getIntPref('extensions.copper.plugtest.current');
	
	Copper.plugtest.proxy = Copper.prefManager.getBoolPref('extensions.copper.plugtest.proxy');
	Copper.plugtest.originServer = Copper.prefManager.getCharPref('extensions.copper.plugtest.origin-server');
	
	document.getElementById('menu_plugtest_proxy').setAttribute('checked', Copper.plugtest.proxy);
	document.getElementById('toolbar_plugtest_exec').setAttribute('label', Copper.plugtest.list[Copper.plugtest.current].label);
};

Copper.savePlugtest = function() {
	Copper.prefManager.setIntPref('extensions.copper.plugtest.current', Copper.plugtest.current);
	Copper.prefManager.setBoolPref('extensions.copper.plugtest.proxy', Copper.plugtest.proxy);
	Copper.prefManager.setCharPref('extensions.copper.plugtest.origin-server', Copper.plugtest.originServer);
};

Copper.testSetProxy = function(target) {
	Copper.plugtest.proxy = target.getAttribute('checked')=='true';
	if (Copper.plugtest.proxy) Copper.plugtest.originServer = prompt('Origin server base URI (coap://authority[:port])', Copper.plugtest.originServer);
};

Copper.testSelect = function(target) {
	
	for (var num in Copper.plugtest.list) {
		if (Copper.plugtest.list[num].id==target.id) {
			
			Copper.plugtest.current = parseInt(num) + 1;
			document.getElementById('toolbar_plugtest_exec').label = Copper.plugtest.list[Copper.plugtest.current].label;
			Copper.prefManager.setIntPref('extensions.copper.plugtest.current', Copper.plugtest.current);
			return;
		}
	}
};

Copper.testNext = function(uri) {

	if (Copper.plugtest.current < Copper.plugtest.list.length) {
		Copper.plugtest.list[Copper.plugtest.current].click();
	} else {
		Copper.plugtest.current = 0;
		document.getElementById('toolbar_plugtest_exec').label = Copper.plugtest.list[Copper.plugtest.current].label;
	}
}; 

Copper.updateTestURI = function(uri) {
	
	if (Copper.plugtest.proxy) {
		while (Copper.plugtest.originServer.indexOf('coap://')!=0) {
			Copper.plugtest.originServer = prompt('Origin server base URI not set (coap://authority[:port])', Copper.plugtest.originServer);
		}
		
		document.getElementById('chk_debug_options').checked = true;
		document.getElementById('debug_option_proxy_uri').value = Copper.plugtest.originServer + uri;
		
		uri = '/';
	} else {
		Copper.mainWindow.document.getElementById('urlbar').value = 'coap://' + Copper.hostname + ':' + Copper.port + uri;
	}
	
	return uri;
};

Copper.checkContentFormat = function(message) {
	if (message.getPayload().length>0 && message.isSuccess() && message.getContentFormat()==null) alert("Fail: Payload should have Content-Format");
};

// CORE Tests
////////////////////////////////////////////////////////////////////////////////

Copper.testCore01 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore01');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet( uri, Copper.testCore01checker );
};
Copper.testCore01checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};

Copper.testCore02 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore02');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendDelete( uri, Copper.testCore02checker );
};
Copper.testCore02checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_02_DELETED) alert("Fail: Code should be 2.02");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore03 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore03');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC03';
	
	Copper.sendPut( uri, Copper.testCore03checker );
};
Copper.testCore03checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore04 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore04');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC04';
	
	Copper.sendPost( uri, Copper.testCore04checker );
};
Copper.testCore04checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore05 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore05');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore05checker );
};
Copper.testCore05checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};

Copper.testCore06 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore06');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendDelete(uri, Copper.testCore06checker );
};
Copper.testCore06checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_02_DELETED) alert("Fail: Code should be 2.02");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore07 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore07');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC07';
	
	Copper.sendPut(uri, Copper.testCore07checker );
};
Copper.testCore07checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore08 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore08');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC08';
	
	Copper.sendPost(uri, Copper.testCore08checker );
};
Copper.testCore08checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testCore09state = 0;
Copper.testCore09 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/separate'), 'testCore09');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.testCore09state = 1;
	
	Copper.sendGet(uri, Copper.testCore09checker );
};
Copper.testCore09checker = function(message) {
	Copper.defaultHandler(message);
	
	if (Copper.testCore09state == 1 && message.getType()==Copper.MSG_TYPE_CON) {
		alert("Info: Implicit acknowledgement since ACK was lost.");
		Copper.testCore09state = 2;
	}

	if (Copper.testCore09state == 1) {
		if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
		if (message.getCode()!=0) alert("Fail: Code should be empty");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");

		Copper.testCore09state = 2;
		
	} else if (Copper.testCore09state == 2) {
		if (message.getType()!=Copper.MSG_TYPE_CON) alert("Fail: Type should be CON");
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");

		Copper.testCore09state = 0;
	} else {
		alert("Fail: Sequence for separate response went wrong.");
		Copper.testCore09state = 0;
	}
};

Copper.testCore10 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore10');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore10checker );
};
Copper.testCore10checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='0xBEEF') alert("Fail: Token should be 0xBEEF");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};

Copper.testCore11state = 0;
Copper.testCore11 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/separate'), 'testCore11');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.testCore11state = 1;
	
	Copper.sendGet(uri, Copper.testCore11checker );
};
Copper.testCore11checker = function(message) {
	Copper.defaultHandler(message);
	
	if (Copper.testCore11state == 1 && message.getType()==Copper.MSG_TYPE_CON) {
		alert("Info: Implicit acknowledgement since ACK was lost.");
		Copper.testCore11state = 2;
	}

	if (Copper.testCore11state == 1) {
		if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
		if (message.getCode()!=0) alert("Fail: Code should be empty");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");

		Copper.testCore11state = 2;
		
	} else if (Copper.testCore11state == 2) {
		if (message.getType()!=Copper.MSG_TYPE_CON) alert("Fail: Type should be CON");
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='0xBEEF') alert("Fail: Token should be 0xBEEF");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");

		Copper.testCore11state = 0;
	} else {
		alert("Fail: Sequence for separate response went wrong.");
		Copper.testCore11state = 0;
	}
};

Copper.testCore12 = function() {
	Copper.testCore01(); // empty Token is default
};

Copper.testCore13 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/seg1/seg2/seg3'), 'testCore13');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore01checker );
};

Copper.testCore14 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/query?first=1&second=2&third=3'), 'testCore14');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore01checker );
};

Copper.testCore15 = function() {
	Copper.testCore01(); // but lossy
};
Copper.testCore16 = function() {
	Copper.testCore09(); // but lossy
};

Copper.testCore17 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/separate'), 'testCore17');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore17checker );
};
Copper.testCore17checker = function(message) {
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};

Copper.testCore18 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/test'), 'testCore18');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC18';
	
	Copper.sendPost( uri, Copper.testCore18checker );
};
Copper.testCore18checker = function(message) {
	var CHECK_LOCATION = '/location1/location2/location3';
	
	Copper.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
	
	if (!document.getElementById('packet_options_location-path') || document.getElementById('packet_options_location-path').getAttribute('label')!=CHECK_LOCATION) alert("Fail: Location should be " + CHECK_LOCATION);
};
Copper.testCore19 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/location-query'), 'testCore19');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC19';
	
	Copper.sendPost(uri, Copper.testCore19checker );
};
Copper.testCore19checker = function(message) {
	var CHECK_LQ1 = 'first=1';
	var CHECK_LQ2 = 'second=2';
	
	Copper.defaultHandler(message);

	if (message.getCode()!=0 ) { // spec allows separate response
		if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		Copper.checkContentFormat(message);
		
		var lq = document.getElementById('packet_options_location-query') ? document.getElementById('packet_options_location-query').getAttribute('label') : '';
		
		if (lq.indexOf(CHECK_LQ1)<0 || lq.indexOf(CHECK_LQ2)<0) alert("Fail: Location-Query should contain " + CHECK_LQ1 + " and " + CHECK_LQ2);
	}
};

Copper.testCore20a = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/multi-format'), 'testCore20a');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = Copper.CONTENT_TYPE_TEXT_PLAIN;

	// ensure behavior in first step
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore20achecker );
};
Copper.testCore20achecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentFormat()!=Copper.CONTENT_TYPE_TEXT_PLAIN) alert("Fail: Content-Format should be " + Copper.getContentFormatName(Copper.CONTENT_TYPE_TEXT_PLAIN));
	}
};
Copper.testCore20b = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/multi-format'), 'testCore20b');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = Copper.CONTENT_TYPE_APPLICATION_XML;
	
	Copper.sendGet(uri, Copper.testCore20bchecker );
};
Copper.testCore20bchecker = function(message) {
	
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentFormat()!=Copper.CONTENT_TYPE_APPLICATION_XML) alert("Fail: Content-Format should be " + Copper.getContentFormatName(Copper.CONTENT_TYPE_APPLICATION_XML));
	}
};

Copper.testCore21a = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore21a');
	
	Copper.resetDebugOptions();
	
	// ensure behavior in first step
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testCore21achecker );
};
Copper.testCore21achecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getETag()==null) alert("Fail: ETag should be set");
		if (document.getElementById('debug_option_etag').value == document.getElementById('packet_options_etag').getAttribute('label')) alert("Fail: ETag should be different from Debug Control.");
	}
};

Copper.testCore21b = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore21b');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_21a first and ensure the response contains the ETag option.');
		return;
	}
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_etag').value = document.getElementById('packet_options_etag').getAttribute('label');
	
	Copper.sendGet(uri, Copper.testCore21bchecker );
};
Copper.testCore21bchecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_03_VALID) alert("Fail: Code should be 2.03");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");
		if (message.getETag()!=document.getElementById('debug_option_etag').value) alert("Fail: ETag should be " + document.getElementById('debug_option_etag').value);
	}
};

Copper.testCore21c = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore21c');
	
	if (!document.getElementById('packet_options_etag') || document.getElementById('debug_option_etag').value != document.getElementById('packet_options_etag').getAttribute('label')) {
		alert('Run CORE_21b first and ensure the response contains the ETag option set in Debug Control.');
		return;
	}
	
	alert('Make sure the resource /validate changed (e.g., by using a second client or a smart resource implementation).');

	Copper.sendGet(uri, Copper.testCore21achecker );
};

Copper.testCore22a = function() {
	Copper.testCore21a();
};
Copper.testCore22b = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore22b');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_22a first and ensure the response contains the ETag option.');
		return;
	}
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC22b';
	
	// make sure to PUT a different payload
	if (document.getElementById('payload_text').value==document.getElementById('packet_payload').value) {
		document.getElementById('payload_text').value += '*';
	}
	
	Copper.sendPut(uri, Copper.testCore22bchecker );
};
Copper.testCore22bchecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		Copper.checkContentFormat(message);
	}
};

Copper.testCore22c = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore22c');
	
	if (document.getElementById('debug_option_if_match').value=='') {
		alert('Run CORE_22b first and ensure the If-Match option was set.');
		return;
	}
	
	document.getElementById('chk_debug_options').checked = false;
	
	Copper.sendGet(uri, Copper.testCore22cchecker );
};
Copper.testCore22cchecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (Copper.bytes2str(message.getPayload()).indexOf(document.getElementById('payload_text').value)==-1) alert("Fail: Payload should be " + document.getElementById('payload_text').value);
		if (document.getElementById('debug_option_if_match').value == document.getElementById('packet_options_etag').getAttribute('label')) alert("Fail: ETag should be different from If-Match.");
	}
};

Copper.testCore22d = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/validate'), 'testCore22d');
	
	alert('Make sure the resource /validate changed (e.g., by using a second client or a smart resource implementation).');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_22c first and ensure the response contains the ETag option.');
		return;
	}
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC22d';
	
	// make sure to PUT a different payload
	if (document.getElementById('payload_text').value==document.getElementById('packet_payload').value) {
		document.getElementById('payload_text').value += '*';
	}
	
	Copper.sendPut(uri, Copper.testCore22dchecker );
};
Copper.testCore22dchecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_4_12_PRECONDITION_FAILED) alert("Fail: Code should be 4.12");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		Copper.checkContentFormat(message);
	}
};

Copper.testCore09state = 0;
Copper.testCore23a = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/create1'), 'testCore23a');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_none_match').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';

	// ensure behavior in first step
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'Copper (Cu) CC23';
	
	Copper.sendPut(uri, Copper.testCore23achecker);
};
Copper.testCore23achecker = function(message) {
	Copper.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (Copper.testCore09state==0) {
			if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
			if (message.getToken()!='empty') alert("Fail: Token should be empty");
		} else {
			if (message.getCode()!=Copper.CODE_4_12_PRECONDITION_FAILED) alert("Fail: Code should be 4.12");
			if (message.getToken()!='empty') alert("Fail: Token should be empty");
			
			Copper.testCore09state = 0;
		}
		Copper.checkContentFormat(message);
	}
};

Copper.testCore23b = function() {
	Copper.testCore09state = 1;
	Copper.testCore23a();
};

// BLOCK Tests
////////////////////////////////////////////////////////////////////////////////

Copper.testBlock01 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/large'), 'testBlock01');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 64; // early negotiation in CB01
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testBlock01checker);
};
Copper.testBlock01checker = function(message) {
	if (message.getBlock2Number()<=0) alert("Fail: Block2 should be set");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};

Copper.testBlock02size = 0;
Copper.testBlock02 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/large'), 'testBlock02');
	
	Copper.resetDebugOptions();
	
	Copper.testBlock02size = 0;
	Copper.downloadHandler = null;
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0; // late negotiation in CB02
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testBlock02checker);
};

Copper.testBlock02checker = function(message) {
	
	if (Copper.downloadHandler==null) {
		if (!message.isOption(Copper.OPTION_BLOCK2)) {
			alert('Fail: Block should be negotiated');
		} else {
			Copper.testBlock02size = message.getBlock2Size();
			Copper.downloadHandler = Copper.testBlock02checker;
			Copper.defaultHandler(message);
		}
	} else {
		if (message.getBlock2Number()<=0) alert("Fail: Block2 should be set");
		if (message.getBlock2Size()!=Copper.testBlock02size) alert("Block size should be " + Copper.testBlock02size);
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='empty') alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
		
		Copper.testBlock02size = 0;
	}
};

Copper.testBlock03 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/large-update'), 'testBlock03');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 64;
	Copper.updateBehavior();

	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text').value += '|-[this line only has 34 bytes]-|\n';
	
	Copper.sendPut(uri, Copper.testBlock03checker);
};
Copper.testBlock03checker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23");
	if (message.getBlock2Size()>64) alert("Block size should be 64 or smaller");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
};

Copper.testBlock04 = function() {
	
	var uri = Copper.checkUri( Copper.updateTestURI('/large-create'), 'testBlock04');

	alert('Check for 2.31 Continue during transfer.');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 64;
	Copper.updateBehavior();

	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text').value += '|-[this line only has 34 bytes]-|\n';
	
	Copper.sendPost(uri, Copper.testBlock04checker);
};
Copper.testBlock04checker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23 (maybe smaller blocks?)");
	if (message.getBlock1Size()>64) alert("Block1 size should be 64 or smaller");
	if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getLocation()==null) alert("Fail: No Location option");
	Copper.checkContentFormat(message);
};

Copper.testBlock05 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/large-post'), 'testBlock05');
	
	alert('Check for 2.31 Continue during transfer.');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'text/plain';
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 64;
	Copper.updateBehavior();

	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text').value += '|-[this line only has 34 bytes]-|\n';
	
	Copper.sendPost(uri, Copper.testBlock05achecker);
};
Copper.testBlock05achecker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23 (maybe smaller blocks?)");
	if (message.getBlock1Size()>64) alert("Block1 size should be 64 or smaller");
	if (!message.isOption(Copper.OPTION_BLOCK2)) alert("Block2 should be set");
	if (!message.getBlock2More()) alert("Block2 should have the more bit set");
	
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	Copper.checkContentFormat(message);
	
	Copper.downloadHandler = Copper.testBlock05bchecker;
};
Copper.testBlock05bchecker = function(message) {
	if (!message.isOption(Copper.OPTION_BLOCK2)) alert("Block2 should be set");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	Copper.checkContentFormat(message);
	
	Copper.downloadHandler = null;
};

Copper.testBlock06 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/large'), 'testBlock06');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 16; // early negotiation in CB01
	Copper.updateBehavior();
	
	Copper.sendGet(uri, Copper.testBlock06checker);
};
Copper.testBlock06checker = function(message) {
	if (message.getBlock2Number()<=0) alert("Fail: Block2 should be set");
	if (message.getBlock2Size()!=16) alert("Fail: Block size should be 16");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='empty') alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentFormat()==null) alert("Fail: Content-Format should be set");
};



Copper.testLink01 = function() {
	Copper.userDiscover();
};

Copper.testLink02 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?rt=Type1'), 'testLink02');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink03 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?rt=*'), 'testLink03');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink04 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?rt=Type2'), 'testLink04');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink05 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?if=If*'), 'testLink05');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink06 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?sz=*'), 'testLink06');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink07 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?href=/link1'), 'testLink07');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};
Copper.testLink08 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?href=/link*'), 'testLink08');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};

Copper.testLink09a = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/.well-known/core?ct=40'), 'testLink09a');
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.sendGet(uri );
};

// TODO use result
Copper.testLink09b = function() {
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = 'application/link-format';
	
	Copper.sendGet( Copper.updateTestURI('/path') );
};
Copper.testLink09c = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	Copper.sendGet( Copper.updateTestURI('/path/sub1') );
};

Copper.testObs01 = function() {
	var uri = Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs01'); // unused since we "click" observe
	
	if (document.getElementById('toolbar_observe').label == 'Cancel ') {
		Copper.behavior.observeCancellation = 'get';
		Copper.updateBehavior();
		document.getElementById('toolbar_observe').click();
		window.setImmediate(function() { Copper.testObs01(); });
		return;
	}
	
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.behavior.observeToken = true;
	Copper.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};

Copper.testObs06 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs06');
	
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		alert('Run OBS_01 first and wait for notifications.');
		return;
	}
	
	// reactive cancellation
	Copper.behavior.observeCancellation = 'rst';
	Copper.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};

Copper.testObs02 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs-non'), 'testObs02');
	
	// cancel existing observe
	if (document.getElementById('toolbar_observe').label == 'Cancel ') {
		Copper.behavior.observeCancellation = 'get';
		Copper.updateBehavior();
		document.getElementById('toolbar_observe').click();
		window.setImmediate(function() { Copper.testObs02(); });
		return;
	}
	
	// start new observe
	Copper.resetDebugOptions();
	
	Copper.behavior.requests = 'non';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.behavior.observeToken = true;
	Copper.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};
Copper.testObs12 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs-non'), 'testObs12');

	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		alert('Run OBS_02 first and wait for notifications.');
		return;
	}
	
	// proactive cancellation
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.behavior.observeCancellation = 'get';
	Copper.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};

Copper.testObs04 = function() {
	alert('Once Copper receives notifications, turn off the server.\nThe Max-Age entry option turns red when the representation becomes stale as an indicator to re-register.');
	
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		Copper.testObs01();
	}
};

Copper.testObs05 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs-non'), 'testObs05');
	
	alert('Copper will reboot after two notifications (12 seconds).\nUse Wireshark to confirm that the server eventually stops sending notifications.');

	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		Copper.testObs02();
	}
	
	window.setTimeout(
		function() {
			// prevent check
			delete Copper.observer.subscription;
			// reload
			document.location.reload();
		},
		12000);
};

Copper.testObs07 = function() {

	Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs07');
	
	alert('Copper will delete the resource after two notifications (12 seconds).\nConfirm that the server stops sending notifications after sending a 4.04 Not Found.');

	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		Copper.testObs01();
	}
	
	window.setTimeout(
			function() { Copper.sendDelete('/obs'); },
			12000);
};

Copper.testObs08 = function() {

	Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs08');

	alert('Copper will change the resource with a new Content-Format after two notifications (12 seconds).\nConfirm that the server stops sending notifications after sending a 4.06 Not Acceptable.');

	if (document.getElementById('toolbar_observe').label != 'Cancel ' || !document.getElementById('packet_options_content-format')) {
		Copper.testObs01();
	}

	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = parseInt( Math.random() * 0x10000);
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = 'random Content-Format ' + document.getElementById('debug_option_content_format').value;
	
	window.setTimeout(
			function() { Copper.doUpload(Copper.PUT, Copper.updateTestURI('/obs') ); }, // does not call cancelTransactions()
			12000);
};

Copper.testObs09 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs08');

	alert('Copper will change the resource with the same Content-Format after two notifications (12 seconds).\nConfirm that the server sends a notifications with the Content-Format name as payload.');

	if (document.getElementById('toolbar_observe').label != 'Cancel ' || !document.getElementById('packet_options_content-format')) {
		Copper.testObs01();
	}
	
	alert('Due to Firefox\'s stream-based UDP API, the ACK and the notification are probably concatenated.\n(One message appears to be missing, the other has a funny payload.)');
	
	Copper.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_format').value = document.getElementById('packet_options_content-format').getAttribute('label');
	
	Copper.behavior.requests = 'con';
	Copper.behavior.retransmissions = true;
	Copper.behavior.sendDuplicates = false;
	Copper.behavior.blockSize = 0;
	Copper.updateBehavior();
	
	Copper.payload.mode = 'text';
	document.getElementById('payload_text').value = document.getElementById('debug_option_content_format').value;
	
	window.setTimeout(
			function() { Copper.doUpload(Copper.PUT, Copper.updateTestURI('/obs') ); }, // does not call cancelTransactions()
			12000);
};

Copper.testObs10 = function() {
	Copper.checkUri( Copper.updateTestURI('/obs'), 'testObs10'); // unused since we "click" observe
	
	alert('Copper will send an unrelated GET request after two notifications (12 seconds).\nConfirm the response and continuous notifications in the log.');
	
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		Copper.testObs01();
	}
	
	window.setTimeout(
			function() { Copper.sendGet('/obs'); },
			12000);
};
