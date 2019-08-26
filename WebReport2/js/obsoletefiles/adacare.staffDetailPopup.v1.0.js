// Copyright 2012 by Neurosoftware, LLC.
//
// adacare.staffDetailPopup.v1.0.js
// Sandy Gettings
// Revised 01/26/2012
//
// This is a library that pops up detail for a staff record with JavaScript.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.staffDetailPopup) { adacare.staffDetailPopup = {}; }
else { throw new Error('adacare.staffDetailPopup is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////

// Fields in the detail pop-up dialog

adacare.staffDetailPopup.info = {

    officeID: -1,
    buddyElemID: '',
    dropDownListID: '',
    openButtonID: '',
    begDate: null,
    surroundDivID: 'StaffDetailPopupSurroundDiv',
    divID: 'StaffDetailPopupDiv',
    titleID: 'StaffDetailPopupTitle',
    fullnameID: 'StaffDetailPopupFullname',
    telephonyIDID: 'StaffDetailPopupTelephonyID',
    addressID: 'StaffDetailPopupAddress',
    cityID: 'StaffDetailPopupCity',
    resPhoneID: 'StaffDetailPopupResPhone',
    mobilePhoneID: 'StaffDetailPopupMobilePhone',
    contactInfoID: 'StaffDetailPopupContactInfo',
    emailAddressID: 'StaffDetailPopupEmailAddress',
    emailAddressUrlID: 'StaffDetailPopupEmailAddressUrl',
    schedulingPrefsID: 'StaffDetailPopupSchedulingPrefs',
    detailMinutesID: 'StaffDetailPopupMinutes',
    mapButtID: 'StaffDetailPopupMapButt',
    viewCalendarButtID: 'StaffDetailPopupViewCalendarButt',
    closeBoxID: 'StaffDetailPopupCloseBox'
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Bind the popup to a change in a drop-down list.

adacare.staffDetailPopup.BindToDropDownList = function (officeID, dropDownListID, openButtonID, begDateStr) {

    var $dropDownList;
    var $openButton;

    adacare.staffDetailPopup.info.officeID = officeID;
    adacare.staffDetailPopup.info.buddyElemID = dropDownListID;
    adacare.staffDetailPopup.info.dropDownListID = dropDownListID;
    adacare.staffDetailPopup.info.openButtonID = openButtonID;
    adacare.staffDetailPopup.info.begDate = new Date(begDateStr);

    // Remember the ID of the button that opens the popup

    adacare.staffDetailPopup.info.openButtonID = openButtonID;

    $dropDownList = $('#' + dropDownListID);
    $openButton = $('#' + openButtonID);
    $openButton.button({ text: true }); // Make this a jQuery button widget. Works better for enable/disable styling.
    // DEBUG
    var $bset0 = $('#TestButtonSet0');
    $bset0.buttonset();
    var $bset = $('#TestButtonSet');
    $bset.buttonset();
    // END DEBUG

    // When the drop-down list changes, we need to show/hide the button.

    $dropDownList.unbind().change(function () {

        var staffID;

        //staffID = Number($('#' + dropDownListID).val());
        staffID = Number($dropDownList.val());
        adacare.staffDetailPopup.DisplayOpenButton(openButtonID, staffID);
    });

    // Bind the open details button to its handler, and display its initial state.

    $openButton.unbind().click(adacare.staffDetailPopup.OnClickOpenButton);
    adacare.staffDetailPopup.DisplayOpenButton(openButtonID, Number($dropDownList.val()));
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a click on the open button.

adacare.staffDetailPopup.OnClickOpenButton = function () {

    var $dropDownList;
    var staffID;
    var fullname;

    $dropDownList = $('#' + adacare.staffDetailPopup.info.dropDownListID);
    staffID = Number($dropDownList.val());
    fullname = $('#' + adacare.staffDetailPopup.info.dropDownListID + ' :selected').text();

    // Open the popup, and async fetch the staff's info.

    adacare.staffDetailPopup.OpenDetails('Staff Details', fullname, adacare.staffDetailPopup.info.buddyElemID, false);
    adacare.staffDetailPopup.FetchStaffDetailWS(adacare.staffDetailPopup.info.officeID, staffID, adacare.staffDetailPopup.info.begDate);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the "open" button. If we have a valid client/staff ID, then the button is displayed or
// enabaled. If not, it's hidden or disabled.

adacare.staffDetailPopup.DisplayOpenButton = function (openButtonID, staffID) {

    var $openButton;

    $openButton = $('#' + openButtonID);

    if (staffID > 0) {
        //$openButton.removeAttr('disabled');
        $openButton.button('enable');
    }
    else {
        //$openButton.attr('disabled', true);
        $openButton.button('disable');
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Open the "details" popup for a client or staff. We'll fill in a just little bit of info on the
// popup here. Then, the caller will request more details via an async web service call.

adacare.staffDetailPopup.OpenDetails = function (title, fullname, buddyElemID, showCalendarButt) {

    var $buddyElem = $('#' + buddyElemID);
    var $dialogSurroundDiv = $('#' + adacare.staffDetailPopup.info.surroundDivID);
    var $viewCalendarButt = $('#' + adacare.staffDetailPopup.info.viewCalendarButtID);
    var $closeBox = $('#' + adacare.staffDetailPopup.info.closeBoxID);
    var buddyOffset;

    // Fill in the few fields we know, and blank out the rest. They'll be filled in
    // later by the caller's web service.

    $('#' + adacare.staffDetailPopup.info.titleID).text(title);
    $('#' + adacare.staffDetailPopup.info.fullnameID).text(fullname);
    $('#' + adacare.staffDetailPopup.info.telephonyIDID).text('');
    $('#' + adacare.staffDetailPopup.info.addressID).text('Just a moment, please...');
    $('#' + adacare.staffDetailPopup.info.cityID).text('');
    $('#' + adacare.staffDetailPopup.info.resPhoneID).text('');
    $('#' + adacare.staffDetailPopup.info.mobilePhoneID).text('');
    $('#' + adacare.staffDetailPopup.info.contactInfoID).text('');
    $('#' + adacare.staffDetailPopup.info.emailAddressID).text('');
    $('#' + adacare.staffDetailPopup.info.emailAddressUrlID).attr('href', '');
    $('#' + adacare.staffDetailPopup.info.schedulingPrefsID).text('');
    $('#' + adacare.staffDetailPopup.info.detailMinutesID).text('');
    adacare.lib.initMapButton(adacare.staffDetailPopup.info.mapButtID, 'No Map', 'Wait...', '');

    // Define the close box click to close the popup

    //$closeBox.unbind();
    $closeBox.unbind().click(function () {
        adacare.staffDetailPopup.CloseDetails();
    });

    // Define the button click to cause the calendar to zoom in to the single client or staff.

    if (showCalendarButt) {
        $viewCalendarButt.show();

        // Future stuff, if we use this code in the calendar

        /***
        $viewCalendarButt.unbind();
        $viewCalendarButt.click(function () {
        $('#' + clientstaffHiddenID).val(String(clientstaffID));
        $('#' + neuro.cal.selectedViewModeHiddenID).val(String(newView));
        neuro.cal.editvisit.CloseDetails();
        adacare.lib.pleaseWaitPopup('open');
        //document.forms[0].submit(); // Submits entire form for full postback
        __doPostBack(updatePanelID, ''); // partial-page postback only
        });
        ***/
    }
    else {
        $viewCalendarButt.hide();
    }

    // Display the popup. We place the popup beside the buddy element by appending
    // to its parent. Note that the parent must be something suitable, like a DIV.
    // This method works in both the Calendar and Schedule Visits pages.

    buddyOffset = $buddyElem.offset(); // Is position() better?
    $buddyElem.parent().append($dialogSurroundDiv); // DEBUG

    /***
    $dialogSurroundDiv.css({
    'position': 'absolute',
    'top': buddyOffset.top - 5,
    'left': buddyOffset.left + $buddyElem.outerWidth() - 6
    });
    ***/

    $dialogSurroundDiv.css({
        'position': 'absolute',
        top: -5,
        left: $buddyElem.outerWidth() - 6
    });

    $dialogSurroundDiv.show();

    // Make the popup draggable.

    $dialogSurroundDiv.draggable({
        opacity: 0.7,
        cursor: 'move'
    });
};

adacare.staffDetailPopup.CloseDetails = function () {

    var $dialogSurroundDiv = $('#' + adacare.staffDetailPopup.info.surroundDivID);

    $dialogSurroundDiv.hide();

};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch record for client/staff detail popup

adacare.staffDetailPopup.FetchClientDetailWS = function (clientID) {

    AdaCareWeb.WebServices.CalServices.FetchClient(
    clientID,
    adacare.staffDetailPopup.WSSuccess,
    adacare.staffDetailPopup.WSFailed,
    'adacare.staffDetailPopup.fetchClientDetailWS');
};

adacare.staffDetailPopup.FetchStaffDetailWS = function (officeID, staffID, begDate) {

    AdaCareWeb.WebServices.CalServices.FetchStaff(
    officeID, staffID, begDate,
    adacare.staffDetailPopup.WSSuccess,
    adacare.staffDetailPopup.WSFailed,
    'adacare.staffDetailPopup.fetchStaffDetailWS');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copy the ScheduledVisit record into the edit dialog.

adacare.staffDetailPopup.WSSuccess = function (returnedValue, context, methodName) {

    var calClient = new AdaCareWeb.WebServices.CalClient();
    var calStaff = new AdaCareWeb.WebServices.CalStaff();
    var msg;
    var elemID;
    var telephonyID = '';
    var address = '', cityState = '', resPhone = '', mobilePhone = '', contactInfo = '', emailAddress = '', emailAddressUrl = '', schedulingPrefs = '', payrollMinutesToString = '';

    switch (methodName) {

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

                    schedulingPrefs = (calClient.SchedulingPrefs ? adacare.lib.stringTrim(calClient.SchedulingPrefs) : '');
                }
                elemID = adacare.staffDetailPopup.info.mapButtID;
                adacare.lib.initMapButton(elemID, 'Map', 'No Map', calClient.mapUrl);
            }

            if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
            $('#' + adacare.staffDetailPopup.info.addressID).text(address);
            $('#' + adacare.staffDetailPopup.info.cityID).text(cityState);
            $('#' + adacare.staffDetailPopup.info.resPhoneID).text(resPhone);
            $('#' + adacare.staffDetailPopup.info.mobilePhoneID).text(mobilePhone);
            $('#' + adacare.staffDetailPopup.info.emailAddressID).text(emailAddress);
            $('#' + adacare.staffDetailPopup.info.emailAddressUrlID).attr('href', emailAddressUrl);
            $('#' + adacare.staffDetailPopup.info.telephonyIDID).text(telephonyID);
            $('#' + adacare.staffDetailPopup.info.contactInfoID).text(contactInfo);
            $('#' + adacare.staffDetailPopup.info.schedulingPrefsID).text(schedulingPrefs);
            $('#' + adacare.staffDetailPopup.info.detailMinutesID).text(''); // Not used for clients
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

                    schedulingPrefs = (calStaff.SchedulingPrefs ? adacare.lib.stringTrim(calStaff.SchedulingPrefs) : '');
                    payrollMinutesToString = 'Payroll Hours: ' + calStaff.PayrollMinutesScheduledToString + ' this week';
                }
                elemID = adacare.staffDetailPopup.info.mapButtID;
                adacare.lib.initMapButton(elemID, 'Map', 'No Map', calStaff.mapUrl);
            }

            if (emailAddress.length > 0) { emailAddressUrl = 'mailto:' + emailAddress; }
            $('#' + adacare.staffDetailPopup.info.addressID).text(address);
            $('#' + adacare.staffDetailPopup.info.cityID).text(cityState);
            $('#' + adacare.staffDetailPopup.info.resPhoneID).text(resPhone);
            $('#' + adacare.staffDetailPopup.info.mobilePhoneID).text(mobilePhone);
            $('#' + adacare.staffDetailPopup.info.emailAddressID).text(emailAddress);
            $('#' + adacare.staffDetailPopup.info.emailAddressUrlID).attr('href', emailAddressUrl);
            $('#' + adacare.staffDetailPopup.info.telephonyIDID).text(telephonyID);
            $('#' + adacare.staffDetailPopup.info.contactInfoID).text(contactInfo);
            $('#' + adacare.staffDetailPopup.info.schedulingPrefsID).text(schedulingPrefs);
            $('#' + adacare.staffDetailPopup.info.detailMinutesID).text(payrollMinutesToString);
            break;

        default:

            msg = context + ': Unexpected response from web service method "' + methodName + '"!';
            alert(msg);
            break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Shared function for web service failures.

adacare.staffDetailPopup.WSFailed = function (error, context, methodName) {

    adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
};
