// Copyright 2010 by Neurosoftware, LLC.
//
// adacare.vsSpecialRatesEditor.v1.6.js         Sandy Gettings        
//
// Revised 06/18/2013
//
// This code is used to edit the special billing and payroll rates in VisitSchedule and
// VisitOutcome records.
//
// 2015-11-20 SG: Renamed BillingTravelRate to BillingTravelDistanceRate (likewise for PayrollTravelRate)
// 2015-12-27 SG: Added support for travel hourly rates.
// 2019-03-31 SG: Added support for show/hide payroll info (from Helpers.UserIsAllowedStaffPayrollInfo()).

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== "object") { throw new Error("adacare is already defined, but is not an object!"); }

if (!adacare.vsSpecialRatesEditor) { adacare.vsSpecialRatesEditor = {}; }
else { throw new Error("adacare.vsSpecialRatesEditor is already defined!"); }

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Global variables: element IDs of fields passed from the server code. These are used to pass
// parameters between the server and client code.

// Array of parameter objects. This list is ued to store a set of parameters for each instance of
// the editor that has been initialized. The index into the array is the ID of the surrounding DIV.

adacare.vsSpecialRatesEditor.VSEParmArray = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the basic parameters.

adacare.vsSpecialRatesEditor.init = function (
    useAccordionBehavior, useSpecialRatesID, topDivID, bottomDivID, surroundDivID,
    billingUseThisRateID, billingFlatRateID, billingHourlyRateID, billingTravelDistanceRateID, billingTravelHourlyRateID,
    userIsAllowedStaffPayrollInfo,
    payrollUseThisRateID, payrollFlatRateID, payrollHourlyRateID, payrollTravelDistanceRateID, payrollTravelHourlyRateID
) {
    'use strict';

    var CSS_HIDDEN = 'general_hidden';

    var VSEParm;

    VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundDivID);

    if (VSEParm === undefined) {
        VSEParm = new adacare.vsSpecialRatesEditor.VSEParm(surroundDivID);
        adacare.vsSpecialRatesEditor.VSEParmArray[VSEParm.surroundID] = VSEParm;

        VSEParm.useAccordionBehavior = Boolean(useAccordionBehavior !== 0);
        VSEParm.useSpecialRatesID = useSpecialRatesID;
        VSEParm.topDivID = topDivID;
        VSEParm.bottomDivID = bottomDivID;
        VSEParm.surroundDivID = surroundDivID;

        VSEParm.billingUseThisRateID = billingUseThisRateID;
        VSEParm.billingFlatRateID = billingFlatRateID;
        VSEParm.billingHourlyRateID = billingHourlyRateID;
        VSEParm.billingTravelDistanceRateID = billingTravelDistanceRateID;
        VSEParm.billingTravelHourlyRateID = billingTravelHourlyRateID;

        VSEParm.payrollUseThisRateID = payrollUseThisRateID;
        VSEParm.payrollFlatRateID = payrollFlatRateID;
        VSEParm.payrollHourlyRateID = payrollHourlyRateID;
        VSEParm.payrollTravelDistanceRateID = payrollTravelDistanceRateID;
        VSEParm.payrollTravelHourlyRateID = payrollTravelHourlyRateID;

        // Only touch payroll info if the user is allowed to do so. Actually, we just hide
        // the payroll fields and otherwise work normally. This lets the caller get and set
        // field values without caring about the details.

        VSEParm.UserIsAllowedStaffPayrollInfo = userIsAllowedStaffPayrollInfo;

        //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

        //    $('#' + VSEParm.payrollUseThisRateID).removeClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollFlatRateID).removeClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollHourlyRateID).removeClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollTravelDistanceRateID).removeClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollTravelHourlyRateID).removeClass(CSS_HIDDEN);
        //}
        //else {

        //    $('#' + VSEParm.payrollUseThisRateID).addClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollFlatRateID).addClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollHourlyRateID).addClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollTravelDistanceRateID).addClass(CSS_HIDDEN);
        //    $('#' + VSEParm.payrollTravelHourlyRateID).addClass(CSS_HIDDEN);
        //}
    }

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);

    // Set event handlers to update fields when clicked or text is changed

    $('#' + VSEParm.useSpecialRatesID).change(adacare.vsSpecialRatesEditor.UseSpecialRatesChangeHandler);
    $('#' + VSEParm.billingUseThisRateID).change(adacare.vsSpecialRatesEditor.UseThisRateChangedHandler);

    //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

    $('#' + VSEParm.payrollUseThisRateID).change(adacare.vsSpecialRatesEditor.UseThisRateChangedHandler);
    //}
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEParm. This is only used internally to home the information for each 
// vsSpecialRatesEditor on the page (we can have more than one). The key for looking up a VSEParm is
// the control's surrounding Div ID.

adacare.vsSpecialRatesEditor.VSEParm = function (surroundID) {
    'use strict';

    this.surroundID = surroundID;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEValues object. This is used to pass field values to/from outside code.

adacare.vsSpecialRatesEditor.VSEValues = function () {
    'use strict';

    this.billingUseThisRate = false;
    this.billingFlatRate = 0;
    this.billingHourlyRate = 0;
    this.billingTravelDistanceRate = 0;
    this.billingTravelHourlyRate = 0;
    this.payrollUseThisRate = false;
    this.payrollFlatRate = 0;
    this.payrollHourlyRate = 0;
    this.payrollTravelDistanceRate = 0;
    this.payrollTravelHourlyRate = 0;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Return the current values to the caller.

adacare.vsSpecialRatesEditor.GetValues = function (surroundID) {
    'use strict';

    var VSEParm;
    var VSEValues;

    //VSEParm = adacare.vsSpecialRatesEditor.VSEParmArray[surroundID];
    VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);
    VSEValues = new adacare.vsSpecialRatesEditor.VSEValues();

    VSEValues.billingUseThisRate = $('#' + VSEParm.billingUseThisRateID).prop('checked');
    VSEValues.billingFlatRate = adacare.lib.stringToNumber($('#' + VSEParm.billingFlatRateID).val(), true);
    VSEValues.billingHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.billingHourlyRateID).val(), true);
    VSEValues.billingTravelDistanceRate = adacare.lib.stringToNumber($('#' + VSEParm.billingTravelDistanceRateID).val(), true);
    VSEValues.billingTravelHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.billingTravelHourlyRateID).val(), true);

    // Only touch payroll info if the user is allowed to do so.

    //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

    VSEValues.payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID).prop('checked');
    VSEValues.payrollFlatRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollFlatRateID).val(), true);
    VSEValues.payrollHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollHourlyRateID).val(), true);
    VSEValues.payrollTravelDistanceRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollTravelDistanceRateID).val(), true);
    VSEValues.payrollTravelHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollTravelHourlyRateID).val(), true);
    //}

    return VSEValues;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the values passed in from the caller.
//
// CAUTION: Setting 'checked' to false may not work in all browsers. Need to test. The alternative
// is to use removeAttr().

adacare.vsSpecialRatesEditor.SetValues = function (surroundID, VSEValues) {
    'use strict';

    var VSEParm;
    var useSpecialRatesChecked;

    //VSEParm = adacare.vsSpecialRatesEditor.VSEParmArray[surroundID];
    VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);

    // Turn on the "use special rates" checkox if either billing or payroll is checked, 
    // or if the box was already checked.

    useSpecialRatesChecked = (VSEValues.billingUseThisRate || VSEValues.payrollUseThisRate || $('#' + VSEParm.useSpecialRatesID).prop('checked'));
    $('#' + VSEParm.useSpecialRatesID).prop('checked', useSpecialRatesChecked);

    // Fill in the fields.

    $('#' + VSEParm.billingUseThisRateID).prop('checked', VSEValues.billingUseThisRate);
    $('#' + VSEParm.billingFlatRateID).val(adacare.lib.formatCurrency(VSEValues.billingFlatRate));
    $('#' + VSEParm.billingHourlyRateID).val(adacare.lib.formatCurrency(VSEValues.billingHourlyRate));
    $('#' + VSEParm.billingTravelDistanceRateID).val(adacare.lib.formatCurrency3(VSEValues.billingTravelDistanceRate));
    $('#' + VSEParm.billingTravelHourlyRateID).val(adacare.lib.formatCurrency(VSEValues.billingTravelHourlyRate));

    // Only touch payroll info if the user is allowed to do so.

    //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

    $('#' + VSEParm.payrollUseThisRateID).prop('checked', VSEValues.payrollUseThisRate);
    $('#' + VSEParm.payrollFlatRateID).val(adacare.lib.formatCurrency(VSEValues.payrollFlatRate));
    $('#' + VSEParm.payrollHourlyRateID).val(adacare.lib.formatCurrency(VSEValues.payrollHourlyRate));
    $('#' + VSEParm.payrollTravelDistanceRateID).val(adacare.lib.formatCurrency3(VSEValues.payrollTravelDistanceRate));
    $('#' + VSEParm.payrollTravelHourlyRateID).val(adacare.lib.formatCurrency(VSEValues.payrollTravelHourlyRate));
    //}

    // Display the info properly.

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Reset all fields using default values.

adacare.vsSpecialRatesEditor.ResetValues = function (surroundID) {
    'use strict';

    var VSEParm;
    var VSEValues;

    VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);
    VSEValues = new adacare.vsSpecialRatesEditor.VSEValues();
    $('#' + VSEParm.useSpecialRatesID).prop('checked', false);
    adacare.vsSpecialRatesEditor.SetValues(surroundID, VSEValues);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given the surrounding DIV ID as the index, return the corresponding VSEParm. If it doesn't exist,
// then return null.

adacare.vsSpecialRatesEditor.getVSEParm = function (surroundID) {
    'use strict';

    var VSEParm;

    VSEParm = adacare.vsSpecialRatesEditor.VSEParmArray[surroundID];

    return VSEParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given a DOM element, return it's VSEParm. If it doesn't exist, then return null.
//
// This function works by seeing which VSEParm describes the DIV surrounding given element. Beware
// that the element may not have an ID, so we can't depend on that info in our test. The code below
// seems to work in all cases.

adacare.vsSpecialRatesEditor.findVSEParm = function (elem) {
    'use strict';

    var VSEParm, surroundID, elemID, isParent;

    elemID = $(elem).attr('id');
    for (surroundID in adacare.vsSpecialRatesEditor.VSEParmArray) {
        isParent = $(elem).parents().is('#' + surroundID);
        if (isParent) {
            VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);
            break;
        }
    }
    return VSEParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changes in the top Div's checkbox ("use special rates") for billing and payroll.

adacare.vsSpecialRatesEditor.UseSpecialRatesChangeHandler = function () {
    'use strict';

    var VSEParm;
    var isChecked;
    var $billingUseThisRate, $payrollUseThisRate;

    VSEParm = adacare.vsSpecialRatesEditor.findVSEParm(this);

    $billingUseThisRate = $('#' + VSEParm.billingUseThisRateID);
    $payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID);

    // Special case: If the main "use special rates" checkbox was just clicked, and
    // the payroll rates were already turned on, and the user isn't allowed to mess with
    // payroll, then we put the main checkbox back on. Why? This prevents a user who isn't
    // allowed to touch payroll to turn off the payroll's special rates, just by turning off
    // the main "use special rates" option.

    if ($payrollUseThisRate.prop('checked') && !VSEParm.UserIsAllowedStaffPayrollInfo) {

        $('#' + VSEParm.useSpecialRatesID).prop('checked', true);
    }

    isChecked = $('#' + VSEParm.useSpecialRatesID).prop('checked');

    // If the top "use special rates" is turned off, then we also turn off
    // the subordinate checkboxes for special billing and payroll rates.

    if (!isChecked) {

        $billingUseThisRate.prop('checked', false);
        $payrollUseThisRate.prop('checked', false);
    }

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changes in the "use this rate" checkboxes for billing and payroll.

adacare.vsSpecialRatesEditor.UseThisRateChangedHandler = function () {
    'use strict';

    var VSEParm;

    VSEParm = adacare.vsSpecialRatesEditor.findVSEParm(this);
    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the accordion Div.
//
// Here's the logic:
// -- If we're using accordion behavior, the top Div is always displayed. It has a checkbox that 
//    controls when the bottom Div is displayed.
// -- If we are not using accordion behavior, the top Div is hidden and the bottom Div always displayed.

adacare.vsSpecialRatesEditor.displayAccordion = function (VSEParm) {
    'use strict';

    var isChecked;

    if (VSEParm.useAccordionBehavior) {
        $('#' + VSEParm.topDivID).show();

        isChecked = $('#' + VSEParm.useSpecialRatesID).prop('checked');

        if (isChecked) {
            if (!$('#' + VSEParm.bottomDivID).is(':visible')) {
                $('#' + VSEParm.bottomDivID).show();
            }
        }
        else {
            $('#' + VSEParm.bottomDivID).hide('fast');
        }
    }
    else {
        $('#' + VSEParm.topDivID).hide();
        $('#' + VSEParm.bottomDivID).show();
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the display for all of the fields.

adacare.vsSpecialRatesEditor.displayFields = function (VSEParm) {
    'use strict';

    var $billingUseThisRate, $billingFlatRate, $billingHourlyRate, $billingTravelDistanceRate, $billingTravelHourlyRate;
    var $payrollUseThisRate, $payrollFlatRate, $payrollHourlyRate, $payrollTravelDistanceRate, $payrollTravelHourlyRate;

    $billingUseThisRate = $('#' + VSEParm.billingUseThisRateID);
    $billingFlatRate = $('#' + VSEParm.billingFlatRateID);
    $billingHourlyRate = $('#' + VSEParm.billingHourlyRateID);
    $billingTravelDistanceRate = $('#' + VSEParm.billingTravelDistanceRateID);
    $billingTravelHourlyRate = $('#' + VSEParm.billingTravelHourlyRateID);

    // Only touch payroll info if the user is allowed to do so.

    //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

    $payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID);
    $payrollFlatRate = $('#' + VSEParm.payrollFlatRateID);
    $payrollHourlyRate = $('#' + VSEParm.payrollHourlyRateID);
    $payrollTravelDistanceRate = $('#' + VSEParm.payrollTravelDistanceRateID);
    $payrollTravelHourlyRate = $('#' + VSEParm.payrollTravelHourlyRateID);
    //}

    // Enable or disable the billing fields

    if ($billingUseThisRate.prop('checked')) {
        $billingFlatRate.removeAttr('disabled');
        $billingHourlyRate.removeAttr('disabled');
        $billingTravelDistanceRate.removeAttr('disabled');
        $billingTravelHourlyRate.removeAttr('disabled');
    }
    else {
        $billingFlatRate.attr('disabled', true);
        $billingHourlyRate.attr('disabled', true);
        $billingTravelDistanceRate.attr('disabled', true);
        $billingTravelHourlyRate.attr('disabled', true);
    }

    // Enable or disable the payroll fields

    // Only touch payroll info if the user is allowed to do so.

    //if (VSEParm.UserIsAllowedStaffPayrollInfo) {

    if ($payrollUseThisRate.prop('checked')) {
        $payrollFlatRate.removeAttr('disabled');
        $payrollHourlyRate.removeAttr('disabled');
        $payrollTravelDistanceRate.removeAttr('disabled');
        $payrollTravelHourlyRate.removeAttr('disabled');
    }
    else {
        $payrollFlatRate.attr('disabled', true);
        $payrollHourlyRate.attr('disabled', true);
        $payrollTravelDistanceRate.attr('disabled', true);
        $payrollTravelHourlyRate.attr('disabled', true);
    }
    //}
};
