import json
import os
import sys
import requests
import zipfile


version = os.environ.get("GITHUB_REF").split("/")[-1]
def create_manifest():
    json_manifest = json.load(open("manifest.json.tpl"))
    header = {"Authorization": "token %s" % os.environ.get("TOKEN_EMAIL")}
    response = requests.get("https://api.github.com/users/%s" % os.environ.get("GITHUB_ACTOR"), headers=header)    
    json_manifest["author"] = "%s <%s>" % (response.json().get("name"), response.json().get("email"))
    json_manifest["version"] = version

    if len(sys.argv) == 2 and sys.argv[1] == "--firefox":
        json_manifest["browser_specific_settings"] = {
            "gecko": {
                "id" : "splunk_xml_formatter_test@%s" % os.environ.get("GITHUB_ACTOR"),
                "strict_min_version": "57.0"
            }
        }
    json.dump(json_manifest, open("manifest.json", "w"), indent=4)

def create_zip():
    def zipdir(path, ziph):
        # ziph is zipfile handle
        for root, dirs, files in os.walk(path):
            for file in files:
                ziph.write(os.path.join(root, file))
    
    zipf = zipfile.ZipFile('build/splunk_xml_formatter.%s.zip' % version, 'w', zipfile.ZIP_DEFLATED)
    zipdir('.', zipf)
    zipf.close()

def release_exists():
    header = {"Authorization": "token %s" % os.environ.get("TOKEN_RELEASE")}
    response = requests.get("https://api.github.com/repos/%s/releases/tags/%s" % ( os.environ.get("GITHUB_REPOSITORY"), version ), headers=header)
    return response.status_code == 200

def create_release():
    payload = {
        "tag_name": version,
        "name": version,
        "prerelease": ""
    }


create_manifest()
create_zip()