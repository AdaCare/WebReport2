
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.StaffSelect.v1.0             Sandy Gettings                                      12/04/2014
//
// Implement jQuery's StaffSelect UI for a list of staff records. Basically, a "StaffSelect" starts out
// as an ordinary <select> control, with jQuery-style enhancements. Then, we add our own enhancements
// for grouping and selecting staff.
//
// Revisions
//
// 2014-12-04 SG Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.StaffSelect) { adacare.StaffSelect = {}; }
else { throw new Error('adacare.StaffSelect is already defined!'); }

adacare.StaffSelect = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constants

    UNASSIGNED_ID: -1,
    NONE_ID: -2,
    NONE_DESCRIP: '(none)',

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // We keep a list of the info for each StaffSelect on the page. The list is indexed by the ID of
    // the corresponding <select> control.

    infoList: [],

    InfoItem: function (
        controlID,                  // ID of the parent <select> control.
        bindToDetailButtonID,       // A button the is enabled/disabled if a staff other than "unassigned" is selected.
        selectedValueID,            // The hidden field where the value of the selected item is kept.
        groupListFromServer         // A list of GroupItems for the menu.
        ) {
        'use strict';

        var group;
        var groupNum;

        this.$control = $('#' + controlID);
        this.$bindToDetailButton = (bindToDetailButtonID ? $('#' + bindToDetailButtonID) : null);
        this.$selectedValue = $('#' + selectedValueID);

        this.groupList = [];

        for (groupNum = 0; groupNum < groupListFromServer.length; groupNum++) {

            group = new adacare.StaffSelect.Group(groupListFromServer[groupNum].title, groupListFromServer[groupNum].itemList);
            this.groupList[groupNum] = group;
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the constructor for a Group. The basic <select> control allows groups of options, and
    // these object define each group in the StaffSelect.

    Group: function (title, itemList) {
        'use strict';

        var groupItem;
        var itemText, itemValue;
        var itemNum;

        this.title = title;
        this.itemList = [];

        if (itemList.length > 0) {

            for (itemNum = 0; itemNum < itemList.length; itemNum++) {

                itemText = itemList[itemNum].text;
                itemValue = itemList[itemNum].value;
                groupItem = new adacare.StaffSelect.GroupItem(itemText, itemValue, false);
                this.itemList[itemNum] = groupItem;
            }
        }
        else {
            groupItem = new adacare.StaffSelect.GroupItem(adacare.StaffSelect.NONE_DESCRIP, adacare.StaffSelect.NONE_ID, true);
            this.itemList[0] = groupItem;
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the constructor for a single GroupItem within a group. Each item corresponds to an <option>
    // element with the <select> control.

    GroupItem: function (text, value, disabled) {
        'use strict';

        this.text = text;
        this.value = value;
        this.disabled = disabled;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init a new StaffSelect. This function is called once for each menu when the page is first displayed.

    init: function (
        controlID,                  // ID of the parent <select> control.
        bindToDetailButtonID,       // A button the is enabled/disabled if a staff other than "unassigned" is selected.
        selectedValueID,            // The hidden field where the value of the selected item is kept.
        groupListFromServer         // A list of GroupItems for the menu.
        ) {
        'use strict';

        var infoItem;

        infoItem = new this.InfoItem(controlID, bindToDetailButtonID, selectedValueID, groupListFromServer);
        this.infoList[controlID] = infoItem;
        this.displayControl(infoItem);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update a single group in the control. Other groups are left as-is. This s used when you just want 
    // to replace one group in the control. For example, if you switch clients, you want to display a
    // different list for the group of previous staff, but the group of all staff stays teh same.
    //
    // Parameters:
    //
    // 1. The ID of the <select> control.
    // 2. The index of the contrl's groups, 0, 1, 2, ...
    // 3. The new group info.

    updateGroup: function (controlID, groupNum, groupFromServer) {
        'use strict';

        var infoItem;
        var group;

        infoItem = this.infoList[controlID];
        group = new this.Group(groupFromServer.title, groupFromServer.itemList);
        infoItem.groupList[groupNum] = group;
        this.displayControl(infoItem);

        //this.displaySelection(infoItem);
        infoItem.$control.selectmenu('refresh');
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the given control. Any items already in the control are removed.

    displayControl: function (infoItem) {
        'use strict';

        var group, groupItem,$optionItem;
        var groupNum, itemNum;
        var $parentElem, $groupElem;
        //var selectedValue;

        // Remove any existing items in the control.

        infoItem.$control.empty();

        for (groupNum = 0; groupNum < infoItem.groupList.length; groupNum++) {

            group = infoItem.groupList[groupNum];

            // Add the group title, if any. When we add the list of <option> items later,
            // we'll say that the parent element is either this option group (if given),
            // or the <select> element (if no group given).

            if (group.title) {

                $groupElem = $('<optgroup>', { label: group.title });
                $parentElem = $groupElem;
                infoItem.$control.append($groupElem);
            }
            else {

                $parentElem = infoItem.$control;
            }

            // Construct the option list, surrounded by the group.

            for (itemNum = 0; itemNum < group.itemList.length; itemNum++) {

                groupItem = group.itemList[itemNum];
                //$parentElem.append($('<option>', { value: groupItem.value, text: groupItem.text }));
                $optionItem = $('<option>', { value: groupItem.value, text: groupItem.text });

                if (groupItem.disabled) {

                    $optionItem.attr('disabled', true);
                }

                $parentElem.append($optionItem);
            }
        }

        this.displaySelection(infoItem);

        // Turn this into a jQuery selectmenu.

        infoItem.$control.selectmenu({
            change: function (event, ui) {

                var thisValue;

                thisValue = infoItem.$control.val();
                infoItem.$selectedValue.val(thisValue);
                adacare.StaffSelect.enableButton(infoItem, thisValue);
            }
        });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the selected item.

    displaySelection: function (infoItem) {
        'use strict';

        var selectedValue;

        // Select the item, if any value is given.

        selectedValue = infoItem.$selectedValue.val();

        if (selectedValue) {

            infoItem.$control.val(selectedValue);
        }

        // Init and enable the button, if given.

        if (infoItem.$bindToDetailButton) {

            infoItem.$bindToDetailButton.button();
            this.enableButton(infoItem, selectedValue);
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Enable/disable the button we're bound to, if any.

    enableButton: function (infoItem, selectedValue) {
        'use strict';

        var enabled;

        if (infoItem.$bindToDetailButton) {

            enabled = (selectedValue && Number(selectedValue) !== this.UNASSIGNED_ID);
            infoItem.$bindToDetailButton.button("option", "disabled", !enabled); // Using jQuery button widget
        }
    }
};
