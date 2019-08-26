// Copyright 2009, 2010, 2011, 2012, 2013 by Neurosoftware, LLC.
//
// neurocal.editvisit.v5.20.js
// Sandy Gettings
// Revised 05/13/2013
//
// This is a library that edits a visit with JavaScript.
// It is a part of neuro.cal.

var neuro;
if (!neuro) { neuro = {}; }
else {
    if (typeof (neuro) !== "object") {
        throw new Error("neuro is already defined, but is not an object!");
    }
}

if (!neuro.cal.editvisit) { neuro.cal.editvisit = {}; }
else { throw new Error("neuro.cal.editvisit is already defined!"); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constants

neuro.cal.editvisit.ConfirmUpdateDialogID = 'ConfirmUpdateDialog';
neuro.cal.editvisit.ConfirmUpdateDialogMsgID = 'ConfirmUpdateDialogMsg';
neuro.cal.editvisit.ConfirmDeleteDialogID = 'ConfirmDeleteDialog';
neuro.cal.editvisit.ConfirmDeleteDialogMsgID = 'ConfirmDeleteDialogMsg';

// Fields in the client/staff detail pop-up dialog

neuro.cal.clientOrStaffDetail = {
    surroundDivID: 'ClientStaffDetailSurroundDiv',
    divID: 'ClientStaffDetailDiv',
    titleID: 'ClientStaffDetailTitle',
    fullnameID: 'ClientStaffDetailFullname',
    telephonyIDID: 'ClientStaffDetailTelephonyID',
    addressID: 'ClientStaffDetailAddress',
    cityID: 'ClientStaffDetailCity',
    resPhoneID: 'ClientStaffDetailResPhone',
    mobilePhoneID: 'ClientStaffDetailMobilePhone',
    contactInfoID: 'ClientStaffDetailContactInfo',
    emailAddressID: 'ClientStaffDetailEmailAddress',
    emailAddressUrlID: 'ClientStaffDetailEmailAddressUrl',
    schedulingPrefsID: 'ClientStaffDetailSchedulingPrefs',
    detailMinutesID: 'ClientStaffDetailMinutes',
    mapButtID: 'ClientStaffDetailMapButt',
    viewCalendarButtID: 'ClientStaffDetailViewCalendarButt',
    closeBoxID: 'ClientStaffDetailCloseBox'
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// These methods are invoked when the user clicks on a link to a client or staff or date.
// It causes the calendar mode to switch to the new view, with the given client or staff ID or date 
// string as the parameter. That is, when the page is submitted and posted back, we're telling the 
// server-side calendar software to zoom in on the client or staff's individual calendar, or the 
// calendar for the specific date.

neuro.cal.editvisit.LinkToClient = function (elemID, updatePanelID, clientID, newView) {

    var client;

    client = neuro.cal.clientList[clientID];
    neuro.cal.editvisit.OpenDetails('Client Details', updatePanelID, clientID, client.fullname, neuro.cal.selectedClientIDHiddenID, newView, elemID);
    neuro.cal.fetchClientDetailWS(clientID);
};

neuro.cal.editvisit.LinkToStaff = function (elemID, updatePanelID, staffID, newView) {

    var staff;

    staff = neuro.cal.getStaff(staffID);
    neuro.cal.editvisit.OpenDetails('Staff Details', updatePanelID, staffID, staff.fullname, neuro.cal.selectedStaffIDHiddenID, newView, elemID);
    neuro.cal.fetchStaffDetailWS(staffID);
};

neuro.cal.editvisit.LinkToDate = function (dateStr, newView) {

    $('#' + neuro.cal.selectedDateHiddenID).val(String(dateStr));
    $('#' + neuro.cal.selectedViewModeHiddenID).val(String(newView));
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the "details" popup for a client or staff. We'll fill in a just little bit of info on the
// popup here. Then, the caller will request more details via an async web service call.

neuro.cal.editvisit.OpenDetails = function (title, updatePanelID, clientstaffID, fullname, clientstaffHiddenID, newView, elemID) {

    var $elem = $('#' + elemID);
    var $dialogSurroundDiv = $('#' + neuro.cal.clientOrStaffDetail.surroundDivID);
    var $viewCalendarButt = $('#' + neuro.cal.clientOrStaffDetail.viewCalendarButtID);
    var $closeBox = $('#' + neuro.cal.clientOrStaffDetail.closeBoxID);
    var elemOffset;

    // Fill in the few fields we know, and blank out the rest. They'll be filled in
    // later by the caller's web service.

    $('#' + neuro.cal.clientOrStaffDetail.titleID).text(title);
    $('#' + neuro.cal.clientOrStaffDetail.fullnameID).text(fullname);
    $('#' + neuro.cal.clientOrStaffDetail.telephonyIDID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.addressID).text('Just a moment, please...');
    $('#' + neuro.cal.clientOrStaffDetail.cityID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.resPhoneID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.mobilePhoneID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.contactInfoID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.emailAddressID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.emailAddressUrlID).attr('href', '');
    $('#' + neuro.cal.clientOrStaffDetail.schedulingPrefsID).text('');
    $('#' + neuro.cal.clientOrStaffDetail.detailMinutesID).text('');
    adacare.lib.initMapButton(neuro.cal.clientOrStaffDetail.mapButtID, 'No Map', 'Wait...', '');

    // Define the close box click to close the popup

    $closeBox.unbind();
    $closeBox.click(function () {
        neuro.cal.editvisit.CloseDetails();
    });

    // Define the button click to cause the calendar to zoom in to the single client or staff.

    $viewCalendarButt.unbind();
    $viewCalendarButt.click(function () {
        $('#' + clientstaffHiddenID).val(String(clientstaffID));
        $('#' + neuro.cal.selectedViewModeHiddenID).val(String(newView));
        neuro.cal.editvisit.CloseDetails();
        adacare.lib.pleaseWaitPopup('open');
        //document.forms[0].submit(); // Submits entire form for full postback
        __doPostBack(updatePanelID, ''); // partial-page postback only
    });

    // Display the popup. We place the popup beside the element's parent. The parent is 
    // a nice table cell, so they all line up neatly, unlike the element itself.

    elemOffset = $elem.parent().offset();

    $dialogSurroundDiv.css({
        'position': 'absolute',
        'top': elemOffset.top - 5,
        'left': elemOffset.left + $elem.parent().outerWidth() - 6
    });

    $dialogSurroundDiv.show();

    // Make the popup draggable.

    $dialogSurroundDiv.draggable({
        opacity: 0.7,
        cursor: "move"
    });
};

neuro.cal.editvisit.CloseDetails = function () {

    var $dialogSurroundDiv = $('#' + neuro.cal.clientOrStaffDetail.surroundDivID);

    $dialogSurroundDiv.hide();

};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch record for client/staff detail popup

neuro.cal.fetchClientDetailWS = function (clientID) {

    AdaCareWeb.WebServices.CalServices.FetchClient(
    clientID,
    neuro.cal.editvisit.WSSuccess,
    neuro.cal.editvisit.WSFailed,
    'neuro.cal.fetchClientDetailWS');
};

neuro.cal.fetchStaffDetailWS = function (staffID) {

    var begDateUTC;

    begDateUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(neuro.cal.begDate));

    AdaCareWeb.WebServices.CalServices.FetchStaff(
    neuro.cal.officeID, staffID, begDateUTC, // Use the first date of the calendar for payroll calc
    neuro.cal.editvisit.WSSuccess,
    neuro.cal.editvisit.WSFailed,
    'neuro.cal.fetchStaffDetailWS');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch the map URLs for the edit dialog
//
// The  method below fetches the URLs for both the client and staff for the visit. It's used when the
// edit dialog is first opened. It's also used when the user changes the visit's staff with the drop-
// down list. We would have a separate function to save time in the staff-only case, but it needs the
// client info anyway, so there wouldn't be any savings. One method will work for both cases.

neuro.cal.fetchMapUrlsWS = function (clientID, staffID) {

    AdaCareWeb.WebServices.CalServices.FetchMapUrls(
    clientID, staffID,
    neuro.cal.editvisit.WSSuccess,
    neuro.cal.editvisit.WSFailed,
    'neuro.cal.fetchMapUrlsWS');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Reload the special rates for billing and payroll.

neuro.cal.fetchBillingAndPayrollRatesWS = function () {

    var v, visitID, scheduleID, staffID, contractID, visitTypeID, effectiveDate, effectiveDateStr;
    var VSEValues, VSEValuesVirgin;

    // Here's how we can save some time: If the user has already set special rates for both billing
    // and payroll, then we don't need to reload default values.

    VSEValues = adacare.vsSpecialRatesEditor.GetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID);

    if (!VSEValues.billingUseThisRate || !VSEValues.payrollUseThisRate) {

        visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
        v = neuro.cal.visitList[visitID];
        scheduleID = v.scheduleID;
        staffID = Number($('#' + neuro.cal.editDialogStaffIDID).val());
        contractID = Number($('#' + neuro.cal.editDialogContractID).val());
        visitTypeID = Number($('#' + neuro.cal.editDialogVisitTypeID).val());
        effectiveDateStr = $('#' + neuro.cal.editDialogDatePickerID).val();
        //effectiveDate = new Date(effectiveDateStr);
        effectiveDate = adacare.lib.parseDateLocalized(adacare.lib.countryAbbr, effectiveDateStr);

        // Just for fun, erase any rates that aren't special. This gives the user a little animation
        // while we fetch the default rates asynchronously.

        VSEValuesVirgin = new adacare.vsSpecialRatesEditor.VSEValues();

        if (!VSEValues.billingUseThisRate) {
            VSEValues.billingFlatRate = VSEValuesVirgin.billingFlatRate;
            VSEValues.billingHourlyRate = VSEValuesVirgin.billingHourlyRate;
            VSEValues.billingTravelRate = VSEValuesVirgin.billingTravelRate;
        }

        if (!VSEValues.payrollUseThisRate) {
            VSEValues.payrollFlatRate = VSEValuesVirgin.payrollFlatRate;
            VSEValues.payrollHourlyRate = VSEValuesVirgin.payrollHourlyRate;
            VSEValues.payrollTravelRate = VSEValuesVirgin.payrollTravelRate;
        }

        adacare.vsSpecialRatesEditor.SetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID, VSEValues);

        // Fetch the billing and payroll rates

        AdaCareWeb.WebServices.CalServices.FetchBillingAndPayrollRates(
            scheduleID, staffID, contractID, visitTypeID, effectiveDate,
            neuro.cal.editvisit.WSSuccess,
            neuro.cal.editvisit.WSFailed,
            'neuro.cal.fetchBillingAndPayrollRatesWS');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This opens the visit edit dialog, which we preload with the current info from the visit.

neuro.cal.editvisit.Edit = function (e, vElem) {

    var visitID, v;
    var dateStrLocalized;
    var client, staff;
    var buttonList = {};

    if (!e) { e = window.event; }
    visitID = vElem.visitID;
    $('#' + neuro.cal.editDialogVisitIDID).val(visitID); // Remember the visit ID - other functions may need it later
    v = neuro.cal.visitList[visitID];

    dateStrLocalized = adacare.lib.formatDateLocalized(adacare.lib.countryAbbr, v.begDateTime);

    client = neuro.cal.clientList[v.clientID];
    staff = neuro.cal.getStaff(v.staffID);

    // Load the visit info into the edit dialog.

    $('#' + neuro.cal.editDialogClientNameID).text(client.fullname);

    $('#' + neuro.cal.editDialogStaffIDID).unbind();
    $('#' + neuro.cal.editDialogStaffIDID).val(v.staffID);
    $('#' + neuro.cal.editDialogStaffIDID).change(neuro.cal.editvisit.ChangeStaffSelect);

    $('#' + neuro.cal.editDialogVisitTypeID).val(v.visitTypeID.toString());
    $('#' + neuro.cal.editDialogDatePickerID).val(dateStrLocalized);
    $('#' + neuro.cal.editDialogDatePickerHiddenID).val(dateStrLocalized);
    $('#' + neuro.cal.editDialogTimePickerID).val(adacare.lib.FormatParseableTimeStr(v.begDateTime));
    $('#' + neuro.cal.editDialogBaseMinutesID).text(neuro.cal.getVisitTypeMinutesFormatted(v.visitTypeID));
    $('#' + neuro.cal.editDialogExtraMinutesID).val(v.extraMinutes.toString());
    $('#' + neuro.cal.editDialogVisitNotesID).val('');
    $('#' + neuro.cal.editDialogSupervisorNotesID).val('');

    // Clear some fields before we display the edit dialog.

    neuro.cal.editvisit.EraseClientForEdit();
    neuro.cal.editvisit.EraseStaffForEdit();
    neuro.cal.editvisit.EraseVisitJoinForEdit();
    neuro.cal.editvisit.EraseMapUrlsForEdit();
    $('#' + neuro.cal.editDialogSchedulingNotesID).html('');
    $('#' + neuro.cal.editConflictDivID).hide();
    $('#' + neuro.cal.editDialogWhoWhenUpdatedID).text('');

    // Open the dialog to edit the visit.
    // Note the use of the "open" option in the dialog. We use this technique to set the
    // z-index of the datepicker so that it appears on top of the dialog. This is only
    // needed because the dialog takes unusual steps to place itself above all other
    // elements (that's its whole purpose, after all).

    // TODO: Instead of this code, open the dialog using the adacare.lib function.
    // adacare.lib.modalEditDialog = function(action, dialogID, titleStr, widthPx
    // TODO: Need to define our own button, rather than letting the dialog() method
    // define them. This will give us more control over placement and appearance.

    // If the user is read-only, we don't want the buttons that save any changes.

    if (neuro.cal.readOnly) {
        buttonList['Cancel'] = function () { neuro.cal.editvisit.Button(this, visitID, 'cancel'); };
    }
    else {
        buttonList['Update'] = function () { neuro.cal.editvisit.Button(this, visitID, 'update'); };
        buttonList['Cancel'] = function () { neuro.cal.editvisit.Button(this, visitID, 'cancel'); };
        buttonList['Delete'] = function () { neuro.cal.editvisit.Button(this, visitID, 'delete'); };
    }

    $('#' + neuro.cal.editDialogID).dialog({
        title: 'Edit Visit',
        buttons: buttonList,
        close: function () { neuro.cal.editvisit.Button(this, visitID, 'cancel'); },
        modal: true,
        resizable: false,
        width: 760,
        appendTo: 'form:first',
        open: function () {
            $('#ui-datepicker-div').css('z-index', $('#' + neuro.cal.editDialogID).parent().css('z-index') + 1);
            neuro.cal.editvisit.CloseDetails(); // Close the client/staff details popup just in case it's open
        }
    });

    //$('#' + neuro.cal.editDialogID).parent().appendTo(jQuery('form:first')); // Fixes jQuery.dialog() bug to make Submit work (fixed in jQuery UI 1.10)
    neuro.cal.editvisit.InitClientForEdit(v.clientID);
    neuro.cal.editvisit.InitStaffForEdit(v.staffID, v.visitDate);
    neuro.cal.editvisit.InitVisitJoinForEdit(v);
    neuro.cal.editvisit.InitMapUrlsForEdit(v.clientID, v.staffID);

    adacare.lib.pleaseWaitPopup('open');
    //$('#' + neuro.cal.editDialogID).parent().appendTo(jQuery('form:first')); // Fixes jQuery.dialog() bug to make Submit work

    //return false; // Prevent the event from bubbling
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the client fields in the edit dialog.
//
// First, we clear or disable the fields that hold client info. Then, we make an asynchronous request
// to fetch the new client's info and load it into the fields.

neuro.cal.editvisit.EraseClientForEdit = function () {

    $('#' + neuro.cal.editDialogClientAddressID).text('');
    $('#' + neuro.cal.editDialogClientCityID).text('');
    $('#' + neuro.cal.editDialogClientResPhoneID).text('');
    $('#' + neuro.cal.editDialogClientMobilePhoneID).text('');
    $('#' + neuro.cal.editDialogClientEmailID).text('');
    $('#' + neuro.cal.editDialogClientContactInfoID).text('');
};

neuro.cal.editvisit.InitClientForEdit = function (clientID) {

    neuro.cal.fetchClientForEditWS(clientID); // Loads fields and map button asynchronously
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the staff fields in the edit dialog.
//
// First, we clear or disable the fields that hold staff info. Then, we make an asynchronous request
// to fetch the new staff's info and load it into the fields.

neuro.cal.editvisit.EraseStaffForEdit = function () {

    $('#' + neuro.cal.editDialogStaffAddressID).text('');
    $('#' + neuro.cal.editDialogStaffCityID).text('');
    $('#' + neuro.cal.editDialogStaffResPhoneID).text('');
    $('#' + neuro.cal.editDialogStaffMobilePhoneID).text('');
    $('#' + neuro.cal.editDialogStaffEmailID).text('');
    $('#' + neuro.cal.editDialogStaffContactInfoID).text('');
    $('#' + neuro.cal.editDialogStaffPayrollMinutesID).text('');
};

neuro.cal.editvisit.InitStaffForEdit = function (staffID, visitDate) {

    neuro.cal.fetchStaffForEditWS(staffID, visitDate); // Loads fields and map button asynchronously
};

neuro.cal.editvisit.EraseVisitJoinForEdit = function () {

    // Fire an event when the contract is changed.

    $('#' + neuro.cal.editDialogContractID).unbind();
    $('#' + neuro.cal.editDialogContractID).attr('selectedIndex', 0); // Select the first item by default
    $('#' + neuro.cal.editDialogContractID).change(neuro.cal.editvisit.ChangeContractSelect);

    // Fire an event when the visit type is changed.

    $('#' + neuro.cal.editDialogVisitTypeID).unbind().change(neuro.cal.editvisit.ChangeVisitTypeSelect);

    // Fire an event when the visit final status is changed.

    $('#' + neuro.cal.editDialogVisitFinalStatusID).unbind();
    $('#' + neuro.cal.editDialogVisitFinalStatusID).val(neuro.cal.VISITFINALSTATUS_PENDING);
    $('#' + neuro.cal.editDialogVisitFinalStatusID).change(neuro.cal.editvisit.ChangeVisitFinalStatusSelect);

    // Fire an event when the visit date or time is changed.

    $('#' + neuro.cal.editDialogDatePickerHiddenID).unbind().change(neuro.cal.editvisit.ChangeDatePicker);
    $('#' + neuro.cal.editDialogTimePickerID).unbind().change(neuro.cal.editvisit.ChangeTimePicker);

    // Fire an event when the extra minutes selection is changed.

    $('#' + neuro.cal.editDialogExtraMinutesID).unbind().change(neuro.cal.editvisit.ChangeExtraMinutesSelect);

    // Set the arrival/departure TimePickers to fire an event when changed.

    $('#' + neuro.cal.editDialogActualArrivalTimeID).unbind().change(neuro.cal.editvisit.ChangeArrivalDepartureSelect);
    $('#' + neuro.cal.editDialogActualDepartureTimeID).unbind().change(neuro.cal.editvisit.ChangeArrivalDepartureSelect);

    // Clear the arrival/departure times, and the billing/payroll hours.

    neuro.cal.editvisit.setArrivalDepartureTimes(null, null);
    neuro.cal.editvisit.displayBillingMinutes(0);
    neuro.cal.editvisit.displayPayrollMinutes(0);
    adacare.vsSpecialRatesEditor.ResetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID);

    $('#' + neuro.cal.editDialogIsConfirmedID).prop('checked', false);
    $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked', false);
    $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked', false);
    $('#' + neuro.cal.editDialogMileageID).val('');
    $('#' + neuro.cal.editFrequencyToStringDivID).text('');
    $('#' + neuro.cal.editDialogVisitNotesID).val('');
    $('#' + neuro.cal.editDialogSupervisorNotesID).val('');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the map buttons in the edit dialog.
//
// First, clear all of the map buttons. Then, make an asynchronous request to fetch the map URLs
// for all of the map buttons.

neuro.cal.editvisit.EraseMapUrlsForEdit = function () {

    adacare.lib.initMapButton(neuro.cal.editDialogClientMapButtID, 'No Map', 'Wait...', '');
    adacare.lib.initMapButton(neuro.cal.editDialogStaffMapButtID, 'No Map', 'Wait...', '');
    adacare.lib.initMapButton(neuro.cal.editDialogOfficeToClientMapButtID, 'No Map', 'Wait...', '');
    adacare.lib.initMapButton(neuro.cal.editDialogStaffToClientMapButtID, 'No Map', 'Wait...', '');
};

neuro.cal.editvisit.InitMapUrlsForEdit = function (clientID, staffID) {

    neuro.cal.fetchMapUrlsWS(clientID, staffID);
};

// Variation for just the staff. Used when the staff drop-down list is changed.

neuro.cal.editvisit.EraseMapUrlsForEditStaff = function () {

    adacare.lib.initMapButton(neuro.cal.editDialogStaffMapButtID, 'No Map', 'Wait...', '');
    adacare.lib.initMapButton(neuro.cal.editDialogStaffToClientMapButtID, 'No Map', 'Wait...', '');
};

neuro.cal.editvisit.InitMapUrlsForEditStaff = function (clientID, staffID) {

    neuro.cal.fetchMapUrlsWS(clientID, staffID); // Same as above, no need for special-case code
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Get the values in the arrival/departure time fields.
//
// Caution! If the departure time is actually past midnight, the departure date/time we return is
// still on the original (before midnight) date. This should actually be okay, as it's handled in
// the VisitOutcome class.

neuro.cal.editvisit.getArrivalDepartureTimes = function (timeFieldID) {

    var $timeField, timeString, timeVal, timeParseable;
    var timeFieldDateTime = null;
    var dateFieldVal;

    $timeField = $('#' + timeFieldID);
    timeString = $timeField.val();

    if (timeString !== null && timeString !== '') {
        timeVal = adacare.lib.parseTime(timeString);
        timeParseable = adacare.lib.FormatParseableTimeStr(timeVal);
        dateFieldVal = $('#' + neuro.cal.editDialogDatePickerID).val();
        //timeFieldDateTime = new Date(dateFieldVal + ' ' + timeParseable);
        timeFieldDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, dateFieldVal, timeParseable);
    }

    return timeFieldDateTime;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the values in the arrival/departure time fields. If the value is null, then we default to
// midnight.

neuro.cal.editvisit.initArrivalDepartureTimes = function (v, visitFinalStatus, arrivalDateTime, departureDateTime) {

    if (visitFinalStatus === neuro.cal.VISITFINALSTATUS_PENDING) {
        neuro.cal.recalcArrivalDepartureTimes(v);
    }
    else {
        neuro.cal.editvisit.setArrivalDepartureTimes(arrivalDateTime, departureDateTime);
    }
};

neuro.cal.editvisit.setArrivalDepartureTimes = function (arrivalDateTime, departureDateTime) {

    if (arrivalDateTime !== null) {
        $('#' + neuro.cal.editDialogActualArrivalTimeID).val(adacare.lib.FormatTimeLocalized(adacare.lib.countryAbbr, arrivalDateTime));
    }
    else {
        $('#' + neuro.cal.editDialogActualArrivalTimeID).val(adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, 0));
    }

    if (departureDateTime !== null) {
        $('#' + neuro.cal.editDialogActualDepartureTimeID).val(adacare.lib.FormatTimeLocalized(adacare.lib.countryAbbr, departureDateTime));
    }
    else {
        $('#' + neuro.cal.editDialogActualDepartureTimeID).val(adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, 0));
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the arrival/departure time fields.

neuro.cal.editvisit.showOrHideArrivalDepartureTimes = function () {

    var visitFinalStatus;
    var $arrivalTime, $departureTime;
    var $billingMinutes, $billingTravel, $payrollMinutes, $payrollTravel;

    $arrivalTime = $('#' + neuro.cal.editDialogActualArrivalTimeID);
    $departureTime = $('#' + neuro.cal.editDialogActualDepartureTimeID);
    $billingMinutes = $('#' + neuro.cal.editDialogBillingMinutesID);
    $billingTravel = $('#' + neuro.cal.editDialogBillingTravelID);
    $payrollMinutes = $('#' + neuro.cal.editDialogPayrollMinutesID);
    $payrollTravel = $('#' + neuro.cal.editDialogPayrollTravelID);

    visitFinalStatus = $('#' + neuro.cal.editDialogVisitFinalStatusID).val();

    if (visitFinalStatus !== neuro.cal.VISITFINALSTATUS_PENDING) {
        $arrivalTime.removeAttr('disabled');
        $departureTime.removeAttr('disabled');
        $billingMinutes.removeAttr('disabled');
        $billingTravel.removeAttr('disabled');
        $payrollMinutes.removeAttr('disabled');
        $payrollTravel.removeAttr('disabled');
    }
    else {
        $arrivalTime.attr('disabled', true);
        $departureTime.attr('disabled', true);
        $billingMinutes.attr('disabled', true);
        $billingTravel.attr('disabled', true);
        $payrollMinutes.attr('disabled', true);
        $payrollTravel.attr('disabled', true);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in the arrival/departure time fields in the edit dialog. The field element is 
// referenced by "this".

neuro.cal.editvisit.ChangeArrivalDepartureSelect = function (eventObject) {

    var v, visitID;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];
    neuro.cal.updateBillingAndPayrollHoursFromEdit();

    //return false; // Prevent the event from bubbling
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the initial values for billing and payroll hours. This function uses the values in the visit
// object, not the editing fields on the page.
//
// Rules:
// If the visit final status is still "pending":
//    Use the visit type's estimated minutes, or the minutes defined by the visit type and extra minutes.
// Otherwise:
//    Use the minutes defined in the VisitOutcome (or zero, if not billable/included in payroll).

neuro.cal.editvisit.setInitialBillingAndPayrollHours = function (v, isBillableToClient, visitOutcomeBillingMinutes, includeInPayroll, visitOutcomePayrollMinutes) {

    var visitType, vtID;
    var visitFinalStatus;
    var visitMinutes;
    var billingMinutes, payrollMinutes;

    visitFinalStatus = v.visitFinalStatus;
    vtID = v.visitTypeID;
    visitType = neuro.cal.visitTypeList[vtID];

    if (visitFinalStatus === neuro.cal.VISITFINALSTATUS_PENDING) {

        visitMinutes = neuro.cal.calcVisitMinutes(v.visitTypeID, v.extraMinutes);
        billingMinutes = (visitType.billingUseEstimate ? visitType.billingMinutesEstimate : visitMinutes);
        payrollMinutes = (visitType.payrollUseEstimate ? visitType.payrollMinutesEstimate : visitMinutes);
    }
    else {

        billingMinutes = (isBillableToClient ? visitOutcomeBillingMinutes : 0);
        payrollMinutes = (includeInPayroll ? visitOutcomePayrollMinutes : 0);
    }

    neuro.cal.editvisit.displayBillingMinutes(billingMinutes);
    neuro.cal.editvisit.displayPayrollMinutes(payrollMinutes);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the billing and payroll hours fields, based on the current values in the editing fields.
// Use this function to recalculate hours after any related fields have changed during editing.

neuro.cal.updateBillingAndPayrollHoursFromEdit = function () {

    var visitTypeID, visitType;
    var actualMinutes;
    var billingMinutes, payrollMinutes;

    visitTypeID = Number($('#' + neuro.cal.editDialogVisitTypeID).val());
    visitType = neuro.cal.visitTypeList[visitTypeID];
    actualMinutes = neuro.cal.calcActualVisitMinutesFromEdit();

    billingMinutes = (visitType.billingUseEstimate ? visitType.billingMinutesEstimate : actualMinutes);
    payrollMinutes = (visitType.payrollUseEstimate ? visitType.payrollMinutesEstimate : actualMinutes);

    neuro.cal.editvisit.displayBillingMinutes(billingMinutes);
    neuro.cal.editvisit.displayPayrollMinutes(payrollMinutes);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Recalculate the arrive and departure times from scratch. Use this when any important related
// editing field is changed.

neuro.cal.recalcArrivalDepartureTimes = function (v) {

    var arrivalDateTime, departureDateTime;
    var visitTypeID, visitMinutes;
    var dateStr, timeStr;

    visitTypeID = Number($('#' + neuro.cal.editDialogVisitTypeID).val());
    visitMinutes = neuro.cal.calcVisitMinutes(visitTypeID, neuro.cal.getExtraMinutesFromEdit());

    dateStr = $('#' + neuro.cal.editDialogDatePickerID).val();
    timeStr = $('#' + neuro.cal.editDialogTimePickerID).val();
    arrivalDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, dateStr, timeStr);
    departureDateTime = new Date(arrivalDateTime.getTime() + visitMinutes * neuro.cal.MS_PER_MINUTE);
    neuro.cal.editvisit.setArrivalDepartureTimes(arrivalDateTime, departureDateTime);
    neuro.cal.updateBillingAndPayrollHoursFromEdit();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Calculate the minutes for the visit. This function uses the visit type minutes and any extra
// minutes in the visit.

neuro.cal.calcVisitMinutes = function (visitTypeID, extraMinutes) {

    var visitType;
    var visitMinutes;

    visitType = neuro.cal.visitTypeList[visitTypeID];
    visitMinutes = visitType.minutesLength + extraMinutes;
    visitMinutes = Math.max(visitMinutes, 0);

    return visitMinutes;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Get the visit's extra minutes from the edit dialog.

neuro.cal.getExtraMinutesFromEdit = function () {

    var extraMinutes;

    extraMinutes = parseInt($('#' + neuro.cal.editDialogExtraMinutesID).val(), 10);

    return extraMinutes;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Calculate actual visit minutes from the two time fields.

neuro.cal.calcActualVisitMinutesFromEdit = function () {

    var $datePicker, $arrivalTime, $departureTime;
    var arrivalTimeParseable, departureTimeParseable;
    var arrivalDateTime, departureDateTime;
    var actualMinutes;

    $datePicker = $('#' + neuro.cal.editDialogDatePickerID);
    $arrivalTime = $('#' + neuro.cal.editDialogActualArrivalTimeID);
    arrivalTimeParseable = adacare.lib.FormatParseableTimeStr(adacare.lib.parseTime($arrivalTime.val()));

    $departureTime = $('#' + neuro.cal.editDialogActualDepartureTimeID);
    departureTimeParseable = adacare.lib.FormatParseableTimeStr(adacare.lib.parseTime($departureTime.val()));

    // The parseable time is added to the visit date to get an accurate date/time.

    arrivalDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, $datePicker.val(), arrivalTimeParseable);
    departureDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, $datePicker.val(), departureTimeParseable);

    // If the departure crosses over midnight, add a day to its base date.
    // I think this will handle daylight savings crossover as well, but that
    // assumes the user's PC is set correctly for the local time zone and DST.

    if (departureDateTime.getTime() <= arrivalDateTime.getTime()) {
        departureDateTime.setDate(departureDateTime.getDate() + 1);
    }

    actualMinutes = Math.floor((departureDateTime.getTime() - arrivalDateTime.getTime()) / neuro.cal.MS_PER_MINUTE);

    return actualMinutes;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the billing or payroll minutes and travel.

neuro.cal.editvisit.displayBillingMinutes = function (minutes) {

    var minutesStr;

    minutesStr = adacare.lib.formatHoursMinutes(minutes);
    $('#' + neuro.cal.editDialogBillingMinutesID).val(minutesStr);
};

neuro.cal.editvisit.displayBillingTravel = function (distance) {

    var distanceStr;

    distanceStr = adacare.lib.formatMileage(distance);
    $('#' + neuro.cal.editDialogBillingTravelID).val(distanceStr);
};

neuro.cal.editvisit.displayPayrollMinutes = function (minutes) {

    var minutesStr;

    minutesStr = adacare.lib.formatHoursMinutes(minutes);
    $('#' + neuro.cal.editDialogPayrollMinutesID).val(minutesStr);
};

neuro.cal.editvisit.displayPayrollTravel = function (distance) {

    var distanceStr;

    distanceStr = adacare.lib.formatMileage(distance);
    $('#' + neuro.cal.editDialogPayrollTravelID).val(distanceStr);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in the Visit Final Status in the edit dialog. The DropDownList is referenced
// by "this".

neuro.cal.editvisit.ChangeVisitFinalStatusSelect = function (eventObject) {

    var v, visitID;
    var visitFinalStatusOrig, visitFinalStatusNew;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];
    visitFinalStatusOrig = v.visitFinalStatus;
    visitFinalStatusNew = $('#' + neuro.cal.editDialogVisitFinalStatusID).val();

    // If the VisitFinalStatus is changing from "pending" to anything else, we put default values
    // into the arrival and departure times.

    if (visitFinalStatusOrig === neuro.cal.VISITFINALSTATUS_PENDING && visitFinalStatusNew !== neuro.cal.VISITFINALSTATUS_PENDING) {
        neuro.cal.recalcArrivalDepartureTimes(v);
    }

    // If we changed to a "canceled" status, turn off the billable and payable checkboxes.
    // If the caregiver was a no-show, then we turn off both as well.

    if (visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_CANCELED_BY_CAREGIVER ||
        visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_CANCELED_BY_CLIENT ||
        visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_CANCELED_ON_HOLD ||
        visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_CANCELED_OTHER) {

        $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked', false);
        $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked', false);
    }

    else if (visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_NOSHOW_CAREGIVER) {

        $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked', false);
        $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked', false);
    }

        // If we changed to kept or pending, and we're *not* coming from kept or pending,
        // then we'll turn the options back on. This is useful for situations where the 
        // user "un-cancels" a visit, and still guards the cases where a pending visit 
        // deliberately had the billing/payroll options turned off.

    else if ((visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_PENDING || visitFinalStatusNew === neuro.cal.VISITFINALSTATUS_KEPT)
    && !(neuro.cal.VisitFinalStatusCurrent === neuro.cal.VISITFINALSTATUS_PENDING || neuro.cal.VisitFinalStatusCurrent === neuro.cal.VISITFINALSTATUS_KEPT)) {

        $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked', true);
        $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked', true);
    }

    neuro.cal.VisitFinalStatusCurrent = visitFinalStatusNew; // Remember for next time
    neuro.cal.editvisit.showOrHideArrivalDepartureTimes();
    neuro.cal.updateBillingAndPayrollHoursFromEdit();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the staff in the edit dialog. The staff ID is selected in the
// DropDownList referenced by "this".

neuro.cal.editvisit.ChangeStaffSelect = function (eventObject) {

    var elemID = this.id;
    var v, visitID, clientID, staffID;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];

    clientID = v.clientID;
    staffID = Number($('#' + elemID).val());

    neuro.cal.editvisit.EraseStaffForEdit();
    neuro.cal.editvisit.EraseMapUrlsForEditStaff();
    neuro.cal.editvisit.InitStaffForEdit(staffID, v.visitDate);

    neuro.cal.editvisit.InitMapUrlsForEditStaff(clientID, staffID);
    neuro.cal.fetchBillingAndPayrollRatesWS();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the contract in the edit dialog. The contract ID is selected 
// in the DropDownList referenced by "this".

neuro.cal.editvisit.ChangeContractSelect = function (eventObject) {

    // Only the billing and payroll special rates need to be reloaded.

    neuro.cal.fetchBillingAndPayrollRatesWS();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the visit type in the edit dialog. The visit type ID is selected 
// in the DropDownList referenced by "this".

neuro.cal.editvisit.ChangeVisitTypeSelect = function (eventObject) {

    var v, visitID;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];

    neuro.cal.fetchBillingAndPayrollRatesWS();
    neuro.cal.recalcArrivalDepartureTimes(v);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the extra minutes selection in the edit dialog.

neuro.cal.editvisit.ChangeExtraMinutesSelect = function (eventObject) {

    var v, visitID;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];

    neuro.cal.recalcArrivalDepartureTimes(v);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the date picker in the edit dialog.

neuro.cal.editvisit.ChangeDatePicker = function (eventObject) {

    // Only the billing and payroll special rates need to be reloaded.

    neuro.cal.fetchBillingAndPayrollRatesWS();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in selection of the visit's time picker in the edit dialog.

neuro.cal.editvisit.ChangeTimePicker = function (eventObject) {

    var v, visitID;

    visitID = $('#' + neuro.cal.editDialogVisitIDID).val();
    v = neuro.cal.visitList[visitID];

    neuro.cal.recalcArrivalDepartureTimes(v);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle the close of the edit dialog.
//
// The user may choose to save the changes, delete the visit entirely,
// or just cancel.

neuro.cal.editvisit.Button = function (thisEditDialog, visitID, action) {

    var isValid;
    var v;

    switch (action) {

        // User clicked "Update" in the edit dialog.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        // Save the edited visit.                                                                                                                                                                                                                                                                               

        case 'update':
            //$('#' + neuro.cal.editDialogStaffIDID).unbind(); // Unnecessary?

            // This is crude! We're validating the only two possibly invalid elements.

            isValid = $('form').validate().element('#' + neuro.cal.editDialogActualArrivalTimeID)
                && $('form').validate().element('#' + neuro.cal.editDialogActualDepartureTimeID);

            if (isValid) {
                v = neuro.cal.visitList[visitID];

                if (!v.freqOnce && neuro.cal.editvisit.HasScheduleChanges(v)) {
                    adacare.lib.confirmDialog3Button(
                'Confirm Update',
                neuro.cal.editvisit.ConfirmUpdateDialogID,
                function () { neuro.cal.editvisit.Button(thisEditDialog, visitID, 'updateOneShot'); },
                function () { neuro.cal.editvisit.Button(thisEditDialog, visitID, 'updateAllFuture'); },
                null,
                'This visit only',
                'All future visits',
                null,
                neuro.cal.editvisit.ConfirmUpdateDialogMsgID,
                'Do you also want to update the schedule for all future visits?' +
                ' (You may notice new visit schedules for "before" and "after" - this is normal.)'
                );
                }
                else {
                    neuro.cal.editvisit.Button(thisEditDialog, visitID, 'updateOneShot');
                }
            }
            break;

        case 'updateOneShot':
            $(thisEditDialog).dialog('destroy');
            neuro.cal.editvisit.updateAfterEdit(visitID, false);
            break;

        case 'updateAllFuture':
            $(thisEditDialog).dialog('destroy');
            neuro.cal.editvisit.updateAfterEdit(visitID, true);
            break;

            // User clicked "delete" in the edit dialog.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
            // Pop up a confirmation. If ok, then proceed with deletion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
            // If cancel, then close the confirmation and leave the original edit dialog in place.                                                                                                                                                                                                                                                                                                                           

        case 'delete':

            v = neuro.cal.visitList[visitID];

            if (!v.freqOnce) {
                adacare.lib.confirmDialog3Button(
                'Confirm Delete',
                neuro.cal.editvisit.ConfirmDeleteDialogID,
                function () { neuro.cal.editvisit.Button(thisEditDialog, visitID, 'deleteOneShot'); },
                function () { neuro.cal.editvisit.Button(thisEditDialog, visitID, 'deleteAllFuture'); },
                null,
                'This visit only',
                'All future visits',
                null,
                neuro.cal.editvisit.ConfirmDeleteDialogMsgID,
                'Do you also want to delete the schedule for all future visits?' +
                ' (You may notice new visit schedules for "before" and "after" - this is normal.)'
                );
            }
            else {
                adacare.lib.confirmDialog2Button(
                'Confirm Delete',
                neuro.cal.editvisit.ConfirmDeleteDialogID,
                function () { neuro.cal.editvisit.Button(thisEditDialog, visitID, 'deleteOneShot'); },
                null,
                'Delete',
                null,
                neuro.cal.editvisit.ConfirmDeleteDialogMsgID,
                'Are you sure you want to delete this visit?'
                );
            }
            break;

        case 'deleteOneShot':
            $(thisEditDialog).dialog('destroy');
            neuro.cal.editvisit.deleteVisitJoinWS(visitID, false);
            break;

        case 'deleteAllFuture':
            $(thisEditDialog).dialog('destroy');
            neuro.cal.editvisit.deleteVisitJoinWS(visitID, true);
            break;

            // This case is *not* from the user clicking "cancel," which is already closed in the 
            // adacare.lib.confirmDialog3Button function. Rather, it is only used when a web service 
            // (like fetching the client info) fails when the dialog is opened.

        case 'cancel':
            //$('#' + neuro.cal.editDialogStaffIDID).unbind(); // Unnecessary?
            $(thisEditDialog).dialog('destroy');
            break;

            // Any other option is a programming error.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

        default:
            throw new Error('neuro.cal.editDialogClose: bad action from caller (' + action + ')');
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return true if the edit dialog had any changes that affect the schedule. If not, then asking
// the user if she want to update all future visits is moot.

neuro.cal.editvisit.HasScheduleChanges = function (v) {

    var dateStr, timeStr;
    var newVisitDateTime, newStaffID, newVisitTypeID, newExtraMinutes;
    var hasChanges;

    dateStr = $('#' + neuro.cal.editDialogDatePickerID).val();
    timeStr = $('#' + neuro.cal.editDialogTimePickerID).val();
    newVisitDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, dateStr, timeStr);

    newStaffID = Number($('#' + neuro.cal.editDialogStaffIDID).val());
    newVisitTypeID = Number($('#' + neuro.cal.editDialogVisitTypeID).val());
    newExtraMinutes = parseInt($('#' + neuro.cal.editDialogExtraMinutesID).val(), 10);

    hasChanges =
        (newVisitDateTime.valueOf() != v.begDateTime.valueOf()) ||
        (newStaffID != v.staffID) ||
        (newVisitTypeID != v.visitTypeID) ||
        (newExtraMinutes != v.extraMinutes);

    return hasChanges;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a visit drag.

neuro.cal.editvisit.DragEnd = function (e, ui) {

    var vElem, visitID, v;
    var isInside;
    var vElemPos, vElemOffset, slot0Offset;
    var slotNew;
    var newVisitDateTime, newStaffID;
    var clientIDTest, goodMove;

    if (!e) { e = window.event; }
    vElem = this;
    visitID = vElem.visitID;
    v = neuro.cal.visitList[visitID];

    // See if the user dragged to a location that's inside the calendar. If not, then we'll
    // just put the visit element back where it belongs and ignore the drag.

    switch (neuro.cal.calType) {

        case neuro.cal.CALTYPE_OVERLAY:
            vElemPos = $('#' + vElem.id).position();
            isInside = neuro.cal.inbounds(vElemPos.top, vElemPos.left);
            break;

        case neuro.cal.CALTYPE_STACKED:

            // Stacked calendars have slots contained within table cells. Thus, the position()
            // function returns the position within the cell, which isn't very useful. So, we
            // use the offset() function instead, which returns the location within the entire
            // document.
            // TODO: Should we use the same method for overlay calendar above?

            vElemOffset = $('#' + vElem.id).offset();
            slot0Offset = $('#' + neuro.cal.slotID(0)).offset();
            isInside = neuro.cal.inbounds(vElemOffset.top - slot0Offset.top, vElemOffset.left - slot0Offset.left);
            break;
    }

    if (!neuro.cal.readOnly) {
        if (isInside) {

            newVisitDateTime = v.begDateTime;
            newStaffID = v.staffID;

            switch (neuro.cal.calType) {
                case neuro.cal.CALTYPE_OVERLAY:
                    slotNew = neuro.cal.mapCoordToSlot(vElemPos.top, vElemPos.left);

                    // We don't allow dragging to change the client, just the staff. So, we allow the date/time
                    // to be changed by the drag, but we remap to the slot without changing the staff.
                    // See how the user likes this. It make be a better idea to just revert the drag if
                    // the user tries to change clients.

                    if (neuro.cal.groupsRepresentStaff) {
                        goodMove = true; // Anywhere inside is fine
                    }
                    else if (neuro.cal.groupsRepresentClients) {
                        clientIDTest = neuro.cal.mapSlotToClientID(slotNew);
                        goodMove = (clientIDTest == v.clientID); // Anywhere except trying to change the client
                    }
                    break;

                case neuro.cal.CALTYPE_STACKED:

                    // Date is the calendar beginning date, plus add a day per column we dragged into.
                    // Time stays the same.

                    slotNew = neuro.cal.mapCoordToSlot(vElemOffset.top - slot0Offset.top, vElemOffset.left - slot0Offset.left);

                    // We don't allow dragging to change the client, just the staff. So, we allow the date/time
                    // to be changed by the drag, but we remap to the slot without changing the staff.
                    // See how the user likes this. It make be a better idea to just revert the drag if
                    // the user tries to change clients.

                    if (neuro.cal.rowsRepresentStaff) {
                        goodMove = true; // Anywhere inside is fine
                    }
                    else if (neuro.cal.rowsRepresentClients) {
                        clientIDTest = neuro.cal.mapSlotToClientID(slotNew);
                        goodMove = (clientIDTest == v.clientID); // Anywhere except trying to change the client
                    }
                    break;
            }
        }
    }

        // Read-only users aren't allowed to drag.

    else {
        goodMove = false;
    }

    if (isInside && goodMove) {

        // If the user has actually dragged to a new slot, then we need to update the visit.
        // Ask the user to confirm, unless this is just a one-shot (non-repeatng) visit.

        if (slotNew != v.slot) {
            if (!v.freqOnce) {
                adacare.lib.confirmDialog3Button(
                'Confirm Update',
                neuro.cal.editvisit.ConfirmUpdateDialogID,
                function () { neuro.cal.editvisit.DragConfirm(v, vElem, 'updateOneShot'); },
                function () { neuro.cal.editvisit.DragConfirm(v, vElem, 'updateAllFuture'); },
                function () { neuro.cal.editvisit.DragConfirm(v, vElem, 'cancel'); },
                'This visit only',
                'All future visits',
                'Cancel',
                neuro.cal.editvisit.ConfirmUpdateDialogMsgID,
                'Do you also want to update the schedule for all future visits?' +
                ' (You may notice new visit schedules for "before" and "after" - this is normal.)'
                );
            }
            else {
                neuro.cal.editvisit.DragConfirm(v, vElem, 'updateOneShot');
            }
        }
        else {
            neuro.cal.editvisit.RedrawAfterCancelDrag(v, vElem);
        }
    }
    else {
        neuro.cal.editvisit.RedrawAfterCancelDrag(v, vElem);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Confirm a visit drag by the user.

neuro.cal.editvisit.DragConfirm = function (v, vElem, action) {

    switch (action) {
        case 'updateOneShot':
            neuro.cal.editvisit.updateAfterDrag(v, vElem, false);
            break;

        case 'updateAllFuture':
            neuro.cal.editvisit.updateAfterDrag(v, vElem, true);
            break;

        case 'cancel':
            neuro.cal.editvisit.RedrawAfterCancelDrag(v, vElem);
            break;

        default:
            throw new Error('Error in neuro.cal.editvisit.DragConfirm: Unexpected action"' + action + '"');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Redraw the visit after canceling a drag 
//
// If the drag ended up out of bounds or was canceled for any other reason, we put it back where it
// came from. The animation below is just for a nice effect.

neuro.cal.editvisit.RedrawAfterCancelDrag = function (v, vElem) {

    if (neuro.cal.calType === neuro.cal.CALTYPE_STACKED) {
        $('#' + vElem.id).animate({ left: 0, top: 0 }, "slow");
    }
    neuro.cal.placeVisit(v, false);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a visit resize by the user.
//
// Note that the resizable() function doesn't work quite as expected.
// Thus, we take the new height and make a few roundings and adjustments.

neuro.cal.editvisit.ResizeEnd = function (e, ui) {

    var vElem, visitID, v;

    if (!e) { e = window.event; }
    vElem = this;
    visitID = vElem.visitID;
    v = neuro.cal.visitList[visitID];

    if (!neuro.cal.readOnly) {
        if (!v.freqOnce) {
            adacare.lib.confirmDialog3Button(
                'Confirm Update',
                neuro.cal.editvisit.ConfirmUpdateDialogID,
                function () { neuro.cal.editvisit.ResizeConfirm(v, vElem, 'updateOneShot'); },
                function () { neuro.cal.editvisit.ResizeConfirm(v, vElem, 'updateAllFuture'); },
                function () { neuro.cal.editvisit.ResizeConfirm(v, vElem, 'cancel'); },
                'This visit only',
                'All future visits',
                'Cancel',
                neuro.cal.editvisit.ConfirmUpdateDialogMsgID,
                'Do you also want to update the schedule for all future visits?' +
                ' (You may notice new visit schedules for "before" and "after" - this is normal.)'
                );
        }
        else {
            neuro.cal.editvisit.ResizeConfirm(v, vElem, 'updateOneShot');
        }
    }

        // Read-only users aren't allowed to resize visits.

    else {
        neuro.cal.editvisit.ResizeConfirm(v, vElem, 'cancel');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Confirm a visit resize by the user.

neuro.cal.editvisit.ResizeConfirm = function (v, vElem, action) {

    switch (action) {
        case 'updateOneShot':
            neuro.cal.editvisit.updateAfterResize(v, vElem, false);
            break;

        case 'updateAllFuture':
            neuro.cal.editvisit.updateAfterResize(v, vElem, true);
            break;

        case 'cancel':
            //neuro.cal.editvisit.updateAfterResize(v, vElem, true);
            neuro.cal.editvisit.RedrawAfterCancelDrag(v, vElem); // TEST - does this fix so redraws after cancel?
            break;

        default:
            throw new Error('Error in neuro.cal.editvisit.ResizeConfirm: Unexpected action"' + action + '"');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete and redraw all visits with the given schedule ID. This function is invoked when the web
// service returns after the user edited a visit.

neuro.cal.editvisit.redrawSchedule = function (CalUpdateInfoList) {

    // These constants must match those in the CalUpdateInfo class.

    neuro.cal.editvisit.ACTION_NONE = 'none';
    neuro.cal.editvisit.ACTION_ADD = 'add';
    neuro.cal.editvisit.ACTION_DELETE = 'delete';
    neuro.cal.editvisit.ACTION_UPDATE = 'update';
    neuro.cal.editvisit.ACTION_TOUCHED = 'touched';

    var CalUpdateInfo; // = new AdaCareWeb.WebServices.CalUpdateInfo();
    var v, visitID, $vElem, slotOld;
    var visitDate, visitDateValue, editDateValue, scheduleIDBefore, outcomeIDBefore;
    var vIndex, i;
    var groupNum;

    for (i = 0; i < CalUpdateInfoList.length; i++) {

        CalUpdateInfo = CalUpdateInfoList[i];
        scheduleIDBefore = CalUpdateInfo.VisitScheduleIDBefore;
        outcomeIDBefore = CalUpdateInfo.VisitOutcomeIDBefore;
        visitDate = CalUpdateInfo.VisitDate;
        editDateValue = new Date(CalUpdateInfo.VisitDateStr).valueOf(); // We must compare date *values*, not date *objects*!

        switch (CalUpdateInfo.Action) {

            case neuro.cal.editvisit.ACTION_ADD:

                visitID = CalUpdateInfo.CalVisitJoin.fakeVisitID;

                // Map the client or staff ID to its group number.

                if (neuro.cal.groupsRepresentStaff) {
                    groupNum = neuro.cal.mapStaffOrClientIDToGroupNum(CalUpdateInfo.CalVisitJoin.staffID);
                }
                else if (neuro.cal.groupsRepresentClients) {
                    groupNum = neuro.cal.mapStaffOrClientIDToGroupNum(CalUpdateInfo.CalVisitJoin.clientID);
                }

                neuro.cal.addVisit(
                    visitID,
                    CalUpdateInfo.CalVisitJoin.visitOutcomeID,
                    CalUpdateInfo.CalVisitJoin.visitScheduleID,
                    CalUpdateInfo.CalVisitJoin.visitDateStr,
                    groupNum,
                    CalUpdateInfo.CalVisitJoin.clientID,
                    CalUpdateInfo.CalVisitJoin.staffID,
                    CalUpdateInfo.CalVisitJoin.scheduleTimeStr,
                    CalUpdateInfo.CalVisitJoin.visitTypeID,
                    CalUpdateInfo.CalVisitJoin.extraMinutes,
                    CalUpdateInfo.CalVisitJoin.visitFinalStatus,
                    CalUpdateInfo.CalVisitJoin.hasProblems,
                    CalUpdateInfo.CalVisitJoin.freqOnce,
                    CalUpdateInfo.CalVisitJoin.isAvailable);

                // Since we don't know the groupnum for this visit when we create it
                // above, we need to fix it up now.

                v = neuro.cal.visitList[visitID];
                v.groupNum = neuro.cal.mapVisitToGroupNum(v);

                // Draw the visit.

                neuro.cal.constructVisitElem(v, visitID, visitID);
                neuro.cal.placeVisit(v, false);
                neuro.cal.enableWidgetsForOneVisit(visitID);
                break;

                // Find the visit in our list, and delete it.                                                                                                                                                                                                                                                                      

            case neuro.cal.editvisit.ACTION_DELETE:

                vIndex = 0;
                for (visitID in neuro.cal.visitList) {
                    v = neuro.cal.visitList[visitID];
                    visitDateValue = v.visitDate.valueOf();

                    if (((v.scheduleID > 0 && v.scheduleID == scheduleIDBefore) || (v.outcomeID > 0 && v.outcomeID == outcomeIDBefore)) &&
                        visitDateValue == editDateValue) {

                        // Remove the visit from the list

                        neuro.cal.deleteVisit(visitID);
                        delete neuro.cal.visitList[visitID]; // Delete the object from the list
                        break;
                    }
                    vIndex++;
                }
                break;

            case neuro.cal.editvisit.ACTION_UPDATE:

                for (visitID in neuro.cal.visitList) {
                    v = neuro.cal.visitList[visitID];
                    visitDateValue = v.visitDate.valueOf();

                    // BUG: outcomeID = -1 matches many visits (any VisitSchedule w/o VisitOutcome) -- ditto above
                    if (((v.scheduleID > 0 && v.scheduleID == scheduleIDBefore) || (v.outcomeID > 0 && v.outcomeID == outcomeIDBefore)) &&
                        visitDateValue == editDateValue) {

                        // Modify and redisplay the visit

                        slotOld = v.slot;

                        v.scheduleID = CalUpdateInfo.CalVisitJoin.visitScheduleID;
                        v.outcomeID = CalUpdateInfo.CalVisitJoin.visitOutcomeID;
                        v.staffID = CalUpdateInfo.CalVisitJoin.staffID;
                        v.visitTypeID = CalUpdateInfo.CalVisitJoin.visitTypeID;
                        v.extraMinutes = CalUpdateInfo.CalVisitJoin.extraMinutes;
                        v.visitFinalStatus = CalUpdateInfo.CalVisitJoin.visitFinalStatus;
                        v.visitDate = new Date(CalUpdateInfo.CalVisitJoin.visitDateStr);
                        v.begDateTime = new Date(CalUpdateInfo.CalVisitJoin.scheduleTimeStr);
                        v.hasProblems = CalUpdateInfo.CalVisitJoin.hasProblems;
                        v.freqOnce = CalUpdateInfo.CalVisitJoin.freqOnce;
                        v.isAvailable = CalUpdateInfo.CalVisitJoin.isAvailable;

                        v.groupNum = neuro.cal.mapVisitToGroupNum(v);
                        v.slot = neuro.cal.mapVisitToSlot(v);
                        neuro.cal.editvisit.redrawVisit(v, slotOld);
                        break;
                    }
                    //vIndex++;
                }
                break;

                // These visits were touched by an edited visit, so their "busy" status may have changed.                                                                                                                                                                                                       

            case neuro.cal.editvisit.ACTION_TOUCHED:

                for (visitID in neuro.cal.visitList) {
                    v = neuro.cal.visitList[visitID];
                    visitDateValue = v.visitDate.valueOf();

                    // BUG: outcomeID = -1 matches many visits (any VisitSchedule w/o VisitOutcome) -- ditto above
                    if (((v.scheduleID > 0 && v.scheduleID == scheduleIDBefore) || (v.outcomeID > 0 && v.outcomeID == outcomeIDBefore)) &&
                        visitDateValue == editDateValue) {

                        // See if the "busy" status has changed. If so, we need to redraw it.

                        if (CalUpdateInfo.CalVisitJoin.hasProblems != v.hasProblems) {
                            v.hasProblems = CalUpdateInfo.CalVisitJoin.hasProblems;
                            $vElem = $('#' + neuro.cal.elemID(v.visitID));
                            neuro.cal.addWarningClass(v, $vElem);
                        }
                    }
                }
                break;

            default:
                throw new Error('Error in neuro.cal.editvisit.redrawSchedule: Unexpected action"' + CalUpdateInfo.Action + '"');
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Redraw a single visit after editing.

neuro.cal.editvisit.redrawVisit = function (v, slotOld) {

    var vElem;
    var endDateTime;
    var elemFullname;
    var vElemTimeID, vElemMinutesID, vElemHeaderID;
    var slotNew;

    vElem = document.getElementById(neuro.cal.elemID(v.visitID));

    endDateTime = new Date(v.begDateTime.getTime() + (v.baseMinutes() + v.extraMinutes) * neuro.cal.MS_PER_MINUTE);

    // The visit's staff and/or date/time may have been changed. If it is still within the bounds of the calendar,
    // we place it in its new slot and clean up the old slot where it used to be.

    slotNew = v.slot;
    if ((slotNew >= 0) && (v.groupNum >= 0) && (neuro.cal.withinCalDateSpan(v.begDateTime) || neuro.cal.withinCalDateSpan(endDateTime))) {

        vElemTimeID = neuro.cal.elemTimeID(v.visitID);
        $('#' + vElemTimeID).text(neuro.cal.visitTimeStr(v));

        vElemMinutesID = neuro.cal.elemMinutesID(v.visitID);
        $('#' + vElemMinutesID).text(neuro.cal.timeStr(v.endDateTime()));

        vElemHeaderID = neuro.cal.elemHeaderID(v.visitID);
        elemFullname = (neuro.cal.viewWho === neuro.cal.VIEWWHO_CLIENT) ? neuro.cal.getStaff(v.staffID).fullname : neuro.cal.clientList[v.clientID].fullname;
        $('#' + vElemHeaderID).text(elemFullname);

        neuro.cal.placeVisit(v, false);
        if (slotOld != v.slot) {
            neuro.cal.sortVisitsInSlot(slotOld, false);
        }
    }

        // If the visit was moved off of the calendar, then we need to make the DIV disappear
        // and clean up the slot where it used to be.

    else {
        $('#' + v.vElemID + ',#' + v.vElemOflowID).hide('drop', { direction: 'right' });
        v.hidden = true;
        neuro.cal.sortVisitsInSlot(slotOld, false);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a VisitJoin. This function is called whenever a user has updated from the edit visit dialog.

neuro.cal.editvisit.updateAfterEdit = function (visitID, updateAllFuture) {

    var v;
    var dateStr, timeStr;
    var newVisitDateTime, newStaffID, newContractID, newVisitTypeID, newExtraMinutes;
    var newVisitFinalStatus, newActualArrivalDateTime, newActualDepartureDateTime, newIsConfirmed, newIsBillableToClient, newIncludeInPayroll;
    var newBillingMinutes, newBillingTravel, newPayrollMinutes, newPayrollTravel;
    var newVisitNotes, newSupervisorNotes;
    var VSEValues;

    v = neuro.cal.visitList[visitID];

    dateStr = $('#' + neuro.cal.editDialogDatePickerID).val();
    timeStr = $('#' + neuro.cal.editDialogTimePickerID).val();
    newVisitDateTime = adacare.lib.parseDateTimeLocalized(adacare.lib.countryAbbr, dateStr, timeStr);

    newStaffID = Number($('#' + neuro.cal.editDialogStaffIDID).val());
    newContractID = Number($('#' + neuro.cal.editDialogContractID).val());
    newVisitTypeID = Number($('#' + neuro.cal.editDialogVisitTypeID).val());
    newExtraMinutes = parseInt($('#' + neuro.cal.editDialogExtraMinutesID).val(), 10);
    newVisitFinalStatus = $('#' + neuro.cal.editDialogVisitFinalStatusID).val();
    newActualArrivalDateTime = neuro.cal.editvisit.getArrivalDepartureTimes(neuro.cal.editDialogActualArrivalTimeID);
    newActualDepartureDateTime = neuro.cal.editvisit.getArrivalDepartureTimes(neuro.cal.editDialogActualDepartureTimeID);
    newIsConfirmed = $('#' + neuro.cal.editDialogIsConfirmedID).prop('checked');
    newIsBillableToClient = $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked');
    newIncludeInPayroll = $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked');

    newBillingMinutes = adacare.lib.stringToHoursMinutes($('#' + neuro.cal.editDialogBillingMinutesID).val());
    newBillingTravel = Number($('#' + neuro.cal.editDialogBillingTravelID).val());
    newBillingTravel = (isNaN(newBillingTravel) ? 0 : newBillingTravel);

    newPayrollMinutes = adacare.lib.stringToHoursMinutes($('#' + neuro.cal.editDialogPayrollMinutesID).val());
    newPayrollTravel = Number($('#' + neuro.cal.editDialogPayrollTravelID).val());
    newPayrollTravel = (isNaN(newPayrollTravel) ? 0 : newPayrollTravel);

    VSEValues = adacare.vsSpecialRatesEditor.GetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID);

    newVisitNotes = $('#' + neuro.cal.editDialogVisitNotesID).val();
    newSupervisorNotes = $('#' + neuro.cal.editDialogSupervisorNotesID).val();

    neuro.cal.editvisit.updateVisitJoinWS(v, updateAllFuture, false, newVisitDateTime, newStaffID, newContractID, newVisitTypeID, newExtraMinutes,
        newVisitFinalStatus, newActualArrivalDateTime, newActualDepartureDateTime, newIsConfirmed, newIsBillableToClient, newIncludeInPayroll,
        newBillingMinutes, newBillingTravel, newPayrollMinutes, newPayrollTravel,
        VSEValues.billingUseThisRate, VSEValues.billingFlatRate, VSEValues.billingHourlyRate, VSEValues.billingTravelRate,
        VSEValues.payrollUseThisRate, VSEValues.payrollFlatRate, VSEValues.payrollHourlyRate, VSEValues.payrollTravelRate,
        newVisitNotes, newSupervisorNotes);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a VisitJoin. This function is called whenever a user has updated by dragging a visit.

neuro.cal.editvisit.updateAfterDrag = function (v, vElem, updateAllFuture) {

    var newVisitDate, newVisitDateTime, newStaffID, newVisitTypeID, newExtraMinutes; //, newNotes;
    var vElemPos, vElemOffset, slot0Offset;
    var slotNew, visitDate, visitTimeMs;

    // These fields don't change from a resize, so we just use the original values.

    newVisitDateTime = v.begDateTime;
    newStaffID = v.staffID;
    newVisitTypeID = v.visitTypeID;
    newExtraMinutes = v.extraMinutes;

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            vElemPos = $('#' + vElem.id).position();
            slotNew = neuro.cal.mapCoordToSlot(vElemPos.top, vElemPos.left);
            newVisitDateTime = neuro.cal.mapSlotToDateTime(slotNew);

            // We don't allow dragging to change the client, just the staff. So, we allow the date/time
            // to be changed by the drag, but we remap to the slot without changing the staff.
            // See how the user likes this. It make be a better idea to just revert the drag if
            // the user tries to change clients.

            if (neuro.cal.groupsRepresentStaff) {
                newStaffID = neuro.cal.mapSlotToStaffID(slotNew);
            }
            else if (neuro.cal.groupsRepresentClients) {
                slotNew = neuro.cal.mapVisitToSlotByParms(v.clientID, v.staffID, newVisitDateTime, v.groupNum);
            }
            break;

        case neuro.cal.CALTYPE_STACKED:

            // Date is the calendar beginning date, plus add a day per column we dragged into.
            // Time stays the same.

            vElemOffset = $('#' + vElem.id).offset();
            slot0Offset = $('#' + neuro.cal.slotID(0)).offset();
            slotNew = neuro.cal.mapCoordToSlot(vElemOffset.top - slot0Offset.top, vElemOffset.left - slot0Offset.left);
            visitDate = neuro.cal.dateTrunc(v.begDateTime);
            visitTimeMs = v.begDateTime.getTime() - visitDate.getTime();
            //newVisitDateTime = new Date(neuro.cal.begDate.getTime() + neuro.cal.mapSlotToRowCol(slotNew).col * neuro.cal.MS_PER_DAY + visitTime.getTime());
            newVisitDate = neuro.cal.begDate.addDays(neuro.cal.mapSlotToRowCol(slotNew).col);
            newVisitDateTime = new Date(newVisitDate.getTime() + visitTimeMs);

            // We don't allow dragging to change the client, just the staff. So, we allow the date/time
            // to be changed by the drag, but we remap to the slot without changing the staff.
            // See how the user likes this. It make be a better idea to just revert the drag if
            // the user tries to change clients.

            if (neuro.cal.rowsRepresentStaff) {
                newStaffID = neuro.cal.mapSlotToStaffID(slotNew);
            }
            else if (neuro.cal.rowsRepresentClients) {
                slotNew = neuro.cal.mapVisitToSlotByParms(newVisitDateTime, v.groupNum);
            }
            break;
    }

    neuro.cal.editvisit.updateVisitJoinWS(v, updateAllFuture, true,
        newVisitDateTime, newStaffID, 0, newVisitTypeID, newExtraMinutes, '', null, null, false, false, false, 0, 0, 0, 0,
        false, 0, 0, 0, false, 0, 0, 0, '', '');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a VisitJoin. This function is called whenever a user has updated by resizing a visit.

neuro.cal.editvisit.updateAfterResize = function (v, vElem, updateAllFuture) {

    var newVisitDateTime, newStaffID, newVisitTypeID, newExtraMinutes; //, newNotes;
    var parentHeight, oflowHeight = 0, newSlots, newMinutes;

    // Get the height of the visit's parent element.

    parentHeight = $('#' + v.vElemID).outerHeight();

    // See if we resized the parent element or its overflow element.
    // If this is the overflow element, we need to add in the overflow's slots.

    if (vElem.id == v.vElemOflowID) {
        oflowHeight = $('#' + v.vElemOflowID).outerHeight();
    }

    newSlots = Math.round((parentHeight + oflowHeight) / neuro.cal.rowHeight);
    newMinutes = newSlots * neuro.cal.slotMinutes;
    newExtraMinutes = newMinutes - v.baseMinutes();

    if (newExtraMinutes > neuro.cal.MAX_EXTRA_MINUTES) {
        newExtraMinutes = neuro.cal.MAX_EXTRA_MINUTES;
    }
    else if (newExtraMinutes < -neuro.cal.MAX_EXTRA_MINUTES) {
        newExtraMinutes = -neuro.cal.MAX_EXTRA_MINUTES;
    }

    // These fields don't change from a resize, so we just use the original values.

    newVisitDateTime = v.begDateTime;
    newStaffID = v.staffID;
    newVisitTypeID = v.visitTypeID;

    neuro.cal.editvisit.updateVisitJoinWS(v, updateAllFuture, true,
        newVisitDateTime, newStaffID, 0, newVisitTypeID, newExtraMinutes, '', null, null, false, false, false, 0, 0, 0, 0,
        false, 0, 0, 0, false, 0, 0, 0, '', '');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web services for database VisitJoin table.

// Fetch a VisitJoin from the database for the edit dialog.

neuro.cal.editvisit.InitVisitJoinForEdit = function (v) {

    var targetDateUTC;

    targetDateUTC = adacare.lib.convertToUTC(v.visitDate);
    AdaCareWeb.WebServices.CalServices.FetchVisitJoin(
        v.scheduleID, v.outcomeID, targetDateUTC,
        neuro.cal.editvisit.WSSuccess,
        neuro.cal.editvisit.InitVisitJoinForEditWSFailed,
        'neuro.cal.editvisit.InitVisitJoinForEdit',
        null);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Reload a VisitJoin from the database. This is typically used when a schedule has been
// modified and we need to reload and redraw any related visits.

neuro.cal.editvisit.reloadVisitJoinWS = function (scheduleID, outcomeID, targetDate) {

    var targetDateUTC;

    targetDateUTC = adacare.lib.convertToUTC(targetDate);
    AdaCareWeb.WebServices.CalServices.ReloadVisitJoin(
        scheduleID, outcomeID, targetDateUTC,
        neuro.cal.editvisit.WSSuccess,
        neuro.cal.editvisit.WSFailed,
        'neuro.cal.editvisit.reloadVisitJoinWS',
        null);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a VisitJoin. This function is called when the user has made changes via the edit dialog,
// or by dragging or resizing a visit.

neuro.cal.editvisit.updateVisitJoinWS = function (v, updateAllFuture, updateScheduleOnly,
    newVisitDateTime, newStaffID, newContractID, newVisitTypeID, newExtraMinutes,
    newVisitFinalStatus, newActualArrivalDateTime, newActualDepartureDateTime, newIsConfirmed, newIsBillableToClient, newIncludeInPayroll,
    newBillingMinutes, newBillingTravel, newPayrollMinutes, newPayrollTravel,
    newBillingUseThisRate, newBillingFlatRate, newBillingHourlyRate, newBillingTravelRate,
    newPayrollUseThisRate, newPayrollFlatRate, newPayrollHourlyRate, newPayrollTravelRate,
    newVisitNotes, newSupervisorNotes) {

    var origVisitDateUTC, newVisitDateUTC, newVisitDateTimeUTC;
    var begDateCalUTC, endDateCalUTC;
    var calVisitJoin = new AdaCareWeb.WebServices.CalVisitJoin();

    // For the parameters we pass to the web service, we need to identify this visit
    // by its date, VisitSchedule, and VisitOutcome IDs. We also pass the new values
    // from the editing dialog.

    origVisitDateUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(v.visitDate));
    newVisitDateUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(newVisitDateTime));
    newVisitDateTimeUTC = adacare.lib.convertToUTC(newVisitDateTime);

    // The web service needs to know the date range of the calendar being displayed.

    begDateCalUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(neuro.cal.begDateTime));
    endDateCalUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(neuro.cal.endDateTime));

    calVisitJoin.fakeVisitID = '';
    calVisitJoin.visitDate = origVisitDateUTC;          // Date of the original visit
    calVisitJoin.visitScheduleID = v.scheduleID;
    calVisitJoin.visitOutcomeID = v.outcomeID;
    calVisitJoin.clientID = v.clientID;
    calVisitJoin.staffID = newStaffID;
    calVisitJoin.contractID = newContractID;
    calVisitJoin.visitTypeID = newVisitTypeID;
    calVisitJoin.scheduleDate = newVisitDateUTC;        // Date of the edited visit
    calVisitJoin.scheduleTime = newVisitDateTimeUTC;
    calVisitJoin.extraMinutes = newExtraMinutes;
    calVisitJoin.visitFinalStatus = newVisitFinalStatus;
    calVisitJoin.actualArrivalDateTime = (newActualArrivalDateTime !== null ? adacare.lib.convertToUTC(newActualArrivalDateTime) : null);
    calVisitJoin.actualDepartureDateTime = (newActualDepartureDateTime !== null ? adacare.lib.convertToUTC(newActualDepartureDateTime) : null);
    calVisitJoin.isConfirmed = newIsConfirmed;
    calVisitJoin.isBillableToClient = newIsBillableToClient;
    calVisitJoin.includeInPayroll = newIncludeInPayroll;
    calVisitJoin.billingMinutes = newBillingMinutes;
    calVisitJoin.billingTravel = newBillingTravel;
    calVisitJoin.payrollMinutes = newPayrollMinutes;
    calVisitJoin.payrollTravel = newPayrollTravel;
    calVisitJoin.billingUseThisRate = newBillingUseThisRate;
    calVisitJoin.billingFlatRate = newBillingFlatRate;
    calVisitJoin.billingHourlyRate = newBillingHourlyRate;
    calVisitJoin.billingTravelRate = newBillingTravelRate;
    calVisitJoin.payrollUseThisRate = newPayrollUseThisRate;
    calVisitJoin.payrollFlatRate = newPayrollFlatRate;
    calVisitJoin.payrollHourlyRate = newPayrollHourlyRate;
    calVisitJoin.payrollTravelRate = newPayrollTravelRate;
    calVisitJoin.visitNotes = newVisitNotes;
    calVisitJoin.supervisorNotes = newSupervisorNotes;

    AdaCareWeb.WebServices.CalServices.UpdateVisitJoinWS(
        calVisitJoin, updateAllFuture, updateScheduleOnly,
        begDateCalUTC, endDateCalUTC,
        neuro.cal.editvisit.WSSuccess,
        neuro.cal.editvisit.UpdateVisitJoinWSFailed,
        'neuro.cal.editvisit.updateVisitJoinWS',
        null);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a VisitJoin. This function is called whenever a user has deleted the record
// from the edit visit dialog.

neuro.cal.editvisit.deleteVisitJoinWS = function (visitID, updateAllFuture) {

    //var dateStr, timeStr;
    var v, origDateUTC;
    var begDateCalUTC, endDateCalUTC;
    var calVisitJoin = new AdaCareWeb.WebServices.CalVisitJoin();

    v = neuro.cal.visitList[visitID];

    // For the parameters we pass to the web service, we need to identify this visit
    // by its date, VisitSchedule, and VisitOutcome IDs. We also pass the new values
    // from the editing dialog.

    origDateUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(v.visitDate));

    // The web service needs to know the date range of the calendar being displayed.

    begDateCalUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(neuro.cal.begDateTime));
    endDateCalUTC = adacare.lib.convertToUTC(neuro.cal.dateTrunc(neuro.cal.endDateTime));

    calVisitJoin.fakeVisitID = '';
    calVisitJoin.visitDate = origDateUTC;               // Date of the original visit
    calVisitJoin.visitScheduleID = v.scheduleID;
    calVisitJoin.visitOutcomeID = v.outcomeID;
    calVisitJoin.scheduleDate = origDateUTC; // newDateUTC;             // Date of the edited visit

    AdaCareWeb.WebServices.CalServices.DeleteVisitJoinWS(
        calVisitJoin, updateAllFuture,
        begDateCalUTC, endDateCalUTC,
        neuro.cal.editvisit.WSSuccess,
        neuro.cal.editvisit.DeleteVisitJoinWSFailed,
        'neuro.cal.editvisit.deleteVisitJoinWS',
        null);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copy the ScheduledVisit record into the edit dialog.

neuro.cal.editvisit.WSSuccess = function (returnedValue, context, methodName) {

    var calVisitJoin = new AdaCareWeb.WebServices.CalVisitJoin();
    var calClient = new AdaCareWeb.WebServices.CalClient();
    var calStaff = new AdaCareWeb.WebServices.CalStaff();
    var calMap = new AdaCareWeb.WebServices.CalMap();
    var calBillingAndPayrollRates = new AdaCareWeb.WebServices.CalBillingAndPayrollRates();
    var actualArrivalDateTimeLocal, actualDepartureDateTimeLocal;
    var msg;
    var schedulingNotes = '', visitNotes = '', supervisorNotes = '';
    var VSEValues = new adacare.vsSpecialRatesEditor.VSEValues();
    var v, visitID;
    var elemID;
    var telephonyID = '';
    var address = '', cityState = '', resPhone = '', mobilePhone = '', contactInfo = '', emailAddress = '', emailAddressUrl = '', schedulingPrefs = '', payrollMinutesToString = '';
    var problemStr, i;
    var groupNum;

    switch (methodName) {

        case 'FetchVisitJoin':

            if (returnedValue !== null) {

                calVisitJoin = returnedValue;
                visitID = returnedValue.fakeVisitID;

                // Beware! If another user splits the schedule so that this visit has a new visit ID, then the
                // info in the visitList[] will be out of date. It's possible that the visit returned will be
                // null. What to do? Pop up a warning to refresh?

                v = neuro.cal.visitList[visitID];

                if (visitID !== -1) { // Why is this test here? Just old crap?
                    schedulingNotes = adacare.lib.stringNullToEmpty(calVisitJoin.schedulingNotes);
                    visitNotes = adacare.lib.stringNullToEmpty(calVisitJoin.visitNotes);
                    supervisorNotes = adacare.lib.stringNullToEmpty(calVisitJoin.supervisorNotes);
                }

                $('#' + neuro.cal.editDialogContractID).val(calVisitJoin.contractID);
                $('#' + neuro.cal.editDialogVisitFinalStatusID).val(calVisitJoin.visitFinalStatus);
                $('#' + neuro.cal.editDialogIsConfirmedID).prop('checked', calVisitJoin.isConfirmed);
                $('#' + neuro.cal.editDialogIsBillableToClientID).prop('checked', calVisitJoin.isBillableToClient);
                $('#' + neuro.cal.editDialogIncludeInPayrollID).prop('checked', calVisitJoin.includeInPayroll);

                // Display the arrival/departure times.
                //
                // Programmer's note: We don't use the equivalent date/time members of calVisitJoin, because
                // the time zone confuses the software. The date/time is always translated from the server's time
                // zone to the client PC's time zone, like it or not. For example, a 10am time becomes 7am if
                // the server is EST and the client is PST. Converting the value as a string into a local
                // date/time works reliably.

                actualArrivalDateTimeLocal = (calVisitJoin.actualArrivalDateTimeStr ? new Date(calVisitJoin.actualArrivalDateTimeStr) : null);
                actualDepartureDateTimeLocal = (calVisitJoin.actualDepartureDateTimeStr ? new Date(calVisitJoin.actualDepartureDateTimeStr) : null);

                //neuro.cal.editvisit.initArrivalDepartureTimes(v, calVisitJoin.visitFinalStatus, calVisitJoin.actualArrivalDateTime, calVisitJoin.actualDepartureDateTime);
                neuro.cal.editvisit.initArrivalDepartureTimes(v, calVisitJoin.visitFinalStatus, actualArrivalDateTimeLocal, actualDepartureDateTimeLocal);
                neuro.cal.editvisit.showOrHideArrivalDepartureTimes();

                //neuro.cal.editvisit.displayBillingMinutes(calVisitJoin.billingMinutes);
                neuro.cal.editvisit.displayBillingTravel(calVisitJoin.billingTravel);
                //neuro.cal.editvisit.displayPayrollMinutes(calVisitJoin.payrollMinutes);
                neuro.cal.editvisit.displayPayrollTravel(calVisitJoin.payrollTravel);

                neuro.cal.editvisit.setInitialBillingAndPayrollHours(v, calVisitJoin.isBillableToClient, calVisitJoin.billingMinutes, calVisitJoin.includeInPayroll, calVisitJoin.payrollMinutes);

                // Display the vsSpecialRates control

                VSEValues.billingUseThisRate = calVisitJoin.billingUseThisRate;
                VSEValues.billingFlatRate = calVisitJoin.billingFlatRate;
                VSEValues.billingHourlyRate = calVisitJoin.billingHourlyRate;
                VSEValues.billingTravelRate = calVisitJoin.billingTravelRate;
                VSEValues.payrollUseThisRate = calVisitJoin.payrollUseThisRate;
                VSEValues.payrollFlatRate = calVisitJoin.payrollFlatRate;
                VSEValues.payrollHourlyRate = calVisitJoin.payrollHourlyRate;
                VSEValues.payrollTravelRate = calVisitJoin.payrollTravelRate;
                adacare.vsSpecialRatesEditor.SetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID, VSEValues);
            }

            $('#' + neuro.cal.editFrequencyToStringDivID).text(calVisitJoin.frequencyToString);
            $('#' + neuro.cal.editDialogSchedulingNotesID).html(schedulingNotes);
            $('#' + neuro.cal.editDialogVisitNotesID).val(visitNotes);
            $('#' + neuro.cal.editDialogSupervisorNotesID).val(supervisorNotes);

            // Display conflicts. We need to display all conflicts, even if hasProblems is false. This way,
            // even minor (e.g., overtime) problems are displayed to the user.

            //if (calVisitJoin.hasProblems) {
            if (calVisitJoin.problemList.length > 0) {
                $('#' + neuro.cal.editConflictListID).html('');

                problemStr = '';
                for (i = 0; i < calVisitJoin.problemList.length; i++) {
                    if (i > 0) {
                        problemStr += '<br />';
                    }
                    problemStr += calVisitJoin.problemList[i];
                }
                $('#' + neuro.cal.editConflictListID).html(problemStr);
                $('#' + neuro.cal.editConflictDivID).show();
            }
            else {
                $('#' + neuro.cal.editConflictDivID).hide();
            }
            $('#' + neuro.cal.editDialogWhoWhenUpdatedID).text(calVisitJoin.whoWhenUpdated);

            adacare.lib.pleaseWaitPopup('close');
            break;

        case 'ReloadVisitJoin':

            if (returnedValue !== null) {
                calVisitJoin = returnedValue;

                // Map the client or staff ID to its group number.

                if (neuro.cal.groupsRepresentStaff) {
                    groupNum = neuro.cal.mapStaffOrClientIDToGroupNum(calVisitJoin.staffID);
                }
                else if (neuro.cal.groupsRepresentClients) {
                    groupNum = neuro.cal.mapStaffOrClientIDToGroupNum(calVisitJoin.clientID);
                }

                neuro.cal.addVisit(
                    calVisitJoin.fakeVisitID,
                    calVisitJoin.visitOutcomeID,
                    calVisitJoin.visitScheduleID,
                    calVisitJoin.visitDateStr,
                    groupNum,
                    calVisitJoin.clientID,
                    calVisitJoin.staffID,
                    calVisitJoin.scheduleTimeStr,
                    calVisitJoin.visitTypeID,
                    calVisitJoin.extraMinutes,
                    calVisitJoin.visitFinalStatus,
                    calVisitJoin.hasProblems,
                    calVisitJoin.freqOnce,
                    calVisitJoin.isAvailable);

                // Display the visit

                visitID = returnedValue.fakeVisitID;
                v = neuro.cal.visitList[visitID];
                neuro.cal.constructVisitElem(v, visitID, visitID);
                neuro.cal.placeVisit(v, false);
                neuro.cal.enableWidgetsForOneVisit(visitID);
            }
            break;

        case 'UpdateVisitJoinWS':

            neuro.cal.editvisit.redrawSchedule(returnedValue);
            break;

        case 'DeleteVisitJoinWS':

            neuro.cal.editvisit.redrawSchedule(returnedValue);
            break;

        case 'FetchClient':

            if (returnedValue !== null) {
                calClient = returnedValue;
                if (calClient.ID !== -1) {
                    address = adacare.lib.stringNullToEmpty(calClient.ResAddress) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResAddress2);
                    cityState = adacare.lib.stringNullToEmpty(calClient.ResCity) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResState) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResPostalCode);
                    resPhone = adacare.lib.stringTrim(calClient.ResPhone);
                    mobilePhone = adacare.lib.stringTrim(calClient.MobilePhone);
                    contactInfo = adacare.lib.stringTrim(calClient.ContactInfo);
                    emailAddress = adacare.lib.stringTrim(calClient.EmailAddress);

                    telephonyID = adacare.lib.stringTrim(calClient.TelephonyID);
                    if (telephonyID.length > 0) {
                        telephonyID = "#" + telephonyID;
                    }

                    //schedulingPrefs = adacare.lib.stringTrim(calClient.SchedulingPrefs);
                    schedulingPrefs = (calClient.SchedulingPrefs ? adacare.lib.stringTrim(calClient.SchedulingPrefs) : '');
                }
                elemID = neuro.cal.clientOrStaffDetail.mapButtID;
                adacare.lib.initMapButton(elemID, 'Map', 'No Map', calClient.mapUrl);
            }
            if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
            $('#' + neuro.cal.clientOrStaffDetail.addressID).text(address);
            $('#' + neuro.cal.clientOrStaffDetail.cityID).text(cityState);
            $('#' + neuro.cal.clientOrStaffDetail.resPhoneID).text(resPhone);
            $('#' + neuro.cal.clientOrStaffDetail.mobilePhoneID).text(mobilePhone);
            $('#' + neuro.cal.clientOrStaffDetail.emailAddressID).text(emailAddress);
            $('#' + neuro.cal.clientOrStaffDetail.emailAddressUrlID).attr('href', emailAddressUrl);
            $('#' + neuro.cal.clientOrStaffDetail.telephonyIDID).text(telephonyID);
            $('#' + neuro.cal.clientOrStaffDetail.contactInfoID).text(contactInfo);
            $('#' + neuro.cal.clientOrStaffDetail.schedulingPrefsID).text(schedulingPrefs);
            $('#' + neuro.cal.clientOrStaffDetail.detailMinutesID).text(''); // Not used for clients
            break;

        case 'FetchStaff':

            if (returnedValue !== null) {
                calStaff = returnedValue;
                if (calStaff.ID !== -1) {
                    address = adacare.lib.stringNullToEmpty(calStaff.ResAddress) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResAddress2);
                    cityState = adacare.lib.stringNullToEmpty(calStaff.ResCity) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResState) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResPostalCode);
                    resPhone = adacare.lib.stringTrim(calStaff.ResPhone);
                    mobilePhone = adacare.lib.stringTrim(calStaff.MobilePhone);
                    contactInfo = adacare.lib.stringTrim(calStaff.ContactInfo);
                    emailAddress = adacare.lib.stringTrim(calStaff.EmailAddress);

                    telephonyID = adacare.lib.stringTrim(calStaff.TelephonyID);
                    if (telephonyID.length > 0) {
                        telephonyID = "#" + telephonyID;
                    }

                    //schedulingPrefs = adacare.lib.stringTrim(calStaff.SchedulingPrefs);
                    schedulingPrefs = (calStaff.SchedulingPrefs ? adacare.lib.stringTrim(calStaff.SchedulingPrefs) : '');
                    payrollMinutesToString = 'Payroll Hours: ' + calStaff.PayrollMinutesScheduledToString + ' this week';
                }
                elemID = neuro.cal.clientOrStaffDetail.mapButtID;
                adacare.lib.initMapButton(elemID, 'Map', 'No Map', calStaff.mapUrl);
            }
            if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
            $('#' + neuro.cal.clientOrStaffDetail.addressID).text(address);
            $('#' + neuro.cal.clientOrStaffDetail.cityID).text(cityState);
            $('#' + neuro.cal.clientOrStaffDetail.resPhoneID).text(resPhone);
            $('#' + neuro.cal.clientOrStaffDetail.mobilePhoneID).text(mobilePhone);
            $('#' + neuro.cal.clientOrStaffDetail.emailAddressID).text(emailAddress);
            $('#' + neuro.cal.clientOrStaffDetail.emailAddressUrlID).attr('href', emailAddressUrl);
            $('#' + neuro.cal.clientOrStaffDetail.telephonyIDID).text(telephonyID);
            $('#' + neuro.cal.clientOrStaffDetail.contactInfoID).text(contactInfo);
            $('#' + neuro.cal.clientOrStaffDetail.schedulingPrefsID).text(schedulingPrefs);
            $('#' + neuro.cal.clientOrStaffDetail.detailMinutesID).text(payrollMinutesToString);
            break;

        case 'FetchMapUrls':

            if (returnedValue !== null) {
                calMap = returnedValue;
                adacare.lib.initMapButton(neuro.cal.editDialogClientMapButtID, 'Map', 'No Map', calMap.MapUrlClient);
                adacare.lib.initMapButton(neuro.cal.editDialogStaffMapButtID, 'Map', 'No Map', calMap.MapUrlStaff);
                adacare.lib.initMapButton(neuro.cal.editDialogOfficeToClientMapButtID, 'Map Route from Office', 'No Map', calMap.MapUrlOfficeToClient);
                adacare.lib.initMapButton(neuro.cal.editDialogStaffToClientMapButtID, 'Map Route to Client', 'No Map', calMap.MapUrlStaffToClient);
            }
            break;

        case 'FetchBillingAndPayrollRates':

            if (returnedValue !== null) {
                calBillingAndPayrollRates = returnedValue;

                // Look at the existing values in the VSSpecialRatesEditor, and replace only those values
                // that should be changed to the default.

                VSEValues = adacare.vsSpecialRatesEditor.GetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID);

                if (!VSEValues.billingUseThisRate || !VSEValues.payrollUseThisRate) {
                    if (!VSEValues.billingUseThisRate) {
                        VSEValues.billingFlatRate = calBillingAndPayrollRates.BillingAndPayrollRates.BillingFlatRate;
                        VSEValues.billingHourlyRate = calBillingAndPayrollRates.BillingAndPayrollRates.BillingHourlyRate;
                        VSEValues.billingTravelRate = calBillingAndPayrollRates.BillingAndPayrollRates.BillingTravelRate;
                    }

                    if (!VSEValues.payrollUseThisRate) {
                        VSEValues.payrollFlatRate = calBillingAndPayrollRates.BillingAndPayrollRates.PayrollFlatRate;
                        VSEValues.payrollHourlyRate = calBillingAndPayrollRates.BillingAndPayrollRates.PayrollHourlyRate;
                        VSEValues.payrollTravelRate = calBillingAndPayrollRates.BillingAndPayrollRates.PayrollTravelRate;
                    }
                    adacare.vsSpecialRatesEditor.SetValues(neuro.cal.editDialogSpecialRatesEditorSurroundID, VSEValues);
                }
            }
            break;

        default:

            msg = context + ': Unexpected response from web service method "' + methodName + '"!';
            alert(msg);
            break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web services for database Client table.

// Fetch a client for the edit visit dialog.

neuro.cal.fetchClientForEditWS = function (clientID) {

    AdaCareWeb.WebServices.CalServices.FetchClient(clientID, neuro.cal.fetchClientForEditWSSuccess, neuro.cal.fetchClientForEditWSFailed, 'neuro.cal.fetchClientForEditWS');
};

neuro.cal.fetchClientForEditWSSuccess = function (calClient) {

    var address = '', cityState = '', resPhone = '', mobilePhone = '', contactInfo = '', emailAddress = '', emailAddressUrl = '';

    if (calClient !== null) {
        if (calClient.ID !== -1) {
            address = adacare.lib.stringNullToEmpty(calClient.ResAddress) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResAddress2);
            cityState = adacare.lib.stringNullToEmpty(calClient.ResCity) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResState) + ' ' + adacare.lib.stringNullToEmpty(calClient.ResPostalCode);
            resPhone = adacare.lib.stringTrim(calClient.ResPhone);
            mobilePhone = adacare.lib.stringTrim(calClient.MobilePhone);
            emailAddress = adacare.lib.stringTrim(calClient.EmailAddress);
            contactInfo = adacare.lib.stringTrim(calClient.ContactInfo);
        }
    }
    if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
    $('#' + neuro.cal.editDialogClientAddressID).text(address);
    $('#' + neuro.cal.editDialogClientCityID).text(cityState);
    $('#' + neuro.cal.editDialogClientResPhoneID).text(resPhone);
    $('#' + neuro.cal.editDialogClientMobilePhoneID).text(mobilePhone);
    $('#' + neuro.cal.editDialogClientEmailID).text(emailAddress);
    $('#' + neuro.cal.editDialogClientEmailUrlID).attr('href', emailAddressUrl);
    $('#' + neuro.cal.editDialogClientContactInfoID).text(contactInfo);
};

neuro.cal.fetchClientForEditWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        neuro.cal.editvisit.Button(window.document.getElementById(neuro.cal.editDialogID), 0, 'cancel');
        adacare.lib.pleaseWaitPopup('close');
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to retrieve client information!');
    }
};

// Fetch a client for adding a new visit.

neuro.cal.fetchClientForAddVisitWS = function (clientID) {

    AdaCareWeb.WebServices.CalServices.FetchClient(clientID, neuro.cal.fetchClientForAddVisitWSSuccess, neuro.cal.fetchClientForAddVisitWSFailed, 'neuro.cal.fetchClientForAddVisitWS');
};

neuro.cal.fetchClientForAddVisitWSSuccess = function (calClient) {

    var schedulingPrefs = '';
    var visitDate, activeEndDate, activeEndDateLocalizedStr;

    if (calClient !== null) {
        if (calClient.ID !== -1) {
            schedulingPrefs = adacare.lib.stringTrim(calClient.SchedulingPrefs);
        }
    }

    activeEndDate = calClient.ActiveEndDate;

    // Display the client's scheduling prefs and ActiveEndDate.

    $('#' + neuro.cal.addVisitSchedulingPrefsID).text(schedulingPrefs);

    if (activeEndDate != null) {
        activeEndDateLocalizedStr = adacare.lib.formatDateLocalized(adacare.lib.countryAbbr, activeEndDate);
        $('#' + neuro.cal.addVisitClientActiveEndDatePanelID).removeClass(neuro.cal.CSS_HIDDEN);
        $('#' + neuro.cal.addVisitClientActiveEndDateMsgID).text('Client is inactive after ' + activeEndDateLocalizedStr);

        // Make sure we haven't exceeded the client's ActiveEndDate

        visitDate = adacare.lib.parseDateLocalized(adacare.lib.countryAbbr, $('#' + neuro.cal.addVisitStartDatePickerID).val());

        if (visitDate.getTime() > activeEndDate.getTime()) {
            $('#' + neuro.cal.addVisitStartDatePickerID).val(activeEndDateLocalizedStr);
            $('#' + neuro.cal.addVisitStartDatePickerHiddenID).val(activeEndDateLocalizedStr);
            $('#' + neuro.cal.addVisitThruDateOpenEndedID).prop('checked', true); // Maybe set the thru date to ActiveEndDate?
        }
    }
    else {
        $('#' + neuro.cal.addVisitClientActiveEndDatePanelID).addClass(neuro.cal.CSS_HIDDEN);
        $('#' + neuro.cal.addVisitClientActiveEndDateMsgID).text('');
        var junk1 = $('#' + neuro.cal.addVisitClientActiveEndDateMsgID).text(); // DEBUG
    }
};

//neuro.cal.fetchClientForAddVisitWSFailed = function(error, context) {

//    adacare.lib.WSFailedGenericMessage(error, context, 'Failed to retrieve client information!');
//};

neuro.cal.fetchClientForAddVisitWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        // Error was already handled above
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to retrieve client information!');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
// Web services for database Staff table.

// Fetch a staff record for the edit visit dialog.

neuro.cal.fetchStaffForEditWS = function (staffID, visitDateForPayroll) {

    AdaCareWeb.WebServices.CalServices.FetchStaff(neuro.cal.officeID, staffID, visitDateForPayroll, neuro.cal.fetchStaffForEditWSSuccess, neuro.cal.fetchStaffForEditWSFailed, 'neuro.cal.fetchStaffForEditWS');
};

neuro.cal.fetchStaffForEditWSSuccess = function (calStaff) {

    var address = '', cityState = '', resPhone = '', mobilePhone = '', contactInfo = '', emailAddress = '', emailAddressUrl = '', payrollMinutesToString = '';

    if (calStaff !== null) {
        if (calStaff.ID !== -1) {
            address = adacare.lib.stringNullToEmpty(calStaff.ResAddress) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResAddress2);
            cityState = adacare.lib.stringNullToEmpty(calStaff.ResCity) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResState) + ' ' + adacare.lib.stringNullToEmpty(calStaff.ResPostalCode);
            resPhone = adacare.lib.stringTrim(calStaff.ResPhone);
            mobilePhone = adacare.lib.stringTrim(calStaff.MobilePhone);
            emailAddress = adacare.lib.stringTrim(calStaff.EmailAddress);
            contactInfo = adacare.lib.stringTrim(calStaff.ContactInfo);
            payrollMinutesToString = calStaff.PayrollMinutesScheduledToString + ' this week';
        }
    }
    if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
    $('#' + neuro.cal.editDialogStaffAddressID).text(address);
    $('#' + neuro.cal.editDialogStaffCityID).text(cityState);
    $('#' + neuro.cal.editDialogStaffResPhoneID).text(resPhone);
    $('#' + neuro.cal.editDialogStaffMobilePhoneID).text(mobilePhone);
    $('#' + neuro.cal.editDialogStaffEmailID).text(emailAddress);
    $('#' + neuro.cal.editDialogStaffEmailUrlID).attr('href', emailAddressUrl);
    $('#' + neuro.cal.editDialogStaffContactInfoID).text(contactInfo);
    $('#' + neuro.cal.editDialogStaffPayrollMinutesID).text(payrollMinutesToString);
};

// Function for web service staff failures.

neuro.cal.fetchStaffForEditWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        neuro.cal.editvisit.Button(window.document.getElementById(neuro.cal.editDialogID), 0, 'cancel');
        adacare.lib.pleaseWaitPopup('close');
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to retrieve staff information!');
    }
};

// Function for web service VisitJoin failures.

neuro.cal.InitVisitJoinForEditWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        neuro.cal.editvisit.Button(window.document.getElementById(neuro.cal.editDialogID), 0, 'cancel');
        adacare.lib.pleaseWaitPopup('close');
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to retrieve visit information!');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Shared function for web service failures.

neuro.cal.editvisit.WSFailed = function (error, context, methodName) {

    adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
};

neuro.cal.editvisit.UpdateVisitJoinWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        neuro.cal.editvisit.Button(window.document.getElementById(neuro.cal.editDialogID), 0, 'cancel');
        adacare.lib.pleaseWaitPopup('close');
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to update visit information!');
    }
};

neuro.cal.editvisit.DeleteVisitJoinWSFailed = function (error, context) {

    if (neuro.cal.HandleAuthenticationError(error)) {
        // Error was already handled above
    }
    else if (neuro.cal.HandleWinInetError(error)) {
        neuro.cal.editvisit.Button(window.document.getElementById(neuro.cal.editDialogID), 0, 'cancel');
        adacare.lib.pleaseWaitPopup('close');
    }
    else {
        adacare.lib.WSFailedGenericMessage(error, context, 'Failed to delete visit information!');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Test to see if we had an authentication error and handle it by jumping to the login page (actually,
// by reloading the page, and this should cause a fresh login).
// This routinely happens when the client's session times out and/or authentication cookie expires.

neuro.cal.HandleAuthenticationError = function (error) {

    var isHandled = false;
    var statusCode = error.get_statusCode();

    if (statusCode !== undefined) {
        if (statusCode === 401) {

            isHandled = true;
            if (!neuro.cal.AuthenticationErrorIsHandled) {
                neuro.cal.AuthenticationErrorIsHandled = true;
                alert('Authentication error #' + statusCode + ', your session may have timed out.' +
                    '\r\n\r\nClick OK to log back in.');
                window.location.reload();
            }
        }
    }

    return isHandled;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Test to see if WinINet error and handle it by complaining.

neuro.cal.HandleWinInetError = function (error) {

    var isHandled = false;
    var statusCode = error.get_statusCode();

    if (statusCode !== undefined) {
        if (statusCode >= 12000 && statusCode <= 12999) {

            isHandled = true;
            alert('Internet error #' + statusCode + ', unable to communicate to server.' +
            '\r\n(Is your Internet connection working?)' +
            '\r\n\r\nClick OK to continue.');
        }
    }

    return isHandled;
};
