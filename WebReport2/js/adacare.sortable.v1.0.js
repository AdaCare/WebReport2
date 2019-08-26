// Copyright 2012 by Neurosoftware, LLC.
//
// adacare.sortable.v1.0.js
// Sandy Gettings
// Revised 09/19/2012
//
// This is a library that pops up detail for a marketing activity record with JavaScript.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.sortable) { adacare.sortable = {}; }
else { throw new Error('adacare.sortable is already defined!'); }

adacare.sortable = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Init a jQuery "sortable" list. The user can drag child elements up & down the list, and see the
    // sorted results.
    //
    // Parameters:
    // -- The ID of the parent DIV element. Each child (and not any deeper children) becomes a sortable
    //    element.
    // -- The ID of the element that holds a list of the IDs of the sorted elements. The ASP.Net server
    //    code will see this as a string: "id1,id2,id3".

    Init: function (parentDivID, resultsFieldID) {

        var $parentDiv, $resultsField;

        $parentDiv = $('#' + parentDivID);
        $resultsField = $('#' + resultsFieldID);

        $parentDiv.sortable(
        {
            //containment: 'parent',
            axis: 'y',
            cursor: 'n-resize',
            opacity: 0.6,
            stop: function (event, ui) { adacare.sortable.SaveResults($parentDiv, $resultsField); }
        }
        );

        // Init the results at the beginning, too, so that it can never be empty.

        adacare.sortable.SaveResults($parentDiv, $resultsField);
    },

    // Save the results in the given hidden field. The array is a list of IDs of the sorted
    // elements. The server will see this as a string.

    SaveResults: function ($parentDiv, $resultsField) {

        var resultsArray;

        resultsArray = $parentDiv.sortable('toArray');
        $resultsField.val(resultsArray);
    }
};
