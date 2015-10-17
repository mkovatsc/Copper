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
 *         Views for resources
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */


// Tree view
////////////////////////////////////////////////////////////////////////////////

Copper.clearTree = function() {
	var elems = document.getElementById('resource_elems');
	while (elems.hasChildNodes()) {
		elems.removeChild(elems.firstChild);
	}
};

Copper.addTreeResource = function(uri, attributes) {

	var tree = document.getElementById('resource_tree');
	var segments;
	
	var uriTokens = uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/);
	
	if (uriTokens) {
		// absolute URI
		
		if (uriTokens[1]=='coap://') {
			segments = uriTokens[3].split('/');
			segments.shift();
			segments.unshift(uriTokens[2]);
		} else {
			Copper.logEvent("WARNING: Non-CoAP resource "+uri+"'");
			return;
		}
	} else {
		segments = uri.split('/');
		segments.shift();
		segments.unshift(Copper.hostname + ':' + Copper.port);
	}
	
	var node = tree;
	//Copper.logEvent('Children: '+node.getElementsByTagName('treechildren')[0].childNodes.length);
	
	for (var i=0; i<segments.length; ++i) {
		if (segments[i]=='') continue;
		//Copper.logEvent('resource_tree'+segments.slice(0,i+1).join('_'));
		
		var cur = null;
		var nodeChildren = null;
		for (var k in node.childNodes) {
			if (node.childNodes[k].nodeName=='treechildren') {
				nodeChildren = node.childNodes[k];
				break;
			}
		}
		
		// getElementsByName() would be nice
		for (var j in nodeChildren.childNodes) {
			if (nodeChildren.childNodes[j] && nodeChildren.childNodes[j].name && nodeChildren.childNodes[j].name==segments[i]) {
				cur = nodeChildren.childNodes[j];
				break;
			}
		}
		
		if (cur) {
			// found item is current
			node = cur;
			continue;
		} else {
			let activePath = Copper.hostname+':'+Copper.port+Copper.path;
			// path until current level
			let path = segments.slice(0,i+1).join('/');
			let properties = '';
			
			let itemCell = document.createElement("treecell");
			itemCell.setAttribute('label', segments[i]);
			itemCell.setAttribute('value', path);
			
			// special icon
			if (path.match(/\/\.well-known$/)) {
				properties += 'wellknown ';
			} else if (path==Copper.hostname+':'+Copper.port) {
				properties += 'host ';
			} else if (i==0) {
				properties += 'link ';
			} else if (attributes['obs']) {
				properties += 'observable ';
			}
			// highlight current location
			if (path==activePath) {
				properties += 'active ';
			}
			// visualize freshness
			if (Copper.resourcesCached) {
				properties += 'cached ';
			}
			
			// create row for cells
			var itemRow = document.createElement("treerow");
			itemRow.appendChild(itemCell);
			
			// add additional information for existing resources
			if (attributes && i+1==segments.length) {
				var tooltiptext = '';
				for (var attrib in attributes) {
					if (attrib=='ct' && attributes[attrib]=='40') {
						properties += 'discovery ';
					}
					
					if (tooltiptext) tooltiptext += '\n';
					tooltiptext += attrib + '="'+attributes[attrib]+'"';
				}
				var itemCellAttrib = document.createElement("treecell");
				itemCellAttrib.setAttribute('value', tooltiptext);
				itemRow.appendChild(itemCellAttrib);
				
			}
			
			// set properties for visualization
			itemCell.setAttribute('properties', properties);
			
			
			var itemChildren = document.createElement("treechildren");

			var item = document.createElement("treeitem");
			item.name = segments[i];
			item.appendChild(itemRow);
			item.appendChild(itemChildren);
			
			// add new item to existing node
			nodeChildren.appendChild(item);
			node.setAttribute('container', 'true');
			node.setAttribute('open', 'true');
			
			// new item is current
			node = item;
		}
	}
	//Copper.logEvent('Children: '+tree.getElementsByTagName('treechildren')[0].childNodes.length);

};

Copper.onTreeClicked = function(event) {
	var tree = document.getElementById("resource_tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	
	// child.value: {image, text}
	if (child.value!='twisty') {
		if(event.ctrlKey || event.shiftKey || event.which == 2 ) {
			event.preventDefault();
			Copper.mainWindow.gBrowser.addTab( 'coap://' + tree.view.getCellValue(row.value, col.value) );
		} else if(event.which == 3 ) {
			
		} else {
			document.location.href = 'coap://' + tree.view.getCellValue(row.value, col.value);
		}
	}
};

// used to have per node tooltips
Copper.onTreeHover = function(event) {
	var tree = document.getElementById("resource_tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	if (col.value) {
		document.getElementById('resource_elems').setAttribute('tooltiptext', tree.view.getCellValue(row.value, col.value.getNext()));
	}
};
