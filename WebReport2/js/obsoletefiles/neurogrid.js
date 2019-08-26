// Copyright 2009 by Neurosoftware, LLC.
//
// neuro.grid                Sandy Gettings              Revised 4/28/09
//
// How it all works:
// Given a grid ROWS by COLS in dimension, we turn on or off the
// child slots of the grid by the user's mouse gestures.
// A click on a child inverts the slot's on/off state. This is the "starting" slot.
// A shift-click elsewhere in the grid extends the slot's state to all the other
// slots in between (as a rectangle).

var neuro;
if (!neuro) neuro = {};
else if (typeof (neuro) != "object")
    throw new Error("neuro is already defined, but is not an object!");

if (!neuro.grid) neuro.grid = {};
else throw new Error("neuro.grid is already defined!");

// One-time initialization.

//debugger;
neuro.grid.isTracking = false;              // true = Tracking in progress (after the first mouse click), false = nope
neuro.grid.trackingOnOff = false;           // Remembers if we're turning elements on or off as we're tracking
neuro.grid.gridList = new Array();          // List of grids
neuro.grid.gridIndex = -1;                  // Grid index (into gridList[]) we're currently tracking
neuro.grid.trackStart = -1;                 // Starting child slot for tracking mouseover
neuro.grid.trackPrev = -1;                  // Child slot of previous mouseover'ed child
//neuro.grid.msgNorm = "Click the start and end of a block of time.";
//neuro.grid.msgActive = "Click the end of the block of time. Hold the Shift key to select whole hours.";

///////////////////////////////////////////////////////////////////////////
// Grid initialization:
// Given the element ID of the grid, set up the event handlers
// for all of the child elements in the grid.
// This method supports any number of grids on the same page.

neuro.grid.init = function(gridID, outerbodyID, msgID, bodyClassCover, rows, cols, rowHeight, colWidth, slotClassBase, slotClassY, slotClassN, scrollTop) {

    var i;
    var gridElem;
    var child;
    var twin, twinID, twinHeight, twinWidth, twinPosition;
    var gridIndex, gridInfo;
    var coverID;

    //debugger;

    // Save the info about the grid. New grids are added to the
    // list; duplicate (which we really don't expect) replace
    // the original information.

    if ((gridIndex = neuro.grid.getGridIndex(gridID)) == -1) {
        gridIndex = neuro.grid.gridList.length;
        gridInfo = new Object();
    }
    else {
        gridInfo = neuro.grid.gridList[gridIndex];
    }

    gridInfo = new neuro.grid.Info(gridID, outerbodyID, msgID, rows, cols, rowHeight, colWidth,
        slotClassBase, slotClassY, slotClassN, bodyClassCover);
    neuro.grid.gridList[gridIndex] = gridInfo;

    gridElem = document.getElementById(gridID);
    if (gridElem) {

        // Fetch each of the children.

        for (i = 0; i < gridInfo.numSlots; i++) {
            child = neuro.grid.getChild(gridID, i);

            if (child) {

                // Add properties to the child element. These are saved here for
                // convenient use later.

                child.gridID = gridID;                              // ID of the parent grid
                child.slot = i;                                     // This child's slot within the grid
                child.colTop = Math.floor(i / rows) * rows;         // Slot of topmost child in this column.
                child.colBot = child.colTop + rows - 1;             // Slot of bottom child in this column.
            }
        }
        neuro.grid.saveStateAll(gridIndex);
        //neuro.grid.showGrid(gridIndex);
        //neuro.grid.showMsg(gridID, neuro.grid.isTracking ? neuro.grid.msgActive : neuro.grid.msgNorm);

        coverID = gridID + "_cover";
        $('#' + gridID).append('<div id="' + coverID + '"></div>');
        $('#' + coverID).addClass(bodyClassCover).attr("gridID", gridID);
        $('#' + coverID).height($('#' + gridID).height());
        $('#' + coverID).width($('#' + gridID).width());
        $('#' + coverID).bind("click", neuro.grid.onClickCover);

        // Set the initial scroll, so the window shows the desired hour at the top.
        // This is better than always starting the display at midnight.

        outerbodyElem = document.getElementById(gridInfo.outerbodyID);
        outerbodyElem.scrollTop = scrollTop;
    }
    else {
        throw new Error("Sorry, but I can't find a grid named \"" + gridID + "\"");
    }
}

///////////////////////////////////////////////////////////////////////////
// Constructor for Info object.

neuro.grid.Info = function(gridID, outerbodyID, msgID, rows, cols, rowHeight, colWidth,
    slotClassBase, slotClassY, slotClassN, bodyClassCover) {

    this.gridID = gridID;
    this.outerbodyID = outerbodyID;
    this.msgID = msgID;
    this.rows = rows;
    this.cols = cols;
    this.rowHeight = rowHeight;
    this.colWidth = colWidth;
    this.numSlots = rows * cols;
//    this.gridClassNorm = gridClassNorm;
//    this.gridClassActive = gridClassActive;
    this.slotClassBase = slotClassBase;
    this.slotClassY = slotClassY;
    this.slotClassN = slotClassN;
    this.bodyClassCover = bodyClassCover;
    this.prevSlot = -1;
    this.prevState = false;

}

///////////////////////////////////////////////////////////////////////////
// Process mousedown on the DIV covering the grid.

neuro.grid.onClickCover = function(e) {

    var gridID, gridIndex;
    var targetOffset, top, left;
    var grid;
    var child, childID;
    var prevSlot, thisSlot;
    var newState;

    targetOffset = $('#' + e.target.id).offset();
    top = e.pageY - targetOffset.top;
    left = e.pageX - targetOffset.left;
    gridID = this.gridID;
    gridIndex = neuro.grid.getGridIndex(gridID);

    if (neuro.grid.inbounds(gridIndex, top, left)) {
        slot = neuro.grid.mapCoordToSlot(gridIndex, top, left);

        // Get the child element we clicked on.

        childID = neuro.grid.getChildId(gridID, slot);
        child = neuro.grid.getChild(gridID, slot);

        if (!e.shiftKey || neuro.grid.prevSlot == -1 || neuro.grid.gridIndex != gridIndex) {

            // Normal click - flip state of this slot only.
            // BTW, shift-click on the very first click (an error), just ignores the shift.

            neuro.grid.gridIndex = gridIndex;
            newState = !$('#' + childID).hasClass(neuro.grid.gridList[gridIndex].slotClassY);

            // Change state of the child, and remember this as the new "previous".
            neuro.grid.childAnyState(child, newState);
            neuro.grid.gridList[gridIndex].prevSlot = child.slot;
            neuro.grid.gridList[gridIndex].prevState = newState;
        }
        else {

            // Set the state of all of the slots from the previous click to this slot
            // to match the previous click's slot.

            prevSlot = neuro.grid.gridList[gridIndex].prevSlot;
            newState = neuro.grid.gridList[gridIndex].prevState;
            neuro.grid.fillRectangle(gridIndex, prevSlot, child.slot, newState);
        }
    }

    return false; // Cancels event propagation.
}

///////////////////////////////////////////////////////////////////////////
// Fill a rectangle with the new state.

neuro.grid.fillRectangle = function(gridIndex, begSlot, endSlot, newState) {

    var begRowCol, endRowCol;
    var r, c, rowStep, colStep;
    var thisSlot, child;
    var gridID = neuro.grid.gridList[gridIndex].gridID;

    begRowCol = neuro.grid.mapSlotToRowCol(gridIndex, begSlot);
    endRowCol = neuro.grid.mapSlotToRowCol(gridIndex, endSlot);

    rowStep = (begRowCol.row <= endRowCol.row) ? +1 : -1;
    colStep = (begRowCol.col <= endRowCol.col) ? +1 : -1;

    for (r = begRowCol.row; r != endRowCol.row + rowStep; r += rowStep) {
        for (c = begRowCol.col; c != endRowCol.col + colStep; c += colStep) {
            thisSlot = neuro.grid.mapRowColToSlot(gridIndex, r, c);
            child = neuro.grid.getChild(gridID, thisSlot);
            neuro.grid.childAnyState(child, newState);
        }
    }
}

///////////////////////////////////////////////////////////////////////////
// Restore the state of the child element to its original on/off state.

neuro.grid.childRestoreState = function(child) {

    var gridIndex = neuro.grid.gridIndex;

    neuro.grid.childAnyState(child, child.savedState);
}

///////////////////////////////////////////////////////////////////////////
// Set the state of the child element to the on/off state from the caller.

neuro.grid.childAnyState = function(child, newState) {

    var gridIndex = neuro.grid.gridIndex;
    var newClass;

    newClass = (newState)
        ? neuro.grid.gridList[gridIndex].slotClassY
        : neuro.grid.gridList[gridIndex].slotClassN;

    $('#' + child.id).removeClass(neuro.grid.gridList[gridIndex].slotClassY)
    $('#' + child.id).removeClass(neuro.grid.gridList[gridIndex].slotClassN)
    $('#' + child.id).addClass(newClass)
}

///////////////////////////////////////////////////////////////////////////
// Get the child for the given parent and its row/col.

neuro.grid.getChild = function(gridID, childSlot) {

    var child, childId;

    childId = neuro.grid.getChildId(gridID, childSlot);
    child = document.getElementById(childId);
    if (!child) throw new Error("neuro.grid.getChild: No child found at slot #" + childSlot + "!");
    return child;
}

///////////////////////////////////////////////////////////////////////////
// Construct the ID for the given parent and its child's row/col.

neuro.grid.getChildId = function(gridID, childSlot) {

    var result;

    result = gridID + "_" + childSlot;
    return result;
}

///////////////////////////////////////////////////////////////////////////
// Save the state of all children in the grid.

neuro.grid.saveStateAll = function(gridIndex) {

    var slotClassY;
    var currentState;
    var gridID, child, i;

    gridID = neuro.grid.gridList[gridIndex].gridID;
    slotClassY = neuro.grid.gridList[gridIndex].slotClassY

    for (i = 0; i < neuro.grid.gridList[gridIndex].numSlots; i++) {
        child = neuro.grid.getChild(gridID, i);
        currentState = $('#' + child.id).hasClass(slotClassY);
        child.savedState = currentState;
    }
}

///////////////////////////////////////////////////////////////////////////
// Given the grid element ID, return it's index into gridList[].

neuro.grid.getGridIndex = function(gridID) {

    var i;

    for (i = 0; i < neuro.grid.gridList.length; i++) {
        if (neuro.grid.gridList[i].gridID == gridID) {
            return i;
        }
    }
    return -1;
}

///////////////////////////////////////////////////////////////////////////
// Send the grid back to the server to be saved.

neuro.grid.saveGridToServer = function(gridID) {

    var websvcResult;

    neuro.grid.showMsg(gridID, "Saving changes...");
    websvcResult = Cal.neuro.gridWebService.Saveneuro.grid(gridID, neuro.grid.saveGridToServer_OnComplete, OnWSRequestFailed);
}

neuro.grid.saveGridToServer_OnComplete = function(results) {

    var gridID;

    if (results) {
        if (neuro.grid.getGridIndex(results) > -1) {
            gridID = results;
            neuro.grid.showMsg(gridID, gridID + " saved.");
        }
        else {
            throw new Error("neuro.grid.saveGridToServer: neuro.grid.gridIndex = " + neuro.grid.gridIndex);
        }
    }
    else {
        throw new Error("neuro.grid.saveGridToServer: results after web service call are null.");
    }
}

// Generic web service error handler.

function OnWSRequestFailed(error) {
    alert("Error: " + error.get_message() + "/r/n" +
            "Stack Trace: " + error.get_stackTrace() + "/r/n" +
            "Status Code: " + error.get_statusCode() + "/r/n" +
            "Exception Type: " + error.get_exceptionType() + "/r/n" +
            "Timed Out: " + error.get_timedOut());
}

///////////////////////////////////////////////////////////////////////////
// Show the grid with the appropriate style.

//neuro.grid.showGrid = function(gridIndex) {

//    var grid;
//    grid = document.getElementById(neuro.grid.gridList[gridIndex].gridID);
//    if (grid) {
//        grid.className = neuro.grid.isTracking
//            ? neuro.grid.gridList[gridIndex].gridClassActive
//            : neuro.grid.gridList[gridIndex].gridClassNorm;
//    }
//    else {
//        throw new Error("neuro.grid.showGrid: Grid #" + gridIndex.toString + " can't be found.");
//    }
//}

///////////////////////////////////////////////////////////////////////////
// Display a message on the grid.

neuro.grid.showMsg = function(gridID, msg) {

    var gridIndex;
    var msgElem;

    gridIndex = neuro.grid.getGridIndex(gridID);
    if (gridIndex != -1) {
        msgElem = document.getElementById(neuro.grid.gridList[gridIndex].msgID);
        if (msgElem) msgElem.innerText = msg;
    }
    else {
        throw new Error("Cannot find grid ID '" + gridID + "'");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Test to see if a location is within a grid.

neuro.grid.inbounds = function(gridIndex, top, left) {

    var gridHeight, gridWidth;
    var result;

    gridHeight = neuro.grid.gridList[gridIndex].rows * neuro.grid.gridList[gridIndex].rowHeight;
    gridWidth = neuro.grid.gridList[gridIndex].cols * neuro.grid.gridList[gridIndex].colWidth;

    result = ((top >= 0 && top < gridHeight) && (left >= 0 && left < gridWidth));
    return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a slot number to the row and column. (Each row is one slot high, and each column is one
// slot wide.)

neuro.grid.mapSlotToRowCol = function(gridIndex, slot) {

    var slotRowCol = new Object();
    var rows; 
    
    rows = neuro.grid.gridList[gridIndex].rows;
    slotRowCol.row = slot % rows;
    slotRowCol.col = Math.floor(slot / rows);

    return slotRowCol;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map a row and column to a slot number.

neuro.grid.mapRowColToSlot = function(gridIndex, r, c) {

    var slot;
    var rows; 
    
    rows = neuro.grid.gridList[gridIndex].rows;
    slot = c * rows + r;
    return slot;
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Map an element's coordinates to a slot number.

neuro.grid.mapCoordToSlot = function(gridIndex, top, left) {

    var rows, rowHeight, colWidth;
    var row, col, slot;

    rows = neuro.grid.gridList[gridIndex].rows;
    rowHeight = neuro.grid.gridList[gridIndex].rowHeight;
    colWidth = neuro.grid.gridList[gridIndex].colWidth;
    row = Math.floor(top / rowHeight);
    col = Math.floor(left / colWidth);
    slot = col * rows + row;

    return slot;
}

