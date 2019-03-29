var browser_ = typeof chrome !== "undefined" ? chrome : browser
var xml_enable_by_default = false;

var waitForEl = function(selector, callback) {
    if (jQuery(selector).length)
    {
      callback();
    }
    else
    {
      setTimeout(function() { waitForEl(selector, callback); }, 100);
    }
};

var waitForNextPage = function(selector, callback) {
    if(jQuery(selector).attr("xml_page"))
    {
        setTimeout(function() { waitForNextPage(selector, callback); }, 1000);
    } else {
        callback();
    }
}

function checkForSplunk()
{
    return $("meta[name=author]").attr("content") === "Splunk Inc.";
};

function is_string_valide_xml(data)
{
    var parser = new DOMParser();
    var o_dom = parser.parseFromString(data, "text/xml");
    return !o_dom.querySelector("parsererror");
}


function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\n';
        pad += indent;
    });

    return formatted;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addListenerToEventExpander()
{
    $(".showinline").each(function(){
        if(!$(this).attr("listener_set")){
            $(this).click(function(){
                setTimeout(checkForXMLEvents, 50);
                setTimeout(addListenerToEventExpander, 50);
            });
            $(this).attr("listener_set", true)
        }        
    });
    $(".hideinline").each(function(){
        if(!$(this).attr("listener_set")){
            $(this).click(function(){
                setTimeout(checkForXMLEvents, 50);
                setTimeout(addListenerToEventExpander, 50);
            });
            $(this).attr("listener_set", true)
        }        
    });
    $(".expands").each(function(){
        var expand_block = $(this)
        if(!expand_block.attr("listener_set")){browser_.runtime.onMessage.addListener(function(request, sender, callback) {
            if (request.inject_splunk_js) {
                //Inject CSS
                restore_options(function(enable_status, theme){
                    url = browser_.runtime.getURL("styles/"+theme);
        
            expand_block.click(function(){
                setTimeout(function(){
                    waitForBlockVisible(expand_block.parent().find(".raw-event"), processBlock);                 
                }, 800);
                setTimeout(addListenerToEventExpander, 50);
            });
            expand_block.attr("listener_set", true)
        }        
    });     
}

function processBlock(block)
{
    raw_content = block;       
    let raw_event = raw_content.text();
    let data_cid = raw_content.parent().attr("data-cid");
    if(is_string_valide_xml(raw_event))
    {
        let balise=$('<span parent_id="'+data_cid+'" class="beautiful_xml">Show raw event</span><br/>');
        let content=$('<div class="xml-event wrap" style="display:none"></div>');
        
        block=$('<pre>'+htmlEntities(formatXml(raw_event))+'</pre>');
        hljs.highlightBlock(block[0]);
        content.append(block);
        balise.click(function() {
            if(content.is(":visible")) {
                $(this).text("Show formated XML");                        
            }
            else {
                $(this).text("Show raw event");
            }
            content.toggle();
            $("div[data-cid="+$(this).attr("parent_id")+"]").find(".raw-event").toggle();
        });
        raw_content.parent().prepend(content);
        raw_content.parent().prepend(balise);
        raw_content.attr("xml_done", true);
        if(xml_enable_by_default) {
            content.toggle();
            $("div[data-cid="+data_cid+"]").find(".raw-event").toggle();
        }
    }
}

var waitForBlockVisible = function(block, callback)
{
    if(!block.attr("xml_done")) {
        if(!block.is(":visible"))
        {
            setTimeout(waitForBlockVisible(block, callback), 2000);
        }
        else
        {
            callback(block)
        }
    }
}

function checkForXMLEvents()
{
    console.debug("Results present var's go");
    $(".raw-event").each(function() {
        var raw_content = $(this);
        if(!raw_content.attr("xml_done")) {        
            var raw_event = raw_content.text();
            var data_cid = raw_content.parent().attr("data-cid");
            if(is_string_valide_xml(raw_event))
            {
                var balise=$('<span parent_id="'+data_cid+'" class="beautiful_xml">Show raw event</span><br/>');
                var content=$('<div class="xml-event wrap" style="display:none"></div>');
                
                var block=$('<pre>'+htmlEntities(formatXml(raw_event))+'</pre>');
                hljs.highlightBlock(block[0]);
                content.append(block);
                balise.click(function() {
                    if(content.is(":visible")) {
                        $(this).text("Show formated XML");                        
                    }
                    else {
                        $(this).text("Show raw event");
                    }
                    content.toggle();
                    $("div[data-cid="+$(this).attr("parent_id")+"] > .raw-event").toggle();
                });
                raw_content.parent().prepend(content);
                raw_content.parent().prepend(balise);
                raw_content.attr("xml_done", true);
                if(xml_enable_by_default) {
                    content.toggle();
                    $("div[data-cid="+data_cid+"] > .raw-event").toggle();
                }
            }
        }
    console.debug("Results present let's go");
    addListenerToEventExpander();
    $(".raw-event").each(function() {
        waitForBlockVisible($(this), processBlock);
    });
    if(!$("body").attr("load_hljs")) {
        $("body").attr("load_hljs", true);
    }
    $("td.event").each(function(){
        $(this).attr("xml_page", true);
    });
    $(".events-controls-inner> div.shared-searchresultspaginator > ul > li").each(function(){
        $(this).click(function(){
            waitForNextPage("td.event", function()
            {
                waitForEl("td.event", checkForXMLEvents);
            });             
        });
    });
    /*$("td.event").each(function(){
        $(this).on("destroy", waitForEl("td.event", checkForXMLEvents));
    });*/
};

function checkActiveTab()
{
    if(! checkForSplunk())
    {
        console.debug("This is not a Splunk page");
        return;
    }
    
    if($("td.event").length === 0)
    {
        console.debug("No result found have to wait fo be present");
        waitForEl("td.event", checkForXMLEvents);      
    } 
    else
    {
        checkForXMLEvents();
    }
    console.debug("This is a Splunk page");
};

var keys = {}

$(document).keydown(function (e) {
    keys[e.which] = true;
    if(keys[13] && !keys[16]) {
        setTimeout(function(){ waitForEl("td.event", checkForXMLEvents); }, 8000);
    }
    if(keys[13] && keys[16]) {
        console.log("Ignore MAJ+ENTER")
    }
});

$(document).keyup(function (e) {
    delete keys[e.which];
});

$( document ).ready(function() {
    var sending = browser_.runtime.sendMessage(message={"inject_splunk_js": checkForSplunk()});
    sending.then(function(response) {
        if(response) {
            xml_enable_by_default=response.status;
            $("<style>").prop("type", "text/css").html(response.css).appendTo("head");
            waitForEl("td.event", checkForXMLEvents);
            waitForEl(".search-button", function(){
                var element = $(".search-button").find("a");
                if(!element.attr("listener_set")){
                    element.click(function(){
                        setTimeout(function(){ waitForEl("td.event", checkForXMLEvents); }, 8000);
                    });
                    element.attr("listener_set", true);                     
                }                
            });           
        }
    });
});