// Copyright 2012 by Neurosoftware, LLC.
//
// adacare.marketingActivityDetailPopup.v1.0.js
// Sandy Gettings
// Revised 08/23/2012
//
// This is a library that pops up detail for a marketing activity record with JavaScript.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof (adacare) !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.marketingActivityDetailPopup) { adacare.marketingActivityDetailPopup = {}; }
else { throw new Error('adacare.marketingActivityDetailPopup is already defined!'); }

adacare.marketingActivityDetailPopup = {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Open the "details" popup for a client or staff. We'll fill in a just little bit of info on the
    // popup here. Then, the caller will request more details via an async web service call.

    OpenDetails: function (surroundDivID, buddyElemID, mapButtID, mapUrl, closeBoxID) {

        var $buddyElem = $('#' + buddyElemID);
        var $dialogSurroundDiv = $('#' + surroundDivID);
        var $closeBox = $('#' + closeBoxID);
        var buddyOffset;

        // Define the close box click to close the popup

        $closeBox.unbind().click(function () {
            adacare.marketingActivityDetailPopup.CloseDetails(surroundDivID);
        });

        // Set up the map button.

        adacare.lib.initMapButton(mapButtID, 'Map', 'No Map', mapUrl);

        // Display the popup. We place the popup beside the buddy element by appending
        // to its parent. Note that the parent must be something suitable, like a DIV.
        // This method works in both the Calendar and Schedule Visits pages.

        buddyOffset = $buddyElem.offset(); // Is position() better?
        $buddyElem.parent().append($dialogSurroundDiv); // DEBUG

        $dialogSurroundDiv.css({
            'position': 'absolute',
            top: -5,
            left: $buddyElem.outerWidth() - 6
        });

        $dialogSurroundDiv.show();

        // Make the popup draggable.

        $dialogSurroundDiv.draggable({
            opacity: 0.7,
            cursor: 'move'
        });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Close the popup.

    CloseDetails: function (surroundDivID) {

        var $dialogSurroundDiv;

        $dialogSurroundDiv = $('#' + surroundDivID);
        $dialogSurroundDiv.hide();

    }
}
