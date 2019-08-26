// Copyright 2014 by Neurosoftware, LLC.
//
// adacare.clockInOutActivityLogDetailPopup.v3.3.js
// Sandy Gettings
//
// This is a library that pops up details for an ClockInOutActivityLog record with JavaScript.
//
// Revisions:
// 07/07/2014 SG: Minor improvements.
// 07/14/2014 SG: Minor improvements for "Please wait..."
// 07/17/2014 SG: Minor changes to match database column renaming.
// 2018-05-31 SG: Converted to new MapQuest API.
// 2018-06-20 SG: Added support for ActivityLogDetails records.
// 2018-06-27 SG: Minor change to hide the date/time column.
// 2019-04-22 SG: Added support for digital signatures.
// 2019-04-30 SG: Minor bug fix.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.clockInOutActivityLogDetailPopup) { adacare.clockInOutActivityLogDetailPopup = {}; }
else { throw new Error('adacare.clockInOutActivityLogDetailPopup is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////

adacare.clockInOutActivityLogDetailPopup = {

    // Define CSS to highlight the list of problems (or not).

    CSS_HAS_PROBLEMS: 'general_cautionmsg_box',
    CSS_HAS_NO_PROBLEMS: 'general_infomsg_box',

    // Define constants for the ClockInOutActivityLog.

    CLOCKINOUT_METHOD_UNKNOWN: 'U',
    CLOCKINOUT_METHOD_GPS: 'G',
    CLOCKINOUT_METHOD_TEL: 'T',

    CLOCKINOUT_ACTION_NONE: 0,
    CLOCKINOUT_ACTION_ARRIVE: 1,
    CLOCKINOUT_ACTION_DEPART: 2,
    CLOCKINOUT_ACTION_SHIFT_CHECK: 3,

    // CSS styles, must be the same names as defined in the CSS file.

    CSS_CLASS_DETAILS_HEADER_ROW: 'activityDetailsHeader',
    CSS_CLASS_DETAILS_INDEX: 'activityDetailsIndex',
    CSS_CLASS_DETAILS_DATETIME: 'activityDetailsDateTime',
    CSS_CLASS_DETAILS_STATE: 'activityDetailsState',
    CSS_CLASS_DETAILS_ACTION: 'activityDetailsAction',
    CSS_CLASS_DETAILS_RESPONSE: 'activityDetailsResponse',
    CSS_CLASS_DETAILS_MESSAGE: 'activityDetailsMessage',

    CSS_CLASS_JQUERY_WIDGET_CONTENT: 'ui-widget-content',
    CSS_CLASS_JQUERY_ACCORDION_CONTENT: 'ui-accordion-content',

    surroundDivID: null,
    arrivalDepartureDisplayInfo: null,
    showHostDetails: false,

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init by saving info about the popup's surrounding DIV.

    init: function (surroundDivID, timecardSurroundDivID, timecardInfoDivID) {
        'use strict';

        this.surroundDivID = surroundDivID;
        this.timecardSurroundDivID = timecardSurroundDivID;
        this.timecardInfoDivID = timecardInfoDivID;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Define the constructor for the display info.

    DisplayInfo: function (
        idHeading,
        idCallDateTimeLocal,
        idMethodHeading,
        idMethodDescrip,
        idLocationInfoHeading,
        idLocationInfo,
        idInfoSurround,
        idInfoForAll,
        idInfoExtraForAll,
        idInfoDetailsAccordion, idInfoDetailsSurround,
        idInfoSignatureSurround,
        idInfoSignatureClientReasonDescrip,
        idInfoSignatureStaffReasonDescrip,
        idInfoSignatureClientSigImg,
        idInfoSignatureStaffSigImg,
        idMapSurround,
        idShowMapButt,
        idMap) {
        'use strict';

        this.$elemHeading = $('#' + idHeading);
        this.$elemCallDateTimeLocal = $('#' + idCallDateTimeLocal);
        this.$elemMethodHeading = $('#' + idMethodHeading);
        this.$elemMethodDescrip = $('#' + idMethodDescrip);
        this.$elemLocationInfoHeading = $('#' + idLocationInfoHeading);
        this.$elemLocationInfo = $('#' + idLocationInfo);
        this.$elemInfoSurround = $('#' + idInfoSurround);
        this.$elemInfoForAll = $('#' + idInfoForAll);
        this.$elemInfoExtraForAll = $('#' + idInfoExtraForAll);
        this.$elemInfoDetailsAccordion = $('#' + idInfoDetailsAccordion);
        this.$elemInfoDetailsSurround = $('#' + idInfoDetailsSurround);
        this.$elemInfoSignatureSurround = $('#' + idInfoSignatureSurround);
        this.$elemInfoSignatureClientReasonDescrip = $('#' + idInfoSignatureClientReasonDescrip);
        this.$elemInfoSignatureStaffReasonDescrip = $('#' + idInfoSignatureStaffReasonDescrip);
        this.$elemInfoSignatureClientSigImg = $('#' + idInfoSignatureClientSigImg);
        this.$elemInfoSignatureStaffSigImg = $('#' + idInfoSignatureStaffSigImg);
        this.$elemMapSurround = $('#' + idMapSurround);
        this.$elemShowMapButt = $('#' + idShowMapButt);
        this.$elemMap = $('#' + idMap);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // The display text class contains the various text fields to display, which may come from different
    // sources. For example, you can have display text that originated from a ClockInOutActivitylog
    // record or from a ClockInOutTimeCard.

    DisplayText: function (clockInOutActivityLogForWS, heading, method, methodHeading, methodDescrip, callDateTimeLocalToString, locationInfoHeading, locationInfo, infoForAll, infoExtraForAll, hasProblems) {
        'use strict';

        this.ClockInOutActivityLogForWS = clockInOutActivityLogForWS;
        this.Heading = heading;
        this.Method = method;
        this.MethodHeading = methodHeading;
        this.MethodDescrip = methodDescrip;
        this.CallDateTimeLocalToString = callDateTimeLocalToString;
        this.LocationInfoHeading = locationInfoHeading;
        this.LocationInfo = locationInfo;
        this.InfoForAll = infoForAll;
        this.InfoExtraForAll = infoExtraForAll;
        this.HasProblems = hasProblems;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Construct a DisplayText object from a ClockInOutActivityLog record. These records
    // always contain all the info we need.

    constructDisplayTextFromClockInOutActivityLog: function (clockInOutActivityLogForWS) {
        'use strict';

        var methodHeading = '';
        var displayText;

        switch (clockInOutActivityLogForWS.Action) {

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_ARRIVE:
                methodHeading = 'Clocked in by';
                break;

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_DEPART:
                methodHeading = 'Clocked out by';
                break;

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_SHIFT_CHECK:
                methodHeading = 'Shift check by';
                break;
        }

        displayText = new this.DisplayText(
            clockInOutActivityLogForWS,
            clockInOutActivityLogForWS.ActionToString,
            clockInOutActivityLogForWS.Method,
            methodHeading,
            clockInOutActivityLogForWS.MethodDescrip,
            clockInOutActivityLogForWS.CallDateTimeLocalToString,
            clockInOutActivityLogForWS.LocationInfoHeading,
            clockInOutActivityLogForWS.LocationInfo,
            clockInOutActivityLogForWS.InfoForAll,
            clockInOutActivityLogForWS.InfoExtraForAll,
            clockInOutActivityLogForWS.HasProblems);

        return displayText;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Construct a DisplayText object from a ClockInOutTimeCard record. This method is only
    // used as a fallback when a child ClockInOutActivityLog is not available.

    constructDisplayTextFromClockInOutTimeCard: function (clockInOutTimeCardForWS, action) {
        'use strict';

        var methodHeading = '', actionToString, problemStr, dateTimeLocalString;
        var displayText;

        switch (action) {

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_ARRIVE:
                actionToString = 'Arrival';
                methodHeading = '(Did not clock in)';
                problemStr = 'Did not clock in.';
                dateTimeLocalString = clockInOutTimeCardForWS.EvvArrivalDateTimeLocalString;
                break;

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_DEPART:
                actionToString = 'Departure';
                methodHeading = '(Did not clock out)';
                problemStr = 'Did not clock out.';
                dateTimeLocalString = clockInOutTimeCardForWS.EvvDepartureDateTimeLocalString;
                break;

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_SHIFT_CHECK:
                actionToString = 'Shift Check';
                methodHeading = '(Did not shift check)';
                problemStr = 'Did not shift check.';
                dateTimeLocalString = '';
                break;

            default:
                actionToString = '---';
                methodHeading = '(none)';
                problemStr = '';
                dateTimeLocalString = '';
                break;
        }

        displayText = new this.DisplayText(
            null,
            actionToString,
            this.CLOCKINOUT_METHOD_UNKNOWN,
            methodHeading,
            '',
            dateTimeLocalString,
            '',
            '',
            clockInOutTimeCardForWS.RecordActionDescrip,
            problemStr,
            clockInOutTimeCardForWS.HasProblems);

        return displayText;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the info for a ClockInOutTimeCard record. Note that the Activity Log records are displayed 
    // elsewhere.
    //
    // In this function, we're just displaying the info that's unique to the time card, such as the
    // problem list.

    displayClockInOutTimeCard: function (clockInOutTimeCardForWS) {
        'use strict';

        var $elemTimecardSurround, $elemTimecardInfo;

        $elemTimecardSurround = $('#' + this.timecardSurroundDivID);
        $elemTimecardInfo = $('#' + this.timecardInfoDivID);
        $elemTimecardInfo.empty();

        if (clockInOutTimeCardForWS.ProblemListToString.length > 0) {

            // Highlight problems (or not).

            if (clockInOutTimeCardForWS.HasProblems) {

                $elemTimecardSurround
                    .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                    .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS);
            }
            else {

                $elemTimecardSurround
                    .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                    .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS);
            }

            $elemTimecardInfo.text(clockInOutTimeCardForWS.ProblemListToString);
            $elemTimecardSurround.show();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Erase all fields in the popup.

    clearFields: function (displayInfo) {
        'use strict';

        displayInfo.$elemHeading.text('');
        displayInfo.$elemCallDateTimeLocal.text('');
        displayInfo.$elemMethodHeading.text('Please wait...');
        displayInfo.$elemMethodDescrip.text('');
        displayInfo.$elemLocationInfoHeading.text('');
        displayInfo.$elemLocationInfo.text('');
        displayInfo.$elemInfoForAll.text('');
        displayInfo.$elemInfoExtraForAll.text('');
        displayInfo.$elemInfoDetailsSurround.empty();
        // sig stuff goes here
        displayInfo.$elemMap.hide();

        displayInfo.$elemInfoSurround
            .hide()
            .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
            .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS);
    },

    clearFieldsForTimeCard: function () {
        'use strict';

        var $elemTimecardSurround, $elemTimecardInfo;

        $elemTimecardSurround = $('#' + this.timecardSurroundDivID);
        $elemTimecardInfo = $('#' + this.timecardInfoDivID);
        $elemTimecardSurround.hide();
        $elemTimecardInfo.empty();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the given record.

    displayFields: function (displayInfo, displayText) {
        'use strict';

        var clockInOutActivityLogForWS;

        clockInOutActivityLogForWS = displayText.ClockInOutActivityLogForWS;

        displayInfo.$elemHeading.text(displayText.Heading);
        displayInfo.$elemMethodHeading.text(displayText.MethodHeading);
        displayInfo.$elemMethodDescrip.text(displayText.MethodDescrip);
        displayInfo.$elemCallDateTimeLocal.text(displayText.CallDateTimeLocalToString);
        displayInfo.$elemLocationInfoHeading.text(displayText.LocationInfoHeading);
        displayInfo.$elemLocationInfo.text(displayText.LocationInfo);
        displayInfo.$elemInfoForAll.text(displayText.InfoForAll);
        displayInfo.$elemInfoExtraForAll.text(displayText.InfoExtraForAll);

        // Highlight problems (or not).

        if (displayText.HasProblems) {

            displayInfo.$elemInfoSurround
                .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                .show();
        }
        else {

            displayInfo.$elemInfoSurround
                .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                .show();
        }

        // Display the signatures

        if (clockInOutActivityLogForWS && (clockInOutActivityLogForWS.ClientSignaturesRequiredByOffice || clockInOutActivityLogForWS.StaffSignaturesRequiredByOffice)) {

            displayInfo.$elemInfoSignatureSurround.show();
            displayInfo.$elemInfoSignatureClientReasonDescrip.text(clockInOutActivityLogForWS.ClientEvvSignatureReasonDescrip);
            displayInfo.$elemInfoSignatureStaffReasonDescrip.text(clockInOutActivityLogForWS.StaffEvvSignatureReasonDescrip);

            // Display the signature image if given, or hide it if not.

            if (clockInOutActivityLogForWS.ClientEvvSignatureImgDataUri.length > 0) {

                displayInfo.$elemInfoSignatureClientSigImg.show();
                displayInfo.$elemInfoSignatureClientSigImg.attr('src', clockInOutActivityLogForWS.ClientEvvSignatureImgDataUri);
            }
            else {

                displayInfo.$elemInfoSignatureClientSigImg.hide();
            }

            if (clockInOutActivityLogForWS.StaffEvvSignatureImgDataUri.length > 0) {

                displayInfo.$elemInfoSignatureStaffSigImg.show();
                displayInfo.$elemInfoSignatureStaffSigImg.attr('src', clockInOutActivityLogForWS.StaffEvvSignatureImgDataUri);
            }
            else {

                displayInfo.$elemInfoSignatureStaffSigImg.hide();
            }

            displayInfo.$elemInfoSignatureStaffSigImg.attr('src', clockInOutActivityLogForWS.StaffEvvSignatureImgDataUri);
        }
        else {

            displayInfo.$elemInfoSignatureSurround.hide();
        }

        // Show the map DIV if the method is GPS.

        if (displayText.Method === this.CLOCKINOUT_METHOD_GPS) {

            displayInfo.$elemMapSurround.show();
            displayInfo.$elemShowMapButt.show();
            displayInfo.$elemShowMapButt.off('click').click(function () { adacare.clockInOutActivityLogDetailPopup.displayMap(displayInfo, displayText.ClockInOutActivityLogForWS); });
        }
        else {

            displayInfo.$elemMapSurround.hide();
            displayInfo.$elemShowMapButt.off('click');
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the activity log details records. This is a list of any number of detail records, children
    // of the single activity log record.

    displayDetails: function (displayInfo, /*displayText,*/ clockInOutActivityLogForWS) {
        'use strict';

        var STEP_TEMPLATE_TOP_PREFIX = '<p>The step-by-step details are shown below:</p>';
        var STEP_TEMPLATE_TOP = '<table>';
        var STEP_TEMPLATE_HEAD = '<tr class="{0}"><th class="{1}">&nbsp;</th><th class="{2}">When</th><th class="{3}">State</th><th class="{4}">Action</th><th class="{5}">Keys Pressed</th><th class="{6}">&nbsp;</th></tr>';
        var STEP_TEMPLATE_ROW = '<tr><td class="{0}">{1}.</td><td class="{2}">{3}</td><td class="{4}">{5}</td><td class="{6}">{7}</td><td class="{8}">{9}</td><td class="{10}">{11}</td></tr>';
        var STEP_TEMPLATE_BOT = '</table>';

        //var SIG_TEMPLATE_TOP = '<table style="margin-top: 1em;">';
        //var SIG_TEMPLATE_ROW1 = '<tr><td style="width: 50%;">Client Signature</td><td style="width: 50%;">Staff Signature</td></tr>';
        //var SIG_TEMPLATE_ROW2 = '<tr><td>{0}</td><td>{1}</td></tr>';
        //var SIG_TEMPLATE_ROW3 = '<tr><td>{0}</td><td>{1}</td></tr>';
        //var SIG_TEMPLATE_BOT = '</table>';

        var clockInOutActivityLogDetailForWSList;
        var showHostDetails;
        var displayHtml = '';
        var i;

        if (clockInOutActivityLogForWS && clockInOutActivityLogForWS.ClockInOutActivityLogDetailForWSList) {

            clockInOutActivityLogDetailForWSList = clockInOutActivityLogForWS.ClockInOutActivityLogDetailForWSList;
            showHostDetails = adacare.clockInOutActivityLogDetailPopup.showHostDetails;

            if (clockInOutActivityLogDetailForWSList.length > 0) {

                displayInfo.$elemInfoDetailsAccordion.show();
                adacare.lib.initAccordion(displayInfo.$elemInfoDetailsAccordion[0].id, false);
                displayInfo.$elemInfoDetailsSurround.removeClass(this.CSS_CLASS_JQUERY_WIDGET_CONTENT); // Prevents jQuery UI from overriding our background color. Not important, just prettier.
                displayInfo.$elemInfoDetailsSurround.removeClass(this.CSS_CLASS_JQUERY_ACCORDION_CONTENT); // Prevents jQuery accordion widget from using fat margins. Not important, just prettier.

                displayHtml = STEP_TEMPLATE_TOP_PREFIX;
                displayHtml += STEP_TEMPLATE_TOP;
                displayHtml += STEP_TEMPLATE_HEAD
                    .replace('{0}', this.CSS_CLASS_DETAILS_HEADER_ROW)
                    .replace('{1}', this.CSS_CLASS_DETAILS_INDEX)
                    .replace('{2}', this.CSS_CLASS_DETAILS_DATETIME + (!showHostDetails ? ' ' + adacare.lib.CSS_HIDDEN : ''))
                    .replace('{3}', this.CSS_CLASS_DETAILS_STATE + (!showHostDetails ? ' ' + adacare.lib.CSS_HIDDEN : ''))
                    .replace('{4}', this.CSS_CLASS_DETAILS_ACTION)
                    .replace('{5}', this.CSS_CLASS_DETAILS_RESPONSE)
                    .replace('{6}', this.CSS_CLASS_DETAILS_MESSAGE);

                for (i = 0; i < clockInOutActivityLogDetailForWSList.length; i++) {

                    displayHtml += STEP_TEMPLATE_ROW
                        .replace('{0}', this.CSS_CLASS_DETAILS_INDEX)
                        .replace('{1}', (i + 1))
                        .replace('{2}', this.CSS_CLASS_DETAILS_DATETIME + (!showHostDetails ? ' ' + adacare.lib.CSS_HIDDEN : ''))
                        .replace('{3}', clockInOutActivityLogDetailForWSList[i].ActivityTimeToStringLocalized)
                        .replace('{4}', this.CSS_CLASS_DETAILS_STATE + (!showHostDetails ? ' ' + adacare.lib.CSS_HIDDEN : ''))
                        .replace('{5}', clockInOutActivityLogDetailForWSList[i].State)
                        .replace('{6}', this.CSS_CLASS_DETAILS_ACTION)
                        .replace('{7}', clockInOutActivityLogDetailForWSList[i].ActionDescription)
                        .replace('{8}', this.CSS_CLASS_DETAILS_RESPONSE)
                        .replace('{9}', clockInOutActivityLogDetailForWSList[i].FormattedResponseFromCaller)
                        .replace('{10}', this.CSS_CLASS_DETAILS_MESSAGE)
                        .replace('{11}', (clockInOutActivityLogDetailForWSList[i].Message ? clockInOutActivityLogDetailForWSList[i].Message : ''));
                }

                displayHtml += STEP_TEMPLATE_BOT;
                displayInfo.$elemInfoDetailsSurround.append(displayHtml);
            }
            else {

                displayInfo.$elemInfoDetailsAccordion.hide();
            }
        }
        else {
            displayInfo.$elemInfoDetailsAccordion.hide();
        }

    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the given map.

    displayMap: function (displayInfo, clockInOutActivityLogForWS) {
        'use strict';

        var mapDivID, mapInfo;

        mapDivID = displayInfo.$elemMap[0].id;

        displayInfo.$elemMap.show();
        mapInfo = neuro.mapTools.initDesktopMap(mapDivID, null);
        mapInfo.isMobile = true; // Use mobile format. WHY????????
        //neuro.mapTools.clearMap(mapInfo); // TEST to see if repeated map pop-ups work

        neuro.mapTools.displayGpsMap(mapInfo, clockInOutActivityLogForWS.ClientResLat, clockInOutActivityLogForWS.ClientResLng, clockInOutActivityLogForWS.ClientResGeoQuality,
            clockInOutActivityLogForWS.StaffNameInitials,
            clockInOutActivityLogForWS.GpsLat, clockInOutActivityLogForWS.GpsLng, clockInOutActivityLogForWS.GpsAccuracyMeters,
            clockInOutActivityLogForWS.GpsMaxDistanceToClientMeters,
            clockInOutActivityLogForWS.ClientNameLast, clockInOutActivityLogForWS.ClientResAddress);

        displayInfo.$elemShowMapButt.hide();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the record from the server. When the Web Service returns the record, display it in the popup.

    WS_CONTEXT_ACTIVITY_LOG: 'ACTIVITY_LOG',
    WS_CONTEXT_TIMECARD_ARRIVAL: 'TIMECARD_ARRIVAL',
    WS_CONTEXT_TIMECARD_DEPARTURE: 'TIMECARD_DEPARTURE',
    WS_CONTEXT_TIMECARD: 'TIMECARD',

    fetchClockInOutActivityLog: function (id, showHostDetails, context) {
        'use strict';

        adacare.clockInOutActivityLogDetailPopup.showHostDetails = showHostDetails;

        AdaCareWeb.WebServices.ClockInOutServices.FetchClockInOutActivityLogAndDetails(
            id,
            showHostDetails,
            adacare.clockInOutActivityLogDetailPopup.wsSuccess,
            adacare.clockInOutActivityLogDetailPopup.wsFail,
            context);
    },

    fetchClockInOutTimeCardExpanded: function (timeCardID, visitScheduleID, showHostDetails, scheduleDateForServerLocale) {
        'use strict';

        adacare.clockInOutActivityLogDetailPopup.showHostDetails = showHostDetails;

        AdaCareWeb.WebServices.ClockInOutServices.FetchClockInOutTimeCardExpandedAndDetails(
            timeCardID, visitScheduleID,
            showHostDetails, scheduleDateForServerLocale,
            adacare.clockInOutActivityLogDetailPopup.wsSuccess,
            adacare.clockInOutActivityLogDetailPopup.wsFail,
            adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD);
    },

    // Programmer's note: Since this is a callback function, "this" is null. Need
    // to reference adacare.clockInOutActivityLogDetailPopup objects by the full name,
    // like "adacare.clockInOutActivityLogDetailPopup.xxx" rather than "this.xxx".

    wsSuccess: function (returnedValue, context, methodName) {
        'use strict';

        var clockInOutActivityLogForWS = new AdaCareWeb.WebServices.ClockInOutActivityLogForWS();
        var clockInOutTimeCardExpandedForWS = new AdaCareWeb.WebServices.ClockInOutTimeCardExpandedForWS();
        var displayInfo, displayText;

        if (returnedValue !== null) {

            if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_ACTIVITY_LOG) {

                clockInOutActivityLogForWS = returnedValue;
                displayInfo = adacare.clockInOutActivityLogDetailPopup.arrivalDepartureDisplayInfo;
                displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutActivityLogForWS);
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
                adacare.clockInOutActivityLogDetailPopup.displayDetails(displayInfo, /*displayText,*/ clockInOutActivityLogForWS);
            }

            else if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD_ARRIVAL) {

                clockInOutActivityLogForWS = returnedValue;
                displayInfo = adacare.clockInOutActivityLogDetailPopup.arrivalDisplayInfo;
                displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutActivityLogForWS);
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
                adacare.clockInOutActivityLogDetailPopup.displayDetails(displayInfo, /*displayText,*/ clockInOutActivityLogForWS);
            }

            else if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD_DEPARTURE) {

                clockInOutActivityLogForWS = returnedValue;
                displayInfo = adacare.clockInOutActivityLogDetailPopup.departureDisplayInfo;
                displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutActivityLogForWS);
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
                adacare.clockInOutActivityLogDetailPopup.displayDetails(displayInfo, /*displayText,*/ clockInOutActivityLogForWS);
            }

            else if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD) {

                clockInOutTimeCardExpandedForWS = returnedValue;

                // Arrival

                if (clockInOutTimeCardExpandedForWS.ArrivalClockInOutActivityLogForWS !== null) {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutTimeCardExpandedForWS.ArrivalClockInOutActivityLogForWS);
                }
                else {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutTimeCard(clockInOutTimeCardExpandedForWS, adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_ARRIVE);
                }

                displayInfo = adacare.clockInOutActivityLogDetailPopup.arrivalDisplayInfo;
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
                adacare.clockInOutActivityLogDetailPopup.displayDetails(displayInfo, /*displayText,*/ clockInOutTimeCardExpandedForWS.ArrivalClockInOutActivityLogForWS);

                // Departure

                if (clockInOutTimeCardExpandedForWS.DepartureClockInOutActivityLogForWS !== null) {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutTimeCardExpandedForWS.DepartureClockInOutActivityLogForWS);
                }
                else {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutTimeCard(clockInOutTimeCardExpandedForWS, adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_DEPART);
                }

                displayInfo = adacare.clockInOutActivityLogDetailPopup.departureDisplayInfo;
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
                adacare.clockInOutActivityLogDetailPopup.displayDetails(displayInfo, /*displayText,*/ clockInOutTimeCardExpandedForWS.DepartureClockInOutActivityLogForWS);

                adacare.clockInOutActivityLogDetailPopup.displayClockInOutTimeCard(clockInOutTimeCardExpandedForWS);
            }
        }
        else { alert('Web service "adacare.clockInOutActivityLogDetailPopup" failed, no information is available from the AdaCare server.'); }
    },

    wsFail: function (error, context, methodName) {
        'use strict';

        adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
    }
};

