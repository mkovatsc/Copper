/*
 * Copyright (c) 2011, Institute for Pervasive Computing, ETH Zurich.
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
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS ``AS IS'' AND
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
 * This file is part of the Copper CoAP Browser.
 */
/**
 * \file
 *         Copper module namespace
 *
 * \author  Matthias Kovatsch <kovatsch@inf.ethz.ch>\author
 */

var EXPORTED_SYMBOLS = ['Copper'];

/**
 * Copper module namespace.
 */
if ("undefined" == typeof(Copper)) {
	var Copper = {
		get VERSION() { return 1; },
		
		get MSG_TYPE_CON() { return 0; },
		get MSG_TYPE_NON() { return 1; },
		get MSG_TYPE_ACK() { return 2; },
		get MSG_TYPE_RST() { return 3; },
		
		get OPTION_CONTENT_TYPE() { return 1; },
		get OPTION_MAX_AGE() { return 2; },
		get OPTION_ETAG() { return 4; },
		get OPTION_URI_HOST() { return 5; }, // renamed
		get OPTION_LOCATION_PATH() { return 6; }, // renamed
		get OPTION_URI_PATH() { return 9; },
		get OPTION_OBSERVE() { return 10; }, // renamed
		get OPTION_TOKEN() { return 11; },
		get OPTION_BLOCK() { return 13; },
		get OPTION_NOOP() { return 14; },
		get OPTION_URI_QUERY() { return 15; },
		
		get CODE_100_CONTINUE() { return 40; },
		get CODE_200_OK() { return 80; },
		get CODE_201_CREATED() { return 81; },
		get CODE_304_NOT_MODIFIED() { return 124; },
		get CODE_400_BAD_REQUEST() { return 160; },
		get CODE_404_NOT_FOUND() { return 164; },
		get CODE_405_METHOD_NOT_ALLOWED() { return 165; },
		get CODE_415_UNSUPPORTED_MADIA_TYPE() { return 175; },
		get CODE_500_INTERNAL_SERVER_ERROR() { return 200; },
		get CODE_502_BAD_GATEWAY() { return 202; },
		get CODE_503_SERVICE_UNAVAILABLE() { return 203; },
		get CODE_504_GATEWAY_TIMEOUT() { return 204; },
		get CODE_TOKEN_OPTION_REQUIRED() { return 240; },
		get CODE_URI_AUTHORITY_OPTION_REQUIRED() { return 241; },
		get CODE_CRITICAL_OPTION_NOT_SUPPORTED() { return 242; },
		
		get CONTENT_TYPE_TEXT_PLAIN() { return 0; },
		get CONTENT_TYPE_TEXT_XML() { return 1; },
		get CONTENT_TYPE_TEXT_CSV() { return 2; },
		get CONTENT_TYPE_TEXT_HTML() { return 3; },
		get CONTENT_TYPE_IMAGE_GIF() { return 21; }, // 03
		get CONTENT_TYPE_IMAGE_JPEG() { return 22; }, // 03
		get CONTENT_TYPE_IMAGE_PNG() { return 23; }, // 03
		get CONTENT_TYPE_IMAGE_TIFF() { return 24; }, // 03
		get CONTENT_TYPE_AUDIO_RAW() { return 25; }, // 03
		get CONTENT_TYPE_VIDEO_RAW() { return 26; }, // 03
		get CONTENT_TYPE_APPLICATION_LINK_FORMAT() { return 40; },
		get CONTENT_TYPE_APPLICATION_XML() { return 41; },
		get CONTENT_TYPE_APPLICATION_OCTET_STREAM() { return 42; },
		get CONTENT_TYPE_APPLICATION_RDF_XML() { return 43; },
		get CONTENT_TYPE_APPLICATION_SOAP_XML() { return 44; },
		get CONTENT_TYPE_APPLICATION_ATOM_XML() { return 45; },
		get CONTENT_TYPE_APPLICATION_XMPP_XML() { return 46; },
		get CONTENT_TYPE_APPLICATION_EXI() { return 47; },
		get CONTENT_TYPE_APPLICATION_X_BXML() { return 48; },
		get CONTENT_TYPE_APPLICATION_FASTINFOSET() { return 49; },
		get CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET() { return 50; },
		get CONTENT_TYPE_APPLICATION_JSON() { return 51; },
		get CONTENT_TYPE_APPLICATION_X_OBIX_BINARY() { return -1; }, // 04+
		
		get GET() { return 1; },
		get POST() { return 2; },
		get PUT() { return 3; },
		get DELETE() { return 4; },
		
		get WELL_KNOWN_RESOURCES() { return '/.well-known/core'; },
		
		get RESPONSE_TIMEOUT() { return 1000; }, // ms
		get MAX_RETRANSMIT() { return 5; }
	};
};