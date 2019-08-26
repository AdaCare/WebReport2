// Copyright 2010 by Neurosoftware, LLC.
//
// adacare.vsEditor.v1.9.js         Sandy Gettings              Revised 09/31/2011
//
// This code is used to edit a VisitSchedule record.
//
// Revisions:
// 2014-04-21 SG: Changes to support new v3.1 DatePicker.
// 2014-11-21 SG: Changes for days-of-week are Mon-Sun instead of Sun-Sat.
// 2016-04-26 SG: Changed web service class from "VisitScheduleServices" to "VisitServices".
// 2016-10-18 SG: Made the DOW list reflect when other subfreqs (weekdays, weekends, etc.) are selected.
// 2016-10-30 SG: Fixed bug in DOW changes above.
// 2017-10-17 SG: Renamed "weekly" to "biweekly," and "daily" to "every week."

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== "object") { throw new Error("adacare is already defined, but is not an object!"); }

if (!adacare.vsEditor) { adacare.vsEditor = {}; }
else { throw new Error("adacare.vsEditor is already defined!"); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables: element IDs of fields passed from the server code. These are used to pass
// parameters between the server and client code.

// Array of parameter objects. This list is ued to store a set of parameters for each instance of
// the editor that has been initialized. The index into the array is the ID of the surrounding DIV.

adacare.vsEditor.VSEParmArray = [];

// Element names of local fields. The name attribute is used to select all related
// fields at one time. Very convenient in jQuery.
// (Remember: each DOM element can have both an ID and a name - they are different!)

//adacare.vsEditor.frequencyName = 'Frequency';                                 // All Frequency radio buttons start with the same name
adacare.vsEditor.subfrequencyEveryWeekNameBase = 'SubfrequencyEveryWeek';       // All EveryWeek Subfrequency radio buttons start with the same name
adacare.vsEditor.subfrequencyBiweeklyNameBase = 'SubfrequencyBiweekly';         // All Weekly Subfrequency radio buttons start with the same name
adacare.vsEditor.subfrequencyMonthlyNameBase = 'SubfrequencyMonthly';           // All Monthly Subfrequency radio buttons start with the same name
adacare.vsEditor.subfrequencyYearlyNameBase = 'SubfrequencyYearly';             // All Yearly Subfrequency radio buttons start with the same name
//adacare.vsEditor.intervalName = 'Interval';                                   // All Interval text fields share the same name
adacare.vsEditor.subfrequencyEveryWeekDOWName = 'SubfrequencyEveryWeekDOW';     // All "every week" days of week buttons share the same name
adacare.vsEditor.subfrequencyBiweeklyDOWName = 'SubfrequencyBiweeklyDOW';       // All "biweekly" days of week buttons share the same name

// Character index into server-side subfrequency list. Each character represents
// the subfrequency for one frequency.

adacare.vsEditor.subfrequencyEveryWeekIndex = 0;
adacare.vsEditor.subfrequencyBiweeklyIndex = 1;
adacare.vsEditor.subfrequencyMonthlyIndex = 2;
adacare.vsEditor.subfrequencyYearlyIndex = 3;

// Constants.

adacare.vsEditor.FREQUENCY_ONCE = '1';
adacare.vsEditor.FREQUENCY_EVERY_WEEK = 'E';
adacare.vsEditor.FREQUENCY_BIWEEKLY = 'B';
adacare.vsEditor.FREQUENCY_MONTHLY = 'M';
adacare.vsEditor.FREQUENCY_YEARLY = 'Y';

// Subfrequency codes for "every week." 

adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_DAY = 'E';
adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_N_DAYS = 'N';
adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_WEEKDAY = 'D';
adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_WEEKENDDAY = 'S';
adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_DOWLIST = 'L';

// Subfrequency codes for "biweekly."

adacare.vsEditor.SUBFREQUENCY_BIWEEKLY_EVERY_N_WEEKS = 'N';
adacare.vsEditor.SUBFREQUENCY_BIWEEKLY_EVERY_DOWLIST = 'L';

// Subfrequency codes for "monthly."

adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_MONTHS = 'N';
adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_ORDINAL = 'O';

// Subfrequency codes for "yearly."

adacare.vsEditor.SUBFREQUENCY_YEARLY_EVERY_N_YEARS = 'N';

adacare.vsEditor.DOW_ON = 'vseditor_dow_button_on';       // Class to signify DOW button is on
adacare.vsEditor.DOW_OFF = 'vseditor_dow_button_off';     // Class to signify DOW button is off

// The array is a mask for each day of the week, in the order of the buttons.
// Sun=0x01, Mon=0x02, Tue=0x04, ...
//
// Also, define the masks for several commonly-used combinations of days.

adacare.vsEditor.DOW_BUTTON_MASK = [0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x01];
adacare.vsEditor.DOW_BUTTON_MASK_EVERY_DAY = 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x40 + 0x01;
adacare.vsEditor.DOW_BUTTON_MASK_EVERY_WEEKDAY = 0x02 + 0x04 + 0x08 + 0x10 + 0x20 + 0x00 + 0x00;
adacare.vsEditor.DOW_BUTTON_MASK_EVERY_WEEKENDDAY = 0x00 + 0x00 + 0x00 + 0x00 + 0x00 + 0x40 + 0x01;

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the basic parameters.

adacare.vsEditor.init = function (
    surroundDivServerID, frequencyEveryWeekDivID, frequencyBiweeklyDivID, frequencyMonthlyDivID, frequencyYearlyDivID, thruDateDivID,
    startDateServerID, frequencyServerName, subfrequencyListServerID, frequencyOrdinalServerID, frequencyOrdinalKindServerID,
    intervalServerID, intervalEveryWeekServerID, intervalBiweeklyServerID, intervalBiweekly2ServerID, intervalMonthlyServerID, intervalMonthly2ServerID, intervalYearlyServerID,
    daysOfWeekServerID,
    frequencyStringServerID) {
    'use strict';

    var interval, VSEParm;
    var frequency, subfrequency;
    var $radioButtList;

    VSEParm = adacare.vsEditor.getVSEParm(surroundDivServerID);

    if (VSEParm === undefined) {
        VSEParm = new adacare.vsEditor.VSEParm(surroundDivServerID);
        adacare.vsEditor.VSEParmArray[VSEParm.surroundID] = VSEParm;

        VSEParm.surroundDivServerID = surroundDivServerID;
        //VSEParm.frequencyOnceDivID = frequencyOnceDivID; // Trivial case: Not needed, as this one doesn't have a DIV
        VSEParm.frequencyEveryWeekDivID = frequencyEveryWeekDivID;
        VSEParm.frequencyBiweeklyDivID = frequencyBiweeklyDivID;
        VSEParm.frequencyMonthlyDivID = frequencyMonthlyDivID;
        VSEParm.frequencyYearlyDivID = frequencyYearlyDivID;
        VSEParm.thruDateDivID = thruDateDivID;
        VSEParm.startDateServerID = startDateServerID;
        VSEParm.frequencyServerName = frequencyServerName;
        VSEParm.subfrequencyListServerID = subfrequencyListServerID;
        VSEParm.frequencyOrdinalServerID = frequencyOrdinalServerID;
        VSEParm.frequencyOrdinalKindServerID = frequencyOrdinalKindServerID;
        VSEParm.intervalServerID = intervalServerID;
        VSEParm.intervalEveryWeekServerID = intervalEveryWeekServerID;
        VSEParm.intervalBiweeklyServerID = intervalBiweeklyServerID;
        VSEParm.intervalBiweekly2ServerID = intervalBiweekly2ServerID;
        VSEParm.intervalMonthlyServerID = intervalMonthlyServerID;
        VSEParm.intervalMonthly2ServerID = intervalMonthly2ServerID;
        VSEParm.intervalYearlyServerID = intervalYearlyServerID;
        VSEParm.daysOfWeekServerID = daysOfWeekServerID;
        VSEParm.frequencyStringServerID = frequencyStringServerID;

        VSEParm.subfrequencyEveryWeekName = VSEParm.surroundDivServerID + '_' + adacare.vsEditor.subfrequencyEveryWeekNameBase;
        VSEParm.subfrequencyBiweeklyName = VSEParm.surroundDivServerID + '_' + adacare.vsEditor.subfrequencyBiweeklyNameBase;
        VSEParm.subfrequencyMonthlyName = VSEParm.surroundDivServerID + '_' + adacare.vsEditor.subfrequencyMonthlyNameBase;
        VSEParm.subfrequencyYearlyName = VSEParm.surroundDivServerID + '_' + adacare.vsEditor.subfrequencyYearlyNameBase;
    }

    // We need to make up a unique name for each set of radio buttons, for each instance
    // of a vsEditor on a page. If you have, say, two sets of radio buttons with the same
    // name, then turning on a button in one set turns off all the other buttons in *both*
    // sets.
    //
    // To avoid this problem, we rename each set of radio buttons with a name that is
    // unique to each instance of vsEditor.

    $radioButtList = $('#' + VSEParm.frequencyEveryWeekDivID + ' [name="' + adacare.vsEditor.subfrequencyEveryWeekNameBase + '"]');
    $radioButtList.attr('name', VSEParm.subfrequencyEveryWeekName);

    $radioButtList = $('#' + VSEParm.frequencyBiweeklyDivID + ' [name="' + adacare.vsEditor.subfrequencyBiweeklyNameBase + '"]');
    $radioButtList.attr('name', VSEParm.subfrequencyBiweeklyName);

    $radioButtList = $('#' + VSEParm.frequencyMonthlyDivID + ' [name="' + adacare.vsEditor.subfrequencyMonthlyNameBase + '"]');
    $radioButtList.attr('name', VSEParm.subfrequencyMonthlyName);

    $radioButtList = $('#' + VSEParm.frequencyYearlyDivID + ' [name="' + adacare.vsEditor.subfrequencyYearlyNameBase + '"]');
    $radioButtList.attr('name', VSEParm.subfrequencyYearlyName);

    // Set all of the Interval fields to the same value.

    interval = $('#' + VSEParm.intervalServerID).val();
    adacare.vsEditor.setInterval(VSEParm, interval);

    // Set the Interval fields to only allow integer input.

    $('#' + VSEParm.intervalEveryWeekServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalBiweeklyServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalBiweekly2ServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalMonthlyServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalMonthly2ServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalYearlyServerID).keyfilter(/[\d]/);

    // Since most buttons are preset with special CSS classes, we have to remove the classes
    // for our special buttons.

    $('.' + adacare.vsEditor.DOW_ON + ',.' + adacare.vsEditor.DOW_OFF)
        .livequery(function () { $(this).removeClass('ui-state-default'); });

    // In some cases of subfrequencies, we want to set the DOW list to match.

    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();
    subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyEveryWeekIndex);
    adacare.vsEditor.setImpliedDaysOfWeek(VSEParm, frequency, subfrequency);
    adacare.vsEditor.displayFields(VSEParm);

    // Set event handlers to update fields when clicked or text is changed

    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.frequencyServerName + '"]').click(adacare.vsEditor.clickedFrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.subfrequencyEveryWeekName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.subfrequencyBiweeklyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.subfrequencyMonthlyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.subfrequencyYearlyName + '"]').click(adacare.vsEditor.clickedSubfrequency);

    $('#' + VSEParm.intervalEveryWeekServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalBiweeklyServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalBiweekly2ServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalMonthlyServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalMonthly2ServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalYearlyServerID).change(adacare.vsEditor.changedInterval);

    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyEveryWeekDOWName + '"]').unbind().click(adacare.vsEditor.clickedEveryWeekDOW);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyBiweeklyDOWName + '"]').unbind().click(adacare.vsEditor.clickedBiweeklyDOW);
    $('#' + VSEParm.frequencyOrdinalServerID).change(adacare.vsEditor.changedFrequencyOrdinal);
    $('#' + VSEParm.frequencyOrdinalKindServerID).change(adacare.vsEditor.changedFrequencyOrdinal);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEParm.

adacare.vsEditor.VSEParm = function (surroundID) {
    'use strict';

    this.surroundID = surroundID;
    this.wsCallCount = 0;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given the surrounding DIV ID as the index, return the corresponding VSEParm. If it doesn't exist,
// then return null.

adacare.vsEditor.getVSEParm = function (surroundID) {
    'use strict';

    var VSEParm;

    VSEParm = adacare.vsEditor.VSEParmArray[surroundID];

    return VSEParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given a DOM element, return it's VSEParm. If it doesn't exist, then return null.
//
// This function works by seeing which VSEParm describes the DIV surrounding given element. Beware
// that the element may not have an ID, so we can't depend on that info in our test. The code below
// seems to work in all cases.

adacare.vsEditor.findVSEParm = function (elem) {
    'use strict';

    var VSEParm, surroundID, isParent;

    for (surroundID in adacare.vsEditor.VSEParmArray) {
        isParent = $(elem).parents().is('#' + surroundID);
        if (isParent) {
            VSEParm = adacare.vsEditor.VSEParmArray[surroundID];
            break;
        }
    }
    return VSEParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Get and set the Nth subfrequency code. The server-side variable that hold the subfrequency list
// is a single-character code for each frequency. When we get or set, we only look at the subfrequency
// code for the current frequency.
//
// The subfrequency list is one character for each frequency. Getting or setting the subfrequency
// just gets/sets that single character within the list. For example, the "EveryWeek" frequency is the
// first (index=0) character, and this character says whether the subfrequency is every day, weekdays,
// weekends, and so forth.

adacare.vsEditor.getSubfrequency = function (VSEParm, index) {
    'use strict';

    var subfrequencyList;
    var subfrequency;

    subfrequencyList = $('#' + VSEParm.subfrequencyListServerID).val();
    subfrequency = subfrequencyList.charAt(index);

    return subfrequency;
};

adacare.vsEditor.setSubfrequency = function (VSEParm, index, subfrequency) {
    'use strict';

    var subfrequencyList;

    subfrequencyList = String($('#' + VSEParm.subfrequencyListServerID).val());
    subfrequencyList = subfrequencyList.substr(0, index) + subfrequency + subfrequencyList.substr(index + 1);
    $('#' + VSEParm.subfrequencyListServerID).val(subfrequencyList);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the Interval to the same value on the server-side variable and all screen fields.

adacare.vsEditor.setInterval = function (VSEParm, interval) {
    'use strict';

    $('#' + VSEParm.intervalServerID).val(interval);
    $('#' + VSEParm.intervalEveryWeekServerID).val(interval);
    $('#' + VSEParm.intervalBiweeklyServerID).val(interval);
    $('#' + VSEParm.intervalBiweekly2ServerID).val(interval);
    $('#' + VSEParm.intervalMonthlyServerID).val(interval);
    $('#' + VSEParm.intervalMonthly2ServerID).val(interval);
    $('#' + VSEParm.intervalYearlyServerID).val(interval);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the DOW to match certain cases of the "every week" subfrequency.

adacare.vsEditor.setImpliedDaysOfWeek = function (VSEParm, frequency, subfrequency) {
    'use strict';

    // Set the DOW list to match the subfrequency. This is just for appearance's sake,
    // to be clearer to the user.

    if (frequency === adacare.vsEditor.FREQUENCY_EVERY_WEEK) {

        switch (subfrequency) {

            case adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_DAY:
                $('#' + VSEParm.daysOfWeekServerID).val(adacare.vsEditor.DOW_BUTTON_MASK_EVERY_DAY);
                break;

            case adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_WEEKDAY:
                $('#' + VSEParm.daysOfWeekServerID).val(adacare.vsEditor.DOW_BUTTON_MASK_EVERY_WEEKDAY);
                break;

            case adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_WEEKENDDAY:
                $('#' + VSEParm.daysOfWeekServerID).val(adacare.vsEditor.DOW_BUTTON_MASK_EVERY_WEEKENDDAY);
                break;
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the Frequency radio buttons.

adacare.vsEditor.clickedFrequency = function () {
    'use strict';

    var VSEParm, frequency, subfrequency;

    VSEParm = adacare.vsEditor.findVSEParm(this);

    // If the user clicked the EveryWeek frequency, we'll set the DOW to the implied values.

    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();

    if (frequency === adacare.vsEditor.FREQUENCY_EVERY_WEEK) {

        subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyEveryWeekIndex);
        adacare.vsEditor.setImpliedDaysOfWeek(VSEParm, frequency, subfrequency);
    }

    adacare.vsEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the Subfrequency radio buttons by updating the server-side variables.

adacare.vsEditor.clickedSubfrequency = function () {
    'use strict';

    var VSEParm, frequency, subfrequency, index;

    VSEParm = adacare.vsEditor.findVSEParm(this);
    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();
    subfrequency = $(this).val();

    switch (frequency) {
        case adacare.vsEditor.FREQUENCY_EVERY_WEEK:
            index = adacare.vsEditor.subfrequencyEveryWeekIndex;
            adacare.vsEditor.setImpliedDaysOfWeek(VSEParm, frequency, subfrequency);
            break;

        case adacare.vsEditor.FREQUENCY_BIWEEKLY:
            index = adacare.vsEditor.subfrequencyBiweeklyIndex;
            break;

        case adacare.vsEditor.FREQUENCY_MONTHLY:
            index = adacare.vsEditor.subfrequencyMonthlyIndex;
            break;

        case adacare.vsEditor.FREQUENCY_YEARLY:
            index = adacare.vsEditor.subfrequencyYearlyIndex;
            break;

        default:
            index = -1;
            break;
    }

    if (index >= 0) {
        adacare.vsEditor.setSubfrequency(VSEParm, index, subfrequency);
    }

    adacare.vsEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the days of week buttons by toggling the on/off status.

adacare.vsEditor.clickedEveryWeekDOW = function () {
    'use strict';

    adacare.vsEditor.clickedAnyDOW(this, adacare.vsEditor.subfrequencyEveryWeekDOWName, adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_DOWLIST, adacare.vsEditor.subfrequencyEveryWeekIndex);
};

adacare.vsEditor.clickedBiweeklyDOW = function () {
    'use strict';

    adacare.vsEditor.clickedAnyDOW(this, adacare.vsEditor.subfrequencyBiweeklyDOWName, adacare.vsEditor.SUBFREQUENCY_BIWEEKLY_EVERY_DOWLIST, adacare.vsEditor.subfrequencyBiweeklyIndex);
};

adacare.vsEditor.clickedAnyDOW = function (elem, subfrequencyDOWName, subfrequency, subfrequencyIndex) {
    'use strict';

    var VSEParm;
    var daysOfWeek;
    var $buttonElem, buttonIndex, buttonMask, buttonMatched;

    VSEParm = adacare.vsEditor.findVSEParm(elem);

    // Since all of the DOW button clicks come here, we have to figure out which one was clicked.
    // Examine each of the DOW buttons that belong to us, and compare it to the one that was clicked.
    // If we find a match, then we invert the on/off state and save it back tot her server-side variable.

    for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {
        $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + subfrequencyDOWName + '"]:eq(' + buttonIndex + ')');
        buttonMatched = ($buttonElem[0] === elem);

        if (buttonMatched) {

            // Changed 11/21/14 SG
            //buttonMask = (1 << buttonIndex);
            buttonMask = adacare.vsEditor.DOW_BUTTON_MASK[buttonIndex];

            //daysOfWeek = new Number($('#' + VSEParm.daysOfWeekServerID).val());   // not so good - creates a new object
            //daysOfWeek = Number($('#' + VSEParm.daysOfWeekServerID).val());       // ok
            daysOfWeek = parseInt($('#' + VSEParm.daysOfWeekServerID).val(), 10);   // best

            // Invert the masked bit, and save it back into the server-side variable.

            daysOfWeek = (daysOfWeek ^ buttonMask);
            $('#' + VSEParm.daysOfWeekServerID).val(daysOfWeek);
            break;
        }
    }

    // Auto-select the subfrequency for the days-of-week.

    adacare.vsEditor.setSubfrequency(VSEParm, subfrequencyIndex, subfrequency);
    adacare.vsEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changing any of the Interval text fields.
//
// Get the text value from the Interval field, and stuff it into the hidden field passed
// from the server-side caller.

adacare.vsEditor.changedInterval = function () {
    'use strict';

    var VSEParm, id;
    //var frequency;
    var interval;
    var subfrequency, subfrequencyIndex;

    VSEParm = adacare.vsEditor.findVSEParm(this);
    id = $(this).attr('id');
    interval = $(this).val();
    //frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();

    // Guard against empty or zero for input

    interval = adacare.lib.stringTrim(interval);
    if (interval === '' || Number(interval) === 0) {
        interval = 1;
        $(this).val(interval);
    }

    // Save the Interval to the server-side variables, and copy it into all of the screen fields.

    adacare.vsEditor.setInterval(VSEParm, interval);

    // Auto-select the subfrequency for the interval.

    switch (id) {
        case VSEParm.intervalEveryWeekServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_EVERY_WEEK_EVERY_N_DAYS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyEveryWeekIndex;
            break;

        case VSEParm.intervalBiweeklyServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_BIWEEKLY_EVERY_N_WEEKS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyBiweeklyIndex;
            break;

        case VSEParm.intervalBiweekly2ServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_BIWEEKLY_EVERY_DOWLIST;
            subfrequencyIndex = adacare.vsEditor.subfrequencyBiweeklyIndex;
            break;

        case VSEParm.intervalMonthlyServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_MONTHS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyMonthlyIndex;
            break;

        case VSEParm.intervalMonthly2ServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_ORDINAL;
            subfrequencyIndex = adacare.vsEditor.subfrequencyMonthlyIndex;
            break;

        case VSEParm.intervalYearlyServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_YEARLY_EVERY_N_YEARS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyYearlyIndex;
            break;

        default:
            subfrequencyIndex = -1;
            break;
    }

    if (subfrequencyIndex >= 0) {
        adacare.vsEditor.setSubfrequency(VSEParm, subfrequencyIndex, subfrequency);
    }

    adacare.vsEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changing of the FrequencyOrdinal and FrequencyOrdinalKind controls.

adacare.vsEditor.changedFrequencyOrdinal = function () {
    'use strict';

    var VSEParm;
    var subfrequency, subfrequencyIndex;

    // Auto-select the subfrequency for the ordinal.

    VSEParm = adacare.vsEditor.findVSEParm(this);
    subfrequency = adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_ORDINAL;
    subfrequencyIndex = adacare.vsEditor.subfrequencyMonthlyIndex;
    adacare.vsEditor.setSubfrequency(VSEParm, subfrequencyIndex, subfrequency);

    adacare.vsEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the fields that the user sees.

adacare.vsEditor.displayFields = function (VSEParm) {
    'use strict';

    var frequency, subfrequency, daysOfWeek;
    var $subfreqelem;
    var $buttonElem, buttonIndex, buttonMask;
    var buttonIsOn;

    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();
    daysOfWeek = $('#' + VSEParm.daysOfWeekServerID).val();

    // Hide all of the frequency detail DIVs, and then show only the one of interest.
    // Within the DIV of interest, init all of its fields.

    $('#' + VSEParm.frequencyEveryWeekDivID).hide();
    $('#' + VSEParm.frequencyBiweeklyDivID).hide();
    $('#' + VSEParm.frequencyMonthlyDivID).hide();
    $('#' + VSEParm.frequencyYearlyDivID).hide();
    $('#' + VSEParm.thruDateDivID).hide();

    switch (frequency) {

        case adacare.vsEditor.FREQUENCY_ONCE:

            // Nothing to do for this trivial case.
            break;

        case adacare.vsEditor.FREQUENCY_EVERY_WEEK:

            $('#' + VSEParm.frequencyEveryWeekDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyEveryWeekIndex);
            $subfreqelem = $('[name="' + VSEParm.subfrequencyEveryWeekName + '"]').filter('[value="' + subfrequency + '"]');
            $subfreqelem.prop('checked', true);

            // Display the days of week buttons on/off status

            daysOfWeek = parseInt($('#' + VSEParm.daysOfWeekServerID).val(), 10);

            for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {

                // Changed 11/21/14 SG
                //buttonMask = (1 << buttonIndex);
                buttonMask = adacare.vsEditor.DOW_BUTTON_MASK[buttonIndex];
                buttonIsOn = (daysOfWeek & buttonMask);

                // Set the CSS class of the button to correspond with on/off

                $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyEveryWeekDOWName + '"]:eq(' + buttonIndex + ')');
                $buttonElem.removeClass(adacare.vsEditor.DOW_ON).removeClass(adacare.vsEditor.DOW_OFF);
                if (buttonIsOn) {
                    $buttonElem.addClass(adacare.vsEditor.DOW_ON);
                }
                else {
                    $buttonElem.addClass(adacare.vsEditor.DOW_OFF);
                }
            }
            break;

        case adacare.vsEditor.FREQUENCY_BIWEEKLY:

            $('#' + VSEParm.frequencyBiweeklyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyBiweeklyIndex);
            $subfreqelem = $('[name="' + VSEParm.subfrequencyBiweeklyName + '"]').filter('[value="' + subfrequency + '"]');
            $subfreqelem.prop('checked', true);

            // Display the days of week buttons on/off status

            daysOfWeek = parseInt($('#' + VSEParm.daysOfWeekServerID).val(), 10);

            for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {
                // Changed 11/21/14 SG
                //buttonMask = (1 << buttonIndex);
                buttonMask = adacare.vsEditor.DOW_BUTTON_MASK[buttonIndex];
                buttonIsOn = (daysOfWeek & buttonMask);

                // Set the CSS class of the button to correspond with on/off

                $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyBiweeklyDOWName + '"]:eq(' + buttonIndex + ')');
                $buttonElem.removeClass(adacare.vsEditor.DOW_ON).removeClass(adacare.vsEditor.DOW_OFF);
                if (buttonIsOn) {
                    $buttonElem.addClass(adacare.vsEditor.DOW_ON);
                }
                else {
                    $buttonElem.addClass(adacare.vsEditor.DOW_OFF);
                }
            }
            break;

        case adacare.vsEditor.FREQUENCY_MONTHLY:

            $('#' + VSEParm.frequencyMonthlyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyMonthlyIndex);
            $subfreqelem = $('#' + VSEParm.frequencyMonthlyDivID + ' [name="' + VSEParm.subfrequencyMonthlyName + '"]').filter('[value="' + subfrequency + '"]');
            $subfreqelem.prop('checked', true);
            break;

        case adacare.vsEditor.FREQUENCY_YEARLY:

            $('#' + VSEParm.frequencyYearlyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyYearlyIndex);
            $subfreqelem = $('#' + VSEParm.frequencyYearlyDivID + ' [name="' + VSEParm.subfrequencyYearlyName + '"]').filter('[value="' + subfrequency + '"]');
            $subfreqelem.prop('checked', true);
            break;
    }

    // Display the updated frequency string.

    adacare.vsEditor.displayFrequencyString(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web Service functions
//
// Update the FrequencyDisplay string. We pass the various frequency fields to the server, and ask
// for the server-generated string to display.

adacare.vsEditor.displayFrequencyString = function (VSEParm) {
    'use strict';

    var visitScheduleFrequency = new AdaCareWeb.WebServices.VisitScheduleFrequency();
    var startDate;
    var frequency, subfrequency, interval, daysOfWeek, frequencyOrdinal, frequencyOrdinalKind;

    // First, erase the current display. If you look at the HTML, you'll see a space (&nbsp;) placed
    // in the DIV that holds frequency string. It's there for a reason: Without the space, blanking
    // the string will cause the field to momentarily collapse, and make the display look jerky.

    $('#' + VSEParm.frequencyStringServerID).text('');

    // Pick up the fields into local variables for convenience.

    //startDate = new Date($('#' + VSEParm.startDateServerID).val());
    startDate = adacare.DatePickerV3.getDateByExternalCode(VSEParm.startDateServerID);
    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();

    switch (frequency) {
        case adacare.vsEditor.FREQUENCY_ONCE:
            // Nothing to do for this trivial case.
            subfrequency = '-';
            //interval = 1;
            break;

        case adacare.vsEditor.FREQUENCY_EVERY_WEEK:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyEveryWeekIndex);
            //interval = $('#' + adacare.vsEditor.intervalEveryWeekServerID).val();
            break;

        case adacare.vsEditor.FREQUENCY_BIWEEKLY:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyBiweeklyIndex);
            //interval = $('#' + adacare.vsEditor.intervalBiweeklyServerID).val();
            break;

        case adacare.vsEditor.FREQUENCY_MONTHLY:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyMonthlyIndex);
            //interval = $('#' + adacare.vsEditor.intervalMonthlyServerID).val();
            break;

        case adacare.vsEditor.FREQUENCY_YEARLY:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyYearlyIndex);
            //interval = $('#' + adacare.vsEditor.intervalYearlyServerID).val();
            break;
    }

    interval = $('#' + VSEParm.intervalServerID).val();
    daysOfWeek = $('#' + VSEParm.daysOfWeekServerID).val();
    frequencyOrdinal = $('#' + VSEParm.frequencyOrdinalServerID).val();
    frequencyOrdinalKind = $('#' + VSEParm.frequencyOrdinalKindServerID).val();

    // Copy the variables into the server's fields. If the form is submitted, the server-side
    // code will be able to see the current values.

    //$('#' + adacare.vsEditor.intervalServerID).val(interval);

    // Next, fill the outgoing parameter object with the frequency fields.

    visitScheduleFrequency.StartDate = adacare.lib.convertToUTC(startDate);
    visitScheduleFrequency.Frequency = frequency.charAt(0);
    visitScheduleFrequency.Subfrequency = subfrequency.charAt(0);
    visitScheduleFrequency.Interval = Number(interval);
    visitScheduleFrequency.FrequencyOrdinal = frequencyOrdinal.charAt(0);
    visitScheduleFrequency.FrequencyOrdinalKind = frequencyOrdinalKind.charAt(0);
    visitScheduleFrequency.DaysOfWeek = Number(daysOfWeek);

    // Go ask the server for the frequency string. This is an async call, so the
    // results will be returned via the functions below.

    VSEParm.wsCallCount++;
    AdaCareWeb.WebServices.VisitServices.FrequencyString(
        visitScheduleFrequency,
        adacare.vsEditor.displayFrequencyStringWSSuccess,
        adacare.vsEditor.displayFrequencyStringWSFailed,
        VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the frequency string returned from the server.

adacare.vsEditor.displayFrequencyStringWSSuccess = function (frequencyString, responseVSEParm) {
    'use strict';

    var currVSEParm;

    if (responseVSEParm !== null) {

        // Look at the current VSEParm and see what the current web service call count it has.
        // If it's the same as returned by the web service call, then we aren't running behind
        // and it's okay to display the returned frequencyString. Otherwise, we're probably
        // getting the responses out of order (a race condition), and we ignore the result.

        currVSEParm = adacare.vsEditor.getVSEParm(responseVSEParm.surroundDivServerID);

        if (currVSEParm !== null & responseVSEParm.wsCallCount === currVSEParm.wsCallCount) {

            $('#' + responseVSEParm.frequencyStringServerID).text(frequencyString);
        }
    }
};

adacare.vsEditor.displayFrequencyStringWSFailed = function (e) {
    'use strict';

    $('#' + adacare.vsEditor.frequencyStringServerID).text('(Not available - try again?)');
};
