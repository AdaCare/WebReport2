/*
 * v1.7 Hacked by Sandy Gettings 4/3/2013
 * v1.7.1 Hacked by Sandy Gettings 7/17/2013 to add more masks
 *
 * With jQuery 1.10, the $.browser object was removed. This plugin uses
 * $.browser, so I developed a simple substitute.
 *
 * Since there hasn't been any development on this plugin in a few years,
 * it would be a good idea to swith to some other well-supported tool instead.
*/

/*
 * This plugin filters keyboard input by specified regular expression.
 * Version 1.7
 * $Id: jquery.keyfilter.js,v 1.14 2009/05/19 11:46:10 aabdulin Exp $
 *
 * Source code inspired by Ext.JS (Ext.form.TextField, Ext.EventManager)
 *
 * Procedural style:
 * $('#ggg').keyfilter(/[\dA-F]/);
 * Also you can pass test function instead of regexp. Its arguments:
   * this - HTML DOM Element (event target).
   * c - String that contains incoming character.
 * $('#ggg').keyfilter(function(c) { return c != 'a'; });
 *
 * Class style:
 * <input type="text" class="mask-num" />
 *
 * Available classes:
   * mask-pint:     /[\d]/
   * mask-int:      /[\d\-]/
   * mask-pnum:     /[\d\.]/
   * mask-money     /[\d\.\s,]/
   * mask-num:      /[\d\-\.]/
   * mask-hex:      /[0-9a-f]/i
   * mask-email:    /[a-z0-9_\.\-@]/i
   * mask-alpha:    /[a-z_]/i
   * mask-alphanum: /[a-z0-9_]/i
   * mask-phone_au: /[\d\s]/
   * mask-phone_gi: /[\d\s]/
   * mask-phone_us: /[\d\s\-]/
   * mask-phone_uk: /[\d\s]/
 */

(function ($) {
    var defaultMasks = {
        pint: /[\d]/,
        'int': /[\d\-]/,
        pnum: /[\d\.]/,
        money: /[\d\.\s,]/,
        num: /[\d\-\.]/,
        hex: /[0-9a-f]/i,
        email: /[a-z0-9_\.\-@]/i,
        alpha: /[a-z_]/i,
        alphanum: /[a-z0-9_]/i,
        phone_au: /[\d\s]/,         // Added by SG 7/17/2013: Australia phone numbers are digits and spaces
        phone_gi: /[\d\s]/,         // Added by SG 7/17/2013: Gibraltar phone numbers are only digits, but we support Spain as well
        phone_us: /[\d\s\-]/,       // Added by SG 7/17/2013: US phone numbers are digits and spaces
        phone_uk: /[\d\s]/          // Added by SG 7/17/2013: UK phone numbers are digits and spaces
};

    var Keys = {
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        BACKSPACE: 8,
        DELETE: 46
    };

    // safari keypress events for special keys return bad keycodes
    var SafariKeys = {
        63234: 37, // left
        63235: 39, // right
        63232: 38, // up
        63233: 40, // down
        63276: 33, // page up
        63277: 34, // page down
        63272: 46, // delete
        63273: 36, // home
        63275: 35  // end
    };

    // SG: Functions to determine which browser is being used

    var browserIsChrome = function () {
        return (navigator.userAgent.search("Chrome") >= 0);
    }

    var browserIsMozilla = function () {
        return (navigator.userAgent.search("Firefox") >= 0);
    }

    var browserIsOpera = function () {
        return (navigator.userAgent.search("Opera") >= 0);
    }

    var browserIsSafari = function () {
        return (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0);
    }

    var isNavKeyPress = function (e) {
        var k = e.keyCode;
        // SG fix:
        //k = $.browser.safari ? (SafariKeys[k] || k) : k;
        k = browserIsSafari() ? (SafariKeys[k] || k) : k;
        return (k >= 33 && k <= 40) || k == Keys.RETURN || k == Keys.TAB || k == Keys.ESC;
    };

    var isSpecialKey = function (e) {
        var k = e.keyCode;
        var c = e.charCode;

        // SG fix:
        //return k == 9 || k == 13 || (k == 40 && (!$.browser.opera || !e.shiftKey)) || k == 27 ||
        return k == 9 || k == 13 || (k == 40 && (!browserIsOpera() || !e.shiftKey)) || k == 27 ||
			k == 16 || k == 17 ||
			(k >= 18 && k <= 20) ||
			//($.browser.opera && !e.shiftKey && (k == 8 || (k >= 33 && k <= 35) || (k >= 36 && k <= 39) || (k >= 44 && k <= 45)))
			(browserIsOpera() && !e.shiftKey && (k == 8 || (k >= 33 && k <= 35) || (k >= 36 && k <= 39) || (k >= 44 && k <= 45)))
        ;

    };

    /**
     * Returns a normalized keyCode for the event.
     * @return {Number} The key code
     */
    var getKey = function (e) {
        var k = e.keyCode || e.charCode;

        // SG fix:
        //return $.browser.safari ? (SafariKeys[k] || k) : k;
        return browserIsSafari() ? (SafariKeys[k] || k) : k;
    };

    var getCharCode = function (e) {
        return e.charCode || e.keyCode || e.which;
    };

    $.fn.keyfilter = function (re) {
        return this.keypress(function (e) {
            if (e.ctrlKey || e.altKey) {
                return;
            }
            var k = getKey(e);

            // SG fix:
            //if ($.browser.mozilla && (isNavKeyPress(e) || k == Keys.BACKSPACE || (k == Keys.DELETE && e.charCode == 0))) {
            if (browserIsMozilla() && (isNavKeyPress(e) || k == Keys.BACKSPACE || (k == Keys.DELETE && e.charCode == 0))) {
                return;
            }
            var c = getCharCode(e), cc = String.fromCharCode(c), ok = true;

            // SG fix:
            //if (!$.browser.mozilla && (isSpecialKey(e) || !cc)) {
            if (!browserIsMozilla() && (isSpecialKey(e) || !cc)) {
                return;
            }
            if ($.isFunction(re)) {
                ok = re.call(this, cc);
            }
            else {
                ok = re.test(cc);
            }
            if (!ok) {
                e.preventDefault();
            }
        });
    };

    // SG fix:
    // We've refactored the code below so that it can be executed by the master page's OnPreRender
    // event handler. This is needed because keyfilter attaches events to filtered fields, and this
    // is lost when fields inside an UpdatePanel are refreshed.
    //
    // Question: Since this function may be invoked several times on the same page, are the event
    // listeners piling up? That is, after several postbacks n the same page, are we filtering fields
    // several times upon each keypress? This would affect only filtered field ouside of the UpdatePanel.
    // Need to devise a test.

    $.fn.keyfilter.init = function () {
        var $tags = $('input[class*=mask],textarea[class*=mask]');
        for (var key in $.fn.keyfilter.defaults.masks) {
            $tags.filter('.mask-' + key).keyfilter($.fn.keyfilter.defaults.masks[key]);
        }
    };

    /*** futile attempt to use livequery() to avoid re-init on each postback.

    $.fn.keyfilter.init = function () {
        var $tags = $('input[class*=mask],textarea[class*=mask]');
        var $tagsFiltered;

        for (var key in $.fn.keyfilter.defaults.masks) {
            $tagsFiltered = $tags.filter('.mask-' + key);
            $tagsFiltered.livequery(function () {
                var junk1 = $(this);
                alert('hit!');
                $(this).keyfilter($.fn.keyfilter.defaults.masks[key]);
            });
        }
    };
    ***/

    $.extend($.fn.keyfilter, {
        defaults: {
            masks: defaultMasks
        },
        version: 1.7
    });

    $(document).ready(function () {
        $.fn.keyfilter.init();
        //var tags = $('input[class*=mask],textarea[class*=mask]');
        //for (var key in $.fn.keyfilter.defaults.masks) {
        //    tags.filter('.mask-' + key).keyfilter($.fn.keyfilter.defaults.masks[key]);
        //}
    });

})(jQuery);
