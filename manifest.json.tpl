{
  "name": "Splunk XML Formatter",
  "version": "",
  "description": "This extension add 2 boutons in the SplunkUI to format XMLevent",
  "manifest_version": 2,
  "author": "",
  "short_name": "SplunkXMLFormatter",
  "permissions" : [
    "storage"
  ],
  "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": [ "./splunk_xml.js", "./highlightjs.min.js", "./jquery.min.js" ],
        "css":["./splunk_xml.css"],
        "run_at": "document_end"
      }
  ]
}
