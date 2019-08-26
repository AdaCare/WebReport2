// Copyright 2017 by Neurosoftware, LLC.
//
// adacare.clientMedicalConditionEditor.v0.0.js         Sandy Gettings
//
// This code is used for editing the list of medical conditions for each client.
//
// Revisions:
//
// 2018-11-29 SG: Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.clientMedicalConditionEditor) { adacare.clientMedicalConditionEditor = {}; }
else { throw new Error('adacare.ClientMedicalConditionEditor is already defined!'); }

adacare.clientMedicalConditionEditor = {

    // ID of the controls where the total counts are displayed.

    IS_SELECTED_COUNT_ID: 'IsSelectedCount',

    // Data key for the child ID of each row of checkboxes. Must match the server-side code.

    DATA_KEY_FOR_ID: "client-medical_condition_id",

    // CSS of the different columns of checkboxes. The CSS class name must be unique for each column,
    // so it can beconveniently used to select these elements with jQuery.

    SELECTION_CHECKBOX_CSS: 'client_medical_condition_editor_selection_col',

    // List of the checkboxes.

    $isSelectedCheckboxList: null,

    // Hidden fields where the selected IDs are returned to the server-side code.

    $selectedIDListHidden: null,

    init: function (selectedIDListHidden) {
        'use strict';

        // Remember the hidden fields where we return the selected IDs to the  server-side code.

        this.$selectedIDListHidden = $('#' + selectedIDListHidden);

        // Remember the list of checkboxes.

        this.$isSelectedCheckboxList = $('.' + this.SELECTION_CHECKBOX_CSS + ' :checkbox');

        // Set up the handlers for clicks on the checkboxes.

        this.$isSelectedCheckboxList.on('change', adacare.clientMedicalConditionEditor.isSelectedCheckBoxOnChangeHandler);
        this.displayCount();
    },

    // Display the counts of checkboxes that are checked on, and put a list of those checkboxes' in
    // hidden fields for the server-side code.

    displayCount: function () {
        'use strict';

        var $checkboxesThatAreOnList, isSelectedCount;

        // Preferred clients/staff.

        $checkboxesThatAreOnList = this.$isSelectedCheckboxList.filter(':checked');
        isSelectedCount = $checkboxesThatAreOnList.length;
        $('#' + this.IS_SELECTED_COUNT_ID).text(isSelectedCount);
        this.$selectedIDListHidden.val(this.createChildIDList($checkboxesThatAreOnList));
    },

    createChildIDList: function ($checkboxes) {
        'use strict';

        var childIDList, i;

        childIDList = '';

        for (i = 0; i < $checkboxes.length; i++) {

            if (i > 0) {

                childIDList += ',';
            }

            childIDList += $($checkboxes[i]).data(this.DATA_KEY_FOR_ID);
        }

        return childIDList;
    },

    // Handlers for clicks on the checkboxes. If one checkbox in a row is clicked, then we
    // turn the other checkbox off.

    isSelectedCheckBoxOnChangeHandler: function (e) {
        'use strict';

        var childID;

        //childID = $(this).data(adacare.clientMedicalConditionEditor.DATA_KEY_FOR_ID);

        //$otherCheckbox = adacare.clientMedicalConditionEditor.$isExcludedStaffCheckboxList.filter(function () {
        //    return $(this).data(adacare.clientMedicalConditionEditor.DATA_KEY_FOR_ID) === childID;
        //});

        //$otherCheckbox.prop("checked", false);
        adacare.clientMedicalConditionEditor.displayCount();
    }
};
