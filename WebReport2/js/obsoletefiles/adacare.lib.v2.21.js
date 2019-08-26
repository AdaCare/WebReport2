// Copyright 2009, 2010, 2011, 2012, 2013 by Neurosoftware, LLC.
//
// adacare.lib.v2.21                Sandy Gettings              Revised 11/10/2013
//
// This is a library that provides a set of common of JavaScript functions.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.lib) { adacare.lib = {}; }
else { throw new Error('adacare.lib is already defined!'); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Global constants.

adacare.lib.COUNTRY_ABBR_AU = 'AU';                     // Austrailia
adacare.lib.COUNTRY_ABBR_CA = 'CANADA';                 // Canada
adacare.lib.COUNTRY_ABBR_GB = 'GB';                     // United Kingdom
adacare.lib.COUNTRY_ABBR_GI = 'GI';                     // Gibraltar
adacare.lib.COUNTRY_ABBR_MT = 'MT';                     // Malta
adacare.lib.COUNTRY_ABBR_US = 'USA';                    // United States
adacare.lib.countryAbbr = adacare.lib.COUNTRY_ABBR_US;  // Default

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Universal initialization stuff, automatically executed when the page is loaded.

jQuery(function () {

    // Init the style of controls on the page.

    //jQuery(':button:enabled,:submit:enabled,:reset:enabled').livequery(function (e) { adacare.lib.styleButtons($(this), true); });
    //jQuery(':button:disabled,:submit:disabled,:reset:disabled').livequery(function (e) { adacare.lib.styleButtons($(this), false); });

    debugger;
    adacare.lib.stylePage();

    // Reinit after partial-page update (in UpdatePanels). Otherwise, controls inside of an UpdatePanel
    // lose their CSS and events whenever there is a partial-page postback.

    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(

    function (sender, args) {
        adacare.lib.stylePage();
    }
    );
});

adacare.lib.stylePage = function () {

    jQuery(':button:enabled,:submit:enabled,:reset:enabled').each(function () { adacare.lib.styleButtons($(this), true); });
    jQuery(':button:disabled,:submit:disabled,:reset:disabled').each(function () { adacare.lib.styleButtons($(this), false); });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize and set global values based on paramters from the server.

adacare.lib.init = function (countryAbbr) {

    adacare.lib.countryAbbr = countryAbbr;

    // DEBUG

    var $fld = $('#DebugClientCountryLabel');
    if ($fld.length > 0) {
        $fld.text(adacare.lib.countryAbbr);
    }
    // END DEBUG
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Style all buttons

adacare.lib.styleButtons = function ($elem, enabled) {

    // Set the button style, including hovering.

    if (enabled) {
        //$elem.addClass('ui-state-default').addClass('ui-widget').addClass('general_button');
        $elem.removeClass('ui-state-disabled').addClass('ui-state-default').addClass('ui-widget').addClass('ui-corner-all');
    }

        // Make disabled buttons look different.

    else {
        //$elem.addClass('ui-state-disabled'); // Makes appearance very faint, especially in Safari
        //$elem.addClass('ui-widget');
        $elem.addClass('ui-state-disabled').addClass('ui-state-default').addClass('ui-widget').addClass('ui-corner-all');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Prevent double-click of the Submit button. Use this to prevent the "ok" button (or whatever) code
// from executing twice. Use this method for non-modal dialogs, like the login page. For modal pop-up
// dialogs, there is a better method to use than this one.

adacare.lib.preventDoubleSubmit = function (submitButtonID) {

    var $submitButton;

    $submitButton = $('#' + submitButtonID);

    // Capture click events on the Submit button, and prevent double-clicks

    $submitButton.click(function (eventObject) {

        var isValid = true;

        if (eventObject !== undefined && eventObject !== null) {
            if (this.alreadyClicked) {
                isValid = false;
            }
            else {
                isValid = true;
                this.alreadyClicked = true;
            }
        }
        return isValid;
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open a generic confirmation dialog. Clicking Ok causes a click to be sent to the given "action"
// button.
//
// This is the usual 2-button (Ok or Cancel) dialog. The "Ok" can be replaced by text of the caller's
// choice.
//
// BUG COMPLAINT BELOW IS OBSOLETE:
// BUG: If jquery dialog's modal is true and this is a modal on top of a modal (see Offices.aspx, 
// and deactivate an office) then the "yes" button's click won't cause a postback event on the server
// side. If modal is false, everything works. Unfortunately, we really need the second dialog to be
// modal. It all used to work under VS 2008/ASP.Net 3.5. Grrrr.
//
// To prevent the "bug": In the code-behind Page_Load event (on the first load, !IsPostBack), you need 
// to add an ASP PostBackEventReference to the Ok button's JavaScript that's executed when it is 
// clicked. It's easier to demonstrate than explain:
//
// OkButt.OnClientClick = Page.ClientScript.GetPostBackEventReference(OkButt, string.Empty);
//
// Then, when a click event is sent to the button from JavaScript "$('#' + okButtID).click()", it
// will cause the page to post back and fire the button's click-event handler in the C# code.

adacare.lib.confirmBeforeButtonDialog = function (action, okButtID, dialogID, messageID, messageText, okButtonText) {

    var $dialog;
    var buttonList = {};
    var isModal = false;

    switch (action) {

        case 'open':
            isModal = true;
            break;

        case 'opennomodal':
            isModal = false;
            break;

            // Any other option is a programming error.                                                                                                                                                                                                                                                                           

        default:
            throw new Error('adacare.lib.confirmGenericDialog: bad action from caller (' + action + ')');
            //break;
    }

    // We put the button definitions in a list so we can define the Ok button label as a variable. 
    // Otherwise, the button label variable name "okButtonText", not its value, appears on the dialog. 

    if (okButtonText === undefined || okButtonText === null || okButtonText === '') {
        okButtonText = 'Ok';
    }
    //buttonList['Cancel'] = function () { $(this).dialog('destroy'); return false; };
    buttonList['Cancel'] = function () { $(this).dialog('close'); return false; }; // Changed 4/30/13
    buttonList[okButtonText] = function () { $('#' + okButtID).click(); $(this).dialog('destroy'); };

    $('#' + messageID).html(messageText);
    $dialog = $('#' + dialogID).dialog({
        autoOpen: true,
        title: 'Are You Sure?',
        width: 500,
        close: function () { $(this).dialog('destroy'); return false; },
        modal: isModal,
        resizable: false,
        appendTo: 'form:first',
        buttons: buttonList
    });

};

// This is a 2-button version. The first button's text is defined by the caller. By default, the 
// button is "Ok." The last button defaults to "Cancel."

adacare.lib.confirmDialog2Button = function (titleText, dialogID, button1Function, button2Function, button1Text, button2Text, messageID, messageText) {

    // We put the button definitions in a list so we can define the Ok button label as a variable.
    // Otherwise, the button label variable name "button1Text", not its value, appears on the dialog.

    var buttonList = {};

    if (button1Text === undefined || button1Text === null || button1Text === '') {
        button1Text = 'Ok';
    }
    if (button2Text === undefined || button2Text === null || button2Text === '') {
        button2Text = 'Cancel';
    }
    buttonList[button1Text] = function () { button1Function(); $(this).dialog('destroy'); };

    // Button #2 is normally the "cancel" button. Sometimes the caller needs to execute a function
    // when clicked, and sometimes not. We need to adjust the code that's executed in either case
    // to ensure that the dialog is closed. And if there's no special code needed, return "false."

    buttonList[button1Text] = function () { button1Function(); $(this).dialog('destroy'); };

    if (button2Function !== null) {
        buttonList[button2Text] = function () { button2Function(); $(this).dialog('destroy'); };
    }
    else {
        buttonList[button2Text] = function () { $(this).dialog('destroy'); return false; };
    }

    $('#' + messageID).html(messageText);
    $('#' + dialogID).dialog({
        title: titleText,
        buttons: buttonList,
        close: function () { $(this).dialog('destroy'); return false; },
        modal: true,
        resizable: false,
        width: 500
    });
};

// This is a 3-button version. The first two buttons' text is defined by the caller. By default, the two
// buttons are "Yes" and "No." The last button is always "Cancel."

adacare.lib.confirmDialog3Button = function (titleText, dialogID, button1Function, button2Function, button3Function, button1Text, button2Text, button3Text, messageID, messageText) {

    // We put the button definitions in a list so we can define the Ok button label as a variable.
    // Otherwise, the button label variable name "button1Text", not its value, appears on the dialog.

    var buttonList = {};

    if (button1Text === undefined || button1Text === null || button1Text === '') {
        button1Text = 'Yes';
    }
    if (button2Text === undefined || button2Text === null || button2Text === '') {
        button2Text = 'No';
    }
    if (button3Text === undefined || button3Text === null || button3Text === '') {
        button3Text = 'Cancel';
    }

    // Button #3 is normally the "cancel" button. Sometimes the caller needs to execute a function
    // when clicked, and sometimes not. We need to adjust the code that's executed in either case
    // to ensure that the dialog is closed. And if there's no special code needed, return "false."

    buttonList[button1Text] = function () { button1Function(); $(this).dialog('destroy'); };
    buttonList[button2Text] = function () { button2Function(); $(this).dialog('destroy'); };

    if (button3Function !== null) {
        buttonList[button3Text] = function () { button3Function(); $(this).dialog('destroy'); };
    }
    else {
        buttonList[button3Text] = function () { $(this).dialog('destroy'); return false; };
    }

    $('#' + messageID).html(messageText);
    $('#' + dialogID).dialog({
        title: titleText,
        buttons: buttonList,
        close: function () { $(this).dialog('destroy'); return false; },
        modal: true,
        resizable: false,
        width: 500
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the delete confirmation dialog.
// TODO: Change this method to use the generic method.

adacare.lib.confirmDeleteDialog = function (action, dialogID, deleteButtonID, messageID, messageText) {

    switch (action) {

        case 'open':
            $('#' + messageID).html(messageText);
            $('#' + dialogID).dialog({
                title: 'Are You Sure?',
                buttons: {
                    'Cancel': function () { $(this).dialog('destroy'); return false; },
                    'Delete': function () { $('#' + deleteButtonID).click(); $(this).dialog('destroy'); }
                },
                close: function () { $(this).dialog('destroy'); return false; },
                modal: true,
                resizable: false
            });
            break;

            // Any other option is a programming error.                                                                                                                                                                                                                                                           

        default:
            throw new Error('adacare.lib.confirmDeleteDialog: bad action from caller (' + action + ')');
            //break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the info dialog, with just an "Ok" button.
// TODO: Change this method to use the generic method.
// *** OBSOLETE ***

adacare.lib.infoDialog = function (action, dialogID, messageID, messageText) {

    switch (action) {

        case 'open':

            // Display the message (or not)

            if (messageID !== undefined && messageID !== null && messageID !== '' &&
                messageText !== undefined && messageText !== null && messageText !== '') {
                $('#' + messageID).html(messageText);
            }

            $('#' + dialogID).dialog({
                title: 'Information',
                buttons: {
                    'Ok': function () { $(this).dialog('destroy'); return false; }
                },
                close: function () { $(this).dialog('destroy'); return false; },
                modal: true,
                resizable: false
            });
            break;

            // Any other option is a programming error.                                                                                                                                                                                                                                                            

        default:
            throw new Error('adacare.lib.confirmDeleteDialog: bad action from caller (' + action + ')');
            //break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the alert dialog, with just an "Ok" button.
// TODO: Change this method to use the generic method.

adacare.lib.alertDialog = function (titleText, dialogID, messageID, messageText) {

    // Display the message (or not)

    if (messageID !== undefined && messageID !== null && messageID !== '' &&
                messageText !== undefined && messageText !== null && messageText !== '') {
        $('#' + messageID).html(messageText);
    }

    $('#' + dialogID).dialog({
        title: titleText,
        buttons: {
            'Ok': function () { $(this).dialog('destroy'); return false; }
        },
        close: function () { $(this).dialog('destroy'); return false; },
        modal: true,
        resizable: false
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open a modal dialog with all content provided by the caller. Only one button is provided, and all
// exits go through the button. That is, if the user clicks the "X" or types the escape key, we still
// click the Ok button.
//
// This is used for cases where the caller needs to show a message to the user and *know* when the
// user is finished. Silent closing is avoided.

adacare.lib.modalOneExitDialog = function (dialogID, titleText, widthPx, submitButtonID) {

    var $dialogDiv, $submitButton;

    $dialogDiv = $('#' + dialogID);
    $submitButton = $('#' + submitButtonID);
    $submitButton.click(function () { $dialogDiv.dialog('destroy'); return false; });

    // Tricksy: When the user tries to close this dialog, we want to fake a click on the submit button.
    // We prevent the immediate close, and leave that job to the submit button. Otherwise, we end up
    // closing a dialog that's already closed, and JavaScript upchucks a hairball.

    $dialogDiv.dialog({
        title: titleText,
        beforeClose:
            function () { $submitButton.click(); return false; }, // Fake a button click and prevent the close
        modal: true,
        resizable: false
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display a DIV as a tabbed control. Must follow the rules for jQuery tabs()

adacare.lib.tabControl = function (divID) {

    //$('#' + divID).tabs({ fx: { opacity: 'toggle', duration: 'fast' } });
    $('#' + divID).tabs();

};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the modal edit dialog, and attach valiation code to the Submit button. When the Submit is
// clicked, we check to make sure the dialog passes validation. If not, then we return False and
// the submit event is discarded. If so, we prevent a double-click by discarding a redundant submit
// event.
//
// CAUTION: Do not use this function for a SmartButton. It already has the same code for preventing
// double submits. Thus, each submit will be checked twice, and the second will look like a duplicate
// and be ignored.
//
// Two words about nested modal dialogs: You may have situations where you open a modal dialog and,
// within that dialog, you open a second modal dialog. An example might be opening a modal dialog
// to edit an eployee record, and when the user changes the employee's status to "termindated,"
// opening a second modal dialog to confirm the change.
//
// In these situations, the top-level dialog may lose the event handlers for its buttons. Clicking
// on the dead buttons has no effect, and the parent dialog cannot be saved or canceled. The solution
// probably depends on the design of the web page, but in cases that have been tested, wrapping an
// UpdatePanel around the button that causes the child dialog to open solves the problem. You must
// also execute an Update() on this UpdatePanel along with the code that closes the child dialog.

/***
adacare.lib.modalEditAndValidateDialogOBSOLETE = function (action, dialogID, titleStr, widthPx, submitButtonID, cancelButtonID) {

    var $submitButton;

    // Pop up the modal dialog

    adacare.lib.modalEditDialog(action, dialogID, titleStr, widthPx, cancelButtonID);

    $submitButton = $('#' + submitButtonID);

    // Capture clicks on the Submit button, validate, and prevent double-clicks

    $submitButton.click(function (eventObject) {
        var isValid;

        isValid = adacare.validateSubmitClick();

        if (isValid) {
            if (eventObject !== undefined && eventObject !== null) {
                if (this.alreadyClicked) {
                    isValid = false;
                }
                else {
                    this.alreadyClicked = true;
                }
            }
        }
        return isValid;
    });
};
***/

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Similar to above, but for dialogs that don't require validation.

adacare.lib.modalEditDialog = function (action, dialogID, titleText, widthPx, cancelButtonID) {

    var $myDialog;

    switch (action) {

        // Note the use of the "open" option in the dialog. We use this technique to set the                                                                                                                                                                                    
        // z-index of the datepicker so that it appears on top of the dialog. This is only                                                                                                                                                                                    
        // needed because the dialog takes unusual steps to place itself above all other                                                                                                                                                                                    
        // elements (that's its whole purpose, after all).                                                                                                                                                              

        case 'open':
            $myDialog = $('#' + dialogID).dialog({
                autoOpen: true,
                title: titleText,
                width: widthPx,
                //zIndex: 500,                        // Helps solve problem with ValidatorCalloutExtender, at z=1000
                close: function () { $(this).dialog('destroy'); return false; },
                modal: true,
                resizable: false,
                appendTo: 'form:first', // TEST
                open: function () {
                    $('#ui-datepicker-div').css('z-index', $('#' + dialogID).parent().css('z-index') + 1);

                    // Fix for jQuery bug #4671. Webkit browsers disable scrolling on dialogs longer than the page.
                    // Remove this code if & when the bug is fixed.

                    // Removed 4/2/2013 SG
                    //if ($.browser.webkit) {
                    //    window.setTimeout(function () { $(document).unbind('mousedown.dialog-overlay').unbind('mouseup.dialog-overlay'); }, 100);
                    //}
                }
            });

            // If we were given the cancel button's ID, use it to close the dialog from JavaScript. Otherwise, it
            // has to be closed from the server. This way, we save a round trip to the server for an otherwise
            // trivial operation.
            //
            // Programmer's note: Attaching a handler to the "click" event is problematic. If the Cancel button is
            // withing the same UpdatePanel as any other control that causes a postback (for example, a control
            // that uses server-side validation), all elements within the UpdatePanel are refreshed and any event
            // handlers are lost.
            //
            // Solution: Wrap another UpdatePanel around the control that causes the postback. That way, only that
            // small portion of the page will be refreshed.
            //
            // Another idea, not yet tested: Have the server-side code that calls this function to open the dialog
            // insert code (similar to the below) into the OnClientClick property.

            if (cancelButtonID !== undefined) {
                $('#' + cancelButtonID).click(function () { adacare.lib.modalEditDialog('close', dialogID); });

                // The original code is below. As of jQuery UI 1.9, this casues an error when the Cancel
                // button has been used more than once. Livequery causes the same handler to be queued again
                // each time, so the second time the dialog is already closed. In earlier versions of jQuery,
                // such errors were silently ignored.

                //$('#' + cancelButtonID).livequery('click', function (e) { adacare.lib.modalEditDialog('close', dialogID); });
            }

            // Fixes jQuery.dialog() bug to make Submit work. Note that we keep the jQuery object for the
            // dialog in a variable. This prevents another problem, where the appendTo tries to append the
            // dialog into an improper part of the DOM and may throw an HIERARCHY_REQUEST_ERR error when
            // we use nested dialogs.

            //$myDialog.parent().appendTo(jQuery('form:first')); (fixed in jQuery UI 1.10)
            break;

        case 'close':
            //$('#' + dialogID).dialog('destroy');
            $('#' + dialogID).dialog('close'); // Changed 4/30/13
            break;

            // Any other option is a programming error.                                                                                                                                                                                                                                                                      

        default:
            throw new Error('adacare.lib.modalEditDialog: bad action from caller (' + action + ')');
            //break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Process a click on a SmartButton.
//
// CAUTION: Do not use the adacare.lib.modalEditNoValidateDialog function with a SmartButton. It
// already has the same code for preventing double submits. Thus, each submit will be checked twice,
// and the second will look like a duplicate and be ignored.

adacare.lib.smartButtonClick = function (buttonID, needValidationServerBool) {

    var $button, buttonElem;
    var needValidation, isValid;

    needValidation = Boolean(needValidationServerBool !== 0);
    $button = $('#' + buttonID);

    // Validate if needed, and prevent double-clicks

    isValid = (needValidation ? adacare.validateSubmitClick() : true);

    if (isValid) {
        if ($button.length > 0) {

            buttonElem = $button[0];

            if (buttonElem.alreadyClicked) {
                isValid = false;
            }
            else {
                isValid = true;
                buttonElem.alreadyClicked = true;
            }
        }
    }

    return isValid;
};

// DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Attach datepicker to a pair of fields.
//
// Parameters:
// 1. The country abbreviation, for localization.
// 2. The ID of the text field element where the date appears.
// 3. The ID of a hidden field element with a copy of the date.

adacare.lib.addDatePicker = function (countryAbbr, elemID, elemHiddenID) {

    var dateFormatLocalized;

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_CA: dateFormatLocalized = 'mm/dd/yy'; break;
        case adacare.lib.COUNTRY_ABBR_GB: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_GI: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_MT: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_US: dateFormatLocalized = 'mm/dd/yy'; break;
        default: dateFormatLocalized = 'mm/dd/yy'; break; // Default is same as US
    }

    jQuery('#' + elemID).unbind().datepicker({
        showOn: 'both', buttonImage: '/images/calendar.gif',
        buttonImageOnly: true,
        showButtonPanel: true,
        numberOfMonths: 2,
        dateFormat: dateFormatLocalized,
        altField: '#' + elemHiddenID
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Attach datepicker to a pair of fields.
//
// Parameters:
// 1. The country abbreviation, for localization.
// 2. The ID of the text field element where the date appears.
// 3. The ID of a hidden field element with a copy of the date.
// 4. The ID of the "previous" button image element.
// 5. The ID of the "next" button image element.
// 6. An object with options as follows:
//
//    postBackOnChange      True or false (default), to cause a postback when the date is changed.
//
//    incrementDays         The number of days the datepicker is incremented when the user clicks
//                          the "previous" or "next" buttons. Typically 1 (default) or 7.
//
//    firstDayOfWeek        The first day of the week, 0-6 for Sunday-Saturday. Sunday is the default.
//                          Typically used when the increment is 7.
//
//    bindToType            Type of binding to another datepicker. This is used to define a pair of 
//                          datepickers that together concert to display a range of dates. This binding
//                          can be used to prevent the upper date from crossing over the lower date,
//                          and vice versa. Values are:
//
//                              undefined   No binding (default)
//
//                              'lowerstop' The other datepicker is the lower date. This datepicker
//                                          will stop at the lower's date and not cross over.
//
//                              'lowerpush' When the user tries to cross over the lower date, the
//                                          lower date will be pushed down to match this datepicker.
//
//                              'upperstop' The other datepicker is the upper date. This datepicker
//                                          will stop at the upper's date and not cross over.
//
//                              'upperpush' When the user tries to cross over the upper date, the
//                                          upper date will be pushed up to match this datepicker.
//
//                              'match'     Changes the other datepicker to match this one. That is,
//                                          the two datepickers are synchronized.
//
//    bindToElemID          The ID of the text field where the date appears in the bound datepicker.
//
//    bindToElemHiddenID    The ID of a hidden field element with a copy of the date in the bound
//                          datepicker.

adacare.lib.initDatePickerV2 = function (countryAbbr, elemID, elemHiddenID, prevButtID, nextButtID, options) {

    //var ONE_DAY = 1;
    var SIX_DAYS = 6;
    var INCREMENT_WEEKLY = 7;           // DEPRECATED

    var ROUND_TO_NONE = 'none';
    var ROUND_TO_FIRST_DAY_OF_WEEK = 'firstdayofweek';
    var ROUND_TO_LAST_DAY_OF_WEEK = 'lastdayofweek';
    var ROUND_TO_FIRST_DAY_OF_MONTH = 'firstdayofmonth';
    var ROUND_TO_LAST_DAY_OF_MONTH = 'lastdayofmonth';

    var BIND_TO_TYPE_LOWERSTOP = 'lowerstop';
    var BIND_TO_TYPE_LOWERPUSH = 'lowerpush';
    var BIND_TO_TYPE_UPPERSTOP = 'upperstop';
    var BIND_TO_TYPE_UPPERPUSH = 'upperpush';
    var BIND_TO_TYPE_MATCH = 'match';

    var postBackOnChange, incrementDays, firstDayOfWeek, roundTo, bindToType, $bindToElem, $bindToElemHidden;
    var $elem, $elemHidden;
    var dateFormatLocalized;

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_CA: dateFormatLocalized = 'mm/dd/yy'; break;
        case adacare.lib.COUNTRY_ABBR_GB: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_GI: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_MT: dateFormatLocalized = 'dd/mm/yy'; break;
        case adacare.lib.COUNTRY_ABBR_US: dateFormatLocalized = 'mm/dd/yy'; break;
        default: dateFormatLocalized = 'mm/dd/yy'; break; // Default is same as US
    }

    $elem = jQuery('#' + elemID);
    $elemHidden = jQuery('#' + elemHiddenID);

    // Parse the options, and set defaults as needed

    postBackOnChange = (options.postBackOnChange !== undefined ? options.postBackOnChange : false);
    incrementDays = (options.incrementDays !== undefined ? options.incrementDays : 1);
    firstDayOfWeek = (options.firstDayOfWeek !== undefined ? options.firstDayOfWeek : 0); // 0=Sunday
    roundTo = (options.roundTo !== undefined ? options.roundTo : 'default');
    bindToType = options.bindToType; // undefined | lowerstop | lowerpush | upperstop | upperpush | match
    $bindToElem = (options.bindToElemID !== undefined ? $('#' + options.bindToElemID) : undefined);
    $bindToElemHidden = (options.bindToElemHiddenID !== undefined ? $('#' + options.bindToElemHiddenID) : undefined);

    // Display the datepicker

    $elem.unbind().datepicker({
        showOn: 'both', buttonImage: '/images/calendar.gif',
        buttonImageOnly: true,
        showButtonPanel: true,
        numberOfMonths: 2,
        dateFormat: dateFormatLocalized,
        //altField: $elemHidden,
        showAnim: 'slideDown',
        onSelect: function (dateText, dpInstance) {

            var origDate, newDate;
            var needPostBack;

            // Since the dates are already set by the jQuery datepicker UI, the original and
            // new dates are the same.

            origDate = adacare.lib.parseDateLocalized(countryAbbr, $elemHidden.val());
            newDate = adacare.lib.parseDateLocalized(countryAbbr, $elem.val());

            needPostBack = SetDatePicker(origDate, newDate);

            if (needPostBack) {
                __doPostBack(elemID, '');
            }
        }
    });

    // Round the given date.

    function RoundDate(origDate) {

        var newDate;

        if (roundTo === ROUND_TO_FIRST_DAY_OF_WEEK || incrementDays === INCREMENT_WEEKLY) { // incrementDays is deprecated

            newDate = adacare.lib.firstDateOfWeek(firstDayOfWeek, origDate);
        }

        else if (roundTo === ROUND_TO_LAST_DAY_OF_WEEK) {

            newDate = adacare.lib.lastDateOfWeek(firstDayOfWeek, origDate);
        }

        else if (roundTo === ROUND_TO_FIRST_DAY_OF_MONTH) {

            newDate = new Date(origDate.getFullYear(), origDate.getMonth(), 1, 0, 0, 0, 0);
        }

        else if (roundTo === ROUND_TO_LAST_DAY_OF_MONTH) {

            newDate = (new Date(origDate.getFullYear(), origDate.getMonth() + 1, 1, 0, 0, 0, 0)).addDays(-1);
        }

        else {

            newDate = origDate;
        }

        return newDate;
    }

    // Set the new date. This function takes care of rounding and any binding to other
    // datepickers. We return a boolean that indicates if a postback is needed or not.

    function SetDatePicker(origDate, newDate) {

        var newDateStr;
        var needPostBack = false;

        newDate = RoundDate(newDate);

        // Handle binding with another datepicker. This may cause a change in our
        // new date.

        newDate = BindToHandler(newDate, bindToType, $bindToElem, $bindToElemHidden);

        // Set the datepicker's fields to the new date.

        newDateStr = adacare.lib.formatDateLocalized(countryAbbr, newDate);
        $elem.val(newDateStr);
        $elemHidden.val(newDateStr);

        // Allow or prevent a postback, depending on what the caller wants. Note that
        // we only need a postback if the date has actually changed. Note #2: When
        // comparing dates, compare the getTime() value rather than the pointers to
        // the Date objects to get an accurate result.

        needPostBack = (postBackOnChange && (newDate.getTime() !== origDate.getTime()));

        return needPostBack;
    }

    // Handle binding with another datepicker.
    // BUG: (minor) A bound datepicker with "incrementDays" other than 1 or 7 is not supported.
    // When this datepicker "pushes" the bound datepicker, it does not account for the
    // bound datepicker's increment. For example, if the bound datepicker should always 
    // land on a Sunday, then the "push" could set it to  a non-Sunday. We've implemented
    // a partial solution below.

    function BindToHandler(thisDate, bindToType, $bindToElem, $bindToElemHidden) {

        var resultDate, bindToDate;

        resultDate = thisDate;

        if (bindToType !== undefined && $bindToElem !== undefined && $bindToElemHidden !== undefined) {

            //bindToDate = new Date($bindToElem.val());
            bindToDate = adacare.lib.parseDateLocalized(countryAbbr, $bindToElem.val());

            if (bindToType === BIND_TO_TYPE_LOWERSTOP && thisDate < bindToDate) {

                // Stop this datepicker from crossing over. If we're set to increment
                // weekly, then we stop with 6 days to spare.

                if (incrementDays === INCREMENT_WEEKLY) {

                    resultDate = bindToDate.addDays(SIX_DAYS);
                }

                else if (roundTo !== ROUND_TO_NONE) {

                    resultDate = RoundDate(bindToDate.addDays(1));
                }

                else {

                    resultDate = bindToDate;
                }
            }
            else if (bindToType === BIND_TO_TYPE_LOWERPUSH && thisDate < bindToDate) {

                // Push the bound datepicker to match this datepicker. If we're set to increment
                // weekly, then we push by 6 days. Note that we're looking at this datepicker's
                // increment; we should look at the bound datepicker instead, but we can't.

                if (incrementDays === INCREMENT_WEEKLY) {

                    bindToDate = thisDate.addDays(-SIX_DAYS);
                }

                else if (roundTo !== ROUND_TO_NONE) {

                    bindToDate = RoundDate(thisDate);
                }

                else {

                    bindToDate = thisDate;
                }

                $bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                $bindToElemHidden.val($bindToElem.val());
            }
            else if (bindToType === BIND_TO_TYPE_UPPERSTOP && thisDate > bindToDate) {

                // Stop this datepicker from crossing over. If we're set to increment
                // weekly, then we stop with 6 days to spare.

                if (incrementDays === INCREMENT_WEEKLY) {

                    resultDate = bindToDate.addDays(-SIX_DAYS);
                }

                else if (roundTo !== ROUND_TO_NONE) {

                    resultDate = RoundDate(bindToDate.addDays(-1));
                }

                else {

                    resultDate = bindToDate;
                }
            }
            else if (bindToType === BIND_TO_TYPE_UPPERPUSH && thisDate > bindToDate) {

                // Push the bound datepicker to match this datepicker. If we're set to increment
                // weekly, then we push by 6 days. Note that we're looking at this datepicker's
                // increment; we should look at the bound datepicker instead, but we can't.

                if (incrementDays === INCREMENT_WEEKLY) {

                    bindToDate = thisDate.addDays(SIX_DAYS);
                }

                else if (roundTo !== ROUND_TO_NONE) {

                    bindToDate = RoundDate(thisDate);
                }

                else {

                    bindToDate = thisDate;
                }

                $bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                $bindToElemHidden.val($bindToElem.val());
            }
            else if (bindToType === BIND_TO_TYPE_MATCH) {

                // Change the bound datepicker to match this datepicker (up or down).

                bindToDate = thisDate;
                $bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                $bindToElemHidden.val($bindToElem.val());
            }
        }

        return resultDate;
    }

    // Handle clicks on the prev/next buttons.

    function PrevNextHandler($elem, $elemHidden, incrementDays) {

        var origDate, newDate;
        var needPostBack = false;
        var incrementMonths, incrementDaysInWeek;

        origDate = adacare.lib.parseDateLocalized(countryAbbr, $elem.val());

        // If we're using rounding, then we bump the original date up/down by a week or a month.
        // Then, SetDatePicker() will clean it up.

        if (roundTo === ROUND_TO_FIRST_DAY_OF_WEEK || roundTo === ROUND_TO_LAST_DAY_OF_WEEK) {

            incrementDaysInWeek = (incrementDays >= 0 ? 7 : -7);
            newDate = new Date(origDate.getFullYear(), origDate.getMonth(), origDate.getDate() + incrementDaysInWeek, 0, 0, 0, 0);
        }

        else if (roundTo === ROUND_TO_FIRST_DAY_OF_MONTH || roundTo === ROUND_TO_LAST_DAY_OF_MONTH) {

            incrementMonths = (incrementDays >= 0 ? 1 : -1);
            newDate = new Date(origDate.getFullYear(), origDate.getMonth() + incrementMonths, 1, 0, 0, 0, 0);
        }

            // Else, increment by the given number of days, usually 1 or 7.

        else {

            newDate = origDate.addDays(incrementDays);
        }

        needPostBack = SetDatePicker(origDate, newDate);

        return needPostBack;
    }

    jQuery('#' + prevButtID).unbind().click(function () { return PrevNextHandler($elem, $elemHidden, -incrementDays); });
    jQuery('#' + nextButtID).unbind().click(function () { return PrevNextHandler($elem, $elemHidden, +incrementDays); });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Attach timepicker to a pair of fields.
//
// Parameters:
// 1. The ID of the text field element where the time appears.
// 2. The ID of a hidden field element with a copy of the time.

adacare.lib.initTimePickerPopup = function (elemClientID, elemUniqueID, elemHiddenID) {

    jQuery("#" + elemClientID).unbind().timepicker({
        ampm: true,
        timeFormat: "h:mmt",
        hourGrid: 4,
        minuteGrid: 10,
        stepMinute: 1,
        onClose: function () { $("#" + elemHiddenID).val($("#" + elemClientID).val()); __doPostBack(elemUniqueID, ""); }
        //, altField: '#' + elemHiddenID,
        //altFormat: "h:mmt"
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Round a date to the first or last date of the week. This methods allows the caller to
// specify a different starting day for the week (Sunday=0, ...).

adacare.lib.firstDateOfWeek = function (firstDayOfWeek, thisDate) {

    var DAYS_IN_WEEK = 7;
    var thisDayOfWeek, diffDays;
    var firstDate;

    thisDayOfWeek = thisDate.getDay();
    diffDays = thisDayOfWeek - firstDayOfWeek;
    diffDays += (diffDays < 0) ? DAYS_IN_WEEK : 0;
    //firstDate = new Date(thisDate.getTime() - ONE_DAY_MS * diffDays);
    firstDate = thisDate.addDays(-diffDays);

    return firstDate;
};

adacare.lib.lastDateOfWeek = function (firstDayOfWeek, thisDate) {

    var firstDate, lastDate;

    firstDate = adacare.lib.firstDateOfWeek(firstDayOfWeek, thisDate);
    lastDate = firstDate.addDays(6);

    return lastDate;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open or close the "please wait" popup message.

adacare.lib.pleaseWaitPopup = function (action) {

    jQuery(function ($) {

        switch (action) {

            case 'open':
                // Notice that we put the reference to the "please wait" DIV into a new jQuery
                // variable. This MAY be what prevents a bug from appearing. Specifically, I
                // had a while where unblockUI() didn't do anything, a very odd problem that
                // appeared only when the asp:Menu control was present on the Master page.
                // Removing and re-pasting the asp:Menu markup made the problem disappear,
                // which was very odd in itself. In any case, I found a blog that commented
                // on a similar problem, and the fix was to put the message into the variable.

                //$.pleaseWaitDiv = $("#pleaseWaitDiv");

                //$.blockUI(); return; // DEBUG

                $.blockUI({
                    message: '<h3>Just a moment, please...</h3>',
                    //message: $.pleaseWaitDiv,
                    fadeIn: 200, fadeOut: 200,
                    baseZ: 10000,
                    css: {
                        cursor: 'default',                  // Use default cursor. Otherwise, IE leaves a "wait" cursor forever :(
                        'background-color': '#E8E8E8',
                        border: '5px solid #FFFFFF',
                        padding: '10px',
                        'border-radius': '10px',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px'
                    },
                    overlayCSS: {
                        cursor: 'default',
                        background: "#666666 url('/App_Themes/images/ui-bg_diagonals-thick_20_666666_40x40.png') 50% 50%"
                        //    opacity: '.50', filter: 'Alpha(Opacity = 50)' // Oddly, with jQuery v1.4, this code makes overlay opaque (bad). Without code, is translucent (good)
                    }
                });
                break;

            case 'close':
                $.unblockUI();
                break;

                // Any other option is a programming error.                                                                                                                                                                                                                                                                     

            default:
                throw new Error('adacare.lib.pleaseWaitPopup: bad action from caller (' + action + ')');
                //break;
        }
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize a TimePicker. This is just a DropDownList with the values set to parseable time strings,
// and the text to the human-readable time. The TimePicker allows the user to select any time that is
// a multiple of the given increment.

adacare.lib.initTimePicker = function (id, increment) {

    var MINUTES_PER_DAY = 24 * 60;
    var $timepicker;
    var m, mVal, mText;

    $timepicker = $('#' + id);

    for (m = 0; m < MINUTES_PER_DAY; m += increment) {
        mVal = adacare.lib.FormatParseableTimeMinutesStr(m);
        mText = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, m);
        $timepicker.append($('<option></option>').val(mVal).html(mText));
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init a map button (used in the various dialogs).

adacare.lib.initMapButton = function (buttonID, buttonEnabledText, buttonDisabledText, mapUrl) {

    if (mapUrl !== '') {
        $('#' + buttonID).unbind();
        $('#' + buttonID).val(buttonEnabledText);
        $('#' + buttonID).removeAttr('disabled');
        $('#' + buttonID).click(function () { adacare.lib.openHyperlink(mapUrl); return false; });
    }
    else {
        $('#' + buttonID).unbind();
        $('#' + buttonID).val(buttonDisabledText);
        $('#' + buttonID).attr('disabled', 'disabled');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open a new window to the given hyperlink

adacare.lib.openHyperlink = function (my_url) {

    window.open(my_url, "_blank");
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Return a string with the leading and trailing whitespace removed.

adacare.lib.stringTrim = function (str) {

    //var myStr = new String(str);
    var myStr;

    myStr = str;

    return myStr.replace(/^\s+|\s+$/g, '');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Return the given parameter string, or an empty string if the parameter is null. This is useful
// to avoid displaying "null" when given a null string.

adacare.lib.stringNullToEmpty = function (str) {

    var myStr; // = new String();

    myStr = (str !== null) ? str : '';

    return myStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Parse a localized string and return a date.
// Note that this implementation depends on the jQuery DatePicker's functions for conversion. As such,
// the date string must be in a format that DatePicker understands.

adacare.lib.parseDateLocalized = function (countryAbbr, dateStr) {

    var str;                        // Cleaned up input string
    var strParsed;                  // Input as parsed by regex
    var part1, part2, part3;        // The sets of digits
    var mm, dd, yy;                 // Month, day, year
    var resultDate;

    str = adacare.lib.stringTrim(dateStr);
    strParsed = str.match(/(\d*)\D*(\d*)\D*(\d*)/); // "digits / digits / digits"

    if (strParsed !== null) {
        part1 = strParsed[1];
        part2 = strParsed[2];
        part3 = strParsed[3];
    }

    if (part1 === '') { part1 = '1'; }
    if (part2 === '') { part1 = '2'; }
    if (part3 === '') { part1 = '3'; }

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU: mm = part2; dd = part1; yy = part3; break;
        case adacare.lib.COUNTRY_ABBR_CA: mm = part1; dd = part2; yy = part3; break;
        case adacare.lib.COUNTRY_ABBR_GB: mm = part2; dd = part1; yy = part3; break;
        case adacare.lib.COUNTRY_ABBR_GI: mm = part2; dd = part1; yy = part3; break;
        case adacare.lib.COUNTRY_ABBR_MT: mm = part2; dd = part1; yy = part3; break;
        case adacare.lib.COUNTRY_ABBR_US: mm = part1; dd = part2; yy = part3; break;
        default: mm = part1; dd = part2; yy = part3; break; // Default is same as US
    }

    resultDate = new Date(yy, mm - 1, dd);

    return resultDate;
};

adacare.lib.parseDateTimeLocalized = function (countryAbbr, dateStr, timeStr) {

    var baseDate, resultDate;

    baseDate = adacare.lib.parseDateLocalized(countryAbbr, dateStr);
    resultDate = new Date(adacare.lib.formatDate(baseDate) + ' ' + timeStr);

    return resultDate;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a date into a string. Note that this should be the same format as AdaCareLib.Utility.FormatDate()

// Q: Should this map to the localized version instead?

adacare.lib.formatDate = function (myDateTime) {

    var m, d, y, myDateString;

    m = myDateTime.getMonth() + 1;
    d = myDateTime.getDate();
    y = myDateTime.getFullYear();
    myDateString = adacare.lib.numPadWithZeros(m, 2) + '/' + adacare.lib.numPadWithZeros(d, 2) + '/' + y.toString();

    return myDateString;
};

adacare.lib.formatDateLocalized = function (countryAbbr, myDateTime) {

    var m, d, y, myDateString;

    m = myDateTime.getMonth() + 1;
    d = myDateTime.getDate();
    y = myDateTime.getFullYear();

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU:
            myDateString = adacare.lib.numPadWithZeros(d, 2) + '/' + adacare.lib.numPadWithZeros(m, 2) + '/' + y.toString();
            break;

        case adacare.lib.COUNTRY_ABBR_CA:
            myDateString = adacare.lib.numPadWithZeros(m, 2) + '/' + adacare.lib.numPadWithZeros(d, 2) + '/' + y.toString();
            break;

        case adacare.lib.COUNTRY_ABBR_GB:
            myDateString = adacare.lib.numPadWithZeros(d, 2) + '/' + adacare.lib.numPadWithZeros(m, 2) + '/' + y.toString();
            break;

        case adacare.lib.COUNTRY_ABBR_GI:
            myDateString = adacare.lib.numPadWithZeros(d, 2) + '/' + adacare.lib.numPadWithZeros(m, 2) + '/' + y.toString();
            break;

        case adacare.lib.COUNTRY_ABBR_MT:
            myDateString = adacare.lib.numPadWithZeros(d, 2) + '/' + adacare.lib.numPadWithZeros(m, 2) + '/' + y.toString();
            break;

        case adacare.lib.COUNTRY_ABBR_US:
            myDateString = adacare.lib.numPadWithZeros(m, 2) + '/' + adacare.lib.numPadWithZeros(d, 2) + '/' + y.toString();
            break;

        default: // Same as USA
            myDateString = adacare.lib.numPadWithZeros(m, 2) + '/' + adacare.lib.numPadWithZeros(d, 2) + '/' + y.toString();
            break;
    }

    return myDateString;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number into a "CEU hours" string (##0.0). Bad numbers are returned as zero hours.

adacare.lib.formatCEUHours = function (myNumber) {

    var n, nStr;

    n = Number(myNumber);
    n = (isNaN(n) ? 0 : n);
    nStr = n.toFixed(1);

    return nStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number into a "mileage" string (##0.0). Bad numbers are returned as zero mileage.

adacare.lib.formatMileage = function (myNumber) {

    var n, nStr;

    n = Number(myNumber);
    n = (isNaN(n) ? 0 : n);
    nStr = n.toFixed(1);

    return nStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number into a "minutes" string (#0.00m). Bad numbers are returned as zero minutes.

adacare.lib.formatHoursMinutes = function (myNumber) {

    var n, nStr;
    var h, m;

    n = Number(myNumber);
    n = (isNaN(n) ? 0 : n);
    h = Math.floor(n / 60);
    m = n - (h * 60);

    nStr = adacare.lib.numPadWithZeros(h, 1) + ':' + adacare.lib.numPadWithZeros(m, 2) + 'm';

    return nStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert an hours:minutes string to integer minutes.
//
// The input string is expected to be in the format "90:00m", but we're pretty generous in our
// interpretation. We always return a good number, defaulting to zero at worst.

adacare.lib.stringToHoursMinutes = function (myString) {

    var MAX_HPART_DIGITS = 2;
    var MAX_MPART_DIGITS = 2;
    var MINUTES_MAX = 1440; // 24 hours

    var valueStr;           // Input value as string
    var valueParsed;        // Input value, after parsing by regex into an array
    var hPart, mPart;       // The hours and minutes parts of the string
    var totalMinutes;

    valueStr = adacare.lib.stringTrim(myString);
    valueParsed = valueStr.match(/(\d*)\D*(\d*)/);

    if (valueParsed !== null) {
        hPart = valueParsed[1];
        mPart = valueParsed[2];
    }

    if (hPart === '') { hPart = '0'; }
    if (mPart === '') { mPart = '0'; }

    // Truncate extra digits, and right-pad minutes with zeroes.
    // This way, "1:2" becomes "1:20" instead of "1:02".

    hPart = hPart.slice(0, MAX_HPART_DIGITS);
    mPart = mPart.slice(0, MAX_MPART_DIGITS);
    mPart = adacare.lib.numRPadWithZeros(mPart, MAX_MPART_DIGITS);

    totalMinutes = Number(hPart) * 60 + Number(mPart);
    totalMinutes = Math.min(totalMinutes, MINUTES_MAX);

    return totalMinutes;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert a string to time, either HH:MM or HH:MMa.
//
// The input string is expected to be in either 24-hour or 12-hour format (0:00-23:59 or 12:00a-11:59p).
// Bad input is returned as null.

adacare.lib.parseTime = function (myString) {

    var MAX_HPART_DIGITS = 2;
    var MAX_MPART_DIGITS = 2;
    var AM_SUFFIX = "A";
    var PM_SUFFIX = "P";
    var MAX_AMPMPART_CHARS = 1;

    var valueStr;           // Input value as string
    var valueParsed;        // Input value, after parsing by regex into an array
    var hPart, mPart;       // The hours and minutes parts of the string
    var h, m;               // Ditto, as Number
    var ampmPart;           // The am/pm part of the string
    var today;
    var result = null;

    valueStr = adacare.lib.stringTrim(myString);
    valueParsed = valueStr.match(/(\d*)\D*(\d*)(\D*)/);

    if (valueParsed !== null) {

        hPart = valueParsed[1];
        mPart = valueParsed[2];
        ampmPart = valueParsed[3].toUpperCase();

        if (hPart !== '') {

            // Allow the user to omit the minutes.

            //            if (mPart === '') {

            //                mPart = '00';
            //            }

            // Truncate extra digits.

            hPart = hPart.slice(0, MAX_HPART_DIGITS);
            mPart = mPart.slice(0, MAX_MPART_DIGITS);
            mPart = adacare.lib.numRPadWithZeros(mPart, MAX_MPART_DIGITS);
            ampmPart = ampmPart.slice(0, MAX_AMPMPART_CHARS);

            h = Number(hPart);
            m = Number(mPart);

            if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {

                // Adjust for am/pm if needed. We need to end up with hours in 24-hour format.

                if (h === 12 && ampmPart === AM_SUFFIX) {
                    h = 0;
                }
                else if (h < 12 && ampmPart === PM_SUFFIX) {
                    h += 12;
                }

                // Deal with improper times (although they should have been screened out earlier).

                if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {

                    today = new Date();
                    result = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0, 0);
                }
            }
        }
    }

    return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert a string into a number. At worst, a zero value is returned. The optional parameter for
// "optSepThousands" says that the thousands separator (a comma) may be present. This is important
// for parsing strings into numbers, because JavaScript does not recognize the separator as part of
// a valid number.

adacare.lib.stringToNumber = function (myNumberString, optSepThousands) {

    var n;

    optSepThousands = optSepThousands || false; // Default for optional argument

    if (optSepThousands) {
        myNumberString = myNumberString.replace(/,/g, ''); // remove all commas
    }

    n = Number(myNumberString);
    n = (isNaN(n) ? 0 : n);

    return n;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number into a "currency" string (##0.00). Bad numbers are returned as zero currency.

adacare.lib.formatCurrency = function (myNumber) {

    var nStr;

    nStr = adacare.lib.formatDecimal(myNumber, 2, true);

    return nStr;
};

// Similar, with three decimal digits (##0.000).

adacare.lib.formatCurrency3 = function (myNumber) {

    var nStr;

    nStr = adacare.lib.formatDecimal(myNumber, 3, true);

    return nStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number into a "decimal" string (##0.00##), with tghe number of decimal digits given by
// the caller. Bad numbers are returned as zero currency. There is an optional parameter that indicates
// if we should separate the thousands with a comma (actually, we should use the locale's separator).

adacare.lib.formatDecimal = function (myNumber, decimalDigits, optSepThousands) {

    var n, nStr, nStrSplit;

    optSepThousands = optSepThousands || false; // Default for optional argument
    n = Number(myNumber);
    n = (isNaN(n) ? 0 : n);
    nStr = n.toFixed(decimalDigits);

    if (optSepThousands) {
        nStrSplit = nStr.split(".");
        nStrSplit[0] = nStrSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        nStr = nStrSplit.join(".");
    }

    return nStr;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a datetime into a time string. Note that this should be the same format as 
// AdaCareLib.Utility.FormatTime()

adacare.lib.FormatTimeLocalized = function (countryAbbr, myDateTime) {

    var myDateObj = new Date(myDateTime);
    var h, m, myTimeString;

    h = myDateObj.getHours();
    m = myDateObj.getMinutes();
    myTimeString = adacare.lib.FormatTimeMinutesLocalized(countryAbbr, h * 60 + Number(m));

    return myTimeString;
};

adacare.lib.FormatTimeMinutesLocalized = function (countryAbbr, minutes) {

    var h, m, ampm, myTimeString;
    var useAmPm = true; // AM/PM format vs. 24-hour format

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_CA: useAmPm = true; break;
        case adacare.lib.COUNTRY_ABBR_GB: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_GI: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_MT: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_US: useAmPm = true; break;
        default: useAmPm = true; break; // Default is same as US
    }

    h = Math.floor(minutes / 60);
    m = minutes - (h * 60);

    if (useAmPm) {
        ampm = (h < 12 ? 'a' : 'p');

        if (h > 12) {
            h -= 12;
        }
        else if (h === 0) {
            h = 12;
        }
    }
    else {
        ampm = '';
    }

    myTimeString = adacare.lib.numPadWithZeros(h, 1) + ':' + adacare.lib.numPadWithZeros(m, 2) + ampm;

    return myTimeString;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a datetime into a parseable time string. Note that this should be the same format as 
// AdaCareLib.Utility.FormatParseableTimeStr()

adacare.lib.FormatParseableTimeStr = function (myDateTime) {

    var myDateObj = new Date(myDateTime);
    var h, m, myTimeString;

    h = myDateObj.getHours();
    m = myDateObj.getMinutes();
    myTimeString = adacare.lib.FormatParseableTimeMinutesStr(h * 60 + Number(m));

    return myTimeString;
};

adacare.lib.FormatParseableTimeMinutesStr = function (minutes) {

    var h, m, myTimeString;

    h = Math.floor(minutes / 60);
    m = minutes - (h * 60);
    myTimeString = adacare.lib.numPadWithZeros(h, 1) + ':' + adacare.lib.numPadWithZeros(m, 2);

    return myTimeString;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number as a string with leading zeros, n digits long.

adacare.lib.numPadWithZeros = function (n, digits) {

    var result;

    result = n.toString();

    //for (; result.length < digits;) {
    while (result.length < digits) {
        result = '0' + result;
    }

    return result;
};

// Ditto, but right-pad with zeroes.

adacare.lib.numRPadWithZeros = function (n, digits) {

    var result;

    result = n.toString();

    //for (; result.length < digits;) {
    while (result.length < digits) {
        result = result + '0';
    }

    return result;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert a DateTime to UTC.
//
// JavaScript normally handles DateTime objects in the client's local time.
// When we pass a DateTime to the web service, it converts it to UTC, thus
// altering the time by several hours. So, we convert the local time to the 
// *same* time in UTC. That is, 8am EST becomes 8am UTC. Yes, this is weird.
//
// Example: Calling a Web Service from client-side JavaScript
//
//      myDateUTC = adacare.lib.convertToUTC( myDateLocal );
//      MyWebService( myDateUTC );
//
// Example: Using date returned from a Web Service from client-side JavaScript
//
//      myDateUTC = myWebServiceReturnedValue;
//      myDateLocal = adacare.lib.convertFromUTC( myDateUTC );

adacare.lib.convertToUTC = function (dt) {

    var dtUTC, year, month, day, hours, minutes;

    year = dt.getFullYear();
    month = dt.getMonth();
    day = dt.getDate();
    hours = dt.getHours();
    minutes = dt.getMinutes();
    dtUTC = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));

    return dtUTC;
};

// This function converts a UTC date/time to the *same* in the local time.

adacare.lib.convertFromUTC = function (dtUTC) {

    var dt, year, month, day, hours, minutes;

    year = dtUTC.getUTCFullYear();
    month = dtUTC.getUTCMonth();
    day = dtUTC.getUTCDate();
    hours = dtUTC.getUTCHours();
    minutes = dtUTC.getUTCMinutes();
    dt = new Date(year, month, day, hours, minutes, 0, 0);

    return dt;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Generic handler for web service failure. Use this method after any special-purpose error handlers
// are done.

adacare.lib.WSFailedGenericMessage = function (error, context, messsage) {

    var msg;

    msg = context + ': ' + messsage + ' ' + error.get_message() +
    '\n' + 'Status Code: ' + error.get_statusCode() + ', Timeout: ' + error.get_timedOut() +
    '\n' + 'Stack Trace: ' + error.get_stackTrace();
    alert(msg);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Parse the URL passed to this page, and extract the arguments.
// Code adapted from "JavaScript, The Definitive Guide."

adacare.lib.getArgs = function () {

    var args = {};
    var query = document.location.search.substring(1);           // Get arguments string after the "?"
    var pairs = query.split('&');                       // Split into arguments separated by ampersand
    var pos, argname, argvalue, i;

    for (i = 0; i < pairs.length; i++) {
        pos = pairs[i].indexOf('=');                    // Look for "name=value"
        if (pos >= 0) {
            argname = pairs[i].substring(0, pos);       // Extract the argument name
            argvalue = pairs[i].substring(pos + 1);     // Extract the argument value
            argvalue = decodeURIComponent(argvalue);    // Decode the encoded string
            args[argname] = argvalue;
        }
    }

    return args;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Profiling tools (crude!)

adacare.lib.Profile = function (descrip) {

    this.descrip = descrip;
    this.startDT = null;
    this.stopDT = null;
    this.ms = 0;
    this.count = 0;
};

adacare.lib.profileInit = function () {

    adacare.lib.profileArray = [];
};

adacare.lib.profileStart = function (descrip) {

    var found = false;
    var p, i;

    for (i = 0; i < adacare.lib.profileArray.length; i++) {
        if (descrip == adacare.lib.profileArray[i].descrip) {
            found = true;
            break;
        }
    }

    if (!found) {
        p = new adacare.lib.Profile(descrip);
        adacare.lib.profileArray[i] = p;
    }
    adacare.lib.profileArray[i].startDT = new Date().getTime();
    adacare.lib.profileArray[i].count++;
};

adacare.lib.profileStop = function (descrip) {

    var found = false;
    var msStart, msStop, i;

    for (i = 0; i < adacare.lib.profileArray.length; i++) {
        if (descrip == adacare.lib.profileArray[i].descrip) {
            found = true;
            break;
        }
    }

    if (found) {
        adacare.lib.profileArray[i].stopDT = new Date().getTime();
        msStart = adacare.lib.profileArray[i].startDT;
        msStop = adacare.lib.profileArray[i].stopDT;
        adacare.lib.profileArray[i].ms += (msStop - msStart);
    }
    else {
        throw new Error('adacare.lib.profileStop: profile not started for "' + descrip + '"');
    }
};

adacare.lib.profileReport = function () {

    var str = '', i;

    for (i = 0; i < adacare.lib.profileArray.length; i++) {
        str += adacare.lib.profileArray[i].descrip;
        str += ' ' + adacare.lib.profileArray[i].count;
        str += ' ' + adacare.lib.profileArray[i].ms + 'ms';
        str += '\n';
    }

    alert('Profile:\n' + str);
};
