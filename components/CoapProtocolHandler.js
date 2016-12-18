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
 *         Firefox protocol handler for 'coap:'
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

/**
 * CopperProtocolHandler namespace.
 */
if ("undefined" == typeof(CopperProtocol)) {
  var CopperProtocol = {};
};

// Array allows for multiple schemes (e.g., coap and coaps for coap with DTLS)
CopperProtocol.__defineGetter__("CLASS_ID", function() { return [Components.ID('{6ffeeb10-91cc-0854-a554-81cf891ced50}')]; });
CopperProtocol.__defineGetter__("CLASS_SCHEME", function() { return ['coap']; });
CopperProtocol.__defineGetter__("CLASS_DEFAULT_PORT", function() { return [-1]; });
CopperProtocol.__defineGetter__("CLASS_FLAGS", function() { return [Components.interfaces.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE]; });
CopperProtocol.__defineGetter__("CLASS_NAME", function() { return ['CoAP (RFC 7252)']; });

CopperProtocol.__defineGetter__("SECURITY", function() { return Components.interfaces.nsILoadInfo.SEC_SANDBOXED | Components.interfaces.nsILoadInfo.SEC_ALLOW_CHROME; });

/**
 * Handles the CoAP protocol
 */
CopperProtocol.Handler = function() {};

CopperProtocol.Handler.prototype = {
	
	defaultPort : CopperProtocol.CLASS_DEFAULT_PORT[0],
	protocolFlags : CopperProtocol.CLASS_FLAGS[0],
	scheme: CopperProtocol.CLASS_SCHEME[0], 

	allowPort: function(port, scheme) {
		return false;
	},

	newURI : function(aSpec, aCharset, aBaseURI) {
		
		/*
		 * Standard URL with URLTYPE_AUTHORITY = 2
		 * 
		 * blah:foo/bar    => blah://foo/bar
		 * blah:/foo/bar   => blah://foo/bar
		 * blah://foo/bar  => blah://foo/bar
		 * blah:///foo/bar => blah://foo/bar
		 */
		
		try {
			var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIStandardURL);
			uri.init(Components.interfaces.nsIStandardURL.URLTYPE_AUTHORITY, this.defaultPort, aSpec, aCharset, aBaseURI);
			
			return uri;
		
		} catch (ex) {
			// will cause an alert
			return uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance(Components.interfaces.nsIURI);
		}
	},
	
	newChannel : function(aURI) {
			var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			return ioService.newChannel2("chrome://copper/content/copper.xul", null, null, null, null, null, CopperProtocol.SECURITY, null);
	},

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
	QueryInterface : function(aIID) {
		if (!aIID.equals(Components.interfaces.nsIProtocolHandler) && !aIID.equals(Components.interfaces.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}

};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
CopperProtocol.HandlerFactory = function() {};

CopperProtocol.HandlerFactory.prototype = {
	createInstance: function (aOuter, aIID) {
		if (null != aOuter) {
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		}
	    return (new CopperProtocol.Handler()).QueryInterface(aIID);
	}
};

/**
 * Firefox 3.x
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
CopperProtocol.HandlerModule = {
	/**
	 * When the nsIModule is discovered, this method will be called so that any
	 * setup registration can be preformed.
	 * @param aCompMgr the global component manager.
	 * @param aLocation the location of the nsIModule on disk.
	 * @param aLoaderStr opaque loader specific string.
	 * @param aType loader type being used to load this module.
	 */
	registerSelf : function(aCompMgr, aLocation, aLoaderStr, aType) {
		aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		for (var i in CopperProtocol.CLASS_SCHEME) {
			aCompMgr.registerFactoryLocation(CopperProtocol.CLASS_ID[i], CopperProtocol.CLASS_NAME[i], "@mozilla.org/network/protocol;1?name="+CopperProtocol.CLASS_SCHEME[i], aLocation, aLoaderStr, aType);
		}
	},

	/**
	 * When the nsIModule is being unregistered, this method will be called so
	 * that any cleanup can be preformed.
	 * @param aCompMgr the global component manager.
	 * @param aLocation the location of the nsIModule on disk.
	 * @param aLoaderStr opaque loader specific string.
	 */
	unregisterSelf : function (aCompMgr, aLocation, aLoaderStr) {
		aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		for (var i in CopperProtocol.CLASS_SCHEME) {
			aCompMgr.unregisterFactoryLocation(CopperProtocol.CLASS_ID[i], aLocation);
		}
	},

	/**
	 * This method returns a class object for a given ClassID and IID.
	 * @param aCompMgr the global component manager.
	 * @param aClass the ClassID of the object instance requested.
	 * @param aIID the IID of the object instance requested.
	 * @return the resulting interface pointer.
	 * @throws NS_ERROR_NOT_IMPLEMENTED if aIID is inadequate.
	 * @throws NS_ERROR_NO_INTERFACE if the interface is not found.
	 */
	getClassObject : function(aCompMgr, aClass, aIID) {
		if (!aIID.equals(Components.interfaces.nsIFactory)) {
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		}

		if (aClass.equals(CopperProtocol.CLASS_ID[0])) {
			return new CopperProtocol.HandlerFactory();
		}

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	/**
	 * This method may be queried to determine whether or not the component
	 * module can be unloaded by XPCOM.
	 * @param aCompMgr the global component manager.
	 * @return true if the module can be unloaded by XPCOM. false otherwise.
	 */
	canUnload: function(aCompMgr) {
		return true;
	}
};

/**
 * Initial entry point Firefox 3.x
 * @param aCompMgr the global component manager.
 * @param aFileSpec component file.
 * @return the module for the service.
 */
function NSGetModule(aCompMgr, aFileSpec) {
	return CopperProtocol.HandlerModule;
}

/**
 * Initial entry point Firefox 4
 * @param cid the class ID from the manifest.
 * @return the module for the service.
 */
function NSGetFactory (cid) {
	for(var i in CopperProtocol.CLASS_ID) {
		if (cid.equals(CopperProtocol.CLASS_ID[0])) {
			return new CopperProtocol.HandlerFactory();
		}
	}
}
