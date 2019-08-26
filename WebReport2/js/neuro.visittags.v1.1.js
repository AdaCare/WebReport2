
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// neuro.visittags.v1.1.js             Sandy Gettings                                    09/27/2014
//
// This is the code and definitions for displaying "tags" (represented with tiny little icons) on
// visit in the calendar.
//
// 2014-09-27 SG Initial code.
// 2015-04-23 SG Add support for supervisor notes tag.

var neuro;
if (!neuro) { neuro = {}; }
else {
    if (typeof (neuro) !== "object") {
        throw new Error("neuro is already defined, but is not an object!");
    }
}

neuro.VisitTags = {

    CODE_NONE: -1,
    selectedCodeID: -1, // Uses CODE_NONE as the default.

    // These are special classes, but not for specific tags.

    CSS_PICKER_ITEM: 'visit_tag_picker_item',
    //CSS_SURROUND: 'visit_tag_surround', // 2017-07-14 SG Moved to 06-stylesheet_cal-v1.5.css

    // These are classes for some special tags.

    CSS_HAS_VISIT_NOTES: 'visit_tag_has_visit_notes',
    CSS_HAS_SUPERVISOR_NOTES: 'visit_tag_has_supervisor_notes',
    CSS_REPEATER: 'visit_tag_rep',

    visitTagMstrList: [],

    //***************************************************************************************
    // Methods for the VisitTagEditor User Control.
    //***************************************************************************************
    // Init the tag picker. This is used on the CRUD page, where the user defines his company's
    // list of tags.

    initPicker: function (selectedCodeID) {
        'use strict';

        var code;

        neuro.VisitTags.selectedCodeID = selectedCodeID;

        // Display the initial tag, using the tag code provided by the server-side software.

        code = $('#' + neuro.VisitTags.selectedCodeID).val();
        neuro.VisitTags.displayExample(code);

        // Set up handler for the user to click on the table of tag icons.

        $('.' + neuro.VisitTags.CSS_PICKER_ITEM).click(neuro.VisitTags.pickerClickHandler);
    },

    pickerClickHandler: function () {
        'use strict';

        var $this = $(this);
        var code;

        code = $this.data('code');
        $('#' + neuro.VisitTags.selectedCodeID).val(code);
        neuro.VisitTags.displayExample(code);
    },

    displayExample: function (code) {
        'use strict';

        var css;

        css = neuro.VisitTags.findCss(code);
        $('#visitTagExample').removeClass().addClass(css);
    },

    //***************************************************************************************
    // Methods for the Calendar page.
    //***************************************************************************************
    // VisitTagMstr constructor. This class is similar to VisitTagMstr table on the server,
    // and it's used to store a master list of the visit tags defined for the user's company.

    VisitTagMstr: function (id, code, shortName) {
        'use strict';

        this.ID = id;
        this.code = code;
        this.shortName = shortName;
    },

    //***************************************************************************************
    // Add a VisitTagMstr object to the list. This function is used when the page is first
    // loaded, to keep the list of these objects handy for later use.

    addVisitTagMstr: function (visitTagEditorDisplayID, AddVisitTagMstrItemListJson) {
        'use strict';

        var visitTagMstr, i;

        // Remember the ID of the element surrounding the VisitTagEditor.

        neuro.VisitTags.VisitTagEditorID = visitTagEditorDisplayID;

        // Remember the info for each VisitTagMstr record defined for this company.

        for (i = 0; i < AddVisitTagMstrItemListJson.length; i++) {

            visitTagMstr = new neuro.VisitTags.VisitTagMstr(
                AddVisitTagMstrItemListJson[i].VisitTagMstrID,
                AddVisitTagMstrItemListJson[i].IconCode,
                AddVisitTagMstrItemListJson[i].ShortName);

            neuro.VisitTags.visitTagMstrList[AddVisitTagMstrItemListJson[i].VisitTagMstrID] = visitTagMstr;
        }
    },

    // Get the values of the checkboxes, and return in an array.

    getCheckboxes: function () {
        'use strict';

        var $surround, $checkboxes;
        var visitTagIDList = [];

        $surround = $('#' + neuro.VisitTags.VisitTagEditorID);
        $checkboxes = $surround.find('[type="checkbox"]');
        $checkboxes.each(function () {

            var $this = $(this);
            var visitTagMstrID;

            if ($this.prop('checked')) {

                visitTagMstrID = $this.val();
                visitTagIDList[visitTagIDList.length] = visitTagMstrID;
            }
        })

        return visitTagIDList;
    },

    // Clear the checkboxes for the visit tags.

    //clearCheckboxes: function () {
    //    'use strict';

    //    var $surround, $checkboxes;

    //    $surround = $('#' + neuro.VisitTags.VisitTagEditorID);
    //    $checkboxes = $surround.find('[type="checkbox"]');
    //    $checkboxes.prop('checked', false);
    //},

    // Set the checkboxes on or off.

    setCheckboxes: function (visitTagIDList) {
        'use strict';

        var $surround, $checkboxes;

        //neuro.VisitTags.clearCheckboxes();
        $surround = $('#' + neuro.VisitTags.VisitTagEditorID);
        $checkboxes = $surround.find('[type="checkbox"]');
        $checkboxes.each(function () {

            var $this = $(this);
            var visitTagMstrID, found, i;

            found = false;
            visitTagMstrID = $this.val();

            for (i = 0; i < visitTagIDList.length && !found; i++) {

                found = (visitTagIDList[i] == visitTagMstrID);
            }

            $this.prop('checked', found);
        })
    },

    //***************************************************************************************
    //***************************************************************************************
    // Below are the classes and codes for visit tags that can be used in the picker. The
    // codes must be unique, and MUST match the definitions in server-side code.
    //
    // This list includes all codes and CSS classes. It's used to look up codes by  CSS class,
    // or vice versa.

    iconList: [

    // Green tags

    { code: 100, css: 'visit_tag_0_G' },
    { code: 101, css: 'visit_tag_1_G' },
    { code: 102, css: 'visit_tag_2_G' },
    { code: 103, css: 'visit_tag_3_G' },
    { code: 104, css: 'visit_tag_4_G' },
    { code: 105, css: 'visit_tag_5_G' },
    { code: 106, css: 'visit_tag_6_G' },
    { code: 107, css: 'visit_tag_7_G' },
    { code: 108, css: 'visit_tag_8_G' },
    { code: 109, css: 'visit_tag_9_G' },
    { code: 110, css: 'visit_tag_A_G' },
    { code: 111, css: 'visit_tag_B_G' },
    { code: 112, css: 'visit_tag_C_G' },
    { code: 113, css: 'visit_tag_D_G' },
    { code: 114, css: 'visit_tag_E_G' },
    { code: 115, css: 'visit_tag_F_G' },
    { code: 116, css: 'visit_tag_G_G' },
    { code: 117, css: 'visit_tag_H_G' },
    { code: 118, css: 'visit_tag_I_G' },
    { code: 119, css: 'visit_tag_J_G' },
    { code: 120, css: 'visit_tag_K_G' },
    { code: 121, css: 'visit_tag_L_G' },
    { code: 122, css: 'visit_tag_M_G' },
    { code: 123, css: 'visit_tag_N_G' },
    { code: 124, css: 'visit_tag_O_G' },
    { code: 125, css: 'visit_tag_P_G' },
    { code: 126, css: 'visit_tag_Q_G' },
    { code: 127, css: 'visit_tag_R_G' },
    { code: 128, css: 'visit_tag_S_G' },
    { code: 129, css: 'visit_tag_T_G' },
    { code: 130, css: 'visit_tag_U_G' },
    { code: 131, css: 'visit_tag_V_G' },
    { code: 132, css: 'visit_tag_W_G' },
    { code: 133, css: 'visit_tag_X_G' },
    { code: 134, css: 'visit_tag_Y_G' },
    { code: 135, css: 'visit_tag_Z_G' },

    // Yellow tags

    { code: 200, css: 'visit_tag_0_Y' },
    { code: 201, css: 'visit_tag_1_Y' },
    { code: 202, css: 'visit_tag_2_Y' },
    { code: 203, css: 'visit_tag_3_Y' },
    { code: 204, css: 'visit_tag_4_Y' },
    { code: 205, css: 'visit_tag_5_Y' },
    { code: 206, css: 'visit_tag_6_Y' },
    { code: 207, css: 'visit_tag_7_Y' },
    { code: 208, css: 'visit_tag_8_Y' },
    { code: 209, css: 'visit_tag_9_Y' },
    { code: 210, css: 'visit_tag_A_Y' },
    { code: 211, css: 'visit_tag_B_Y' },
    { code: 212, css: 'visit_tag_C_Y' },
    { code: 213, css: 'visit_tag_D_Y' },
    { code: 214, css: 'visit_tag_E_Y' },
    { code: 215, css: 'visit_tag_F_Y' },
    { code: 216, css: 'visit_tag_G_Y' },
    { code: 217, css: 'visit_tag_H_Y' },
    { code: 218, css: 'visit_tag_I_Y' },
    { code: 219, css: 'visit_tag_J_Y' },
    { code: 220, css: 'visit_tag_K_Y' },
    { code: 221, css: 'visit_tag_L_Y' },
    { code: 222, css: 'visit_tag_M_Y' },
    { code: 223, css: 'visit_tag_N_Y' },
    { code: 224, css: 'visit_tag_O_Y' },
    { code: 225, css: 'visit_tag_P_Y' },
    { code: 226, css: 'visit_tag_Q_Y' },
    { code: 227, css: 'visit_tag_R_Y' },
    { code: 228, css: 'visit_tag_S_Y' },
    { code: 229, css: 'visit_tag_T_Y' },
    { code: 230, css: 'visit_tag_U_Y' },
    { code: 231, css: 'visit_tag_V_Y' },
    { code: 232, css: 'visit_tag_W_Y' },
    { code: 233, css: 'visit_tag_X_Y' },
    { code: 234, css: 'visit_tag_Y_Y' },
    { code: 235, css: 'visit_tag_Z_Y' },

    // Red tags

    { code: 300, css: 'visit_tag_0_R' },
    { code: 301, css: 'visit_tag_1_R' },
    { code: 302, css: 'visit_tag_2_R' },
    { code: 303, css: 'visit_tag_3_R' },
    { code: 304, css: 'visit_tag_4_R' },
    { code: 305, css: 'visit_tag_5_R' },
    { code: 306, css: 'visit_tag_6_R' },
    { code: 307, css: 'visit_tag_7_R' },
    { code: 308, css: 'visit_tag_8_R' },
    { code: 309, css: 'visit_tag_9_R' },
    { code: 310, css: 'visit_tag_A_R' },
    { code: 311, css: 'visit_tag_B_R' },
    { code: 312, css: 'visit_tag_C_R' },
    { code: 313, css: 'visit_tag_D_R' },
    { code: 314, css: 'visit_tag_E_R' },
    { code: 315, css: 'visit_tag_F_R' },
    { code: 316, css: 'visit_tag_G_R' },
    { code: 317, css: 'visit_tag_H_R' },
    { code: 318, css: 'visit_tag_I_R' },
    { code: 319, css: 'visit_tag_J_R' },
    { code: 320, css: 'visit_tag_K_R' },
    { code: 321, css: 'visit_tag_L_R' },
    { code: 322, css: 'visit_tag_M_R' },
    { code: 323, css: 'visit_tag_N_R' },
    { code: 324, css: 'visit_tag_O_R' },
    { code: 325, css: 'visit_tag_P_R' },
    { code: 326, css: 'visit_tag_Q_R' },
    { code: 327, css: 'visit_tag_R_R' },
    { code: 328, css: 'visit_tag_S_R' },
    { code: 329, css: 'visit_tag_T_R' },
    { code: 330, css: 'visit_tag_U_R' },
    { code: 331, css: 'visit_tag_V_R' },
    { code: 332, css: 'visit_tag_W_R' },
    { code: 333, css: 'visit_tag_X_R' },
    { code: 334, css: 'visit_tag_Y_R' },
    { code: 335, css: 'visit_tag_Z_R' }
    ],

    //***************************************************************************************
    // Given the tag's code, return the CSS class (or an empty string).

    findCss: function (code) {
        'use strict';

        var css = '';
        var i;

        for (i = 0; i < neuro.VisitTags.iconList.length; i++) {

            if (neuro.VisitTags.iconList[i].code == code) {

                css = neuro.VisitTags.iconList[i].css;
                break;
            }
        }

        return css;
    },

    //***************************************************************************************
    // Given the tag's CSS class, return the code (or an empty string).

    findCode: function (css) {
        'use strict';

        var code = neuro.VisitTags.CODE_NONE;
        var i;

        for (i = 0; i < neuro.VisitTags.iconList.length; i++) {

            if (neuro.VisitTags.iconList[i].css == css) {

                code = neuro.VisitTags.iconList[i].code;
                break;
            }
        }

        return code;
    }
}
