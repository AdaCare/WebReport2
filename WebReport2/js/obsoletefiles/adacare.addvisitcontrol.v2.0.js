
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.AddVisitControl.v2.0             Sandy Gettings
//
// The code implements a few client-side functions for the AddVisitControl.
//
// Revisions
//
// 2014-12-04 SG Original code.
// 2016-08-08 SG: Added code for v2.0.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.AddVisitControl) { adacare.AddVisitControl = {}; }
else { throw new Error('adacare.AddVisitControl is already defined!'); }

adacare.AddVisitControl = {

    // The IDs of the rules checkboxes and the drop-down menu for preset combinations.

    RULES_OPTION_MENU_ID: 'RulesOptionMenu',

    RULE_AVAILABLE_HOUR_ID: 'RuleAvailableHour',
    RULE_CLIENT_SKILLS_ID: 'RuleClientSkills',
    RULE_ENVIRONMENT_ID: 'RuleEnvironment',
    RULE_GENDER_ID: 'RuleGender',
    RULE_IS_BUSY_ID: 'RuleIsBusy',
    RULE_OVERTIME_ID: 'RuleOvertime',
    RULE_VISIT_SKILLS_ID: 'RuleVisitSkills',
    RULE_ZONES_ID: 'RuleZones',

    // The "Find" buttons.

    FIND_NOW_BUTT_ID: 'FindNowButt',
    FIND_PREV_BUTT_ID: 'FindPrevButt',
    FIND_NEXT_BUTT_ID: 'FindNextButt',

    SELECTED_STAFF_MENU_ID: 'StaffSelectMenu',

    // Internal info

    info: {

        // Server-side control for the currently selected staff ID

        $selectedStaffID: null,

        // List of checkboxes for turning rules off & on.

        $ruleAvailableHour_Checkbox: null,
        $ruleClientSkills_Checkbox: null,
        $ruleEnvironment_Checkbox: null,
        $ruleGender_Checkbox: null,
        $ruleIsBusy_Checkbox: null,
        $ruleOvertime_Checkbox: null,
        $ruleVisitSkills_Checkbox: null,
        $ruleZones_Checkbox: null
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // General initialization.

    init: function () {
        'use strict';

        $('#' + this.FIND_NOW_BUTT_ID).click(adacare.AddVisitControl.onFindNowClick);
        $('#' + this.FIND_PREV_BUTT_ID).click(adacare.AddVisitControl.onFindPrevClick);
        $('#' + this.FIND_NEXT_BUTT_ID).click(adacare.AddVisitControl.onFindNextClick);

        this.info.$ruleAvailableHour_Checkbox = $('#' + this.RULE_AVAILABLE_HOUR_ID);
        this.info.$ruleClientSkills_Checkbox = $('#' + this.RULE_CLIENT_SKILLS_ID);
        this.info.$ruleEnvironment_Checkbox = $('#' + this.RULE_ENVIRONMENT_ID);
        this.info.$ruleGender_Checkbox = $('#' + this.RULE_GENDER_ID);
        this.info.$ruleIsBusy_Checkbox = $('#' + this.RULE_IS_BUSY_ID);
        this.info.$ruleOvertime_Checkbox = $('#' + this.RULE_OVERTIME_ID);
        this.info.$ruleVisitSkills_Checkbox = $('#' + this.RULE_VISIT_SKILLS_ID);
        this.info.$ruleZones_Checkbox = $('#' + this.RULE_ZONES_ID);

        adacare.SelectMenu.init(
            this.RULES_OPTION_MENU_ID,
            'HEADING',
            [],
            this.onRulesOptionChange);

        //$('#' + this.RULES_OPTION_MENU_ID).change(this.onRulesOptionChange);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the selectmenu for choosing options for avoiding conflicts. This menu is just a quick way for
    // users to select different groups of checkboxes.

    /***
    initRulesOptionMenu: function (
        ruleAvailableHour_CheckboxElemID,
        ruleClientSkills_CheckboxElemID,
        ruleEnvironment_CheckboxElemID,
        ruleGender_CheckboxElemID,
        ruleIsBusy_CheckboxElemID,
        ruleOvertime_CheckboxElemID,
        ruleVisitSkills_CheckboxElemID,
        ruleZones_CheckboxElemID
    ) {
        'use strict';

        var $control;

        $control = $('#' + this.RULES_OPTION_MENU_ID);

        this.info.$ruleAvoidConflictAvailableHour_Checkbox = $('#' + ruleAvoidConflictAvailableHour_CheckboxElemID);
        this.info.$ruleAvoidConflictClientSkills_Checkbox = $('#' + ruleAvoidConflictClientSkills_CheckboxElemID);
        this.info.$ruleAvoidConflictEnvironment_Checkbox = $('#' + ruleAvoidConflictEnvironment_CheckboxElemID);
        this.info.$ruleAvoidConflictGender_Checkbox = $('#' + ruleAvoidConflictGender_CheckboxElemID);
        this.info.$ruleAvoidConflictIsBusy_Checkbox = $('#' + ruleAvoidConflictIsBusy_CheckboxElemID);
        this.info.$ruleAvoidConflictOvertime_Checkbox = $('#' + ruleAvoidConflictOvertime_CheckboxElemID);
        this.info.$ruleAvoidConflictVisitSkills_Checkbox = $('#' + ruleAvoidConflictVisitSkills_CheckboxElemID);
        this.info.$ruleAvoidConflictZones_Checkbox = $('#' + ruleAvoidConflictZones_CheckboxElemID);

        adacare.SelectMenu.init(
            this.RULES_OPTION_MENU_ID,
            'HEADING',
            [],
            this.onRulesOptionChange);
    },
    ***/

    onRulesOptionChange: function (thisValue, thisText) {
        'use strict';

        var info;

        info = adacare.AddVisitControl.info;

        switch (thisValue) {

            case 'HEADING':
                break;

            case 'ALLOW_BUSY':
                info.$ruleAvailableHour_Checkbox.prop("checked", true);
                info.$ruleClientSkills_Checkbox.prop("checked", true);
                info.$ruleEnvironment_Checkbox.prop("checked", true);
                info.$ruleGender_Checkbox.prop("checked", true);
                info.$ruleIsBusy_Checkbox.prop("checked", false);
                info.$ruleOvertime_Checkbox.prop("checked", true);
                info.$ruleVisitSkills_Checkbox.prop("checked", true);
                info.$ruleZones_Checkbox.prop("checked", true);
                break;

            case 'ALLOW_OVERTIME_AND_ZONES':
                info.$ruleAvailableHour_Checkbox.prop("checked", true);
                info.$ruleClientSkills_Checkbox.prop("checked", true);
                info.$ruleEnvironment_Checkbox.prop("checked", true);
                info.$ruleGender_Checkbox.prop("checked", true);
                info.$ruleIsBusy_Checkbox.prop("checked", true);
                info.$ruleOvertime_Checkbox.prop("checked", false);
                info.$ruleVisitSkills_Checkbox.prop("checked", true);
                info.$ruleZones_Checkbox.prop("checked", false);
                break;

            //case 'AVAILABLE':
            //    info.$ruleAvailableHour_Checkbox.prop("checked", true);
            //    info.$ruleClientSkills_Checkbox.prop("checked", false);
            //    info.$ruleEnvironment_Checkbox.prop("checked", false);
            //    info.$ruleGender_Checkbox.prop("checked", false);
            //    info.$ruleIsBusy_Checkbox.prop("checked", true);
            //    info.$ruleOvertime_Checkbox.prop("checked", false);
            //    info.$ruleVisitSkills_Checkbox.prop("checked", false);
            //    info.$ruleZones_Checkbox.prop("checked", false);
            //    break;

            case 'ALL':
                info.$ruleAvailableHour_Checkbox.prop("checked", false);
                info.$ruleClientSkills_Checkbox.prop("checked", false);
                info.$ruleEnvironment_Checkbox.prop("checked", false);
                info.$ruleGender_Checkbox.prop("checked", false);
                info.$ruleIsBusy_Checkbox.prop("checked", false);
                info.$ruleOvertime_Checkbox.prop("checked", false);
                info.$ruleVisitSkills_Checkbox.prop("checked", false);
                info.$ruleZones_Checkbox.prop("checked", false);
                break;

            case 'BEST':
            default:
                info.$ruleAvailableHour_Checkbox.prop("checked", true);
                info.$ruleClientSkills_Checkbox.prop("checked", true);
                info.$ruleEnvironment_Checkbox.prop("checked", true);
                info.$ruleGender_Checkbox.prop("checked", true);
                info.$ruleIsBusy_Checkbox.prop("checked", true);
                info.$ruleOvertime_Checkbox.prop("checked", true);
                info.$ruleVisitSkills_Checkbox.prop("checked", true);
                info.$ruleZones_Checkbox.prop("checked", true);
                break;
        }

        adacare.SelectMenu.setSelectedValue(adacare.AddVisitControl.RULES_OPTION_MENU_ID, 'HEADING');
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the staff detail popup.

    initStaffDetailPopup: function (officeID, begDateStr) {
        'use strict';

        adacare.staffDetailPopup.init(officeID, begDateStr, 'OpenStaffDetailButt', 'OpenStaffDetailBuddyElem');
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the staff selectmenu.

    initStaffSelectMenu: function (
        groupListFromServer,        // A list of GroupItems for the menu.
        selectedStaffIDElemID       // The hidden field where a copy of the value of the selected item is kept.
        ) {
        'use strict';

        var selectedStaffID;

        this.info.$selectedStaffID = $('#' + selectedStaffIDElemID);
        selectedStaffID = this.info.$selectedStaffID.val();
        adacare.SelectMenu.init(this.SELECTED_STAFF_MENU_ID, selectedStaffID, groupListFromServer, adacare.AddVisitControl.onSelectedStaffChange);
        adacare.staffDetailPopup.onSelectedStaffChange(this.info.$selectedStaffID.val(), adacare.SelectMenu.getSelectedText(this.SELECTED_STAFF_MENU_ID));
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle selected staff changes.

    onSelectedStaffChange: function (thisValue, thisText) {
        'use strict';

        adacare.AddVisitControl.info.$selectedStaffID.val(thisValue);
        adacare.staffDetailPopup.onSelectedStaffChange(Number(thisValue), thisText);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle clicks on the "find" buttons.

    onFindNowClick: function () {
        'use strict';

    },

    onFindPrevClick: function () {
        'use strict';

    },

    onFindNextClick: function () {
        'use strict';

    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Refresh the SelectMenus we use. This function is provided for exernal callers, who may need to
    // redraw the menus because of the outside exnvironment. For example, if the menus are enclosed inside
    // a closed accordion, the menus will appear to have zero width. Refreshing the menus when the accordion
    // pane opens will redraw the menus correctly.

    refreshSelectMenus: function () {
        'use strict';

        adacare.SelectMenu.refresh(this.RULES_OPTION_MENU_ID);
        adacare.SelectMenu.refresh(this.SELECTED_STAFF_MENU_ID);
    }
};
