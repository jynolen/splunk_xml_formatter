import requests
import hashlib
import sys

jquery_http_hash = hashlib.sha256()
highlightjs_http_hash = hashlib.sha256()
jquery_file_hash = hashlib.sha256()
highlightjs_file_hash = hashlib.sha256()

jquery = requests.get("https://code.jquery.com/jquery-3.5.1.min.js").text.encode("utf-8")
highlightjs = requests.get("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3/highlight.min.js").text.encode("utf-8")

jquery_file = open("jquery.min.js", "rb").read()
highlightjs_file = open("highlightjs.min.js", "rb").read()

jquery_http_hash.update(jquery)
highlightjs_http_hash.update(highlightjs)
jquery_file_hash.update(jquery_file)
highlightjs_file_hash.update(highlightjs_file)

if jquery_http_hash.hexdigest() != jquery_file_hash.hexdigest():
    sys.stderr.writelines("jQuery hash does not match")
    sys.exit(-1)

if highlightjs_http_hash.hexdigest() != highlightjs_file_hash.hexdigest():
    sys.stderr.writelines("highlightjs hash does not match")
    sys.exit(-2)