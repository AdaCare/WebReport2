// Copyright 2010, 2011, 2012, 2013 by Neurosoftware, LLC.
//
// neuro.map.v4.2.js
// Sandy Gettings
//
// This version is written to MapQuest v7.0
//
// This is a library that draws maps with JavaScript.
//
// Revised 2013-10-10
// -- Added buttons to select the route type (fastest, shortest, etc.)
// -- Changes to support mobile devices.
// Revised 2014-04-14 SG Minor improvements.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof neuro !== 'object') {
    throw new Error('neuro is already defined, but is not an object!');
}

if (!neuro.map) { neuro.map = {}; }
else { throw new Error('neuro.map is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constants

neuro.map = {
    GEOCODE_QUALITY_EXACT: 'A',
    GEOCODE_QUALITY_GOOD: 'B',
    GEOCODE_QUALITY_APPROX: 'C',
    GEOCODE_QUALITY_MISSING: 'X',

    ZOOM_DEFAULT: 12,
    MAPTYPE_DEFAULT: 'map',

    MAP_UNITS_MI: 'm', // Miles
    MAP_UNITS_KM: 'k', // Kilometers

    // Definition of map fields on page

    mapDivID: 'mapDiv',
    mapManeuversDivID: 'mapManeuvers',
    isMobile: false,                     // True if this map is for a mobile device.

    // Define the type of route: fastest, shortest, etc. We put this into a global so it will be available
    // to callback functions as well.

    ROUTE_TYPE_OPTION_FASTEST: "fastest",
    ROUTE_TYPE_OPTION_SHORTEST: "shortest",
    ROUTE_TYPE_OPTION_PEDESTRIAN: "pedestrian",
    ROUTE_TYPE_OPTION_PUBLIC_TRANSPORT: "multimodal",

    RouteTypeOption: neuro.map.ROUTE_TYPE_OPTION_FASTEST,

    addressList: [],    // List of Address objects to be mapped
    poiList: [],        // List of POIs (points of interest, the stops on our route)

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw the map with the addresses and routes.

    drawMap: function () {
        'use strict';

        if (neuro.map.addressList.length > 0) {
            neuro.map.openMap(neuro.map.addressList[0].latLng.lat, neuro.map.addressList[0].latLng.lng);
        }
        else {
            neuro.map.openMap(40, -105); // Remove these later...
        }

        neuro.map.drawRoute();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Best fit the map to the points. We need a minimum zoom, because two points very close
    // together (or just a single point) default to a too-close zoom. Both of these methods work.

    bestFitMap: function () {
        'use strict';

        var currentZoom;

        // Method #1
        //neuro.map.myMap.zoomToRect(neuro.map.myMap.getBounds(), false, neuro.map.ZOOM_DEFAULT);

        // Method #2

        if (neuro.map.myMap) { // Should always be non-null unless there's no map displayed
            neuro.map.myMap.bestFit();
            currentZoom = neuro.map.myMap.getZoomLevel();
            currentZoom = Math.min(currentZoom, neuro.map.ZOOM_DEFAULT);
            neuro.map.myMap.setZoomLevel(currentZoom);
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw a map at the given centerpoint.

    openMap: function (mapLat, mapLng) {
        'use strict';

        var mapDivElem;
        var myLatLng;
        var mapOptions;

        mapDivElem = document.getElementById(neuro.map.mapDivID);

        if (mapLat !== null && mapLat !== undefined && mapLng !== null && mapLng !== undefined) {

            myLatLng = new MQA.LatLng(mapLat, mapLng);
            mapOptions = { elt: mapDivElem, zoom: neuro.map.ZOOM_DEFAULT, latLng: myLatLng, mtype: neuro.map.MAPTYPE_DEFAULT };
            neuro.map.myMap = new MQA.TileMap(mapOptions);
        }
        else {
            mapOptions = { elt: mapDivElem, zoom: neuro.map.ZOOM_DEFAULT };
            neuro.map.myMap = new MQA.TileMap(mapOptions);
        }

        neuro.map.initMapControls();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    initMapControls: function () {
        'use strict';

        var mapOptions;

        if (neuro.map.isMobile) {

            //MQA.withModule('smallzoom', 'geolocationcontrol', 'traffictoggle', function () {
            MQA.withModule('smallzoom', 'geolocationcontrol', function () {

                neuro.map.myMap.addControl(new MQA.SmallZoom(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5, 5)));
                // adacare.mobilelib.Mapping.MyMap.addControl(new MQA.TrafficToggle(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT)); // Doesn't seem to work on iPhone
                neuro.map.myMap.addControl(new MQA.GeolocationControl(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(5, 5)));
            });
        }

        else {

            MQA.withModule('largezoom',
                'viewoptions',
                'insetmapcontrol',
                'traffictoggle',
                'geolocationcontrol',

                function () {

                    neuro.map.myMap.addControl(new MQA.LargeZoom(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5, 5)));
                    neuro.map.myMap.addControl(new MQA.ViewOptions());

                    mapOptions = {
                        size: { width: 150, height: 125 },
                        zoom: 4,
                        mapType: 'map',
                        minimized: false
                    };

                    neuro.map.myMap.addControl(new MQA.InsetMapControl(mapOptions), new MQA.MapCornerPlacement(MQA.MapCorner.BOTTOM_RIGHT));
                    neuro.map.myMap.addControl(new MQA.TrafficToggle(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT));

                    // Place the geolocation "find me" control a bit blelow the top-right corner,
                    // so we don't overlay the traffic control.

                    neuro.map.myMap.addControl(new MQA.GeolocationControl(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(10, 50)));
                });
        }
    },

    /***
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Function to call when recentering map on double-click
    
    recenterOnClick : function(e) {
            'use strict';
    
    neuro.map.myMap.panToLatLng(e.ll);      // Animated pan to new center
    //neuro.map.myMap.setCenter(e.ll);      // Or, instant shift to new center
    },
    ***/

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Constructor for AddressItem

    AddressItem: function (street, city, state, postalCode, country, title, content, lat, lng, quality) {
        'use strict';

        //var poi;
        var latLng;
        //var qualityText;

        // Construct a point of interest. If the geocode quality is "missing," then
        // we substitute a fake lat/lng. Perhaps we should have a dedicated "invalid" lat/lng value?

        if (quality !== neuro.map.GEOCODE_QUALITY_MISSING) {
            latLng = new MQA.LatLng(lat, lng);
        }
        else {
            latLng = new MQA.LatLng(0, 0);
        }

        this.street = street;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.title = title;
        this.content = content;
        this.latLng = latLng;
        this.geoquality = quality;

        // This used to be a prototype, so that the function is defined only once for all instances.
        // Need to figure this out again since this code was reorganized.
        //AddressItem.prototype.geoqualityDescrip = function () {
        this.geoqualityDescrip = function () {
            'use strict';

            var gqText;

            switch (this.geoquality) {

                case neuro.map.GEOCODE_QUALITY_EXACT: // Exact match
                    gqText = '';
                    break;

                case neuro.map.GEOCODE_QUALITY_GOOD: // Good match
                    gqText = 'This address is only approximate, please verify';
                    break;

                case neuro.map.GEOCODE_QUALITY_APPROX: // Approximate match
                    gqText = 'This address is only approximate, please verify';
                    break;

                case neuro.map.GEOCODE_QUALITY_MISSING: // Match is unknown
                    gqText = 'Caution -- this address is unknown, please verify';
                    break;

                default:
                    this.geoquality = neuro.map.GEOCODE_QUALITY_MISSING;
                    gqText = 'Caution -- this address is unknown, please verify';
                    break;
            }

            return gqText;
        };

        // Return a nicely-formatted address: street, city, state postal code

        this.formattedAddress = function () {
            'use strict';

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
    // Add a route point to the list, given lat/lng.

    addAddressItem: function (street, city, state, postalCode, country, title, content, lat, lng, quality) {
        'use strict';

        var thisAddressItem, index;

        thisAddressItem = new neuro.map.AddressItem(street, city, state, postalCode, country, title, content, lat, lng, quality);
        index = neuro.map.addressList.length;
        neuro.map.addressList[index] = thisAddressItem;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Insert the given address object at the beginning of the list.

    insertAddressAtBeginning: function (addressItem) {
        'use strict';

        var addressCount, i;

        addressCount = neuro.map.addressList.length;

        for (i = addressCount - 1; i >= 0; i--) {

            neuro.map.addressList[i + 1] = neuro.map.addressList[i];
        }

        neuro.map.addressList[0] = addressItem;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Geocode all the addresses in our list.

    geocodeAndDrawAddressList: function () {
        'use strict';

        var location, locationList = [];
        var addressItem, addressCount, a;

        // Find all the addresses that need geocoding. No sense in doing this for addresses that have
        // good geocodes already.

        neuro.map.initRouteNarrative();
        addressCount = neuro.map.addressList.length;

        for (a = 0; a < addressCount; a++) {

            addressItem = neuro.map.addressList[a];

            if (addressItem.geoquality === neuro.map.GEOCODE_QUALITY_MISSING) {

                location = {};
                location.street = addressItem.street;
                location.city = addressItem.city;
                location.state = addressItem.state;
                location.postalCode = addressItem.postalCode;
                location.country = addressItem.country;
                locationList[locationList.length] = location;
            }
        }

        // If any addresses needed geocoding, do it now.

        if (locationList.length > 0) {
            MQA.withModule('geocoder', function () {

                MQA.Geocoder.geocode(locationList, null, null, neuro.map.geocodeAndDrawAddressListCallback);
            });
        }
        else {
            neuro.map.drawMap();
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

    geocodeAndDrawAddressListCallback: function (response, errinfo) {
        'use strict';

        var resultsList, resultsCount, r;
        var locationList, location, providedLocation;
        var streetFound, cityFound;
        var latLng, quality;
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
                    quality = location.geocodeQualityCode.charAt(2);
                    latLng = location.latLng;
                    mapUrl = location.mapUrl;
                }
                else {
                    streetFound = '';
                    cityFound = '';
                    quality = neuro.map.GEOCODE_QUALITY_MISSING;
                }

                // Search our list of address to find this location, and
                // update the address's lat/lng info.

                addressCount = neuro.map.addressList.length;

                for (a = 0; a < addressCount; a++) {

                    addressItem = neuro.map.addressList[a];
                    if (streetFound === addressItem.street && cityFound === addressItem.city) {

                        addressItem = neuro.map.addressList[a];
                        addressItem.latLng = latLng;
                        addressItem.geoquality = quality;
                        break;
                    }
                }
            }
        }

        neuro.map.drawMap();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw the route on the map.

    drawRoute: function () {
        'use strict';

        var routeHtml, routeElem;
        var location, locationList = [];
        var addressItem, addressCount, a;
        var anyMissing = false;

        // If we have at least two addresses, we'll try to draw a route.

        addressCount = neuro.map.addressList.length;

        if (addressCount >= 2) {

            // See if any addresses are poor quality and prevent the route from being drawn.

            for (a = 0; a < addressCount; a++) {

                addressItem = neuro.map.addressList[a];

                if (addressItem.geoquality === neuro.map.GEOCODE_QUALITY_MISSING) {

                    anyMissing = true;
                    break;
                }
            }

            // Draw the route ribbon and write the text for the maneuvers.
            // TBD: We'll draw the ribbon in pairs of addresses, so we can skip any that are insufficient.
            // For now, we'll just skip the route ribbon if there are any missing points.

            if (!anyMissing) {

                for (a = 0; a < addressCount; a++) {

                    addressItem = neuro.map.addressList[a];

                    if (addressItem.geoquality !== neuro.map.GEOCODE_QUALITY_MISSING) {

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

                        if (addressItem.geoquality !== neuro.map.GEOCODE_QUALITY_EXACT) {
                            location.latLng = addressItem.latLng;
                        }

                        locationList[locationList.length] = location;
                    }
                }

                // "multimodal" routes need the timeType specified.
                //
                // To get POIs with labels, see this: http://developer.mapquest.com/web/documentation/sdk/javascript/v7.0/routing#advanced

                MQA.withModule('directions', function () {
                    neuro.map.myMap.addRoute(
                        locationList,
                        { routeOptions: { routeType: neuro.map.RouteTypeOption, timeType: 1 }, ribbonOptions: { draggable: true, draggablepoi: true } },
                        function (data) {
                            //neuro.map.placePointsOnMap(); // Nope, this just overlays a second set of icons
                            neuro.map.placeRouteNarrative(data, 0);
                            neuro.map.bestFitMap();
                        }
                    );
                });

            }
            else {
                routeElem = document.getElementById(neuro.map.mapManeuversDivID);
                routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table

                routeHtml += '<tr><td colspan="3">' +
                '<div class="general_infomsg_box" style="padding: 4px">' +
                'Some locations do not have an accurate address on file, so driving directions are not available' +
                '</div></td></tr>';

                routeHtml += '</table>';
                routeElem.innerHTML = routeHtml;
                neuro.map.placeRouteAddressesOnlyHtml(); // Draw symbols at each address in lieu of a route.
                neuro.map.placePointsOnMap();
                neuro.map.bestFitMap();
            }
        }
        else {
            neuro.map.placeRouteAddressesOnlyHtml(); // Draw symbols at each address in lieu of a route.
            neuro.map.placePointsOnMap();
            neuro.map.bestFitMap();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the maneuvers text, that displays the addresses (with notes about quality) or the full
    // turn-by-turn narrative. (By "init," we just display a nice little "please wait" message that
    // will be replaced by the proper narrative when it is returned by MapQuest.)

    initRouteNarrative: function () {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(neuro.map.mapManeuversDivID);
        routeHtml = "Please wait...";
        routeElem.innerHTML = routeHtml;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw points of interest (our addresses) on the map. This is used when we are just displaying the
    // list of addresses, but not the turn-by-turn narrative.

    placeRouteAddressesOnlyHtml: function () {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(neuro.map.mapManeuversDivID);
        routeHtml = neuro.map.generateAddressesHtml();
        routeElem.innerHTML = routeHtml;  // Was "+=", should still be ok
    },

    generateAddressesHtml: function () {
        'use strict';

        var routeHtml = '';
        var qualityText, qualityHtml;
        var addressItem, a;
        //var latLng;

        // Draw each address as a point of interest. This is needed when *not* drawing a route, which
        // places its own symbols on the map.

        routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table

        routeHtml += '<tr><td colspan="3"><div class="map_maneuvers_header">' +
                'Addresses' +
                '</div></td></tr>';

        for (a = 0; a < neuro.map.addressList.length; a++) {

            addressItem = neuro.map.addressList[a];

            //if (addressItem.geoquality !== neuro.map.GEOCODE_QUALITY_MISSING) {

            //    latLng = addressItem.latLng;
            //    neuro.map.addPoiToMap(latLng.lat, latLng.lng, addressItem.title, addressItem.content);
            //}

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

    placeRouteNarrative: function (data, addressStartIndex) {
        'use strict';

        var routeElem, routeHtml;

        routeElem = document.getElementById(neuro.map.mapManeuversDivID);
        routeHtml = neuro.map.generateRouteNarrativeHtml(data, addressStartIndex);
        routeElem.innerHTML = routeHtml;
    },

    generateRouteNarrativeHtml: function (data, addressStartIndex) {
        'use strict';

        var routeMinutes, routeDistance, routeHtml = '', i;
        var leg, legList, legMinutes, legDistance;
        var maneuver, maneuverList, maneuverDistance, maneuverHtml, m;
        var maneuverMinutes;
        var qualityText, qualityHtml;
        var addressItem;

        if (data.route && data.info.statuscode == 0) {

            routeMinutes = Math.round(data.route.time / 60);
            routeDistance = Math.round(data.route.distance * 10) / 10;
            routeHtml = '<table class="map_maneuvers_outer_box">'; // Surround the maneuvers in a table
            legList = data.route.legs;

            routeHtml += '<tr><td colspan="3"><div class="map_maneuvers_header">' +
                'Driving Directions (' +
                neuro.map.pluralText(routeDistance, 'mile') + ', ' + neuro.map.pluralText(routeMinutes, 'minute') +
                ')' +
                '</div></td></tr>';

            // Display the starting address

            addressItem = neuro.map.addressList[addressStartIndex];
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
                addressItem = neuro.map.addressList[addressStartIndex + i + 1];
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
                ' (' + neuro.map.pluralText(legDistance, 'mile') + ', ' + neuro.map.pluralText(legMinutes, 'minute') + ')' +
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
                    (m < maneuverList.length - 1 ? neuro.map.pluralText(maneuverDistance, 'mile') : '&nbsp;') + // Last maneuver has no distance
                    '</td>' +
                    '</tr>';
                    routeHtml += maneuverHtml;
                }
            }

            routeHtml += '</table>';

            return routeHtml;
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Draw points of interest (our addresses) on the map.

    placePointsOnMap: function () {
        'use strict';

        var addressItem, poiIndex;
        var latLng;

        for (poiIndex = 0; poiIndex < neuro.map.addressList.length; poiIndex++) {

            addressItem = neuro.map.addressList[poiIndex];

            if (addressItem.geoquality !== neuro.map.GEOCODE_QUALITY_MISSING) {

                latLng = addressItem.latLng;
                neuro.map.addPoiToMap(poiIndex, latLng.lat, latLng.lng, addressItem.title, addressItem.content);
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Add a point of interest to the map.
    //
    // Parms:
    // - poiIndex: Index number of the POI (0, 1, 2, ...)
    // - lat & lng: Latitude and longitude.
    // - title: The short title that pops up on mouseover.
    // - content: Longer text, displayed after title on click.

    addPoiToMap: function (poiIndex, lat, lng, title, content) {
        'use strict';

        var ICON_NUMBER_URL = 'https://www.mapquestapi.com/staticmap/geticon?uri=poi-orange-{0}.png';

        var poi, latLng, fulltitleHtml;
        var icon, iconUrl;

        latLng = new MQA.LatLng(lat, lng);

        if (title !== '' && content !== '') {
            fulltitleHtml = title + '<br />' + content;
        }
        else {
            fulltitleHtml = title + content;
        }

        poi = new MQA.Poi(latLng);

        poi.setInfoTitleHTML(fulltitleHtml);
        poi.setRolloverContent(title);         
        poi.setInfoContentHTML(fulltitleHtml); 

        iconUrl = ICON_NUMBER_URL.replace('{0}', poiIndex+1);
        icon = new MQA.Icon(iconUrl, 27, 26);
        poi.setIcon(icon);
        poi.setIconOffset(new MQA.Point(-3, -27)); // Hand-fudged X & Y offsets for positioning icon relative to POI lat/lng

        neuro.map.myMap.addShape(poi);
        poi.toggleInfoWindow();                 // Doesn't seem to do anything

        // POI object should not be local to this function, or it will be disposed.

        neuro.map.poiList[neuro.map.poiList.length] = poi;
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

    // TBD -- we'll want something like this when we learn to raw routes in segments.

    /***
    neuro.map.drawOneRoute = function(n, myRouteResults, trekOverlays) {
    
    var routeOverlay = new MQA.LineOverlay();
    var trekRoutesColl;
    
    trekRoutesColl = myRouteResults.getTrekRoutes();
    routeOverlay.setColor('#00FF00');
    routeOverlay.setColorAlpha(0.6);
    routeOverlay.setBorderWidth(8);
    routeOverlay.setShapePoints(trekRoutesColl.get(0).getShapePoints());
    routeOverlay.setKey(n);
    trekOverlays.add(routeOverlay);
    neuro.map.myMap.addShape(routeOverlay); // DEBUG
    };
    ***/
};
