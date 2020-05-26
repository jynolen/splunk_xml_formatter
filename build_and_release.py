import json
import os
import sys
import requests
import zipfile
from github3 import GitHub

version = os.environ.get("GITHUB_REF").split("/")[-1]
is_tag = os.environ.get("GITHUB_REF").split("/")[-2] == "tags"

gh_user = GitHub(token=os.environ.get("TOKEN_EMAIL"))
gh_release = GitHub(token=os.environ.get("TOKEN_RELEASE"))

def create_manifest():
    json_manifest = json.load(open("manifest.json.tpl"))
    user = gh_user.user(username=os.environ.get("GITHUB_ACTOR"))
    json_manifest["author"] = "%s <%s>" % (user.name, user.email)
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
    
    zipf = zipfile.ZipFile('splunk_xml_formatter.%s.zip' % version, 'w', zipfile.ZIP_DEFLATED)
    zipdir('.', zipf)
    zipf.close()
    return 'splunk_xml_formatter.%s.zip' % version


def release_exists():
    user, repo = os.environ.get("GITHUB_REPOSITORY").split("/")
    repository = gh_release.repository(user, repo)
    try:
        repository.release_from_tag("dev")
        return repository.release_from_tag("dev")
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
release.upload_asset(content_type="application/zip", name=zip_name, asset=open(zip_name, "rb"))