import json
import os
import sys
import requests
import zipfile

response = requests.get("https://api.github.com/users/%s" % os.environ.get("GITHUB_ACTOR"))

json_manifest = json.load(open("manifest.json.tpl"))
json_manifest["author"] = response.json().get("Name")
json_manifest["version"] = os.environ.get("GIT_TAG")

if len(sys.argv) == 2 and sys.argv[1] == "--firefox":
    json_manifest["browser_specific_settings"] = {
        "gecko": {
            "id" : "splunk_xml_formatter_test@%s" % os.environ.get("GITHUB_ACTOR"),
            "strict_min_version": "57.0"
        }
    }

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))
    
json.dump(json_manifest, open("manifest.json", "w"), indent=4)
zipf = zipfile.ZipFile('splunk_xml_formatter.%s.zip' % os.environ.get("GIT_TAG"), 'w', zipfile.ZIP_DEFLATED)
zipdir('.', zipf)
zipf.close()