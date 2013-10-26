﻿/*
 * @name Operating System
 * @desc
Currently  is only to userAgent
 */
(function () {
    if (module.declare === undefined) {
        throw 'There is no global module.declare method!';
    }
    //userAgent regexp
    var Exp_USERAGENT = {
        //browser
        MSIE : /(msie) ([\w.]+)/,
        MOZILLA : /(mozilla)(?:.*? rv:([\w.]+)|)/,
        SAFARI : /(safari)(?:.*version|)[\/]([\d.]+)/,
        CHROME : /(chrome|crios)[\/]([\w.]+)/,
        OPERA : /(opera|opr)(?:.*version|)[\/]([\w.]+)/,
        WEBOS : /(webos|hpwos)[\s\/]([\d.]+)/,
        DOLFIN : /(dolfin)(?:.*version|)[\/]([\w.]+)/, //
        SILK : /(silk)(?:.*version|)[\/]([\w.]+)/, //
        UC : /(uc)browser(?:.*version|)[\/]([\w.]+)/, //
        
        //engine
        WEBKIT : /webkit[\/]([\w.]+)/,
        GECKO : /gecko[\/]([\w.]+)/, //
        PRESTO : /presto[\/]([\w.]+)/, //
        TRIDENT : /trident[\/]([\w.]+)/,
        
        //device
        MAC : /(mac os x)\s+([\w_]+)/, //
        WINNDOWS : /(windows nt)\s+([\w.]+)/, //
        LINUX : /linux/, //
        IOS : /i(?:pad|phone|pod)(?:.*)cpu(?: iphone)? os/,
        ANDROID : /(android)\s+([\d.]+)/,
        WINDOWSPHONE : /windowsphone/, //
        IPAD : /(ipad).*os\s([\d_]+)/,
        IPHONE : /(iphone\sos)\s([\d_]+)/,
        TOUCHPAD : /touchpad/,
        BLACKBERRY : /(blackberry|bb\d+).*version\/([\d.]+)/,
        RIMTABLET : /rimtablet/, //
        BADA : /bada/, //
        CHROMEOS : /cromeos///
    };
    //define os module
    module.declare('os', function (require, exports, module) {
        function detect(ua) {
            var os = {},
            //browser
            chrome = ua.match(Exp_USERAGENT.CHROME),
            opera = ua.match(Exp_USERAGENT.OPERA),
            msie = ua.match(Exp_USERAGENT.MSIE),
            safari = (ua + ua.replace(Exp_USERAGENT.SAFARI, ' ')).match(Exp_USERAGENT.SAFARI), //modify the jquery bug
            mozilla = ua.match(Exp_USERAGENT.MOZILLA),
            webos = ua.match(Exp_USERAGENT.WEBOS),
            dolphi = ua.match(Exp_USERAGENT.DOLFIN),
            silk = ua.match(Exp_USERAGENT.SILK),
            uc = ua.match(Exp_USERAGENT.UC),
            
            //engine
            webkit = ua.match(Exp_USERAGENT.WEBKIT),
            gecko = ua.match(Exp_USERAGENT.GECKO),
            presto = ua.match(Exp_USERAGENT.PRESTO),
            trident = ua.match(Exp_USERAGENT.TRIDENT),
            
            //device
            mac = ua.match(Exp_USERAGENT.MAC),
            windows = ua.match(Exp_USERAGENT.WINNDOWS),
            linux = ua.match(Exp_USERAGENT.LINUX),
            chromeos = ua.match(Exp_USERAGENT.CHROMEOS),
            
            //pad
            ipad = ua.match(Exp_USERAGENT.IPAD),
            rimtablet = ua.match(Exp_USERAGENT.RIMTABLET),
            touchpad = webos && ua.match(Exp_USERAGENT.TOUCHPAD),
            
            //mobile
            ios = ua.match(Exp_USERAGENT.IOS),
            iphone = !ipad && ua.match(Exp_USERAGENT.IPHONE),
            android = ua.match(Exp_USERAGENT.ANDROID),
            windowsphone = ua.match(Exp_USERAGENT.WINDOWSPHONE),
            blackberry = ua.match(Exp_USERAGENT.BLACKBERRY),
            bada = ua.match(Exp_USERAGENT.BADA);
            
            //engine
            if (webkit)
                os.webkit = true;
            if (gecko)
                os.gecko = true;
            if (presto)
                os.presto = true;
            if (trident)
                os.trident = true;
            //device
            if (mac)
                os.mac = true, os.version = os['device-version'] = mac[2];
            if (windows)
                os.windows = true, os.version = os['device-version'] = windows[2];
            if (linux)
                os.linux; //
            if (chromeos)
                os.chromeos = true;
            
            //if (ios) os.ios=true;//
            if (android)
                os.android = true, os.version = os['device-version'] = android[2];
            if (iphone)
                os.ios = true, os.version = os['device-version'] = iphone[2].replace(/_/g, '.'), os.iphone = true;
            if (ipad)
                os.ios = true, os.version = os['device-version'] = ipad[2].replace(/_/g, '.'), os.ipad = true;
            if (webos)
                os.webos = true, os.version = os['device-version'] = webos[2];
            if (blackberry)
                os.blackberry = true, os.version = os['device-version'] = blackberry[2];
            if (bada)
                os.bada = true, os.version = ''; //
            
            if (rimtablet)
                os.rimtablet = true, os.version = ''; //
            if (touchpad)
                os.touchpad = true, os.version = ''; //
            
            if (!(android || iphone || ipad || webos || blackberry || bada || rimtablet || touchpad))
                os.desktop = true, os.version = '';
            //browser
            var match = dolphi || silk || uc || msie || opera || chrome || safari || (ua.indexOf('compatible') < 0 && mozilla);
            os[match[1]] = true;
            os['browser'] = match[1];
            os['version'] = match[2]||'';
            
            //major
            os['version'] && (os['major'] = parseInt(os['version'],10));
            //revise
            //safari
            if (os.ios && os.webkit && !os.desktop) {
				
                os.safari = (window.canSetSearchEngine || window.TrackEvent) ? true : false;//TODO
                var v=os['major']||parseInt(os['device-version'],10)||'';
                v && (os['ios'+v]=true);
            }
            //mozilla/firefox
            if (os.mozilla) {
                os.firefox = true;
            }
            //opera
            if(os.browser === 'opr'){
                os.browser = 'opera';
                os.opera=os.opr;
            }
            
            //chrome
            os.browser = os.browser === 'crios' ? 'chrome' : os.browser;
            
            //uc
            var DOMWindow = DOMWindow || {};
            if (DOMWindow && DOMWindow.UCNewsJSController) {
                os.uc = true,
                os.browser = 'uc';
            }
            
            return os;
        };
        
        //navigator.userAgent.toLowerCase()
        return detect(navigator.userAgent.toLowerCase());
    });
})();