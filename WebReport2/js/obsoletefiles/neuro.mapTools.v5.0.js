// Copyright 2010, 2011, 2012, 2013, 2014 by Neurosoftware, LLC. 
//
// neuro.mapTools.v5.0.js
// Sandy Gettings
//
// This version is written to MapQuest v7.0
//
// This is a library that draws maps with JavaScript.
//
// Revisions:
//
// 2013-10-10
// -- Added buttons to select the route type (fastest, shortest, etc.)
// -- Changes to support mobile devices.
// 2014-04-14 SG: Minor improvements.
// 2014-04-14 SG: Refactored for separate geocoding.
// 2014-05-07 SG: Changes to support GPS clock in/out.
// 2014-06-13 SG: Changes to support GPS maps on desktop.
// 2014-06-24 SG: Minor edits to accomodate adjusting GPS location code.
// 2014-07-03 SG: More minor edits for mobile maps.
// 2015-02-10 SG: Changes to use MapQuest's "free & open" server instead of enterprise server ($$$)
// 2015-02-13 SG: Changed to always include lat/lng, even if geocode quality is good.
// 2015-02-17 SG: Added geocoding with Nokia's HERE service. Also disabled geocoding, since we don't actually need it for client-side JavaScript.
// 2015-10-28 SG: Added option for a "heading" parameter, for the caller to provide brief text (such as the date of a route).
// 2017-07-13 SG: Fixed minor bugs
// 2018-05-31 SG: Converted to new MapQuest API.
// 2018-05-31 SG: Split out to new library to support multiple maps, necessary for the new MapQuest/Leaflet API

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof neuro !== 'object') {
    throw new Error('neuro is already defined, but is not an object!');
}

if (!neuro.mapTools) { neuro.mapTools = {}; }
else { throw new Error('neuro.mapTools is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constants

neuro.mapTools = {

    mapList: [],                                    // List of active maps and related info for each, indexed by the map's <div> element ID

    isMobile: false,                                 // True if this map is for a mobile device.

    GEOCODE_QUALITY_EXACT: 'A',
    GEOCODE_QUALITY_GOOD: 'B',
    GEOCODE_QUALITY_APPROX: 'C',
    GEOCODE_QUALITY_MISSING: 'X',

    // Mapping servers, specified in the Web.config file:

    HERE_APP_ID: 'C0nTIp7kgHG4Se0BbfHU',
    HERE_APP_CODE: 'psCah_vT9cfnMXxEHQe4aw',
    MAPQUEST_KEY: 'Dmjtd%7Cluu72gu8l9%2C8x%3Do5-5ytg0',

    MAP_GEOCODE_METHOD_HERE: 'HERE',                // Nokia's HERE.com
    MAP_GEOCODE_METHOD_MAPQUEST: 'MAPQUEST',        // MapQuest
    MAP_GEOCODE_METHOD: 'HERE',                     // Service to use for geocoding

    ZOOM_DEFAULT: 12,
    MAPTYPE_DEFAULT: 'map',

    MAP_UNITS_MI: 'm', // Miles
    MAP_UNITS_KM: 'k', // Kilometers

    // Icon for the client's location.

    ICON_CLIENT_COLOR1: '#0E850F',
    ICON_CLIENT_COLOR2: '#FFFFFF',
    ICON_CLIENT_SIZE: 'sm',                         // sm, md, lg

    ICON_GPS_CLIENT_COLOR1: '34A853', //'#0E850F',
    ICON_GPS_CLIENT_COLOR2: '#FFFFFF',
    ICON_GPS_CLIENT_SIZE: 'sm',                    // sm, md, lg
    ICON_GPS_CLIENT_BULLSEYE_COLOR: '#34A853',

    ICON_GPS_DEVICE_COLOR1: '#4285F4',
    ICON_GPS_DEVICE_COLOR2: '#FFFFFF',
    ICON_GPS_DEVICE_SIZE: 'sm',                    // sm, md, lg
    ICON_GPS_DEVICE_ACCURACY_COLOR: '#4285F4',

    // Icon for the "person" holding the device.

    ICON_GPS_PERSON_URL: '/Mobile/images/gpsperson.png',
    ICON_GPS_PERSON_WIDTH: 13,
    ICON_GPS_PERSON_HEIGHT: 32,

    // Icons for the circles around the client's "close enough" bullseye and the person's device accuracy.

    ICON_GPS_ACCURACY_URL: '/Mobile/images/gpsaccuracyring.png', // Tip: Create animated GIF with http://gifmaker.me/
    ICON_GPS_BULLSEYE_URL: '/Mobile/images/gpsbullseyering.png',
    ICON_NO_SHADOW_URL: '/Mobile/images/mapiconnoshadow.gif',

    // Define the type of route: fastest, shortest, etc. We put this into a global so it will be available
    // to callback functions as well.

    ROUTE_TYPE_OPTION_FASTEST: "fastest",
    ROUTE_TYPE_OPTION_SHORTEST: "shortest",
    ROUTE_TYPE_OPTION_PEDESTRIAN: "pedestrian",
    ROUTE_TYPE_OPTION_PUBLIC_TRANSPORT: "multimodal",

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor for the MapInfo object. There's one of these objects for each map currently being
    // shown on the page.

    MapInfo: function (mapDivID, mapManeuversDivID, isMobile) {
        'use strict';

        // Definition of map fields on page

        this.mapDivID = mapDivID;                   // 'mapDiv';
        this.mapManeuversDivID = mapManeuversDivID; // 'mapManeuvers';
        this.isMobile = isMobile;

        this.myMap = {};                            // The map object returned by MapQuest/Leaflet
        this.routeTypeOption = neuro.mapTools.ROUTE_TYPE_OPTION_FASTEST;
        this.addressList = [];                      // List of Address objects to be mapped
        this.poiList = [];                          // List of POIs (points of interest, the stops on our route)
        this.poiGpsPulse = null;                    // POI for GPS pulse
        this.poiGpsBullseye = null;                 // POI for GPS bullseye
        this.geocodeCallback = null;                // Callback function for geocoding

        // These are the icons we place on the map. We only remember the ones for the GPS device (the
        // mobile phone), because we have to update their positions on the map as the user moves around.

        this.gpsDeviceIcon = null;
        this.gpsDeviceAccuracyIcon = null;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor for the LatLng object.

    LatLng: function (lat, lng) {
        'use strict';

        this.lat = lat;
        this.lng = lng;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init desktop map. There is a counterpart for this in the mobile lib. Unlike the mobile version,
    // we don't have to worry about variable map sizes or changes between portrait & landscape orientation.

    initDesktopMap: function (mapDivID, mapManeuversDivID) {
        'use strict';

        var mapInfo;

        // If a map already exists, destroy it and start fresh. This may be inefficient overkill, 
        // but for now it's ok,

        mapInfo = neuro.mapTools.mapList[mapDivID];

        if (mapInfo) {

            neuro.mapTools.clearMap(mapInfo);
        }

        mapInfo = new this.MapInfo(mapDivID, mapManeuversDivID, false);
        neuro.mapTools.mapList[mapDivID] = mapInfo;

        return mapInfo;
    },

    initMobilMap: function (mapDivID, mapManeuversDivID) {
        'use strict';

        var mapInfo;

        // If a map already exists, destroy it and start fresh. This may be inefficient overkill, 
        // but for now it's ok,

        mapInfo = neuro.mapTools.mapList[mapDivID];

        if (mapInfo) {

            neuro.mapTools.clearMap(mapInfo);
        }

        mapInfo = new this.MapInfo(mapDivID, mapManeuversDivID, true);
        neuro.mapTools.mapList[mapDivID] = mapInfo;

        return mapInfo;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw the map with the addresses and routes.

    drawMap: function (mapInfo, routeHeading) {
        'use strict';

        if (mapInfo.addressList.length > 0) {
            neuro.mapTools.openMap(mapInfo, mapInfo.addressList[0].latLng.lat, mapInfo.addressList[0].latLng.lng);
        }
        else {
            neuro.mapTools.openMap(40, -105); // Remove these later...
        }

        neuro.mapTools.drawRoute(mapInfo, routeHeading);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Best fit the map to the points. We need a minimum zoom, because two points very close
    // together (or just a single point) default to a too-close zoom. Both of these methods work.

    bestFitMap: function (mapInfo) {
        'use strict';

        var currentZoom;

        // Method #1
        //neuro.mapTools.myMap.zoomToRect(neuro.mapTools.myMap.getBounds(), false, neuro.mapTools.ZOOM_DEFAULT);

        // Method #2

        // 2018-05-31 SG: Not available (or not needed) with the new API.
        //if (neuro.mapTools.myMap) { // Should always be non-null unless there's no map displayed
        //    neuro.mapTools.myMap.bestFit();
        //    currentZoom = neuro.mapTools.myMap.getZoomLevel();
        //    currentZoom = Math.min(currentZoom, neuro.mapTools.ZOOM_DEFAULT);
        //    neuro.mapTools.myMap.setZoomLevel(currentZoom);
        //}
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw a map at the given centerpoint.

    openMap: function (mapInfo, mapLat, mapLng) {
        'use strict';

        L.mapquest.key = neuro.mapTools.MAPQUEST_KEY;

        if (mapLat && mapLng) {

            mapInfo.myMap = new L.mapquest.map(
                mapInfo.mapDivID, {
                    center: [mapLat, mapLng],
                    layers: L.mapquest.tileLayer('map'),
                    zoom: neuro.mapTools.ZOOM_DEFAULT
                });
        }
        else {

            mapInfo.myMap = new L.mapquest.map(
                mapInfo.mapDivID, {
                    //center: [mapLat, mapLng],
                    layers: L.mapquest.tileLayer('map'),
                    zoom: neuro.mapTools.ZOOM_DEFAULT
                });
        }

        neuro.mapTools.initMapControls(mapInfo);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the various controls on the map: zoom, pan, traffic, etc. We can display different controls
    // for desktop vs. mobile users.

    initMapControls: function (mapInfo) {
        'use strict';

        if (mapInfo.isMobile) {

            mapInfo.myMap.addControl(L.mapquest.control());
        }

        else {

            mapInfo.myMap.addControl(L.mapquest.control());
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Clear any previous map and any placeholder stuff (like "Waiting for map...").

    clearMap: function (mapInfo) {
        'use strict';

        //if (neuro.mapTools.myMap) {
        //    neuro.mapTools.myMap = null;
        //}

        if (mapInfo.myMap) {
            mapInfo.myMap.off();
            mapInfo.myMap.remove();
        }

        $('#' + mapInfo.mapDivID).empty(); // Remove any stuff inside the map's div
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display a GPS map. This is a particular format for clock in/out. It show the client's location
    // and the location of the GPS device (the user's mobile phone).
    //
    // Be sure to call initDesktopMap() or initMobileMap() first.

    displayGpsMap: function (mapInfo, clientLat, clientLng, clientGeoquality,
        staffNameInitials, deviceLat, deviceLng, deviceAccuracyMeters,
        gpsMaxDistanceToClientMeters, poiText, poiSubtext) {
        'use strict';

        var poiListIndex;
        var mapResolution;  // Map's resolution, in meters/pixel
        var clientIsValid;  // True if client has a valid geocode
        var iconGpsAccuracyDiameter, iconGpsBullseyeDiameter;
        var clientBounds, deviceBounds, mapBounds;

        clientIsValid = (clientGeoquality !== neuro.mapTools.GEOCODE_QUALITY_MISSING);

        //this.clearMap(mapInfo);

        // Open the map. We'll center on the client's location if possible, or the device's
        // location otherwise.

        if (clientIsValid) {
            neuro.mapTools.openMap(mapInfo, clientLat, clientLng);
        }
        else {
            neuro.mapTools.openMap(mapInfo, deviceLat, deviceLng);
        }

        // Place the client and the device on the map. The client is surrounded by a "bullseye" to show
        // the must-be-within range. The GPS device (a mobile phone) is surrounded by an "accuracy circle"
        // to show the resolution of the GPS signal.

        if (clientIsValid) {

            // Display the client and his/her's "bullseye" for the required GPS limit.

            mapInfo.gpsClientIcon = neuro.mapTools.addGpsClientIconToMap(mapInfo, clientLat, clientLng);
            mapInfo.gpsClientBullseyeIcon = neuro.mapTools.addGpsClientBullseyeIconToMap(mapInfo, clientLat, clientLng, gpsMaxDistanceToClientMeters);
        }
        else {

            mapInfo.gpsClientIcon = null;
            mapInfo.gpsClientBullseyeIcon = null;
        }

        // Display the device and it's "accuracy" circle. 

        mapInfo.gpsDeviceIcon = neuro.mapTools.addGpsDeviceIconToMap(mapInfo, deviceLat, deviceLng, staffNameInitials);
        mapInfo.gpsDeviceAccuracyIcon = neuro.mapTools.addGpsDeviceAccuracyIconToMap(mapInfo, deviceLat, deviceLng, deviceAccuracyMeters);

        // Tweak the bouds of the map displayed. The idea is that the bounds should enclose the client
        // and device, *including their bullseye and accuract circle, plus a little bit of padding.

        mapBounds = L.latLngBounds([clientLat, clientLng], [deviceLat, deviceLng]);

        if (mapInfo.gpsClientBullseyeIcon) {

            clientBounds = mapInfo.gpsClientBullseyeIcon.getBounds();
            mapBounds = mapBounds.extend(clientBounds);
        }

        deviceBounds = mapInfo.gpsDeviceAccuracyIcon.getBounds();
        mapBounds.extend(deviceBounds);
        mapBounds = mapBounds.pad(0.3); // Add 30% padding around everything

        mapInfo.myMap.fitBounds(mapBounds);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Update the GPS map to show the updated position of the person holding the device.

    updateGpsMap: function (mapInfo, deviceLat, deviceLng, deviceAccuracyMeters, gpsMaxDistanceToClientMeters) {
        'use strict';

        var mapResolution; // Map's resolution, in meters/pixel
        var iconGpsAccuracyDiameter, iconGpsBullseyeDiameter;

        mapInfo.gpsDeviceIcon.setLatLng([deviceLat, deviceLng]);
        mapInfo.gpsDeviceAccuracyIcon.setLatLng([deviceLat, deviceLng]);
        mapInfo.gpsDeviceAccuracyIcon.setRadius(deviceAccuracyMeters);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor for AddressItem

    AddressItem: function (street, city, state, postalCode, country, title, content, lat, lng, geoquality, geocodeMissingAndStale) {
        'use strict';

        var latLng;

        // Construct a point of interest. If the geocode quality is "missing," then
        // we substitute a fake lat/lng. Perhaps we should have a dedicated "invalid" lat/lng value?

        // 2018-05-31 SG: Converted to use our own LatLng object.
        if (geoquality !== undefined && geoquality !== neuro.mapTools.GEOCODE_QUALITY_MISSING) {
            //latLng = new MQA.LatLng(lat, lng);
            latLng = new neuro.mapTools.LatLng(lat, lng);
        }
        else {
            geoquality = neuro.mapTools.GEOCODE_QUALITY_MISSING;
            //latLng = new MQA.LatLng(0, 0);
            latLng = new neuro.mapTools.LatLng(0, 0);
        }

        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.title = title;
        this.content = content;
        this.latLng = latLng;
        this.displayLatLng = latLng; // TEST - update later by caller
        this.geoquality = geoquality;
        this.geocodeMissingAndStale = ((geocodeMissingAndStale === undefined) || geocodeMissingAndStale); // ( geocodeMissingAndStale ? true : false); // Sez geocode is missing *and* it's due to recheck (plus, handle undefined parm)

        // This used to be a prototype, so that the function is defined only once for all instances.
        // Need to figure this out again since this code was reorganized.
        //AddressItem.prototype.geoqualityDescrip = function () {
        this.geoqualityDescrip = function () {
            //'use strict';

            var gqText;

            switch (this.geoquality) {

                case neuro.mapTools.GEOCODE_QUALITY_EXACT: // Exact match
                    gqText = '';
                    break;

                case neuro.mapTools.GEOCODE_QUALITY_GOOD: // Good match
                    gqText = 'This address is only approximate, please verify';
                    break;

                case neuro.mapTools.GEOCODE_QUALITY_APPROX: // Approximate match
                    gqText = 'This address is only approximate, please verify';
                    break;

                case neuro.mapTools.GEOCODE_QUALITY_MISSING: // Match is unknown
                    gqText = 'Caution -- this address is unknown, please verify';
                    break;

                default:
                    this.geoquality = neuro.mapTools.GEOCODE_QUALITY_MISSING;
                    gqText = 'Caution -- this address is unknown, please verify';
                    break;
            }

            return gqText;
        };

        // Return a nicely-formatted address: street, city, state postal code

        this.formattedAddress = function () {
            //'use strict';

            var formattedStr = '';

            formattedStr = this.title;

            if (formattedStr.length > 0 && this.street.length > 0) {
                formattedStr += ', ';
            }

            formattedStr += this.street;

            if (formattedStr.length > 0 && (this.city.length > 0 || this.state.length > 0 || this.postalCode.length > 0)) {
                formattedStr += ', ';
            }

            formattedStr += this.city + ' ' + this.state + ' ' + this.postalCode;

            return formattedStr;
        };
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the address list.

    initAddressList: function (mapInfo) {
        'use strict';

        mapInfo.addressList.length = 0;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Add a route point to the list, given lat/lng.

    addAddressItem: function (mapInfo, street, city, state, postalCode, country, poiTitle, poiContent, lat, lng, quality, geocodeMissingAndStale) {
        'use strict';

        var thisAddressItem, index;

        thisAddressItem = new neuro.mapTools.AddressItem(street, city, state, postalCode, country, poiTitle, poiContent, lat, lng, quality, geocodeMissingAndStale);
        index = mapInfo.addressList.length;
        mapInfo.addressList[index] = thisAddressItem;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Insert the given address object at the beginning of the list.

    insertAddressAtBeginning: function (mapInfo, addressItem) {
        'use strict';

        var addressCount, i;

        addressCount = mapInfo.addressList.length;

        for (i = addressCount - 1; i >= 0; i--) {

            mapInfo.addressList[i + 1] = mapInfo.addressList[i];
        }

        mapInfo.addressList[0] = addressItem;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Geocode all the addresses in our list and draw the route on the map.

    geocodeAndDrawAddressList: function (mapInfo, routeHeading) {
        'use strict';

        // Geocode the addresses in the list, and then draw the map.

        neuro.mapTools.initRouteNarrative(mapInfo);             // Clear the narrative text
        this.geocodeAddressList(mapInfo, function () { neuro.mapTools.drawMap(mapInfo, routeHeading); }); // Geocode, and draw map
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Geocode all the addresses in our list. Use the appropriate mapping service and execute the caller's
    // callback function when finished.

    geocodeAddressList: function (mapInfo, myCallback) {
        'use strict';

        mapInfo.geocodeCallback = myCallback;

        if (mapInfo.geocodeCallback) {

            mapInfo.geocodeCallback();
        }

        /*** Don't bother geocoding here (client-side), because it's already done server-side.
        if (this.MAP_GEOCODE_METHOD === this.MAP_GEOCODE_METHOD_HERE) {

            neuro.mapTools.geocodeAddressListForHERE(mapInfo);
        }

        else if (this.MAP_GEOCODE_METHOD === this.MAP_GEOCODE_METHOD_MAPQUEST) {

            neuro.mapTools.geocodeAddressListForMapQuest(mapInfo);
        }
        ***/
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Geocode the address list using Nokia's HERE mapping service.

    geocodeAddressListForHERE: function (mapInfo) {
        'use strict';

        var platform, getGeocodeParms, geocodingService, anyFound;
        var addressItem, addressCount, addressIndex;
        var initialized = false;
        var callbackFunction, callbackFunctionFail;

        // Find all the addresses that need geocoding. No sense in doing this for addresses that have
        // good geocodes already.

        addressCount = mapInfo.addressList.length;
        anyFound = false;

        for (addressIndex = 0; addressIndex < addressCount; addressIndex++) {

            addressItem = mapInfo.addressList[addressIndex];
            // /* DEBUG ONLY! */ addressItem.geocodeMissingAndStale = true; // DEBUG ONLY! FORCE GEOCODING

            if (addressItem.geocodeMissingAndStale) {

                anyFound = true;

                if (!initialized) {

                    platform = new H.service.Platform({
                        app_id: this.HERE_APP_ID,
                        app_code: this.HERE_APP_CODE,
                        useHTTPS: true
                    });

                    geocodingService = platform.getGeocodingService();
                    initialized = true;
                }

                getGeocodeParms = {
                    searchText: addressItem.street,
                    city: addressItem.city,
                    state: addressItem.state,
                    postalCode: addressItem.postalCode,
                    country: addressItem.country
                };

                // Since these are async callbacks, we need to be able to know which addressItem was geocoded when we
                // come back to the callback function.
                //
                // Scope problem: Since we're in a loop, the loop index "addressIndex" or any variables changed within the loop
                // may not be the same by the time the callback function gets executed. For example, addressIndex=0 for the first
                // address we geocode, but the variable addressIndex may be further into the loop by the time we get back. Grrr.
                //
                // The trick below is to construct a new function that does not execute within the local scope, but using
                // the value of the loop variable *at that time.*

                //geocodingService.geocode(getGeocodeParms,
                //    function (geocodeResponse) { neuro.mapTools.geocodeAddressListHERECallback(mapInfo, addressItem, geocodeResponse); },
                //    function (e) { neuro.mapTools.geocodeAddressListHERECallbackFail(mapInfo, addressItem, e); }
                //    );

                callbackFunction = new Function('geocodeResponse', 'neuro.mapTools.geocodeAddressListHERECallback(' + '\'' + mapInfo.mapDivID + '\'' + addressIndex.toString() + ', geocodeResponse)');
                callbackFunctionFail = new Function('e', 'neuro.mapTools.geocodeAddressListHERECallbackFail(' + '\'' + mapInfo.mapDivID + '\'' + addressIndex.toString() + ', e)');

                geocodingService.geocode(getGeocodeParms, callbackFunction, callbackFunctionFail);
            }
        }

        // If no addresses needed geocoding, then we'll go ahead and execute the callback now.

        if (!anyFound) {
            if (nmapInfo.geocodeCallback) {
                nmapInfo.geocodeCallback();
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    geocodeAddressListHERECallback: function (mapDivID, addressIndex, geocodeResponse) {
        'use strict';

        var addressItem;
        var geocodeReponseResult, geocodeResponseLocation;
        var lat = 0, lng = 0, matchLevel = '', geoquality = neuro.mapTools.GEOCODE_QUALITY_MISSING;
        var mapInfo;

        mapInfo = neuro.mapTools.mapList[mapDivID];

        if (geocodeResponse.Response) {

            if (geocodeResponse.Response.View.length > 0) {

                if (geocodeResponse.Response.View[0].Result) {

                    if (geocodeResponse.Response.View[0].Result.length > 0) {

                        geocodeReponseResult = geocodeResponse.Response.View[0].Result[0];
                        geocodeResponseLocation = geocodeReponseResult.Location;
                        lat = geocodeResponseLocation.DisplayPosition.Latitude;
                        lng = geocodeResponseLocation.DisplayPosition.Longitude;
                        matchLevel = geocodeReponseResult.MatchLevel;

                        switch (matchLevel) {

                            case "houseNumber":

                                geoquality = neuro.mapTools.GEOCODE_QUALITY_EXACT;
                                break;

                            case "street":

                                geoquality = neuro.mapTools.GEOCODE_QUALITY_APPROX;
                                break;

                            default:

                                geoquality = neuro.mapTools.GEOCODE_QUALITY_MISSING;
                                break;
                        }
                    }
                }
            }
        }

        // Update the geocode in the addressItem.

        addressItem = mapInfo.addressList[addressIndex];
        addressItem.latLng.lat = lat;
        addressItem.latLng.lng = lng;
        addressItem.geoquality = geoquality;
        addressItem.geocodeMissingAndStale = false;

        neuro.mapTools.geocodeAddressListHERECallbackExit(mapInfo);
    },

    geocodeAddressListHERECallbackFail: function (mapDivID, addressIndex, e) {
        'use strict';

        var addressItem;
        var mapInfo;

        mapInfo = neuro.mapTools.mapList[mapDivID];

        addressItem = mapInfo.addressList[addressIndex];
        addressItem.geocodeMissingAndStale = false;
        neuro.mapTools.geocodeAddressListHERECallbackExit(mapInfo);
    },

    // Shared code for exiting the callback.

    geocodeAddressListHERECallbackExit: function (mapInfo) {
        'use strict';

        var addressCount, anyFound, i;

        // This part is tricksy. This function may be invoked several times, once for each address 
        // in mapInfo.addressList that needed geocoding. Only after we've geocoded all of the addresses
        // that need it, we invoke the orginal caller's callback function.
        //
        // The question is, how do we know when all addresses have been geocoded? To solve this, we
        // turn off the "geocodeMissingAndStale" property in the address object. When all have been
        // turned off, we know that all addresses have been geocoded and we're done.

        anyFound = false;
        addressCount = mapInfo.addressList.length;

        for (i = 0; i < addressCount && !anyFound; i++) {

            anyFound = mapInfo.addressList[i].geocodeMissingAndStale;
        }

        if (!anyFound) {

            if (mapInfo.geocodeCallback) {

                mapInfo.geocodeCallback();
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Geocode the address list using MapQuest's mapping service.

    geocodeAddressListForMapQuest: function (mapInfo) {
        'use strict';

        var location, locationsToGeocodeList = [];
        var addressItem, addressCount, i;

        // Find all the addresses that need geocoding. No sense in doing this for addresses that have
        // good geocodes already.

        addressCount = mapInfo.addressList.length;

        for (i = 0; i < addressCount; i++) {

            addressItem = mapInfo.addressList[i];
            // /* DEBUG ONLY! */ addressItem.geocodeMissingAndStale = true; // DEBUG ONLY! FORCE GEOCODING

            if (addressItem.geocodeMissingAndStale) {

                location = {};
                location.street = addressItem.street;
                location.city = addressItem.city;
                location.state = addressItem.state;
                location.postalCode = addressItem.postalCode;
                location.country = addressItem.country;

                locationsToGeocodeList[locationsToGeocodeList.length] = location;

                // DEBUG
                //AdaCareWeb.WebServices.DebugServices.WriteLogDebug('neuro.mapTools.geocodeAddressList: #' + locationsToGeocodeList.length
                //    + ', ' + location.street + ', ' + location.city + ', ' + location.state + ', ' + location.postalCode + ', ' + location.country);
            }
        }

        // If any addresses need geocoding, do it now.

        if (locationsToGeocodeList.length > 0) {

            // Test for bug fix: If only one address is sent, geocoding fails (status=400 in callback).
            // No obvious reason for this problem! Delete this hack if/when problem is fixed.

            if (locationsToGeocodeList.length === 1) {

                locationsToGeocodeList[locationsToGeocodeList.length] = locationsToGeocodeList[0];
            }

            MQA.withModule('geocoder', function () {

                MQA.Geocoder.geocode(locationsToGeocodeList, null, null,
                    function (response) {
                        neuro.mapTools.geocodeAddressListMapQuestCallback(mapInfo, response);
                    });
            });
        }

        else if (neuro.mapTools.geocodeCallback) {

            neuro.mapTools.geocodeCallback();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // This function is called by the Geocoder methods upon completion. The response parameter passed
    // in contains geocoding info for each address that was processed.
    //
    // Parameter #1: Response object
    // + info
    //   - statuscode (0=success)
    // + results
    //   - length
    //   + providedLocation
    //     - street
    //     - city
    //     - state
    //     - postalCode
    //   + locations[] (more than one location may be returned for ambiguous addresses)
    //     - length
    //     + location
    //       - street
    //       - city
    //       - state
    //       - postalCode
    //       + latLng
    //         - lat
    //         - lng
    //       - geocodeQualityCode (XXXX)
    //       - mapUrl (to thumbnail map)

    geocodeAddressListMapQuestCallback: function (mapInfo, response) {
        'use strict';

        var resultsList, resultsCount, r;
        var locationList, location, providedLocation;
        var streetFound, cityFound;
        var latLng, displayLatLng, geoquality, geocodeMissingAndStale;
        var mapUrl;
        var addressItem, addressCount, a;

        if (response.info.statuscode === 0) {

            // Each of the results in the response is for an address we provided to be geocoded.

            resultsList = response.results;
            resultsCount = resultsList.length;

            for (r = 0; r < resultsCount; r++) {

                locationList = resultsList[r].locations;
                providedLocation = resultsList[r].providedLocation;

                // Geocoding may return zero, one, or several locations for each address we provided.
                // If more than one was returned (because the original address was ambiguous), then we
                // only take the first one.

                if (locationList.length > 0) {

                    location = locationList[0];
                    streetFound = providedLocation.street;
                    cityFound = providedLocation.city;
                    geoquality = location.geocodeQualityCode.charAt(2);
                    latLng = location.latLng;
                    displayLatLng = location.displayLatLng; // TEST
                    mapUrl = location.mapUrl;
                }
                else {
                    streetFound = '';
                    cityFound = '';
                    geoquality = neuro.mapTools.GEOCODE_QUALITY_MISSING;
                    geocodeMissingAndStale = false;
                }

                // Search our list of address to find this location, and
                // update the address's lat/lng info.

                addressCount = mapInfo.addressList.length;

                for (a = 0; a < addressCount; a++) {

                    addressItem = mapInfo.addressList[a];

                    if (streetFound === addressItem.street && cityFound === addressItem.city) {

                        addressItem = mapInfo.addressList[a];
                        addressItem.latLng = latLng;
                        addressItem.displayLatLng = displayLatLng; // TEST
                        addressItem.geoquality = geoquality;
                        addressItem.geocodeMissingAndStale = geocodeMissingAndStale;
                        break;
                    }
                }
            }
        }

        if (mapInfo.geocodeCallback) {

            mapInfo.geocodeCallback();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Reverse geocode a lat/lng to an address.

    reverseGeocode: function (lat, lng, myCallback) {
        'use strict';

        var location;

        location = {};
        location.lat = lat;
        location.lng = lng;

        neuro.mapTools.geocodeCallback = myCallback;

        MQA.withModule('geocoder', function () {

            MQA.Geocoder.reverse(location, null, null, neuro.mapTools.reverseGeocodeCallback);
        });
    },

    reverseGeocodeCallback: function (response) {
        'use strict';

        var location = null;

        if (response.info.statuscode === 0) {
            if (response.results.length > 0) {
                if (response.results[0].locations.length > 0) {
                    location = response.results[0].locations[0];
                }
            }
        }

        if (neuro.mapTools.geocodeCallback) {
            neuro.mapTools.geocodeCallback(location);
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Calculate distance between two points (in meters). We use the "Haversine" formula.
    //
    // See http://www.movable-type.co.uk/scripts/latlong.html

    calcGreatCircleDistance: function (lat1, lng1, lat2, lng2) {
        'use strict';

        var EARTH_RADIUS = 6371; // Earth's radius, km
        var deltaLatRadians, deltaLngRadians, lat1Radians, lat2Radians;
        var a, c, distance;

        deltaLatRadians = (lat2 - lat1) * Math.PI / 180;
        deltaLngRadians = (lng2 - lng1) * Math.PI / 180;
        lat1Radians = lat1 * Math.PI / 180;
        lat2Radians = lat2 * Math.PI / 180;

        a = Math.sin(deltaLatRadians / 2) * Math.sin(deltaLatRadians / 2) +
            Math.sin(deltaLngRadians / 2) * Math.sin(deltaLngRadians / 2) * Math.cos(lat1Radians) * Math.cos(lat2Radians);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = EARTH_RADIUS * c * 1000;

        return distance;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw the route on the map.

    drawRoute: function (mapInfo, routeHeading) {
        'use strict';

        var directions;
        var routeHtml, routeElem;
        var location, locationList = [];
        var addressItem, addressCount, a;
        var anyMissing = false;

        // If we have at least two addresses, we'll try to draw a route.

        addressCount = mapInfo.addressList.length;

        if (addressCount >= 2) {

            // See if any addresses are poor quality and prevent the route from being drawn.

            for (a = 0; a < addressCount; a++) {

                addressItem = mapInfo.addressList[a];

                if (addressItem.geoquality === neuro.mapTools.GEOCODE_QUALITY_MISSING) {

                    anyMissing = true;
                    break;
                }
            }

            // Draw the route ribbon and write the text for the maneuvers.
            // TBD: We'll draw the ribbon in pairs of addresses, so we can skip any that are insufficient.
            // For now, we'll just skip the route ribbon if there are any missing points.

            if (!anyMissing) {

                for (a = 0; a < addressCount; a++) {

                    addressItem = mapInfo.addressList[a];

                    if (addressItem.geoquality !== neuro.mapTools.GEOCODE_QUALITY_MISSING) {

                        location = {};
                        location.street = addressItem.street;
                        location.city = addressItem.city;
                        location.state = addressItem.state;
                        location.postalCode = addressItem.postalCode;
                        location.country = addressItem.country;

                        // Programmer's note: Why discard the lat/lng after we've gone to such trouble to find it?
                        // as it turns out, when routes are drawn from lat/lng, the street address is *estimated*
                        // from the lat/lng and is sometimes inaccurate. If we construct a route from the raw
                        // address, the route narrative is more often correct. This may be slower, but it renders
                        // a more accurate narrative.

                        // Actually, use lat/lng if the geocode isn't exact. Otherwise, addRoute() fails silently (MQ bug?)
                        // 2015-02-13 SG changed to *always* provide lat/lng.

                        //if (addressItem.geoquality !== neuro.mapTools.GEOCODE_QUALITY_EXACT) {
                        location.latLng = addressItem.latLng;
                        //}

                        locationList[locationList.length] = new L.LatLng(location.latLng.lat, location.latLng.lng);
                    }
                }

                directions = L.mapquest.directions();
                directions.route({
                    locations: locationList
                },
                    function (error, response) { neuro.mapTools.directionsCallback(mapInfo, error, response, routeHeading); }
                );

            }
            else {
                routeElem = document.getElementById(mapInfo.mapManeuversDivID);
                routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table

                routeHtml += '<tr><td colspan="3">' +
                    '<div class="general_infomsg_box" style="padding: 4px">' +
                    'Some locations do not have an accurate address on file, so driving directions are not available' +
                    '</div></td></tr>';

                routeHtml += '</table>';
                routeElem.innerHTML = routeHtml;
                neuro.mapTools.placeRouteAddressesOnlyHtml(mapInfo); // Draw symbols at each address in lieu of a route.
                neuro.mapTools.placePointsOnMap(mapInfo);
                neuro.mapTools.bestFitMap(mapInfo);
            }
        }
        else {
            neuro.mapTools.placeRouteAddressesOnlyHtml(mapInfo); // Draw symbols at each address in lieu of a route.
            neuro.mapTools.placePointsOnMap(mapInfo);
            neuro.mapTools.bestFitMap(mapInfo);
        }
    },

    directionsCallback: function (mapInfo, error, response, routeHeading) {
        'use strict';

        var directionsLayer;

        directionsLayer = L.mapquest.directionsLayer({
            directionsResponse: response
        }).addTo(mapInfo.myMap);

        neuro.mapTools.placeRouteNarrative(mapInfo, response, 0, routeHeading);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the maneuvers text, that displays the addresses (with notes about quality) or the full
    // turn-by-turn narrative. (By "init," we just display a nice little "please wait" message that
    // will be replaced by the proper narrative when it is returned by MapQuest.)

    initRouteNarrative: function (mapInfo) {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(mapInfo.mapManeuversDivID);
        routeHtml = "Please wait...";
        routeElem.innerHTML = routeHtml;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw points of interest (our addresses) on the map. This is used when we are just displaying the
    // list of addresses, but not the turn-by-turn narrative.

    placeRouteAddressesOnlyHtml: function (mapInfo) {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(mapInfo.mapManeuversDivID);
        routeHtml = neuro.mapTools.generateAddressesHtml(mapInfo);
        routeElem.innerHTML = routeHtml;  // Was "+=", should still be ok
    },

    generateAddressesHtml: function (mapInfo) {
        'use strict';

        var routeHtml = '';
        var qualityText, qualityHtml;
        var addressItem, a;

        // Draw each address as a point of interest. This is needed when *not* drawing a route, which
        // places its own symbols on the map.

        routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table

        routeHtml += '<tr><td colspan="3"><div class="map_maneuvers_header">' +
            'Addresses' +
            '</div></td></tr>';

        for (a = 0; a < mapInfo.addressList.length; a++) {

            addressItem = mapInfo.addressList[a];

            qualityText = addressItem.geoqualityDescrip();

            if (qualityText !== '') {
                qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
            }
            else {
                qualityHtml = '';
            }

            routeHtml += '<tr><td colspan="3"><div class="map_trek_head">' +
                addressItem.title +
                '<tr><td>&nbsp;</td><td colspan="2">' + addressItem.street +
                ', ' + addressItem.city + ' ' + addressItem.state + ' ' + addressItem.postalCode +
                qualityHtml +
                '</td></tr></div></td></tr>';
        }

        routeHtml += '</table>';

        return routeHtml;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw the route narrative. This displays turn-by-turn directions.

    placeRouteNarrative: function (mapInfo, data, addressStartIndex, routeHeading) {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(mapInfo.mapManeuversDivID);
        routeHtml = neuro.mapTools.generateRouteNarrativeHtml(mapInfo, data, addressStartIndex, routeHeading);
        routeElem.innerHTML = routeHtml;
    },

    generateRouteNarrativeHtml: function (mapInfo, data, addressStartIndex, routeHeading) {
        'use strict';

        var routeMinutes, routeDistance, routeHtml = '', i;
        var leg, legList, legMinutes, legDistance;
        var maneuver, maneuverList, maneuverDistance, maneuverHtml, m;
        var maneuverMinutes;
        var qualityText, qualityHtml;
        var addressItem;
        var routeHeadingText;

        if (data.route && data.info.statuscode === 0) {

            routeMinutes = Math.round(data.route.time / 60);
            routeDistance = Math.round(data.route.distance * 10) / 10;
            routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table
            legList = data.route.legs;
            routeHeadingText = (routeHeading ? ' for ' + routeHeading + ' ' : ' ');

            routeHtml += '<tr><td colspan="3"><div class="map_maneuvers_header">' +
                'Driving Directions' + routeHeadingText +
                '(' +
                neuro.mapTools.pluralText(routeDistance, 'mile') + ', ' + neuro.mapTools.pluralText(routeMinutes, 'minute') +
                ')' +
                '</div></td></tr>';

            // Display the starting address

            addressItem = mapInfo.addressList[addressStartIndex];
            qualityText = addressItem.geoqualityDescrip();

            if (qualityText !== '') {
                qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
            }
            else {
                qualityHtml = '';
            }

            routeHtml += '<tr><td colspan="3"><div class="map_trek_head">' +
                'Start at ' + addressItem.formattedAddress() +
                qualityHtml +
                '</div></td></tr>';

            for (i = 0; i < legList.length; i++) {

                leg = legList[i];
                addressItem = mapInfo.addressList[addressStartIndex + i + 1];
                qualityText = addressItem.geoqualityDescrip();

                if (qualityText !== '') {
                    qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
                }
                else {
                    qualityHtml = '';
                }

                maneuverList = leg.maneuvers;
                legMinutes = Math.round(leg.time / 60);
                legDistance = Math.round(leg.distance * 10) / 10;

                routeHtml += '<tr><td colspan="3"><div class="map_trek_head">' +
                    'To ' + addressItem.formattedAddress() +
                    ' (' + neuro.mapTools.pluralText(legDistance, 'mile') + ', ' + neuro.mapTools.pluralText(legMinutes, 'minute') + ')' +
                    qualityHtml +
                    '</div></td></tr>';

                for (m = 0; m < maneuverList.length; m++) {

                    maneuver = maneuverList[m];
                    maneuverMinutes = Math.round(maneuver.time / 60);
                    maneuverDistance = Math.round(maneuver.distance * 10) / 10;

                    maneuverHtml = '<tr>' +
                        '<td class="map_maneuver_rownum">' + (m + 1) + '.' + '</td>' +
                        '<td>' + maneuver.narrative + '</td>' +
                        '<td class="map_maneuver_distance">' +
                        (m < maneuverList.length - 1 ? neuro.mapTools.pluralText(maneuverDistance, 'mile') : '&nbsp;') + // Last maneuver has no distance
                        '</td>' +
                        '</tr>';
                    routeHtml += maneuverHtml;
                }
            }

            routeHtml += '</table>';
        }
        else {

            routeHtml = '<span class="general_cautionmsg">Sorry, but no route directions are available.</span>';
        }

        return routeHtml;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw points of interest (our addresses) on the map.

    placePointsOnMap: function (mapInfo) {
        'use strict';

        var addressItem, poiIndex;
        var latLng;

        for (poiIndex = 0; poiIndex < mapInfo.addressList.length; poiIndex++) {

            addressItem = mapInfo.addressList[poiIndex];

            if (addressItem.geoquality !== neuro.mapTools.GEOCODE_QUALITY_MISSING) {

                latLng = addressItem.latLng;
                neuro.mapTools.addPoiIconToMap(mapInfo, (poiIndex + 1).toString(), latLng.lat, latLng.lng, addressItem.title, addressItem.content);
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Add a point of interest to the map, with a given icon.
    //
    // Note that MapQuest provides standard icons. See http://www.mapquestapi.com/staticmap/icons.html

    addPoiIconToMap: function (mapInfo, poiSymbol, lat, lng, poiText, poiSubtext) {
        'use strict';

        var fullpoiTextHtml;

        // Set the text poiText and poiSubtext for the POI. If null, we ignore.

        if (poiText || poiSubtext) {

            if (poiText !== '' && poiSubtext !== '') {
                fullpoiTextHtml = poiText + '<br />' + poiSubtext;
            }
            else {
                fullpoiTextHtml = poiText + poiSubtext;
            }
        }

        // Place the POI on the map.

        L.mapquest.textMarker([lat, lng], {
            text: poiText,
            subtext: poiSubtext,
            position: 'right',
            type: 'marker',
            icon: {
                primaryColor: neuro.mapTools.ICON_CLIENT_COLOR1,
                secondaryColor: neuro.mapTools.ICON_CLIENT_COLOR2,
                size: neuro.mapTools.ICON_CLIENT_SIZE,
                symbol: poiSymbol
            }
        }).addTo(mapInfo.myMap);

    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Add an icon on the map representing the client's home and the current location of the device 
    // (the caregiver's mobile phone).
    //
    // TODO: MapQuest says they may add the ability to use our own graphic symbols. Update this when and
    // if that feature is added.

    addGpsClientIconToMap: function (mapInfo, lat, lng) {
        'use strict';

        var icon;

        // Place the POI on the map.

        icon = L.marker([lat, lng], {
            icon: L.mapquest.icons.flag({
                primaryColor: neuro.mapTools.ICON_GPS_CLIENT_COLOR1,
                secondaryColor: neuro.mapTools.ICON_GPS_CLIENT_COLOR2,
                size: neuro.mapTools.ICON_GPS_CLIENT_SIZE,
                symbol: 'VISIT'
            })
        });

        icon.addTo(mapInfo.myMap);

        return icon;
    },

    addGpsClientBullseyeIconToMap: function (mapInfo, lat, lng, radiusMeters) {
        'use strict';

        var icon;

        // Place the POI on the map.

        icon = L.circle([lat, lng], {
            radius: radiusMeters,
            color: neuro.mapTools.ICON_GPS_CLIENT_BULLSEYE_COLOR
        });

        icon.addTo(mapInfo.myMap);

        return icon;
    },

    addGpsDeviceIconToMap: function (mapInfo, lat, lng, staffNameInitials) {
        'use strict';

        var icon;

        // Place the POI on the map.

        icon = L.marker([lat, lng], {
            icon: L.mapquest.icons.flag({
                primaryColor: neuro.mapTools.ICON_GPS_DEVICE_COLOR1,
                secondaryColor: neuro.mapTools.ICON_GPS_DEVICE_COLOR2,
                size: neuro.mapTools.ICON_GPS_DEVICE_SIZE,
                symbol: staffNameInitials
            })
        });

        icon.addTo(mapInfo.myMap);

        return icon;
    },

    addGpsDeviceAccuracyIconToMap: function (mapInfo, lat, lng, radiusMeters) {
        'use strict';

        var icon;

        // Place the POI on the map.

        icon = L.circle([lat, lng], {
            radius: radiusMeters,
            color: neuro.mapTools.ICON_GPS_DEVICE_ACCURACY_COLOR
        });

        icon.addTo(mapInfo.myMap);

        return icon;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Return the singular or plural of the given units and noun. For example, "1 mile" or "2 miles."
    //
    // This function handles simple nouns whose plural just adds a trailing "s".

    pluralText: function (units, noun) {
        'use strict';

        var unitsClean = 0;
        var s;

        // Clean up the degenerate case

        if (units !== null && units !== undefined && !isNaN(units)) {
            unitsClean = units;
        }

        if (unitsClean === 1) {
            s = String(unitsClean) + '&nbsp;' + noun;
        }
        else {
            s = String(unitsClean) + '&nbsp;' + noun + 's';
        }
        return s;
    }
};
