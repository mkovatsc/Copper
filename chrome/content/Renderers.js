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
	
	// view corresponding render element
	document.getElementById('rendered_div').style.display = 'none';
	document.getElementById('rendered_img').style.display = 'block';
	
	
	CopperChrome.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlockNumber()>0);
	
	// TODO block management
	if (message.getBlockNumber()==0 || !message.isOption(Copper.OPTION_BLOCK)) {
		CopperChrome.partialImage = '';
	}
	CopperChrome.partialImage += Copper.bytes2data(message.getPayload());
	// causes flickering, but partially added data does not draw
	document.getElementById('rendered_img').src = 'data:'+Copper.getContentTypeName(message.getContentType())+';base64,'+btoa( CopperChrome.partialImage );
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

CopperChrome.renderJSON = function(message) {
	
	// Print raw JSON in case parsing fails
	CopperChrome.renderText(message);
	
	// The box for output at the top-level
	document.getElementById('rendered_img').style.display = 'none';
    var view = document.getElementById('rendered_div');
    view.style.display = 'block';
    
    while (view.hasChildNodes()) {
    	view.removeChild(view.firstChild);
    }
    view.setAttribute("class", "json-content");
    
    var pl = Copper.bytes2str(message.getPayload()).replace(/'/g, '"');
    
	try {
		// Parse the JSON
		var parsedObj = JSON.parse(pl);
		// Turn the Javascript object into XUL objects
		if (typeof parsedObj == 'object') {
			view.appendChild( CopperChrome.renderJSONutils.getXulObject(parsedObj) );
			document.getElementById('tabs_payload').selectedIndex = 1;
		} else {
			view.innerHTML = 'Parse error: Top level element is not a JSON object';
		}
	} catch (ex) {
		view.innerHTML = 'Parse error: JSON is invalid ['+ex+']';
	}
	
};

CopperChrome.renderJSONutils = {
		
	htmlns: "http://www.w3.org/1999/xhtml",
 
	getXulObject: function(value) {
		if (typeof value != 'object') {
			return null;
		}

		var xulObj = document.createElementNS(this.htmlns, "ul");

		if (Array.isArray(value)) {
			xulObj.setAttribute("class", "json_array");
			for (var i = 0; i < value.length; i ++) {
				this.addXulChild(xulObj, value[i]);
			}
		} else {
			// object
			xulObj.setAttribute("class", "json_object");
			for (var prop in value) {
				this.addXulChild(xulObj, value[prop], prop);
			}
		}
		
		return xulObj;
	},
	 
	addXulChild: function(xulObj, value, key) {

		var xulChild = document.createElementNS(this.htmlns, "li");

		// If the value has a label (object properties will have labels)
		if (key != null) {
			var label = document.createElement("label");
			label.setAttribute("class", "json_label");
			label.setAttribute("value", key + ":");
			xulChild.appendChild(label);
		}

		if (typeof value == 'object' && value != null) {
			xulChild.appendChild( this.getXulObject(value) );
		} else {
			xulChild.appendChild( this.getXulValue(value) );
		}

		xulObj.appendChild(xulChild);
	},

	getXulValue: function(value) {
		var xulObj = document.createElement("description");
		switch (typeof value) {
			case 'object':
				if (!value) {
					xulObj.setAttribute("value", 'null');
					xulObj.setAttribute("class", "json_null");
					return xulObj;
				}
				return null;
	
			case 'string':
				xulObj.appendChild( document.createTextNode(String(value)) );
				xulObj.setAttribute("class", "json_string");
				return xulObj;
	
			case 'number':
				xulObj.setAttribute("value", isFinite(value) ? String(value) : 'null');
				if (Math.floor(value) == value) {
					xulObj.setAttribute("class", "json_int");
				} else {
					xulObj.setAttribute("class", "json_float");
				}
				return xulObj;
	
			case 'boolean':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "json_bool");
				return xulObj;
	
			case 'null':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "json_null");
				return xulObj;
				
			default:
				return null;
		}
		
	}
};

CopperChrome.renderEXI = function(message) {
	CopperChrome.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlockNumber()>0);
	document.getElementById('tabs_payload').selectedIndex = 0;
};
