// Copyright 2017 by Neurosoftware, LLC.
//
// adacare.clientPreferredStaffEditor.v0.0.js         Sandy Gettings
//
// This code is used for editing the list of preferred and excluded staff for each client.
//
// Revisions:
//
// 2018-01-04 SG: Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.clientPreferredStaffEditor) { adacare.clientPreferredStaffEditor = {}; }
else { throw new Error('adacare.ClientPreferredStaffEditor is already defined!'); }

adacare.clientPreferredStaffEditor = {

    // ID of the controls where the total counts are displayed.

    IS_PREFERRED_STAFF_COUNT_ID: 'IsPreferredStaffCount',
    IS_EXCLUDED_STAFF_COUNT_ID: 'IsExcludedStaffCount',

    // Data key for the child ID of each row of checkboxes. Must match the server-side code.

    DATA_KEY_FOR_ID: "client-staff_id",

    // CSS of the different columns of checkboxes. The CSS class name must be unique for each column,
    // so it can beconveniently used to select these elements with jQuery.

    IS_PREFERRED_STAFF_CHECKBOX_CSS: 'client_preferred_staff_editor_is_preferred_staff_col',
    IS_EXCLUDED_STAFF_CHECKBOX_CSS: 'client_preferred_staff_editor_is_excluded_staff_col',

    // Data passed to the event handler when a checkbox is changed.

    //IS_PREFERRED_STAFF_EVENT_DATA: 'event_is_preferred_staff_checkbox_changed',
    //IS_EXCLUDED_STAFF_EVENT_DATA: 'event_is_excluded_staff_checkbox_changed',

    //IS_PREFERRED_STAFF_CHECKBOX_DATA: 'is_preferred_staff_checkbox',
    //IS_EXCLUDED_STAFF_CHECKBOX_DATA: 'is_excluded_staff_checkbox',

    // List of the checkboxes.

    $isPreferredStaffCheckboxList: null,
    $isExcludedStaffCheckboxList: null,

    // Hidden fields where the selected IDs are returned to the server-side code.

    $preferredIDListHidden: null,
    $excludedIDListHidden: null,

    init: function (preferredIDListHiddenID, excludedIDListHiddenID) {
        'use strict';

        // Remember the hidden fields where we return the selected IDs to the  server-side code.

        this.$preferredIDListHidden = $('#' + preferredIDListHiddenID);
        this.$excludedIDListHidden = $('#' + excludedIDListHiddenID);

        // Remember the list of checkboxes.

        this.$isPreferredStaffCheckboxList = $('.' + this.IS_PREFERRED_STAFF_CHECKBOX_CSS + ' :checkbox');
        this.$isExcludedStaffCheckboxList = $('.' + this.IS_EXCLUDED_STAFF_CHECKBOX_CSS + ' :checkbox');

        // Set up the handlers for clicks on the checkboxes.

        this.$isPreferredStaffCheckboxList.on('change', adacare.clientPreferredStaffEditor.isPreferredCheckBoxOnChangeHandler);

        this.$isExcludedStaffCheckboxList.on('change', adacare.clientPreferredStaffEditor.isExcludedCheckBoxOnChangeHandler);

        this.displayCount();
    },

    // Display the counts of checkboxes that are checked on, and put a list of those checkboxes' in
    // hidden fields for the server-side code.

    displayCount: function () {
        'use strict';

        var $checkboxesThatAreOnList, isPreferredStaffCount, isExcludedStaffCount;

        // Preferred clients/staff.

        $checkboxesThatAreOnList = this.$isPreferredStaffCheckboxList.filter(':checked');
        isPreferredStaffCount = $checkboxesThatAreOnList.length;
        $('#' + this.IS_PREFERRED_STAFF_COUNT_ID).text(isPreferredStaffCount);
        this.$preferredIDListHidden.val(this.createChildIDList($checkboxesThatAreOnList));

        // Excluded clients/staff.

        $checkboxesThatAreOnList = this.$isExcludedStaffCheckboxList.filter(':checked');
        isExcludedStaffCount = $checkboxesThatAreOnList.length;
        $('#' + this.IS_EXCLUDED_STAFF_COUNT_ID).text(isExcludedStaffCount);
        this.$excludedIDListHidden.val(this.createChildIDList($checkboxesThatAreOnList));
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

    isPreferredCheckBoxOnChangeHandler: function (e) {
        'use strict';

        var childID, $otherCheckbox;

        childID = $(this).data(adacare.clientPreferredStaffEditor.DATA_KEY_FOR_ID);

        $otherCheckbox = adacare.clientPreferredStaffEditor.$isExcludedStaffCheckboxList.filter(function () {
            return $(this).data(adacare.clientPreferredStaffEditor.DATA_KEY_FOR_ID) === childID;
        });

        $otherCheckbox.prop("checked", false);
        adacare.clientPreferredStaffEditor.displayCount();
    },

    isExcludedCheckBoxOnChangeHandler: function (e) {
        'use strict';

        var childID, $otherCheckbox;

        childID = $(this).data(adacare.clientPreferredStaffEditor.DATA_KEY_FOR_ID);

        $otherCheckbox = adacare.clientPreferredStaffEditor.$isPreferredStaffCheckboxList.filter(function () {
            return $(this).data(adacare.clientPreferredStaffEditor.DATA_KEY_FOR_ID) === childID;
        });

        $otherCheckbox.prop("checked", false);
        adacare.clientPreferredStaffEditor.displayCount();
    }
};
