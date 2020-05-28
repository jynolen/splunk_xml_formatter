# Welcome to SplunkXMLFormater

This repo contains the source code of a Chrome/Firefox extension for the LogManager Splunk
By default XML events appear as raw xml without any syntax highlight.
This extension detect that you are in a Splunk window and perform actions

## Permissions needed:
- storage
    - This permission is used to store the CSS style you actually used
- Read on all tabs / page
    - This permission is needed to check that the page is a Splunk Page and to inject both button

## First Stage done behind the scene
In order to work the extension perform the following actions
- Inject the `jquery.min.js` `highlightjs.min.js` `splunk_xml.js` on every page
    - This script check that the html meta tag author is set to Splunk.
	- With this the extension will not be perform on all page
- When a Splunk Page is NOT discovered
	- The scripts unload highlightjs and jquery

## Second Stage behind the scene
All this document refer to `splunk_xml.js`
1. The script wait for jQuery to be operational
    a. `waitForjQuery`
2. Wait for a specific element to be present
    a. The element is the main container of the event view
3. Extension will add 2 butons
    a. One for toggle XML formating
    b. One to select XML formating style

## On demand action
1. On click on buton format/unformat the scripts
    a. Scripts will look for events
    b. For each event try to parse as XML
    c. Highligh all event in another div
2. On click on style
    a. When another style is selected a new CSS is download and a reference is set in a local storage

Github Source: https://github.com/jynolen/splunk_xml_formatter/

## Note for Chrome & Mozilla reviewers
This addons use 2 external libs:
    - highlightjs <=> highlightjs.min.js
    - jquery <=> jquery.min.js
Here the link for each release:
    - highlightjs <https://github.com/highlightjs/highlight.js/tree/10.0.3>
    - jquery <https://github.com/jquery/jquery/tree/3.5.1>

Check done at build time:
    - Validate sha256sum of external libs
    - jquery.min.js
        - f7f6a5894f1d19ddad6fa392b2ece2c5e578cbf7da4ea805b6885eb6985b6e3d  
    - highlightjs.min.js
        - ff60b70807e6b931a452a2b6995ae191369c06c72847571a134bb6419677521f