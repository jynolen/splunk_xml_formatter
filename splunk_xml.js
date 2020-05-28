let highlightStyle = {"a11y-dark": "A 11 Y Dark", "a11y-light": "A 11 Y Light", "agate": "Agate", "an-old-hope": "An Old Hope", "androidstudio": "Androidstudio", "arduino-light": "Arduino Light", "arta": "Arta", "ascetic": "Ascetic", "atelier-cave-dark": "Atelier Cave Dark", "atelier-cave-light": "Atelier Cave Light", "atelier-dune-dark": "Atelier Dune Dark", "atelier-dune-light": "Atelier Dune Light", "atelier-estuary-dark": "Atelier Estuary Dark", "atelier-estuary-light": "Atelier Estuary Light", "atelier-forest-dark": "Atelier Forest Dark", "atelier-forest-light": "Atelier Forest Light", "atelier-heath-dark": "Atelier Heath Dark", "atelier-heath-light": "Atelier Heath Light", "atelier-lakeside-dark": "Atelier Lakeside Dark", "atelier-lakeside-light": "Atelier Lakeside Light", "atelier-plateau-dark": "Atelier Plateau Dark", "atelier-plateau-light": "Atelier Plateau Light", "atelier-savanna-dark": "Atelier Savanna Dark", "atelier-savanna-light": "Atelier Savanna Light", "atelier-seaside-dark": "Atelier Seaside Dark", "atelier-seaside-light": "Atelier Seaside Light", "atelier-sulphurpool-dark": "Atelier Sulphurpool Dark", "atelier-sulphurpool-light": "Atelier Sulphurpool Light", "atom-one-dark-reasonable": "Atom One Dark Reasonable", "atom-one-dark": "Atom One Dark", "atom-one-light": "Atom One Light", "brown-paper": "Brown Paper", "codepen-embed": "Codepen Embed", "color-brewer": "Color Brewer", "darcula": "Darcula", "dark": "Dark", "default": "Default", "docco": "Docco", "dracula": "Dracula", "far": "Far", "foundation": "Foundation", "github-gist": "Github Gist", "github": "Github", "gml": "Gml", "googlecode": "Googlecode", "gradient-dark": "Gradient Dark", "grayscale": "Grayscale", "gruvbox-dark": "Gruvbox Dark", "gruvbox-light": "Gruvbox Light", "hopscotch": "Hopscotch", "hybrid": "Hybrid", "idea": "Idea", "ir-black": "Ir Black", "isbl-editor-dark": "Isbl Editor Dark", "isbl-editor-light": "Isbl Editor Light", "kimbie.dark": "Kimbie Dark", "kimbie.light": "Kimbie Light", "lightfair": "Lightfair", "magula": "Magula", "mono-blue": "Mono Blue", "monokai-sublime": "Monokai Sublime", "monokai": "Monokai", "night-owl": "Night Owl", "nord": "Nord", "obsidian": "Obsidian", "ocean": "Ocean", "paraiso-dark": "Paraiso Dark", "paraiso-light": "Paraiso Light", "pojoaque": "Pojoaque", "purebasic": "Purebasic", "qtcreator_dark": "Qtcreator Dark", "qtcreator_light": "Qtcreator Light", "railscasts": "Railscasts", "rainbow": "Rainbow", "routeros": "Routeros", "school-book": "School Book", "shades-of-purple": "Shades Of Purple", "solarized-dark": "Solarized Dark", "solarized-light": "Solarized Light", "srcery": "Srcery", "sunburst": "Sunburst", "tomorrow-night-blue": "Tomorrow Night Blue", "tomorrow-night-bright": "Tomorrow Night Bright", "tomorrow-night-eighties": "Tomorrow Night Eighties", "tomorrow-night": "Tomorrow Night", "tomorrow": "Tomorrow", "vs": "Vs", "vs2015": "Vs 2015", "xcode": "Xcode", "xt256": "Xt 256"};
let Formatter = function (options) {
    this.init(options);
    let methodName = this.options.method;
    if (!jQuery.isFunction(this[methodName])) {
        jQuery.error("'" + methodName + "' is not a Formatter method.");
    }
    this.format = function(text) {
        return this[this.options.method].call(this, text);
    };
};


let createShiftArr=function (step) {
    let space = "    ";
    if ( Number.isNaN(parseInt(step)) ) {
        space = step;
    } else {
        space = new Array(step + 1).join(' ');
    }
    let shift = ["\n"];
    for(let ix=0; ix<100; ix++){
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
        let ar = text.replace(/>\s{0,}</g,"><")
                     .replace(/</g,"~::~<")
                     .replace(/\s*xmlns\:/g,"~::~xmlns:")
                     .replace(/\s*xmlns\=/g,"~::~xmlns=")
                     .split("~::~"),
            len = ar.length,
            inComment = false,
            deep = 0,
            str = "",
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
                /^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace("/","")) {
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

        return  (str[0] == "\n") ? str.slice(1) : str;
    }
};


if (!String.prototype.encodeHTML) {
    String.prototype.encodeHTML = function () {
      return this.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&apos;");
    };
  }

let waitForEl = function(selector, callback) {
    if (jQuery(selector).length)
    {
      callback();
    }
    else
    {
      setTimeout(function() { waitForEl(selector, callback); }, 100);
    }
};

let is_string_valid_xml = function(data)
{
    try {
        jQuery.parseXML(data);
        return true;
      }
      catch(error) {
        return false;
      }
};

let formatXml = function(text) {
    let fmt = new Formatter({method: "xml", step: "\t"});
    return fmt.xml(text);
};


let searchXMLEvent = function() {
    jQuery("td.event").find(".raw-event").each(function( index ) {
        if( is_string_valid_xml( jQuery(this).text() )) {
            let content=jQuery('<div class="xml-event xml-valid nowrap" style="display:none"></div>');
            block=jQuery("<pre>"+formatXml(jQuery(this).text()).encodeHTML()+"</pre>");
            hljs.configure({ tabReplace: "    "});
            hljs.highlightBlock(block[0]);
            content.append(block);
            if(jQuery(this).parent().find(".xml-event.xml-valid").length == 0)
                jQuery(this).parent().prepend(content);
        }
        else {
            let content=jQuery('<div class="xml-event xml-invalid nowrap" style="display:none"></div>');
            block=jQuery('<pre lang="xml"><code class="xml">'+jQuery(this).text().encodeHTML()+'</code></pre>');
            warning=jQuery('<pre class="xml-warning"><i class="icon-alert"></i> This event has an invalid XML content, try expend to all lines before toggle format XML again</pre>');
            hljs.configure({ tabReplace: "    "});
            hljs.highlightBlock(block[0]);
            content.append(block);
            content.append(warning);
            if(jQuery(this).parent().find(".xml-event.xml-invalid").length == 0)
                jQuery(this).parent().prepend(content);
        }
    }).promise().done(function() {
        jQuery("td.event").find(".raw-event").each(function(){
            jQuery(this).toggle();
        });
        jQuery("td.event").find(".xml-event").each(function(){
            jQuery(this).toggle();
        });
    });
};

let highlighStyleChoice = function(recordStyle="github-gist") {
    let mainBlock = jQuery('<div class="dropdown-menu dropdown-menu-selectable dropdown-menu-default open" id="xmlStyleFormat" style="display:none">');
    mainBlock.append(jQuery('<div class="arrow" style="margin-left: -8px;">'));
    let styleList = jQuery('<ul class="dropdown-menu-main">');
    let li = jQuery("<li>");
    let a = jQuery('<a class="synthetic-select " target="_blank" href="https://highlightjs.org/static/demo" data-item-idx="0">');
    a.append(jQuery('<i class="icon-check" style="display:none"></i>'));
    a.append(jQuery('<span class="link-label" style="color:#006eaa; text-decoration: underline">Go here for a preview of styles</span>'));
    li.append(a);
    styleList.append(li);

    li = jQuery("<li>");
    a = jQuery('<a class="synthetic-select" id="linkToActiveStyle" target="_blank" href="#" data-item-idx="1" style="border-bottom: dashed 1px #e1e6eb" data-item-value="'+recordStyle+'">');
    a.append(jQuery('<i class="icon-check" style="display:inline"></i>'));
    a.append(jQuery('<span class="link-label" id="spanToActiveStyle" >'+highlightStyle[recordStyle]+'</span>'));
    li.append(a);
    styleList.append(li);

    let index = 2;
    for (let styleId in highlightStyle) {
        let styleName = highlightStyle[styleId];
        li = jQuery("<li>");
        a = jQuery('<a class="synthetic-select " href="#" data-item-idx="'+index+'" data-item-value="'+styleId+'">');
        a.append(jQuery('<i class="icon-check" style="display:none"></i>'));
        a.append(jQuery('<span class="link-label">'+styleName+'</span>'));
        a.bind("click", function(){
            selectStyle(styleId);
            mainBlock.toggle();
        });
        li.append(a);
        styleList.append(li);

    }
    mainBlock.append(styleList);
    mainBlock.append(jQuery('<div class="dropdown-footer"></div>'));
    return mainBlock;
};

let selectStyle = function(style="github-gist") {
    let hl = jQuery("link[title=highlightStyle]");
    if (hl.length == 1) {
        hl.remove();
    }
    style_url = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.0.3/styles/"+style+".min.css";
    hl = jQuery('<link rel="stylesheet" title="highlightStyle">');
    hl.attr("href", style_url);
    jQuery("body").append(hl);

    chrome.storage.local.set({"splunk_xml_highlight":style}, function() {
        jQuery("#linkToActiveStyle").attr("data-item-value", style);
        jQuery("#spanToActiveStyle").text(highlightStyle[style]);
    });
};

let addXMLFormatButton = function() {
    if(jQuery("#xmlFormatBtn").length == 0) {
        let xmlBoutonDiv1=jQuery('<div id="xmlFormatBtn" class="btn-group shared-vizcontrols-format">');
        let xmlBoutonA=jQuery('<a class="btn-pill popdown-toggle format" href="#" aria-label="Formater XML">');
        xmlBoutonA.append(jQuery('<i class="icon-code-thin"></i>'));
        xmlBoutonA.append(jQuery('<span class="link-label" >Format/Unformat XML Events</span>'));
        xmlBoutonDiv1.append(xmlBoutonA);
        xmlBoutonDiv1.bind("click", function() {
            waitForEl("td.event", searchXMLEvent);
        });
        jQuery("div.events-controls-inner").prepend(xmlBoutonDiv1);

        let xmlStyleBoutonDiv1=jQuery('<div id="xmlStyleFormatBtn" class="btn-group shared-controls-syntheticselectcontrol control-default">');
        let xmlStyleBoutonA=jQuery('<a class="dropdown-toggle btn-pill" href="#" aria-label="Formater XML Css" data-dialog-id="xmlStyleFormat">');
        xmlStyleBoutonA.append(jQuery('<i class="icon-pencil"></i>'));
        xmlStyleBoutonA.append(jQuery("<span class='link-label'> XML Event Style</span>"));
        xmlStyleBoutonA.append(jQuery("<span class='caret'></span>"));
        xmlStyleBoutonDiv1.append(xmlStyleBoutonA);
        styleList = highlighStyleChoice();
        jQuery("div.events-controls-inner").prepend(xmlStyleBoutonDiv1);
        jQuery("div.events-controls-inner").prepend(xmlBoutonDiv1);
        jQuery("body").append(styleList);
        xmlStyleBoutonDiv1.bind("mousedown", function(){
            styleList.css({
                "block":"top",
                "bottom":"auto",
                "margin":"0 0 0 0",
                "top": xmlStyleBoutonDiv1.offset().top + 35,
                "display": styleList.css("display") === "block" ? "none" : "block"
            });
            leftOffset = xmlStyleBoutonDiv1.offset().left - (styleList.width() - xmlStyleBoutonDiv1.width())/2;
            styleList.css("left", leftOffset);
        });
        chrome.storage.local.get("splunk_xml_highlight", function(result) {
            styleId = result.splunk_xml_highlight === undefined ? "github-gist" : result.splunk_xml_highlight;
            jQuery("#linkToActiveStyle").attr("data-item-value", styleId);
            jQuery("#spanToActiveStyle").text(highlightStyle[styleId]);
            selectStyle(styleId);
        });
    }
};

let waitForjQuery = function(callback) {
    if (typeof jQuery == "undefined") {
        setTimeout(function() { waitForjQuery(callback); }, 100);
    }
    else
    {
      callback();
    }
};

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

waitForjQuery(function() {
    if(checkForSplunk()) {
        waitForEl("div.events-controls-inner", addXMLFormatButton);
    } else {
        jQuery = null;
        hljs = null;
    }
});