// Copyright 2019 by Neurosoftware, LLC.
//
// adacare.careTaskRecordedEditor.v1.0.js       Sandy Gettings
//
// This code is used for editing the list of care tasks recorded for a client.
//
// Revisions:
//
// 2019-01-17 SG: Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.careTaskRecordedEditor) { adacare.careTaskRecordedEditor = {}; }
else { throw new Error('adacare.careTaskRecordedEditor is already defined!'); }

adacare.careTaskRecordedEditor = {

    // These elements must be already defined in the page's HTML:

    CARE_TASK_DISPLAY_DIV_ID: 'careTaskRecordedEditorDisplayDiv',
    CARE_TASK_MSTR_MORE_SELECTOR_ID: "CareTaskRecordedEditorMoreCareTaskMstrSelector",

    // These MUST match the definition in the server-side class:

    CARE_TASK_MSTR_NONE_ID: -1,
    CARE_TASK_SCHEDULE_NONE_ID: -1,
    CARE_TASK_RECORDED_NONE_ID: -1,

    // Define selection values. These *must* match server-code enum CareTaskJoin.StatusCode (from CareTaskRecorded.StatusEnum):

    NOT_COMPLETED_STATUS: 0,
    COMPLETED_STATUS: 1,
    NOT_RECORDED_STATUS: 2,

    // This data key is used to identify which care task elemnt was clicked.

    DATA_KEY_INDEX: 'caretaskindex',        // Index into the selection list. The data key *must* be lowercase.
    DATA_KEY_HEADER_ICONS: 'caretaskheader',

    // CSS classes for the selection status icons.

    NOT_COMPLETED_ICON_CSS: 'careTaskRecordedEditorNotCompletedIcon',
    COMPLETED_ICON_CSS: 'careTaskRecordedEditorCompletedIcon',
    NOT_RECORDED_ICON_CSS: 'careTaskRecordedEditorNotRecordedIcon',

    // HTML elements for displaying the selection status icons.

    NOT_COMPLETED_ICON_HTML: '',
    COMPLETED_ICON_HTML: '',
    NOT_RECORDED_ICON_HTML: '',
    HEADER_ICONS_HTML_TEMPLATE: '',

    // HTML element for the "required" symbol:

    REQUIRED_HTML: '<span class="general_required">*</span>',

    // Prefix of the "Notes" elements.

    CARE_TASK_NOTES_ID_PREFIX: 'careTaskText', // Plus the index in the selection list.

    // Local info

    isMobile: false,                        // True for mobile environment, false for desktop
    careTaskMstrList: null,                 // Master list of CareTaskMstr records.
    $careTaskMstrMoreSelector: null,        // Drop-down list element of CareTaskMstr items for the user to select "more".
    $editorCareTaskJoinResultList: null,    // Text (not Hidden) element, where the edited list is accessible to the server-side code.
    $careTaskDisplayDiv: null,              // Div that contains the list of CareTaskJoin displayed for editing.

    //***************************************************************************************

    // Constructor

    CareTaskJoin: function (careTaskMstrID) {
        'use strict';

        var careTaskMstrItem;

        careTaskMstrItem = adacare.careTaskRecordedEditor.fetchMstr(careTaskMstrID);
        this.StatusCode = adacare.careTaskRecordedEditor.NOT_RECORDED_STATUS;
        this.CareTaskMstrID = (careTaskMstrItem !== null ? careTaskMstrID : adacare.careTaskRecordedEditor.CARE_TASK_MSTR_NONE_ID);
        this.Descrip = (careTaskMstrItem !== null ? careTaskMstrItem.Descrip : 'Undefined careTaskMstr ID #' + careTaskMstrID);
        this.CareTaskScheduleID = adacare.careTaskRecordedEditor.CARE_TASK_SCHEDULE_NONE_ID;
        this.IsRequired = false;
        this.CareTaskRecordedID = adacare.careTaskRecordedEditor.CARE_TASK_RECORDED_NONE_ID;
        this.Notes = '';

    },

    //***************************************************************************************
    // The server-side code should call this function once in the beginning

    initDesktop: function (careTaskMstrList, editorCareTaskJoinList, editorCareTaskJoinListHiddenID) {
        'use strict';

        this.isMobile = false;
        this.initShared(careTaskMstrList, editorCareTaskJoinList, editorCareTaskJoinListHiddenID);
        this.displaySelectionList();
    },

    initMobile: function (careTaskMstrList, editorCareTaskJoinList, editorCareTaskJoinListHiddenID) {
        'use strict';

        // DEBUG
        //$('#' + adacare.careTaskRecordedEditor.CARE_TASK_DISPLAY_DIV_ID).listview({
        //    create: function (event, ui) { alert('created');}
        //});
        // END DEBUG

        this.isMobile = true;
        this.initShared(careTaskMstrList, editorCareTaskJoinList, editorCareTaskJoinListHiddenID);
        this.displaySelectionList();
    },

    initShared: function (careTaskMstrList, editorCareTaskJoinList, editorCareTaskJoinListHiddenID) {
        'use strict';

        // Remember the fixed elements on the page.

        this.$careTaskMstrMoreSelector = $('#' + this.CARE_TASK_MSTR_MORE_SELECTOR_ID);
        this.$careTaskDisplayDiv = $('#' + adacare.careTaskRecordedEditor.CARE_TASK_DISPLAY_DIV_ID);

        // Remember the hidden fields where we return the edited care task info to the server-side code.

        this.careTaskMstrList = careTaskMstrList;
        this.$editorCareTaskJoinResultList = $('#' + editorCareTaskJoinListHiddenID);
        this.$editorCareTaskJoinResultList.val(JSON.stringify(editorCareTaskJoinList));

        // Construct some HTML elements we use a lot:

        this.NOT_COMPLETED_ICON_HTML = '<span class="' + this.NOT_COMPLETED_ICON_CSS + '">&#10008;</span>';
        this.COMPLETED_ICON_HTML = '<span class="' + this.COMPLETED_ICON_CSS + '">&#10004;</span>';
        this.NOT_RECORDED_ICON_HTML = '<span class="' + this.NOT_RECORDED_ICON_CSS + '">&nbsp;</span>';

        // Header has all three icons, plus a data attribute.

        this.HEADER_ICONS_HTML_TEMPLATE =
            '<span class="' + this.NOT_COMPLETED_ICON_CSS + '" data-' + this.DATA_KEY_HEADER_ICONS + '="{0}"' + '>&#10008;</span>'
            + '<span class="' + this.COMPLETED_ICON_CSS + '" data-' + this.DATA_KEY_HEADER_ICONS + '="{0}"' + '>&#10004;</span>'
            + '<span class="' + this.NOT_RECORDED_ICON_CSS + '" data-' + this.DATA_KEY_HEADER_ICONS + '="{0}"' + '>&nbsp;</span>';

        this.initMstrDropDownList();
    },

    //***************************************************************************************
    // Display the list of CareTaskJoin records. This is the list that's edited by the user.

    displaySelectionList: function () {
        'use strict';

        var careTaskJoin, editorCareTaskJoinResultList;
        var i;

        editorCareTaskJoinResultList = JSON.parse(adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val());
        adacare.careTaskRecordedEditor.$careTaskDisplayDiv.empty();

        for (i = 0; i < editorCareTaskJoinResultList.length; i++) {

            careTaskJoin = editorCareTaskJoinResultList[i];
            adacare.careTaskRecordedEditor.displayOneSelectionItem(careTaskJoin, i);
        }

        if (this.isMobile) {

            //adacare.careTaskRecordedEditor.$careTaskDisplayDiv.listview("refresh"); // Tells jQueryMobile to refresh the page after building the drop-down list.
            adacare.careTaskRecordedEditor.$careTaskDisplayDiv.listview(); // Tells jQueryMobile to refresh the page after building the drop-down list.
        }
        else {
            adacare.careTaskRecordedEditor.$careTaskDisplayDiv.accordion({ active: false, collapsible: true });
        }
    },

    //***************************************************************************************
    // Display a single CareTaskJoin record on the list.

    displayOneSelectionItem: function (careTaskJoin, itemIndex) {
        'use strict';

        if (adacare.careTaskRecordedEditor.isMobile) {

            adacare.careTaskRecordedEditor.displayOneSelectionItemForMobile(careTaskJoin, itemIndex);
        }
        else {
            adacare.careTaskRecordedEditor.displayOneSelectionItemForDesktop(careTaskJoin, itemIndex);
        }
    },

    displayOneSelectionItemForDesktop: function (careTaskJoin, itemIndex) {
        'use strict';

        var RADIO_BUTTON_NAME_PREFIX = 'careTaskButton';

        var RADIO_BUTTON_COMPLETED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' value="' + this.COMPLETED_STATUS + '"'
            + ' id="careTaskComplete{0}"/>'
            + '<label for="careTaskComplete{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.COMPLETED_ICON_HTML + 'Completed</label>';

        var RADIO_BUTTON_NOT_COMPLETED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' value="' + this.NOT_COMPLETED_STATUS + '"'
            + ' id="careTaskNotComplete{0}"/>'
            + '<label for="careTaskNotComplete{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.NOT_COMPLETED_ICON_HTML + 'Not completed</label>';

        var RADIO_BUTTON_NOT_RECORDED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' value="' + this.NOT_RECORDED_STATUS + '"'
            + ' id="careTaskNotRecorded{0}"/>'
            + '<label for="careTaskNotRecorded{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.NOT_RECORDED_ICON_HTML + 'Not recorded</label>';

        var ACCORDION_ITEM_TEMPLATE = '<h3>{1}{2}{3}</h3>'
            + '<div>'
            + '<fieldset>'
            + '{4}<br />'
            + '{5}<br />'
            + '{6}<br />'
            + '</fieldset>'
            //+ '<label for="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}" style="padding-left: 2.7em;">Notes&nbsp;</label>'
            //+ '<input type="text" id="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}" data-' + this.DATA_KEY_INDEX + '={0} maxlength="50" style="width:100%"/>'
            //+ '<input type="textarea" id="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}" data-' + this.DATA_KEY_INDEX + '={0} rows="3" maxlength="100" style="width:100%"/>'
            + '<div style="margin-top:0.5em;">Notes</div><textarea id="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}" data-' + this.DATA_KEY_INDEX + '={0} rows="3" maxlength="100" style="width:100%;"/>'
            + '</div>';

        var accordionItem, $accordionItem;
        var radioButtonName, radioButtonElemForCompleted, radioButtonElemForNotCompleted, radioButtonElemForNotRecorded;
        var headerElementsForIcons;
        var careTaskNotesID;

        radioButtonName = RADIO_BUTTON_NAME_PREFIX + String(itemIndex);
        radioButtonElemForCompleted = RADIO_BUTTON_COMPLETED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));
        radioButtonElemForNotCompleted = RADIO_BUTTON_NOT_COMPLETED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));
        radioButtonElemForNotRecorded = RADIO_BUTTON_NOT_RECORDED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));

        careTaskNotesID = adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + String(itemIndex);

        // Construct the icons that appear in the header.

        headerElementsForIcons = adacare.careTaskRecordedEditor.HEADER_ICONS_HTML_TEMPLATE.replace(/\{0\}/g, String(itemIndex));

        accordionItem = ACCORDION_ITEM_TEMPLATE
            .replace(/\{0\}/g, String(itemIndex))
            .replace('{1}', headerElementsForIcons)
            .replace('{2}', careTaskJoin.Descrip)
            .replace('{3}', (careTaskJoin.IsRequired ? adacare.careTaskRecordedEditor.REQUIRED_HTML : ''))
            .replace('{4}', radioButtonElemForCompleted)
            .replace('{5}', radioButtonElemForNotCompleted)
            .replace('{6}', radioButtonElemForNotRecorded);

        $accordionItem = $(accordionItem);
        adacare.careTaskRecordedEditor.$careTaskDisplayDiv.append($accordionItem);

        // Set the selected value for the radio button group and the notes.

        $('#' + adacare.careTaskRecordedEditor.$careTaskDisplayDiv[0].id + ' ' + 'input:radio[name=' + radioButtonName + ']').val([careTaskJoin.StatusCode]);
        $('#' + careTaskNotesID).val(careTaskJoin.Notes);

        // Display the selected status icon in the header.

        adacare.careTaskRecordedEditor.displayHeaderIconAndNotes(itemIndex);

        // Attach a handler for any changes to the status radio buttons or notes.

        $('input:radio[name=' + radioButtonName + ']').off('change').on('change', adacare.careTaskRecordedEditor.handleCareTaskStatusChanged);
        $('#' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + String(itemIndex)).off('change').on('change', adacare.careTaskRecordedEditor.handleCareTaskNotesChanged);
    },

    displayOneSelectionItemForMobile: function (careTaskJoin, itemIndex) {
        'use strict';

        var RADIO_BUTTON_NAME_PREFIX = 'careTaskButton';

        var RADIO_BUTTON_COMPLETED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' data-mini="true"'
            + ' value="' + this.COMPLETED_STATUS + '"'
            + ' id="careTaskComplete{0}">'
            + '<label for="careTaskComplete{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.COMPLETED_ICON_HTML + 'Completed</label>';

        var RADIO_BUTTON_NOT_COMPLETED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' data-mini="true"'
            + ' value="' + this.NOT_COMPLETED_STATUS + '"'
            + ' id="careTaskNotComplete{0}"/>'
            + '<label for="careTaskNotComplete{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.NOT_COMPLETED_ICON_HTML + 'Not completed</label>';

        var RADIO_BUTTON_NOT_RECORDED_TEMPLATE = '<input type="radio"'
            + ' name="' + RADIO_BUTTON_NAME_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            + ' data-mini="true"'
            + ' value="' + this.NOT_RECORDED_STATUS + '"'
            + ' id="careTaskNotRecorded{0}"/>'
            + '<label for="careTaskNotRecorded{0}" data-' + this.DATA_KEY_INDEX + '={0}>' + this.NOT_RECORDED_ICON_HTML + 'Not recorded</label>';

        var NOTES_TEMPLATE = '<label for="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}" class="general_small_text">Notes</label>'
            //+ '<input type="text"'
            + '<textarea'
            + ' id="' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + '{0}"'
            + ' data-' + this.DATA_KEY_INDEX + '={0}'
            //+ ' data-mini="true"'
            + ' class="general_small_text"'
            + ' maxlength="100" style="width:100%"'
            + '</textarea>';

        var ACCORDION_ITEM_TEMPLATE = '<div data-role="collapsible">'
            + '<h3>{1}{2}{3}</h3>'
            + '<fieldset data-role="controlgroup">'
            + '{4}'
            + '{5}'
            + '{6}'
            + '<div class="ui-field-contain">{7}</div>'
            + '</fieldset>'
            + '</div>';

        var accordionItem, $accordionItem;
        var radioButtonName, radioButtonElemForCompleted, radioButtonElemForNotCompleted, radioButtonElemForNotRecorded;
        var notesElem;
        var headerElementsForIcons;
        var careTaskNotesID;

        radioButtonName = RADIO_BUTTON_NAME_PREFIX + String(itemIndex);
        radioButtonElemForCompleted = RADIO_BUTTON_COMPLETED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));
        radioButtonElemForNotCompleted = RADIO_BUTTON_NOT_COMPLETED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));
        radioButtonElemForNotRecorded = RADIO_BUTTON_NOT_RECORDED_TEMPLATE.replace(/\{0\}/g, String(itemIndex));
        notesElem = NOTES_TEMPLATE.replace(/\{0\}/g, String(itemIndex));

        careTaskNotesID = adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + String(itemIndex);

        // Construct the icons that appear in the header.

        headerElementsForIcons = adacare.careTaskRecordedEditor.HEADER_ICONS_HTML_TEMPLATE.replace(/\{0\}/g, String(itemIndex));

        accordionItem = ACCORDION_ITEM_TEMPLATE
            .replace(/\{0\}/g, String(itemIndex))
            .replace('{1}', headerElementsForIcons)
            .replace('{2}', careTaskJoin.Descrip)
            .replace('{3}', (careTaskJoin.IsRequired ? adacare.careTaskRecordedEditor.REQUIRED_HTML : ''))
            .replace('{4}', radioButtonElemForCompleted)
            .replace('{5}', radioButtonElemForNotCompleted)
            .replace('{6}', radioButtonElemForNotRecorded)
            .replace('{7}', notesElem);

        // DEBUG
        //accordionItem = '<div data-role="collapsible">'
        //    + '<h3>This is a sample</h3>'
        //    + '<div>'
        //    + 'Inside line 2'
        //    + '</div>'
        //    + '</div>';

        //$accordionItem = $(accordionItem);
        //$accordionItem.collapsible();
        ////$accordionItem.listview("refresh");
        //adacare.careTaskRecordedEditor.$careTaskDisplayDiv.append($accordionItem);
        //return;
        // END DEBUG
        $accordionItem = $(accordionItem);
        adacare.careTaskRecordedEditor.$careTaskDisplayDiv.append($accordionItem);

        // Tell JQM to enhance the elements. Otherwise, they will appear as regular HTML would with default formatting.

        $accordionItem.collapsible();
        $accordionItem.find('fieldset').controlgroup();
        $accordionItem.find('input[name="' + RADIO_BUTTON_NAME_PREFIX + String(itemIndex) + '"]').checkboxradio();
        //$accordionItem.find('[type=text]').textinput();
        $accordionItem.find('textarea').textinput();

        // Set the selected value for the radio button group and the notes.

        $('#' + adacare.careTaskRecordedEditor.$careTaskDisplayDiv[0].id + ' ' + 'input:radio[name=' + radioButtonName + ']').val([careTaskJoin.StatusCode]);
        $('#' + careTaskNotesID).val(careTaskJoin.Notes);
        $accordionItem.find('input[name="' + RADIO_BUTTON_NAME_PREFIX + String(itemIndex) + '"]').checkboxradio("refresh"); // Must do this *after* the radio button value has been set.

        // Display the selected status icon in the header.

        adacare.careTaskRecordedEditor.displayHeaderIconAndNotes(itemIndex);

        // Attach a handler for any changes to the status radio buttons or notes.

        $('input:radio[name=' + radioButtonName + ']').off('change').on('change', adacare.careTaskRecordedEditor.handleCareTaskStatusChanged);
        $('#' + adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + String(itemIndex)).off('change').on('change', adacare.careTaskRecordedEditor.handleCareTaskNotesChanged);
    },

    //***************************************************************************************
    // Set the icon in the header to show the item's selection status.

    displayHeaderIconAndNotes: function (itemIndex) {
        'use strict';

        var ICON_SELECTOR_TEMPLATE = '*[data-{0}="{1}"]';

        var careTaskJoin;
        var headerIconsSelector;
        var careTaskNotesID, $notesElem;
        var selectedStatusCode;

        careTaskJoin = adacare.careTaskRecordedEditor.fetchCareTaskJoinResultItem(itemIndex);
        selectedStatusCode = careTaskJoin.StatusCode;
        careTaskNotesID = adacare.careTaskRecordedEditor.CARE_TASK_NOTES_ID_PREFIX + String(itemIndex);
        $notesElem = $('#' + careTaskNotesID);

        headerIconsSelector = ICON_SELECTOR_TEMPLATE.replace('{0}', adacare.careTaskRecordedEditor.DATA_KEY_HEADER_ICONS).replace('{1}', String(itemIndex));

        switch (selectedStatusCode) {

            case adacare.careTaskRecordedEditor.NOT_COMPLETED_STATUS:

                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_COMPLETED_ICON_CSS).show();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.COMPLETED_ICON_CSS).hide();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_RECORDED_ICON_CSS).hide();
                $notesElem.prop('disabled', false); // Enable notes
                break;

            case adacare.careTaskRecordedEditor.COMPLETED_STATUS:

                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_COMPLETED_ICON_CSS).hide();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.COMPLETED_ICON_CSS).show();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_RECORDED_ICON_CSS).hide();
                $notesElem.prop('disabled', false); // Enable notes
                break;

            case adacare.careTaskRecordedEditor.NOT_RECORDED_STATUS:

                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_COMPLETED_ICON_CSS).hide();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.COMPLETED_ICON_CSS).hide();
                $(headerIconsSelector + '.' + adacare.careTaskRecordedEditor.NOT_RECORDED_ICON_CSS).show();
                $notesElem.prop('disabled', true); // Disable notes
                break;
        }
    },

    //***************************************************************************************
    // Handle a user's selection from the "more" selector.
    //
    // - Add the selected item to the list of recorded tasks.
    // - Redisplay the list of recorded tasks.
    // - Reset the the drop-down list to the top item.

    handleMoreSelectorChanged: function () {
        'use strict';

        var itemIndex;
        var careTaskJoin;
        var selectedID;

        // Get the selected CareTaskMstr ID and add the item to the list of selections.

        selectedID = Number(adacare.careTaskRecordedEditor.$careTaskMstrMoreSelector.val());
        careTaskJoin = new adacare.careTaskRecordedEditor.CareTaskJoin(selectedID);
        careTaskJoin.StatusCode = adacare.careTaskRecordedEditor.COMPLETED_STATUS;
        itemIndex = adacare.careTaskRecordedEditor.addCareTaskJoinResultItem(careTaskJoin);

        adacare.careTaskRecordedEditor.displayOneSelectionItem(careTaskJoin, itemIndex);

        if (adacare.careTaskRecordedEditor.isMobile) {

            adacare.careTaskRecordedEditor.$careTaskDisplayDiv.listview("refresh"); // Tells jQueryMobile to refresh the page after building the drop-down list.
        }
        else {

            adacare.careTaskRecordedEditor.$careTaskDisplayDiv.accordion('refresh');
        }

        // Reset the drop-down list to the top item.

        adacare.careTaskRecordedEditor.$careTaskMstrMoreSelector.val(String(adacare.careTaskRecordedEditor.CARE_TASK_MSTR_NONE_ID));
    },

    //***************************************************************************************
    // Handle a user's status selection for an individual care tasks.

    handleCareTaskStatusChanged: function () {
        'use strict';

        var $this;
        var selectedStatusCode;
        var itemIndex;
        var editorCareTaskJoinResultList;

        $this = $(this);
        selectedStatusCode = Number($this.val());
        itemIndex = $this.data(adacare.careTaskRecordedEditor.DATA_KEY_INDEX);

        // Get the result list, convert it from string to an object, update the item within
        // the object, and then converti it back to a string for the server-side code.

        editorCareTaskJoinResultList = JSON.parse(adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val());
        editorCareTaskJoinResultList[itemIndex].StatusCode = selectedStatusCode;
        adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val(JSON.stringify(editorCareTaskJoinResultList));

        // Display the selected status icon in the header.

        adacare.careTaskRecordedEditor.displayHeaderIconAndNotes(itemIndex);
    },

    //***************************************************************************************
    // Handle a user's notes entry for an individual care tasks.

    handleCareTaskNotesChanged: function () {
        'use strict';

        var $this;
        var notes;
        var itemIndex;
        var editorCareTaskJoinResultList;

        $this = $(this);
        notes = $this.val();
        itemIndex = $this.data(adacare.careTaskRecordedEditor.DATA_KEY_INDEX);

        // Get the result list, convert it from string to an object, update the item within
        // the object, and then converti it back to a string for the server-side code.

        editorCareTaskJoinResultList = JSON.parse(adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val());
        editorCareTaskJoinResultList[itemIndex].Notes = notes;
        adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val(JSON.stringify(editorCareTaskJoinResultList));
    },

    //***************************************************************************************
    // Init the drop-down list of the CareTaskMstr records. This list is available for the
    // user to pick tasks that are not on the client's schedule.

    initMstrDropDownList: function () {
        'use strict';

        var i;

        this.$careTaskMstrMoreSelector.empty();
        $('<option />', { value: this.CARE_TASK_MSTR_NONE_ID, text: "More tasks..." }).appendTo(this.$careTaskMstrMoreSelector);

        for (i = 0; i < this.careTaskMstrList.length; i++) {

            $('<option />', { value: this.careTaskMstrList[i].ID, text: this.careTaskMstrList[i].Descrip }).appendTo(this.$careTaskMstrMoreSelector);
        }

        this.$careTaskMstrMoreSelector.off('change').on('change', adacare.careTaskRecordedEditor.handleMoreSelectorChanged);

        if (this.isMobile) {

            this.$careTaskMstrMoreSelector.selectmenu("refresh"); // Tells jQueryMobile to refresh the page after building the drop-down list.
        }
    },

    //***************************************************************************************
    // Add the given CareTaskJoin record to the result list.

    addCareTaskJoinResultItem: function (careTaskJoin) {
        'use strict';

        var editorCareTaskJoinResultList;
        var count;

        editorCareTaskJoinResultList = JSON.parse(adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val());
        count = editorCareTaskJoinResultList.length;
        editorCareTaskJoinResultList[count] = careTaskJoin;
        adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val(JSON.stringify(editorCareTaskJoinResultList));

        return count++;
    },

    //***************************************************************************************
    // Find the CareTaskJoin record for the given index.

    fetchCareTaskJoinResultItem: function (itemIndex) {
        'use strict';

        var editorCareTaskJoinResultList;
        var careTaskJoin;

        editorCareTaskJoinResultList = JSON.parse(adacare.careTaskRecordedEditor.$editorCareTaskJoinResultList.val());
        careTaskJoin = editorCareTaskJoinResultList[itemIndex];

        return careTaskJoin;
    },

    //***************************************************************************************
    // Find the given ID in the master list and return the CareTaskMstr record.

    fetchMstr: function (careTaskMstrID) {
        'use strict';

        var careTaskMstrItem = null;
        var i;

        for (i = 0; i < adacare.careTaskRecordedEditor.careTaskMstrList.length; i++) {

            if (adacare.careTaskRecordedEditor.careTaskMstrList[i].ID === careTaskMstrID) {

                careTaskMstrItem = adacare.careTaskRecordedEditor.careTaskMstrList[i];
                break;
            }
        }

        return careTaskMstrItem;
    }
};
