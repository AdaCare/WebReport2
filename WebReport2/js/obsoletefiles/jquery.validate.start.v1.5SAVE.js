// Copyright 2009 by Neurosoftware, LLC.
//
// jquery.validate.start.v1.5.lib      Sandy Gettings              Revised 11/30/2012
//
// This code sets up usage of the jquery.maskedinput plugin. It should be included
// in the web page after the plugin.
//
// Usage for key filter:
//
// I suppose the key filter should be in its own document, but since its related to validation,
// I've included it here. Technically speaking, it isn't related to the other plugins and works
// entirely on its own.
//
// Just include any of the following in the input field's "class" attribute. Only those keys
// will be allowed for input (that is, as the user types). No warnings needed, as only the
// characters permitted will appear on the user's screen.
//
//  mask-pint: /[\d]/
//  mask-int: /[\d\-]/
//  mask-pnum: /[\d\.]/
//  mask-num: /[\d\-\.]/
//  mask-hex: /[0-9a-f]/i
//  mask-email: /[a-z0-9_\.\-@]/i
//  mask-alpha: /[a-z_]/i
//  mask-alphanum: /[a-z0-9_]/i
//
//  Example: <input type="text" class="mask-num" />
//
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Usage for validation:
//
// First, include the following JavaScript files in the ASPX source. Usually the files are
// included using the ScriptManager or ScriptManagerProxy.
//
//  jquery.keyfilter-1.7.js             (the keyfilter plugin, none of the other plugins is needed)
//  jquery.maskedinput-1.3.min.js       (the masked input plugin, needed for date fields)
//  jquery.validate.js                  (the validation plugin)
//  jquery.validate.start.v1.5.js            (this file)
//
// Next, compose the web page. Add the validation CSS classes listed below to fields that you
// want to be validated. The CSS class that tells us the format of the field of interest.
// Supported classes are:
//
//  val_required        Field is required, cannot be blank
//  val_date            Field must be a date
//  val_time            Field must be a time, either 24-hour or 12-hour (0:00-23:59 or 12:00a-11:59p)
//  val_birthdate       Field must be a recent date in the past: 1900 - today
//  val_int             Field must be an integer
//  val_number          Field must be a decimal number
//  val_hoursminutes    Field must be an minutes number: HH:MM (like 2:00 = 2 hours, 4:30 = 4 hours, 30 minutes)
//  val_mileage         Field must be a decimal mileage number: 999.9
//  val_currency        Field must be a decimal currency number: 999.99
//  val_decimal0        Field must be a decimal number: 999 (used for large integers)
//  val_decimal3        Field must be a decimal number: 999.999 (used for fractional pennies)
//  val_phone_us        Field must be a US phone number: 999-999-9999
//  val_callerid_us     Field must be a US phone number caller ID: 999-999-9999
//
// When the fields are inside of an AJAX UpdatePanel, be sure to place the buttons that
// cause a submit outside of the UpdatePanel. Otherwise, invalid fields can still be
// returned to the server-side code upon button-click, as the submit is not canceled.
// TODO: Find a solution to this problem with UpdatePanels. First, check to see if the below already fixes it.
//
// The ADD and UPDATE buttons: Set the OnClientClick to "return(adacare.validateSubmitClick());"
// The CANCEL button: Set CausesValidation and UseSubmitBehavior to FALSE.
// Credits:
//
//  For the key filter plugin: http://plugins.jquery.com/project/keyfilter
//  For the masked edit plugin: http://digitalbush.com/projects/masked-input-plugin/
//  For the validation plugin: http://docs.jquery.com/Plugins/validation
//
/////////////////////////////////////////////////////////////////////////////////////////////////////

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== "object") { throw new Error("adacare is already defined, but is not an object!"); }

if (!adacare.validate) {
    adacare.validate = {};
    adacare.validate.initialized = false;
}
else { throw new Error("adacare.validate is already defined!"); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This method pops up the error message box for invalid fields, and clears
// any leftover message boxes for valid fields (that is, formerly invalid).

adacare.validateShowErrors = function (errorMap, errorList) {

    var CSS_POPUP_CONTAINER = 'val_popup_container';    // CSS class of the popup element
    var CSS_LEFT_ARROW = 'val_left_arrow';              // CSS class of the popup's left arrow
    //var CSS_RIGHT_MSGBOX = 'val_right_msgbox';          // CSS class of the popup's msg box
    var CSS_BADFIELD = 'val_badfield';                  // CSS class applied to invalid fields
    var pos, widthpx;
    var $container, containerID;
    var error, $element, message, i;
    var goodElements;

    // First, get a list of good (valid, no errors) elements.
    // Get rid of the little error message box for each.

    goodElements = this.validElements();

    for (i = 0; i < goodElements.length; i++) {
        $element = $(goodElements[i]);
        $element.removeClass(CSS_BADFIELD);
        containerID = $element[0].id + '_val';
        $('#' + $element[0].id + '_val').remove();
    }

    // Next, look at all of the bad elements. Pop up a little
    // message box for each. Be careful to avoid creating duplicates,
    // or they're hard to delete.

    for (i = 0; i < errorList.length; i++) {
        error = errorList[i];
        $element = $(error.element);
        message = error.message;
        pos = $element.position();
        widthpx = $element.width();
        $element.addClass(CSS_BADFIELD);

        containerID = $element[0].id + '_val';
        if ($('#' + containerID).length === 0) {
            $container = $('<div id="{0}"></div>'.replace('{0}', containerID));
            $container.css('top', pos.top).css('left', pos.left + widthpx + 15);
            $container.addClass(CSS_POPUP_CONTAINER); /*.addClass(CSS_RIGHT_MSGBOX);*/
            $container.text(message);
            $container.appendTo($element.parent());
            $('<div class="' + CSS_LEFT_ARROW + '"></div>').appendTo($container);
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Simple dates can be any date. However, we use special validation code here
// because we need to ignore the mask (from the masked input plugin).

adacare.validateDate = function (value, element) {

    var placeholderTemplate = adacare.validate.dateTemplate;
    var sdate = new Date(1900, 1 - 1, 1), edate = new Date(2099, 12 - 1, 31);
    var sdateMs = sdate.getTime(), edateMs = edate.getTime();
    var valueDate;
    var ms;
    var isValid = false;

    value = adacare.lib.stringTrim(value);

    if (!(value === '' || value === placeholderTemplate)) {

        //ms = Date.parse(value);
        valueDate = adacare.lib.parseDateLocalized(adacare.lib.countryAbbr, value);
        ms = valueDate.getTime();

        if (!isNaN(ms)) {
            isValid = (ms >= sdateMs && ms <= edateMs);
        }

        // Redisplay the date after interpretation. This helps alert the user
        // to bad dates that are still parsed by JavaScript, like 99/01/2000.
        // JavaScript seems to like just about anything.

        if (isValid) {
            element.value = adacare.lib.formatDateLocalized(adacare.lib.countryAbbr, new Date(ms));
        }
    }

    // Blank date is acceptable.

    else {
        element.value = '';
        isValid = true;
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Birthdates are assumed to be since Jan 1 1900, and before today.

adacare.validateBirthdate = function (value, element) {

    //var sdate = new Date('01/01/1900'), edate = new Date();
    var sdate = new Date(1900, 1 - 1, 1), edate = new Date();
    var sdateMs = sdate.getTime(), edateMs = edate.getTime();
    var valueDate;
    var ms;
    var elementValue;
    var isValid = false;

    if (adacare.validateDate(value, element)) {

        elementValue = adacare.lib.stringTrim(element.value);
        if (elementValue !== '') {
            //ms = Date.parse(elementValue);
            valueDate = adacare.lib.parseDateLocalized(adacare.lib.countryAbbr, value);
            ms = valueDate.getTime();

            if (!isNaN(ms)) {
                isValid = (ms >= sdateMs && ms <= edateMs);
            }
        }

        // Blank date is acceptable.

        else {
            isValid = true;
        }
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Validate time fields.

adacare.validateTime = function (value, element) {

    var myTime;
    var isValid = false;

    // Test to see if this is a text element. We REALLY shouldn't need to do this, as the selector
    // for finding controls to validate should only select the ones we want. However, something
    // odd is going on, and we're getting <select> controls passed in. Very, very odd.

    if ($(element).is('.val_time:input[type=text]')) {

        if (value !== '') {

            value = adacare.lib.stringTrim(value);
            myTime = adacare.lib.parseTime(value);

            if (myTime !== null) {

                element.value = adacare.lib.FormatTimeLocalized(adacare.lib.countryAbbr, myTime);
                isValid = true;
            }
        }

        // Blank time is acceptable.

        else {
            element.value = '';
            isValid = true;
        }
    }
    else {
        isValid = true; // If the wrong element ended up here, I guess we don't complain?
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// CEU hours are in the form of "999.9".

adacare.validateCEUHours = function (value, element) {

    var MAX_INTPART_DIGITS = 3;
    var MAX_DECPART_DIGITS = 1;

    var valueParsed;        // Input value, after parsing by regex into an array
    var intPart, decPart;   // The integer and decimal parts of the string
    var ceuhours;
    var isValid = true;

    value = adacare.lib.stringTrim(value);

    valueParsed = value.match(/(\d*)\.*(\d*)/);
    if (valueParsed !== null) {
        intPart = valueParsed[1];
        decPart = valueParsed[2];
    }

    if (intPart === '') { intPart = '0'; }
    if (decPart === '') { decPart = '0'; }

    // Truncate extra digits

    intPart = intPart.slice(0, MAX_INTPART_DIGITS);
    decPart = decPart.slice(0, MAX_DECPART_DIGITS);

    // Redisplay the CEU hours. Since we always make a silk purse, even given
    // a sow's ear, the user's input is always valid.

    ceuhours = intPart + '.' + decPart;
    element.value = adacare.lib.formatCEUHours(ceuhours);

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Mileages are in the form of "999.9".

adacare.validateMileage = function (value, element) {

    var MAX_INTPART_DIGITS = 3;
    var MAX_DECPART_DIGITS = 1;

    var valueParsed;        // Input value, after parsing by regex into an array
    var intPart, decPart;   // The integer and decimal parts of the string
    var mileage;
    var isValid = true;

    // Test to see if this is a text element. We REALLY shouldn't need to do this, as the selector
    // for finding controls to validate should only select the ones we want. However, something
    // odd is going on, and we're getting <select> controls passed in. Very, very odd.

    if ($(element).is('.val_mileage:input')) {

        value = adacare.lib.stringTrim(value);

        //valueParsed = value.match(/(\d*)\.*(\d*)/);
        valueParsed = value.match(/(\d*)\D*(\d*)/);
        if (valueParsed !== null) {
            intPart = valueParsed[1];
            decPart = valueParsed[2];
        }

        if (intPart === '') { intPart = '0'; }
        if (decPart === '') { decPart = '0'; }

        // Truncate extra digits

        intPart = intPart.slice(0, MAX_INTPART_DIGITS);
        decPart = decPart.slice(0, MAX_DECPART_DIGITS);

        // Redisplay the mileage. Since we always make a silk purse, even given
        // a sow's ear, the user's input is always valid.

        mileage = intPart + '.' + decPart;
        element.value = adacare.lib.formatMileage(mileage);
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Minutes are in the form of "90:00m".

adacare.validateHoursMinutes = function (value, element) {

    var totalMinutes;
    var isValid = true;

    // Test to see if this is a text element. We REALLY shouldn't need to do this, as the selector
    // for finding controls to validate should only select the ones we want. However, something
    // odd is going on, and we're getting <select> controls passed in. Very, very odd.

    if ($(element).is('.val_hoursminutes:input[type=text]')) {

        totalMinutes = adacare.lib.stringToHoursMinutes(value);
        element.value = adacare.lib.formatHoursMinutes(totalMinutes);
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Currency is in the form of "999.99".

adacare.validateCurrency = function (value, element) {

    var MAX_INTPART_DIGITS = 6;
    var MAX_DECPART_DIGITS = 2;

    var valueParsed;        // Input value, after parsing by regex into an array
    var intPart, decPart;   // The integer and decimal parts of the string
    var decimalNumber, decimalNumberString;
    var isValid = true;

    value = adacare.lib.stringTrim(value);
    value = value.replace(/,/g, '');        // Remove all commas before parsing. This may be a problem in some locales.

    valueParsed = value.match(/([\-]*\d*)\.*(\d*)/);
    if (valueParsed !== null) {
        intPart = valueParsed[1];
        decPart = valueParsed[2];
    }

    if (intPart === '') { intPart = '0'; }
    if (decPart === '') { decPart = '0'; }

    // Truncate extra digits

    intPart = intPart.slice(0, MAX_INTPART_DIGITS);
    decPart = decPart.slice(0, MAX_DECPART_DIGITS);

    // Redisplay the currency. Since we always make a silk purse, even given
    // a sow's ear, the user's input is always valid.

    decimalNumber = intPart + '.' + decPart;
    decimalNumberString = adacare.lib.formatCurrency(decimalNumber);

    if (element.maxLength == 0 || decimalNumberString.length <= element.maxLength) {
        element.value = decimalNumberString;
    }
    else {
        isValid = false;
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Decimal is in the form of "999", with zero decimal digits. This method is used for large integers
// when we want commas between the thousands.

adacare.validateDecimal0 = function (value, element) {

    var MAX_INTPART_DIGITS = 9;
    var MAX_DECPART_DIGITS = 0;

    var valueParsed;        // Input value, after parsing by regex into an array
    var intPart, decPart;   // The integer and decimal parts of the string
    var decimalNumber, decimalNumberString;
    var isValid = true;

    value = adacare.lib.stringTrim(value);
    value = value.replace(/,/g, '');        // Remove all commas before parsing. This may be a problem in some locales.

    valueParsed = value.match(/([\-]*\d*)\.*(\d*)/);
    if (valueParsed !== null) {
        intPart = valueParsed[1];
        decPart = valueParsed[2];
    }

    if (intPart === '') { intPart = '0'; }
    if (decPart === '') { decPart = '0'; }

    // Truncate extra digits

    intPart = intPart.slice(0, MAX_INTPART_DIGITS);
    decPart = decPart.slice(0, MAX_DECPART_DIGITS);

    // Redisplay the decimal number. Since we always make a silk purse, even given
    // a sow's ear, the user's input is always valid.

    decimalNumber = intPart + '.' + decPart;
    decimalNumberString = adacare.lib.formatDecimal(decimalNumber, MAX_DECPART_DIGITS, true);

    if (element.maxLength == 0 || decimalNumberString.length <= element.maxLength) {
        element.value = decimalNumberString;
    }
    else {
        isValid = false;
    }

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Decimal is in the form of "999.999", with three decimal digits. This method is used for currency
// with fractional pennies.

adacare.validateDecimal3 = function (value, element) {

    var MAX_INTPART_DIGITS = 6;
    var MAX_DECPART_DIGITS = 3;

    var valueParsed;        // Input value, after parsing by regex into an array
    var intPart, decPart;   // The integer and decimal parts of the string
    var decimalNumber, decimalNumberString;
    var isValid = true;

    value = adacare.lib.stringTrim(value);
    value = value.replace(/,/g, '');        // Remove all commas before parsing. This may be a problem in some locales.

    valueParsed = value.match(/([\-]*\d*)\.*(\d*)/);
    if (valueParsed !== null) {
        intPart = valueParsed[1];
        decPart = valueParsed[2];
    }

    if (intPart === '') { intPart = '0'; }
    if (decPart === '') { decPart = '0'; }

    // Truncate extra digits

    intPart = intPart.slice(0, MAX_INTPART_DIGITS);
    decPart = decPart.slice(0, MAX_DECPART_DIGITS);

    // Redisplay the decimal number. Since we always make a silk purse, even given
    // a sow's ear, the user's input is always valid.

    decimalNumber = intPart + '.' + decPart;
    decimalNumberString = adacare.lib.formatDecimal(decimalNumber, MAX_DECPART_DIGITS, true);

    if (element.maxLength == 0 || decimalNumberString.length <= element.maxLength) {
        element.value = decimalNumberString;
    }
    else {
        isValid = false;
    }

    return isValid;
};


adacare.validatePassword = function (value, element) {

    var MIN_LENGTH = 8;
    var isValid;

    value = adacare.lib.stringTrim(value);
    isValid = (value.length >= MIN_LENGTH);

    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Use this function to prevent double-clicks on "Add" and "Update" buttons. It validates the form
// and, if it passes validation, disables the given button. The page must be refreshed to re-enable
// it again.
//
// Usage: Add the following to the ASP button control:
//
// OnClientClick="javascript:return adacare.validateAndDisableSubmitClick(this);"
//
// Parms: "this" is the button that received the mouse click. If you do not want to disable the button,
// just pass "null" as the parameter, or omit it entirely.

adacare.validateAndDisableSubmitClick = function (elem) {

    var isValid;

    isValid = adacare.validateSubmitClick();

    if (isValid) {
        if (elem !== undefined && elem !== null) {
            //$(elem).attr('disabled', 'disabled');
            if (elem.alreadyClicked) {
                isValid = false;
            }
            else {
                elem.alreadyClicked = true;
            }
        }
    }
    return isValid;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This function is executed whenever the form's Submit button is clicked. Normally, the validation
// plugin aborts a submit if there are any validation failures on the form. However, the plugin does
// not behave correctly if the form and the button are within an UpdatePanel. In those cases, the
// button needs to execute JavaScript code to invoke this function as follows:
//
// OnClientClick="javascript:return adacare.validateSubmitClick();"
//
// This function will return true if all validation passes, and the submit will proceed normally.
// It returns false if there are any validation problems, and the submit will not proceed.

adacare.validateSubmitClick = function () {

    var isValid;

    isValid = $('form').validate().form();
    return isValid;
};

// This companion function should be called from the form's Cancel button. It prevents an odd case
// (probably a bug somewhere) that bombs the masked input function when canceling out of a form
// with a bad field. For example, type "88/88/8888" into a date field, type the tab key to get a
// validation error, and then click the Cancel button.
//
// OnClientClick="javascript: adacare.validateCancelClick();"

adacare.validateCancelClick = function () {

    jQuery('.val_birthdate').unmask();
    jQuery('.val_date').unmask();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is a similar function that's used when the form is inside an UpdatePanel. It must be loaded
// when the page is loaded, and will be invoked whenever there is an async postback. The form must
// pass validation, or the postback will be canceled.
//
// Beware! We must remember the UpdatePanels in a list. We use the list to avoid adding the same
// initializeRequest for each postback. Otherwise, the code validates the page multiple times and
// eventually bombs with a timeout in livequery.
//
// Microsoft's documentation is poor, but for more info:
//
// http://msdn.microsoft.com/en-us/library/bb397460.aspx

adacare.validate.updatePanelPostbackList = []; // List of UpdatePanels we validate on postback.

adacare.validate.UpdatePanelPostback = function (updatePanelUniqueId) {

    var alreadyAdded = false;
    var listLength, i;

    listLength = adacare.validate.updatePanelPostbackList.length;

    for (i = 0; i < listLength; i++) {

        if (adacare.validate.updatePanelPostbackList[i] == updatePanelUniqueId) {
            alreadyAdded = true;
            break;
        }
    }

    if (!alreadyAdded) {
        adacare.validate.updatePanelPostbackList[listLength] = updatePanelUniqueId;

        // Idea: Only queue this once for all UpdatePanels.

        Sys.WebForms.PageRequestManager.getInstance().add_initializeRequest(
            function (sender, args) {
                adacare.validate.UpdatePanelPostbackCallback(sender, args, updatePanelUniqueId);
            });
    }
};

adacare.validate.UpdatePanelPostbackCallback = function (sender, args, targetUpdatePanelUniqueId) {

    var isValid;
    var thisInstance, isInAsyncPostback;
    var postbackElemId, panelList;
    var i;

    thisInstance = Sys.WebForms.PageRequestManager.getInstance();
    isInAsyncPostback = thisInstance.get_isInAsyncPostBack();

    //    if (thisInstance.get_isInAsyncPostBack() & args.get_postBackElement().id == 'CancelRefresh') {

    //        thisInstance.abortPostBack();
    //    }
    //    else 

    //if (isInAsyncPostback) { -- removed since always false.

    panelList = args.get_updatePanelsToUpdate();
    postbackElemId = args.get_postBackElement().id;

    for (i = 0; i < panelList.length; i++) {

        if (panelList[i] === targetUpdatePanelUniqueId) {

            isValid = $('form').validate().form();

            if (!isValid) {
                args.set_cancel(true);
            }
        }
    }
    //}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize the validation plugin. Here, we set options and define validation rules.
//
// Usage: To force repeated initialization, supply the "alwaysInit" parameter as true. The only time
// is needed is for validation within MutiView controls. Here's why: A MultiView contains several View
// controls (think of them as DIVs), but only one is visible at a time. When this initialization
// method is called, it only assigns validation rules to the fields that are currently visible. That
// is only fields within the first View are assigned validation rules; the fields on the other Views
// are not assigned any rules, and are thus unvalidated. The solution is to re-init validation every
// time the MultiView changes Views (or simply on every posback).

adacare.validateInit = function (alwaysInit) {

    // Init only one time. Otherwise, the rules below will blow up.

    if (!adacare.validate.initialized || alwaysInit) {

        //adacare.validate.initialized = true;

        // Set localized validation info.

        switch (adacare.lib.countryAbbr) {
            case 'AU':
                adacare.validate.dateTemplate = '__/__/____';
                adacare.validate.dateMask = '99/99/9999';
                adacare.validate.dateMessage = 'Please enter a date as dd/mm/yyyy';
                adacare.validate.timeMessage = 'Please enter the time in the format 8:00 or 17:00.';
                break;

            case 'CANADA':
                adacare.validate.dateTemplate = '__/__/____';
                adacare.validate.dateMask = '99/99/9999';
                adacare.validate.dateMessage = 'Please enter a date as mm/dd/yyyy';
                adacare.validate.timeMessage = 'Please enter the time in the format 12:00a or 12:00p.';
                break;

            case 'GB':
                adacare.validate.dateTemplate = '__/__/____';
                adacare.validate.dateMask = '99/99/9999';
                adacare.validate.dateMessage = 'Please enter a date as dd/mm/yyyy';
                adacare.validate.timeMessage = 'Please enter the time in the format 8:00 or 17:00.';
                break;

            case 'USA':
                adacare.validate.dateTemplate = '__/__/____';
                adacare.validate.dateMask = '99/99/9999';
                adacare.validate.dateMessage = 'Please enter a date as mm/dd/yyyy';
                adacare.validate.timeMessage = 'Please enter the time in the format 12:00a or 12:00p.';
                break;

            default: // Same as USA
                adacare.validate.dateTemplate = '__/__/____';
                adacare.validate.dateMask = '99/99/9999';
                adacare.validate.dateMessage = 'Please enter a date as mm/dd/yyyy';
                adacare.validate.timeMessage = 'Please enter the time in the format 12:00a or 12:00p.';
                break;
        }

        $('form').validate({
            showErrors: adacare.validateShowErrors,
            onkeyup: false,
            focusCleanup: true,
            onsubmit: false
        });

        var junk1 = $('.val_required:input');
        var junk2 = $('.val_required');
        $('.val_required:input').each(function () {
            $(this).rules('add', {
                required: true
            });
        });

        jQuery.validator.addMethod('val_date', adacare.validateDate, adacare.validate.dateMessage);

        $('.val_date:input').each(function () {
            $(this).rules('add', {
                val_date: true
            });
        });

        jQuery.validator.addMethod('val_time', adacare.validateTime, adacare.validate.timeMessage);

        $('.val_time:input').each(function () {
            $(this).rules('add', {
                val_time: true
            });
        });

        jQuery.validator.addMethod('val_birthdate', adacare.validateBirthdate, 'Please enter a birth date between 01/01/1900 and today.');

        $('.val_birthdate:input').each(function () {
            $(this).rules('add', {
                val_birthdate: true
            });
        });

        $('.val_int:input').each(function () {
            $(this).rules('add', {
                digits: true
            });
        });

        $('.val_int_right:input').each(function () {
            $(this).rules('add', {
                digits: true
            });
        });

        $('.val_number:input').each(function () {
            $(this).rules('add', {
                number: true
            });
        });

        jQuery.validator.addMethod('val_ceuhours', adacare.validateCEUHours, 'Please enter CEU hours as a number in the format "000.0".');

        $('.val_ceuhours:input').each(function () {
            $(this).rules('add', {
                number: true,
                val_ceuhours: true
            });
        });

        jQuery.validator.addMethod('val_mileage', adacare.validateMileage, 'Please enter mileage as a number in the format "000.0".');

        $('.val_mileage:input').each(function () {
            $(this).rules('add', {
                number: true,
                val_mileage: true
            });
        });
        //$('.val_mileage:input').keyfilter(/[\d\.]/);

        jQuery.validator.addMethod('val_hoursminutes', adacare.validateHoursMinutes, 'Please enter hours and minutes as "HH:MM".');

        $('.val_hoursminutes:input[type=text]').each(function () {
            $(this).rules('add', {
                number: false,
                val_hoursminutes: true
            });
        });

        jQuery.validator.addMethod('val_currency', adacare.validateCurrency, 'Please enter currency as a number in the format "000.00".');

        $('.val_currency:input').each(function () {
            $(this).rules('add', {
                number: true,
                val_currency: true
            });
        });

        jQuery.validator.addMethod('val_decimal0', adacare.validateDecimal0, 'Please enter a number in the format "123".');

        $('.val_decimal0:input').each(function () {
            $(this).rules('add', {
                number: true,
                val_decimal0: true
            });
        });

        jQuery.validator.addMethod('val_decimal3', adacare.validateDecimal3, 'Please enter a number in the format "0.000".');

        $('.val_decimal3:input').each(function () {
            $(this).rules('add', {
                number: true,
                val_decimal3: true
            });
        });

        $('.val_email:input').each(function () {
            $(this).rules('add', {
                email: true
            });
        });

        // Experimental

        $('.val_creditcard:input').each(function () {
            $(this).rules('add', {
                creditcard: true // , param: { amex: true, discover: true, mastercard: true, visa: visa }
            });
        });

        jQuery.validator.addMethod('val_password', adacare.validatePassword, 'The password must be at least 8 characters.');

        $('.val_password:input').each(function () {
            $(this).rules('add', {
                minlength: 8                // Should be the same as AdaCareLib.GlobalsLib.USER_PASSWORD_MIN_LENGTH
            });
        });

        //    $().ready(function() {
        //        $('form').validate({
        //        rules: {
        //            field: {
        //                required: true,
        //                date: true
        //            }
        //        }
        //    });
        //    });

        // See if this works, or if it needs to be wrapped in the "ready" function.

        jQuery('.val_birthdate').livequery(function (e) { $(this).mask(adacare.validate.dateMask); });
        jQuery('.val_date').livequery(function (e) { $(this).mask(adacare.validate.dateMask); });
        jQuery('.val_phone_us').livequery(function (e) { $(this).mask('999-999-9999'); });
        jQuery('.val_callerid_us').livequery(function (e) { $(this).mask('999-999-9999'); });
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This section of code is executed as soon as jQuery thinks the document is ready. We use the
// opportunity for two things: to assign an input mask on date fields (and any other fields that are
// fixed length and format, like SSN), and to initialize the validation plugin.

//jQuery(function ($) {

// Hope this works: validateInit is called from the master page.
//adacare.validateInit();

//jQuery(function($) {
//    $.mask.definitions['i'] = '[ 0-9]';
//});

//jQuery('.val_int').livequery(function(e) { $(this).mask('99') });
//jQuery('.val_int').mask('ii');
//jQuery('.val_date').livequery(function(e) { $(this).mask('99/99/9999') });

//jQuery('.val_birthdate').livequery(function (e) { $(this).mask('99/99/9999'); });
//jQuery('.val_date').livequery(function (e) { $(this).mask('99/99/9999'); });
//jQuery('.val_phone_us').livequery(function (e) { $(this).mask('999-999-9999'); });
//jQuery('.val_callerid_us').livequery(function (e) { $(this).mask('999-999-9999'); });

//jQuery('.val_mileage').livequery(function(e) { $(this).mask('999.9') });
//jQuery('.val_birthdate').mask('99/99/9999');

//jQuery('.val_birthdate').Watermark('mm/dd/yyyy');
//jQuery('.val_ssn').livequery(function(e) { $(this).mask('999-99-9999') });
//jQuery('.val_ssn').livequery(function(e) { adacare.validity() });

//jQuery('form').livequery(function(e) { adacare.validate() });

//});
