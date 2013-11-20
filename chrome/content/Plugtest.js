/*******************************************************************************
 * Copyright (c) 2013, Institute for Pervasive Computing, ETH Zurich.
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
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

CopperChrome.plugtest = {
		list : null,
		current : 0,
		proxy : false,
		originServer : ''
};

CopperChrome.loadPlugtest = function() {	
	CopperChrome.plugtest.list = document.getElementById('menu_plugtest_popup').getElementsByTagName('menuitem');
	CopperChrome.plugtest.current = CopperChrome.prefManager.getIntPref('extensions.copper.plugtest.current');
	
	CopperChrome.plugtest.proxy = CopperChrome.prefManager.getBoolPref('extensions.copper.plugtest.proxy');
	CopperChrome.plugtest.originServer = CopperChrome.prefManager.getCharPref('extensions.copper.plugtest.origin-server');
	
	document.getElementById('menu_plugtest_proxy').setAttribute('checked', CopperChrome.plugtest.proxy);
	document.getElementById('toolbar_plugtest_exec').setAttribute('label', CopperChrome.plugtest.list[CopperChrome.plugtest.current].label);
};

CopperChrome.savePlugtest = function() {
	CopperChrome.prefManager.setIntPref('extensions.copper.plugtest.current', CopperChrome.plugtest.current);
	CopperChrome.prefManager.setBoolPref('extensions.copper.plugtest.proxy', CopperChrome.plugtest.proxy);
	CopperChrome.prefManager.setCharPref('extensions.copper.plugtest.origin-server', CopperChrome.plugtest.originServer);
};

CopperChrome.testSetProxy = function(target) {
	CopperChrome.plugtest.proxy = target.getAttribute('checked')=='true';
	if (CopperChrome.plugtest.proxy) CopperChrome.plugtest.originServer = prompt('Origin server base URI (coap://authority[:port])', CopperChrome.plugtest.originServer);
};

CopperChrome.testSelect = function(target) {
	
	for (var num in CopperChrome.plugtest.list) {
		if (CopperChrome.plugtest.list[num].id==target.id) {
			
			CopperChrome.plugtest.current = parseInt(num) + 1;
			document.getElementById('toolbar_plugtest_exec').label = CopperChrome.plugtest.list[CopperChrome.plugtest.current].label;
			CopperChrome.prefManager.setIntPref('extensions.copper.plugtest.current', CopperChrome.plugtest.current);
			return;
		}
	}
};

CopperChrome.testNext = function(uri) {

	if (CopperChrome.plugtest.current < CopperChrome.plugtest.list.length) {
		CopperChrome.plugtest.list[CopperChrome.plugtest.current].click();
	} else {
		CopperChrome.plugtest.current = 0;
		document.getElementById('toolbar_plugtest_exec').label = CopperChrome.plugtest.list[CopperChrome.plugtest.current].label;
	}
}; 

CopperChrome.updateTestURI = function(uri) {
	
	if (CopperChrome.plugtest.proxy) {
		while (CopperChrome.plugtest.originServer.indexOf('coap://')!=0) {
			CopperChrome.plugtest.originServer = prompt('Origin server base URI not set (coap://authority[:port])', CopperChrome.plugtest.originServer);
		}
		
		document.getElementById('chk_debug_options').checked = true;
		document.getElementById('debug_option_proxy_uri').value = CopperChrome.plugtest.originServer + uri;
		
		uri = '/';
	} else {
		CopperChrome.mainWindow.document.getElementById('urlbar').value = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + uri;
	}
	
	return uri;
};

CopperChrome.checkContentFormat = function(message) {
	if (message.getPayload().length>0 && message.isSuccess() && message.getContentType()==null) alert("Fail: Payload should have Content-Format");
};

// CORE Tests
////////////////////////////////////////////////////////////////////////////////

CopperChrome.testCore01 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore01');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet( uri, CopperChrome.testCore01checker );
};
CopperChrome.testCore01checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentType()==null) alert("Fail: Content-Format should be set");
};

CopperChrome.testCore02 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore02');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendDelete( uri, CopperChrome.testCore02checker );
};
CopperChrome.testCore02checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_02_DELETED) alert("Fail: Code should be 2.02");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore03 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore03');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC03';
	
	CopperChrome.sendPut( uri, CopperChrome.testCore03checker );
};
CopperChrome.testCore03checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore04 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore04');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC04';
	
	CopperChrome.sendPost( uri, CopperChrome.testCore04checker );
};
CopperChrome.testCore04checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore05 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore05');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore05checker );
};
CopperChrome.testCore05checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentType()==null) alert("Fail: Content-Format should be set");
};

CopperChrome.testCore06 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore06');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendDelete(uri, CopperChrome.testCore06checker );
};
CopperChrome.testCore06checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_02_DELETED) alert("Fail: Code should be 2.02");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore07 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore07');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC07';
	
	CopperChrome.sendPut(uri, CopperChrome.testCore07checker );
};
CopperChrome.testCore07checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore08 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore08');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC08';
	
	CopperChrome.sendPost(uri, CopperChrome.testCore08checker );
};
CopperChrome.testCore08checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED && message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.04 or 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testCore09state = 0;
CopperChrome.testCore09 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/separate'), 'testCore09');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.testCore09state = 1;
	
	CopperChrome.sendGet(uri, CopperChrome.testCore09checker );
};
CopperChrome.testCore09checker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (CopperChrome.testCore09state == 1 && message.getType()==Copper.MSG_TYPE_CON) {
		alert("Info: Implicit acknowledgement since ACK was lost.");
		CopperChrome.testCore09state = 2;
	}

	if (CopperChrome.testCore09state == 1) {
		if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
		if (message.getCode()!=0) alert("Fail: Code should be empty");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");

		CopperChrome.testCore09state = 2;
		
	} else if (CopperChrome.testCore09state == 2) {
		if (message.getType()!=Copper.MSG_TYPE_CON) alert("Fail: Type should be CON");
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentType()==null) alert("Fail: Content-Format should be set");

		CopperChrome.testCore09state = 0;
	} else {
		alert("Fail: Sequence for separate response went wrong.");
		CopperChrome.testCore09state = 0;
	}
};

CopperChrome.testCore10 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore10');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore10checker );
};
CopperChrome.testCore10checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!='0xBEEF') alert("Fail: Token should be 0xBEEF");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentType()==null) alert("Fail: Content-Format should be set");
};

CopperChrome.testCore11state = 0;
CopperChrome.testCore11 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/separate'), 'testCore11');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_token').value = '0xBEEF';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.testCore11state = 1;
	
	CopperChrome.sendGet(uri, CopperChrome.testCore11checker );
};
CopperChrome.testCore11checker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (CopperChrome.testCore11state == 1 && message.getType()==Copper.MSG_TYPE_CON) {
		alert("Info: Implicit acknowledgement since ACK was lost.");
		CopperChrome.testCore11state = 2;
	}

	if (CopperChrome.testCore11state == 1) {
		if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
		if (message.getCode()!=0) alert("Fail: Code should be empty");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");

		CopperChrome.testCore11state = 2;
		
	} else if (CopperChrome.testCore11state == 2) {
		if (message.getType()!=Copper.MSG_TYPE_CON) alert("Fail: Type should be CON");
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!='0xBEEF') alert("Fail: Token should be 0xBEEF");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentType()==null) alert("Fail: Content-Format should be set");

		CopperChrome.testCore11state = 0;
	} else {
		alert("Fail: Sequence for separate response went wrong.");
		CopperChrome.testCore11state = 0;
	}
};

CopperChrome.testCore12 = function() {
	CopperChrome.testCore01(); // empty Token is default
};

CopperChrome.testCore13 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/seg1/seg2/seg3'), 'testCore13');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore01checker );
};

CopperChrome.testCore14 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/query?first=1&second=2&third=3'), 'testCore14');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore01checker );
};

CopperChrome.testCore15 = function() {
	CopperChrome.testCore01(); // but lossy
};
CopperChrome.testCore16 = function() {
	CopperChrome.testCore09(); // but lossy
};

CopperChrome.testCore17 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/separate'), 'testCore17');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore17checker );
};
CopperChrome.testCore17checker = function(message) {
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_NON) alert("Fail: Type should be NON");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentType()==null) alert("Fail: Content-Format should be set");
};

CopperChrome.testCore18 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/test'), 'testCore18');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC18';
	
	CopperChrome.sendPost( uri, CopperChrome.testCore18checker );
};
CopperChrome.testCore18checker = function(message) {
	var CHECK_LOCATION = '/location1/location2/location3';
	
	CopperChrome.defaultHandler(message);

	if (message.getType()!=Copper.MSG_TYPE_ACK) alert("Fail: Type should be ACK");
	if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
	
	if (!document.getElementById('packet_options_location-path') || document.getElementById('packet_options_location-path').getAttribute('label')!=CHECK_LOCATION) alert("Fail: Location should be " + CHECK_LOCATION);
};
CopperChrome.testCore19 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/location-query'), 'testCore19');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC19';
	
	CopperChrome.sendPost(uri, CopperChrome.testCore19checker );
};
CopperChrome.testCore19checker = function(message) {
	var CHECK_LQ1 = 'first=1';
	var CHECK_LQ2 = 'second=2';
	
	CopperChrome.defaultHandler(message);

	if (message.getCode()!=0 ) { // spec allows separate response
		if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		CopperChrome.checkContentFormat(message);
		
		var lq = document.getElementById('packet_options_location-query').getAttribute('label');
		
		if (lq.indexOf(CHECK_LQ1)<0 || lq.indexOf(CHECK_LQ2)<0) alert("Fail: Location-Query should contain " + CHECK_LQ1 + " and " + CHECK_LQ2);
	}
};

CopperChrome.testCore20a = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/multi-format'), 'testCore20a');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = Copper.CONTENT_TYPE_TEXT_PLAIN;

	// ensure behavior in first step
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore20achecker );
};
CopperChrome.testCore20achecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentType()!=Copper.CONTENT_TYPE_TEXT_PLAIN) alert("Fail: Content-Format should be " + Copper.getContentTypeName(Copper.CONTENT_TYPE_TEXT_PLAIN));
	}
};
CopperChrome.testCore20b = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/multi-format'), 'testCore20b');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_accept').value = Copper.CONTENT_TYPE_APPLICATION_XML;
	
	CopperChrome.sendGet(uri, CopperChrome.testCore20bchecker );
};
CopperChrome.testCore20bchecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentType()!=Copper.CONTENT_TYPE_APPLICATION_XML) alert("Fail: Content-Format should be " + Copper.getContentTypeName(Copper.CONTENT_TYPE_APPLICATION_XML));
	}
};

CopperChrome.testCore21a = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore21a');
	
	CopperChrome.resetDebugOptions();
	
	// ensure behavior in first step
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testCore21achecker );
};
CopperChrome.testCore21achecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getETag()==null) alert("Fail: ETag should be set");
		if (document.getElementById('debug_option_etag').value == document.getElementById('packet_options_etag').getAttribute('label')) alert("Fail: ETag should be different from Debug Control.");
	}
};

CopperChrome.testCore21b = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore21b');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_21a first and ensure the response contains the ETag option.');
		return;
	}
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_etag').value = document.getElementById('packet_options_etag').getAttribute('label');
	
	CopperChrome.sendGet(uri, CopperChrome.testCore21bchecker );
};
CopperChrome.testCore21bchecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_03_VALID) alert("Fail: Code should be 2.03");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length!=0) alert("Fail: Payload should be empty");
		if (message.getETag()!=document.getElementById('debug_option_etag').value) alert("Fail: ETag should be " + document.getElementById('debug_option_etag').value);
	}
};

CopperChrome.testCore21c = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore21c');
	
	if (!document.getElementById('packet_options_etag') || document.getElementById('debug_option_etag').value != document.getElementById('packet_options_etag').getAttribute('label')) {
		alert('Run CORE_21b first and ensure the response contains the ETag option set in Debug Control.');
		return;
	}
	
	alert('Make sure the resource /validate changed (e.g., by using a second client or a smart resource implementation).');

	CopperChrome.sendGet(uri, CopperChrome.testCore21achecker );
};

CopperChrome.testCore22a = function() {
	CopperChrome.testCore21a();
};
CopperChrome.testCore22b = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore22b');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_22a first and ensure the response contains the ETag option.');
		return;
	}
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC22b';
	
	// make sure to PUT a different payload
	if (document.getElementById('payload_text_page').value==document.getElementById('packet_payload').value) {
		document.getElementById('payload_text_page').value += '*';
	}
	
	CopperChrome.sendPut(uri, CopperChrome.testCore22bchecker );
};
CopperChrome.testCore22bchecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		CopperChrome.checkContentFormat(message);
	}
};

CopperChrome.testCore22c = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore22c');
	
	if (document.getElementById('debug_option_if_match').value=='') {
		alert('Run CORE_22b first and ensure the If-Match option was set.');
		return;
	}
	
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.sendGet(uri, CopperChrome.testCore22cchecker );
};
CopperChrome.testCore22cchecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (Copper.bytes2str(message.getPayload()).indexOf(document.getElementById('payload_text_page').value)==-1) alert("Fail: Payload should be " + document.getElementById('payload_text_page').value);
		if (document.getElementById('debug_option_if_match').value == document.getElementById('packet_options_etag').getAttribute('label')) alert("Fail: ETag should be different from If-Match.");
	}
};

CopperChrome.testCore22d = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/validate'), 'testCore22d');
	
	alert('Make sure the resource /validate changed (e.g., by using a second client or a smart resource implementation).');
	
	if (!document.getElementById('packet_options_etag')) {
		alert('Run CORE_22c first and ensure the response contains the ETag option.');
		return;
	}
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_match').value = document.getElementById('packet_options_etag').getAttribute('label');
	document.getElementById('debug_option_content_type').value = 'text/plain';
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC22d';
	
	// make sure to PUT a different payload
	if (document.getElementById('payload_text_page').value==document.getElementById('packet_payload').value) {
		document.getElementById('payload_text_page').value += '*';
	}
	
	CopperChrome.sendPut(uri, CopperChrome.testCore22dchecker );
};
CopperChrome.testCore22dchecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (message.getCode()!=Copper.CODE_4_12_PRECONDITION_FAILED) alert("Fail: Code should be 4.12");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		CopperChrome.checkContentFormat(message);
	}
};

CopperChrome.testCore09state = 0;
CopperChrome.testCore23a = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/create1'), 'testCore23a');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_if_none_match').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';

	// ensure behavior in first step
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'Copper (Cu) CC23';
	
	CopperChrome.sendPut(uri, CopperChrome.testCore23achecker);
};
CopperChrome.testCore23achecker = function(message) {
	CopperChrome.defaultHandler(message);
	
	if (message.getCode()!=0) {
		if (CopperChrome.testCore09state==0) {
			if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
			if (message.getToken()!=null) alert("Fail: Token should be empty");
		} else {
			if (message.getCode()!=Copper.CODE_4_12_PRECONDITION_FAILED) alert("Fail: Code should be 4.12");
			if (message.getToken()!=null) alert("Fail: Token should be empty");
			
			CopperChrome.testCore09state = 0;
		}
		CopperChrome.checkContentFormat(message);
	}
};

CopperChrome.testCore23b = function() {
	CopperChrome.testCore09state = 1;
	CopperChrome.testCore23a();
};

// BLOCK Tests
////////////////////////////////////////////////////////////////////////////////

CopperChrome.testBlock01 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/large'), 'testBlock01');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 64; // early negotiation in CB01
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testBlock01checker);
};
CopperChrome.testBlock01checker = function(message) {
	if (message.getBlockNumber()<=0) alert("Fail: Block2 should be set");
	if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	if (message.getContentType()==null) alert("Fail: Content-Format should be set");
};

CopperChrome.testBlock02size = 0;
CopperChrome.testBlock02 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/large'), 'testBlock02');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.testBlock02size = 0;
	CopperChrome.downloadHandler = null;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0; // late negotiation in CB02
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri, CopperChrome.testBlock02checker);
};

CopperChrome.testBlock02checker = function(message) {
	
	if (CopperChrome.downloadHandler==null) {
		if (!message.isOption(Copper.OPTION_BLOCK)) {
			alert('Fail: Block should be negotiated');
		} else {
			CopperChrome.testBlock02size = message.getBlockSize();
			CopperChrome.downloadHandler = CopperChrome.testBlock02checker;
			CopperChrome.defaultHandler(message);
		}
	} else {
		if (message.getBlockNumber()<=0) alert("Fail: Block2 should be set");
		if (message.getBlockSize()!=CopperChrome.testBlock02size) alert("Block size should be " + CopperChrome.testBlock02size);
		if (message.getCode()!=Copper.CODE_2_05_CONTENT) alert("Fail: Code should be 2.05");
		if (message.getToken()!=null) alert("Fail: Token should be empty");
		if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
		if (message.getContentType()==null) alert("Fail: Content-Format should be set");
		
		CopperChrome.testBlock02size = 0;
	}
};

CopperChrome.testBlock03 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/large-update'), 'testBlock03');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 64;
	CopperChrome.updateBehavior();

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.sendPut(uri, CopperChrome.testBlock03checker);
};
CopperChrome.testBlock03checker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23");
	if (message.getBlockSize()>64) alert("Block size should be 64 or smaller");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testBlock04 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/large-create'), 'testBlock04');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 64;
	CopperChrome.updateBehavior();

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.sendPost(uri, CopperChrome.testBlock04checker);
};
CopperChrome.testBlock04checker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23 (maybe smaller blocks?)");
	if (message.getBlock1Size()>64) alert("Block1 size should be 64 or smaller");
	if (message.getCode()!=Copper.CODE_2_01_CREATED) alert("Fail: Code should be 2.01");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
};

CopperChrome.testBlock05 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/large-post'), 'testBlock05');
	
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'text/plain';
	document.getElementById('chk_debug_option_block_auto').checked = true;
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 64;
	CopperChrome.updateBehavior();

	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = '';
	for (var i=0; i<23; ++i) {
		document.getElementById('payload_text_page').value += '|---------------[each line contains 64 bytes]-----------------|\n';
	}
	document.getElementById('payload_text_page').value += '|-[this line only has 34 bytes]-|\n';
	
	CopperChrome.sendPost(uri, CopperChrome.testBlock05achecker);
};
CopperChrome.testBlock05achecker = function(message) {
	if (message.getBlock1Number()!=23) alert("Fail: Final Block1 should be 23 (maybe smaller blocks?)");
	if (message.getBlock1Size()>64) alert("Block1 size should be 64 or smaller");
	if (!message.isOption(Copper.OPTION_BLOCK)) alert("Block2 should be set");
	if (!message.getBlockMore()) alert("Block2 should have the more bit set");
	
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	CopperChrome.checkContentFormat(message);
	
	CopperChrome.downloadHandler = CopperChrome.testBlock05bchecker;
};
CopperChrome.testBlock05bchecker = function(message) {
	if (!message.isOption(Copper.OPTION_BLOCK)) alert("Block2 should be set");
	if (message.getCode()!=Copper.CODE_2_04_CHANGED) alert("Fail: Code should be 2.04");
	if (message.getToken()!=null) alert("Fail: Token should be empty");
	if (message.getPayload().length==0) alert("Fail: Payload should be non-empty");
	CopperChrome.checkContentFormat(message);
	
	CopperChrome.downloadHandler = null;
};



CopperChrome.testLink01 = function() {
	CopperChrome.userDiscover();
};

CopperChrome.testLink02 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?rt=Type1'), 'testLink02');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink03 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?rt=*'), 'testLink03');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink04 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?rt=Type2'), 'testLink04');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink05 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?if=If*'), 'testLink05');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink06 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?sz=*'), 'testLink06');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink07 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?href=/link1'), 'testLink07');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};
CopperChrome.testLink08 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?href=/link*'), 'testLink08');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};

CopperChrome.testLink09a = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/.well-known/core?ct=40'), 'testLink09a');
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	CopperChrome.sendGet(uri );
};

// TODO use result
CopperChrome.testLink09b = function() {
	CopperChrome.resetDebugOptions();
	document.getElementById('chk_debug_options').checked = true;
	document.getElementById('debug_option_content_type').value = 'application/link-format';
	
	CopperChrome.sendGet( CopperChrome.updateTestURI('/path') );
};
CopperChrome.testLink09c = function() {
	document.getElementById('chk_debug_options').checked = false;
	
	CopperChrome.sendGet( CopperChrome.updateTestURI('/path/sub1') );
};

CopperChrome.testObs01 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/obs'), 'testObs01'); // unused since we "click" observe
	
	if (document.getElementById('toolbar_observe').label == 'Cancel ') {
		CopperChrome.behavior.observeCancellation = 'rst';
		CopperChrome.updateBehavior();
		document.getElementById('toolbar_observe').click();
	}
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.behavior.observeToken = true;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};
CopperChrome.testObs02 = function() {
	var uri = CopperChrome.checkUri( CopperChrome.updateTestURI('/obs'), 'testObs02'); // unused since we "click" observe
	
	if (document.getElementById('toolbar_observe').label == 'Cancel ') {
		CopperChrome.behavior.observeCancellation = 'rst';
		CopperChrome.updateBehavior();
		document.getElementById('toolbar_observe').click();
	}
	
	CopperChrome.resetDebugOptions();
	
	CopperChrome.behavior.requests = 'non';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.behavior.observeToken = true;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_observe').click();
};
CopperChrome.testObs03 = function() {
	if (document.getElementById('toolbar_observe').label != 'Cancel ') {
		alert('Run OBS_01 first and wait for notifications.');
		return;
	}
	
	CopperChrome.behavior.requests = 'con';
	CopperChrome.behavior.retransmissions = true;
	CopperChrome.behavior.sendDuplicates = false;
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.behavior.observeCancellation = 'get';
	CopperChrome.updateBehavior();
	
	CopperChrome.updateTestURI('/obs');
	
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
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.behavior.observeCancellation = 'rst';
	CopperChrome.updateBehavior();
	
	CopperChrome.updateTestURI('/obs');
	
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
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = 'random Content-Format ' + document.getElementById('debug_option_content_type').value;
	
	CopperChrome.doUpload(Copper.PUT, CopperChrome.updateTestURI('/obs') ); // does not call cancelTransactions()
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
	CopperChrome.behavior.blockSize = 0;
	CopperChrome.updateBehavior();
	
	document.getElementById('toolbar_payload_mode').value = 'page';
	document.getElementById('payload_text_page').value = document.getElementById('debug_option_content_type').value;
	
	CopperChrome.doUpload(Copper.PUT, CopperChrome.updateTestURI('/obs') ); // does not call cancelTransactions()
};
