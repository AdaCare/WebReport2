
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.SelectMenu.v1.5             Sandy Gettings                                      12/04/2014
//
// Implement jQuery's selectmenu UI for a list of staff records. Basically, a "SelectMenu" starts out
// as an ordinary <select> control, with jQuery-style enhancements. Then, we add our own enhancements
// for grouping and selecting staff.
//
// Revisions
//
// 2014-12-04 SG Original code.
// 2014-12-13 SG Improvements to work better with (despite!) UpdatePanels.
// 2015-02-21 SG Changed to appendTo the <form> element. See if this helps some users.
// 2015-03-20 SG Fixed problem with resizing the menu when the user has a very small browser window.
// 2015-03-23 SG Fine-tuning to ensure the menu has a minimum height.
// 2017-07-13 SG Removed changes to display the triangle without overflowing the text, for jQuery UI 1.12.1

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
        this.resetScroll = true;

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

        infoItem = new this.InfoItem(controlID, groupListFromServer, onChangeCallback);
        this.infoList[controlID] = infoItem;
        this.constructMenu(infoItem);

        // Turn this <select> control into a jQuery selectmenu.

        infoItem.$control.selectmenu({

            change: function (event, ui) {

                var thisValue, thisText;

                // Put the selected value & text into the hidden elements given by the caller.

                thisValue = ui.item.value;
                thisText = ui.item.label;
                infoItem.$control.selectmenu('close');

                // If the caller gave us a callback function, execute it now.

                if (infoItem.onChangeCallback) {

                    infoItem.onChangeCallback(thisValue, thisText);
                }
            },

            open: function (event, ui) {

                var $menuWidget;

                // Resize the height of the menu to fit the window. It would be nice to do this just once
                // when the selectmenu is initialized or refreshed, but this way is better: If the user
                // adjusts the browser window's size or scroll, the selectmenu is automatically resized
                // to match.

                adacare.SelectMenu.fitToWindowHeight(infoItem);

                // The code below fixes an awkward problem with scrolling. The problem appears in Chrome, Firefox,  
                // and Safari, but not IE. It works like this:
                //
                // When the user opens a visit for editing in the Calendar, there is a selectmenu for the visit's
                // staff. The user may scroll down the list and close editing dialog. By default, the next time
                // the dialog is opened, the scroll is the same as before, which looks kind of crummy. So, the
                // code below always resets the scroll when the selectmenu is opened after any significan change.
                //
                // Would it be better to simply reinitialize the selectmenu from scratch? Perhaps, but that doesn't
                // work in Firefox for some reason.

                if (infoItem.resetScroll) {

                    $menuWidget = infoItem.$control.selectmenu('menuWidget');
                    $menuWidget.scrollTop(0);
                    infoItem.resetScroll = false;
                }
            }
        });

        this.displaySelection(infoItem, selectedValue);
        this.fixWidth(infoItem);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Some menus can be very long and extend past the bottom of the window. To clean this up, we make
    // the menu end at the bottom of the browser window, with scrolling.

    fitToWindowHeight: function (infoItem) {
        'use strict';

        var MENU_MIN_HEIGHT_PX = 200;   // Forces a minimum height for the menu.
        var MENU_BOTTOM_MARGIN_PX = 10; // Leave a little space at the bottom of the window; looks nicer.

        var $widget, $menuWidget;
        var widgetTop, widgetHeight, windowHeight, newMenuHeight;
        var windowScrollTop;
        var zIndexOfParent;

        $widget = infoItem.$control.selectmenu('widget');
        $menuWidget = infoItem.$control.selectmenu('menuWidget');
        widgetTop = $widget.offset().top;
        widgetHeight = $widget.height();
        windowHeight = $(window).height();
        windowScrollTop = $(window).scrollTop();
        newMenuHeight = Math.max(MENU_MIN_HEIGHT_PX, windowHeight + windowScrollTop - widgetTop - widgetHeight - MENU_BOTTOM_MARGIN_PX);
        $menuWidget.css('max-height', newMenuHeight);

        // Here's a problem: When a selectmenu on a dialog is initialized, the z-Index is wrong and the 
        // selectmenu appears *behind* the dialog. So, we need to fix the z-index here (unless we can find
        // a better solution).
        //
        // Unfortunately, this solution increments the z-index each time. Harmless, but sloppy.

        //var junkc = infoItem.$control; var junkcz = junkc.css('z-index');
        //var junkw = $menuWidget; var junkwz = junkw.css('z-index');
        //var junkp = $menuWidget.parent(); var junkpz = junkp.css('z-index');

        zIndexOfParent = Number($menuWidget.parent().css('z-index'));
        $menuWidget.parent().css('z-index', zIndexOfParent + 1); // BUG: Increments self z-index on each call; mostly harmless
        $menuWidget.scrollTop(0);
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO: This should be fixed in jQuery UI. Retest and eliminate this code if so.
    //
    // Fix the width of the selectmenu's button to allow for the triangle icon.

    fixWidth: function (infoItem) {
        'use strict';

        // 2017-07-13 SG Not needed for jQuery UI 1.12.1

        //var $widget, widgetWidth;

        //$widget = infoItem.$control.selectmenu('widget');
        //widgetWidth = $widget.outerWidth();
        //$widget.outerWidth(widgetWidth + 32); 
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update a single group in the control. Other groups are left as-is. This is used when you just want 
    // to replace the items in one group in the control, leasving the other info in the group (and the
    // other groups) as-is. For example, if you switch clients, you want to display a different list for
    // the group of previous staff, but the group of all staff stays the same.
    //
    // Parameters:
    //
    // 1. The ID of the <select> control.
    // 2. The index of the contrl's groups, 0, 1, 2, ...
    // 3. The new group info.

    updateGroup: function (controlID, groupNum, newItemList) {
        'use strict';

        var infoItem;
        var oldGroup, newGroup;

        infoItem = this.infoList[controlID];
        oldGroup = infoItem.groupList[groupNum];
        newGroup = new this.Group(oldGroup.title, newItemList);
        infoItem.groupList[groupNum] = newGroup;
        this.constructMenu(infoItem);
        //this.refresh(controlID); // 2017-07-13 SG: Refresh is slow, and it's already called later when the calling function invokes setSelectedValue().
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

        infoItem.resetScroll = true;

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
        }
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Set selected value.

    setSelectedValue: function (controlID, selectedValue) {
        'use strict';

        var infoItem;

        infoItem = this.infoList[controlID];
        infoItem.$control.val(selectedValue);                           // Set the value of the <select> element
        this.refresh(controlID);                                        // Syncs the selectmenu with the <select> element
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
    // Refresh the given menu.

    refresh: function (controlID) {
        'use strict';

        var infoItem;

        infoItem = this.infoList[controlID];
        infoItem.$control.selectmenu('refresh');
        this.fixWidth(infoItem);
    }
};
