import json
import os
import sys

json_manifest = json.load(open("manifest.json.tpl"))
json_manifest["author"] = os.environ.get("GIT_AUTHOR")
json_manifest["version"] = os.environ.get("GIT_TAG")

if len(sys.argv) == 2 and sys.argv[1] == "--firefox":
    json_manifest["browser_specific_settings"] = {
        "gecko": {
            "id" : "splunk_xml_formatter_test@%s" % os.environ.get("FIREFOX_USER"),
            "strict_min_version": "57.0"
        }
    }
print(sys.argv)
json.dump(json_manifest, open("manifest.json", "w"), indent=4)