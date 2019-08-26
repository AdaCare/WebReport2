// Copyright 2016 by Neurosoftware, LLC.
//
// adacare.changeLogPopup.v1.2.js         Sandy Gettings             Revised 09/31/2011
//
// This code is used to pop up a display of ChangeLog records when the given button is clicked.
//
// The calling page must provide a button with the ID defined in the code below.
//
// Revisions:
// 2016-04-26 SG New code.
// 2018-06-24 SG: Changes for expanded info in the change log.
// 2018-06-25 SG: Minor formatting changes.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== "object") { throw new Error("adacare is already defined, but is not an object!"); }

if (!adacare.changeLogPopup) { adacare.changeLogPopup = {}; }
else { throw new Error("adacare.changeLogPopup is already defined!"); }

adacare.changeLogPopup = {

    // Constants and various parameters.

    VISITSCHEDULE_NONE_ID: -1,
    VISITOUTCOME_NONE_ID: -1,
    BUTTON_ID: 'changeLogPopupButton',
    DIALOG_TITLE: 'History of Changes',
    DIALOG_ID: 'changeLogPopupDialog',
    DIALOG_WIDTH_PX: 720,
    DIALOG_CANCEL_BUTTON_ID: 'changeLogPopupDialogCancelButton',
    DIALOG_MSG_ID: 'changeLogPopupDialogMsg',                       // Message in heading
    DIALOG_TABLE_ID: 'changeLogPopupDialogTable',                   // Table of ChangeLog records
    DIALOG_FOOTER_ID: 'changeLogPopupDialogFooter',                 // Message in footer

    /// CSS class names, as defined in the external cs file.

    CSS_ROW_STYLE: 'changeLogPopupRowStyle',
    CSS_ALT_ROW_STYLE: 'changeLogPopupAltRowStyle',

    // Enum of type of ChangeLog to fetch.

    FETCH_NONE: 0,
    FETCH_VISITSCHEDULE: 1,
    FETCH_VISITOUTCOME: 2,
    FETCH_VISITJOIN: 3,
    fetchType: adacare.changeLogPopup.FETCH_NONE,

    visitScheduleID: null,
    visitOutcomeID: null,

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Store the values of the parent record we are going the fetch the ChangeLog for. These are needed
    // later when the user clicks the button to view the ChangeLog records.

    initForVisitSchedule: function (visitScheduleID, purgeDays) {
        'use strict';

        this.fetchType = this.FETCH_VISITSCHEDULE;
        this.visitScheduleID = visitScheduleID;
        this.visitOutcomeID = this.VISITOUTCOME_NONE_ID;
        this.initCommon(purgeDays);
    },

    // Is this one used anywhere? If not, feel free to delete.
    initForVisitOutcome: function (visitOutcomeID, purgeDays) {
        'use strict';

        this.fetchType = this.FETCH_VISITOUTCOME;
        this.visitScheduleID = this.VISITSCHEDULE_NONE_ID;
        this.visitOutcomeID = visitOutcomeID;
        this.initCommon(purgeDays);
    },

    initForVisitJoin: function (visitScheduleID, visitOutcomeID, purgeDays) {
        'use strict';

        this.fetchType = this.FETCH_VISITJOIN;
        this.visitScheduleID = visitScheduleID;
        this.visitOutcomeID = visitOutcomeID;
        this.initCommon(purgeDays);
    },

    initCommon: function (purgeDays) {
        'use strict';

        $('#' + this.BUTTON_ID).click(this.onClick);
        $('#' + adacare.changeLogPopup.DIALOG_ID).hide();
        $('#' + adacare.changeLogPopup.DIALOG_FOOTER_ID).text('The history is deleted ' + purgeDays + ' days after the visit or schedule has expired.');
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle the user's click on the button. We'll fetch the ChangeLog records and display them in a
    // nice pop-up window.

    onClick: function () {
        'use strict';

        $('#' + adacare.changeLogPopup.DIALOG_MSG_ID).text('Please wait...').show();
        $('#' + adacare.changeLogPopup.DIALOG_TABLE_ID).html(''); // Clear the contents
        adacare.lib.modalEditDialog('open', adacare.changeLogPopup.DIALOG_ID, adacare.changeLogPopup.DIALOG_TITLE, adacare.changeLogPopup.DIALOG_WIDTH_PX, adacare.changeLogPopup.DIALOG_CANCEL_BUTTON_ID);

        switch (adacare.changeLogPopup.fetchType) {

            case adacare.changeLogPopup.FETCH_VISITSCHEDULE:

                AdaCareWeb.WebServices.VisitServices.FetchChangeLogForVisitSchedule(
                    adacare.changeLogPopup.visitScheduleID,
                    adacare.changeLogPopup.wsSuccess,
                    adacare.changeLogPopup.wsFail);
                break;

            case adacare.changeLogPopup.FETCH_VISITOUTCOME:

                AdaCareWeb.WebServices.VisitServices.FetchChangeLogForVisitOutcome(
                    adacare.changeLogPopup.visitOutcomeID,
                    adacare.changeLogPopup.wsSuccess,
                    adacare.changeLogPopup.wsFail);
                break;

            case adacare.changeLogPopup.FETCH_VISITJOIN:

                AdaCareWeb.WebServices.VisitServices.FetchChangeLogForVisitJoin(
                    adacare.changeLogPopup.visitScheduleID, adacare.changeLogPopup.visitOutcomeID,
                    adacare.changeLogPopup.wsSuccess,
                    adacare.changeLogPopup.wsFail);
                break;

            default:

                alert('Error in "adacare.changeLogPopup", bad fetchType "' + adacare.changeLogPopup.fetchType + '".');
                break;
        }
    },

    // Programmer's note: Since this is a callback function, "this" is null. Need
    // to reference adacare.changeLogPopup objects by the full name, like
    // "adacare.changeLogPopup.xxx" rather than "this.xxx".

    wsSuccess: function (returnedValue, context, methodName) {
        'use strict';

        var TABLE_HEAD = '<table><tr class="changeLogPopupHeader"><th class="changeLogPopupIndex">&nbsp;</th><th class="changeLogPopupActivity">Activity</th><th class="changeLogPopupDateTime">Date</th><th class="changeLogPopupLoginID">Login ID</th><th class="changeLogPopupDescrip">Description</th></tr>';
        //var TABLE_ROW_TEMPLATE = '<tr class="{0}"><td class="changeLogPopupIndex">{1}.</td><td class="changeLogPopupActivity">{2}</td><td class="changeLogPopupDateTime">{3}</td><td class="changeLogPopupLoginID">{4}</td><td class="changeLogPopupDescrip">{5}</td></tr>';
        var TABLE_ROW_TEMPLATE = '<tr class="{0}"><td class="changeLogPopupIndex">{1}.</td><td class="changeLogPopupActivity">{2}</td><td class="changeLogPopupDateTime">{3}</td><td class="changeLogPopupLoginID">{4}</td><td class="changeLogPopupDescrip">{5}</td></tr>';
        var TABLE_FOOT = '</table>';

        var changeLogReportList = new AdaCareLib.Models.ChangeLogReport();
        var descrip;
        var htmlRow, i;

        if (returnedValue !== null) {

            changeLogReportList = returnedValue;

            if (changeLogReportList.length > 0) {

                $('#' + adacare.changeLogPopup.DIALOG_MSG_ID).text('').hide();

                // Construct the table of ChangeLog records.

                htmlRow = '';

                for (i = 0; i < changeLogReportList.length; i++) {
                    //elemHtml = elemHtmlTemplate.replace('{0}', vElemID).replace('{3}', neuro.cal.visitClassBase)

                    htmlRow += TABLE_ROW_TEMPLATE
                        .replace('{0}', (i % 2 === 0 ? adacare.changeLogPopup.CSS_ROW_STYLE : adacare.changeLogPopup.CSS_ALT_ROW_STYLE))
                        .replace('{1}', i + 1)
                        .replace('{2}', changeLogReportList[i].ChangeTypeDescrip)
                        .replace('{3}', changeLogReportList[i].ChangeDateTimeLocalToString)
                        .replace('{4}', changeLogReportList[i].ChangeUserLoginID)
                        .replace('{5}', changeLogReportList[i].ChangeDescrip);
                }

                $('#' + adacare.changeLogPopup.DIALOG_TABLE_ID).html(TABLE_HEAD + htmlRow + TABLE_FOOT);
            }
            else {

                $('#' + adacare.changeLogPopup.DIALOG_MSG_ID).text('Sorry, but there is no history for this record.').show();
            }
        }
        else {

            $('#' + adacare.changeLogPopup.DIALOG_MSG_ID).text('Sorry, no information is available from the AdaCare server.').show();
            //alert('Web service "adacare.changeLogPopup" failed, no information is available from the AdaCare server.');
        }
    },

    wsFail: function (error, context, methodName) {
        'use strict';

        adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
    }

};
