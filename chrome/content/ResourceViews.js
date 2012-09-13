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
 *         Views for resources
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */


// Tree view
////////////////////////////////////////////////////////////////////////////////

CopperChrome.clearTree = function() {
	var elems = document.getElementById('resource_elems');
	while (elems.hasChildNodes()) {
		elems.removeChild(elems.firstChild);
	}
};

CopperChrome.addTreeResource = function(uri, attributes) {

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
			dump('WARNING: Non-CoAP resource ['+uri+']\n');
			return;
		}
	} else {
		segments = uri.split('/');
		segments.shift();
		segments.unshift(CopperChrome.hostname + ':' + CopperChrome.port);
	}
	
	var node = tree;
	//dump('Children: '+node.getElementsByTagName('treechildren')[0].childNodes.length+'\n');
	
	for (var i=0; i<segments.length; ++i) {
		if (segments[i]=='') continue;
		//dump('resource_tree'+segments.slice(0,i+1).join('_')+'\n');
		
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
			// path until current level
			var path = segments.slice(0,i+1).join('/');
			var properties = '';
			
			var itemCell = document.createElement("treecell");
			itemCell.setAttribute('label', segments[i]);
			itemCell.setAttribute('value', path);
			
			// special icon
			if (path.match(/\/\.well-known$/)) {
				properties += 'wellknown ';
			} else if (path==CopperChrome.hostname+':'+CopperChrome.port) {
				properties += 'host ';
			} else if (i==0) {
				properties += 'link ';
			} else if (attributes['obs']) {
				properties += 'observable ';
			}
			// highlight current location
			if (path==CopperChrome.path) {
				properties += 'active ';
			}
			// visualize freshness
			if (CopperChrome.resourcesCached) {
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
	//dump('Children: '+tree.getElementsByTagName('treechildren')[0].childNodes.length+'\n');

};

CopperChrome.onTreeClicked = function(event) {
	var tree = document.getElementById("resource_tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	
	// child.value: {image, text}
	if (child.value!='twisty') {
		
		if(event.which == 2 ) {
			event.preventDefault();
			CopperChrome.mainWindow.gBrowser.addTab( 'coap://' + tree.view.getCellValue(row.value, col.value) ); 
		} else {
			document.location.href = 'coap://' + tree.view.getCellValue(row.value, col.value);
		}
	}
};

// used to have per node tooltips
CopperChrome.onTreeHover = function(event) {
	var tree = document.getElementById("resource_tree");
	var tbo = tree.treeBoxObject;

	// get the row, col and child element at the point
	var row = { }, col = { }, child = { };
	tbo.getCellAt(event.clientX, event.clientY, row, col, child);
	if (col.value) {
		document.getElementById('resource_elems').setAttribute('tooltiptext', tree.view.getCellValue(row.value, col.value.getNext()));
	}
};


// List view
////////////////////////////////////////////////////////////////////////////////

CopperChrome.clearList = function() {
	var list = document.getElementById('resource_list');
	while (list.hasChildNodes()) {
		list.removeChild(list.firstChild);
	}
};

CopperChrome.addListResource = function(uri, attributes) {
	
	var list = document.getElementById('resource_list');
		
	var button = document.createElement('button');
	button.setAttribute('label', decodeURI(uri));
	

	var uriTokens = uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/);
	
	if (uriTokens) {
		// absolute URI
		
		if (uriTokens[1]=='coap://') {
			button.addEventListener('click', function() {
				document.location.href = uri;
		    }, true);
		} else {
			dump('WARNING: Non-CoAP resource ['+uri+']\n');
			return;
		}
	} else {
		button.addEventListener('click', function() {
			document.location.href = 'coap://' + CopperChrome.hostname + ':' + CopperChrome.port + uri;
	    }, true);
	}
	
	// tooltips for attributes
	let tooltiptext = '';
	for (var attrib in attributes) {
		if (tooltiptext) tooltiptext += '\n';
		tooltiptext += attrib + ': "' + attributes[attrib]+'"';
	}
	button.setAttribute('tooltiptext', tooltiptext);
	
	// visualize freshness
	if (CopperChrome.resourcesCached) {
		button.setAttribute('style', 'color: red;');
	}
	
	// highlight current resource
	if (uri==CopperChrome.path) {
		button.setAttribute('style', 'font-weight: bold; text-shadow: 2px 2px 3px #666666;');
	}
	
	list.appendChild(button);
};
