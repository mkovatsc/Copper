Copper (Cu) CoAP user-agent
===========================

Implements [RFC7252](http://tools.ietf.org/html/rfc7252)

A Firefox add-on to browse the Internet of Things
-------------------------------------------------

### How to integrate the Copper sources into Firefox:

1. Get the sources from Github: `clone git://github.com/mkovatsc/Copper.git`
2. Add a text file named `copper@vs.inf.ethz.ch` to your extension directory of your profile:
 - Windows: `C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\xxxxxxxx.default\extensions\`
 - Linux: `~/.mozilla/firefox/xxxxxxxx.default/extensions/`
 - MacOS: `~/Library/Application Support/Firefox/Profiles/xxxxxxxx.default/extensions/`
3. Write the path to the Copper sources (i.e., the directory that contains `install.rdf` and `chrome.manifest`) with (back)slash at the end to the file (e.g., `D:\Projects\Git\Copper\`).
4. Restart Firefox.
5. Optionally use [about:config](about:config) with the filter "copper" to clean up old configurations.

Copper should show up in the add-ons list. You can now enter CoAP URIs (e.g., [coap://vs0.inf.ethz.ch/](coap://vs0.inf.ethz.ch/)) into the address bar and will have a user interface to interact with the CoAP resources on a server. The detailed log output is available through the rectangular button on the top right, next to the preferences button.

### See also:

 - [Setting up Extension Development Environment](https://developer.mozilla.org/en/setting_up_extension_development_environment)
 - [Firefox Profile Manager](https://support.mozilla.org/en-US/kb/profile-manager-create-and-remove-firefox-profiles)
 