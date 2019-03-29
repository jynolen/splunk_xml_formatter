var browser_ = typeof chrome !== "undefined" ? chrome : browser

// Saves options to chrome.storage
function save_options() {
    var theme = document.getElementById('theme').value;
    var enable = document.getElementById('enable').checked;
    browser_.storage.sync.set({
        splunk_xml_theme: theme,
        splunk_xml_enable: enable
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
        status.textContent = '';
        }, 750);
    });
}
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
function restore_options() {
    // Use default value theme = 'github-gist' and enable = true.
    browser_.storage.sync.get({
        splunk_xml_theme: 'github-gist.css',
        splunk_xml_enable: true
    }, function(items) {
        document.getElementById('theme').value = items.splunk_xml_theme;
        document.getElementById('enable').checked = items.splunk_xml_enable;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
$(document).ready(function() {
    $("#theme").select2();
});