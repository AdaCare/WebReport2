// Copyright 2010 by Neurosoftware, LLC.
//
// adacare.vsSpecialRatesEditor.v1.3.js         Sandy Gettings        
//
// Revised 06/18/2013
//
// This code is used to edit the special billing and payroll rates in VisitSchedule and
// VisitOutcome records.

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

adacare.vsSpecialRatesEditor.VSEParmArray = new Array();

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the basic parameters.

adacare.vsSpecialRatesEditor.init = function (
    useAccordionBehavior, useSpecialRatesID, topDivID, bottomDivID, surroundDivID,
    billingUseThisRateID, billingFlatRateID, billingHourlyRateID, billingTravelRateID,
    payrollUseThisRateID, payrollFlatRateID, payrollHourlyRateID, payrollTravelRateID
    ) {

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
        VSEParm.billingTravelRateID = billingTravelRateID;
        VSEParm.payrollUseThisRateID = payrollUseThisRateID;
        VSEParm.payrollFlatRateID = payrollFlatRateID;
        VSEParm.payrollHourlyRateID = payrollHourlyRateID;
        VSEParm.payrollTravelRateID = payrollTravelRateID;
    }

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);

    // Set event handlers to update fields when clicked or text is changed

    $('#' + VSEParm.useSpecialRatesID).change(adacare.vsSpecialRatesEditor.UseSpecialRatesChangeHandler);
    $('#' + VSEParm.billingUseThisRateID).change(adacare.vsSpecialRatesEditor.UseThisRateChangedHandler);
    $('#' + VSEParm.payrollUseThisRateID).change(adacare.vsSpecialRatesEditor.UseThisRateChangedHandler);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEParm. This is only used internally to home the information for each 
// vsSpecialRatesEditor on the page (we can have more than one). The key for looking up a VSEParm is
// the control's surrounding Div ID.

adacare.vsSpecialRatesEditor.VSEParm = function (surroundID) {

    this.surroundID = surroundID;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for VSEValues object. This is used to pass field values to/from outside code.

adacare.vsSpecialRatesEditor.VSEValues = function () {

    this.billingUseThisRate = false;
    this.billingFlatRate = 0;
    this.billingHourlyRate = 0;
    this.billingTravelRate = 0;
    this.payrollUseThisRate = false;
    this.payrollFlatRate = 0;
    this.payrollHourlyRate = 0;
    this.payrollTravelRate = 0;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Return the current values to the caller.

adacare.vsSpecialRatesEditor.GetValues = function (surroundID) {

    var VSEParm;
    var VSEValues;

    //VSEParm = adacare.vsSpecialRatesEditor.VSEParmArray[surroundID];
    VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);
    VSEValues = new adacare.vsSpecialRatesEditor.VSEValues();

    VSEValues.billingUseThisRate = $('#' + VSEParm.billingUseThisRateID).prop('checked');
    VSEValues.billingFlatRate = adacare.lib.stringToNumber($('#' + VSEParm.billingFlatRateID).val(),true);
    VSEValues.billingHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.billingHourlyRateID).val(), true);
    VSEValues.billingTravelRate = adacare.lib.stringToNumber($('#' + VSEParm.billingTravelRateID).val(), true);
    VSEValues.payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID).prop('checked');
    VSEValues.payrollFlatRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollFlatRateID).val(), true);
    VSEValues.payrollHourlyRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollHourlyRateID).val(), true);
    VSEValues.payrollTravelRate = adacare.lib.stringToNumber($('#' + VSEParm.payrollTravelRateID).val(), true);

    return VSEValues;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the values passed in from the caller.
//
// CAUTION: Setting 'checked' to false may not work in all browsers. Need to test. The alternative
// is to use removeAttr().

adacare.vsSpecialRatesEditor.SetValues = function (surroundID, VSEValues) {

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
    $('#' + VSEParm.billingTravelRateID).val(adacare.lib.formatCurrency3(VSEValues.billingTravelRate));
    $('#' + VSEParm.payrollUseThisRateID).prop('checked', VSEValues.payrollUseThisRate);
    $('#' + VSEParm.payrollFlatRateID).val(adacare.lib.formatCurrency(VSEValues.payrollFlatRate));
    $('#' + VSEParm.payrollHourlyRateID).val(adacare.lib.formatCurrency(VSEValues.payrollHourlyRate));
    $('#' + VSEParm.payrollTravelRateID).val(adacare.lib.formatCurrency3(VSEValues.payrollTravelRate));

    // Display the info properly.

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Reset all fields using default values.

adacare.vsSpecialRatesEditor.ResetValues = function (surroundID) {

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

    var VSEParm, surroundID, elemID, isParent;

    elemID = $(elem).attr('id');
    for (surroundID in adacare.vsSpecialRatesEditor.VSEParmArray) {
        isParent = $(elem).parents().is('#' + surroundID);
        if (isParent) {
            //VSEParm = adacare.vsSpecialRatesEditor.VSEParmArray[surroundID];
            VSEParm = adacare.vsSpecialRatesEditor.getVSEParm(surroundID);
            break;
        }
    }
    return VSEParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changes in the top Div's checkbox ("use special rates") for billing and payroll.

adacare.vsSpecialRatesEditor.UseSpecialRatesChangeHandler = function () {

    var VSEParm;
    var isChecked;
    var $billingUseThisRate, $payrollUseThisRate;

    VSEParm = adacare.vsSpecialRatesEditor.findVSEParm(this);
    isChecked = $('#' + VSEParm.useSpecialRatesID).prop('checked');

    // If the top "use special rates" is turned off, then we also turn off
    // the subordinate checkboxes for special billing and payroll rates.

    if (!isChecked) {

        $billingUseThisRate = $('#' + VSEParm.billingUseThisRateID);
        $payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID);

        $billingUseThisRate.prop('checked', false);
        $payrollUseThisRate.prop('checked', false);
    }

    adacare.vsSpecialRatesEditor.displayFields(VSEParm);
    adacare.vsSpecialRatesEditor.displayAccordion(VSEParm);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to changes in the "use this rate" checkboxes for billing and payroll.

adacare.vsSpecialRatesEditor.UseThisRateChangedHandler = function () {

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

    var $billingUseThisRate, $billingFlatRate, $billingHourlyRate, $billingTravelRate;
    var $payrollUseThisRate, $payrollFlatRate, $payrollHourlyRate, $payrollTravelRate;

    $billingUseThisRate = $('#' + VSEParm.billingUseThisRateID);
    $billingFlatRate = $('#' + VSEParm.billingFlatRateID);
    $billingHourlyRate = $('#' + VSEParm.billingHourlyRateID);
    $billingTravelRate = $('#' + VSEParm.billingTravelRateID);

    $payrollUseThisRate = $('#' + VSEParm.payrollUseThisRateID);
    $payrollFlatRate = $('#' + VSEParm.payrollFlatRateID);
    $payrollHourlyRate = $('#' + VSEParm.payrollHourlyRateID);
    $payrollTravelRate = $('#' + VSEParm.payrollTravelRateID);

    // Enable or disable the billing fields

    if ($billingUseThisRate.prop('checked')) {
        $billingFlatRate.removeAttr('disabled');
        $billingHourlyRate.removeAttr('disabled');
        $billingTravelRate.removeAttr('disabled');
    }
    else {
        $billingFlatRate.attr('disabled', true);
        $billingHourlyRate.attr('disabled', true);
        $billingTravelRate.attr('disabled', true);
    }

    // Enable or disable the payroll fields

    if ($payrollUseThisRate.prop('checked')) {
        $payrollFlatRate.removeAttr('disabled');
        $payrollHourlyRate.removeAttr('disabled');
        $payrollTravelRate.removeAttr('disabled');
    }
    else {
        $payrollFlatRate.attr('disabled', true);
        $payrollHourlyRate.attr('disabled', true);
        $payrollTravelRate.attr('disabled', true);
    }
};
