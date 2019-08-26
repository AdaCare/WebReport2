// Copyright 2014 by Neurosoftware, LLC.
//
// neuro.geopos.v1.0.js
// Sandy Gettings
//
// This is a library of geopositioning functions for mobile devices.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof neuro !== 'object') {
    throw new Error('neuro is already defined, but is not an object!');
}

if (!neuro.GeoPos) { neuro.GeoPos = {}; }
else { throw new Error('neuro.GeoPos is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constants

neuro.GeoPos = {

    MAX_AGE_MS: 3000,
    GET_POSITION_TIMEOUT_MS: 5000,      // Timeout used for navigator.geolocation methods
    WATCHDOG_TIMEOUT_MS: 7000,          // Timeout used for our own watchdog
    WATCHDOG_TIMEOUT_ERROR_CODE: -1,    // Error code for our own watchdog
    watchdogError: { code: -1 },

    watchId: 0,

    // Local properties

    _getPositionWatchdogTimerID: 0,
    _parentCallback: null,
    _getBestPositionParentCallback: null,
    _getBestPositionCount: 0,
    _getBestPositionCounterID: null,
    _getBestPositionMaxCount: 0,
    _getBestPositionPositionObject: null,

    geoData: {

        // Global properties.

        statusText: 'Uninitialized',
        isValid: false,
        position: null,
        positionErrorCode: 0,
        positionErrorMessage: function () {
            'use strict';

            var message = '';

            switch (this.positionErrorCode) {
                case -1: // Our internal timeout
                    message = 'GPS device timeout';
                    break;

                case 0: // No error
                    message = '';
                    break;

                case 1:
                    message = 'You denied permission';
                    break;

                case 2:
                    message = 'Position is not available';
                    break;

                case 3:
                    message = 'Timed out waiting for position';
                    break;

                default:
                    message = 'Unknown error code ' + this.positionErrorCode;
                    break;
            }

            return message;
        }
    },

    // Return whether the caller has geolocation capability. Always test this before
    // using any geolocation methods.

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

        hasCap = this.hasCapability;

        if (!hasCap) {

            this.geoData.statusText = 'Not Available';
            this.geoData.isValid = false;

            // Execute the parent's callback function

            if (parentCallback) {
                parentCallback();
            }
        }

        return hasCap;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the geo data asynchronously.

    getPosition: function (parentCallback) {
        'use strict';

        neuro.GeoPos.geoData.isValid = false;
        neuro.GeoPos.geoData.position = null;
        this._parentCallback = (parentCallback ? parentCallback : null);

        if (this.hasCapabilityOrExit(parentCallback)) {

            navigator.geolocation.getCurrentPosition(this._getPositionSuccessCallBack,
            this._getPositionFailCallBack,
            { enableHighAccuracy: true, maximumAge: this.MAX_AGE_MS, timeout: this.GET_POSITION_TIMEOUT_MS });
        }
    },

    _getPositionSuccessCallBack: function (position) {
        'use strict';

        neuro.GeoPos.geoData.positionErrorCode = 0;
        neuro.GeoPos.geoData.statusText = 'Ready';
        neuro.GeoPos.geoData.isValid = true;
        neuro.GeoPos.geoData.position = position;

        // Execute the parent's callback function

        if (neuro.GeoPos._parentCallback) {
            neuro.GeoPos._parentCallback();
        }
    },

    _getPositionFailCallBack: function (error) {
        'use strict';

        neuro.GeoPos.geoData.positionErrorCode = error.code;
        neuro.GeoPos.geoData.statusText = 'Fail - ' + error.code + ' - ' + neuro.GeoPos.geoData.positionErrorMessage();
        neuro.GeoPos.geoData.isValid = false;
        neuro.GeoPos.geoData.position = null;

        // Execute the parent's callback function

        if (neuro.GeoPos._parentCallback) {
            neuro.GeoPos._parentCallback();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Watch the geoposition, and execute the callback function.

    watchPosition: function (parentCallback) {
        'use strict';

        neuro.GeoPos.geoData.isValid = false;
        neuro.GeoPos.geoData.position = null;
        this._parentCallback = (parentCallback ? parentCallback : null);

        if (this.hasCapabilityOrExit(parentCallback)) {

            this._getPositionWatchdogTimerID = setTimeout(function () { neuro.GeoPos._watchPositionFailCallBack(neuro.GeoPos.watchdogError); }, this.WATCHDOG_TIMEOUT_MS);
            this.watchId = navigator.geolocation.watchPosition(this._watchPositionSuccessCallBack,
                this._watchPositionFailCallBack,
                { enableHighAccuracy: true, maximumAge: this.MAX_AGE_MS, timeout: this.GET_POSITION_TIMEOUT_MS });
        }
    },

    _watchPositionSuccessCallBack: function (position) {
        'use strict';

        neuro.GeoPos.geoData.positionErrorCode = 0;
        neuro.GeoPos.geoData.statusText = 'Ready';
        neuro.GeoPos.geoData.isValid = true;
        neuro.GeoPos.geoData.position = position;

        // Execute the parent's callback function

        if (neuro.GeoPos._parentCallback) {
            neuro.GeoPos._parentCallback();
        }
    },

    _watchPositionFailCallBack: function (error) {
        'use strict';

        clearTimeout(this._getPositionWatchdogTimerID); // Cancel watchdog timer

        neuro.GeoPos.geoData.positionErrorCode = error.code;
        neuro.GeoPos.geoData.statusText = 'Fail - ' + error.code + ' - ' + neuro.GeoPos.geoData.positionErrorMessage();
        neuro.GeoPos.geoData.isValid = false;
        neuro.GeoPos.geoData.position = null;

        // Execute the parent's callback function

        if (neuro.GeoPos._parentCallback) {
            neuro.GeoPos._parentCallback();
        }
    },

    clearWatch: function () {
        'use strict';

        clearTimeout(this._getPositionWatchdogTimerID); // Cancel watchdog timer
        navigator.geolocation.clearWatch(this.watchId); // Cancel the navigator.watchPosition timer
        this.geoData.statusText = 'Stopped';
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Get the "best of N" positions.
    // Idea: Should we have some kind of timeout in case this takes too long?

    getBestPosition: function (maxCount, parentCallback, counterID) {
        'use strict';

        neuro.GeoPos._getBestPositionParentCallback = (parentCallback ? parentCallback : null);
        neuro.GeoPos._getBestPositionCount = 0;
        neuro.GeoPos._getBestPositionCounterID = counterID;
        neuro.GeoPos._getBestPositionMaxCount = maxCount;
        neuro.GeoPos.watchPosition(this._getBestPositionCallBack);
    },

    _getBestPositionCallBack: function () {
        'use strict';

        var watchdogFailed;

        watchdogFailed = (neuro.GeoPos.geoData.positionErrorCode == neuro.GeoPos.WATCHDOG_TIMEOUT_ERROR_CODE);

        // Keep track of the count of iterations so far.

        neuro.GeoPos._getBestPositionCount++;

        if (neuro.GeoPos._getBestPositionCounterID) {
            $('#' + neuro.GeoPos._getBestPositionCounterID).text(neuro.GeoPos._getBestPositionCount);
        }

        // Remember the best position so far.

        if (neuro.GeoPos._getBestPositionCount === 1
            || (neuro.GeoPos.geoData.isValid && neuro.GeoPos.geoData.position.coords.accuracy <= neuro.GeoPos._getBestPositionPositionObject.coords.accuracy)) {

            neuro.GeoPos._getBestPositionPositionObject = neuro.GeoPos.geoData.position; // Does this copy, or just copy a pointer?
        }

        // Last time through, we'll stop the watch and call the callback method.

        if (neuro.GeoPos._getBestPositionCount == neuro.GeoPos._getBestPositionMaxCount || watchdogFailed) {

            neuro.GeoPos.clearWatch();
            neuro.GeoPos._getBestPositionParentCallback();
        }
    }
};

