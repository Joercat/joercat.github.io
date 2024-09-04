(function(opts_) {
    'use strict';
    
    var f = this || self;
    var g = function(a) { return a; };
    var h;
    
    function k(a, b) {
        this.h = a === l && b || "";
        this.g = m;
    }
    
    function n(a) {
        return a instanceof k && a.constructor === k && a.g === m ? a.h : "type_error:Const";
    }
    
    var m = {}, l = {};
    
    function p(a, b) {
        this.h = b === q ? a : "";
    }
    
    p.prototype.toString = function() {
        return this.h + "";
    };
    
    function r(a) {
        return a instanceof p && a.constructor === p ? a.h : "type_error:TrustedResourceUrl";
    }
    
    function u(a, b) {
        var c = n(a);
        if (!v.test(c)) throw Error("Invalid TrustedResourceUrl format: " + c);
        a = c.replace(w, function(d, e) {
            if (!Object.prototype.hasOwnProperty.call(b, e)) throw Error('Found marker, "' + e + '", in format string, "' + c + '", but no valid label mapping found in args: ' + JSON.stringify(b));
            d = b[e];
            return d instanceof k ? n(d) : encodeURIComponent(String(d));
        });
        return x(a);
    }
    
    var w = /%{(\w+)}/g;
    var v = RegExp("^((https:)?//[0-9a-z.:[\\]-]+/|/[^/\\\\]|[^:/\\\\%]+/|[^:/\\\\%]*[?#]|about:blank#)", "i");
    var y = /^([^?#]*)(\?[^#]*)?(#[\s\S]*)?/;
    
    function z(a) {
        var b = A;
        a = u(B, a);
        a = y.exec(r(a).toString());
        var c = a[3] || "";
        return x(a[1] + C("?", a[2] || "", b) + C("#", c));
    }
    
    var q = {};
    
    function x(a) {
        if (void 0 === h) {
            var b = null;
            var c = f.trustedTypes;
            if (c && c.createPolicy) {
                try {
                    b = c.createPolicy("goog#html", { createHTML: g, createScript: g, createScriptURL: g });
                } catch (d) {
                    f.console && f.console.error(d.message);
                }
                h = b;
            } else h = b;
        }
        a = h ? h.createScriptURL(a) : a;
        return new p(a, q);
    }
    
    function C(a, b, c) {
        if (null == c) return b;
        if ("string" === typeof c) return c ? a + encodeURIComponent(c) : "";
        for (var d in c)
            if (Object.prototype.hasOwnProperty.call(c, d)) {
                var e = c[d];
                e = Array.isArray(e) ? e : [e];
                for (var t = 0; t < e.length; t++) {
                    var D = e[t];
                    null != D && (b || (b = a), b += (b.length > a.length ? "&" : "") + encodeURIComponent(d) + "=" + encodeURIComponent(String(D)));
                }
            }
        return b;
    }
    
    function E(a, b) {
        this.g = b === F ? a : "";
    }
    
    E.prototype.toString = function() {
        return this.g.toString();
    };
    
    var F = {};
    
    var G;
    
    try {
        new URL("s://g"), G = !0;
    } catch (a) {
        G = !1;
    }
    
    var H = G;
    
    var I = "alternate author bookmark canonical cite help icon license next prefetch dns-prefetch prerender preconnect preload prev search subresource".split(" ");
    
    var J = new k(l, "https://www.google.com/cse/static/style/look/%{versionDir}%{versionSlash}%{theme}.css");
    var K = new k(l, "https://www.google.com/cse/static/element/%{versionDir}%{versionSlash}default%{experiment}+%{lang}.css");
    var B = new k(l, "https://www.google.com/cse/static/element/%{versionDir}%{versionSlash}cse_element__%{lang}.js");
    var L = new k(l, "/");
    
    window.__gcse = window.__gcse || {};
    window.__gcse.ct = Date.now();
    
    window.__gcse.scb = function() {
        var a = window.__gcse;
        if (!M()) delete opts_.rawCss;
        var b = N(a.initializationCallback || a.callback);
        
        if (google.search.cse.element.init(opts_)) {
            if ("explicit" !== a.parsetags) {
                if ("complete" === document.readyState || "interactive" === document.readyState) {
                    google.search.cse.element.go();
                    null == b || b();
                } else {
                    google.setOnLoadCallback(function() {
                        google.search.cse.element.go();
                        null == b || b();
                    }, !0);
                }
            } else {
                null == b || b();
            }
        }
    };
    
    function N(a) {
        if ("function" === typeof a) return a;
        if ("string" !== typeof a) return null;
        a = window[a];
        return "function" !== typeof a ? null : a;
    }
    
    function M() {
        var a;
        return null != (a = window.__gcse) && a.plainStyle;
    }
    
    function O(a) {
        var b = document.createElement("link");
        b.type = "text/css";
        a: {
            if (a instanceof p) b.href = r(a).toString();
            else {
                if (-1 === I.indexOf("stylesheet")) throw Error('TrustedResourceUrl href attribute required with rel="stylesheet"');
                if (a instanceof E) a = a instanceof E && a.constructor === E ? a.g : "type_error:SafeUrl";
                else {
                    c: {
                        if (H) {
                            try {
                                var c = new URL(a);
                            } catch (d) {
                                c = "https:";
                                break c;
                            }
                            c = c.protocol;
                        } else {
                            d: {
                                c = document.createElement("a");
                                try {
                                    c.href = a;
                                } catch (d) {
                                    c = void 0;
                                    break d;
                                }
                                c = c.protocol;
                                c = ":" === c || "" === c ? "https:" : c;
                            }
                        }
                        a = "javascript:" !== c ? a : void 0;
                    }
                    if (void 0 === a) break a;
                }
                b.href = a;
            }
            b.rel = "stylesheet";
        }
        return b;
    }
    
    var P,
        A = opts_.usqp ? { usqp: opts_.usqp } : {},
        Q = opts_.language.toLowerCase();
    
    P = opts_.cselibVersion ? z({ versionDir: opts_.cselibVersion, versionSlash: L, lang: Q }) : z({ versionDir: "", versionSlash: "", lang: Q });
    
    var R = window.__gcse.scb,
        S = document.createElement("script");
    
    S.src = r(P);
    var T,
        U,
        V,
        W = null == (V = null == (U = (S.ownerDocument && S.ownerDocument.defaultView || window).document) ? void 0 : U.querySelector) ? void 0 : V.call(U, "script[nonce]");
    
    (T = W ? W.nonce || W.getAttribute("nonce") || "" : "") && S.setAttribute("nonce", T);
    S.type = "text/javascript";
    R && (S.onload = R);
    
    // Append script to head
    document.getElementsByTagName("head")[0].appendChild(S);
    
    if (M()) {
        // Append CSS
        document.getElementsByTagName("head")[0].appendChild(O(opts_.cselibVersion ? u(K, { versionDir: opts_.cselibVersion, versionSlash: L, experiment: opts_.uiOptions.cssThemeVersion && 4 !== opts_.uiOptions.cssThemeVersion ? "_v" + opts_.uiOptions.cssThemeVersion : "", lang: opts_.language }) : u(K, { versionDir: "", versionSlash: "", experiment: "", lang: opts_.language })));
        
        var X,
            Y = "v" + (opts_.uiOptions.cssThemeVersion || 4);
        
        // Append CSS
        X = u(J, { versionDir: Y, versionSlash: Y ? L : "", theme: opts_.theme.toLowerCase().replace("v2_", "") });
        document.getElementsByTagName("head")[0].appendChild(O(X));
    }
    
    // Find the element by ID and append the search box
    var searchContainer = document.getElementById("search-container");
    if (searchContainer) {
        var searchBox = document.createElement("div");
        searchBox.className = "gcse-search";
        searchContainer.appendChild(searchBox);
    }
    
})({
    "cx": "a637a9f74429f4010",
    "language": "en",
    "theme": "MINIMALIST",
    "uiOptions": {
        "resultsUrl": "",
        "enableAutoComplete": true,
        "enableImageSearch": true,
        "imageSearchLayout": "popup",
        "resultSetSize": "filtered_cse",
        "enableOrderBy": true,
        "orderByOptions": [
            {
                "label": "Relevance",
                "key": ""
            },
            {
                "label": "Date",
                "key": "date"
            }
        ],
        "overlayResults": false,
        "webSearchResultSetSize": 0,
        "webSearchExtendedRestricts": {
            "lr": "",
            "cr": "",
            "gl": "",
            "filter": 0,
            "sort": "",
            "as_oq": "",
            "as_sitesearch": ""
        },
        "queryParameterName": "q",
        "enableHistory": true,
        "numTopRefinements": -1,
        "enableRichSnippets": false,
        "hideElementBranding": false,
        "cssThemeVersion": 4,
        "isSafeSearchActive": false,
        "numTopAds": 3
    },
    "protocol": "https",
    "rawCss": ".gsc-control-cse{font-family:arial, sans-serif}.gsc-control-cse .gsc-table-result{font-family:arial, sans-serif}.gsc-refinementsGradient{background:linear-gradient(to left,rgba(255,255,255,1),rgba(255,255,255,0))}",
    "cse_token": "AB-tC_7OI677ZNC0s8QFi9-lOEJR:1725458364681",
    "isHostedPage": false,
    "exp": ["cc", "apo"],
    "cselibVersion": "8fa85d58e016b414",
    "usqp": "CAI\u003d"
});
