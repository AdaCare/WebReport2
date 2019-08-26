// Copyright 2009, 2010, 2011, 2012 by Neurosoftware, LLC.
//
// neuro.aheditor.v1.5                Sandy Gettings              04/10/2012
//
// This code supports editing available hours. A week of schedules is displayed as a grid, and the user
// can turn slots in the grid on or off to represent the days and times she is working.
//
// Revisions
//
// 2015-02-05 SG Minor changes to ignore spaces in time entry. For example "4:00 p" resulted in 4:00am.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof (neuro) !== "object") { throw new Error("neuro is already defined, but is not an object!"); }

if (!neuro.aheditor) { neuro.aheditor = {}; }
else { throw new Error("neuro.aheditor is already defined!"); }

// Array of DayParm objects. This list is ued to store a set of parameters for each instance of
// the editor that has been initialized. The index into the array is the ID of the surrounding DIV.

neuro.aheditor.DayParmArray = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set a few parameters that apply to the entire page. Call this method first.

//neuro.aheditor.init = function (scrollingDivID, maxWeeks, minPerSlot, scrollToMinute, tabDivID, repeatWeeksID) {
neuro.aheditor.init = function (maxWeeks, minPerSlot, scrollToMinute, tabDivID, repeatWeeksID) {

    // Constants

    neuro.aheditor.MIDNIGHT_BEG_MINUTE = 0;         // Mindnight for the beginning time.
    neuro.aheditor.MIDNIGHT_END_MINUTE = 1440;      // Mindnight for the ending time (rather than 0).
    neuro.aheditor.MAX_TIME_ROWS = 5;               // Number of begin/end time pairs
    //neuro.aheditor.CSS_SELECTED = 'ui-selected';
    neuro.aheditor.CSS_DISABLED = 'disabled';
    neuro.aheditor.CSS_ROW = 'val_time';
    neuro.aheditor.CSS_ROW_ALT = 'val_time table_row_alt';
    neuro.aheditor.MINUTES_IN_DAY = 24 * 60;
    neuro.aheditor.maxDayNum = -1;
    //neuro.aheditor.scrollCurrent = 0;

    //neuro.aheditor.slotsPerHour = 60 / minPerSlot;
    //neuro.aheditor.scrollingDivID = scrollingDivID;
    neuro.aheditor.maxWeeks = maxWeeks;
    neuro.aheditor.minPerSlot = minPerSlot;
    neuro.aheditor.scrollToMinute = scrollToMinute;
    neuro.aheditor.tabDivID = tabDivID;
    neuro.aheditor.repeatWeeksID = repeatWeeksID;

    neuro.aheditor.handleRepeatWeeksChange();
    $('#' + tabDivID).unbind('tabsshow').bind('tabsshow', neuro.aheditor.handleTabShow);
    //$('#' + scrollingDivID).unbind('scroll').scroll(neuro.aheditor.handleScroll);
    $('#' + repeatWeeksID).unbind('change').change(neuro.aheditor.handleRepeatWeeksChange);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the constructor for the DayParm object. Its purpose is to remember the info associated
// with each day's grid.

neuro.aheditor.DayParm = function (dayNum) {

    this.dayNum = dayNum;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given the day number as the index, return the corresponding DayParm. If it doesn't exist,
// then return null.

neuro.aheditor.getDayParm = function (dayNum) {

    var DayParm;

    DayParm = neuro.aheditor.DayParmArray[dayNum];

    return DayParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the grid for a single day. Call this method next, once for each day in the week.

neuro.aheditor.initDay = function (dayNum, dayGridID, dayParmID, summaryID, availableOptID, reasonID, allDayOnButtID, allDayOffButtID, copyID, copyDayNumFrom) {

    var TIMEPICKER_TEMPLATE = '<li class="{0}"><input type="text" class="{0}" maxlength="6" size="7" id="{1}">' + '-' + '<input type="text" class="{0}" maxlength="6" size="7" id="{2}"></li>';
    //var TIMEPICKER_TEMPLATE = '<li class="{0}"><input type="text" class="val_time" maxlength="6" size="7" id="{1}">' + '-' + '<input type="text" class="val_time" maxlength="6" size="7" id="{2}"></li>';
    //var TIMEPICKER_TEMPLATE = '<input type="text" class="val_time" maxlength="6" size="7" id="{1}">' + '-' + '<input type="text" class="val_time" maxlength="6" size="7" id="{2}">';
    //var TIMEPICKER_TEMPLATE = '<input type="text" class="val_time" maxlength="6" size="7" id="{0}">' + '<br />thru<br />' + '<input type="text" class="val_time" maxlength="6" size="7" id="{1}">';
    //var TIMEPICKER_TEMPLATE = '<select id="{0}"></select>' + '<br />thru<br />' + '<select id="{1}"></select>';
    //var CLONE_TEMPLATE = '<br />thru<br />';
    // <option value="1184">Able, Kelley T</option>

    //var h, m, timeStr;
    var $dayGrid, $dayGridKids;
    var DayParm;
    var timepickerBegId, timepickerEndId;
    var rowCss;
    var row;

    neuro.aheditor.maxDayNum = (dayNum > neuro.aheditor.maxDayNum ? dayNum : neuro.aheditor.maxDayNum); // Remember how many days we're working with
    DayParm = neuro.aheditor.getDayParm(dayNum);

    if (DayParm === undefined) {
        DayParm = new neuro.aheditor.DayParm(dayNum);
        neuro.aheditor.DayParmArray[DayParm.dayNum] = DayParm;

        DayParm.dayParmID = dayParmID;
        DayParm.dayGridID = dayGridID;
        DayParm.summaryID = summaryID;
        DayParm.allDayOnButtID = allDayOnButtID;
        DayParm.allDayOffButtID = allDayOffButtID;
        DayParm.availableOptID = availableOptID;
        DayParm.reasonID = reasonID;
    }

    // Construct the day's grid and make it selectable. We only do this when we
    // initially load the grid. If it's already built, just leave it alone.

    $dayGrid = $('#' + dayGridID);
    $dayGridKids = $($dayGrid.children());

    if ($dayGridKids.length === 0) {

        for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

            timepickerBegId = neuro.aheditor.timepickerID(dayGridID, row, true);
            timepickerEndId = neuro.aheditor.timepickerID(dayGridID, row, false);

            var junk1 = row % 2;
            rowCss = (row % 2 ? neuro.aheditor.CSS_ROW_ALT : neuro.aheditor.CSS_ROW);
            //$dayGrid.append('<li>' + TIMEPICKER_TEMPLATE.replace('{0}', timepickerBegId).replace('{1}', timepickerEndId) + '</li>');
            //$dayGrid.append('' + TIMEPICKER_TEMPLATE.replace('{0}', rowCss).replace('{1}', timepickerBegId).replace('{2}', timepickerEndId) + '');
            $dayGrid.append(TIMEPICKER_TEMPLATE.replace(/\{0\}/g, rowCss).replace(/\{1\}/g, timepickerBegId).replace(/\{2\}/g, timepickerEndId));
        }

        $dayGrid.find(':input').change(function (e) { neuro.aheditor.handleChange(e, dayNum); });
    }

    //$(window).load(function () { neuro.aheditor.setScroll(); });

    // Bind events to functions.

    $('#' + allDayOnButtID).click(function () { neuro.aheditor.handleAllDayOn(dayNum); });
    $('#' + allDayOffButtID).click(function () { neuro.aheditor.handleAllDayOff(dayNum); });
    $('#' + availableOptID).change(function () { neuro.aheditor.handleAvailableOpt(dayNum); });

    if (copyID !== '') {
        $('#' + copyID).click(function () { neuro.aheditor.handleCopy(copyDayNumFrom, dayNum); });
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Return the ID of the given nth begin/end timepicker.

neuro.aheditor.timepickerID = function (dayGridID, n, isBeg) {

    var TIMEPICKER_ID_BEG_TEMPLATE = '{0}-beg{1}';
    var TIMEPICKER_ID_END_TEMPLATE = '{0}-end{1}';

    var template, id;

    template = (isBeg ? TIMEPICKER_ID_BEG_TEMPLATE : TIMEPICKER_ID_END_TEMPLATE);
    id = template.replace('{0}', dayGridID).replace('{1}', n.toString());

    return id;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Redraw all grids.
//
// Use this method to display info passed in by the server-side caller.

neuro.aheditor.redrawAllGrids = function () {

    var dayNum;

    for (dayNum = 0; dayNum <= neuro.aheditor.maxDayNum; dayNum++) {
        neuro.aheditor.loadParameter(dayNum);
        neuro.aheditor.processGrid(dayNum);
        neuro.aheditor.processAvailableOpt(dayNum);
    }

    //neuro.aheditor.setScroll();
    adacare.lib.stylePage(); // Ensure buttons are styled when re-enabled
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the event handler for when the user clicks on a tab. We need this to reset the scroll on
// the grid within the tab. Without this, the scroll seems to reset itself to zero each time a tab
// selection is chnaged.

neuro.aheditor.handleTabShow = function (e, ui) {

    //neuro.aheditor.syncScroll();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change in the "repeat weeks" control. We'll enable only the necessary tabs for each
// week of the grid.

neuro.aheditor.handleRepeatWeeksChange = function () {

    var tabDivID;
    var $tabDiv;
    var week, maxWeeks, repeatWeeks;

    // Get the tab control, and always select the first tab.

    tabDivID = neuro.aheditor.tabDivID;
    $tabDiv = $('#' + tabDivID);
    $tabDiv.tabs('option', 'active', 0);

    // Disable any weeks after the desired number.

    maxWeeks = neuro.aheditor.maxWeeks;
    repeatWeeks = Number($('#' + neuro.aheditor.repeatWeeksID).val());

    for (week = maxWeeks; week > 1; week--) {

        if (week <= repeatWeeks) {
            $tabDiv.tabs('enable', week - 1);
        }
        else {
            $tabDiv.tabs('disable', week - 1);
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is executed when the user changes a time field.

neuro.aheditor.handleChange = function (e, dayNum) {

    var elem, $elem;
    var elemVal, elemTime, elemMinute;

    elem = e.target;
    $elem = $(elem);
    //elemVal = adacare.lib.stringTrim($elem.val());
    elemVal = $elem.val().replace(/\s+/g, ''); // Remove all embedded spaces, too, not just leading & trailing

    // Round the time down to the slot size.

    if (elemVal != '' && adacare.validateTime(elemVal, elem)) {
        elemTime = adacare.lib.parseTime(elemVal);
        elemMinute = elemTime.getHours() * 60 + elemTime.getMinutes();
        elemMinute = Math.floor(elemMinute / neuro.aheditor.minPerSlot) * neuro.aheditor.minPerSlot;
        $elem.val(neuro.aheditor.minutesToTimeStr(elemMinute));
    }

    neuro.aheditor.processGrid(dayNum);

    //    if (!adacare.validateTime($elem.val(), elem)) {
    //        $elem.focus();
    //    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is executed when the user stops dragging the mouse across the grid. The selections in the 
// grid may have changed.

//neuro.aheditor.handleStop = function (dayNum) {

//    neuro.aheditor.processGrid(dayNum);
//};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copy the selections from one grid to another grid.

neuro.aheditor.handleCopy = function (dayFromNum, dayToNum) {

    var DayParmFrom, DayParmTo;
    var $dayGridFrom, $dayGridTo;
    var timepickerFromBegId, timepickerFromEndId, timepickerToBegId, timepickerToEndId;
    var $timepickerFromBeg, $timepickerFromEnd, $timepickerToBeg, $timepickerToEnd;
    var row;

    /// OLD
    //var $dayGridFrom, $itemFrom, $itemFromList;
    //var $dayGridTo, $itemTo, $itemToList;
    //var itemIsSelected;
    //var i;

    DayParmFrom = neuro.aheditor.getDayParm(dayFromNum);
    DayParmTo = neuro.aheditor.getDayParm(dayToNum);

    $dayGridFrom = $('#' + DayParmFrom.dayGridID);
    $dayGridTo = $('#' + DayParmTo.dayGridID);

    // Look at the pair of timepickers for each row, and copy the the "from" pair
    // into the "to" pair.

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerFromBegId = neuro.aheditor.timepickerID(DayParmFrom.dayGridID, row, true);
        timepickerFromEndId = neuro.aheditor.timepickerID(DayParmFrom.dayGridID, row, false);

        timepickerToBegId = neuro.aheditor.timepickerID(DayParmTo.dayGridID, row, true);
        timepickerToEndId = neuro.aheditor.timepickerID(DayParmTo.dayGridID, row, false);

        $timepickerFromBeg = $('#' + timepickerFromBegId);
        $timepickerFromEnd = $('#' + timepickerFromEndId);

        $timepickerToBeg = $('#' + timepickerToBegId);
        $timepickerToEnd = $('#' + timepickerToEndId);

        $timepickerToBeg.val(adacare.lib.stringTrim($timepickerFromBeg.val()));
        $timepickerToEnd.val(adacare.lib.stringTrim($timepickerFromEnd.val()));
    }

    /*** OLD
    $dayGridFrom = $('#' + DayParmFrom.dayGridID);
    $itemFromList = $dayGridFrom.children();
    $dayGridTo = $('#' + DayParmTo.dayGridID);
    $itemToList = $dayGridTo.children();

    // Copy the selections from one day to the other.

    for (i = 0; i < $itemFromList.length; i++) {

    $itemFrom = $($itemFromList[i]);
    $itemTo = $($itemToList[i]);

    // If the "from" item is selected, also select the "to" item.

    itemIsSelected = $itemFrom.hasClass(neuro.aheditor.CSS_SELECTED);
    $itemTo.removeClass(neuro.aheditor.CSS_SELECTED);

    if (itemIsSelected) {
    $itemTo.addClass(neuro.aheditor.CSS_SELECTED);
    }
    }
    ***/

    // Copy other fields

    $('#' + DayParmTo.availableOptID).val($('#' + DayParmFrom.availableOptID).val());
    $('#' + DayParmTo.reasonID).val($('#' + DayParmFrom.reasonID).val());

    neuro.aheditor.processGrid(dayToNum);
    neuro.aheditor.processAvailableOpt(dayToNum);
    adacare.lib.stylePage(); // Ensure buttons are styled when re-enabled
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Turn on all 24 hours in the given day's grid.

neuro.aheditor.handleAllDayOn = function (dayNum) {

    var $dayGrid;
    //var  $item, $itemList;
    var DayParm;
    var timepickerBegId, timepickerEndId;
    var $timepickerBeg, $timepickerEnd;
    var row;
    //var i;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        // Set the first pair of times to all day, and clear all other pairs of times.

        if (row == 0) {

            $timepickerBeg.val('12:00a');
            $timepickerEnd.val('12:00a');
        }
        else {
            $timepickerBeg.val('');
            $timepickerEnd.val('');
        }
    }

    /*** OLD
    $itemList = $dayGrid.children();

    for (i = 0; i < $itemList.length; i++) {
    $item = $($itemList[i]);
    $item.removeClass(neuro.aheditor.CSS_SELECTED);
    $item.addClass(neuro.aheditor.CSS_SELECTED);
    }
    ***/

    neuro.aheditor.processGrid(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Clear the given day's grid.

neuro.aheditor.handleAllDayOff = function (dayNum) {

    var $dayGrid;
    //var $item, $itemList;
    var DayParm;
    //var i;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        $timepickerBeg.val('');
        $timepickerEnd.val('');
    }

    /*** OLD
    $itemList = $dayGrid.children();

    for (i = 0; i < $itemList.length; i++) {
    $item = $($itemList[i]);
    $item.removeClass(neuro.aheditor.CSS_SELECTED);
    }
    ***/

    neuro.aheditor.processGrid(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change to the "available" option.

neuro.aheditor.handleAvailableOpt = function (dayNum) {

    neuro.aheditor.processAvailableOpt(dayNum);
    adacare.lib.stylePage(); // Ensure buttons are styled when re-enabled
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Enable/disable fields based on the "available" option.
//
// Note: The caller should also call adacare.lib.stylePage() immediate after, so any buttons that
// were enabled will be correctly styled. We don't make the call from within this function, because
// stylePage is slow and gets called far too many times that way.

neuro.aheditor.processAvailableOpt = function (dayNum) {

    var DayParm;
    var $availableOpt, $reason, $allDayOnButt, $allDayOffButt, $dayGrid;
    var availableOpt;
    var enableTimepickers;
    var row;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    $availableOpt = $('#' + DayParm.availableOptID);
    $reason = $('#' + DayParm.reasonID);
    $allDayOnButt = $('#' + DayParm.allDayOnButtID);
    $allDayOffButt = $('#' + DayParm.allDayOffButtID);
    $dayGrid = $('#' + DayParm.dayGridID);

    availableOpt = $availableOpt.val();

    switch (availableOpt) {

        case '0': // Office hours
            $reason.val('');
            $reason.attr('disabled', true);
            $reason.addClass(neuro.aheditor.CSS_DISABLED);
            neuro.aheditor.handleAllDayOff(dayNum);
            $allDayOnButt.attr('disabled', true);
            $allDayOffButt.attr('disabled', true);
            //$dayGrid.selectable("option", "disabled", true);
            enableTimepickers = false;
            break;

        case '1': // Off duty
            $reason.removeAttr('disabled');
            $reason.removeClass(neuro.aheditor.CSS_DISABLED);
            neuro.aheditor.handleAllDayOff(dayNum);
            $allDayOnButt.attr('disabled', true);
            $allDayOffButt.attr('disabled', true);
            //$dayGrid.selectable("option", "disabled", true);
            enableTimepickers = false;
            break;

        case '2': // Hours below
            $reason.removeAttr('disabled');
            $reason.removeClass(neuro.aheditor.CSS_DISABLED);
            $allDayOnButt.removeAttr('disabled');
            $allDayOffButt.removeAttr('disabled');
            //$dayGrid.selectable("option", "disabled", false);
            enableTimepickers = true;
            break;
    }

    if (enableTimepickers) {
        $dayGrid.removeClass(neuro.aheditor.CSS_DISABLED);
    }
    else {
        $dayGrid.addClass(neuro.aheditor.CSS_DISABLED);
    }

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        if (enableTimepickers) {
            $timepickerBeg.removeAttr('disabled');
            $timepickerBeg.removeClass(neuro.aheditor.CSS_DISABLED);
            $timepickerEnd.removeAttr('disabled');
            $timepickerEnd.removeClass(neuro.aheditor.CSS_DISABLED);
        }
        else {
            $timepickerBeg.attr('disabled', true);
            $timepickerBeg.addClass(neuro.aheditor.CSS_DISABLED);
            $timepickerEnd.attr('disabled', true);
            $timepickerEnd.addClass(neuro.aheditor.CSS_DISABLED);
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Process the list of time pairs after any changes have been made. We figure out which times have
// been entered, and display the selected blocks to the user, plus pass the selections to the server-
// side caller. Note that there may be more than one block of working time (say, morning and evening).

neuro.aheditor.processGrid = function (dayNum) {

    var DayParm;
    var $dayGrid, $summary;
    var timepickerBegId, timepickerEndId;
    var $timepickerBeg, $timepickerEnd;
    var timepickerBegText, timepickerEndText;
    var timepickersBothValid;
    var begTime, endTime;
    var begMinute, endMinute, tmpMinute;
    var begMinuteList = new Array(neuro.aheditor.MAX_TIME_ROWS), endMinuteList = new Array(neuro.aheditor.MAX_TIME_ROWS);
    var summaryText = '', parmList = '';
    var row, i;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);
    $summary = $('#' + DayParm.summaryID);

    // Look at the pair of timepickers for each row.

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        timepickerBegText = adacare.lib.stringTrim($timepickerBeg.val());
        timepickerEndText = adacare.lib.stringTrim($timepickerEnd.val());

        // Calculate the times & minutes if the user's input is valid. Otherwise, we'll
        // set then as "undefined."

        begTime = ((timepickerBegText != '' && adacare.validateTime($timepickerBeg.val(), $timepickerBeg[0])) ? adacare.lib.parseTime(timepickerBegText) : undefined);
        endTime = ((timepickerEndText != '' && adacare.validateTime($timepickerEnd.val(), $timepickerEnd[0])) ? adacare.lib.parseTime(timepickerEndText) : undefined);

        begMinute = (begTime ? begTime.getHours() * 60 + begTime.getMinutes() : undefined);
        endMinute = (endTime ? endTime.getHours() * 60 + endTime.getMinutes() : undefined);
        endMinute = (endMinute == 0 ? neuro.aheditor.MIDNIGHT_END_MINUTE : endMinute); // Adjust for ending at the next day's midnight.

        // If both times in the pair are valid, we clean things up a bit.

        timepickersBothValid = (begTime && endTime);

        if (timepickersBothValid) {

            // Make sure the user didn't enter times in backwards order.

            if (begMinute > endMinute) {

                tmpMinute = begMinute;
                begMinute = endMinute;
                endMinute = tmpMinute;

                // Fix the user's input fields

                //$timepickerBeg.val(adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, begMinute));
                //$timepickerEnd.val(adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, endMinute));
            }

            // Look for overlapping pairs. These aren't a good idea, so we clean them up.

            for (i = 0; i < row; i++) {

                // Case #1: This pair is surrounded by an earlier pair. Discard this pair.

                if (begMinute >= begMinuteList[i] && endMinute <= endMinuteList[i]) {
                    begMinute = undefined;
                    endMinute = undefined;
                }

                    // Case #2: This pair surrounds an earlier pair. Discard the earlier pair.

                else if (begMinute < begMinuteList[i] && endMinute > endMinuteList[i]) {
                    begMinuteList[i] = undefined;
                    endMinuteList[i] = undefined;
                }

                    // Case #3: This pair surrounds an earlier beginning time. Truncate the overlap portion.

                else if (begMinute < begMinuteList[i] && endMinute > begMinuteList[i]) {
                    endMinute = begMinuteList[i];
                }

                    // Case #4: This pair surrounds an earlier ending time. Truncate the overlap portion.

                else if (begMinute < endMinuteList[i] && endMinute > endMinuteList[i]) {
                    begMinute = endMinuteList[i];
                }
            }
        }

        begMinuteList[row] = begMinute;
        endMinuteList[row] = endMinute;
    }

    // Sort the rows.

    for (row = 1; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        if (begMinuteList[row] !== undefined && endMinuteList[row] !== undefined) {

            for (i = 0; i < row; i++) {

                if (begMinuteList[i] !== undefined && endMinuteList[i] !== undefined) {

                    if (begMinuteList[row] < begMinuteList[i]) {
                        tmpMinute = begMinuteList[i];
                        begMinuteList[i] = begMinuteList[row];
                        begMinuteList[row] = tmpMinute;

                        tmpMinute = endMinuteList[i];
                        endMinuteList[i] = endMinuteList[row];
                        endMinuteList[row] = tmpMinute;
                    }
                }
            }
        }
    }

    // Display the cleaned-up minutes.

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        $timepickerBeg.val(neuro.aheditor.minutesToTimeStr(begMinuteList[row]));
        $timepickerEnd.val(neuro.aheditor.minutesToTimeStr(endMinuteList[row]));

        // Only complete pairs are displayed in the summary.

        if (begMinuteList[row] !== undefined && endMinuteList[row] !== undefined) {

            summaryText = neuro.aheditor.constructSummary(summaryText, begMinuteList[row], endMinuteList[row]);
            parmList = neuro.aheditor.constructParameter(parmList, begMinuteList[row], endMinuteList[row]);
        }
    }

    // Place the list of time slots in the summary display and the hidden parameter field
    // used by the server-side code.

    $summary.html(summaryText);
    neuro.aheditor.setParameter(dayNum, parmList);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert minutes to a time string. Odinarily, we would use a standard library function for this
// purpose. However, this code supports both midnight today and midnight tomorrow, and the library
// function only supports midnight today.

neuro.aheditor.minutesToTimeStr = function (minutes) {

    var result = '';

    if (minutes !== undefined) {
        if (minutes == neuro.aheditor.MIDNIGHT_END_MINUTE) {
            result = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, neuro.aheditor.MIDNIGHT_BEG_MINUTE);
        }
        else {
            result = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, minutes);
        }
    }

    return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Construct the summary text for the given time range. This text is seen by the user.

neuro.aheditor.constructSummary = function (summaryText, begMinute, endMinute) {

    var begString, endString;

    begString = neuro.aheditor.minutesToTimeStr(begMinute);
    endString = neuro.aheditor.minutesToTimeStr(endMinute);

    if (summaryText !== '') {
        summaryText += '<br />';
    }

    summaryText += begString + ' - ' + endString;

    return summaryText;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Construct the parameter text for the given pair of minutes. The parameters are eventually returned
// to the server-side caller. It represents the current state of the day's selections.
//
// The parameters are formatted as pairs of integers, representing the starting and ending minute of
// the time of day.

neuro.aheditor.constructParameter = function (parmList, begMinute, endMinute) {

    var begString, endString;

    begString = begMinute.toString();
    endString = endMinute.toString();

    if (parmList !== '') {
        parmList += ' ';
    }

    parmList += begString + ' ' + endString;

    return parmList;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Load the parameter text into the day's grid. The parameter consists of a list of the starting 
// and ending minute pair for each block of time in the day. Each number is separated by a space.

neuro.aheditor.loadParameter = function (dayNum) {

    var DayParm;
    var parmText, parmList;
    var timepickerBegId, timepickerEndId;
    var $timepickerBeg, $timepickerEnd;
    var begMinute, endMinute;
    var begIndex, endIndex;
    var row;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    parmText = $('#' + DayParm.dayParmID).val();
    parmList = parmText.split(' ');

    for (row = 0; row < neuro.aheditor.MAX_TIME_ROWS; row++) {

        timepickerBegId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, true);
        timepickerEndId = neuro.aheditor.timepickerID(DayParm.dayGridID, row, false);

        $timepickerBeg = $('#' + timepickerBegId);
        $timepickerEnd = $('#' + timepickerEndId);

        begIndex = row * 2;
        endIndex = begIndex + 1;

        if (parmList.length > endIndex) {

            begMinute = parmList[begIndex];
            endMinute = parmList[endIndex];

            $timepickerBeg.val(neuro.aheditor.minutesToTimeStr(begMinute));
            $timepickerEnd.val(neuro.aheditor.minutesToTimeStr(endMinute));
        }
        else {
            $timepickerBeg.val('');
            $timepickerEnd.val('');
        }
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the given day's parameter. The parameter is passed to us preformatted.

neuro.aheditor.setParameter = function (dayNum, parmList) {

    var DayParm;

    DayParm = neuro.aheditor.getDayParm(dayNum);
    $('#' + DayParm.dayParmID).val(parmList);
};
