// Copyright 2009, 2010, 2011, 2012, 2013, 2014 by Neurosoftware, LLC.
//
// adacare.recordtimecards.v1.0.js                Sandy Gettings
//
// Revisions:
//
// 2016-01-21 SG Initial code.

//$(document).ready(function () {

    var adacare;
    if (!adacare) { adacare = {}; }
    else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

    if (!adacare.recordtimecards) { adacare.recordtimecards = {}; }
    else { throw new Error('adacare.recordtimecards is already defined!'); }

    adacare.recordtimecards = {

        // Constants.

        showSplitCheckBoxID: 'ShowSplitTravel',
        SECTION_DATA_VALUE_SURROUND: 'surround',
        SECTION_DATA_VALUE_BILLING: 'billing',
        SECTION_DATA_VALUE_PAYROLL: 'payroll',

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // Initialization when the page is first loaded.

        init: function (showSplitCheckBoxID) {
            'use strict';

            var $showSplitCheckbox, $fieldSelection;

            adacare.recordtimecards.showSplitCheckBoxID = showSplitCheckBoxID;

            // Find all of the "billing" sections and set up a handler whenever the contents of the field
            // is changed.

            $fieldSelection = $('[data-section="' + adacare.recordtimecards.SECTION_DATA_VALUE_BILLING + '"] :input');                 // Select all input fields within any billing section
            $fieldSelection.each(
                function () { $(this).change(adacare.recordtimecards.billingChangedHandler); }
                );

            // Likewise, we have a handler when the "show split" checkbox is changed.

            $showSplitCheckbox = $('#' + adacare.recordtimecards.showSplitCheckBoxID);
            $showSplitCheckbox.change(adacare.recordtimecards.showSplit);
            adacare.recordtimecards.showSplit();
        },

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // There are separate rows for billing and payroll. The user has the option of showing both rows
        // or just one (easier for data entry).

        showSplit: function () {
            'use strict';

            var $showSplitCheckbox, $payrollSelection;

            $showSplitCheckbox = $('#' + adacare.recordtimecards.showSplitCheckBoxID);
            $payrollSelection = $('[data-section="' + adacare.recordtimecards.SECTION_DATA_VALUE_PAYROLL + '"]');

            if ($showSplitCheckbox.is(':checked')) {

                $payrollSelection.show();
            }
            else {

                $payrollSelection.hide();
            }
        },

        ///////////////////////////////////////////////////////////////////////////////////////////////////
        // When the user changes a billing travel field, copy the field's text into the corresponding 
        // payroll travel field.

        billingChangedHandler: function (event) {
            'use strict';

            var isValid, billingText;
            var $surroundDiv, $payrollField;

            // Check to see if the user's input is valid. If not, we won't copy the input into the other field.
            // note that "this" is the element that caused the event.

            billingText = $(this).val(); 
            isValid = $('form').validate().element(this);

            if (isValid) {

                // Find the surrounding div.

                $surroundDiv = $(this).closest('[data-section="' + adacare.recordtimecards.SECTION_DATA_VALUE_SURROUND + '"]');

                // Find the corresponding payroll field within the surrounding div.

                $payrollField = $surroundDiv.find('[data-section="' + adacare.recordtimecards.SECTION_DATA_VALUE_PAYROLL + '"] :input');

                // Copy the billing field's input text (that was changed by the user) into the payroll field.

                billingText = $(this).val();
                $payrollField.val(billingText);
            }
            else {

                // Validation failed, but the validation code also changed the field to a default value (like "0").
                // Since the full form validation happens as this event bubbles up, we need to restore the original
                // invalid input first. Otherwise, the user won't see the error messages.

                $(this).val(billingText);
            }
        }
    };
//});
