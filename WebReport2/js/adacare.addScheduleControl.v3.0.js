
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.AddScheduleControl.v3.0             Sandy Gettings
//
// The code implements a few client-side functions for the AddScheduleControl.
//
// Revisions
//
// 2014-12-04 SG: Original code.
// 2016-09-25 SG: Minor changes.
// 2018-01-12 SG: Added support for "excluded staff" checkbox.
// 2018-09-24 SG: Renamed this from "AddVisitControl" to "AddScheduleControl." Added info for important controls.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.AddScheduleControl) { adacare.AddScheduleControl = {}; }
else { throw new Error('adacare.AddScheduleControl is already defined!'); }

adacare.AddScheduleControl = {

    // Constants

    CONFLICT_OPTION_MENU_ID: 'RuleOptionMenu', // 'AvoidConflictOptionMenu',
    SELECTED_STAFF_MENU_ID: 'StaffSelectMenu',

    // Internal info

    info: {

        // Server-side control for the currently selected staff ID

        $selectedStaffID: null,

        // List of checkboxes for turning rules off & on.

        $conflictRuleCheckbox_AvoidConflictAvailableHourElem: null,
        $conflictRuleCheckbox_AvoidConflictClientSkillsElem: null,
        $conflictRuleCheckbox_AvoidConflictEnvironmentElem: null,
        $conflictRuleCheckbox_AvoidConflictExcludedStaffElem: null,
        $conflictRuleCheckbox_AvoidConflictGenderElem: null,
        $conflictRuleCheckbox_AvoidConflictIsBusyElem: null,
        $conflictRuleCheckbox_AvoidConflictOvertimeElem: null,
        $conflictRuleCheckbox_AvoidConflictVisitSkillsElem: null,
        $conflictRuleCheckbox_AvoidConflictZonesElem: null

        // Server-side info controls that we want to know about for the new schedule we're adding.

        //countryAbbrID: null,
        //companyID: null,
        //officeID: null,
        //$clientSelector: null,
        //staffID: null,
        //$clientPayerSelector: null,
        //$contractSelector: null,
        //$visitTemplateSelector: null,
        //$startDateSelector: null,
        //$scheduleTimeSelector: null,
        //$thruDateSelector: null,
        //$intervalSelector: null,
        //$daysOfWeekSelector: null,
        //$extraMinutesSelector: null,
        //$frequencySelector: null,
        //$subfrequencySelector: null,
        //$frequencyOrdinalSelector: null,
        //$frequencyOrdinalKindSelector: null
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Remember the server-side controls for later.

    //initServerInfo: function () {

    //},

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // General initialization.

    //init: function (selectedStaffIDElemID) {
    //    'use strict';

    //    this.info.$selectedStaffID = $('#' + selectedStaffIDElemID);
    //},

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the selectmenu for choosing options for avoiding conflicts. This menu is just a quick way for
    // users to select different groups of checkboxes.

    initAvoidConflictOption: function (
        conflictRuleCheckbox_AvoidConflictAvailableHourElemID,
        conflictRuleCheckbox_AvoidConflictClientSkillsElemID,
        conflictRuleCheckbox_AvoidConflictEnvironmentElemID,
        conflictRuleCheckbox_AvoidConflictExcludedStaffElemID,
        conflictRuleCheckbox_AvoidConflictGenderElemID,
        conflictRuleCheckbox_AvoidConflictIsBusyElemID,
        conflictRuleCheckbox_AvoidConflictOvertimeElemID,
        conflictRuleCheckbox_AvoidConflictVisitSkillsElemID,
        conflictRuleCheckbox_AvoidConflictZonesElemID
    ) {
        'use strict';

        var $control;

        $control = $('#' + this.CONFLICT_OPTION_MENU_ID);

        this.info.$conflictRuleCheckbox_AvoidConflictAvailableHour = $('#' + conflictRuleCheckbox_AvoidConflictAvailableHourElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictClientSkills = $('#' + conflictRuleCheckbox_AvoidConflictClientSkillsElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictEnvironment = $('#' + conflictRuleCheckbox_AvoidConflictEnvironmentElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictExcludedStaffElem = $('#' + conflictRuleCheckbox_AvoidConflictExcludedStaffElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictGender = $('#' + conflictRuleCheckbox_AvoidConflictGenderElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictIsBusy = $('#' + conflictRuleCheckbox_AvoidConflictIsBusyElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictOvertime = $('#' + conflictRuleCheckbox_AvoidConflictOvertimeElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictVisitSkills = $('#' + conflictRuleCheckbox_AvoidConflictVisitSkillsElemID);
        this.info.$conflictRuleCheckbox_AvoidConflictZones = $('#' + conflictRuleCheckbox_AvoidConflictZonesElemID);

        adacare.SelectMenu.init(
            this.CONFLICT_OPTION_MENU_ID,
            'HEADING',
            [],
            this.onAvoidConflictOptionChange);
    },

    onAvoidConflictOptionChange: function (thisValue, thisText) {
        'use strict';

        var info;

        info = adacare.AddScheduleControl.info;

        switch (thisValue) {

            case 'HEADING':
                break;

            case 'AVAILABLE':
                info.$conflictRuleCheckbox_AvoidConflictAvailableHour.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictClientSkills.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictEnvironment.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictExcludedStaffElem.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictGender.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictIsBusy.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictOvertime.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictVisitSkills.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictZones.prop("checked", false);
                break;

            case 'ALL':
                info.$conflictRuleCheckbox_AvoidConflictAvailableHour.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictClientSkills.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictEnvironment.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictExcludedStaffElem.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictGender.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictIsBusy.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictOvertime.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictVisitSkills.prop("checked", false);
                info.$conflictRuleCheckbox_AvoidConflictZones.prop("checked", false);
                break;

            case 'BEST':
            default:
                info.$conflictRuleCheckbox_AvoidConflictAvailableHour.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictClientSkills.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictEnvironment.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictExcludedStaffElem.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictGender.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictIsBusy.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictOvertime.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictVisitSkills.prop("checked", true);
                info.$conflictRuleCheckbox_AvoidConflictZones.prop("checked", true);
                break;
        }

        adacare.SelectMenu.setSelectedValue(adacare.AddScheduleControl.CONFLICT_OPTION_MENU_ID, 'HEADING');
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the staff detail popup.

    initStaffDetailPopup: function (officeID, begDateStr, begTimeStr, frequencyStr) {
        'use strict';

        adacare.staffDetailPopup.init(officeID, begDateStr, begTimeStr, frequencyStr, 'OpenStaffDetailButt', 'OpenStaffDetailBuddyElem');
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the staff selectmenu.

    initStaffSelectMenu: function (
        groupListFromServer,        // A list of GroupItems for the menu.
        selectedStaffIDElemID)       // The hidden field where a copy of the value of the selected item is kept.
    {
        'use strict';

        var selectedStaffID;

        this.info.$selectedStaffID = $('#' + selectedStaffIDElemID);
        selectedStaffID = this.info.$selectedStaffID.val();
        adacare.SelectMenu.init(this.SELECTED_STAFF_MENU_ID, selectedStaffID, groupListFromServer, adacare.AddScheduleControl.onSelectedStaffChange);
        adacare.staffDetailPopup.onSelectedStaffChange(this.info.$selectedStaffID.val(), adacare.SelectMenu.getSelectedText(this.SELECTED_STAFF_MENU_ID));
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle selected staff changes.

    onSelectedStaffChange: function (thisValue, thisText) {
        'use strict';

        adacare.AddScheduleControl.info.$selectedStaffID.val(thisValue);
        adacare.staffDetailPopup.onSelectedStaffChange(Number(thisValue), thisText);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Refresh the SelectMenus we use. This function is provided for exernal callers, who may need to
    // redraw the menus because of the outside exnvironment. For example, if the menus are enclosed inside
    // a closed accordion, the menus will appear to have zero width. Refreshing the menus when the accordion
    // pane opens will redraw the menus correctly.

    refreshSelectMenus: function () {
        'use strict';

        adacare.SelectMenu.refresh(this.CONFLICT_OPTION_MENU_ID);
        adacare.SelectMenu.refresh(this.SELECTED_STAFF_MENU_ID);
    }
};
