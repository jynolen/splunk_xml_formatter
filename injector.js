let injectScript = function(file, node) {
    let th = document.getElementsByTagName(node)[0];
    let s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

let checkForSplunk = function()
{
    const metas = document.getElementsByTagName('meta');
    for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('name') === "author") {
            return metas[i].getAttribute('content') === "Splunk Inc.";
        }
    }
    return false;
};

if(checkForSplunk())
{
    injectScript( chrome.extension.getURL('splunk_xml.js'), 'body' );
    injectScript( "//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3/highlight.min.js", 'body');
}