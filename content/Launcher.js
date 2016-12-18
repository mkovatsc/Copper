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
 *         Main program code for the Copper CoAP Browser
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

Copper.check = function() {
	
	var firstRun = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref('extensions.copper.first-run');
	
	if (firstRun) {
	
		let id = 'copper-toolbar-button';
		
		// install the Cu toolbar button for the launcher
	    if (!document.getElementById(id)) {
	        var toolbar = document.getElementById('addon-bar');
	
	        toolbar.insertItem(id);
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
	        
	        toolbar.collapsed = false;
	    }
	    
	    // set first-run to false
	    Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).setBoolPref('extensions.copper.first-run', false);
	}
};

Copper.hideLauncher = function() {

	let id = 'copper-toolbar-button';
	
    if (document.getElementById(id)) {
        var toolbar = document.getElementById('addon-bar');

        let newSet = toolbar.currentSet.replace(/(,copper-toolbar-button|copper-toolbar-button,)/, '');
        toolbar.setAttribute("currentset", newSet);
        document.persist(toolbar.id, "currentset");
    }
    
    Copper.firstRun = false;
};

Copper.launch = function() {
	window.openDialog('chrome://copper/content/launcher.xul', 'Launcher', 'chrome,titlebar,toolbar,centerscreen,modal');
	Copper.hideLauncher();
	document.getElementById('urlbar').focus();
};

addEventListener("load", Copper.check, false);
