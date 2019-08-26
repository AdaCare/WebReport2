// Copyright 2013 by Neurosoftware, LLC.
//
// adacare.ContractRateEditor.v1.0.js
// Sandy Gettings
// Revised 11/26/2013
//
// These are JavaScript methods used by the Contract Rates editor. The main purpose is
// to provide client-side responses to user interactions (much faster).

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.contractRateEditor) { adacare.contractRateEditor = {}; }
else { throw new Error('adacare.contractRateEditor is already defined!'); }

adacare.ContractRateEditor = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Initialize a pair of elements. We set up a drop-down list to update a textbox upon any change.

    init: function (useEmployeeHourlyRateID, hourlyRateTextBoxID) {
        'use strict';

        adacare.ContractRateEditor.updateHourlyRate(useEmployeeHourlyRateID, hourlyRateTextBoxID);

        $('#' + useEmployeeHourlyRateID).change(function () {
            adacare.ContractRateEditor.updateHourlyRate(useEmployeeHourlyRateID, hourlyRateTextBoxID);
        });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update the textbox when after the drop-down list has changed.
    //
    // Rules:
    // - When the "use employee hourly rate" option is true, then the hourly rate textbox is disabled and
    //   set to zero.
    // - When false, the textbox is enabled and gets the focus.

    updateHourlyRate: function (useEmployeeHourlyRateID, hourlyRateTextBoxID) {
        'use strict';

        var $useEmployeeHourlyRate, $hourlyRateTextBox;
        var useEmployeeHourlyRateOption;

        $useEmployeeHourlyRate = $('#' + useEmployeeHourlyRateID);
        $hourlyRateTextBox = $('#' + hourlyRateTextBoxID);

        useEmployeeHourlyRateOption = $useEmployeeHourlyRate.val();

        switch (useEmployeeHourlyRateOption) {

            case 'True':
                $hourlyRateTextBox.prop("disabled", true);
                $hourlyRateTextBox.val(adacare.lib.formatCurrency(0));
                break;

            case 'False':
                $hourlyRateTextBox.prop("disabled", false);
                $hourlyRateTextBox.focus();
                break;
        }
    }
};
