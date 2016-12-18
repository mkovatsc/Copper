/*******************************************************************************
 * Copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.
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
 *         Content-type rendering functions
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

// Rendering functions
////////////////////////////////////////////////////////////////////////////////

Copper.renderText = function(message) {
	Copper.updateLabel('packet_payload', Copper.bytes2str(message.getPayload()), false);
	let str = Copper.bytes2str(message.getPayload());
	if (str.match(/^#[0-9a-f]{3,6}$/i) || str.match(/´rgb\(\s*[0-9]+\s*,\s*[0-9]+\s*,\s*[0-9]+\s*\)$/i)) {

		// view corresponding render element
		document.getElementById('rendered_img').style.display = 'none';
		document.getElementById('rendered_div').style.display = 'block';

		document.getElementById('tab_rendered').style.backgroundColor = str.toLowerCase();
		document.getElementById('tabs_payload').selectedIndex = 1;
	} else {
		document.getElementById('tab_rendered').style.backgroundColor = '';
		document.getElementById('tabs_payload').selectedIndex = 0;
	}
};

Copper.renderImage = function(message) {

	if (!message.getBlock2More()) {
		// only render binary when transfer is complete (binary is heavy)
		Copper.renderBinary(message);
	}

	// view corresponding render element
	document.getElementById('rendered_div').style.display = 'none';
	document.getElementById('rendered_img').style.display = 'block';

	// causes flickering, but partially added data does not draw anyway
	document.getElementById('rendered_img').src = 'data:'+Copper.getContentFormatName(message.getContentFormat())+';base64,'+btoa( Copper.bytes2data(message.getPayload()) );
	document.getElementById('tab_rendered').style.backgroundColor = '';
	document.getElementById('tabs_payload').selectedIndex = 1;
};

Copper.renderBinary = function(message) {

	var pl = message.getPayload();

	// Clear content first
	Copper.updateLabel('packet_payload', '', false);
	var line = '';
	for (var i in pl) {
		line += Copper.leadingZero(pl[i].toString(16).toUpperCase());

		if (i % 16 == 15) {
			line += ' | ';
			for (var j=i-15; j<=i; ++j) {
				if (pl[j] < 32 || pl[j] >= 127) {
					line += '·';
				} else {
					line += String.fromCharCode(pl[j] & 0xFF);
				}
			}
			line += '\n';
			Copper.updateLabel('packet_payload', line, true);
			line = '';
		} else if (i % 2 == 1) {
			line += ' ';
		}
	}

	// incomplete lines
	if ((parseInt(i)+1) % 16 != 0) {
		// complete line with spaces
		for (var j=0; j<39-((parseInt(i)+1)%16)*2 - ((parseInt(i)+1)%16)/2; ++j) {
			line += ' ';
		}

		line += ' | ';
		for (var j=i-(i%16); j<=i; ++j) {
			if (pl[j] < 32) {
				line += '·';
			} else {
				line += String.fromCharCode(pl[j] & 0xFF);
			}
		}
		Copper.updateLabel('packet_payload', line, true);
	}

	document.getElementById('tabs_payload').selectedIndex = 0;
};


Copper.renderLinkFormat = function(message) {

	// Print raw Link Format in case parsing fails
	Copper.renderText(message);

	// The box for output at the top-level
	document.getElementById('rendered_img').style.display = 'none';
    var view = document.getElementById('rendered_div');
    view.style.display = 'block';

    while (view.hasChildNodes()) {
    	view.removeChild(view.firstChild);
    }
    view.setAttribute("class", "link-content");

	var parsedObj = Copper.parseLinkFormat( Copper.bytes2str(message.getPayload()) );

	view.appendChild( Copper.renderLinkFormatUtils.getXulLinks(parsedObj) );

	document.getElementById('tab_rendered').style.backgroundColor = '';
	document.getElementById('tabs_payload').selectedIndex = 1;
};

Copper.renderLinkFormatUtils = {

	htmlns: "http://www.w3.org/1999/xhtml",

	getXulLinks: function(value) {
		if (typeof value != 'object') {
			return null;
		}

		var xulObj = document.createElementNS(this.htmlns, "ul");
		for (var uri in value) {
			this.addXulLink(xulObj, value[uri], uri);
		}

		return xulObj;
	},

	addXulLink: function(xulObj, attribs, key) {

		var xulChild = document.createElementNS(this.htmlns, "li");

		var label = document.createElement("label");
		label.setAttribute("class", "uri");
		label.setAttribute("value", key);
		xulChild.appendChild(label);
		xulChild.appendChild( this.getXulObject(attribs) );

		xulObj.appendChild(xulChild);
	},

	getXulObject: function(value) {

		if (typeof value != 'object') {
			return null;
		}

		var xulObj = document.createElementNS(this.htmlns, "ul");

		if (Array.isArray(value)) {
			xulObj.setAttribute("class", "array");
			for (var i = 0; i < value.length; i ++) {
				this.addXulChild(xulObj, value[i]);
			}
		} else {
			// object
			xulObj.setAttribute("class", "object");
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
			label.setAttribute("class", "label");
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
					xulObj.setAttribute("class", "null");
					return xulObj;
				}
				return null;

			case 'string':
				xulObj.appendChild( document.createTextNode(String(value)) );
				xulObj.setAttribute("class", "string");
				return xulObj;

			case 'number':
				xulObj.setAttribute("value", isFinite(value) ? String(value) : 'null');
				if (Math.floor(value) == value) {
					xulObj.setAttribute("class", "int");
				} else {
					xulObj.setAttribute("class", "float");
				}
				return xulObj;

			case 'boolean':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "bool");
				return xulObj;

			case 'null':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "null");
				return xulObj;

			default:
				return null;
		}
	}
};

Copper.renderCBOR = function(message) {
	// The box for output at the top-level
	document.getElementById('rendered_img').style.display = 'none';

	var view = document.getElementById('rendered_div');
	view.style.display = 'block';

	while (view.hasChildNodes()) {
		view.removeChild(view.firstChild);
	}

	view.setAttribute("class", "json-content");
	var parsedObj = Copper.parseCBOR(message.getPayload());

	// Turn the Javascript object into XUL objects
	if (typeof parsedObj == 'object') {
		view.appendChild( Copper.renderJSONutils.getXulObject(parsedObj) );
		document.getElementById('tab_rendered').style.backgroundColor = '';
		document.getElementById('tabs_payload').selectedIndex = 1;
	} else {
		Copper.logError(new Error('Top level element is not an object'));
	}
};

Copper.renderJSON = function(message) {

	// Print raw JSON in case parsing fails
	Copper.renderText(message);

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
			view.appendChild( Copper.renderJSONutils.getXulObject(parsedObj) );
			document.getElementById('tab_rendered').style.backgroundColor = '';
			document.getElementById('tabs_payload').selectedIndex = 1;
		} else {
			Copper.logError(new Error('Top level element is not a JSON object'));
		}
	} catch (ex) {
		Copper.logError(ex);
	}

};

Copper.renderJSONutils = {

	htmlns: "http://www.w3.org/1999/xhtml",

	getXulObject: function(value) {
		if (typeof value != 'object') {
			return null;
		}

		var xulObj = document.createElementNS(this.htmlns, "ul");

		if (Array.isArray(value)) {
			xulObj.setAttribute("class", "array");

			if (value.length>0) {
				var label = document.createElement("label");
				label.setAttribute("value", "(length " + value.length + ")");
				label.setAttribute("style", "color: gray;");
				xulObj.appendChild(label);

				for (var i = 0; i < value.length; i ++) {
					this.addXulChild(xulObj, value[i]);
				}
			} else {
				var label = document.createElement("label");
				label.setAttribute("value", "    ");
				xulObj.appendChild(label);
			}

		} else {
			// object
			xulObj.setAttribute("class", "object");
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
			label.setAttribute("class", "label");
			label.setAttribute("value", key + ":");
			xulChild.appendChild(label);
		}
		
		if(value instanceof Uint8Array) {
			value = JSON.stringify(value);
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
					xulObj.setAttribute("class", "null");
					return xulObj;
				}
				return null;

			case 'string':
				xulObj.appendChild( document.createTextNode(String(value)) );
				xulObj.setAttribute("class", "string");
				return xulObj;

			case 'number':
				xulObj.setAttribute("value", isFinite(value) ? String(value) : 'null');
				if (Math.floor(value) == value) {
					xulObj.setAttribute("class", "int");
				} else {
					xulObj.setAttribute("class", "float");
				}
				return xulObj;

			case 'boolean':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "bool");
				return xulObj;

			case 'null':
				xulObj.setAttribute("value", String(value));
				xulObj.setAttribute("class", "null");
				return xulObj;

			default:
				return null;
		}
	}
};

Copper.renderEXI = function(message) {
	Copper.updateLabel('packet_payload', Copper.bytes2data(message.getPayload()), message.getBlock2Number()>0);
	document.getElementById('tabs_payload').selectedIndex = 0;
};
