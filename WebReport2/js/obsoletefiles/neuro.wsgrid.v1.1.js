// Copyright 2009, 2010, 2011 by Neurosoftware, LLC.
//
// neuro.wsgrid.v1.1                Sandy Gettings              Revised 8/10/2011
//
// This code supports editing available hours. A week of schedules is displayed as a grid, and the user
// can turn slots in the grid on or off to represent the days and times she is working.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof (neuro) != "object") { throw new Error("neuro is already defined, but is not an object!"); }

if (!neuro.wsgrid) { neuro.wsgrid = {}; }
else { throw new Error("neuro.wsgrid is already defined!"); }

// Array of DayParm objects. This list is ued to store a set of parameters for each instance of
// the editor that has been initialized. The index into the array is the ID of the surrounding DIV.

neuro.wsgrid.DayParmArray = new Array();

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set a few parameters that apply to the entire page. Call this method first.

neuro.wsgrid.init = function (minPerSlot, scrollingDivID, scrollToMinute) {

    // Constants

    neuro.wsgrid.CSS_SELECTED = 'ui-selected';

    neuro.wsgrid.minPerSlot = minPerSlot;
    neuro.wsgrid.slotsPerHour = 60 / minPerSlot;
    neuro.wsgrid.scrollingDivID = scrollingDivID;
    neuro.wsgrid.scrollToMinute = scrollToMinute;
    neuro.wsgrid.MINUTES_IN_DAY = 24 * 60;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is the constructor for the DayParm object. Its purpose is to remember the info associated
// with each day's grid.

neuro.wsgrid.DayParm = function (dayNum) {

    this.dayNum = dayNum;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Given the day number as the index, return the corresponding DayParm. If it doesn't exist,
// then return null.

neuro.wsgrid.getDayParm = function (dayNum) {

    var DayParm;

    DayParm = neuro.wsgrid.DayParmArray[dayNum];

    return DayParm;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Init the grid for a single day. Call this method next, once for each day in the week.

neuro.wsgrid.initDay = function (dayNum, dayGridID, dayParmID, summaryID, availableOptID, reasonID, allDayOnButtID, allDayOffButtID, copyID, copyDayNumFrom) {

    var h, m, timeStr;
    var $dayGrid, $dayGridKids;
    var DayParm;

    DayParm = neuro.wsgrid.getDayParm(dayNum);

    if (DayParm === undefined) {
        DayParm = new neuro.wsgrid.DayParm(dayNum);
        neuro.wsgrid.DayParmArray[DayParm.dayNum] = DayParm;

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
        for (m = 0; m < neuro.wsgrid.MINUTES_IN_DAY; m += neuro.wsgrid.minPerSlot) {
            timeStr = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, m);
            $dayGrid.append('<li>' + timeStr + '</li>');
        }

        $dayGrid.selectable({
            stop: function () { neuro.wsgrid.handleStop(dayNum); }
        });
    }

    //$(window).load(function () { neuro.wsgrid.setScroll(); });

    // Bind events to functions.

    $('#' + allDayOnButtID).click(function () { neuro.wsgrid.handleAllDayOn(dayNum); });
    $('#' + allDayOffButtID).click(function () { neuro.wsgrid.handleAllDayOff(dayNum); });
    $('#' + availableOptID).change(function () { neuro.wsgrid.handleAvailableOpt(dayNum); });

    if (copyID !== '') {
        $('#' + copyID).click(function () { neuro.wsgrid.handleCopy(copyDayNumFrom, dayNum); });
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Redraw all grids.
//
// Use this method to display info passed in by the server-side caller.

neuro.wsgrid.redrawAllGrids = function () {

    var dayNum;

    for (dayNum = 0; dayNum < 7; dayNum++) {
        neuro.wsgrid.loadParameter(dayNum);
        neuro.wsgrid.processGrid(dayNum);
        neuro.wsgrid.processAvailableOpt(dayNum);
    }
    neuro.wsgrid.setScroll();
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the initial scroll setting on the surrounding Div.

neuro.wsgrid.setScroll = function () {

    var scrollIndex;
    var $dayGridKids, $parentElement, $scrollToElement, parentPosition, scrollToPosition;
    var $dayGrid;
    var DayParm;

    DayParm = neuro.wsgrid.getDayParm(0); // Grab any day
    $dayGrid = $('#' + DayParm.dayGridID);

    scrollIndex = Math.floor(neuro.wsgrid.scrollToMinute / neuro.wsgrid.minPerSlot);

    $dayGridKids = $dayGrid.children();
    $scrollToElement = $($dayGridKids[scrollIndex]);
    scrollToPosition = $scrollToElement.position();
    parentPosition = $dayGrid.position();
    var $junkparent = $scrollToElement.parent();
    var junkppos = $junkparent.position();
    var junkoh = $scrollToElement.outerHeight();
    var junksdheight = $('#' + neuro.wsgrid.scrollingDivID).outerHeight();
    var junkdgheight = $dayGrid.outerHeight();
    //$('#' + neuro.wsgrid.scrollingDivID).scrollTop(scrollToPosition.top - parentPosition.top);
    $('#' + neuro.wsgrid.scrollingDivID).scrollTop(junkoh * scrollIndex);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// This is executed when the user stops dragging the mouse across the grid. The selections in the 
// grid may have changed.

neuro.wsgrid.handleStop = function (dayNum) {

    neuro.wsgrid.processGrid(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Copy the selections from one grid to another grid.

neuro.wsgrid.handleCopy = function (dayFromNum, dayToNum) {

    var DayParmFrom, DayParmTo;
    var $dayGridFrom, $itemFrom, $itemFromList;
    var $dayGridTo, $itemTo, $itemToList;
    var itemIsSelected;
    var i;

    DayParmFrom = neuro.wsgrid.getDayParm(dayFromNum);
    DayParmTo = neuro.wsgrid.getDayParm(dayToNum);

    $dayGridFrom = $('#' + DayParmFrom.dayGridID);
    $itemFromList = $dayGridFrom.children();
    $dayGridTo = $('#' + DayParmTo.dayGridID);
    $itemToList = $dayGridTo.children();

    // Copy the selections from one day to the other.

    for (i = 0; i < $itemFromList.length; i++) {

        $itemFrom = $($itemFromList[i]);
        $itemTo = $($itemToList[i]);

        // If the "from" item is selected, also select the "to" item.

        itemIsSelected = $itemFrom.hasClass(neuro.wsgrid.CSS_SELECTED);
        $itemTo.removeClass(neuro.wsgrid.CSS_SELECTED);

        if (itemIsSelected) {
            $itemTo.addClass(neuro.wsgrid.CSS_SELECTED);
        }
    }

    // Copy other fields

    $('#' + DayParmTo.availableOptID).val($('#' + DayParmFrom.availableOptID).val());
    $('#' + DayParmTo.reasonID).val($('#' + DayParmFrom.reasonID).val());

    neuro.wsgrid.processGrid(dayToNum);
    neuro.wsgrid.processAvailableOpt(dayToNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Turn on all 24 hours in the given day's grid.

neuro.wsgrid.handleAllDayOn = function (dayNum) {

    var $dayGrid, $item, $itemList;
    var DayParm;
    var i;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);
    $itemList = $dayGrid.children();

    for (i = 0; i < $itemList.length; i++) {
        $item = $($itemList[i]);
        $item.removeClass(neuro.wsgrid.CSS_SELECTED);
        $item.addClass(neuro.wsgrid.CSS_SELECTED);
    }
    neuro.wsgrid.processGrid(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Clear the given day's grid.

neuro.wsgrid.handleAllDayOff = function (dayNum) {

    var $dayGrid, $item, $itemList;
    var DayParm;
    var i;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);
    $itemList = $dayGrid.children();

    for (i = 0; i < $itemList.length; i++) {
        $item = $($itemList[i]);
        $item.removeClass(neuro.wsgrid.CSS_SELECTED);
    }
    neuro.wsgrid.processGrid(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Handle a change to the "available" option.

neuro.wsgrid.handleAvailableOpt = function (dayNum) {

    neuro.wsgrid.processAvailableOpt(dayNum);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Enable/disable fields based on the "available" option.

neuro.wsgrid.processAvailableOpt = function (dayNum) {

    var DayParm;
    var $availableOpt, $reason, $allDayOnButt, $allDayOffButt, $dayGrid;
    var availableOpt;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
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
            neuro.wsgrid.handleAllDayOff(dayNum);
            $allDayOnButt.attr('disabled', true);
            $allDayOffButt.attr('disabled', true);
            $dayGrid.selectable("option", "disabled", true);
            break;

        case '1': // Off duty
            $reason.removeAttr('disabled');
            neuro.wsgrid.handleAllDayOff(dayNum);
            $allDayOnButt.attr('disabled', true);
            $allDayOffButt.attr('disabled', true);
            $dayGrid.selectable("option", "disabled", true);
            break;

        case '2': // Hours below
            $reason.removeAttr('disabled');
            $allDayOnButt.removeAttr('disabled');
            $allDayOffButt.removeAttr('disabled');
            $dayGrid.selectable("option", "disabled", false);
            break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Process the grid after any changes have been made. We figure out which slots were selected, and 
// display the selected blocks to the user, plus pass the selections to the server-side caller.
// Note that there may be more than one block of working time (say, morning and evening).

neuro.wsgrid.processGrid = function (dayNum) {

    var DayParm;
    var $dayGrid, $summary, $itemList, $item;
    var thisMinute, begMinute, endMinute;
    var summaryText = '', parmList = '';
    var itemIsSelected, withinSelected, i;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
    $dayGrid = $('#' + DayParm.dayGridID);
    $summary = $('#' + DayParm.summaryID);

    withinSelected = false;
    $itemList = $dayGrid.children();
    for (i = 0; i < $itemList.length; i++) {

        thisMinute = i * neuro.wsgrid.minPerSlot;
        $item = $($itemList[i]);
        itemIsSelected = $item.hasClass(neuro.wsgrid.CSS_SELECTED);

        // If the item is selected, then we add it to the parameter we pass back to
        // the server-side caller.

        if (itemIsSelected) {
            parmList = neuro.wsgrid.constructParameter(parmList, thisMinute);
        }

        // If we're transitioning between inside/outside a block of selected items,
        // we need to add the item to the current block, or terminate the current
        // block.

        if (withinSelected != itemIsSelected) {

            withinSelected = itemIsSelected;

            if (withinSelected) {
                begMinute = thisMinute;
            }
            else {
                endMinute = i * neuro.wsgrid.minPerSlot;
                summaryText = neuro.wsgrid.constructSummary(summaryText, begMinute, endMinute);
            }
        }
    }

    // If the selection ran all the way to the last time slot, we need to finish it up.

    if (withinSelected) {
        endMinute = 0; // 24 * 60; // Midnight
        summaryText = neuro.wsgrid.constructSummary(summaryText, begMinute, endMinute);
    }

    // Place the list of time slots in the summary display and the hidden parameter field
    // used by the server-side code.

    $summary.html(summaryText);
    neuro.wsgrid.setParameter(dayNum, parmList);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Construct the summary text for the given time range. This text is seen by the user.

neuro.wsgrid.constructSummary = function (summaryText, begMinute, endMinute) {

    var begString, endString;

    begString = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, begMinute);
    endString = adacare.lib.FormatTimeMinutesLocalized(adacare.lib.countryAbbr, endMinute);

    if (summaryText !== '') {
        summaryText += '<br />';
    }
    summaryText += begString + ' - ' + endString;

    return summaryText;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Construct the parameter text for the given minute. The parameter is eventually returned to the 
// server-side caller. It represents the current state of the day's selections.

neuro.wsgrid.constructParameter = function (parmList, thisMinute) {

    var minuteString;

    minuteString = thisMinute.toString();

    if (parmList !== '') {
        parmList += ' ';
    }
    parmList += minuteString;

    return parmList;
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Load the parameter text into the day's grid. The parameter consists of a list of the starting 
// minute for each slot in the day. Each number is separated by a space.

neuro.wsgrid.loadParameter = function (dayNum) {

    var DayParm;
    var parmText, parmList;
    var thisMinute;
    var $dayGrid, $item, $itemList;
    var slot, i;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
    parmText = $('#' + DayParm.dayParmID).val();
    parmList = parmText.split(' ');

    // Turn all the slots off, then turn on the slots indicated by the parameter list.

    neuro.wsgrid.handleAllDayOff(dayNum);

    $dayGrid = $('#' + DayParm.dayGridID);
    $itemList = $dayGrid.children();

    for (i = 0; i < parmList.length; i++) {
        if (parmList[i] !== '') {
            thisMinute = Number(parmList[i]);
            slot = thisMinute / neuro.wsgrid.minPerSlot;
            $item = $($itemList[slot]);
            $item.removeClass(neuro.wsgrid.CSS_SELECTED);
            $item.addClass(neuro.wsgrid.CSS_SELECTED);
        } 
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the given day's parameter. The parameter is passed to us preformatted.

neuro.wsgrid.setParameter = function (dayNum, parmList) {

    var DayParm;

    DayParm = neuro.wsgrid.getDayParm(dayNum);
    $('#' + DayParm.dayParmID).val(parmList);
};
