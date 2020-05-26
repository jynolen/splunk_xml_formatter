import json
import os
import sys
import requests
import zipfile


header = {"Authorization": "token %s" % os.environ.get("TOKEN_EMAIL")}
response = requests.get("https://api.github.com/users/%s" % os.environ.get("GITHUB_ACTOR"), headers=header)

json_manifest = json.load(open("manifest.json.tpl"))
json_manifest["author"] = "%s <%s>" % (response.json().get("name"), response.json().get("email"))
version = os.environ.get("GITHUB_REF").split("/")[-1]
json_manifest["version"] = version

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
zipf = zipfile.ZipFile('build/splunk_xml_formatter.%s.zip' % version, 'w', zipfile.ZIP_DEFLATED)
zipdir('.', zipf)
zipf.close()