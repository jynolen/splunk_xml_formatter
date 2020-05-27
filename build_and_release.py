import json
import os
import sys
import requests
import zipfile
from github3 import GitHub

version = os.environ.get("GITHUB_REF").split("/")[-1]
if version == "dev":
  version_manifest = "0.0"
else:
  version_manifest = version.replace("v","")

is_tag = os.environ.get("GITHUB_REF").split("/")[-2] == "tags"

gh_user = GitHub(token=os.environ.get("TOKEN_EMAIL"))
gh_release = GitHub(token=os.environ.get("TOKEN_RELEASE"))

def create_manifest():
    json_manifest = json.load(open("manifest.json.tpl"))
    user = gh_user.user(username=os.environ.get("GITHUB_ACTOR"))
    json_manifest["author"] = "%s <%s>" % (user.name, user.email)
    json_manifest["version"] = version_manifest

    if len(sys.argv) == 2 and sys.argv[1] == "--firefox":
        json_manifest["browser_specific_settings"] = {
            "gecko": {
                "id" : "splunk_xml_formatter_test@%s" % os.environ.get("GITHUB_ACTOR"),
                "strict_min_version": "57.0"
            }
        }
    json.dump(json_manifest, open("manifest.json", "w"), indent=4)


def create_zip():
    if len(sys.argv) == 2 and sys.argv[1] == "--firefox":
        zipName = 'splunk_xml_formatter.firefox.%s.zip' % version
    else:
        zipName = 'splunk_xml_formatter.chrome.%s.zip' % version
    zipf = zipfile.ZipFile(zipName, 'w', zipfile.ZIP_DEFLATED)
    zipf.write("injector.js")
    zipf.write("manifest.json")
    zipf.write("splunk_xml.js")
    zipf.write("splunk_xml.css")
    zipf.write("LICENSE")
    zipf.write("img/splunk-icon-01.png")
    zipf.write("img/splunk.png")
    zipf.write("README.md")
    zipf.close()
    return zipName


def release_exists():
    user, repo = os.environ.get("GITHUB_REPOSITORY").split("/")
    repository = gh_release.repository(user, repo)
    try:
        repository.release_from_tag(version)
        return repository.release_from_tag(version)
    except:
        return None


def create_release():
    payload = {
        "tag_name": version,
        "name": version,
        "prerelease": not is_tag
    }
    user, repo = os.environ.get("GITHUB_REPOSITORY").split("/")
    repository = gh_release.repository(user, repo)
    release = repository.create_release(tag_name=version, name=version, prerelease=not is_tag)
    return release


def upload_artifact(zip_file, upload_url):
    files = {'file': open(zip_file, 'rb')}
    response = requests.post(upload_url, files=files, params={"name":zip_file})
    print("Upload status %d, msg:%s" % (response.status_code, response.text))


create_manifest()
zip_name = create_zip()
release = release_exists()
if release is None:
    release = create_release()

for asset in release.assets():
    if asset.name == zip_name:
        asset.delete()
release.upload_asset(content_type="application/zip", name=zip_name, asset=open(zip_name, "rb"))
