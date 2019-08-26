
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.SelectMenu.v1.0             Sandy Gettings                                      12/04/2014
//
// Implement jQuery's selectmenu UI for a list of staff records. Basically, a "SelectMenu" starts out
// as an ordinary <select> control, with jQuery-style enhancements. Then, we add our own enhancements
// for grouping and selecting staff.
//
// Revisions
//
// 2014-12-04 SG Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.SelectMenu) { adacare.SelectMenu = {}; }
else { throw new Error('adacare.SelectMenu is already defined!'); }

adacare.SelectMenu = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // We keep a list of the info for each SelectMenu on the page. The list is indexed by the ID of
    // the corresponding <select> control.

    infoList: [],

    InfoItem: function (
        controlID,                  // ID of the parent <select> control.
        groupListFromServer,        // A list of GroupItems for the menu.
        onChangeCallback           // Callback function to invoke upon change in selection.
        ) {
        'use strict';

        var group;
        var groupNum;

        this.$control = $('#' + controlID);
        this.onChangeCallback = onChangeCallback;

        this.groupList = [];

        for (groupNum = 0; groupNum < groupListFromServer.length; groupNum++) {

            group = new adacare.SelectMenu.Group(groupListFromServer[groupNum].title, groupListFromServer[groupNum].itemList);
            this.groupList[groupNum] = group;
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // This is the constructor for a Group. The basic <select> control allows groups of options, and
    // these object define each group in the SelectMenu.

    Group: function (title, itemList) {
        'use strict';

        var NONE_ID = null;
        var NONE_DESCRIP = '(none)';

        var groupItem;
        var itemText, itemValue;
        var itemNum;

        this.title = title;
        this.itemList = [];

        if (itemList.length > 0) {

            for (itemNum = 0; itemNum < itemList.length; itemNum++) {

                itemText = itemList[itemNum].text;
                itemValue = itemList[itemNum].value;
                groupItem = new adacare.SelectMenu.GroupItem(itemText, itemValue, false);
                this.itemList[itemNum] = groupItem;
            }
        }

            // Empty groups still get a disabled "none" item.

        else {
            groupItem = new adacare.SelectMenu.GroupItem(NONE_DESCRIP, NONE_ID, true);
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
    // Init a new SelectMenu. This function is called once for each menu when the page is first displayed.

    init: function (
        controlID,              // ID of the parent <select> control.
        selectedValue,          // The initial value of the selected item.
        groupListFromServer,    // A list of Groups & GroupItems for the menu; empty array [] if menu is already constructed.
        onChangeCallback        // Callback function to invoke upon change in selection.
        ) {
        'use strict';

        var infoItem;
        var $widget, $menuWidget;
        var widgetTop, widgetHeight, windowHeight;

        infoItem = new this.InfoItem(controlID, groupListFromServer, onChangeCallback);
        this.infoList[controlID] = infoItem;
        var junk1 = this.infoList.length; var junk2 = adacare.SelectMenu.infoList.length; // DEBUG
        this.constructMenu(infoItem);

        // Turn this <select> control into a jQuery selectmenu.

        infoItem.$control.selectmenu({

            change: function (event, ui) {

                var thisValue, thisText;

                // Put the selected value & text into the hidden elements given by the caller.

                thisValue = ui.item.value;
                thisText = ui.item.label;

                // If the caller gave us a callback function, execute it now.

                if (infoItem.onChangeCallback) {

                    infoItem.onChangeCallback(thisValue, thisText);
                }
            }
        });

        this.displaySelection(infoItem, selectedValue);

        // Some menus can be very long and extend past the bottom of the window. To clean this up, we make
        // the menu end at the bottom of the page, with scrolling.

        $widget = infoItem.$control.selectmenu('widget');
        $menuWidget = infoItem.$control.selectmenu('menuWidget');
        widgetTop = $widget.offset().top;
        widgetHeight = $widget.height();
        windowHeight = $(window).height();
        $menuWidget.css('max-height', windowHeight - widgetTop - widgetHeight - 10);
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

    updateGroup: function (controlID, selectedValue, groupNum, groupFromServer) {
        'use strict';

        var infoItem;
        var group;

        infoItem = this.infoList[controlID];
        group = new this.Group(groupFromServer.title, groupFromServer.itemList);
        infoItem.groupList[groupNum] = group;
        this.constructMenu(infoItem);
        this.displaySelection(infoItem, selectedValue);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Construct the menu within the given <select> control, using the given list of groups. If the list 
    // is empty, then the caller already constructed the <select> control and we don't need to do anything.
    //
    // These two cases are normally used as follows:
    //
    // - If the caller is using a simple, fixed menu (with no group headings?), then the group list should
    //   be passed as an empty array (e.g., groupList = []).
    //
    // - If the caller is using a dynamic menu that must be constructed at run-time (or a menu with group
    //   headers), then the group list should include the info for the complete menu.

    constructMenu: function (infoItem) {
        'use strict';

        var group, groupItem, $optionItem;
        var groupNum, itemNum;
        var $parentElem, $groupElem;

        if (infoItem.groupList.length > 0) {

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
                    $optionItem = $('<option>', { value: groupItem.value, text: groupItem.text });

                    if (groupItem.disabled) {

                        $optionItem.attr('disabled', true);
                    }

                    $parentElem.append($optionItem);
                }
            }
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the selected item.

    displaySelection: function (infoItem, selectedValue) {
        'use strict';

        //var selectedText = '';

        // Select the item, if any value is given.

        if (selectedValue) {

            infoItem.$control.val(selectedValue);                           // Set the value of the <select> element
            infoItem.$control.selectmenu('refresh');                        // Syncs the selectmenu with the <select> element
            //selectedText = infoItem.$control.selectmenu('widget').text();   // Gets the selected text from the selectmenu's button
        }

        //infoItem.$selectedText.val(selectedText);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Return the selected item's text.

    getSelectedText: function (controlID) {
        'use strict';

        var infoItem, selectedText;

        infoItem = this.infoList[controlID];
        selectedText = infoItem.$control.selectmenu('widget').text();

        return selectedText;
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Set selected value.

    setSelectedValue: function (controlID, selectedValue) {
        'use strict';

        var infoItem;

        infoItem = this.infoList[controlID];
        infoItem.$control.val(selectedValue);                           // Set the value of the <select> element
        infoItem.$control.selectmenu('refresh');                        // Syncs the selectmenu with the <select> element
    }
};
