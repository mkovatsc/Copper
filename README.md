Copper (Cu) CoAP user-agent
===========================

A Firefox add-on to browse the Internet of Things
-------------------------------------------------

### How to integrate the Copper sources into Firefox:

1. Get the sources from Github: `clone git://github.com/mkovatsc/Copper.git`
2. It might be a good idea to create a new profile such as "dev." To do so add the switch `-P` when starting Firefox to get the profile editor.
3. Add an empty file `.autoreg` to your Firefox directory that contains the executable (e.g., `C:\Program Files\Mozilla Firefox`).
4. Add a text file named `copper@vs.inf.ethz.ch` to your profile's extension directory (e.g., `C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\pqz54r9q.dev\extensions\` or `~/.mozilla/firefox/8qbqpzqs.default/extensions/`).
5. Write the path to the Copper sources (i.e., the directory that contains `install.rdf` and `chrome.manifest`) with (back)slash at the end to the file (e.g., `D:\Projects\Git\Copper\`).
6. (Re-)start Firefox with the switch `-console` to get additional debug output.
7. Optionally use [about:config](about:config) with the filter "copper" to clean up old configurations.

Copper should show up in the add-ons list. You can now enter CoAP URIs (e.g., [coap://vs0.inf.ethz.ch/](coap://vs0.inf.ethz.ch/)) into the address bar and will have a user interface to interact with the CoAP resources on a server.

### See also:

[Setting up Extension Development Environment](https://developer.mozilla.org/en/setting_up_extension_development_environment)
 