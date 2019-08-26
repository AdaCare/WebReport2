// Copyright 2012 by Neurosoftware, LLC.
//
// adacare.staffDetailPopup.v1.2.js
// Sandy Gettings
//
// This is a library that pops up details for a staff record with JavaScript.
//
// Revisions:
//
// 2012-04-03
// 2014-12-09 SG Changes to work with new "selectmenu" when staff selection is changed.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.staffDetailPopup) { adacare.staffDetailPopup = {}; }
else { throw new Error('adacare.staffDetailPopup is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////

// Fields in the detail pop-up dialog

adacare.staffDetailPopup.info = {

    officeID: -1,
    //selectedStaffIDElemID: '',                        // The ID of the hidden field that contains the currently selected staff ID
    //selectedStaffFullNameElemID: '',                  // The ID of the hidden field that contains the currently selected staff's name
    selectedStaffID: '',                                // The currently selected staff's ID
    selectedStaffFullName: '',                          // The currently selected staff's name
    openButtonID: '',                                   // The ID of the button for opening the details pop-up
    buddyElemID: '',                                    // The ID of the element for positioning the pop-up; usually surrounds the selectmenu drop-down list
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

//adacare.staffDetailPopup.init = function (officeID, selectedStaffIDElemID, selectedStaffFullNameElemID, openButtonID, buddyElemID, begDateStr) {
adacare.staffDetailPopup.init = function (officeID, begDateStr, openButtonID, buddyElemID) {
    'use strict';

    //var $selectedStaff;
    var $openButton;

    adacare.staffDetailPopup.info.officeID = officeID;
    adacare.staffDetailPopup.info.buddyElemID = buddyElemID;
    //adacare.staffDetailPopup.info.selectedStaffIDElemID = selectedStaffIDElemID;
    //adacare.staffDetailPopup.info.selectedStaffFullNameElemID = selectedStaffFullNameElemID;
    adacare.staffDetailPopup.info.openButtonID = openButtonID;
    adacare.staffDetailPopup.info.begDate = new Date(begDateStr);

    // Remember the ID of the button that opens the popup

    adacare.staffDetailPopup.info.openButtonID = openButtonID;

    //$selectedStaff = $('#' + selectedStaffIDElemID);
    $openButton = $('#' + openButtonID);
    $openButton.button({ text: true }); // Make this a jQuery button widget. Works better for enable/disable styling.

    // Bind the open details button to its handler, and display its initial state.

    $openButton.unbind().click(adacare.staffDetailPopup.onClickOpenButton);
    //adacare.staffDetailPopup.displayOpenButton(openButtonID, Number($selectedStaff.val()));
    //adacare.staffDetailPopup.displayOpenButton(this.info.selectedStaffID);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in the selected staff ID. Note that some other code is responsible for invoking
// this handler. We don't detect the change ourselves.

adacare.staffDetailPopup.onSelectedStaffChange = function (staffID, staffFullName) {
    'use strict';

    this.info.selectedStaffID = staffID;
    this.info.selectedStaffFullName = staffFullName;
    adacare.staffDetailPopup.displayOpenButton(staffID);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a click on the open button.

adacare.staffDetailPopup.onClickOpenButton = function () {
    'use strict';

    var officeID, staffID, fullname, buddyElemID, begDate;

    officeID = adacare.staffDetailPopup.info.officeID;
    staffID = adacare.staffDetailPopup.info.selectedStaffID;
    fullname = adacare.staffDetailPopup.info.selectedStaffFullName;
    buddyElemID = adacare.staffDetailPopup.info.buddyElemID;
    begDate = adacare.staffDetailPopup.info.begDate;

    // Open the popup, and async fetch the staff's info.

    adacare.staffDetailPopup.openDetails('Staff Details', fullname, buddyElemID, false);
    adacare.staffDetailPopup.fetchStaffDetailWS(officeID, staffID, begDate);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Display the "open" button. If we have a valid client/staff ID, then the button is displayed or
// enabled. If not, it's hidden or disabled.

adacare.staffDetailPopup.displayOpenButton = function (staffID) {
    'use strict';

    var $openButton;

    $openButton = $('#' + adacare.staffDetailPopup.info.openButtonID);

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

adacare.staffDetailPopup.openDetails = function (title, fullname, buddyElemID, showCalendarButt) {
    'use strict';

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

    $closeBox.unbind().click(function () {
        adacare.staffDetailPopup.closeDetails();
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
        neuro.cal.editvisit.closeDetails();
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

    /***
    $buddyElem.parent().append($dialogSurroundDiv);

    $dialogSurroundDiv.css({
        'position': 'absolute',
        top: -5,
        left: $buddyElem.outerWidth() - 6
    });
    ***/

    /***
    buddyOffset = $buddyElem.offset(); // Is position() better?
    $dialogSurroundDiv.css({
        'position': 'absolute',
        'top': buddyOffset.top - 5,
        'left': buddyOffset.left + $buddyElem.outerWidth() - 6
    });
    ***/

    buddyOffset = $buddyElem.offset(); // Is position() better?

    $dialogSurroundDiv.css({ 'position': 'absolute' });
    $(document.body).append($dialogSurroundDiv);
    $dialogSurroundDiv.show();
    $dialogSurroundDiv.offset({
        top: buddyOffset.top - 15,
        left: buddyOffset.left + $buddyElem.outerWidth() - 6
    });

    // Make the popup draggable.

    $dialogSurroundDiv.draggable({
        opacity: 0.7,
        cursor: 'move'
    });
};

adacare.staffDetailPopup.closeDetails = function () {
    'use strict';

    var $dialogSurroundDiv = $('#' + adacare.staffDetailPopup.info.surroundDivID);

    $dialogSurroundDiv.hide();

};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch record for client/staff detail popup

adacare.staffDetailPopup.fetchClientDetailWS = function (clientID) {
    'use strict';

    AdaCareWeb.WebServices.CalServices.FetchClient(
    clientID,
    adacare.staffDetailPopup.WSSuccess,
    adacare.staffDetailPopup.WSFailed,
    'adacare.staffDetailPopup.fetchClientDetailWS');
};

adacare.staffDetailPopup.fetchStaffDetailWS = function (officeID, staffID, begDate) {
    'use strict';

    AdaCareWeb.WebServices.CalServices.FetchStaff(
    officeID, staffID, begDate,
    adacare.staffDetailPopup.WSSuccess,
    adacare.staffDetailPopup.WSFailed,
    'adacare.staffDetailPopup.fetchStaffDetailWS');
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copy the ScheduledVisit record into the edit dialog.

adacare.staffDetailPopup.WSSuccess = function (returnedValue, context, methodName) {
    'use strict';

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
    'use strict';

    adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
};
