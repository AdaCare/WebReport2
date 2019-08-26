/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copyright 2019 by Neurosoftware, LLC.
//
// adacare.sigPadEditor.v1.1.js       Sandy Gettings
//
// This code is used for capturing a staff's or client's signature on a mobile deice.
//
// There are two parts:
// - sigPadEditor, code that acts as a wrapper for a signature pad jQuery add-on.
// - sigPadMultiEditor, a wrapper that supports two or more sigPadEditors on the same page, plus 
//   some additional functions.
//
// Revisions:
// 2019-04-11 SG: Original code.
// 2019-05-29 SG: Updated SignaturePad to use background color of solid white "rgb(255,255,255)" so JPEG renders with white (not black) background.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.sigPadMultiEditor) { adacare.sigPadMultiEditor = {}; }
else { throw new Error('adacare.sigPadMultiEditor is already defined!'); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the higher-level code specific to teh AdaCare application.

adacare.sigPadMultiEditor = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep a list of InfoItems, one for each sigPadEditor.
    //
    // The surrounding element ID (usually a DIV) must be unique for all signature pads. The ID is used to
    // find the InfoItem in the list.
    //
    // The "onChangeCallback" if called whenever there's a change in the signature. The caller will probably
    // use this opportunity to check if the signature is non-blank and enable/disable buttons and such.

    infoList: [],

    InfoItem: function (canvasID, canvasWrapperID, reasonSelectorID, signatureDataID, padAcceptSigButtID) {

        // Note: It might be better to set the infoItem$canvas *after* calling adacare.sigPadEditor.init().
        // Some signature pad add-ons create their own canvas element on the page. If we switch to one of
        // those, then the canvas element's ID isn't known until after initialization.

        this.name = 'adacare.sigPadMultiEditor'; // Just for visbility when in the debugger
        this.$canvas = $('#' + canvasID);
        this.$canvasWrapper = $('#' + canvasWrapperID);
        this.$reasonSelector = $('#' + reasonSelectorID);
        this.$padAcceptButt = $('#' + padAcceptSigButtID);
        this.$signatureData = $('#' + signatureDataID);
    },

    init: function (surroundID, reasonSelectorID, signatureDataID, canvasID, canvasWrapperID, clearButtID, isSignedIconID, padAcceptSigButtID) {
        'use strict';

        var infoItem;

        infoItem = new this.InfoItem(canvasID, canvasWrapperID, reasonSelectorID, signatureDataID, padAcceptSigButtID);
        this.infoList[surroundID] = infoItem;

        adacare.sigPadEditor.init(surroundID,
            canvasID, clearButtID, isSignedIconID,
            function () { adacare.sigPadMultiEditor.onChangeHandler(surroundID); });

        // Note: Do *not* remove the handlers with .off(), because jQuery Mobile has a handler attached, too.

        infoItem.$padAcceptButt.on('click', function () { adacare.sigPadMultiEditor.acceptButtHandler(surroundID); });
        infoItem.$reasonSelector.on('change', function () { adacare.sigPadMultiEditor.reasonSelectorHandler(surroundID); });

        this.enableButtons(surroundID, infoItem.$padAcceptButt);
    },

    // Enable or disable buttons, depending whether a signature has been scribbled.

    enableButtons: function (surroundID) {
        'use strict';

        var CSS_DISABLED = 'ui-state-disabled';

        var infoItem = adacare.sigPadMultiEditor.infoList[surroundID];
        var $acceptSigButton = infoItem.$padAcceptButt;
        var isOkToSkip;

        if ($acceptSigButton) {

            isOkToSkip = adacare.sigPadMultiEditor.reasonSelectorIsOkToSkipSignature(surroundID);

            if (isOkToSkip || !adacare.sigPadEditor.isBlankOrTrivial(surroundID)) {

                //$acceptSigButton.prop('disabled', false).removeClass(CSS_DISABLED);
                $acceptSigButton.removeClass(CSS_DISABLED);
                //adacare.sigPadEditor.start(surroundID);
            }
            else {

                //$acceptSigButton.prop('disabled', true).addClass(CSS_DISABLED);
                $acceptSigButton.addClass(CSS_DISABLED);
                //adacare.sigPadEditor.stop(surroundID);
            }

            // $acceptSigButton.button(); // NOPENOPENOPE Tell JQM to enhance the button, since we've made changes.
        }
    },

    // When the user adds a stroke or clears the signature pad, enable/disable
    // the buttons and copy the graphic data to the hidden element for the server-side code.

    onChangeHandler: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadMultiEditor.infoList[surroundID];
        var sigDataUri;

        adacare.sigPadMultiEditor.enableButtons(surroundID/*, infoItem.$padAcceptButt*/);

        if (!adacare.sigPadEditor.isBlankOrTrivial(surroundID)) {

            sigDataUri = adacare.sigPadEditor.getSigData(surroundID);
            infoItem.$signatureData.val(sigDataUri);

            // TESTING HACK
            $('#' + adacare.sigPadBoth.DATA_DISPLAY_ELEM_STAFF_ID).val('Data Len = ' + sigDataUri.length + ': ' + sigDataUri); // TESTING ONLY
        }
        else {

            infoItem.$signatureData.val('');
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // When the user changes the "reason" selector, we show or hide the canvas.
    // - Show the canvas if the reason is "use the signature above."
    // - Hide the canvas if the reason is one that skip the signature.

    reasonSelectorHandler: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadMultiEditor.infoList[surroundID];
        var $canvas = infoItem.$canvas;
        var $canvasWrapper = infoItem.$canvasWrapper;
        var isOkToSkip;
        var CSS_DISABLE_CANVAS = 'sigPadEditorCanvasWrapperDisabled';

        isOkToSkip = adacare.sigPadMultiEditor.reasonSelectorIsOkToSkipSignature(surroundID);

        if (isOkToSkip) {

            $canvas.hide();
            $canvasWrapper.addClass(CSS_DISABLE_CANVAS);
        }
        else {

            $canvas.show();
            $canvasWrapper.removeClass(CSS_DISABLE_CANVAS);
        }

        adacare.sigPadEditor.clear(surroundID);
        adacare.sigPadMultiEditor.enableButtons(surroundID);
    },

    reasonSelectorIsOkToSkipSignature: function (surroundID) {
        'use strict';

        var REASON_INDEX_WAIT_ON_SIGNATURE = 0; // We wait for the actual signature, unless the user has selected a reason why we don't

        var infoItem = adacare.sigPadMultiEditor.infoList[surroundID];
        var $reasonSelector = infoItem.$reasonSelector;
        var reasonSelectedIndex;
        var isOkToSkip;

        reasonSelectedIndex = ($reasonSelector ? $reasonSelector.prop('selectedIndex') : -1);

        isOkToSkip = (reasonSelectedIndex !== REASON_INDEX_WAIT_ON_SIGNATURE);

        return isOkToSkip;
    },

    acceptButtHandler: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadMultiEditor.infoList[surroundID];
        var sigDataPng;
        //var sigDataJpg, sigDataSvg;

        // Should we stop the signature pad listening once the user has moved to the next step?

        //adacare.sigPadEditor.stop(surroundID);

        //sigDataPng = String(adacare.sigPadEditor.signaturePad.toDataURL("image/png"));
        //sigDataJpg = String(adacare.sigPadEditor.signaturePad.toDataURL("image/jpeg"));
        //sigDataSvg = String(adacare.sigPadEditor.signaturePad.toDataURL("image/svg+xml"));
        sigDataPng = adacare.sigPadEditor.getSigData(surroundID);

        $('#' + adacare.sigPadBoth.DATA_DISPLAY_ELEM_STAFF_ID).val('Data Len = ' + sigDataPng.length + ': ' + sigDataPng);

        //adacare.sigPadEditor.$sigDataPngHidden.val(sigDataPng);
        //adacare.sigPadEditor.$sigDataJpgHidden.val(sigDataJpg);
        //adacare.sigPadEditor.$sigDataSvgHidden.val(sigDataSvg);

        // I don't think this is needed here, b/c the onChangeHandler already does it.
        //infoItem.$signatureData.val(sigDataPng);

        // Display the images.

        //$('#' + adacare.sigPadEditor.IMAGE_ELEM_PNG_ID).attr('src', sigDataPng);
        //$('#' + adacare.sigPadEditor.IMAGE_ELEM_JPG_ID).attr('src', sigDataJpg);
        //$('#' + adacare.sigPadEditor.IMAGE_ELEM_SVG_ID).attr('src', sigDataSvg);
        $('#' + adacare.sigPadBoth.IMAGE_ELEM_PNG_ID).attr('src', sigDataPng);

        //return false;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the low-level wrapper for a signature pad jQuery UI add-on. If we change to a different
// add-on, only this code should need to be rewritten.

if (!adacare.sigPadEditor) { adacare.sigPadEditor = {}; }
else { throw new Error('adacare.sigPadEditor is already defined!'); }

adacare.sigPadEditor = {

    IS_SIGNED_ICON_CSS: 'sigPadEditorIsSignedIcon',
    IS_SIGNED_ICON_TEXT: '&#10004;',
    NOT_SIGNED_ICON_CSS: 'sigPadEditorIsBlankIcon',
    NOT_SIGNED_ICON_TEXT: '&nbsp;',

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Keep a list of InfoItems, one for each signature pad.
    //
    // The surrounding element ID (usually a DIV) must be unique for all signature pads. The ID is used to
    // find the InfoItem in the list.
    //
    // The "onChangeCallback" if called whenever there's a change in the signature. The caller will probably
    // use this opportunity to check if the signature is non-blank and enable/disable buttons and such.

    infoList: [],

    InfoItem: function (surroundID, clearButtID, isSignedIconID, onChangeCallback) {

        this.name = 'adacare.sigPadEditor';
        this.surroundID = surroundID;
        this.$surround = $('#' + surroundID);
        this.$clearButt = $('#' + clearButtID);
        this.$isSignedIcon = (isSignedIconID ? $('#' + isSignedIconID) : null); // Optional
        this.onChangeCallback = onChangeCallback;

        // These must be initialized later by the caller.

        this.$canvas = null;        // The <canvas> element. Some signature add-ons create their own, some are provided by us.
        this.signaturePad = null;   // This is the object for the jQuery UI extension
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////

    init: function (surroundID, canvasID, clearButtID, isSignedIconID, onChangeCallback) {
        'use strict';

        var infoItem;

        infoItem = new this.InfoItem(surroundID, clearButtID, isSignedIconID, onChangeCallback);
        infoItem.$canvas = $('#' + canvasID);
        infoItem.$clearButt = $('#' + clearButtID);
        this.infoList[surroundID] = infoItem;

        this.initSigPad(infoItem.surroundID);
        this.clear(infoItem.surroundID);

        // Set up buttons. Must init the signature pad first!

        infoItem.$clearButt.off().on('click', function () { adacare.sigPadEditor.clearButtHandler(surroundID); });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Initialize the signature pad.
    //
    // This version uses szimek's signature_pad, https://github.com/szimek/signature_pad.
    //
    // We have to append a <canvas> element within the surrounding div (or include it in the orignal page
    // HTML) and initialize it.

    initSigPad: function (surroundID) {
        'use strict';

        var infoItem = this.infoList[surroundID];

        infoItem.signaturePad = new SignaturePad(
            infoItem.$canvas[0],
            {
                backgroundColor: 'rgb(255, 255, 255)', /*'rgba(0,0,0,0)'*/ /*'White',*/ // Use opaque white "rgb(255,255,255)" background for best JPG. If you prefer, PNG supports transparency.
                penColor: 'Blue',
                onEnd: function () {
                    adacare.sigPadEditor.strokeEndHandler(surroundID);
                }
            });

        // Handle page resizing and set the correct pixel ratio for this display.

        window.addEventListener("resize", function () { adacare.sigPadEditor.resizeCanvas(surroundID); });
        adacare.sigPadEditor.resizeCanvas(surroundID);

        //adacare.sigPadEditor.stop(surroundID);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Resize the canvas to adjust for the pixel density on different screens, or after a window resizing.

    resizeCanvas: function (surroundID) {
        'use strict';

        var canvas;
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        canvas = infoItem.$canvas[0];
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);

        // Browsers will clear the signature pad when resized. This can be annoying, such as when the user
        // accidentally rotates the mobile device and causes a resize event. The solution is to get the 
        // drawing data from the cancas and redraw the image.

        var canvasData;

        canvasData = infoItem.signaturePad.toData();
        infoItem.signaturePad.fromData(canvasData);

        //adacare.sigPadEditor.clear(surroundID); // otherwise isEmpty() might return incorrect value
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // At the end of each stroke, update the "is signed" icon and hit the callback method, if any.

    strokeEndHandler: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        adacare.sigPadEditor.displayIsSignedIcon(surroundID);

        if (infoItem.onChangeCallback) {

            infoItem.onChangeCallback();
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update the "is signed" icon.

    displayIsSignedIcon: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        if (infoItem.$isSignedIcon) {

            if (!adacare.sigPadEditor.isBlankOrTrivial(surroundID)) {

                infoItem.$isSignedIcon.removeClass(adacare.sigPadEditor.NOT_SIGNED_ICON_CSS).addClass(adacare.sigPadEditor.IS_SIGNED_ICON_CSS);
                infoItem.$isSignedIcon.html(adacare.sigPadEditor.IS_SIGNED_ICON_TEXT);
            }
            else {

                infoItem.$isSignedIcon.removeClass(adacare.sigPadEditor.IS_SIGNED_ICON_CSS).addClass(adacare.sigPadEditor.NOT_SIGNED_ICON_CSS);
                infoItem.$isSignedIcon.html(adacare.sigPadEditor.NOT_SIGNED_ICON_TEXT);
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Button handlers.

    clearButtHandler: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        adacare.sigPadEditor.clear(surroundID);
        adacare.sigPadEditor.displayIsSignedIcon(surroundID);

        if (infoItem.onChangeCallback) {

            infoItem.onChangeCallback();
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Clear and enable the signature pad so it begins listening for strokes.

    start: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        adacare.sigPadEditor.clear(surroundID);
        infoItem.signaturePad.on();
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Disable the signature pad, so it stops listening for strokes.

    stop: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        // SG DOES THIS WORK???????????
        //infoItem.signaturePad.off();
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Clear the scribbles from the signature pad.

    clear: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];

        infoItem.signaturePad.clear();
        adacare.sigPadEditor.displayIsSignedIcon(surroundID);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Return the graphic data for the signature. The data may be in different formats, depending on what
    // is supported by the signature pad add-on.

    getSigData: function (surroundID) {
        'use strict';

        var infoItem = adacare.sigPadEditor.infoList[surroundID];
        var sigDataPng;

        //sigDataPng = String(infoItem.signaturePad.toDataURL("image/png"));
        sigDataPng = String(infoItem.signaturePad.toDataURL("image/svg+xml"));

        return sigDataPng;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Return true/false if the scribbles meet minimum requirements. We need something more
    // than just a dot or two.

    isBlankOrTrivial: function (surroundID) {
        'use strict';

        var MIN_STROKES = 3;
        var MIN_POINTS = 20;

        var infoItem = adacare.sigPadEditor.infoList[surroundID];
        var dataStroke, strokes, points;
        var trivial;
        var i, j;

        strokes = 0;
        points = 0;

        for (i = 0; i < infoItem.signaturePad._data.length; i++) {

            strokes++;
            dataStroke = infoItem.signaturePad._data[i];
            points += dataStroke.length;
        }

        trivial = strokes < MIN_STROKES && points < MIN_POINTS;

        return trivial;
    }
};
