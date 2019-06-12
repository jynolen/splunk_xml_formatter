var browser_ = typeof chrome !== "undefined" ? chrome : browser
let xml_enable_by_default = false;

var Formatter = function (options) {
    this.init(options);
    //TODO - if options object maps any functions, add them as appropriately named methods
    var methodName = this.options.method;
    if (!$.isFunction(this[methodName])) {
        $.error("'" + methodName + "' is not a Formatter method.");
    };
    this.format = function(text) { //alias to currently selected method
        return this[this.options.method].call(this, text);
    };
};


/**
 * putting the methods into the prototype instead of the constructor method
 * enables more efficient on-the-fly creation of Formatter instances
 */
var createShiftArr=function (step) {
    var space = '    ';
    if ( isNaN(parseInt(step)) ) {  // argument is string
        space = step;
    } else { // argument is integer
        space = new Array(step + 1).join(' '); //space is result of join (a string), not an array
    }
    var shift = ['\n']; // array of shifts
    for(var ix=0;ix<100;ix++){
        shift.push(shift[ix]+space);
    }
    return shift;
};

Formatter.prototype = {
    options: {},

    init: function(options) {
        this.options = options;
        this.step = this.options.step;
        this.preserveComments = this.options.preserveComments;
        this.shift = createShiftArr(this.step);
    },

    xml: function(text) {
        var ar = text.replace(/>\s{0,}</g,"><")
                     .replace(/</g,"~::~<")
                     .replace(/\s*xmlns\:/g,"~::~xmlns:")
                     .replace(/\s*xmlns\=/g,"~::~xmlns=")
                     .split('~::~'),
            len = ar.length,
            inComment = false,
            deep = 0,
            str = '',
            ix = 0;

        for(ix=0;ix<len;ix++) {
            // start comment or <![CDATA[...]]> or <!DOCTYPE //
            if(ar[ix].search(/<!/) > -1) {
                str += this.shift[deep]+ar[ix];
                inComment = true;
                // end comment  or <![CDATA[...]]> //
                if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) {
                    inComment = false;
                }
            } else
            // end comment  or <![CDATA[...]]> //
            if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
                str += ar[ix];
                inComment = false;
            } else
            // <elm></elm> //
            if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) &&
                /^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) {
                str += ar[ix];
                if(!inComment) deep--;
            } else
             // <elm> //
            if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 ) {
                str = !inComment ? str += this.shift[deep++]+ar[ix] : str += ar[ix];
            } else
             // <elm>...</elm> //
            if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
            } else
            // </elm> //
            if(ar[ix].search(/<\//) > -1) {
                str = !inComment ? str += this.shift[--deep]+ar[ix] : str += ar[ix];
            } else
            // <elm/> //
            if(ar[ix].search(/\/>/) > -1 ) {
                str = !inComment ? str += this.shift[deep]+ar[ix] : str += ar[ix];
            } else
            // <? xml ... ?> //
            if(ar[ix].search(/<\?/) > -1) {
                str += this.shift[deep]+ar[ix];
            } else
            // xmlns //
            if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1) {
                str += this.shift[deep]+ar[ix];
            }

            else {
                str += ar[ix];
            }
        }

        return  (str[0] == '\n') ? str.slice(1) : str;
    }
};

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
    let parser = new DOMParser();
    let o_dom = parser.parseFromString(data, "text/xml");
    return !o_dom.querySelector("parsererror");
}

function formatXml(text) {
    var fmt = new Formatter({method: 'xml', step: '\t'});
    return fmt.xml(text);
}

function formatXml2(xml) {
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
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br/>');
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
        if(!expand_block.attr("listener_set")){
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
        let content=$('<div class="xml-event nowrap" style="display:none"></div>');
        
        block=$('<pre>'+htmlEntities(formatXml(raw_event))+'</pre>');
        hljs.configure({ tabReplace: '    '});
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
var waitForBlockInline = function(parentID, oldText, callback)
{
    let block = $("[data-cid='"+parentID+"']").find(".raw-event");
    new_text = block.text();
    if(new_text == oldText) {
        setTimeout(function() { waitForBlockInline(parentID, oldText, callback); }, 2000);
    } else {
        callback(block);
    }
}


var waitForBlockVisible = function(block, callback)
{
    if(!block.attr("xml_done")) {
        if(!block.is(":visible"))
        {
            setTimeout(function() { waitForBlockVisible(block, callback); }, 2000);
        }
        else if($(block.parent()).find(".showinline").length > 0) {
            $(block.parent()).find(".showinline").click(function(){
                waitForBlockInline($(block.parent()).attr("data-cid"), block.text(), callback);
            });
        }
        else
        {
            callback(block)
        }
    }
}

function checkForXMLEvents()
{
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

$( document ).ajaxStart(function() {
    console.info("Start AJAX Request");
});

if(typeof chrome !== "undefined"){
    $( document ).ready(function() {
        browser_.runtime.sendMessage(message={"inject_splunk_js": checkForSplunk()}, responseCallback=function(response) {
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
} else {
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
}

