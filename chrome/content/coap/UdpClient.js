Copper.UdpClient = function (remoteHost, remotePort) {

    try {
        Components.utils.import("resource://gre/modules/Services.jsm");
        this.socket = Components.classes["@mozilla.org/network/udp-socket;1"].createInstance(Components.interfaces.nsIUDPSocket);
        this.socket.init(-1, false, Services.scriptSecurityManager.getSystemPrincipal());
        this.socket.asyncListen(this);

        this.socketf = Components.classes["@mozilla.org/network/udp-socket;1"].createInstance(Components.interfaces.nsIUDPSocket);
        this.socketf.init(-1, false, Services.scriptSecurityManager.getSystemPrincipal());
        this.socketf.asyncListen(this);
    } catch(e) {
        Copper.logEvent("Failed to start new socket: " + e);
    }

    this.callback = null;
    this.lastSend = null;
    this.ended = false;
    Copper.logEvent("localAddr" + this.socket.localAddr);
    return this;
};

Copper.UdpClient.prototype = {

    //
    // nsIUDPSocketListener
    //
    onPacketReceived: function(socket, message) {
        Copper.logEvent("onPacketReceived");
        let messageData = message.data;
        let from = message.fromAddr.address;
        let port = message.fromAddr.port;
        if (port == this.socket.port) {
            Copper.logEvent("Ignoring looped message");
            return;
        }
        try {
            if (this.callback) { 
                this.callback(Copper.data2bytes(message.data), message.fromAddr);
            }
        } catch (ex) {
            Copper.logError(ex);            
        };
    },

    onStopListening: function() {
        Copper.logEvent('onStopListening');
        this.socket.close();
        this.socketf.close();
    },


    //
    // UdpClient functions
    //
    register : function(myCB) {
        this.callback = myCB;
    },

    shutdown : function() {
        // will also trigger onStopRequest()
        this.ended = true;
        this.socket.close(0);
        this.socketf.close(0);
    },

    send : function(message) {
        Copper.logEvent('send');
        if (this.ended) return;

        // the transport API also concatenates outgoing datagrams when sent too quickly
        let since = new Date() - this.lastSend;
        if (since<30) {
            var that = this;
            window.setTimeout(
                    function() { Copper.myBind(that,that.send(message)); },
                    30-since);
            return;
        }

        this.lastSend = new Date();

        try {
            let rawMessage = Copper.data2bytes(message);//this.converter.convertToByteArray(message);
            let host = Copper.hostname.replace(/\[/,'').replace(/\]/,'');
            Copper.logEvent('UDP: Sent ' + message.length + ' bytes to ' + host +' on port '+ Copper.port);
            Copper.logEvent("send " +this.socket.send(host, Copper.port, rawMessage, rawMessage.length));
            if('ff05:0:0:0:0:0:0:fd' === host) {
                Copper.logEvent('UDP: Sent ' + message.length + ' bytes to ' + "224.0.1.187" +' on port '+ Copper.port);
                Copper.logEvent("also send v4 multicast"+this.socketf.send("224.0.1.187", Copper.port, rawMessage, rawMessage.length));
            }

            //Copper.logEvent("send localAddr" + this.socket.localAddr);
        } catch (ex) {
            Copper.logError(ex);
        }
    },

};
