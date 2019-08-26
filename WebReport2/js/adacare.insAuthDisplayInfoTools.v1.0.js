/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.insAuthDisplayInfoTools.v1.0.js                   Sandy Gettings
//
// The code displays insurance authorizations. It is intended to be used to fill in the authorization
// info inside a pop-up dialog, which will probably have other controls as well.
//
// Revisions
//
// 2018-09-26 SG: Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.insAuthDisplayInfoTools) { adacare.insAuthDisplayInfoTools = {}; }
else { throw new Error('adacare.insAuthDisplayInfoTools is already defined!'); }

adacare.insAuthDisplayInfoTools = {

    // Display the given authorization info.

    displayAuthorizations: function (insAuthDisplayInfo, isForSingleVisit, insurancePlanNameFullID, problemTextID, displayInfoBlockID) {
        'use strict';

        var CSS_LIMIT_OK = 'insAuthDisplayInfoTools_style_remainingOk';
        var CSS_LIMIT_EXCEEDED = 'insAuthDisplayInfoTools_style_limitExceeded';
        var CSS_NEW_COL = 'insAuthDisplayInfoTools_style_newCol';

        var TABLE_TOP = '<br /><fieldset><table class="table_center">';
        var TABLE_BOT = '</table></fieldset>';

        var AUTH_EFFECTIVE_DATE_DIV = '<br /><div class="general_center">Authorization Dates: {0}</div>';
        var AUTH_NOTES_DIV = '<div class="table_hint">{0}</div>';

        var TABLE_HEAD_FOR_SCHEDULE_ROW1 = '<tr><td class="insAuthDisplayInfoTools_style_descripCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_dateDescripCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_limitCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_usedCol">Already</td>'
            + '<td class="insAuthDisplayInfoTools_style_newCol">New</td>'
            + '<td class="insAuthDisplayInfoTools_style_remainCol">&nbsp;</td></tr>';

        var TABLE_HEAD_FOR_SCHEDULE_ROW2 = '<tr><td class="insAuthDisplayInfoTools_style_descripCol insAuthDisplayInfoTools_style_headerBase">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_dateDescripCol insAuthDisplayInfoTools_style_headerBase">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_limitCol insAuthDisplayInfoTools_style_headerBase">Limit</td>'
            + '<td class="insAuthDisplayInfoTools_style_usedCol insAuthDisplayInfoTools_style_headerBase">Scheduled</td>'
            + '<td class="insAuthDisplayInfoTools_style_newCol insAuthDisplayInfoTools_style_headerBase">Schedule</td>'
            + '<td class="insAuthDisplayInfoTools_style_remainCol insAuthDisplayInfoTools_style_headerBase">Remaining</td></tr>';

        var TABLE_HEAD_FOR_VISIT_ROW1 = '<tr><td class="insAuthDisplayInfoTools_style_descripCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_dateDescripCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_limitCol">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_usedCol">Already</td>'
            + '<td class="insAuthDisplayInfoTools_style_newCol">This</td>'
            + '<td class="insAuthDisplayInfoTools_style_remainCol">&nbsp;</td></tr>';

        var TABLE_HEAD_FOR_VISIT_ROW2 = '<tr><td class="insAuthDisplayInfoTools_style_descripCol insAuthDisplayInfoTools_style_headerBase">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_dateDescripCol insAuthDisplayInfoTools_style_headerBase">&nbsp;</td>'
            + '<td class="insAuthDisplayInfoTools_style_limitCol insAuthDisplayInfoTools_style_headerBase">Limit</td>'
            + '<td class="insAuthDisplayInfoTools_style_usedCol insAuthDisplayInfoTools_style_headerBase">Scheduled</td>'
            + '<td class="insAuthDisplayInfoTools_style_newCol insAuthDisplayInfoTools_style_headerBase">Visit</td>'
            + '<td class="insAuthDisplayInfoTools_style_remainCol insAuthDisplayInfoTools_style_headerBase">Remaining</td></tr>';

        var TABLE_ROW = '<tr><td class="insAuthDisplayInfoTools_style_descripCol">{0}</td>'
            + '<td class="insAuthDisplayInfoTools_style_dateDescripCol">{1}</td>'
            + '<td class="insAuthDisplayInfoTools_style_limitCol">{2}</td>'
            + '<td class="insAuthDisplayInfoTools_style_usedCol">{3}</td>'
            + '<td class="insAuthDisplayInfoTools_style_newCol">{4}</td>'
            + '<td class="insAuthDisplayInfoTools_style_remainCol {6}">{5}</td></tr>';

        var displayHtml;
        var authInfo, authIndex, limitInfo, limitIndex;
        var problemHtml, i;
        var $insurancePlanNameFull, $problemText, $displayInfoBlock;

        $insurancePlanNameFull = $('#' + insurancePlanNameFullID);
        $problemText = $('#' + problemTextID);
        $displayInfoBlock = $('#' + displayInfoBlockID);

        $insurancePlanNameFull.text(insAuthDisplayInfo.InsurancePlanNameFull);

        if (insAuthDisplayInfo.HasProblems) {

            problemHtml = '<ul>';

            for (i = 0; i < insAuthDisplayInfo.ProblemList.length; i++) {

                problemHtml += '<li>' + adacare.lib.htmlEncode(insAuthDisplayInfo.ProblemList[i]) + '</li>';
            }

            problemHtml += '</ul>';
            $problemText.html(problemHtml).show();
        }
        else {

            $problemText.hide();
        }

        // Clear the block of display info before we construct it from scratch.

        $displayInfoBlock.html('');
        displayHtml = '';

        for (authIndex = 0; authIndex < insAuthDisplayInfo.InsuranceAuthorizationInfoList.length; authIndex++) {

            authInfo = insAuthDisplayInfo.InsuranceAuthorizationInfoList[authIndex];
            displayHtml += AUTH_EFFECTIVE_DATE_DIV.replace('{0}', authInfo.EffectiveDateDescrip);

            if (authInfo.Notes) {

                displayHtml += AUTH_NOTES_DIV.replace('{0}', adacare.lib.htmlEncode(authInfo.Notes));
            }

            // Display a slightly different heading if we're looking at a new visit vs. a visit.

            if (isForSingleVisit) {

                displayHtml += TABLE_TOP + TABLE_HEAD_FOR_VISIT_ROW1 + TABLE_HEAD_FOR_VISIT_ROW2;
            }
            else {

                displayHtml += TABLE_TOP + TABLE_HEAD_FOR_SCHEDULE_ROW1 + TABLE_HEAD_FOR_SCHEDULE_ROW2;
            }

            for (limitIndex = 0; limitIndex < authInfo.InsuranceAuthorizationLimitInfoList.length; limitIndex++) {

                limitInfo = authInfo.InsuranceAuthorizationLimitInfoList[limitIndex];

                displayHtml += TABLE_ROW
                    .replace('{0}', adacare.lib.htmlEncode(limitInfo.Descrip))
                    .replace('{1}', adacare.lib.htmlEncode(limitInfo.DateDescrip))
                    .replace('{2}', limitInfo.LimitText)
                    .replace('{3}', limitInfo.UsedText)
                    .replace('{4}', limitInfo.NewText)
                    .replace('{5}', limitInfo.RemainingText)
                    .replace('{6}', limitInfo.LimitExceeded ? CSS_LIMIT_EXCEEDED : CSS_LIMIT_OK);
            }

            displayHtml += TABLE_BOT;
        }

        $displayInfoBlock.html(displayHtml);

        // Show or hide the column of figures for new schedules.

        if (insAuthDisplayInfo.ShowNewSchedule) {

            $('.' + CSS_NEW_COL).show();
        }
        else {

            $('.' + CSS_NEW_COL).hide();
        }
    }
};
