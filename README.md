# Welcome to SplunkXMLFormater

This repo contains the source code of a Chrome/Firefox extension for the LogManager Splunk
By default XML events appear as raw xml without any syntax highlight.
This extension detect that you are in a Splunk window and perform actions

## First Stage done behind the scene
In order to work the extension perform the following actions
- Inject the `injector.js` on every page
    - This script check that the html meta tag author is set to Splunk.
	- With this the extension will not be perform on all page
- When a Splunk Page is discovered
	- The scripts add those scripts to the page
	    - `splunk_xml.js`
		    - This is the core of the extension
		- [highlightjs](https://highlightjs.org)
			- This is a 3rd party script that highlight the XML

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
    a. When another style is selected a new CSS is download and a reference is set in a cookie
    