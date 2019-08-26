// Copyright 2014 by Neurosoftware, LLC.
//
// adacare.clockInOutActivityLogDetailPopup.v2.0.js
// Sandy Gettings
//
// This is a library that pops up details for an ClockInOutActivityLog record with JavaScript.
//
// Revisions:
// 07/07/2014 SG: Minor improvements.
// 07/14/2014 SG: Minor improvements for "Please wait..."
// 07/17/2014 SG: Minor changes to match database column renaming.
// 2018-05-31 SG: Converted to new MapQuest API.

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

    surroundDivID: null,
    arrivalDepartureDisplayInfo: null,

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
        idheading,
        idCallDateTimeLocal,
        idMethodHeading,
        idMethodDescrip,
        idLocationInfoHeading,
        idLocationInfo,
        idInfoSurround,
        idInfoForAll,
        idInfoExtraForAll,
        idMapSurround,
        idShowMapButt,
        idMap) {
        'use strict';

        this.$fieldHeading = $('#' + idheading);
        this.$fieldCallDateTimeLocal = $('#' + idCallDateTimeLocal);
        this.$fieldMethodHeading = $('#' + idMethodHeading);
        this.$fieldMethodDescrip = $('#' + idMethodDescrip);
        this.$fieldLocationInfoHeading = $('#' + idLocationInfoHeading);
        this.$fieldLocationInfo = $('#' + idLocationInfo);
        this.$fieldInfoSurround = $('#' + idInfoSurround);
        this.$fieldInfoForAll = $('#' + idInfoForAll);
        this.$fieldInfoExtraForAll = $('#' + idInfoExtraForAll);
        this.$fieldMapSurround = $('#' + idMapSurround);
        this.$fieldShowMapButt = $('#' + idShowMapButt);
        this.$fieldMap = $('#' + idMap);
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

            //default:
            //    methodHeading = '(none)';
            //    break;
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
                dateTimeLocalString = clockInOutTimeCardForWS.ArrivalDateTimeLocalString;
                break;

            case adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_DEPART:
                actionToString = 'Departure';
                methodHeading = '(Did not clock out)';
                problemStr = 'Did not clock out.';
                dateTimeLocalString = clockInOutTimeCardForWS.DepartureDateTimeLocalString;
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
            problemStr, //clockInOutTimeCardForWS.ProblemListToString,
            clockInOutTimeCardForWS.HasProblems);

        return displayText;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the info a Time Card record. Note that the Activity Log records are displayed elsewhere.
    // In this function, we're just displaying the info that's unique to the time card, such as the
    // problem list.

    displayClockInOutTimeCard: function (clockInOutTimeCardForWS) {
        'use strict';

        var $fieldTimecardSurround, $fieldTimecardInfo;

        $fieldTimecardSurround = $('#' + this.timecardSurroundDivID);
        $fieldTimecardInfo = $('#' + this.timecardInfoDivID);
        $fieldTimecardInfo.empty();

        if (clockInOutTimeCardForWS.ProblemListToString.length > 0) {

            // Highlight problems (or not).

            if (clockInOutTimeCardForWS.HasProblems) {

                $fieldTimecardSurround
                    .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                    .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS);
            }
            else {

                $fieldTimecardSurround
                    .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                    .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS);
            }

            $fieldTimecardInfo.text(clockInOutTimeCardForWS.ProblemListToString);
            $fieldTimecardSurround.show();
        }
        //else {

        //    $fieldTimecardSurround.hide();
        //}
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Erase all fields in the popup.

    clearFields: function (displayInfo) {
        'use strict';

        displayInfo.$fieldHeading.text('');
        displayInfo.$fieldCallDateTimeLocal.text('');
        displayInfo.$fieldMethodHeading.text('Please wait...');
        displayInfo.$fieldMethodDescrip.text('');
        displayInfo.$fieldLocationInfoHeading.text('');
        displayInfo.$fieldLocationInfo.text('');
        displayInfo.$fieldInfoForAll.text('');
        displayInfo.$fieldInfoExtraForAll.text('');
        displayInfo.$fieldMap.hide();

        displayInfo.$fieldInfoSurround
            .hide()
            .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
            .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS);
    },

    clearFieldsForTimeCard: function () {
        'use strict';

        var $fieldTimecardSurround, $fieldTimecardInfo;

        $fieldTimecardSurround = $('#' + this.timecardSurroundDivID);
        $fieldTimecardInfo = $('#' + this.timecardInfoDivID);
        $fieldTimecardSurround.hide();
        $fieldTimecardInfo.empty();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the given record.

    displayFields: function (displayInfo, displayText) {
        'use strict';

        displayInfo.$fieldHeading.text(displayText.Heading);
        displayInfo.$fieldMethodHeading.text(displayText.MethodHeading);
        displayInfo.$fieldMethodDescrip.text(displayText.MethodDescrip);
        displayInfo.$fieldCallDateTimeLocal.text(displayText.CallDateTimeLocalToString);
        displayInfo.$fieldLocationInfoHeading.text(displayText.LocationInfoHeading);
        displayInfo.$fieldLocationInfo.text(displayText.LocationInfo);
        displayInfo.$fieldInfoForAll.text(displayText.InfoForAll);
        displayInfo.$fieldInfoExtraForAll.text(displayText.InfoExtraForAll);

        // Highlight problems (or not).

        if (displayText.HasProblems) {

            displayInfo.$fieldInfoSurround
                .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                .show();
        }
        else {

            displayInfo.$fieldInfoSurround
                .removeClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_PROBLEMS)
                .addClass(adacare.clockInOutActivityLogDetailPopup.CSS_HAS_NO_PROBLEMS)
                .show();
        }

        // Show the map DIV if the method is GPS.

        if (displayText.Method === this.CLOCKINOUT_METHOD_GPS) {

            displayInfo.$fieldMapSurround.show();
            displayInfo.$fieldShowMapButt.show();
            displayInfo.$fieldShowMapButt.off('click').click(function () { adacare.clockInOutActivityLogDetailPopup.displayMap(displayInfo, displayText.ClockInOutActivityLogForWS); });
        }
        else {

            displayInfo.$fieldMapSurround.hide();
            displayInfo.$fieldShowMapButt.off('click');
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the given map.

    displayMap: function (displayInfo, clockInOutActivityLogForWS) {
        'use strict';

        var mapDivID, mapInfo;

        mapDivID = displayInfo.$fieldMap[0].id;

        displayInfo.$fieldMap.show();
        mapInfo = neuro.mapTools.initDesktopMap(mapDivID, null);
        mapInfo.isMobile = true; // Use mobile format. WHY????????
        //neuro.mapTools.clearMap(mapInfo); // TEST to see if repeated map pop-ups work

        neuro.mapTools.displayGpsMap(mapInfo, clockInOutActivityLogForWS.ClientResLat, clockInOutActivityLogForWS.ClientResLng, clockInOutActivityLogForWS.ClientResGeoQuality,
            clockInOutActivityLogForWS.StaffNameInitials,
            clockInOutActivityLogForWS.GpsLat, clockInOutActivityLogForWS.GpsLng, clockInOutActivityLogForWS.GpsAccuracyMeters,
            clockInOutActivityLogForWS.GpsMaxDistanceToClientMeters,
            clockInOutActivityLogForWS.ClientNameLast, clockInOutActivityLogForWS.ClientResAddress);

        displayInfo.$fieldShowMapButt.hide();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the record from the server. When the Web Service returns the record, display it in the popup.

    WS_CONTEXT_ACTIVITY_LOG: 'ACTIVITY_LOG',
    WS_CONTEXT_TIMECARD_ARRIVAL: 'TIMECARD_ARRIVAL',
    WS_CONTEXT_TIMECARD_DEPARTURE: 'TIMECARD_DEPARTURE',
    WS_CONTEXT_TIMECARD: 'TIMECARD',

    fetchClockInOutActivityLog: function (id, context) {
        'use strict';

        AdaCareWeb.WebServices.ClockInOutServices.FetchClockInOutActivityLog(
            id,
            adacare.clockInOutActivityLogDetailPopup.wsSuccess,
            adacare.clockInOutActivityLogDetailPopup.wsFail,
            context); //            'adacare.clockInOutActivityLogDetailPopup.fetchClockInOutActivityLog');
    },

    fetchClockInOutTimeCardExpanded: function (timeCardID, visitScheduleID, scheduleDateForServerLocale) {
        'use strict';

        AdaCareWeb.WebServices.ClockInOutServices.FetchClockInOutTimeCardExpanded(
            timeCardID, visitScheduleID, scheduleDateForServerLocale,
            adacare.clockInOutActivityLogDetailPopup.wsSuccess,
            adacare.clockInOutActivityLogDetailPopup.wsFail,
            adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD); //'adacare.clockInOutActivityLogDetailPopup.fetchClockInOutTimeCardExpanded');
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
            }

            else if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD_ARRIVAL) {

                clockInOutActivityLogForWS = returnedValue;
                displayInfo = adacare.clockInOutActivityLogDetailPopup.arrivalDisplayInfo;
                displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutActivityLogForWS);
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
            }

            else if (context === adacare.clockInOutActivityLogDetailPopup.WS_CONTEXT_TIMECARD_DEPARTURE) {

                clockInOutActivityLogForWS = returnedValue;
                displayInfo = adacare.clockInOutActivityLogDetailPopup.departureDisplayInfo;
                displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutActivityLogForWS);
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);
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

                // Departure

                if (clockInOutTimeCardExpandedForWS.DepartureClockInOutActivityLogForWS !== null) {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutActivityLog(clockInOutTimeCardExpandedForWS.DepartureClockInOutActivityLogForWS);
                }
                else {

                    displayText = adacare.clockInOutActivityLogDetailPopup.constructDisplayTextFromClockInOutTimeCard(clockInOutTimeCardExpandedForWS, adacare.clockInOutActivityLogDetailPopup.CLOCKINOUT_ACTION_DEPART);
                }

                displayInfo = adacare.clockInOutActivityLogDetailPopup.departureDisplayInfo;
                adacare.clockInOutActivityLogDetailPopup.displayFields(displayInfo, displayText);

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

