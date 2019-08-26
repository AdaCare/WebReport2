// Copyright 2009, 2010, 2011, 2012, 2013 by Neurosoftware, LLC.
//
// adacare.lib.fieldfuncs.v1.02               Sandy Gettings              Revised 11/10/2013
//
// This is a library that provides a set of common of JavaScript functions.
// In particular, these are for handling specialized web page fields on the client side,
// to avoid Asp.Net postbacks.
//
// After testing, move this code into the adacare.lib file.
//
// Revisions:
// 06/25/14 SG Added handler for checkbox fields.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Global constants.

adacare.lib.CALLER_ID_DIGITS_AU = 10;          // Exact number of digits in an Australian caller ID
adacare.lib.CALLER_ID_DIGITS_CA = 10;          // Exact number of digits in a Canadian caller ID (same as U.S.)
adacare.lib.CALLER_ID_DIGITS_GB = 0;           // Variable number of digits in a UK caller ID
adacare.lib.CALLER_ID_DIGITS_GI = 8;           // Exact number of digits in a Gibraltar caller ID
adacare.lib.CALLER_ID_DIGITS_MT = 8;           // Exact number of digits in a Malta caller ID
adacare.lib.CALLER_ID_DIGITS_US = 10;          // Exact number of digits in a U.S. caller ID

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set up the handler for changes to a birthdate field. The companion age field must be a <span>.

adacare.lib.handleBirthdateField = function (birthdatefieldID, agefieldID) {
    'use strict';

    var $birthdatefield;

    if (agefieldID.length > 0) {

        $birthdatefield = $('#' + birthdatefieldID);
        adacare.lib.handleBirthdateFieldChange(birthdatefieldID, agefieldID);
        $birthdatefield.change(function () { adacare.lib.handleBirthdateFieldChange(birthdatefieldID, agefieldID); });
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle changes to a birthdate field. In particular, we display the age (from today) in the
// companion age field (which must be a <span>).

adacare.lib.handleBirthdateFieldChange = function (birthdatefieldID, agefieldID) {
    'use strict';

    var $birthdatefield, $agefield;
    var birthdateStr;
    var newDate;

    $birthdatefield = $('#' + birthdatefieldID);
    $agefield = $('#' + agefieldID);

    birthdateStr = adacare.lib.stringTrim($birthdatefield.val());

    if (birthdateStr !== '' && adacare.validateBirthdate(birthdateStr, $birthdatefield[0])) {

        newDate = adacare.lib.parseDateLocalized(adacare.lib.countryAbbr, birthdateStr);
        $agefield.text(adacare.lib.formatAge(newDate));
    }
    else {

        $agefield.text('');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set up the handler for changes to a checkbox field. The companion text field is displayed with the
// text for "on" or "off" depending on the whether the checkbox is checked or not. The text fields
// must each be a <span>.

adacare.lib.handleCheckBoxField = function (checkboxFieldID, textFieldID, textOn, textOff) {
    'use strict';

    var $checkboxField;

    $checkboxField = $('#' + checkboxFieldID);
    adacare.lib.handleCheckBoxFieldChange(checkboxFieldID, textFieldID, textOn, textOff);
    $checkboxField.change(function () { adacare.lib.handleCheckBoxFieldChange(checkboxFieldID, textFieldID, textOn, textOff); });
};

adacare.lib.handleCheckBoxFieldChange = function (checkboxFieldID, textFieldID, textOn, textOff) {
    'use strict';

    var $textField;
    var checked;

    checked = $('#' + checkboxFieldID).is(':checked');
    $textField = $('#' + textFieldID);
    $textField.text(checked ? textOn : textOff);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given a birthdate, return the age as "xxx years old."

adacare.lib.formatAge = function (birthdate) {
    'use strict';

    var basedate, yearsDiff;
    var ageString;

    basedate = new Date();
    yearsDiff = adacare.lib.calcAge(birthdate, basedate);
    ageString = (yearsDiff === 1 ? yearsDiff + ' year old' : yearsDiff + ' years old');

    return ageString;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given two dates, calculate the age difference in years.

adacare.lib.calcAge = function (birthdate, basedate) {
    'use strict';

    var birthY, birthM, birthD;
    var baseY, baseM, baseD;
    var yearsDiff;

    birthY = birthdate.getFullYear();
    birthM = birthdate.getMonth();
    birthD = birthdate.getDate();

    baseY = basedate.getFullYear();
    baseM = basedate.getMonth();
    baseD = basedate.getDate();

    yearsDiff = baseY - birthY;

    // Adjust the years if the birthdate hasn't yet come this year. For example, if the birthdate
    // is July 1, subtract a year if the basedate month and day is earlier than the birth date
    // month and day.

    if ((baseM < birthM) || ((baseM === birthM) && (baseD <= birthD))) {
        yearsDiff--;
    }

    return yearsDiff;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set up the handler for changes to a telephone number field. The companion caller ID field is 
// optional.
//
// Tip: To attach this handler to a field within an UpdatePanel, this function should be invoked by
// this Ajax code: 
//
// Sys.WebForms.PageRequestManager.getInstance().add_endRequest(function () { adacare.lib.handleTelephoneField(x, y, z); });
//
// Otherwise, the handler will be lost when the UpdatePanel is updated.

adacare.lib.handleTelephoneField = function (telephoneFieldID, callerIDFieldID) {
    'use strict';

    var $telephoneField, $callerIDField;

    $telephoneField = $('#' + telephoneFieldID);
    //adacare.lib.handleTelephoneFieldChange(countryAbbr, telephoneFieldID, callerIDFieldID);
    $telephoneField.change(function () { adacare.lib.handleTelephoneFieldChange(telephoneFieldID, callerIDFieldID); });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle changes to a telephone field. In particular, we display the nice, formatted telephone number,
// and copy it into the caller ID field. Note that caller ID field is optional.

adacare.lib.handleTelephoneFieldChange = function (telephoneFieldID, callerIDFieldID) {
    'use strict';

    var $telephoneField, $callerIDField;
    var telephoneStr, telephoneDigits;
    var countryAbbr;

    $telephoneField = $('#' + telephoneFieldID);
    countryAbbr = $telephoneField.attr("countryid");
    telephoneStr = adacare.lib.formatPhoneLocalized(countryAbbr, $telephoneField.val());

    $telephoneField.val(telephoneStr);

    if (callerIDFieldID && callerIDFieldID.length > 0) {

        // Optionally copy the phone number into the caller ID field if the caller ID field
        // is empty. We're also strict about making sure the original phone number is valid.

        $callerIDField = $('#' + callerIDFieldID);

        if ($callerIDField.length > 0 && $callerIDField.val().length == 0) {

            telephoneDigits = adacare.lib.stringCleanDigits(telephoneStr);

            switch (countryAbbr) {
                case adacare.lib.COUNTRY_ABBR_AU:
                    if (telephoneDigits.length == adacare.lib.CALLER_ID_DIGITS_AU) {
                        $callerIDField.val(telephoneStr)
                    }
                    break;

                case adacare.lib.COUNTRY_ABBR_CA:
                    if (telephoneDigits.length == adacare.lib.CALLER_ID_DIGITS_CA) {
                        $callerIDField.val(telephoneStr)
                    }
                    break;

                case adacare.lib.COUNTRY_ABBR_GB:
                    // GB telephone numbers are variable, so we can't test for that. Just accept it as-is.
                    $callerIDField.val(telephoneStr)
                    break;

                case adacare.lib.COUNTRY_ABBR_GI:
                    if (telephoneDigits.length == adacare.lib.CALLER_ID_DIGITS_GI) {
                        $callerIDField.val(telephoneStr)
                    }
                    break;

                case adacare.lib.COUNTRY_ABBR_MT:
                    if (telephoneDigits.length == adacare.lib.CALLER_ID_DIGITS_MT) {
                        $callerIDField.val(telephoneStr)
                    }
                    break;

                case adacare.lib.COUNTRY_ABBR_US:
                default:
                    if (telephoneDigits.length == adacare.lib.CALLER_ID_DIGITS_US) {
                        $callerIDField.val(telephoneStr)
                    }
                    break;
            }
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Format a telephone number into a nice string. Note that the result should be the same as the
// Utility.FormatPhoneLocalized() function.

adacare.lib.formatPhoneLocalized = function (countryAbbr, origPhone) {
    'use strict';

    var formattedPhone;

    switch (countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU:
            formattedPhone = adacare.lib.formatPhoneAU(origPhone);
            break;

        case adacare.lib.COUNTRY_ABBR_GB:
            formattedPhone = adacare.lib.formatPhoneGB(origPhone);
            break;

        case adacare.lib.COUNTRY_ABBR_GI:
            formattedPhone = adacare.lib.formatPhoneGI(origPhone);
            break;

        case adacare.lib.COUNTRY_ABBR_MT:
            formattedPhone = adacare.lib.formatPhoneMT(origPhone);
            break;

        case adacare.lib.COUNTRY_ABBR_CA:
        case adacare.lib.COUNTRY_ABBR_US:
        default:
            formattedPhone = adacare.lib.formatPhoneUS(origPhone);
            break;
    }

    return formattedPhone;
};

// Australia telephone format 
//
// All telephone numbers in Australia are 10 digits with leading zero.
// The spacing between digits is variable.

adacare.lib.formatPhoneAU = function (origPhone) {
    'use strict';

    var prefix2, prefix4;
    var cleanedPhone, formattedPhone = '';

    cleanedPhone = adacare.lib.stringTrim(origPhone);

    if (cleanedPhone.length > 0) {

        cleanedPhone = adacare.lib.stringCleanDigits(cleanedPhone);

        // Make sure the phone number begins with "0"

        if (cleanedPhone.length > 0 && cleanedPhone.charAt(0) !== '0') {

            cleanedPhone = "0" + cleanedPhone;
        }

        // Default in case no pattern matches

        formattedPhone = cleanedPhone;

        if (cleanedPhone.length === 10) {

            prefix2 = cleanedPhone.substring(0, 2);
            prefix4 = cleanedPhone.substring(0, 4);

            // Data number format (probably not used for voice lines): 0999 999 999

            if (prefix4 === '0198') {

                formattedPhone = cleanedPhone.substring(0, 4) + ' ' + cleanedPhone.substring(4, 7) + ' ' + cleanedPhone.substring(7, 10);
            }

                // Mobile phone format: 0999 999 999

            else if (prefix2 === '04' || (prefix2 === '05' && prefix4 !== '0550')) {

                formattedPhone = cleanedPhone.substring(0, 4) + ' ' + cleanedPhone.substring(4, 7) + ' ' + cleanedPhone.substring(7, 10);
            }

                // All other formats: 09 9999 9999

            else {

                formattedPhone = cleanedPhone.substring(0, 2) + ' ' + cleanedPhone.substring(2, 6) + ' ' + cleanedPhone.substring(6, 10);
            }
        }
    }

    return formattedPhone;
};

// UK telephone format
//
// Reference: http://www.area-codes.org.uk/formatting.php
// 
// Here's the basic idea: UK phone number start with "0", followed by an area code,
// followed by the local number. There should be a space after the area code, and
// there may (or may not) be a space within the local number.
//
// Example: 0203 372 4508 -- "0203" is the area code, and "372 4508" is the local number.

adacare.lib.formatPhoneGB = function (origPhone) {
    'use strict';

    var phoneinfo = [
                { Prefix: "01", TotalLength: 10, AreacodeLength: 5, LocalSpaceAt: 0 },
                { Prefix: "01", TotalLength: 11, AreacodeLength: 5, LocalSpaceAt: 0 },
                { Prefix: "011", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0101", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0121", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0131", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0141", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0151", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0161", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0171", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0181", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "0191", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "013873", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "015242", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "015394", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "015395", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "015396", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "016973", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "016974", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "016977", TotalLength: 10, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "016977", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "017683", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "017684", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "017687", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "019467", TotalLength: 11, AreacodeLength: 6, LocalSpaceAt: 0 },
                { Prefix: "02", TotalLength: 11, AreacodeLength: 3, LocalSpaceAt: 4 },
                { Prefix: "03", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "05", TotalLength: 11, AreacodeLength: 5, LocalSpaceAt: 0 },
                { Prefix: "0500", TotalLength: 10, AreacodeLength: 4, LocalSpaceAt: 0 },
                { Prefix: "07", TotalLength: 11, AreacodeLength: 5, LocalSpaceAt: 0 },
                { Prefix: "08", TotalLength: 10, AreacodeLength: 4, LocalSpaceAt: 0 },
                { Prefix: "08", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 },
                { Prefix: "09", TotalLength: 11, AreacodeLength: 4, LocalSpaceAt: 3 }
    ];

    var cleanedPhone, formattedPhone = '';
    var areacode, localNumber;
    var prefix;
    var totalLength, areacodeLength, localSpaceAt;
    var i;

    cleanedPhone = adacare.lib.stringTrim(origPhone);

    if (cleanedPhone.length > 0) {

        cleanedPhone = adacare.lib.stringCleanDigits(cleanedPhone);

        // Make sure the phone number begins with "0"

        if (cleanedPhone.length > 0 && cleanedPhone.charAt(0) !== '0') {

            cleanedPhone = "0" + cleanedPhone;
        }

        // Default in case no pattern matches

        formattedPhone = cleanedPhone;

        // Find the *last* match in the list.

        for (i = phoneinfo.length - 1; i >= 0; i--) {

            prefix = phoneinfo[i].Prefix;
            totalLength = phoneinfo[i].TotalLength;
            areacodeLength = phoneinfo[i].AreacodeLength;
            localSpaceAt = phoneinfo[i].LocalSpaceAt;

            if (cleanedPhone.length === totalLength
                && cleanedPhone.substring(0, prefix.length) === prefix) {

                areacode = cleanedPhone.substring(0, areacodeLength);
                localNumber = cleanedPhone.substring(areacodeLength, cleanedPhone.length);
                formattedPhone = areacode + ' '
                    + (localSpaceAt === 0
                    ? localNumber
                    : localNumber.substring(0, localSpaceAt) + ' ' + localNumber.substring(localSpaceAt, localNumber.length));
                break;
            }
        }
    }

    return formattedPhone;
};

// Gibraltar telephone format
//
// All telephone numbers in Gibraltar are 8 digits, 00000000. That said, some employees of
// of local businesses actually live in Spain, where 9-digit phone number are used.

adacare.lib.formatPhoneGI = function (origPhone) {
    'use strict';

    var COUNTRY_CODE_SPAIN = '34';
    var cleanedPhone, formattedPhone = '';

    cleanedPhone = adacare.lib.stringTrim(origPhone);

    if (cleanedPhone.length > 0) {

        cleanedPhone = adacare.lib.stringCleanDigits(cleanedPhone);

        // Normally, Gibraltar numbers are prefixed with 200 + the 5-digit number. We've 
        // also seen examples of 540 + 5-digit number, but the former is more common.

        if (cleanedPhone.length === 5) {

            cleanedPhone = '200' + cleanedPhone;
        }

        // Default in case no pattern matches

        formattedPhone = cleanedPhone;

        // Phone numbers in Spain.

        if (cleanedPhone.length === 11 && cleanedPhone.substring(0, 2) === COUNTRY_CODE_SPAIN) {

            formattedPhone = cleanedPhone.substring(0, 2) + ' ' + cleanedPhone.substring(2, 11);
        }
    }

    return formattedPhone;
};

// Malta telephone format
//
// All telephone numbers in Malta are 8 digits, 0000 0000.

adacare.lib.formatPhoneMT = function (origPhone) {
    'use strict';

    var cleanedPhone, formattedPhone = '';

    cleanedPhone = adacare.lib.stringTrim(origPhone);

    if (cleanedPhone.length > 0) {

        cleanedPhone = adacare.lib.stringCleanDigits(cleanedPhone);

        // Default in case no pattern matches

        formattedPhone = cleanedPhone;

        // Phone numbers in Spain.

        if (cleanedPhone.length === 8) {

            formattedPhone = cleanedPhone.substring(0, 4) + ' ' + cleanedPhone.substring(4, 8);
        }
    }

    return formattedPhone;
};

// US telephone format (always should be 000-000-0000, but we handle other formats as well)

adacare.lib.formatPhoneUS = function (origPhone) {
    'use strict';

    var cleanedPhone, formattedPhone = '';

    cleanedPhone = adacare.lib.stringTrim(origPhone);

    if (cleanedPhone.length > 0) {

        cleanedPhone = adacare.lib.stringCleanDigits(cleanedPhone);

        if (cleanedPhone.length === 7) { // 000-0000

            formattedPhone = cleanedPhone.substring(0, 3) + '-' + cleanedPhone.substring(3, 7);
        }
        else if (cleanedPhone.length === 10) { // 000-000-0000

            formattedPhone = cleanedPhone.substring(0, 3) + '-' + cleanedPhone.substring(3, 6) + '-' + cleanedPhone.substring(6, 10);
        }
        else if (cleanedPhone.length > 10) { // 000-000-0000 000...

            formattedPhone = cleanedPhone.substring(0, 3) + '-' + cleanedPhone.substring(3, 6) + '-' + cleanedPhone.substring(6, 10) + ' ' + cleanedPhone.substring(10, cleanedPhone.length);
        }
        else {

            formattedPhone = cleanedPhone;
        }
    }

    return formattedPhone;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Clean a string, returning only the digits.

adacare.lib.stringCleanDigits = function (origStr) {
    'use strict';

    var newStr;

    newStr = origStr.replace(/\D+/g, '');

    return newStr;
};

