// Copyright 2009, 2010, 2011, 2012, 2013 by Neurosoftware, LLC.
//
// neuro.cal.v5.21.js
// Sandy Gettings
//
// This is a library that manipulates a calendar with JavaScript.
// The calendar model is described below:
//
// The calendar is composed of a grid of "slots," each slot representing a
// user-defined block of time (say, 10, 15, 20, or 30 minutes each). Slots are
// numbered 0, 1, 2, ...
//
// The columns of slots may be subdivided into "groups" of one or more columns
// each. Each group has a unique description, such as "Person A, "Person B,"
// and so forth. All groups share the same starting date/time, and groups
// can flow across several columns (usually a day per column). Groups are
// numbered 0, 1, 2, ...
//
// Example use cases:
//
// Simple 7-day calendar -- one group, seven columns per group.
// Single day, 10 persons -- 10 groups, one column per group.
// Weekly, 10 persons -- 10 groups, seven columns per group.
//
// Revised 2013-11-11
// Revised 2014-04-07 SG Changes to support new datepicker (V3.1).
// Revised 2014-09-27 SG Added code for visit tags.
// Revised 2014-12-14 SG Modified to support new AddVisit control.
// Revised 2014-12-21 SG Revised neuro.cal.staffList to index by integer rather than staff's ID. Keeps list alphabetical.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof (neuro) !== "object") {
    throw new Error("neuro is already defined, but is not an object!");
}

if (!neuro.cal) { neuro.cal = {}; }
else { throw new Error("neuro.cal is already defined!"); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// One-time initialization.

neuro.cal.pleaseWaitTimeoutID = -1;

// Element IDs of dedicated fields used in the "edit" dialog. The IDs are passed in from the 
// calling software on the server side.

neuro.cal.editDialogID = '';
neuro.cal.editDialogVisitIDID = '';
neuro.cal.editDialogClientNameID = '';
neuro.cal.editDialogClientAddressID = '';
neuro.cal.editDialogClientCityID = '';
neuro.cal.editDialogClientResPhoneID = '';
neuro.cal.editDialogClientMobilePhoneID = '';
neuro.cal.editDialogClientEmailID = '';
neuro.cal.editDialogClientEmailUrlID = '';
neuro.cal.editDialogClientContactInfoID = '';
//neuro.cal.editDialogStaffIDID = ''; // OBSOLETE
neuro.cal.editDialogSelectedStaffIDNEW = -1; // 'editDialogSelectedStaffIDHidden';

//neuro.cal.editDialogStaffSelectMenuID = 'EditDialogStaffSelectMenu';
neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_ELEM_ID = 'EditDialogStaffSelectMenu';
neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_RECENT_INDEX = 0;
neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_RECENT_TITLE = 'Client\'s Recent Staff';
neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_ALL_INDEX = 1;
neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_ALL_TITLE = 'All Staff';

neuro.cal.editDialogStaffAddressID = '';
neuro.cal.editDialogStaffCityID = '';
neuro.cal.editDialogStaffResPhoneID = '';
neuro.cal.editDialogStaffMobilePhoneID = '';
neuro.cal.editDialogStaffEmailID = '';
neuro.cal.editDialogStaffEmailUrlID = '';
neuro.cal.editDialogStaffContactInfoID = '';
neuro.cal.editDialogDatePickerID = '';
neuro.cal.editDialogDatePickerHiddenID = '';
neuro.cal.editDialogTimePickerID = '';
//neuro.cal.editDialogBegTimeMinID = ''; 
neuro.cal.editDialogContractID = '';
neuro.cal.editDialogVisitTypeID = '';
neuro.cal.editDialogBaseMinutesID = '';
neuro.cal.editDialogExtraMinutesID = '';
neuro.cal.editDialogVisitFinalStatusID = '';
neuro.cal.editDialogIsConfirmedID = '';
neuro.cal.editDialogIsBillableToClientID = '';
neuro.cal.editDialogIncludeInPayrollID = '';
neuro.cal.editDialogMileageID = ''; // Mileage field -- DEPRECATED. REMOVE NEXT OPPORTUNITY
neuro.cal.editDialogSchedulingNotesID = 'EditDialogSchedulingNotes';
neuro.cal.editDialogVisitNotesID = '';
neuro.cal.editDialogSupervisorNotesID = 'EditDialogSupervisorNotes';
neuro.cal.editDeleteDialogID = '';
neuro.cal.editFrequencyToStringDivID = 'FrequencyToStringDiv';
neuro.cal.editConflictDivID = 'ConflictDiv';
neuro.cal.editConflictListID = 'ConflictList';
neuro.cal.editDialogWhoWhenUpdatedID = 'EditDialogWhoWhenUpdated';
neuro.cal.editDialogClientMapButtID = 'EditDialogClientMapButt';
neuro.cal.editDialogStaffMapButtID = 'EditDialogStaffMapButt';
neuro.cal.editDialogOfficeToClientMapButtID = 'EditDialogOfficeToClientMapButt';
neuro.cal.editDialogStaffToClientMapButtID = 'EditDialogStaffToClientMapButt';
neuro.cal.editDialogClientBillingMinutesID = 'EditDialogClientBillingMinutes';
neuro.cal.editDialogStaffPayrollMinutesID = 'EditDialogStaffPayrollMinutes';

neuro.cal.editDialogActualArrivalTimeID = 'EditDialogActualArrivalTime';
neuro.cal.editDialogActualDepartureTimeID = 'EditDialogActualDepartureTime';

neuro.cal.editDialogBillingMinutesID = 'EditDialogBillingMinutes';
neuro.cal.editDialogBillingTravelID = 'EditDialogBillingTravel';
neuro.cal.editDialogPayrollMinutesID = 'EditDialogPayrollMinutes';
neuro.cal.editDialogPayrollTravelID = 'EditDialogPayrollTravel';

// VSSpecialRatesEditor control IDs.

neuro.cal.editDialogSpecialRatesEditorSurroundID = '';

// AddVisit control IDs.

neuro.cal.addVisitAccordionID = 'CalControlPanel';
neuro.cal.addVisitAccordionIndex = 0;
neuro.cal.addVisitClientPickerID = '';
neuro.cal.addVisitStartDatePickerID = '';
//neuro.cal.addVisitStartDatePickerHiddenID = ''; // OBSOLETE
//neuro.cal.addVisitThruDateOpenEndedID = ''; // OBSOLETE
//neuro.cal.addVisitThruDatePickerID = ''; // OBSOLETE
//neuro.cal.addVisitThruDatePickerHiddenID = ''; // OBSOLETE
neuro.cal.addVisitTimePickerID = '';
//neuro.cal.addVisitSchedulingPrefsID = ''; // OBSOLETE
//neuro.cal.addVisitClientActiveEndDatePanelID = ''; // OBSOLETE
//neuro.cal.addVisitClientActiveEndDateMsgID = ''; // OBSOLETE

neuro.cal.AuthenticationErrorIsHandled = false; // Used to prevent error message alerts from displaying twice.

// CSS classes of the visit elements.

neuro.cal.visitClassDefault = 'cal_visitcell_default';
neuro.cal.visitClassKept = 'cal_visitcell_kept';
neuro.cal.visitClassAvailable = 'cal_visitcell_available';
neuro.cal.visitClassWarning = 'cal_visitcell_warning';
neuro.cal.visitClassUnassigned = 'cal_visitcell_unassigned';
neuro.cal.visitClassNoShow = 'cal_visitcell_noshow';
neuro.cal.visitClassRepeater = 'cal_visitcell_repeater';
neuro.cal.visitClassInner = 'cal_visitcell_inner';
neuro.cal.visitClassTime = 'cal_visitcell_time';
neuro.cal.visitClassMinutes = 'cal_visitcell_minutes';
neuro.cal.visitClassHeader = 'cal_visitcell_header';
neuro.cal.visitClassOflowTop = 'cal_oflow_top';
neuro.cal.visitClassOflowBot = 'cal_oflow_bot';

// Fixed constants.

neuro.cal.SURROUNDING_CLASS = 'content_main';
neuro.cal.CSS_HIDDEN = "general_hidden";
neuro.cal.VIEWWHO_CLIENT = 'client';
neuro.cal.VIEWWHO_STAFF = 'staff';
neuro.cal.STAFF_UNASSIGNED_ID = -1;                             // ID of "unassigned" staff, must be same as defined in Staff class
neuro.cal.STAFF_BAD_ID = -2;                                    // ID to denote undefined or "bad" staff ID. Should never happen!
neuro.cal.CLIENT_BAD_ID = -2;                                   // ID to denote undefined or "bad" client ID. Should never happen!
neuro.cal.COL_L_BORDER_WIDTH_PX = 0;
neuro.cal.COL_R_BORDER_WIDTH_PX = 1;
neuro.cal.CALTYPE_OVERLAY = 'overlay';
neuro.cal.CALTYPE_STACKED = 'stacked';
neuro.cal.PLACEHOLDERNAME = 'placeholder';                      // Anything to plop into an empty slot. Otherwise, table cell borders don't display
neuro.cal.PLACEHOLDERHTML = '<SPAN>&nbsp;</SPAN>';
neuro.cal.VISIT_ELEMNAME = 'visit';                             // Element "name" for all visit DOM elements

// Visit final status codes of interest. These must match codes in the database.

neuro.cal.VISITFINALSTATUS_PENDING = 'P';
neuro.cal.VISITFINALSTATUS_KEPT = 'K';
neuro.cal.VISITFINALSTATUS_NOSHOW_CAREGIVER = 'E';
neuro.cal.VISITFINALSTATUS_NOSHOW_CLIENT = 'F';
neuro.cal.VISITFINALSTATUS_CANCELED_BY_CAREGIVER = 'A';
neuro.cal.VISITFINALSTATUS_CANCELED_BY_CLIENT = 'B';
neuro.cal.VISITFINALSTATUS_CANCELED_ON_HOLD = 'H';
neuro.cal.VISITFINALSTATUS_CANCELED_OTHER = 'D';

// Temp variable for holding the current status. We need this when the user changes the status,
// so we can do clever things depending on the transition from old to new status.

neuro.cal.VisitFinalStatusCurrent = '';

// Limit of extra minutes. This should match the DropDownList in the edit dialog.

neuro.cal.MAX_EXTRA_MINUTES = 120;

// Precalculate some figures to save crunching later.

neuro.cal.MS_PER_DAY = 60 * 60 * 24 * 1000;                   // Precalculate milliseconds per day.
neuro.cal.MS_PER_MINUTE = 60 * 1000;                          // Precalculate milliseconds per minute.

///////////////////////////////////////////////////////////////////////////////////////////////////
// Initialze a stacked calendar.

neuro.cal.initStacked = function (
        countryAbbr,
        officeID,
        readOnlyFromServer,
        outersurroundID,
        innersurroundID,
        outerbodyID,
        bodyID,
        selectedClientIDHiddenID,
        selectedStaffIDHiddenID,
        selectedViewModeHiddenID,
        selectedDateHiddenID,
        slotIDPrefix,
        groups,
        rows, viewWho,
        colsPerGroup, colWidth,
        visitHeight, visitWidth,
        visitBorderHeight,
        begDateTimeStr,
        minutesPerTimePicker // OBSOLETE
        ) {

    var dt;

    neuro.cal.calType = neuro.cal.CALTYPE_STACKED;
    neuro.cal.countryAbbr = countryAbbr; // OBSOLETE: Should already be set in adacare.lib.countryAbbr
    neuro.cal.officeID = officeID;
    neuro.cal.readOnly = Boolean(readOnlyFromServer !== 0);
    neuro.cal.viewWho = viewWho;
    neuro.cal.groupsRepresentClients = false;
    neuro.cal.groupsRepresentStaff = false;
    neuro.cal.rowsRepresentClients = (viewWho === neuro.cal.VIEWWHO_CLIENT);
    neuro.cal.rowsRepresentStaff = (viewWho === neuro.cal.VIEWWHO_STAFF);
    neuro.cal.visitClassBase = 'cal_visitcell_stacked';

    neuro.cal.outersurroundID = outersurroundID;
    neuro.cal.innersurroundID = innersurroundID;
    neuro.cal.outerbodyID = outerbodyID;
    neuro.cal.bodyID = bodyID;
    neuro.cal.selectedClientIDHiddenID = selectedClientIDHiddenID;
    neuro.cal.selectedStaffIDHiddenID = selectedStaffIDHiddenID;
    neuro.cal.selectedViewModeHiddenID = selectedViewModeHiddenID;
    neuro.cal.selectedDateHiddenID = selectedDateHiddenID;
    neuro.cal.slotIDPrefix = slotIDPrefix;
    neuro.cal.rows = rows;
    neuro.cal.colsPerGroup = colsPerGroup;
    neuro.cal.slotsPerGroup = rows * colsPerGroup;
    neuro.cal.minutesPerTimePicker = minutesPerTimePicker; // OBSOLETE
    neuro.cal.initCommon();

    neuro.cal.colWidth = colWidth;
    neuro.cal.visitHeight = visitHeight;
    neuro.cal.visitWidth = visitWidth;
    neuro.cal.visitBorderHeight = visitBorderHeight;
    neuro.cal.rowHeightForDrag = 1;

    // Precalculate some figures to save crunching later.

    neuro.cal.slotMinutes = 60 * 24;                            // Stacked calendars are one day per slot.
    neuro.cal.msPerSlot = neuro.cal.slotMinutes * 60 * 1000;    // Precalculate milliseconds per slot.

    // Extract the beginning date and time.

    dt = new Date(begDateTimeStr);
    neuro.cal.begDateTime = dt;
    neuro.cal.begDate = neuro.cal.dateTrunc(dt); // new Date(y, m, d);
    neuro.cal.begTime = new Date(neuro.cal.begDateTime.getTime() - neuro.cal.begDate.getTime());

    // The ending date/time in stacked calendars is the last ms in the last column in a group.
    // Each column represents a whole day, and there x columns per group.

    // TODO: Consider using Date.addDays() here, to account for Daylight Savings Time
    neuro.cal.endDateTime = new Date(dt.getTime() + neuro.cal.MS_PER_DAY * neuro.cal.colsPerGroup - 1);

    // Since we let the user click and drag things around on the calendar, we need to make
    // all of the elements unselectable. This way, we can still click and drag and such, but
    // things like headers and empty cells don't get highlighted by selection.

    $('#' + innersurroundID).find('*').each(function () { neuro.cal.makeUnselectable(this); });

    neuro.cal.resizeCalendar(); // Resize *before* setting the scrollTop

    // Set the initial scroll, so the window shows the desired hour at the top.
    // This is better than always starting the display at midnight.

    // Not appropriate for stacked calendar, since it rows represent staff, not hours.
    //    outerbodyElem = document.getElementById(neuro.cal.outerbodyID);
    //    outerbodyElem.scrollTop = begHourScroll * (60 / slotMinutes) * rowHeight;

    // Enable double-click on all of the calendar that is obscured by visit elements.

    $('.cal_stacked_bodyslot,.cal_stacked_bodyslot_offduty').dblclick(neuro.cal.onDoubleClickBody);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Initialze an overlay calendar.

neuro.cal.initOverlay = function (
        countryAbbr,
        officeID,
        readOnlyFromServer,
        outersurroundID,
        innersurroundID,
        outerbodyID,
        bodyID,
        selectedClientIDHiddenID,
        selectedStaffIDHiddenID,
        selectedViewModeHiddenID,
        selectedDateHiddenID,
        slotIDPrefix,
        rows, viewWho,
        colsPerGroup,
        rowHeight, colWidth,
        visitWidth, visitBorderHeight,
        begDateTimeStr,
        begHourScroll,
        minutesPerTimePicker) {

    var dt;
    var outerbodyElem;

    // Info for this calendar.

    neuro.cal.calType = neuro.cal.CALTYPE_OVERLAY;
    neuro.cal.countryAbbr = countryAbbr; // OBSOLETE: Should already be set in adacare.lib.countryAbbr
    neuro.cal.officeID = officeID;
    neuro.cal.readOnly = Boolean(readOnlyFromServer !== 0);
    neuro.cal.viewWho = viewWho;
    neuro.cal.groupsRepresentClients = (viewWho === neuro.cal.VIEWWHO_CLIENT);
    neuro.cal.groupsRepresentStaff = (viewWho === neuro.cal.VIEWWHO_STAFF);
    neuro.cal.rowsRepresentClients = false;
    neuro.cal.rowsRepresentStaff = false;
    neuro.cal.visitClassBase = 'cal_visitcell_overlay';

    neuro.cal.outersurroundID = outersurroundID;
    neuro.cal.innersurroundID = innersurroundID;
    neuro.cal.outerbodyID = outerbodyID;
    neuro.cal.bodyID = bodyID;
    neuro.cal.selectedClientIDHiddenID = selectedClientIDHiddenID;
    neuro.cal.selectedStaffIDHiddenID = selectedStaffIDHiddenID;
    neuro.cal.selectedViewModeHiddenID = selectedViewModeHiddenID;
    neuro.cal.selectedDateHiddenID = selectedDateHiddenID;
    neuro.cal.slotIDPrefix = slotIDPrefix;
    neuro.cal.rows = rows;
    neuro.cal.colsPerGroup = colsPerGroup;
    neuro.cal.slotsPerGroup = rows * colsPerGroup;
    neuro.cal.rowHeight = rowHeight;
    neuro.cal.colWidth = colWidth;
    neuro.cal.visitWidth = visitWidth;
    neuro.cal.visitBorderHeight = visitBorderHeight;
    neuro.cal.rowHeightForDrag = 1;
    //neuro.cal.rowHeightForDrag = rowHeight; // 5/14/13 SG: Add in future, when jQuery draggable scrolling bug is fixed.
    neuro.cal.minutesPerTimePicker = minutesPerTimePicker; // OBSOLETE
    neuro.cal.slotMinutes = minutesPerTimePicker;
    neuro.cal.initCommon();

    // Precalculate some figures to save crunching later.

    neuro.cal.msPerSlot = neuro.cal.slotMinutes * 60 * 1000;  // Precalculate milliseconds per slot.

    // Extract the beginning date and time.

    dt = new Date(begDateTimeStr);
    neuro.cal.begDateTime = dt;
    neuro.cal.begDate = neuro.cal.dateTrunc(dt); // new Date(y, m, d);
    neuro.cal.begTime = new Date(neuro.cal.begDateTime.getTime() - neuro.cal.begDate.getTime());

    // The ending date/time in overlay calendars is the last ms in the last slot in a group.
    // Each slot represents 10/15/20/whatever minutes, and there x slots per group.

    neuro.cal.endDateTime = new Date(dt.getTime() + neuro.cal.slotsPerGroup * neuro.cal.msPerSlot - 1);

    // Since we let the user click and drag things around on the calendar, we need to make
    // all of the elements unselectable. This way, we can still click and drag and such, but
    // things like headers and empty cells don't get highlighted by selection.

    $('#' + innersurroundID).find('*').each(function () { neuro.cal.makeUnselectable(this); });

    neuro.cal.resizeCalendar(); // Resize *before* setting the scrollTop

    // Set the initial scroll, so the window shows the desired hour at the top.
    // This is better than always starting the display at midnight.

    outerbodyElem = document.getElementById(neuro.cal.outerbodyID);
    outerbodyElem.scrollTop = begHourScroll * (60 / neuro.cal.slotMinutes) * rowHeight;

    // Enable double-click on all of the calendar that is obscured by visit elements.

    $(".cal_bodycol").dblclick(neuro.cal.onDoubleClickBody);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Common initialization for the two types of calendars' initxxx() function.

neuro.cal.initCommon = function () {

    // Delete all of the elements of the array. They will be loaded with fresh data.

    neuro.cal.visitList = [];                       // List of visits
    neuro.cal.groupList = [];                       // List of column groups
    neuro.cal.staffList = [];                       // List of staff
    neuro.cal.clientList = [];                      // List of clients
    neuro.cal.visitTypeList = [];                   // List of visit types
    neuro.cal.adjustCalendarWidth();

    // Resize the calendar whenever the window is resized.

    $(window).resize(function () {
        neuro.cal.adjustCalendarWidth();
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Adjust the width of the calendar to fit the window. This should be invoked when the
// page is first opened and whenever the window is resized.

neuro.cal.adjustCalendarWidth = function () {

    var newWidth;

    newWidth = $('.' + neuro.cal.SURROUNDING_CLASS).width() - 20;
    $('#' + neuro.cal.outersurroundID).width(newWidth);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Respond to a double-click on the calendar body. These means the user wants to add a new visit
// in the slot she clicked on.

///////////////////////////////////////////////////////////////////////////////////////////////////
// Resize the height of the main calendar div as the window changes size.

neuro.cal.resizeCalendar = function () {
    'use strict';

    var MIN_HEIGHT = 400; // 500;

    var windowHeight, panelHeight, spareHeight;
    //var $panel = $('.cal_outerbody'); // Can't use "neuro.cal.outerbodyID" -- it hasn't been set yet
    var $panel = $('#' + neuro.cal.outerbodyID);
    var $bottomPlaceholder = $('body');
    var bottomPos;
    var scrollPos;

    windowHeight = $(window).outerHeight();
    bottomPos = $bottomPlaceholder.offset().top + $bottomPlaceholder.outerHeight();

    spareHeight = windowHeight - bottomPos;
    panelHeight = Math.max($panel.height() + spareHeight, MIN_HEIGHT);
    $panel.height(panelHeight);
};

neuro.cal.onDoubleClickBody = function (eventObject) {

    var $elem;
    var elemPos, elemTop, elemLeft, elemOffset, slot0Offset, isInside;
    var slotNew, visitDateTime, visitDate, visitTime;
    var visitDateLocalizedStr;
    var clientID, staffID;

    //if (!e) e = window.event;
    $elem = $(this);

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:

            // Overlay calendars are surfaced with "cal_bodycol" elements, one element for an entire
            // column. We need to calculate the position of the mouse click (from pageX/pageY) relative
            // to the body of the calendar.

            elemPos = $elem.position();
            elemTop = eventObject.pageY - $elem.offset().top + elemPos.top;
            elemLeft = eventObject.pageX - $elem.offset().left + elemPos.left;
            isInside = neuro.cal.inbounds(elemTop, elemLeft);
            break;

        case neuro.cal.CALTYPE_STACKED:

            // Stacked calendars have slots contained within table cells. Thus, the position()
            // function returns the position within the cell, which isn't very useful. So, we
            // use the offset() function instead, which returns the location within the entire
            // document.
            // TODO: Should we use the same method for overlay calendar above?

            elemOffset = $elem.offset();
            slot0Offset = $('#' + neuro.cal.slotID(0)).offset();
            isInside = neuro.cal.inbounds(elemOffset.top - slot0Offset.top, elemOffset.left - slot0Offset.left);
            break;
    }

    if (isInside) {

        // On overlay calendars, each slot represents a specific date/time.
        // On stacked calendars, all slots in each column are for different groups within the same date,

        switch (neuro.cal.calType) {
            case neuro.cal.CALTYPE_OVERLAY:

                slotNew = neuro.cal.mapCoordToSlot(elemTop, elemLeft);
                visitDateTime = neuro.cal.mapSlotToDateTime(slotNew);
                visitDate = neuro.cal.dateTrunc(visitDateTime);
                visitTime = visitDateTime;

                // We don't allow dragging to change the client, just the staff. So, we allow the date/time
                // to be changed by the drag, but we remap to the slot without changing the staff.
                // See how the user likes this. It make be a better idea to just revert the drag if
                // the user tries to change clients.

                if (neuro.cal.groupsRepresentStaff) {
                    staffID = neuro.cal.mapSlotToStaffID(slotNew);
                }
                else if (neuro.cal.groupsRepresentClients) {
                    clientID = neuro.cal.mapSlotToClientID(slotNew);
                }
                break;

            case neuro.cal.CALTYPE_STACKED:

                // Date is the calendar beginning date, plus add a day per column we dragged into.
                // Time stays the same.

                slotNew = neuro.cal.mapCoordToSlot(elemOffset.top - slot0Offset.top, elemOffset.left - slot0Offset.left);
                visitDate = neuro.cal.begDate.addDays(neuro.cal.mapSlotToRowCol(slotNew).col);

                // We don't allow dragging to change the client, just the staff. So, we allow the date/time
                // to be changed by the drag, but we remap to the slot without changing the staff.
                // See how the user likes this. It make be a better idea to just revert the drag if
                // the user tries to change clients.

                if (neuro.cal.rowsRepresentStaff) {
                    staffID = neuro.cal.mapSlotToStaffID(slotNew);
                }
                else if (neuro.cal.rowsRepresentClients) {
                    clientID = neuro.cal.mapSlotToClientID(slotNew);
                }
                break;
        }

        // Open the AddVisit accordion and insert the values we have.
        // BUG: Each time we execute this, we toggle the open/closed state of the accordion panel.
        // jQuery does not have a way to say "open the panel, or leave it open if it already is,"
        // nor is there a way to test the open/closed status of the panel. Thus, we have to live
        // with the toggling behavior for now.

        //$('#' + neuro.cal.addVisitAccordionID).accordion('activate', Number(neuro.cal.addVisitAccordionIndex));
        $('#' + neuro.cal.addVisitAccordionID).accordion('option', 'active', Number(neuro.cal.addVisitAccordionIndex));

        // If the user clicked on a client row, we'll pre-seelct the client in the AddVisit control's
        // drop-down list of clients. We'll also have to tell the server, so AddVisit can load various
        // info for the client (e.g., default contract, recent staff, etc.).

        if (clientID) {

            $('#' + neuro.cal.addVisitClientPickerID).val(clientID);
            //neuro.cal.fetchClientForAddVisitWS(clientID, visitDate);
            setTimeout('__doPostBack("' + neuro.cal.addVisitClientPickerID + '", "")', 0); // Signal a postback for the dropdownlist of clients
        }

        // Set the AddVisit control's start date to the date that was clicked on. Set the thru date
        // to open-ended. Note that it would be nice to set the thru date itself to match the start
        // date (and thus prevent the dates from crossing over), but that causes a problem. The next
        // postback will fire an event identical to the user changing the date, and the server-side
        // code can't distinguish the cause. That is, setting the thru date here has the same effect
        // as the user clicking on a new thru date, and that can cause confusion.

        visitDateLocalizedStr = adacare.lib.formatDateLocalized(adacare.lib.countryAbbr, visitDate);
        //$('#' + neuro.cal.addVisitStartDatePickerID).val(visitDateLocalizedStr);
        //$('#' + neuro.cal.addVisitStartDatePickerHiddenID).val(visitDateLocalizedStr);
        adacare.DatePickerV3.setDateByExternalCode(neuro.cal.addVisitStartDatePickerID, visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate()); // Changed for datepickerV3.1

        $('#' + neuro.cal.addVisitThruDateOpenEndedID).prop('checked', true); // OBSOLETE

        if (visitTime) {
            $('#' + neuro.cal.addVisitTimePickerID).val(adacare.lib.FormatParseableTimeStr(visitTime));
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Set a "please wait" to pop up or close.

/***
neuro.cal.pleaseWaitPopup = function (action) {

    //var DELAY_MS = 100;

    switch (action) {

        case 'open':
            adacare.lib.pleaseWaitPopup('open');
            break;

        case 'close':
            adacare.lib.pleaseWaitPopup('close');
            break;
    }
};
***/

///////////////////////////////////////////////////////////////////////////////////////////////////
// Define the element IDs of the edit dialog.

neuro.cal.initEditDialog = function (
    editDialogID,
    editDialogVisitIDID,
    editDialogClientNameID,
    editDialogClientAddressID,
    editDialogClientCityID,
    editDialogClientResPhoneID,
    editDialogClientMobilePhoneID,
    editDialogClientEmailID,
    editDialogClientEmailUrlID,
    editDialogClientContactInfoID,
    //editDialogStaffIDID, // OBSOLETE
    editDialogStaffAddressID,
    editDialogStaffCityID,
    editDialogStaffResPhoneID,
    editDialogStaffMobilePhoneID,
    editDialogStaffEmailID,
    editDialogStaffEmailUrlID,
    editDialogStaffContactInfoID,
    editDialogDatePickerID,
    editDialogDatePickerHiddenID,
    editDialogTimePickerID,
    editDialogContractID,
    editDialogVisitTypeID,
    editDialogBaseMinutesID,
    editDialogExtraMinutesID,
    editDialogVisitFinalStatusID,
    editDialogIsConfirmedID,
    editDialogIsBillableToClientID,
    editDialogIncludeInPayrollID,
    editDialogMileageID,
    editDialogVisitNotesID,
    editDeleteDialogID,
    editDialogSpecialRatesEditorSurroundID) {

    neuro.cal.editDialogID = editDialogID;                                          // Edit visit dialog div
    neuro.cal.minutesPerSlot = 15; // TBD -- pass in as Company.MinutesPerSlot parm!
    neuro.cal.editDialogVisitIDID = editDialogVisitIDID;                            // Visit ID field
    neuro.cal.editDialogClientNameID = editDialogClientNameID;                      // Client name field
    //neuro.cal.editDialogClientMapButtID = editDialogClientMapButtID;                // Map URL for client's address
    neuro.cal.editDialogClientAddressID = editDialogClientAddressID;                // Client address field
    neuro.cal.editDialogClientCityID = editDialogClientCityID;                      // Client city field
    neuro.cal.editDialogClientResPhoneID = editDialogClientResPhoneID;              // Client home phone field
    neuro.cal.editDialogClientMobilePhoneID = editDialogClientMobilePhoneID;        // Client mobile phone field
    neuro.cal.editDialogClientEmailID = editDialogClientEmailID;                    // Client email address field
    neuro.cal.editDialogClientEmailUrlID = editDialogClientEmailUrlID;              // Client email address URL field
    neuro.cal.editDialogClientContactInfoID = editDialogClientContactInfoID;        // Client contact info field
    //neuro.cal.editDialogStaffIDID = editDialogStaffIDID; // OBSOLETE                            // Staff ID field
    //neuro.cal.editDialogStaffMapButtID = editDialogStaffMapButtID;                  // Map URL for staff's address
    neuro.cal.editDialogStaffAddressID = editDialogStaffAddressID;                  // Staff address field
    neuro.cal.editDialogStaffCityID = editDialogStaffCityID;                        // Staff city field
    neuro.cal.editDialogStaffResPhoneID = editDialogStaffResPhoneID;                // Staff home phone field
    neuro.cal.editDialogStaffMobilePhoneID = editDialogStaffMobilePhoneID;          // Staff mobile phone field
    neuro.cal.editDialogStaffEmailID = editDialogStaffEmailID;                      // Staff email address field
    neuro.cal.editDialogStaffEmailUrlID = editDialogStaffEmailUrlID;                // Staff email address URL field
    neuro.cal.editDialogStaffContactInfoID = editDialogStaffContactInfoID;          // Staff contact info field
    neuro.cal.editDialogDatePickerID = editDialogDatePickerID;                      // Visit date field
    neuro.cal.editDialogDatePickerHiddenID = editDialogDatePickerHiddenID;          // Hidden date field, copy of above
    neuro.cal.editDialogTimePickerID = editDialogTimePickerID;                      // Visit time field
    neuro.cal.editDialogContractID = editDialogContractID;                          // Contract
    neuro.cal.editDialogVisitTypeID = editDialogVisitTypeID;                        // VisitType
    neuro.cal.editDialogBaseMinutesID = editDialogBaseMinutesID;                    // Base minutes field
    neuro.cal.editDialogExtraMinutesID = editDialogExtraMinutesID;                  // Extra minutes field
    neuro.cal.editDialogVisitFinalStatusID = editDialogVisitFinalStatusID;          // Final visit status field
    neuro.cal.editDialogIsConfirmedID = editDialogIsConfirmedID;                    // Is confirmed field
    neuro.cal.editDialogIsBillableToClientID = editDialogIsBillableToClientID;      // Is billable to client checkbox
    neuro.cal.editDialogIncludeInPayrollID = editDialogIncludeInPayrollID;          // Include in payroll checkbox
    neuro.cal.editDialogMileageID = editDialogMileageID;                            // Mileage field -- DEPRECATED. REMOVE NEXT OPPORTUNITY
    neuro.cal.editDialogVisitNotesID = editDialogVisitNotesID;                      // Notes field
    neuro.cal.editDeleteDialogID = editDeleteDialogID;                              // Delete visit dialog div

    neuro.cal.editDialogSpecialRatesEditorSurroundID = editDialogSpecialRatesEditorSurroundID;

    // Init the selectmenu for staff

    neuro.cal.editDialogStaffSelectMenuInit();

    // Init the TimePickers

    //adacare.lib.initTimePicker(neuro.cal.editDialogActualArrivalTimeID, neuro.cal.minutesPerTimePicker);
    //adacare.lib.initTimePicker(neuro.cal.editDialogActualDepartureTimeID, neuro.cal.minutesPerTimePicker);

    // Bind a function to the VisitType control, so that the VisitType's minutes
    // are recalculated whenever the control is changed.

    $('#' + editDialogVisitTypeID).bind('change', function (e) {

        var ID;
        ID = $('#' + editDialogVisitTypeID).val();
        $('#' + editDialogBaseMinutesID).text(neuro.cal.getVisitTypeMinutesFormatted(ID));
    });

    // Guard against reducing a visit to less than one slot.

    $('#' + neuro.cal.editDialogExtraMinutesID).bind('change', function (e) {

        var visitTypeID, a, b;
        visitTypeID = $('#' + neuro.cal.editDialogVisitTypeID).val();
        a = parseInt($('#' + neuro.cal.editDialogExtraMinutesID).val(), 10);
        b = neuro.cal.getVisitTypeMinutes(visitTypeID);

        // If the visit's length goes negative, reset the extra minutes.

        if ((a + b) <= 0) {
            $('#' + neuro.cal.editDialogExtraMinutesID).val('0');
        }
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Init the edit dialog's staff selectmenu.

neuro.cal.editDialogStaffSelectMenuInit = function () {
    'use strict';

    var staff; //, staffID;
    var groupForRecentStaff, groupForAllStaff;
    var groupItem, groupItemList = [], groupList = [];
    var i; // = 0;

    //for (staffID in neuro.cal.staffList) {
    for (i = 0; i < neuro.cal.staffList.length; i++) {

        //staff = neuro.cal.getStaff(staffID);
        staff = neuro.cal.staffList[i];
        groupItem = new adacare.SelectMenu.GroupItem(staff.fullname, staff.ID, false);
        groupItemList[i] = groupItem;
        //i++;
    }

    groupForRecentStaff = new adacare.SelectMenu.Group(neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_RECENT_TITLE, []);
    groupForAllStaff = new adacare.SelectMenu.Group(neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_ALL_TITLE, groupItemList);
    groupList[neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_RECENT_INDEX] = groupForRecentStaff;
    groupList[neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_ALL_INDEX] = groupForAllStaff;

    adacare.SelectMenu.init(neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_ELEM_ID, neuro.cal.STAFF_UNASSIGNED_ID, groupList, neuro.cal.editvisit.ChangeStaffSelect);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Update the edit dialog's staff selectmenu for the "recent staff" group. This is used whenever
// the edit dialog is opened, to display the recent staff for the client of the visit being edited.

neuro.cal.editDialogStaffSelectMenuUpdateRecent = function (recentStaffIDList) {
    'use strict';

    var groupItem, groupItemList = [];
    var staff;
    var i;

    for (i = 0; i < recentStaffIDList.length; i++) {

        staff = this.getStaff(recentStaffIDList[i]);

        if (staff != null) {

            groupItem = new adacare.SelectMenu.GroupItem(staff.fullname, staff.ID, false);
            groupItemList[groupItemList.length] = groupItem;
        }
    }

    adacare.SelectMenu.updateGroup(neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_ELEM_ID, neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_GROUP_RECENT_INDEX, groupItemList);
    adacare.SelectMenu.setSelectedValue(neuro.cal.EDIT_DIALOG_STAFF_SELECTMENU_ELEM_ID, neuro.cal.editDialogSelectedStaffIDNEW);
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize the Add Visit info.

neuro.cal.initAddVisit = function (
        //addVisitAccordionID, // OBSOLETE
        //addVisitAccordionIndex, // OBSOLETE
        addVisitClientPickerID,
        addVisitStartDatePickerID,
        //addVisitStartDatePickerHiddenID, // OBSOLETE
        //addVisitThruDateOpenEndedID, // OBSOLETE
        //addVisitThruDatePickerID, // OBSOLETE
        //addVisitThruDatePickerHiddenID, // OBSOLETE
        addVisitTimePickerID
    //addVisitSchedulingPrefsID,  // OBSOLETE
    //addVisitClientActiveEndDatePanelID, // OBSOLETE
    //addVisitClientActiveEndDateMsgID // OBSOLETE
        ) {

    //neuro.cal.addVisitAccordionID = addVisitAccordionID;
    //neuro.cal.addVisitAccordionIndex = addVisitAccordionIndex;
    neuro.cal.addVisitClientPickerID = addVisitClientPickerID;
    neuro.cal.addVisitStartDatePickerID = addVisitStartDatePickerID;
    //neuro.cal.addVisitStartDatePickerHiddenID = addVisitStartDatePickerHiddenID;
    //neuro.cal.addVisitThruDateOpenEndedID = addVisitThruDateOpenEndedID;
    //neuro.cal.addVisitThruDatePickerID = addVisitThruDatePickerID;
    //neuro.cal.addVisitThruDatePickerHiddenID = addVisitThruDatePickerHiddenID;
    neuro.cal.addVisitTimePickerID = addVisitTimePickerID;
    //neuro.cal.addVisitSchedulingPrefsID = addVisitSchedulingPrefsID;
    //neuro.cal.addVisitClientActiveEndDatePanelID = addVisitClientActiveEndDatePanelID;
    //neuro.cal.addVisitClientActiveEndDateMsgID = addVisitClientActiveEndDateMsgID;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Group constructor.

neuro.cal.Group = function (descrip, staffID) {

    this.descrip = descrip;
    this.staffID = staffID; // TODO: eliminate this?
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Client constructor.

neuro.cal.Client = function (ID, displayRow, fullname) {

    this.ID = ID;
    this.displayRow = displayRow;
    this.fullname = fullname;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Staff constructor.

neuro.cal.Staff = function (ID, displayRow, fullname) {

    this.ID = ID;
    this.displayRow = displayRow;
    this.fullname = fullname;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// VisitType constructor.

neuro.cal.VisitType = function (ID, shortName, descrip, minutesLength, billingUseEstimate, billingMinutesEstimate, payrollUseEstimate, payrollMinutesEstimate) {

    this.ID = ID;
    this.shortName = shortName;
    this.descrip = descrip;
    this.minutesLength = minutesLength;
    this.billingUseEstimate = billingUseEstimate;
    this.billingMinutesEstimate = billingMinutesEstimate;
    this.payrollUseEstimate = payrollUseEstimate;
    this.payrollMinutesEstimate = payrollMinutesEstimate;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Visit constructor.

neuro.cal.Visit = function (visitID, outcomeID, scheduleID, visitDate, groupNum, clientID, staffID, begDateTime, visitTypeID, extraMinutes, visitFinalStatus, visitTagIDList, hasProblems, freqOnce, isAvailable, hasNotes) {

    this.visitID = visitID;
    this.outcomeID = outcomeID;
    this.scheduleID = scheduleID;
    this.visitDate = visitDate;
    this.clientID = clientID;
    this.staffID = staffID;
    this.groupNum = groupNum;
    this.begDateTime = begDateTime;
    this.visitTypeID = visitTypeID;
    this.extraMinutes = extraMinutes;
    this.visitFinalStatus = visitFinalStatus;
    this.visitTagIDList = visitTagIDList;
    this.hasProblems = hasProblems;
    this.freqOnce = freqOnce;
    this.isAvailable = isAvailable;
    this.hasNotes = hasNotes;
    this.slot = neuro.cal.mapVisitToSlot(this); // Call this AFTER setting groupNum and begDateTime
    this.vElemID = neuro.cal.elemID(visitID);
    this.vElemOflowID = neuro.cal.elemOflowID(visitID);
    this.dirty = false;
    this.hidden = false;
    this.deleted = false;
};

neuro.cal.Visit.prototype.baseMinutes = function () { return neuro.cal.getVisitTypeMinutes(this.visitTypeID); };
neuro.cal.Visit.prototype.slots = function () { return (this.baseMinutes() + this.extraMinutes) / neuro.cal.slotMinutes; };
neuro.cal.Visit.prototype.endDateTime = function () { return new Date(this.begDateTime.getTime() + (this.baseMinutes() + this.extraMinutes) * neuro.cal.MS_PER_MINUTE); };

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a group to the calendar.
// TODO: Consider indexing groupList[] by the staffID, and maybe simply call it "staffList[]".
// To do so, need to see if all uses of neuro.cal use staff for the groups, or is there a case
// for groups to be an object of various types?

neuro.cal.addGroup = function (groupNum, descrip, staffID) {

    var g;

    g = new neuro.cal.Group(descrip, staffID);
    neuro.cal.groupList[groupNum] = g;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a client to the calendar.

neuro.cal.addClient = function (ID, displayRow, fullname) {

    var client;

    client = new neuro.cal.Client(ID, displayRow, fullname);
    neuro.cal.clientList[ID] = client;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a staff to the calendar.

neuro.cal.addStaff = function (ID, displayRow, fullname) {

    var staff, staffCount;

    staff = new neuro.cal.Staff(ID, displayRow, fullname);
    //neuro.cal.staffList[ID] = staff; // Consider changing this to "String(ID)". Ditto for addClient().
    staffCount = neuro.cal.staffList.length;
    neuro.cal.staffList[staffCount] = staff;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a visit type to the calendar.

/***
neuro.cal.addVisitType = function (ID, shortName, descrip, minutesLength, billingUseEstimate, billingMinutesEstimate, payrollUseEstimate, payrollMinutesEstimate) {

    var vt;

    vt = new neuro.cal.VisitType(ID, shortName, descrip, minutesLength, billingUseEstimate, billingMinutesEstimate, payrollUseEstimate, payrollMinutesEstimate);
    neuro.cal.visitTypeList[ID] = vt;
};

// Use this version from server-side calls. It converts 1/0 into boolean true/false.

neuro.cal.addVisitTypeFromServer = function (ID, shortName, descrip, minutesLength, billingUseEstimate, billingMinutesEstimate, payrollUseEstimate, payrollMinutesEstimate) {

    var billingUseEstimateBool, payrollUseEstimateBool;

    billingUseEstimateBool = (billingUseEstimate !== 0);
    payrollUseEstimateBool = (payrollUseEstimate !== 0);
    neuro.cal.addVisitType(ID, shortName, descrip, minutesLength, billingUseEstimateBool, billingMinutesEstimate, payrollUseEstimateBool, payrollMinutesEstimate);
};
***/

neuro.cal.addVisitTypeFromServer = function (AddVisitTypeItemJson) {

    var vt;

    vt = new neuro.cal.VisitType(AddVisitTypeItemJson.ID,
        AddVisitTypeItemJson.ShortName,
        AddVisitTypeItemJson.Descrip,
        AddVisitTypeItemJson.MinutesLength,
        AddVisitTypeItemJson.BillingUseEstimate,
        AddVisitTypeItemJson.BillingMinutesEstimate,
        AddVisitTypeItemJson.PayrollUseEstimate,
        AddVisitTypeItemJson.PayrollMinutesEstimate);

    neuro.cal.visitTypeList[AddVisitTypeItemJson.ID] = vt;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a visit to the calendar.
//
// There are two versions of this function, one used by local JavaScript code, and another that is
// just a shell used by the server-side calls. The shell converts a 0 or 1 into the respective
// boolean true/false.
//
// Note that displayAllVisits() must be called after all visits have been added.

// Use this version for calls from server-side code.

neuro.cal.addVisitFromServer = function (AddVisitItemJson) {

    neuro.cal.addVisit(
        AddVisitItemJson.FakeVisitID,
        AddVisitItemJson.VisitOutcomeID,
        AddVisitItemJson.VisitScheduleID,
        AddVisitItemJson.VisitDateStr,
        AddVisitItemJson.GroupNum,
        AddVisitItemJson.ClientID,
        AddVisitItemJson.StaffID,
        AddVisitItemJson.BegDateTimeStr,
        AddVisitItemJson.VisitTypeID,
        AddVisitItemJson.ExtraMinutes,
        AddVisitItemJson.VisitFinalStatusMstrCode,
        AddVisitItemJson.VisitTagIDList,
        AddVisitItemJson.HasAnyProblems,
        AddVisitItemJson.FreqOnce,
        AddVisitItemJson.IsAvailable,
        AddVisitItemJson.HasNotes);
};

// Use this version for local JavaScript calls.

neuro.cal.addVisit = function (visitID, outcomeID, scheduleID, visitDateStr, groupNum, clientID, staffID, begDateTimeStr, visitTypeID, extraMinutes, visitFinalStatus, visitTagIDList, hasProblems, freqOnce, isAvailable, hasNotes) {

    var v;

    v = new neuro.cal.Visit(visitID,
        outcomeID,
        scheduleID,
        new Date(visitDateStr),
        groupNum,
        clientID, staffID,
        new Date(begDateTimeStr),
        visitTypeID,
        extraMinutes,
        visitFinalStatus,
        visitTagIDList,
        hasProblems,
        freqOnce,
        isAvailable,
        hasNotes);

    neuro.cal.visitList[visitID] = v;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Display all visits.

neuro.cal.displayAllVisits = function () {

    var v, visitID;
    var index;

    for (index in neuro.cal.visitList) {
        visitID = index;
        v = neuro.cal.visitList[visitID];
        neuro.cal.constructVisitElem(v, visitID, visitID);
        neuro.cal.placeVisit(v, true);
    }

    neuro.cal.enableWidgetsForAllVisits();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Enable the various widgets for the given visit element(s), either all visits, or just one.

neuro.cal.enableWidgetsForAllVisits = function () {

    neuro.cal.enableWidgets('.' + neuro.cal.visitClassBase);
};

neuro.cal.enableWidgetsForOneVisit = function (visitID) {

    neuro.cal.enableWidgets('#' + neuro.cal.elemID(visitID));
};

neuro.cal.enableWidgets = function (jqSelector) {

    var bodyElem, $allVisits;

    bodyElem = document.getElementById(neuro.cal.bodyID);
    $allVisits = $(jqSelector).dblclick(neuro.cal.onDoubleClickVisit);

    $allVisits.draggable({
        containment: bodyElem,
        grid: [neuro.cal.colWidth, neuro.cal.rowHeightForDrag],
        opacity: 0.6,
        stop: neuro.cal.editvisit.DragEnd,
        cursor: "move",
        //cursorAt: { top: 0 },
        cursorAt: false, // Changed 5/14/13 SG
        distance: 10,
        scroll: true // Added 5/14/13 SG
    });

    $allVisits.addTouch();

    if (neuro.cal.calType === neuro.cal.CALTYPE_OVERLAY) {

        // Bug warning:
        // If either the "ghost" or "helper" option is added, the
        // visit will be shifted to the left after resizing. The amount
        // of the shift looked suspiciously close to the width of the
        // left column of the calendar (the hour labels).

        $allVisits.resizable({
            containment: bodyElem,
            grid: [neuro.cal.colWidth, neuro.cal.rowHeight],
            distance: 5,
            handles: 's',
            minHeight: neuro.cal.rowHeight - 1,
            maxWidth: neuro.cal.visitWidth,
            stop: neuro.cal.editvisit.ResizeEnd
        });
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Construct a visit element.

neuro.cal.constructVisitElem = function (v, visitID, parentVisitID) {

    var $newElem;
    var vElemID;
    var vElemRepeaterID;
    var vElemHeaderID;
    var vElemTimeID;
    var vElemMinutesID;
    var elemFullname;
    var elemHtml;
    var elemHtmlTemplate = '<div id="{0}" class="{3}">' +
        '<div id="{13}" class="{14}">&nbsp;</div>' +
        '<div id="{4}" class="{5}">{6}</div>' +
        '<div id="{7}" class="{8}">{9}</div>' +
        '<div id="{10}" class="{11}">{12}</div>' +
        '</div>';

    vElemID = neuro.cal.elemID(visitID);
    vElemTimeID = neuro.cal.elemTimeID(visitID);
    vElemMinutesID = neuro.cal.elemMinutesID(visitID);
    vElemHeaderID = neuro.cal.elemHeaderID(visitID);
    vElemRepeaterID = neuro.cal.elemRepeaterID(visitID);

    elemFullname = (neuro.cal.viewWho === neuro.cal.VIEWWHO_CLIENT) ? neuro.cal.getStaff(v.staffID).fullname : neuro.cal.clientList[v.clientID].fullname;

    // Construct the HTML for the visit element. Note that we're using the replace() methods with string
    // literals instead of regular expressions, so only the first instance is replaced. If the same replacement
    // is needed more than once, use replace(/\{0\}/g,xxx) instead of replace('{0}',xxx).

    elemHtml = elemHtmlTemplate.replace('{0}', vElemID).replace('{3}', neuro.cal.visitClassBase)
        .replace('{4}', vElemTimeID).replace('{5}', neuro.cal.visitClassTime).replace('{6}', neuro.cal.visitTimeStr(v))
        .replace('{7}', vElemMinutesID).replace('{8}', neuro.cal.visitClassMinutes).replace('{9}', neuro.cal.timeStr(v.endDateTime()))
        .replace('{10}', vElemHeaderID).replace('{11}', neuro.cal.visitClassHeader).replace('{12}', elemFullname)
        .replace('{13}', vElemRepeaterID).replace('{14}', neuro.cal.visitClassRepeater);
    $newElem = $(elemHtml).appendTo('#' + neuro.cal.bodyID);

    // Add these attribute as coded below. Incorporating them in the template doesn't
    // seem to work in Safari.
    //
    // jQuery tip: With newer versions of jQuery (1.7+, I think), properties and attributes are
    // referenced differently. In particular:
    //
    // 1. We use "name" as an attribute. This is convenient for selecting children of a slot with a
    //    name of "visit."
    // 2. We use "visitID" as a property, so we can reference the visit ID of a DOM element as
    //    "elem.visitID." We could convert all usage as an attribute instead, but it's more useful
    //    (and a little nicer to code) as a property.

    $newElem.attr('name', neuro.cal.VISIT_ELEMNAME);
    $newElem[0].visitID = parentVisitID;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Make a text DOM element unselectable. This is a good idea for any  elements within a draggable
// element. Otherwise, the text of many of the visits is highlighted during the drag, a rather
// ugly effect.

// TODO: This gets called too many times. Can we call once for all visits?

neuro.cal.makeUnselectable = function (elem) {

    /*** jQuery.browser is obsolete
    if (jQuery.browser.msie) {
        elem.unselectable = "on";
    }
    else {
        elem.style.MozUserSelect = 'none';
        elem.style.KhtmlUserSelect = 'none';
        elem.style.userSelect = 'none';
    }
    ***/

    elem.unselectable = 'on';
    elem.style.MozUserSelect = 'none';
    elem.style.KhtmlUserSelect = 'none';
    elem.style.userSelect = 'none';
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add or remove the special CSS classes to the visit as needed.

neuro.cal.addSpecialClasses = function (v, $vElem) {

    var needWarning, isKept, isNoShow, isUnassigned;
    var $vElemRepeater;
    var $tempElem, visitTagMstrID, visitTagCode, visitTagCss, i;

    // These are add-on classes, to append icon tags to the visit.

    var tagSurroundTemplate = '<div class="{0}">{1}</div>'; // Surrounds the tags
    var tagTemplate = '<span class="{0}"></span>';          // For each tag inside the surround
    var tagSurroundHtml, tagHtml = '';

    $vElemRepeater = $('#' + neuro.cal.elemRepeaterID(v.visitID));
    needWarning = v.hasProblems;
    isKept = (v.visitFinalStatus === neuro.cal.VISITFINALSTATUS_KEPT);
    isNoShow = (v.visitFinalStatus === neuro.cal.VISITFINALSTATUS_NOSHOW_CAREGIVER || v.visitFinalStatus === neuro.cal.VISITFINALSTATUS_NOSHOW_CLIENT);
    isUnassigned = (v.staffID === neuro.cal.STAFF_UNASSIGNED_ID);

    // Remove classes. Check to see if the current version of jQuery allows this to be more efficient.

    if ($vElem.hasClass(neuro.cal.visitClassDefault)) {
        $vElem.removeClass(neuro.cal.visitClassDefault);
    }

    if ($vElem.hasClass(neuro.cal.visitClassKept)) {
        $vElem.removeClass(neuro.cal.visitClassKept);
    }

    if ($vElem.hasClass(neuro.cal.visitClassAvailable)) {
        $vElem.removeClass(neuro.cal.visitClassAvailable);
    }

    if ($vElem.hasClass(neuro.cal.visitClassWarning)) {
        $vElem.removeClass(neuro.cal.visitClassWarning);
    }

    if ($vElem.hasClass(neuro.cal.visitClassUnassigned)) {
        $vElem.removeClass(neuro.cal.visitClassUnassigned);
    }

    // Remove any add-on elements (used for various icons attached to the visit)

    if ($vElemRepeater.hasClass(neuro.cal.visitClassRepeater)) {
        $vElemRepeater.removeClass(neuro.cal.visitClassRepeater);
    }

    $tempElem = $vElem.find('.' + neuro.cal.visitClassNoShow);

    if ($tempElem.length > 0) {
        $tempElem.remove();
    }

    // Add the classes to the visit element

    if (isKept) {
        $vElem.addClass(neuro.cal.visitClassKept);
    }
    else if (v.isAvailable) {
        $vElem.addClass(neuro.cal.visitClassAvailable);
    }
    else if (isUnassigned) {
        $vElem.addClass(neuro.cal.visitClassUnassigned);
    }
    else if (needWarning) {
        $vElem.addClass(neuro.cal.visitClassWarning);
    }
    else {
        $vElem.addClass(neuro.cal.visitClassDefault);
    }

    // Construct the HTML for the tag list.

    for (i = 0; i < v.visitTagIDList.length; i++) {

        visitTagMstrID = v.visitTagIDList[i];
        visitTagCode = neuro.VisitTags.visitTagMstrList[visitTagMstrID].code;
        visitTagCss = neuro.VisitTags.findCss(visitTagCode);
        tagHtml += tagTemplate.replace('{0}', visitTagCss);
    }

    // Add the "has notes" tag.

    if (v.hasNotes) {

        tagHtml += tagTemplate.replace('{0}', neuro.VisitTags.CSS_HAS_NOTES);
    }

    // Add the "repeater" tag if this visit's schedule repeats.

    if (!v.freqOnce) {

        // $vElemRepeater.addClass(neuro.cal.visitClassRepeater); // Old code, converted to tags 9/27/14
        tagHtml += tagTemplate.replace('{0}', neuro.VisitTags.CSS_REPEATER);
    }

    tagSurroundHtml = tagSurroundTemplate.replace('{0}', neuro.VisitTags.CSS_SURROUND).replace('{1}', tagHtml);
    $vElem.find('.' + neuro.VisitTags.CSS_SURROUND).remove();
    $vElem.append(tagSurroundHtml); // Use prepend() to place in foreground, append() to place in background

    // This is a slooooooow technique! Adding/deleting element from the DOM is slow in most browsers.
    // We should use the same techniques as for the repeater above: have a dedicated element for highlighting
    // no-shows, and just add or delete the element's CSS. We'll leave this as-is for now, because we just
    // don't have that many no-shows to make much difference. Improve this later.

    if (isNoShow) {
        $vElem.prepend('<div class="' + neuro.cal.visitClassNoShow + '">&nbsp;</div>');
        $vElem.find('.' + neuro.cal.visitClassNoShow).height($vElem.height()).width($vElem.width());
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return the DOM element ID of the given visit, and of its children.

neuro.cal.elemID = function (visitID) { return 'v_' + visitID; };
neuro.cal.elemRepeaterID = function (visitID) { return 'v_' + visitID + '_rep'; };
neuro.cal.elemInnerID = function (visitID) { return 'v_' + visitID + '_inner'; };
neuro.cal.elemHeaderID = function (visitID) { return 'v_' + visitID + '_head'; };
neuro.cal.elemTimeID = function (visitID) { return 'v_' + visitID + '_time'; };
neuro.cal.elemMinutesID = function (visitID) { return 'v_' + visitID + '_mins'; };
neuro.cal.elemInfoID = function (visitID) { return 'v_' + visitID + '_info'; };
neuro.cal.elemResizeGripID = function (visitID) { return 'v_' + visitID + '_resizeGrip'; };
neuro.cal.visitOflowID = function (visitID) { return visitID.toString() + 'oflow'; };
neuro.cal.elemOflowID = function (visitID) { return 'v_' + neuro.cal.visitOflowID(visitID); };
neuro.cal.slotID = function (slot) { return neuro.cal.slotIDPrefix + slot; };

///////////////////////////////////////////////////////////////////////////////////////////////////
// Place a visit on the calendar (either type, overlay or stacked).
//
// The isInitialLoad parameter indicates whether this is the first-time display of the calendar,
// when many visits are being placed all at once. We use this parameter to skip over fancy display
// animations for the sake of speed.

neuro.cal.placeVisit = function (v, isInitialLoad) {

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            neuro.cal.placeOverlayVisit(v, isInitialLoad);
            break;

        case neuro.cal.CALTYPE_STACKED:
            neuro.cal.placeStackedVisit(v, isInitialLoad);
            break;

        default:
            throw new Error('neuro.cal.placeVisit: calendar type "' + neuro.cal.calType + '" is not defined!');
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Place a visit on an overlay calendar.
//
// On overlay calendars, the visits are positioned by absolute (relative to the calendar body) pixel
// address on a DIV that overlays the calendar slots. Visits have a height proportional to their 
// length in minutes. Also (and this is messy), they can overflow fromthe bottom of one column to the
// top of the next. This happens when the visit wraps around midnight.

neuro.cal.placeOverlayVisit = function (v, isInitialLoad) {

    var coords, elemHeight, elemWidth;
    var slotRowColTop, slotRowColBot;
    var slotMain, slotsMain;
    var slotOflow, slotsOflow;
    var $vElem, vElemID;
    var visitID, visitOflowID;
    var $vElemOflow, vElemOflowID;
    var vElemTimeID, vElemOflowTimeID;
    var vElemMinutesID, vElemOflowMinutesID;

    visitID = v.visitID;
    visitOflowID = neuro.cal.visitOflowID(visitID);
    vElemID = neuro.cal.elemID(visitID);
    vElemOflowID = neuro.cal.elemOflowID(visitID);
    vElemTimeID = neuro.cal.elemTimeID(visitID);
    vElemOflowTimeID = neuro.cal.elemTimeID(visitOflowID);
    vElemMinutesID = neuro.cal.elemMinutesID(visitID);
    vElemOflowMinutesID = neuro.cal.elemMinutesID(visitOflowID);
    $vElem = $('#' + vElemID);

    // Remove the overflow background arrows (if any).

    $vElem.removeClass(neuro.cal.visitClassOflowTop + ' ' + neuro.cal.visitClassOflowBot);

    // Calculate the visit's top and bottom slots.
    // If the visit fits in one column, we place it as a single element on the calendar.
    // If it overflows to the next column, then we need to construct an overflow element, too.

    slotRowColTop = neuro.cal.mapSlotToRowCol(v.slot);
    slotRowColBot = neuro.cal.mapSlotToRowCol(v.slot + v.slots() - 1);

    if (slotRowColBot.col === slotRowColTop.col) {

        // Normal case - we fit into one column.

        coords = neuro.cal.mapSlotToCoord(v.slot);
        elemHeight = Math.max(neuro.cal.rowHeight * v.slots() - neuro.cal.visitBorderHeight, 0); // Height cannot be negative
        elemWidth = neuro.cal.visitWidth;

        // Changed 5/14/2013 SG
        // Webkit browsers (Safari in particular) are very slow with jQuery's height() and width()
        // functions. Setting CSS properties instead is more than 10x faster (wow!).

        //$vElem.height(elemHeight).width(elemWidth).animate({ left: coords.colPx, top: coords.rowPx }, "slow");
        $vElem.css({ 'height': elemHeight, 'width': elemWidth });
        $vElem.animate({ left: coords.colPx, top: coords.rowPx }, "slow");

        // Dispose of the overflow element, if it exists.

        if ($('#' + vElemOflowID).length > 0) {
            $('#' + vElemOflowID).remove();
        }
    }
    else {

        // We don't fit in one column. First, place the main element as much as will
        // fit down to the bottom row.

        slotMain = v.slot;
        slotsMain = (neuro.cal.rows * (slotRowColTop.col + 1)) - v.slot;
        slotOflow = slotMain + slotsMain;
        slotsOflow = v.slots() - slotsMain;

        coords = neuro.cal.mapSlotToCoord(slotMain);
        elemHeight = Math.max(neuro.cal.rowHeight * slotsMain - neuro.cal.visitBorderHeight, 0); // Height cannot be negative
        elemWidth = neuro.cal.visitWidth;

        // Changed 5/14/2013 SG
        // Webkit browsers (Safari in particular) are very slow with jQuery's height() and width()
        // functions. Setting CSS properties instead is more than 10x faster (wow!).

        //$vElem.height(elemHeight).width(elemWidth);
        $vElem.css({ 'height': elemHeight, 'width': elemWidth });
        $vElem.animate({ left: coords.colPx, top: coords.rowPx }, "slow");

        $vElem.addClass(neuro.cal.visitClassOflowBot);
        $('#' + vElemTimeID).text(neuro.cal.visitTimeStr(v));
        $('#' + vElemMinutesID).text(neuro.cal.timeStr(v.endDateTime()));

        // Next, will the overflow fit in the calendar? If so, we'll create a new DOM
        // element for the overflow and place it on the page.

        if ((slotRowColTop.col + 1) < neuro.cal.colsPerGroup) {

            // Create an overflow element if it doesn't already exist.

            if ($('#' + vElemOflowID).length === 0) {
                neuro.cal.constructVisitElem(v, visitOflowID, v.visitID);
            }
            $vElemOflow = $('#' + vElemOflowID);

            coords = neuro.cal.mapSlotToCoord(slotOflow);
            elemHeight = Math.max(neuro.cal.rowHeight * slotsOflow - neuro.cal.visitBorderHeight, 0); // Height cannot be negative
            elemWidth = neuro.cal.visitWidth;

            // Changed 5/14/2013 SG
            // Webkit browsers (Safari in particular) are very slow with jQuery's height() and width()
            // functions. Setting CSS properties instead is more than 10x faster (wow!).

            //$vElemOflow.height(elemHeight).width(elemWidth);
            $vElemOflow.css({ 'height': elemHeight, 'width': elemWidth });
            $vElemOflow.animate({ left: coords.colPx, top: coords.rowPx }, "slow");

            $('#' + vElemOflowTimeID).text(neuro.cal.visitTimeStr(v));
            //$('#' + vElemOflowMinutesID).text(neuro.cal.visitMinutesStr(v));
            $('#' + vElemOflowMinutesID).text(neuro.cal.timeStr(v.endDateTime()));
            $vElemOflow.addClass(neuro.cal.visitClassOflowTop);
            neuro.cal.addSpecialClasses(v, $vElemOflow);
            neuro.cal.enableWidgetsForOneVisit(visitOflowID);
            $vElemOflow.find('*').andSelf().each(function () { neuro.cal.makeUnselectable(this); });
        }
        else {
            if ($('#' + vElemOflowID).length > 0) {
                $('#' + vElemOflowID).remove();
            }
        }
    }

    neuro.cal.addSpecialClasses(v, $vElem);
    $vElem.find('*').andSelf().each(function () { neuro.cal.makeUnselectable(this); });
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Place a visit on a stacked calendar.
//
// With stacked calendars, each slot is a separate table cell, and each visit in that slot is a DIV
// appended to the cell. The visit DIVs are all the same height, but the slot expands as needed to
// accomodate the visits. That's why we use a table - to take advantage of the automatic shrink-to-fit
// behavior that saves a lot of work.
//
// One disadvantage: You can't animate moving the visits, because the visits are positioned as "static"
// rather than "absolute." Might want to rework this approach.

neuro.cal.placeStackedVisit = function (v, isInitialLoad) {

    var elemHeight, elemWidth;
    var slotRowColTop;
    var slotID;
    var vElemID;
    var vElemTimeID;
    var $vElem;

    vElemID = neuro.cal.elemID(v.visitID);
    vElemTimeID = neuro.cal.elemTimeID(v.visitID);
    $vElem = $('#' + vElemID);

    // Calculate the visit's cell.

    slotID = neuro.cal.slotID(v.slot);
    slotRowColTop = neuro.cal.mapSlotToRowCol(v.slot);

    elemHeight = neuro.cal.visitHeight;
    elemWidth = neuro.cal.visitWidth;

    // Changed 5/14/2013 SG
    // Webkit browsers (Safari in particular) are very slow with jQuery's height() and width()
    // functions. Setting CSS properties instead is more than 10x faster (wow!).

    //$vElem.height(elemHeight).width(elemWidth);
    $vElem.css({ 'height': elemHeight, 'width': elemWidth });

    $vElem.appendTo('#' + slotID);
    $vElem.css('left', 0).css('top', 0);
    $('#' + vElemTimeID).text(neuro.cal.visitTimeStr(v));
    neuro.cal.addSpecialClasses(v, $vElem);
    $vElem.find('*').andSelf().each(function () { neuro.cal.makeUnselectable(this); });

    // Okay, it looks like there is a bug in jQuery. Even though the visit element was
    // appended to the slot in the code above, the statement:
    //
    //      var $kids = $('#' + slotID).children('[name="visit"]');
    //
    // ... does not find any children. That's important, because the sortVisitsInSlot()
    // function below needs to do just that. If it doesn't find any children, it will
    // append a placeholder to the slot. Thus, we end up with a placeholder when we
    // don't want one, and the calendar displays a blank space below the visit element.
    // Not horrible, but a little sloppy.
    //
    // As a workaround, we call sortVisitsInSlot() (who appends the placeholder), and
    // then we immediately remove the placeholder.
    //
    // One other odd thing: Within sortVisitsInSlot(), the children() function works
    // correctly just after the placeholder is appended.

    neuro.cal.sortVisitsInSlot(v.slot, isInitialLoad);
    //$('#' + slotID).children('[name="' + neuro.cal.PLACEHOLDERNAME + '"]').remove();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort the visits in a slot on s stacked calendar.
//
// In this type of calendar, several visits are stacked in the same slot. To make it look pretty,
// we want the visits to be listed in order of the starting time.

neuro.cal.sortVisitsInSlot = function (slot, isInitialLoad) {

    var slotID;
    var $kids, kidCount;
    var i, j, elem1, elem2, v1, v2;

    if (neuro.cal.calType === neuro.cal.CALTYPE_STACKED) {

        // See how many "visit" children the slot has.
        // TODO: The children() function doesn't seem to always work in Safari, as it counts zero when there's one visit. Odd.

        slotID = neuro.cal.slotID(slot);
        $kids = $('#' + slotID).children('[name="' + neuro.cal.VISIT_ELEMNAME + '"]'); // Get list of visit DOM elements in the slot.
        kidCount = $kids.length;

        // Empty slots (no visits) get a placeholder. This addresses a quirk, where empty HTML table cells
        // do not display their borders. If we insert a placeholder, the borders look fine. The placeholder
        // can be just about anything - we use a non-breaking space.

        if (kidCount === 0) {
            $(neuro.cal.PLACEHOLDERHTML).appendTo('#' + slotID).attr('name', neuro.cal.PLACEHOLDERNAME);
        }

            // Slots with at least two visits need to be sorted. Just one visit doesn't need sorting.
            // We use a bubble sort here because we expect the number of visits in the same slot to
            // be small, typically around zero to five.

        else {
            $('#' + slotID).children('[name="' + neuro.cal.PLACEHOLDERNAME + '"]').remove();
            if (kidCount > 1) {
                for (i = 0; i < kidCount - 1; i++) {
                    for (j = 0; j < kidCount - 1 - i; j++) {
                        elem1 = $kids[j];
                        elem2 = $kids[j + 1];
                        v1 = neuro.cal.visitList[elem1.visitID];
                        v2 = neuro.cal.visitList[elem2.visitID];

                        // If the visits are out of order, swap them. We have to swap them in
                        // both the list of elements from the slot, and the DOM itself.

                        if (v2.begDateTime.getTime() < v1.begDateTime.getTime()) {
                            $kids[j] = elem2;
                            $kids[j + 1] = elem1;
                            $('#' + elem2.id).insertBefore('#' + elem1.id);
                        }
                    }
                }
            }

            // Use a little animation to make the user's activity  pleasing to the eye.
            // There's no need for this during the initial load of lots of visits, and
            // we skip it in favor of speed (it's slow).

            if (!isInitialLoad) {
                $kids.hide().fadeIn('slow');
            }
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a double-click on a visit.

neuro.cal.onDoubleClickVisit = function (e) {

    neuro.cal.editvisit.Edit(e, this);

    return false; // Prevent the event from bubbling
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete the given visit.

neuro.cal.deleteVisit = function (visitID) {

    var v;

    //neuro.cal.deleteVisitWS(visitID);

    v = neuro.cal.visitList[visitID];
    $('#' + v.vElemID).hide('scale', function () { $(this).remove(); });
    if ($('#' + v.vElemOflowID).length > 0) {
        $('#' + v.vElemOflowID).hide('scale', function () { $(this).remove(); });
    }

    neuro.cal.sortVisitsInSlot(v.slot, false);
    v.dirty = true;
    v.hidden = true;
    v.deleted = true;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Check to see if a given date/time is within the span of the calendar.

neuro.cal.withinCalDateSpan = function (dt) {

    var result;

    result = dt >= neuro.cal.begDateTime && dt <= neuro.cal.endDateTime;

    return result;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Test to see if a visit element is in bounds of the calendar body.
// The coordinate parameters are given relative to the calendar body, starting at slot #0.

neuro.cal.inbounds = function (top, left) {

    var result = false;
    var topRow, botRow;
    var calTopPx, calRightPx, calBotPx, calLeftPx;

    switch (neuro.cal.calType) {

        // Overlay calendars have fixed-height rows and columns. Finding the bottom and                                                                                                                                                                                                     
        // right edges is just simple calculation.                                                                                                                                                                                                      

        case neuro.cal.CALTYPE_OVERLAY:
            calTopPx = 0;
            calLeftPx = 0;
            calBotPx = calTopPx + neuro.cal.rows * neuro.cal.rowHeight;
            calRightPx = calLeftPx + ((neuro.cal.groupList.length * neuro.cal.colsPerGroup * neuro.cal.colWidth) - 1); // $('#' + neuro.cal.bodyID).outerWidth();
            break;

            // Stacked calendars have rows of flexible heights. We have to look and                                                                                                                                                                                                      
            // see where the bottom of the calendar is at the moment.                                                                                                                                                                                                                 

        case neuro.cal.CALTYPE_STACKED:
            topRow = $('#' + neuro.cal.slotID(0));
            botRow = $('#' + neuro.cal.slotID(neuro.cal.rows - 1));
            calTopPx = 0;
            calLeftPx = 0;
            calBotPx = (botRow.offset().top + botRow.outerHeight()) - topRow.offset().top;
            calRightPx = calLeftPx + ((neuro.cal.groupList.length * neuro.cal.colsPerGroup * neuro.cal.colWidth) - 1); // $('#' + neuro.cal.bodyID).outerWidth();
            break;

        default:
            throw new Error('neuro.cal.inbounds: Unknown calendar type!');
    }

    if (left >= calLeftPx && left <= calRightPx && top >= calTopPx && top <= calBotPx) {
        result = true;
    }

    return result;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a visit to a slot number on the calendar.
//
// For overlay calendars, the mapping is based on the visit's date/time.
// For stacked calendars, the mapping is on the left column's clients or staff.

neuro.cal.mapVisitToSlot = function (v) {

    return neuro.cal.mapVisitToSlotByParms(v.clientID, v.staffID, v.begDateTime, v.groupNum);
};

neuro.cal.mapVisitToSlotByParms = function (clientID, staffID, begDateTime, groupNum) {

    var m, d, y;
    var days;
    var dt, vDate, vTime;
    var row, col;
    var slot = -1;

    // Extract the date and time.

    dt = new Date(begDateTime);
    m = dt.getMonth(); // Should we use the UTC versions?
    d = dt.getDate();
    y = dt.getFullYear();
    vDate = neuro.cal.dateTrunc(dt); // new Date(y, m, d);
    vTime = new Date(dt.getTime() - vDate.getTime());

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            days = neuro.cal.dateDaysBetween(vDate, neuro.cal.begDate);
            row = (vTime.getTime() - neuro.cal.begTime.getTime()) / neuro.cal.msPerSlot;
            col = days + groupNum * neuro.cal.colsPerGroup;
            slot = row + col * neuro.cal.rows;
            break;

        case neuro.cal.CALTYPE_STACKED:
            days = neuro.cal.dateDaysBetween(vDate, neuro.cal.begDate);
            row = neuro.cal.mapVisitToRowByParms(clientID, staffID);
            col = days;
            if (row >= 0) {
                slot = row + col * neuro.cal.rows;
            }
            break;

        default:
            throw new Error('neuro.cal.mapVisitToSlot: Unknown calendar type!');
    }

    return slot;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot to a date/time.

neuro.cal.mapSlotToDateTime = function (slot) {

    var slotRowCol;
    var colWithinGroup;
    var dateTime;
    var newDate, newDateTime;

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:

            // There are multiple time slots in each column.
            //
            // Programmer's note: We can't just use a simple offset from the calendar's beginning 
            // date/time to the slot # for the new date/time. For example, if the dreaded daylight
            // savings time (DST) switchover happens in the middle of the calendar's week, you may
            // get results that are off by one hour.
            //
            // Instead, we map the slot # to a row/column. Using the column's date as the base, we
            // add the minutes corresponding to the row.

            slotRowCol = neuro.cal.mapSlotToRowCol(slot);
            colWithinGroup = slotRowCol.col % neuro.cal.colsPerGroup;
            newDate = neuro.cal.begDate.addDays(colWithinGroup);
            newDateTime = new Date(newDate.getTime() + neuro.cal.begTime.getTime() + slotRowCol.row * neuro.cal.slotMinutes * neuro.cal.MS_PER_MINUTE);
            dateTime = newDateTime;
            break;

        case neuro.cal.CALTYPE_STACKED:
        default:
            // Each column represents an entire day
            throw new Error("neuro.cal.mapSlotToDateTime: Inappropriate for stacked calendars!");
    }

    return dateTime;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot to a group number.

neuro.cal.mapSlotToGroupNum = function (slot) {

    var groupNum;

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            // Groups are in columns along the top
            groupNum = Math.floor(slot / (neuro.cal.rows * neuro.cal.colsPerGroup));
            break;

        case neuro.cal.CALTYPE_STACKED:
            // Groups are in rows
            groupNum = Math.floor(slot / (neuro.cal.rows * neuro.cal.colsPerGroup));
            break;
    }

    return groupNum;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Get a staff from the list.
//
// We really shouldn't need this function. However, Mac/Safari has a problem dealing with the "-1"
// staff ID used for unassigned staff. It appears to be due to converting -1 to an unsigned integer
// (4294967295, or FFFFFFFF), and other numeric IDs to strings.
//
// This seems to be an issue with Safari 5.1.1 on Mac only. Other browsers work fine.
//
// Soln: Only compare the given ID with Staff.ID, and do *not* compare it to the property in the 
// for-loop (thisID). Otherwise, you'll find that thisID has an unsigned value of 4294967295 and
// not -1, so the comparison would fail.
//
// More info: Looking at the JavaScript specification, array indices should always be non-negative
// integers. I assume what's happening is that Apple is following a stricter implementation than
// other browsers. The fix below should be adequate, although the staffList array should probably
// updated to reference by a string property name rather than an integer index ("123" vs 123).

neuro.cal.getStaff = function (ID) {

    //var thisID;
    var staff = null;
    var i;

    //for (thisID in neuro.cal.staffList) {
    for (i = 0; i < neuro.cal.staffList.length; i++) {

        //staff = neuro.cal.staffList[thisID];

        if (neuro.cal.staffList[i].ID == ID) {

            staff = neuro.cal.staffList[i];
            break;
        }
    }

    return staff;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot to a staff ID.

neuro.cal.mapSlotToStaffID = function (slot) {

    var g, groupNum;
    var s, rowNum, slotRow, i; //, thisID;
    var staffID = neuro.cal.STAFF_BAD_ID;

    switch (neuro.cal.calType) {

        case neuro.cal.CALTYPE_OVERLAY:

            if (neuro.cal.viewWho === neuro.cal.VIEWWHO_STAFF) {

                // Staff are in groups of columns along the top
                groupNum = Math.floor(slot / (neuro.cal.rows * neuro.cal.colsPerGroup));
                g = neuro.cal.groupList[groupNum];
                staffID = g.staffID;
            }
            break;

        case neuro.cal.CALTYPE_STACKED:

            if (neuro.cal.viewWho === neuro.cal.VIEWWHO_STAFF) {

                // Staff are in rows along the left side.
                slotRow = slot % neuro.cal.rows;

                // Find the n-th staff in the staffList, which gives us the display row.
                //for (thisID in neuro.cal.staffList) {
                for (i = 0; i < neuro.cal.staffList.length; i++) {

                    //s = neuro.cal.staffList[thisID];
                    s = neuro.cal.staffList[i];
                    rowNum = s.displayRow;

                    if (rowNum == slotRow) {

                        staffID = s.ID;
                        break;
                    }
                }
            }

            //if (rowNum < 0) { // This can't work, dummy. Fixed 2014-12-21
            if (i == neuro.cal.staffList.length) {

                throw new Error("neuro.cal.mapSlotToStaffID: Slot #" + slot.toString() + " is not in staffList!");
            }

            break;
    }

    if (staffID === neuro.cal.STAFF_BAD_ID) {

        throw new Error("neuro.cal.mapSlotToStaffID: Slot #" + slot.toString() + " could not be mapped!");
    }

    return staffID;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot to a client ID.

neuro.cal.mapSlotToClientID = function (slot) {

    var g, groupNum;
    var s, rowNum, slotRow, thisID;
    var clientID = neuro.cal.CLIENT_BAD_ID;

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            if (neuro.cal.viewWho === neuro.cal.VIEWWHO_CLIENT) {
                // Clients are in groups of columns along the top
                groupNum = Math.floor(slot / (neuro.cal.rows * neuro.cal.colsPerGroup));
                g = neuro.cal.groupList[groupNum];
                clientID = g.staffID;
            }
            break;

        case neuro.cal.CALTYPE_STACKED:
            if (neuro.cal.viewWho === neuro.cal.VIEWWHO_CLIENT) {
                // Clients are in rows along the left side.
                slotRow = slot % neuro.cal.rows;

                // Find the n-th client in the clientList, which gives us the display row.
                for (thisID in neuro.cal.clientList) {
                    s = neuro.cal.clientList[thisID];
                    rowNum = s.displayRow;
                    if (rowNum == slotRow) {
                        clientID = s.ID;
                        break;
                    }
                }
            }
            if (rowNum < 0) {
                throw new Error("neuro.cal.mapSlotToClientID: Slot #" + slot.toString() + " is not in clientList!");
            }
            break;
    }
    if (clientID === neuro.cal.CLIENT_BAD_ID) {
        throw new Error("neuro.cal.mapSlotToClientID: Slot #" + slot.toString() + " could not be mapped!");
    }

    return clientID;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a visit to a row (0-n). Returns -1 upon failure.

neuro.cal.mapVisitToRow = function (v) {

    return neuro.cal.mapVisitToRowByParms(v.clientID, v.staffID);
};

neuro.cal.mapVisitToRowByParms = function (clientID, staffID) {

    var s;
    var thisID, rowNum = -1;
    var i;

    if (neuro.cal.rowsRepresentClients) {

        // Find the n-th client in the clientList, which corresponds to the n-th row.
        for (thisID in neuro.cal.clientList) {

            if (thisID == clientID) {

                rowNum = neuro.cal.clientList[thisID].displayRow;
                break;
            }
        }
    }

    else if (neuro.cal.rowsRepresentStaff) {

        // Find the n-th staff in the staffList, which corresponds to the n-th row.

        //for (thisID in neuro.cal.staffList) {
        for (i = 0; i < neuro.cal.staffList.length; i++) {

            // Below doesn't work for negative staff IDs (the "unassigned" staff). This is
            // because Apple/Safari is following a stricter JavaScript implementation, and
            // that doesn't allow arrays to be indexed by negative numbers.

            //if (thisID == staffID) {
            //    rowNum = neuro.cal.staffList[thisID].displayRow;
            //    break;
            //}

            //s = neuro.cal.staffList[thisID];
            s = neuro.cal.staffList[i];

            if (s.ID == staffID) {

                rowNum = s.displayRow;
                break;
            }
        }
    }

    return rowNum;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a visit element's coordinates to a slot number.
// The coordinate parameters are given relative to the calendar body, starting at slot #0.

neuro.cal.mapCoordToSlot = function (top, left) {

    var topRounded, leftRounded;
    var row, col, slot;
    var rowTop, rowHeight;
    var parentOffset;

    // Here is some earned wisdom: The parameters to this method often come from jQuery's postion()
    // function. The position of an element can be a real number (non-integer), like 99.999. In this
    // function, we'll round up to get the coordinates that will work more conveniently.

    topRounded = Math.ceil(top);
    leftRounded = Math.ceil(left);

    switch (neuro.cal.calType) {
        case neuro.cal.CALTYPE_OVERLAY:
            // Fixed-height rows
            row = Math.floor(topRounded / neuro.cal.rowHeight);
            col = Math.floor(leftRounded / neuro.cal.colWidth);
            break;

        case neuro.cal.CALTYPE_STACKED:
            // Variable-height rows
            parentOffset = $('#' + neuro.cal.bodyID).offset();
            for (row = 0; row < neuro.cal.rows; row++) {

                rowTop = $('#' + neuro.cal.slotID(row)).offset().top - parentOffset.top;
                rowHeight = $('#' + neuro.cal.slotID(row)).outerHeight();

                if (topRounded < (rowTop + rowHeight)) {
                    col = Math.floor(leftRounded / neuro.cal.colWidth);
                    break;
                }
            }
            break;
    }

    slot = col * neuro.cal.rows + row;

    return slot;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot number to the top-side row and left-side column coordinates, in pixels.
//
// TODO: Change this function to return a position() object, instead of coords.

neuro.cal.mapSlotToCoord = function (slot) {

    var slotPos;
    var coords = new Object();

    // Map row and column to the pixel offset from the calendar body.

    switch (neuro.cal.calType) {

        // Overlay calendars are mapped from the calendar body.                                                                                                                                                                                                                                       

        case neuro.cal.CALTYPE_OVERLAY:
            slotPos = neuro.cal.mapSlotToRowCol(slot);
            coords.rowPx = slotPos.row * neuro.cal.rowHeight;
            coords.colPx = slotPos.col * neuro.cal.colWidth;
            break;

            // Stacked calendars are mapped from the slot where they live.                                                                                                                                                                                                                                    
            // This method assumes an element exists for each slot.                                                                                                                                                                                                                                     

        case neuro.cal.CALTYPE_STACKED:
            throw new Error('neuro.cal.mapSlotToCoord: Not defined for stacked calendars!');

        default:
            throw new Error('neuro.cal.mapSlotToCoord: Unknown calendar type!');
    }

    return coords;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot number to the row and column. (Each row is one slot high, and each column is one
// slot wide.)

neuro.cal.mapSlotToRowCol = function (slot) {

    var slotRowCol = new Object();

    slotRowCol.row = slot % neuro.cal.rows;
    slotRowCol.col = Math.floor(slot / neuro.cal.rows);

    return slotRowCol;
};

neuro.cal.mapRowColToSlot = function (row, col) {

    var slot;

    slot = neuro.cal.rows * col + row;

    return slot;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a visit to a groupNum.

neuro.cal.mapVisitToGroupNum = function (v) {

    var groupNum = 0;
    var id;

    if (neuro.cal.groupsRepresentStaff) {
        id = v.staffID;
    }
    else if (neuro.cal.groupsRepresentClients) {
        id = v.clientID;
    }

    groupNum = neuro.cal.mapStaffOrClientIDToGroupNum(id);

    return groupNum;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a staff or client ID to a groupNum.

neuro.cal.mapStaffOrClientIDToGroupNum = function (id) {

    var groupNum = 0;
    var group, i;

    // Overlay calendars can have multiple groups, each corresponding to a staff. 

    for (i = 0; i < neuro.cal.groupList.length; i++) {
        group = neuro.cal.groupList[i];
        if (group.staffID == id) {
            groupNum = i;
            break;
        }
    }

    return groupNum;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return a formatted time string.

neuro.cal.visitTimeStr = function (v) {

    return neuro.cal.timeStr(v.begDateTime);
};

neuro.cal.timeStr = function (dt) {

    var h, m, ampm, myTimeString;
    var useAmPm = true; // AM/PM format vs. 24-hour format

    switch (adacare.lib.countryAbbr) {
        case adacare.lib.COUNTRY_ABBR_AU: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_CA: useAmPm = true; break;
        case adacare.lib.COUNTRY_ABBR_GB: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_GI: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_MT: useAmPm = false; break;
        case adacare.lib.COUNTRY_ABBR_US: useAmPm = true; break;
        default: useAmPm = true; break; // Default is same as US
    }

    h = dt.getHours();
    m = dt.getMinutes();

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

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return a formatted visit minutes string.

neuro.cal.visitMinutesStr = function (v) {

    var lenMins;
    var result;

    result = '';
    lenMins = v.baseMinutes() + v.extraMinutes;
    if (lenMins > 0) { result += lenMins.toString() + 'm'; }

    return result;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return the date with the time portion truncated (i.e., the date as of midnight).

neuro.cal.dateTrunc = function (dt) {

    var m, d, y;
    var result;

    m = dt.getMonth(); // Should we use the UTC versions?
    d = dt.getDate();
    y = dt.getFullYear();
    result = new Date(y, m, d);

    return result;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return the whole days between two dates, d1 - d2.

neuro.cal.dateDaysBetween = function (d1, d2) {

    var ms1, ms2, days;

    // Get the number of milliseconds for each date, and adjust for the time zone. Ths is very
    // important, since one date may be in daylight savings time and the other may not.

    ms1 = d1.getTime() - d1.getTimezoneOffset() * neuro.cal.MS_PER_MINUTE;
    ms2 = d2.getTime() - d2.getTimezoneOffset() * neuro.cal.MS_PER_MINUTE;
    days = (ms1 - ms2) / neuro.cal.MS_PER_DAY;

    return days;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Format a number of minutes. Commonly used in DropDownLists and such.

neuro.cal.formatMinutes = function (m) {

    var hPart, mPart;
    var hStr, mStr;
    var result;

    hPart = Math.floor(m / 60);
    mPart = Math.abs(m % 60);

    hStr = adacare.lib.numPadWithZeros(hPart, 1);
    mStr = adacare.lib.numPadWithZeros(mPart, 2);

    result = hStr + ':' + mStr + 'm';

    return result;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Get the number of minutes for the given VisitType ID.

neuro.cal.getVisitTypeMinutes = function (ID) {

    var visitType;

    visitType = neuro.cal.visitTypeList[ID];

    return (visitType ? visitType.minutesLength : 0); // Guard against bad VisitType
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Get the number of minutes for the given VisitType ID, in a text format.

neuro.cal.getVisitTypeMinutesFormatted = function (ID) {

    var m, mFormatted;

    m = neuro.cal.getVisitTypeMinutes(ID);
    mFormatted = '(' + neuro.cal.formatMinutes(m) + ')';

    return mFormatted;
};

// Shared function for web service visit failures.

neuro.cal.sharedVisitJoinWSFailed = function (error, context) {

    //    var msg;

    //    msg = context + ': Failed to update the visit information! ' + error.get_message() +
    //    '\n' + 'Status Code: ' + error.get_statusCode() + ', Timeout: ' + error.get_timedOut() +
    //    '\n' + 'Stack Trace: ' + error.get_stackTrace();
    //    alert(msg);

    neuro.cal.WSFailedGenericMessage(error, context, 'Failed to update the visit information!');
};
