// Copyright 2010 by Neurosoftware, LLC.
//
// adacare.vsEditor.v1.js         Sandy Gettings              Revised 01/01/2010
//
// This code is used to edit a VisitSchedule record.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) != "object") { throw new Error("adacare is already defined, but is not an object!"); }

if (!adacare.vsEditor) { adacare.vsEditor = {}; }
else { throw new Error("adacare.vsEditor is already defined!"); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables: element IDs of fields passed from the server code. These are used to pass
// parameters between the server and client code.

// Array of parameter objects. This list is ued to store a set of parameters for each instance of
// the editor that has been initialized. The index into the array is the ID of the surrounding DIV.

adacare.vsEditor.VSEParmArray = new Array();

// Element names of local fields. The name attribute is used to select all related
// fields at one time. Very convenient in jQuery.
// (Remember: each DOM element can have both an ID and a name - they are different!)

//adacare.vsEditor.frequencyName = 'Frequency';                         // All Frequency radio buttons share the same name
adacare.vsEditor.subfrequencyDailyName = 'SubfrequencyDaily';           // All Daily Subfrequency radio buttons share the same name
adacare.vsEditor.subfrequencyWeeklyName = 'SubfrequencyWeekly';         // All Weekly Subfrequency radio buttons share the same name
adacare.vsEditor.subfrequencyMonthlyName = 'SubfrequencyMonthly';       // All Monthly Subfrequency radio buttons share the same name
adacare.vsEditor.subfrequencyYearlyName = 'SubfrequencyYearly';         // All Yearly Subfrequency radio buttons share the same name
//adacare.vsEditor.intervalName = 'Interval';                           // All Interval text fields share the same name
adacare.vsEditor.subfrequencyDailyDOWName = 'SubfrequencyDailyDOW';     // All "daily" days of week buttons share the same name
adacare.vsEditor.subfrequencyWeeklyDOWName = 'SubfrequencyWeeklyDOW';   // All "weekly" days of week buttons share the same name

// Character index into server-side subfrequency list. Each character represents
// the subfrequency for one frequency.

adacare.vsEditor.subfrequencyDailyIndex = 0;
adacare.vsEditor.subfrequencyWeeklyIndex = 1;
adacare.vsEditor.subfrequencyMonthlyIndex = 2;
adacare.vsEditor.subfrequencyYearlyIndex = 3;

// Constants.

adacare.vsEditor.FREQUENCY_ONCE = '1';
adacare.vsEditor.FREQUENCY_DAILY = 'D';
adacare.vsEditor.FREQUENCY_WEEKLY = 'W';
adacare.vsEditor.FREQUENCY_MONTHLY = 'M';
adacare.vsEditor.FREQUENCY_YEARLY = 'Y';

adacare.vsEditor.SUBFREQUENCY_DAILY_EVERY_N_DAYS = 'N';
adacare.vsEditor.SUBFREQUENCY_DAILY_EVERY_DOWLIST = 'L';
adacare.vsEditor.SUBFREQUENCY_WEEKLY_EVERY_N_WEEKS = 'N';
adacare.vsEditor.SUBFREQUENCY_WEEKLY_EVERY_DOWLIST = 'L';
adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_MONTHS = 'N';
adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_ORDINAL = 'O';
adacare.vsEditor.SUBFREQUENCY_YEARLY_EVERY_N_YEARS = 'N';

adacare.vsEditor.DOW_ON = 'vseditor_dow_button_on';       // Class to signify DOW button is on
adacare.vsEditor.DOW_OFF = 'vseditor_dow_button_off';     // Class to signify DOW button is off

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the basic parameters.

adacare.vsEditor.init = function (
    surroundDivServerID, frequencyDailyDivID, frequencyWeeklyDivID, frequencyMonthlyDivID, frequencyYearlyDivID, thruDateDivID,
    startDateServerID, frequencyServerName, subfrequencyListServerID, frequencyOrdinalServerID, frequencyOrdinalKindServerID,
    intervalServerID, intervalDailyServerID, intervalWeeklyServerID, intervalWeekly2ServerID, intervalMonthlyServerID, intervalMonthly2ServerID, intervalYearlyServerID,
    daysOfWeekServerID,
    frequencyStringServerID) {

    var interval, VSEParm;

    VSEParm = adacare.vsEditor.getVSEParm(surroundDivServerID);

    if (VSEParm === undefined) {
        VSEParm = new adacare.vsEditor.VSEParm(surroundDivServerID);
        adacare.vsEditor.VSEParmArray[VSEParm.surroundID] = VSEParm;

        VSEParm.surroundDivServerID = surroundDivServerID;
        //VSEParm.frequencyOnceDivID = frequencyOnceDivID; // Trivial case: Not needed, as this one doesn't have a DIV
        VSEParm.frequencyDailyDivID = frequencyDailyDivID;
        VSEParm.frequencyWeeklyDivID = frequencyWeeklyDivID;
        VSEParm.frequencyMonthlyDivID = frequencyMonthlyDivID;
        VSEParm.frequencyYearlyDivID = frequencyYearlyDivID;
        VSEParm.thruDateDivID = thruDateDivID;
        VSEParm.startDateServerID = startDateServerID;
        //VSEParm.thruDateOpenEndedName = thruDateOpenEndedName; // TEST
        VSEParm.frequencyServerName = frequencyServerName;
        VSEParm.subfrequencyListServerID = subfrequencyListServerID;
        VSEParm.frequencyOrdinalServerID = frequencyOrdinalServerID;
        VSEParm.frequencyOrdinalKindServerID = frequencyOrdinalKindServerID;
        VSEParm.intervalServerID = intervalServerID;
        VSEParm.intervalDailyServerID = intervalDailyServerID;
        VSEParm.intervalWeeklyServerID = intervalWeeklyServerID;
        VSEParm.intervalWeekly2ServerID = intervalWeekly2ServerID;
        VSEParm.intervalMonthlyServerID = intervalMonthlyServerID;
        VSEParm.intervalMonthly2ServerID = intervalMonthly2ServerID;
        VSEParm.intervalYearlyServerID = intervalYearlyServerID;
        VSEParm.daysOfWeekServerID = daysOfWeekServerID;
        VSEParm.frequencyStringServerID = frequencyStringServerID;
    }

    // Set all of the Interval fields to the same value.

    interval = $('#' + VSEParm.intervalServerID).val();
    adacare.vsEditor.setInterval(VSEParm, interval);

    // Set the Interval fields to only allow integer input.

    $('#' + VSEParm.intervalDailyServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalWeeklyServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalWeekly2ServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalMonthlyServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalMonthly2ServerID).keyfilter(/[\d]/);
    $('#' + VSEParm.intervalYearlyServerID).keyfilter(/[\d]/);

    // Since most buttons are preset with special CSS classes, we have to remove the classes
    // for our special buttons.

    $('.' + adacare.vsEditor.DOW_ON + ',.' + adacare.vsEditor.DOW_OFF)
        .livequery(function () { $(this).removeClass('ui-state-default') });

    adacare.vsEditor.displayFields(VSEParm);

    // Set event handlers to update fields when clicked or text is changed

    //$('#' + VSEParm.thruDateOpenEndedName).change(function() { alert('date change'); });// TEST
    $('#' + VSEParm.surroundDivServerID + ' [name="' + VSEParm.frequencyServerName + '"]').click(adacare.vsEditor.clickedFrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyDailyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyWeeklyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyMonthlyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyYearlyName + '"]').click(adacare.vsEditor.clickedSubfrequency);
    //$('input[name="' + adacare.vsEditor.intervalName + '"]').change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalDailyServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalWeeklyServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalWeekly2ServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalMonthlyServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalMonthly2ServerID).change(adacare.vsEditor.changedInterval);
    $('#' + VSEParm.intervalYearlyServerID).change(adacare.vsEditor.changedInterval);

    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyDailyDOWName + '"]').unbind().click(adacare.vsEditor.clickedDailyDOW);
    $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyWeeklyDOWName + '"]').unbind().click(adacare.vsEditor.clickedWeeklyDOW);
    $('#' + VSEParm.frequencyOrdinalServerID).change(adacare.vsEditor.changedFrequencyOrdinal);
    $('#' + VSEParm.frequencyOrdinalKindServerID).change(adacare.vsEditor.changedFrequencyOrdinal);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEParm.

adacare.vsEditor.VSEParm = function (surroundID) {

    this.surroundID = surroundID;
    this.wsCallCount = 0;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given the surrounding DIV ID as the index, return the corresponding VSEParm. If it doesn't exist,
// then return null.

adacare.vsEditor.getVSEParm = function (surroundID) {

    var VSEParm;

    VSEParm = adacare.vsEditor.VSEParmArray[surroundID];

    return VSEParm;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given a DOM element, return it's VSEParm. If it doesn't exist, then return null.
//
// This function works by seeing which VSEParm describes the DIV surrounding given element. Beware
// that the element may not have an ID, so we can't depend on that info in our test. The code below
// seems to work in all cases.

adacare.vsEditor.findVSEParm = function (elem) {

    var VSEParm, surroundID, elemID, isParent;

    elemID = $(elem).attr('id');
    for (surroundID in adacare.vsEditor.VSEParmArray) {
        isParent = $(elem).parents().is('#' + surroundID);
        if (isParent) {
            VSEParm = adacare.vsEditor.VSEParmArray[surroundID];
            break;
        }
    }
    return VSEParm;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Get and set the Nth subfrequency code. The server-side variable that hold the subfrequency list
// is a single-character code for each frequency. When we get or set, we only look at the subfrequency
// code for the current frequency.

adacare.vsEditor.getSubfrequency = function (VSEParm, index) {

    var subfrequencyList;
    var subfrequency;

    subfrequencyList = $('#' + VSEParm.subfrequencyListServerID).val();
    subfrequency = subfrequencyList.charAt(index);

    return subfrequency;
}

adacare.vsEditor.setSubfrequency = function (VSEParm, index, subfrequency) {

    var subfrequencyList;

    subfrequencyList = String($('#' + VSEParm.subfrequencyListServerID).val());
    subfrequencyList = subfrequencyList.substr(0, index) + subfrequency + subfrequencyList.substr(index + 1);
    $('#' + VSEParm.subfrequencyListServerID).val(subfrequencyList);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the Interval to the same value on the server-side variable and all screen fields.

adacare.vsEditor.setInterval = function (VSEParm, interval) {

    $('#' + VSEParm.intervalServerID).val(interval);
    $('#' + VSEParm.intervalDailyServerID).val(interval);
    $('#' + VSEParm.intervalWeeklyServerID).val(interval);
    $('#' + VSEParm.intervalWeekly2ServerID).val(interval);
    $('#' + VSEParm.intervalMonthlyServerID).val(interval);
    $('#' + VSEParm.intervalMonthly2ServerID).val(interval);
    $('#' + VSEParm.intervalYearlyServerID).val(interval);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the Frequency radio buttons.

adacare.vsEditor.clickedFrequency = function () {

    var VSEParm;

    VSEParm = adacare.vsEditor.findVSEParm(this);
    adacare.vsEditor.displayFields(VSEParm);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the Subfrequency radio buttons by updating the server-side variables.

adacare.vsEditor.clickedSubfrequency = function () {

    var VSEParm, frequency, subfrequency, index;

    VSEParm = adacare.vsEditor.findVSEParm(this);
    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();
    subfrequency = $(this).val();

    switch (frequency) {
        case adacare.vsEditor.FREQUENCY_DAILY:
            index = adacare.vsEditor.subfrequencyDailyIndex;
            break;

        case adacare.vsEditor.FREQUENCY_WEEKLY:
            index = adacare.vsEditor.subfrequencyWeeklyIndex;
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
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to clicking the days of week buttons by toggling the on/off status.

adacare.vsEditor.clickedDailyDOW = function () {

    adacare.vsEditor.clickedAnyDOW(this, adacare.vsEditor.subfrequencyDailyDOWName, adacare.vsEditor.SUBFREQUENCY_DAILY_EVERY_DOWLIST, adacare.vsEditor.subfrequencyDailyIndex);
};

adacare.vsEditor.clickedWeeklyDOW = function () {

    adacare.vsEditor.clickedAnyDOW(this, adacare.vsEditor.subfrequencyWeeklyDOWName, adacare.vsEditor.SUBFREQUENCY_WEEKLY_EVERY_DOWLIST, adacare.vsEditor.subfrequencyWeeklyIndex);
};

adacare.vsEditor.clickedAnyDOW = function (elem, subfrequencyDOWName, subfrequency, subfrequencyIndex) {

    var VSEParm;
    var daysOfWeek;
    var $buttonElem, buttonIndex, buttonMask, buttonMatched;

    VSEParm = adacare.vsEditor.findVSEParm(elem);

    // Since all of the DOW button clicks come here, we have to figure out which one was clicked.
    // Examine each of the DOW buttons that belong to us, and compare it to the one that was clicked.
    // If we find a match, then we invert the on/off state and save it back tot her server-side variable.

    for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {
        $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + subfrequencyDOWName + '"]:eq(' + buttonIndex + ')');
        buttonMatched = ($buttonElem[0] == elem);

        if (buttonMatched) {

            buttonMask = (1 << buttonIndex);
            daysOfWeek = new Number($('#' + VSEParm.daysOfWeekServerID).val());

            // Invert the masked bit, and save it back into the server-side variable.

            daysOfWeek = (daysOfWeek ^ buttonMask);
            $('#' + VSEParm.daysOfWeekServerID).val(daysOfWeek);
            break;
        }
    }

    // Auto-select the subfrequency for the days-of-week.

    adacare.vsEditor.setSubfrequency(VSEParm, subfrequencyIndex, subfrequency);
    adacare.vsEditor.displayFields(VSEParm);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changing any of the Interval text fields.
//
// Get the text value from the Interval field, and stuff it into the hidden field passed
// from the server-side caller.

adacare.vsEditor.changedInterval = function () {

    var VSEParm, id;
    var frequency, interval;
    var subfrequency, subfrequencyIndex;

    VSEParm = adacare.vsEditor.findVSEParm(this);
    id = $(this).attr('id');
    interval = $(this).val();
    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();

    // Guard against empty or zero for input

    interval = adacare.lib.stringTrim(interval);
    if (interval == '' || Number(interval) == 0) {
        interval = 1;
        $(this).val(interval);
    }

    // Save the Interval to the server-side variables, and copy it into all of the screen fields.

    adacare.vsEditor.setInterval(VSEParm, interval);

    // Auto-select the subfrequency for the interval.

    switch (id) {
        case VSEParm.intervalDailyServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_DAILY_EVERY_N_DAYS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyDailyIndex;
            break;

        case VSEParm.intervalWeeklyServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_WEEKLY_EVERY_N_WEEKS;
            subfrequencyIndex = adacare.vsEditor.subfrequencyWeeklyIndex;
            break;

        case VSEParm.intervalWeekly2ServerID:
            subfrequency = adacare.vsEditor.SUBFREQUENCY_WEEKLY_EVERY_DOWLIST;
            subfrequencyIndex = adacare.vsEditor.subfrequencyWeeklyIndex;
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
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changing of the FrequencyOrdinal and FrequencyOrdinalKind controls.

adacare.vsEditor.changedFrequencyOrdinal = function () {

    var VSEParm;
    var subfrequency, subfrequencyIndex;

    // Auto-select the subfrequency for the ordinal.

    VSEParm = adacare.vsEditor.findVSEParm(this);
    subfrequency = adacare.vsEditor.SUBFREQUENCY_MONTHLY_EVERY_N_ORDINAL;
    subfrequencyIndex = adacare.vsEditor.subfrequencyMonthlyIndex;
    adacare.vsEditor.setSubfrequency(VSEParm, subfrequencyIndex, subfrequency);

    adacare.vsEditor.displayFields(VSEParm);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the fields that the user sees.

adacare.vsEditor.displayFields = function (VSEParm) {

    var frequency, subfrequency, interval, daysOfWeek, frequencyOrdinal, frequencyOrdinalKind;
    var $buttonElem, buttonPrefix, buttonIndex, buttonMask;
    var buttonIsOn;

    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();
    interval = $('#' + VSEParm.intervalServerID).val();
    daysOfWeek = $('#' + VSEParm.daysOfWeekServerID).val();
    frequencyOrdinal = $('#' + VSEParm.frequencyOrdinalServerID).val();
    frequencyOrdinalKind = $('#' + VSEParm.frequencyOrdinalKindServerID).val();

    // Uncheck the frequency radio button, and then check only the one that should be checked.

    //$('input[name="' + adacare.vsEditor.frequencyName + '"]')
    //    .each(function() { $(this).removeAttr('checked') });
    //$('input[name="' + adacare.vsEditor.frequencyName + '"][value="' + frequency + '"]')
    //    .attr('checked', 'checked');

    // Hide all of the frequency detail DIVs, and then show only the one of interest.
    // Within the DIV of interest, init all of its fields.

    $('#' + VSEParm.frequencyDailyDivID).hide();
    $('#' + VSEParm.frequencyWeeklyDivID).hide();
    $('#' + VSEParm.frequencyMonthlyDivID).hide();
    $('#' + VSEParm.frequencyYearlyDivID).hide();
    $('#' + VSEParm.thruDateDivID).hide();

    switch (frequency) {
        case adacare.vsEditor.FREQUENCY_ONCE:
            // Nothing to do for this trivial case.
            break;

        case adacare.vsEditor.FREQUENCY_DAILY:
            $('#' + VSEParm.frequencyDailyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyDailyIndex);
            $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyDailyName + '"][value="' + subfrequency + '"]').prop('checked', true);

            // Display the days of week buttons on/off status

            daysOfWeek = new Number($('#' + VSEParm.daysOfWeekServerID).val());
            for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {
                buttonMask = (1 << buttonIndex);
                buttonIsOn = (daysOfWeek & buttonMask);

                // Set the CSS class of the button to correspond with on/off

                //buttonID = adacare.vsEditor.subfrequencyDailyDOWIDPrefix + buttonIndex;
                $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyDailyDOWName + '"]:eq(' + buttonIndex + ')');
                $buttonElem.removeClass(adacare.vsEditor.DOW_ON).removeClass(adacare.vsEditor.DOW_OFF);
                if (buttonIsOn) {
                    $buttonElem.addClass(adacare.vsEditor.DOW_ON)
                }
                else {
                    $buttonElem.addClass(adacare.vsEditor.DOW_OFF)
                }
            }
            break;

        case adacare.vsEditor.FREQUENCY_WEEKLY:
            $('#' + VSEParm.frequencyWeeklyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyWeeklyIndex);
            $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyWeeklyName + '"][value="' + subfrequency + '"]').prop('checked', true);

            // Display the days of week buttons on/off status

            daysOfWeek = new Number($('#' + VSEParm.daysOfWeekServerID).val());
            for (buttonIndex = 0; buttonIndex < 7; buttonIndex++) {
                buttonMask = (1 << buttonIndex);
                buttonIsOn = (daysOfWeek & buttonMask);

                // Set the CSS class of the button to correspond with on/off

                $buttonElem = $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyWeeklyDOWName + '"]:eq(' + buttonIndex + ')');
                $buttonElem.removeClass(adacare.vsEditor.DOW_ON).removeClass(adacare.vsEditor.DOW_OFF);
                if (buttonIsOn) {
                    $buttonElem.addClass(adacare.vsEditor.DOW_ON)
                }
                else {
                    $buttonElem.addClass(adacare.vsEditor.DOW_OFF)
                }
            }
            break;

        case adacare.vsEditor.FREQUENCY_MONTHLY:
            $('#' + VSEParm.frequencyMonthlyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyMonthlyIndex);
            $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyMonthlyName + '"][value="' + subfrequency + '"]').prop('checked', true);
            break;

        case adacare.vsEditor.FREQUENCY_YEARLY:
            $('#' + VSEParm.frequencyYearlyDivID).show();
            $('#' + VSEParm.thruDateDivID).show();

            // Display the subfrequency

            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyYearlyIndex);
            $('#' + VSEParm.surroundDivServerID + ' [name="' + adacare.vsEditor.subfrequencyYearlyName + '"][value="' + subfrequency + '"]').prop('checked', true);
            break;
    }

    // Display the updated frequency string.

    adacare.vsEditor.displayFrequencyString(VSEParm);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web Service functions
//
// Update the FrequencyDisplay string. We pass the various frequency fields to the server, and ask
// for the server-generated string to display.

adacare.vsEditor.displayFrequencyString = function (VSEParm) {

    var visitScheduleFrequency = new AdaCareWeb.WebServices.VisitScheduleFrequency();
    var startDate;
    var frequency, subfrequency, interval, daysOfWeek, frequencyOrdinal, frequencyOrdinalKind;

    // First, erase the current display. If you look at the HTML, you'll see a space (&nbsp;) placed
    // in the DIV that holds frequency string. It's there for a reason: Without the space, blanking
    // the string will cause the field to momentarily collapse, and make the display look jerky.

    $('#' + VSEParm.frequencyStringServerID).text('');

    // Pick up the fields into local variables for convenience.

    startDate = new Date($('#' + VSEParm.startDateServerID).val());
    frequency = $('[name="' + VSEParm.frequencyServerName + '"]:checked').val();

    switch (frequency) {
        case adacare.vsEditor.FREQUENCY_ONCE:
            // Nothing to do for this trivial case.
            subfrequency = '-';
            //interval = 1;
            break;

        case adacare.vsEditor.FREQUENCY_DAILY:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyDailyIndex);
            //interval = $('#' + adacare.vsEditor.intervalDailyServerID).val();
            break;

        case adacare.vsEditor.FREQUENCY_WEEKLY:
            subfrequency = adacare.vsEditor.getSubfrequency(VSEParm, adacare.vsEditor.subfrequencyWeeklyIndex);
            //interval = $('#' + adacare.vsEditor.intervalWeeklyServerID).val();
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
    AdaCareWeb.WebServices.VisitScheduleServices.FrequencyString(
        visitScheduleFrequency,
        adacare.vsEditor.displayFrequencyStringWSSuccess,
        adacare.vsEditor.displayFrequencyStringWSFailed,
        VSEParm);
}

// Display the frequency string returned from the server.

adacare.vsEditor.displayFrequencyStringWSSuccess = function (frequencyString, responseVSEParm) {

    var currVSEParm;

    if (responseVSEParm != null) {

        // Look at the current VSEParm and see what the current web service call count it has.
        // If it's the same as returned by the web service call, then we aren't running behind
        // and it's okay to display the returned frequencyString. Otherwise, we're probably
        // getting the responses out of order (a race condition), and we ignore the result.

        currVSEParm = adacare.vsEditor.getVSEParm(responseVSEParm.surroundDivServerID);

        if (currVSEParm != null & responseVSEParm.wsCallCount == currVSEParm.wsCallCount) {

            $('#' + responseVSEParm.frequencyStringServerID).text(frequencyString);
        }
    }
}

adacare.vsEditor.displayFrequencyStringWSFailed = function (e) {

    $('#' + adacare.vsEditor.frequencyStringServerID).text('(Not available - try again?)');
}





