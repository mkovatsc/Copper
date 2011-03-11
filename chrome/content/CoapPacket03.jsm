var EXPORTED_SYMBOLS = ["VERSION", "GET", "POST", "PUT", "CoapPacket03"];

const VERSION = 1;

const MSG_TYPE_REQUEST = 0x00;
const MSG_TYPE_RESPONSE = 0x01;
const MSG_TYPE_NOTIFY = 0x02;

const OPTION_CONTENT_TYPE = 0x0;
const OPTION_URI = 0x1;
const OPTION_URI_CODE = 0x2;
const OPTION_MAX_AGE = 0x3;
const OPTION_ETAG = 0x4;
const OPTION_DATE = 0x5;
const OPTION_SUBSCRIPTION_LIFETIME = 0x6;

const CODE_200_OK = 0;
const CODE_201_CREATED = 1;
const CODE_304_NOT_MODIFIED = 14;
const CODE_400_BAD_REQUEST = 20;
const CODE_401_UNAUTHORIZED = 21;
const CODE_403_FORBIDDEN = 23;
const CODE_404_NOT_FOUND = 24;
const CODE_405_METHOD_NOT_ALLOWED = 25;
const CODE_409_CONFLICT = 29;
const CODE_415_UNSUPPORTED_MADIA_TYPE = 35;
const CODE_500_INTERNAL_SERVER_ERROR = 40;
const CODE_503_SERVICE_UNAVAILABLE = 43;
const CODE_504_GATEWAY_TIMEOUT = 44;

const GET = 0x01;
const POST = 0x02;
const PUT = 0x03;
const DELETE = 0x04;


function CoapPacket() {
	this.options = new Array();
}

CoapPacket.prototype = {
	version : VERSION, // member for received packets
	messageType : MSG_TYPE_REQUEST,
	optionCount : 0,
	ack: 0,
	code : GET,
	tid : 0x0777,
	options : null,
	payload : "",
	
	// readable type
	getType : function() {
		switch (parseInt(this.messageType)) {
			case MSG_TYPE_REQUEST: return "REQUEST";
			case MSG_TYPE_RESPONSE: return "RESPONSE";
			case MSG_TYPE_NOTIFY: return "NOTIFY";
			default: return "unknown";
		}
	},
	
	// readable method or response code
	getCode : function(readable) {
		if (this.messageType==MSG_TYPE_REQUEST) {
			// method
			switch (parseInt(this.code)) {
				case GET: return "GET";
				case POST: return "POST";
				case PUT: return "PUT";
				case DELETE: return "DELETE";
				case SUBSCRIBE: return "SUBSCRIBE";
				default: return "unknown";
			}
		} else {
			// response code
			switch (parseInt(this.code)) {
				case CODE_200_OK: return "200 OK";
				case CODE_201_CREATED: return "201 CREATED";
				case CODE_304_NOT_MODIFIED: return "304 NOT MODIFIED";
				case CODE_400_BAD_REQUEST: return "400 BAD REQUEST";
				case CODE_401_UNAUTHORIZED: return "401 UNAUTHORIZED";
				case CODE_403_FORBIDDEN: return "403 FORBIDDEN";
				case CODE_404_NOT_FOUND: return "404 NOT FOUND";
				case CODE_405_METHOD_NOT_ALLOWED: return "405 METHOD NOT ALLOWED";
				case CODE_409_CONFLICT: return "409 CONFLICT";
				case CODE_415_UNSUPPORTED_MADIA_TYPE: return "415 UNSUPPORTED MADIA TYPE";
				case CODE_500_INTERNAL_SERVER_ERROR: return "500 INTERNAL SERVER ERROR";
				case CODE_503_SERVICE_UNAVAILABLE: return "503 SERVICE UNAVAILABLE";
				case CODE_504_GATEWAY_TIMEOUT: return "504 GATEWAY TIMEOUT";
				default: return "unknown";
			}
		}
	},
	
	setOption : function(option, value) {
		// typing hence byte representation is weak in JavaScript, better be safe than sorry...
		switch (option) {
			case OPTION_URI:
				//alert("setting URI " + value);
				this.options[option] = str2bytes(value);
				break;
			default:
				alert("ERROR: CoapPacket.setOption [Unknown option]");
		}
		this.optionCount++;
	},
	
	serialize : function() {
		var byteArray = new Array();
		var tempByte = 0x00;
		
		// first byte: version, type, and option count
		tempByte  = (0x03 & VERSION) << 6; // using const for sending packets
		tempByte |= (0x03 & this.messageType) << 4;
		tempByte |= (0x0F & this.optionCount);
		byteArray.push(tempByte);
		
		// second byte: method or response code
		switch (this.messageType) {
			case MSG_TYPE_REQUEST:
	            tempByte  = (0x01 & this.ack) << 7;
	            tempByte |= (0x07 & this.code);
	            break;
	        case MSG_TYPE_RESPONSE:
	        	tempByte =  (0x3F & this.code);
	            break;
	        case MSG_TYPE_NOTIFY:
	            tempByte  = (0x01 & this.mustAcknowladge) << 7;
	            tempByte |= (0x3F & this.code);
	            break;
	    }
	    byteArray.push(tempByte);
	    
	    // third and forth byte: transaction ID (TID)
	    byteArray.push(0xFF & (this.tid >> 8));
	    byteArray.push(0xFF & this.tid);
	    
	    // options
	    //alert(this.options.length + " options " + ": " + this.options);
	    for (var optType in this.options) {
			var opt = this.options[optType];
			var optLen = opt.length;
			
			tempByte = (0x1F & optType) << 3;
			
			// encode length
			if (optLen <= 4) {
				tempByte |= (0x3 & optLen);
				byteArray.push(tempByte);
			} else if (optLen <= 1024) {
				tempByte |= 0x04 | (0x03 & (optLen >> 8));
				byteArray.push(tempByte);
				byteArray.push(0xFF & optLen);
			} else {
				// Error
				alert("ERROR: CoapPacket.serialize [Option length larger that 1024 is not supported]");
			}
			// add value
			for(var i in opt) byteArray.push(opt[i]);
		}
	    
	    // serialize as string
	    var message = bytes2str(byteArray);
        
	    // payload
	    message += this.payload;
	    
	    // finished
	    return message;
	},
	
	parse : function(packet) {
	
		var tempByte = packet.shift();
		
		this.version = 0xFF & ((tempByte & 0xC0) >> 6);
		if (this.version != 0) {
			alert("ERROR: CoapPacket.parse [CoAP version "+this.version+" not supported]");
        }

		this.messageType = 0xFF & ((tempByte & 0x30) >> 4);
        if (this.messageType < 0 || this.messageType > 2) {
            alert("ERROR: CoapPacket.parse [Wrong message type ("+this.messageType+")]");
        }

		this.optionCount = 0xFF & (tempByte & 0x0F);
		
		tempByte = packet.shift();
            
        switch (this.messageType) {
			case MSG_TYPE_REQUEST:
                this.ack = (tempByte >> 7) & 0x01;
                this.code = tempByte & 0x0F;
                break;
            case MSG_TYPE_RESPONSE:
                this.ack = 0;
                this.code = tempByte & 0x1F;
                break;
            case MSG_TYPE_NOTIFY:
                this.ack = (tempByte >> 7) & 0x01;
                this.code = tempByte & 0x1F;
                break;
		}

        this.tid = tempByte = packet.shift() << 8;
        this.tid = this.tid | packet.shift();

        //read options
        for (var i = 0; i < this.optionCount && i < 1; i++) {
            tempByte = packet.shift();
            var hdrType = (tempByte >> 3) & 0x1F;
            var hdrLen = tempByte & 0x3;
            if ((tempByte & 0x04) == 0x04) {
                hdrLen = hdrLen << 8;
                hdrLen = hdrLen | packet.shift();
            }
/*
            byte[] hdrData = new byte[hdrLen];
            inputStream.read(hdrData);

            this.headerOptions.put(hdrType, hdrData);
*/
        }

/*
        //read payload
        int plLen = inputStream.available();
        this.payload = new byte[plLen];
        inputStream.read(payload);
*/
	}
};

function readableMethod(num) {
	switch (parseInt(num)) {
		case GET: return "GET";
		case POST: return "POST";
		case PUT: return "PUT";
		case DELETE: return "DELETE";
		case SUBSCRIBE: return "SUBSCRIBE";
		default: return "unknown";
	}
}

function readableCode(num) {
	switch (parseInt(num)) {
		case CODE_200_OK: return "200 OK";
		case CODE_201_CREATED: return "201 CREATED";
		case CODE_304_NOT_MODIFIED: return "304 NOT MODIFIED";
		case CODE_400_BAD_REQUEST: return "400 BAD REQUEST";
		case CODE_401_UNAUTHORIZED: return "401 UNAUTHORIZED";
		case CODE_403_FORBIDDEN: return "403 FORBIDDEN";
		case CODE_404_NOT_FOUND: return "404 NOT FOUND";
		case CODE_405_METHOD_NOT_ALLOWED: return "405 METHOD NOT ALLOWED";
		case CODE_409_CONFLICT: return "409 CONFLICT";
		case CODE_415_UNSUPPORTED_MADIA_TYPE: return "415 UNSUPPORTED MADIA TYPE";
		case CODE_500_INTERNAL_SERVER_ERROR: return "500 INTERNAL SERVER ERROR";
		case CODE_503_SERVICE_UNAVAILABLE: return "503 SERVICE UNAVAILABLE";
		case CODE_504_GATEWAY_TIMEOUT: return "504 GATEWAY TIMEOUT";
		default: return "unknown";
	}
}

function readableOption(num) {
	alert(num + " - " + OPTION_URI);
	switch (parseInt(num)) {
		case OPTION_CONTENT_TYPE: return "CONTENT-TYPE";
		case OPTION_URI: return "URI";
		case OPTION_URI_CODE: return "URI-CODE";
		case OPTION_MAX_AGE: return "MAX-AGE";
		case OPTION_ETAG: return "ETAG";
		case OPTION_DATE: return "DATE";
		case OPTION_SUBSCRIPTION_LIFETIME: return "SUBSCRIPTION-LIFETIME";
		default: return "unknown";
	}
}

function str2bytes(str) {
	var b = new Array(str.length);
	for (var i=0; i<str.length; i++) {
		b[i] = str.charCodeAt(i) & 0xFF;
	}
	return b;
}

function bytes2str(b) {
	var str = "";
    for (var i in b) str += String.fromCharCode(b[i] & 0xFF);
	return str;
}
