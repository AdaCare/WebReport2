// Copyright 2014 by Neurosoftware, LLC.
//
// neuro.geopos.v1.2.js
// Sandy Gettings
//
// This is a library of geopositioning functions for mobile devices.
//
// Revisions
//
// 2014-01-12 Reorganized.
// 2014-04-14 Improvements for watchdog timer.
// 2014-06-14 Moved icon URLs to neuro.map.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof neuro !== 'object') {
    throw new Error('neuro is already defined, but is not an object!');
}

if (!neuro.GeoPos) { neuro.GeoPos = {}; }
else { throw new Error('neuro.GeoPos is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////

neuro.GeoPos = {

    // Constants for fetching geoposition.

    MAX_AGE_MS: 0,                      // Maximum age of cached geoposition. Must be shorter than consecutive "getPostion" calls.
    GET_POSITION_TIMEOUT_MS: 10000,     // Timeout used for navigator.geolocation methods

    // Constants and properties for watchdog timer. Some devices simply hang when asked for their
    // geoposition. A watchdog "unhangs" the software.

    WATCHDOG_TIMEOUT_MS: 12000,         // Timeout used for our own watchdog
    WATCHDOG_TIMEOUT_ERROR_CODE: -1,    // Error code for our own watchdog
    watchdogError: { code: -1 },
    watchPositionWatchdogTimerID: 0,

    parentCallback: null,

    // Is this obsolete (use company radius)?
    SUFFICIENT_ACCURACY: 50,            // Sufficient accuracy (meters) for early exit from getBestPosition()

    // 2014-06-14 Moved to neuro.map
    // Icon for the client's location.

    //ICON_CLIENT_URL: 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-orange_1.png', // TODO: Move this to library
    //ICON_CLIENT_WIDTH: 20,
    //ICON_CLIENT_HEIGHT: 29,

    // Icon for the "person" holding the device.

    //ICON_GPS_PERSON_URL: '/Mobile/images/gpsperson.png',
    //ICON_GPS_PERSON_WIDTH: 13,
    //ICON_GPS_PERSON_HEIGHT: 32,

    // Icons for the circles around the client's "close enough" bullseye and the person's device accuracy.

    //ICON_GPS_ACCURACY_URL: '/Mobile/images/gpsaccuracyring.png', // Tip: Create animated GIF with http://gifmaker.me/
    //ICON_GPS_BULLSEYE_URL: '/Mobile/images/gpsbullseyering.png',
    //ICON_NO_SHADOW_URL: '/Mobile/images/mapiconnoshadow.gif',

    getBestPositionParentCallback: null,
    getBestPositionCounterID: null,
    getBestPositionMaxCount: 0,
    getBestPositionDisplayLoadingMsg: false,
    getBestPositionPositionObject: null,

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Return whether the caller has geolocation capability. Always test this before using any 
    // geolocation methods.

    hasCapability: function () {
        'use strict';

        return ((navigator.geolocation) ? true : false);
    },

    // Same as above, with two additions:
    // - Set the geoData status if failed.
    // - Invoke the given callback function if given.

    hasCapabilityOrExit: function (parentCallback) {
        'use strict';

        var hasCap;

        hasCap = this.hasCapability();

        if (!hasCap) {

            // Execute the parent's callback function

            if (parentCallback) {
                parentCallback();
            }
        }

        return hasCap;
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Define class for GeoData. We'll normally have two instances, one for simple position, and another
// for the "best" position.

neuro.GeoPos.GeoData = function () {
    'use strict';

    this.positionCount = 0;
    this.position = null;
    this.positionErrorCode = 0;
    this.statusText = 'Uninitialized';
    this.isValid = false;
    this.watchPositionID = 0;
};

neuro.GeoPos.GeoData.prototype.positionErrorMessage = function () {
    'use strict';

    var message = '';

    switch (this.positionErrorCode) {

        case -1: message = 'GPS device timeout'; break; // Our internal timeout
        case 0: message = ''; break; // No error
        case 1: message = 'You denied permission'; break;
        case 2: message = 'Position is not available'; break;
        case 3: message = 'Timed out waiting for position'; break;
        default: message = 'Unknown error code ' + this.positionErrorCode; break;
    }

    return message;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch the device's position asynchronously, and execute the callback function when complete.

neuro.GeoPos.GeoData.prototype.getPosition = function (parentCallback) {
    'use strict';

    var thisInstance = this; // Put "this" in local variable for callbacks. Doesn't work otherwise.

    thisInstance.isValid = false;
    thisInstance.position = null;

    neuro.GeoPos.parentCallback = (parentCallback ? parentCallback : null);

    if (neuro.GeoPos.hasCapabilityOrExit(parentCallback)) {

        // Programmer's note: The success and failure functions need to be invoked within anonymous
        // functions. Otherwise, "this" will be null within the target function. Don't understand why.

        navigator.geolocation.getCurrentPosition(function (position) { thisInstance.getPositionSuccessCallBack(position); },
            function (error) { thisInstance.getPositionFailCallBack(error); },
        { enableHighAccuracy: true, maximumAge: neuro.GeoPos.MAX_AGE_MS, timeout: neuro.GeoPos.GET_POSITION_TIMEOUT_MS });
    }
};

neuro.GeoPos.GeoData.prototype.getPositionSuccessCallBack = function (position) {
    'use strict';

    this.positionCount++;
    this.positionErrorCode = 0;
    this.statusText = 'Ready';
    this.isValid = true;
    this.position = position;

    // Execute the parent's callback function

    if (neuro.GeoPos.parentCallback) {
        neuro.GeoPos.parentCallback();
    }
};

neuro.GeoPos.GeoData.prototype.getPositionFailCallBack = function (error) {
    'use strict';

    this.positionCount++;
    this.positionErrorCode = error.code;
    //this.statusText = 'Fail - ' + error.code + ' - ' + this.positionErrorMessage();
    this.statusText = 'Failed, ' + this.positionErrorMessage();
    this.isValid = false;
    this.position = null;

    // Execute the parent's callback function

    if (neuro.GeoPos.parentCallback) {
        neuro.GeoPos.parentCallback();
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Watch the geoposition, and execute the callback function each iteration.

neuro.GeoPos.GeoData.prototype.watchPosition = function (parentCallback) {
    'use strict';

    var thisInstance = this; // Put "this" in local variable for callbacks. Doesn't work otherwise.

    thisInstance.isValid = false;
    thisInstance.position = null;

    neuro.GeoPos.parentCallback = (parentCallback ? parentCallback : null);

    if (neuro.GeoPos.hasCapabilityOrExit(parentCallback)) {

        // Programmer's note: The success and failure functions need to be invoked within anonymous
        // functions. Otherwise, "this" will be null within the target function.

        neuro.GeoPos.watchPositionWatchdogTimerID = setTimeout(function () { thisInstance.watchPositionFailCallBack(neuro.GeoPos.watchdogError); }, neuro.GeoPos.WATCHDOG_TIMEOUT_MS);

        thisInstance.watchPositionID = navigator.geolocation.watchPosition(function (position) { thisInstance.watchPositionSuccessCallBack(position); },
            function (error) { thisInstance.watchPositionFailCallBack(error); },
            { enableHighAccuracy: true, maximumAge: neuro.GeoPos.MAX_AGE_MS, timeout: neuro.GeoPos.GET_POSITION_TIMEOUT_MS });
    }
};

neuro.GeoPos.GeoData.prototype.watchPositionSuccessCallBack = function (position) {
    'use strict';

    var thisInstance = this; // Put "this" in local variable for callbacks. Doesn't work otherwise.

    this.positionCount++;
    this.positionErrorCode = 0;
    this.statusText = 'Ready';
    this.isValid = true;
    this.position = position;

    // Cancel watchdog timer and restart it.

    clearTimeout(neuro.GeoPos.watchPositionWatchdogTimerID);
    neuro.GeoPos.watchPositionWatchdogTimerID = setTimeout(function () { thisInstance.watchPositionFailCallBack(neuro.GeoPos.watchdogError); }, neuro.GeoPos.WATCHDOG_TIMEOUT_MS);

    // Execute the parent's callback function

    if (neuro.GeoPos.parentCallback) {
        neuro.GeoPos.parentCallback();
    }

    // Restart the watchdog timer.

    //neuro.GeoPos.watchPositionWatchdogTimerID = setTimeout(function () { thisInstance.watchPositionFailCallBack(neuro.GeoPos.watchdogError); }, neuro.GeoPos.WATCHDOG_TIMEOUT_MS);
};

neuro.GeoPos.GeoData.prototype.watchPositionFailCallBack = function (error) {
    'use strict';

    //this.clearTimeout(this.watchPositionWatchdogTimerID); // Cancel watchdog timer

    this.positionCount++;
    this.positionErrorCode = error.code;
    this.statusText = 'Fail - ' + error.code + ' - ' + this.positionErrorMessage();
    this.isValid = false;
    this.position = null;

    // Execute the parent's callback function

    if (neuro.GeoPos.parentCallback) {
        neuro.GeoPos.parentCallback();
    }
};

neuro.GeoPos.GeoData.prototype.clearWatch = function () {
    'use strict';

    clearTimeout(neuro.GeoPos.watchPositionWatchdogTimerID);    // Cancel watchdog timer
    navigator.geolocation.clearWatch(this.watchPositionID);     // Cancel the navigator.watchPosition timer
    this.statusText = 'Stopped';
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Get the "best of N" positions.
// Idea: Should we have some kind of timeout in case this takes too long?

neuro.GeoPos.GeoData.prototype.getBestPosition = function (maxCount, parentCallback, displayLoadingMsg, counterID) {
    'use strict';

    var myGeoDataTemp = new neuro.GeoPos.GeoData();
    var thisInstance = this; // Put "this" in local variable for callbacks. Doesn't work otherwise.

    neuro.GeoPos.getBestPositionParentCallback = (parentCallback ? parentCallback : null);
    neuro.GeoPos.getBestPositionCounterID = counterID;
    neuro.GeoPos.getBestPositionMaxCount = maxCount;
    neuro.GeoPos.getBestPositionDisplayLoadingMsg = !!(displayLoadingMsg);

    // Display the "loading" graphic with a countdown.

    if (neuro.GeoPos.getBestPositionDisplayLoadingMsg) {
        $.mobile.loading('show', { text: (neuro.GeoPos.getBestPositionMaxCount - myGeoDataTemp.positionCount), textVisible: true });
    }

    myGeoDataTemp.watchPosition(function () { myGeoDataTemp.getBestPositionCallBack(thisInstance); });
};

// When this function is called, "this" refers to a temporary GeoData object (the one we're using
// the watchPosition() method on), and "parentGeoData" is the original caller's object.

neuro.GeoPos.GeoData.prototype.getBestPositionCallBack = function (parentGeoData) {
    'use strict';

    var watchdogFailed;

    watchdogFailed = (this.positionErrorCode === neuro.GeoPos.WATCHDOG_TIMEOUT_ERROR_CODE);

    // Display the "loading" graphic with a countdown.

    if (neuro.GeoPos.getBestPositionDisplayLoadingMsg) {
        $.mobile.loading('show', { text: (neuro.GeoPos.getBestPositionMaxCount - this.positionCount), textVisible: true });
    }

    if (neuro.GeoPos.getBestPositionCounterID) {
        $('#' + neuro.GeoPos.getBestPositionCounterID).text(this.positionCount);
    }

    // Remember the best position so far.

    if (this.positionCount === 1
        || (this.isValid && parentGeoData.isValid && this.position.coords.accuracy <= parentGeoData.position.coords.accuracy)) {

        parentGeoData.positionCount = this.positionCount;
        parentGeoData.position = this.position; // Does this copy, or just copy a pointer?
        parentGeoData.positionErrorCode = this.positionErrorCode;
        parentGeoData.statusText = this.statusText;
        parentGeoData.isValid = this.isValid;
    }

    // Last time through, we'll stop the watch and call the callback method.

    if (this.positionCount === neuro.GeoPos.getBestPositionMaxCount
        || (parentGeoData.isValid && parentGeoData.position.coords.accuracy <= neuro.GeoPos.SUFFICIENT_ACCURACY) // Early exit
        || watchdogFailed) { // Timed out

        // Turn off the "loading" graphic.

        if (neuro.GeoPos.getBestPositionDisplayLoadingMsg) {
            $.mobile.loading('hide');
        }

        this.clearWatch();
        neuro.GeoPos.getBestPositionParentCallback();
    }
};

