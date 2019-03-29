function restore_options(callback) {
    // Use default value theme = 'github-gist' and enable = true.
    chrome.storage.sync.get({
        splunk_xml_theme: 'github-gist.css',
        splunk_xml_enable: true
    }, function(items) {
        callback(items.splunk_xml_enable, items.splunk_xml_theme);
    });
}

function callbackSplunkPage(array_of_result)
{
    console.log(array_of_result)
}

chrome.extension.onMessage.addListener(function(request, sender, callback) {
    if (request.inject_splunk_js) {
        //Inject CSS
        restore_options(function(enable_status, theme){
            url = chrome.runtime.getURL("styles/"+theme);
            const req = new XMLHttpRequest();
            req.onreadystatechange = function(event) {
                // XMLHttpRequest.DONE === 4
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        reponse = {"status":enable_status, "css":this.responseText}
                        callback(reponse);
                    }
                }
            };
            req.open('GET', url, true);
            req.send(null);
        });
        return true;
    }    
});