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
 * \file Main script file for the LWM2M DevKit.
 * 
 * \author Matthias Kovatsch <kovatsch@inf.ethz.ch>
 */

Copper.operationLog = [];
Copper.operationReportingLog = [];

Copper.resetLogger = function() {
	let rows = document.getElementById('log_messages');
	let toRemove = rows.getElementsByTagName('listitem');
	for (let r in toRemove) {
		try {rows.removeChild(toRemove[r]);} catch (ex) {};
	}
};

Copper.logMessage = function(message, out) {

	let rows = document.getElementById('log_messages');
	
	var item = document.createElement('listitem');
	item.setAttribute('allowevents', "true");
	item.style.backgroundColor = out ? '#AACCFF' : '#CCFFCC';

	var cell = document.createElement('listcell');
	cell.setAttribute('label', new Date().toLocaleTimeString()); // timestamp
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getType(true)+'-'+message.getCode(true)); // type
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getMID() + (message.isConfirmable() ? (' (' + message.getRetries() + ')') : ''));
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getToken());
	cell.tooltipText = message.getToken();
	item.appendChild(cell);
	
	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getOptions(true));
	cell.tooltipText = message.getOptions(true);
	item.appendChild(cell);

	cell = document.createElement('listcell');
	cell.setAttribute('label', message.getPayloadText());
	cell.tooltipText = message.getPayloadText();
	item.appendChild(cell);

	rows.appendChild( item );

	rows.ensureElementIsVisible(item);
};

Copper.bytes2hexedit = function(bytes) {
	
	if (bytes==null) return '';
	
	let str ='';
	let show = '';
	for (let b in bytes) {
		str += Copper.Copper.leadingZero(bytes[b].toString(16));
		show += bytes[b]<32 ? '·' : String.fromCharCode(bytes[b]);
		if (b % 16 == 15) {
			str += " | ";
			str += show;
			str += '\n';
			show = '';
		} else {
			str += ' ';
		}
	}
	return str;
}

Copper.logEvent = function(text) {
	document.getElementById('log_event_log').value += text + '\n';
};

Copper.logWarning = function(text) {
	Copper.logEvent('WARNING: ' + text);
	window.setTimeout(
			function() { alert('WARNING: '+ text); },
			0);
};

Copper.logError = function(error, skip) {
	var message = 'ERROR: ' + error.message;
	if (!skip && error.stack) {
		message += '\n\t' + error.stack.replace(/\n/, '\n\t');
	}
	Copper.logEvent(message);
	if (Copper.endpoint) {
		Copper.endpoint.cancelTransactions();
	}
	window.setTimeout(
			function(msg) { alert(msg); },
			0, message);
};

Copper.debug = function(object) {
	let str = "";
	for (let x in object) str += x+": "+object[x]+"\n-----\n";
	alert(str);
};
