// Copyright 2010, 2011, 2012 by Neurosoftware, LLC.
//
// neuro.map.v3.1.js
// Sandy Gettings
// Revised 10/10/2013
// -- Added buttons to select the route type (fastest, shortest, etc.)
// This version is written to MapQuest v7.0
//
// This is a library that draws maps with JavaScript.

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof (neuro) !== 'object') {
    throw new Error('neuro is already defined, but is not an object!');
}

if (!neuro.map) { neuro.map = {}; }
else { throw new Error('neuro.map is already defined!'); }

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constants

neuro.map.GEOCODE_QUALITY_EXACT = 'A';
neuro.map.GEOCODE_QUALITY_GOOD = 'B';
neuro.map.GEOCODE_QUALITY_APPROX = 'C';
neuro.map.GEOCODE_QUALITY_MISSING = 'X';

neuro.map.ZOOM_DEFAULT = 12;
neuro.map.MAPTYPE_DEFAULT = 'map';

neuro.map.MAP_UNITS_MI = 'm'; // Miles
neuro.map.MAP_UNITS_KM = 'k'; // Kilometers

// Definition of map fields on page

neuro.map.mapDivID = 'mapDiv';
neuro.map.mapManeuversID = 'mapManeuvers';

// Define the type of route: fastest, shortest, etc. We put this into a global so it will be available
// to callback functions as well.

neuro.map.RouteTypeOption = 'fastest';

///////////////////////////////////////////////////////////////////////////////////////////////////
//  Proxy server variables
//  Since it is my server, I can leave these blank, it's relative to the page

//neuro.map.proxyServerName = '';
//neuro.map.proxyServerPort = '';

// The address of the proxy page

//neuro.map.proxyServerPath = '/JSAPIProxyPage/proxy.aspx';

// MapQuest server variables

//neuro.map.mapServer = 'map.free.mapquest.com';
//neuro.map.geocodeServer = 'geocode.free.mapquest.com';
//neuro.map.routeServer = 'route.free.mapquest.com';
//neuro.map.mqPath = 'mq';
//neuro.map.mqPort = '80';

neuro.map.addressList = new Array();

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw the map with the addresses and routes.

neuro.map.drawMap = function () {

    if (neuro.map.addressList.length > 0) {
        neuro.map.openMap(neuro.map.addressList[0].latLng.lat, neuro.map.addressList[0].latLng.lng);
    }
    else {
        neuro.map.openMap(40, -105); // Remove these later...
    }

    neuro.map.drawRoute();
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Best fit the map to the points. We need a minimum zoom, because two points very close
// together (or just a single point) default to a too-close zoom. Both of these methods work.

neuro.map.bestFitMap = function () {

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
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw a map at the given centerpoint.

neuro.map.openMap = function (mapLat, mapLng) {

    var mapDivElem;
    var myLatLng;
    var mapOptions;

    mapDivElem = document.getElementById(neuro.map.mapDivID);

    if (mapLat !== null && mapLat !== undefined && mapLng !== null && mapLng !== undefined) {

        myLatLng = new MQA.LatLng(mapLat, mapLng);
        //neuro.map.myMap = new MQA.TileMap(mapDivElem, neuro.map.ZOOM_DEFAULT, myLatLng, neuro.map.MAPTYPE_DEFAULT); // For MapQuest v6
        mapOptions = { elt: mapDivElem, zoom: neuro.map.ZOOM_DEFAULT, latLng: myLatLng, mtype: neuro.map.MAPTYPE_DEFAULT }; // For MapQuest v7
        neuro.map.myMap = new MQA.TileMap(mapOptions); // For MapQuest v7
    }
    else {
        //neuro.map.myMap = new MQA.TileMap(mapDivElem, neuro.map.ZOOM_DEFAULT);  // For MapQuest v6
        mapOptions = { elt: mapDivElem, zoom: neuro.map.ZOOM_DEFAULT }; // For MapQuest v7
        neuro.map.myMap = new MQA.TileMap(mapOptions); // For MapQuest v7
    }

    neuro.map.initMapControls();
};

///////////////////////////////////////////////////////////////////////////////////////////////////

neuro.map.initMapControls = function () {

    var mapOptions;

    MQA.withModule('largezoom',
        'viewoptions',
        'insetmapcontrol',
        'traffictoggle',
        'geolocationcontrol',

        function () {

            neuro.map.myMap.addControl(
                new MQA.LargeZoom(),
                new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5, 5))
            );

            neuro.map.myMap.addControl(
                new MQA.ViewOptions()
            );

            mapOptions = {
                size: { width: 150, height: 125 },
                zoom: 4,
                mapType: 'map',
                minimized: false
            };

            neuro.map.myMap.addControl(
                new MQA.InsetMapControl(mapOptions),
                new MQA.MapCornerPlacement(MQA.MapCorner.BOTTOM_RIGHT)
            );

            neuro.map.myMap.addControl(
                new MQA.TrafficToggle(),
                new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT)
                );

            // Place the geolocation "find me" control a bit blelow the top-right corner,
            // so we don't overlay the traffic control.

            neuro.map.myMap.addControl(
                new MQA.GeolocationControl(), new MQA.MapCornerPlacement(MQA.MapCorner.TOP_RIGHT, new MQA.Size(10, 50))
            );
        });
};

/***
///////////////////////////////////////////////////////////////////////////////////////////////////
// Function to call when recentering map on double-click

neuro.map.recenterOnClick = function(e) {

neuro.map.myMap.panToLatLng(e.ll);      // Animated pan to new center
//neuro.map.myMap.setCenter(e.ll);      // Or, instant shift to new center
};
***/

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a point of interest to the map.

neuro.map.addPoiToMap = function (lat, lng, title, content) {

    var poi, latLng, fulltitle;
    //var icon;

    latLng = new MQA.LatLng(lat, lng);
    //icon = new MQA.Icon('/mapimages/MQ00201bluehouse.gif', 16, 16);

    if (title !== '' && content !== '') {
        fulltitle = title + ' ' + content;
    }
    else {
        fulltitle = title + content;
    }

    poi = new MQA.Poi(latLng);
    //poi.setIcon(icon);

    //poi.setInfoTitleHTML(fulltitle);
    poi.setRolloverContent(title);          // Doesn't seem to do anything
    poi.setInfoContentHTML(fulltitle);      // Doesn't seem to do anything
    neuro.map.myMap.addShape(poi);
    poi.toggleInfoWindow();                 // Doesn't seem to do anything
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Constructor for AddressItem

neuro.map.AddressItem = function (street, city, state, postalCode, country, title, content, lat, lng, quality) {

    //var poi;
    var latLng, qualityText;

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

    switch (this.geoquality) {

        case neuro.map.GEOCODE_QUALITY_EXACT: // Exact match
            qualityText = '';
            break;

        case neuro.map.GEOCODE_QUALITY_GOOD: // Good match
            qualityText = 'This address is only approximate, please verify';
            break;

        case neuro.map.GEOCODE_QUALITY_APPROX: // Approximate match
            qualityText = 'This address is only approximate, please verify';
            break;

        case neuro.map.GEOCODE_QUALITY_MISSING: // Match is unknown
            qualityText = 'Caution -- this address is unknown, please verify';
            break;

        default:
            this.geoquality = neuro.map.GEOCODE_QUALITY_MISSING;
            qualityText = 'Caution -- this address is unknown, please verify';
            break;
    }
    this.geoqualityText = qualityText;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Add a route point to the list, given lat/lng.

neuro.map.addAddressItem = function (street, city, state, postalCode, country, title, content, lat, lng, quality) {

    var thisAddressItem, index;

    thisAddressItem = new neuro.map.AddressItem(street, city, state, postalCode, country, title, content, lat, lng, quality);
    index = neuro.map.addressList.length;
    neuro.map.addressList[index] = thisAddressItem;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Geocode all the addresses in our list.

neuro.map.geocodeAddressList = function () {

    var location, locationList = new Array();
    var addressItem, addressCount, a;

    addressCount = neuro.map.addressList.length;
    for (a = 0; a < addressCount; a++) {

        addressItem = neuro.map.addressList[a];

        if (addressItem.geoquality === neuro.map.GEOCODE_QUALITY_MISSING) {

            location = new Object();
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

            MQA.Geocoder.geocode(locationList, null, null, neuro.map.geocodeAddressListCallback);
        });
    }
    else {
        neuro.map.drawMap();
    }
};

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

neuro.map.geocodeAddressListCallback = function (response, errinfo) {

    var resultsList, resultsCount, r;
    var locationList, location, providedLocation;
    var streetFound, cityFound;
    var latLng, quality, mapUrl;
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
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw points of interest (our addresses) on the map.

neuro.map.drawAddresses = function () {

    var routeElem, routeHtml = '';
    var qualityText, qualityHtml;
    var addressItem, a;
    var latLng;

    // Draw each address as a point of interest. This is needed when *not* drawing a route, which
    // places its own symbols on the map.

    routeElem = document.getElementById(neuro.map.mapManeuversID);
    routeHtml = '<table class="gridview_content">'; // Surround the maneuvers in a table

    routeHtml += '<tr><td colspan="3"><div class="gridview_header">' +
            'Addresses' +
            '</div></td></tr>';

    for (a = 0; a < neuro.map.addressList.length; a++) {

        addressItem = neuro.map.addressList[a];

        if (addressItem.geoquality !== neuro.map.GEOCODE_QUALITY_MISSING) {

            latLng = addressItem.latLng;
            neuro.map.addPoiToMap(latLng.lat, latLng.lng, addressItem.title, addressItem.content);
        }
        qualityText = addressItem.geoqualityText;

        if (qualityText !== '') {
            qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
        }
        else {
            qualityHtml = '';
        }

        routeHtml += '<tr><td>&nbsp;</td><td colspan="2"><div class="map_trek_head">' +
            addressItem.title +
            '<tr><td>&nbsp;</td><td colspan="2">' + addressItem.street +
            ', ' + addressItem.city + ' ' + addressItem.state + ' ' + addressItem.postalCode +
            qualityHtml +
            '</td></tr></div></td></tr>';

    }
    neuro.map.bestFitMap();
    routeHtml += '</table>';
    routeElem.innerHTML += routeHtml;
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw the route on the map.

neuro.map.drawRoute = function () {

    var routeHtml, routeElem;
    var location, locationList = new Array();
    var addressItem, addressCount, a;
    var anyMissing = false;

    // If we have at least two addresses, we'll try to draw a route.

    addressCount = neuro.map.addressList.length;

    if (addressCount >= 2) {

        // See if any addresses are poor quality, that will prevent the route from being drawn.

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

                    location = new Object();
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

            MQA.withModule('directions', function () {
                neuro.map.myMap.addRoute(locationList,
                { routeOptions: { routeType: neuro.map.RouteTypeOption, timeType: 1 }, ribbonOptions: { draggable: true, draggablepoi: true } },
                function (data) {
                    neuro.map.drawRouteNarrative(data, 0);
                    neuro.map.bestFitMap();
                }
            );
            });

        }
        else {
            routeElem = document.getElementById(neuro.map.mapManeuversID);
            routeHtml = '<table class="gridview_content">'; // Surround the maneuvers in a table

            routeHtml += '<tr><td colspan="3">' +
            '<div class="general_infomsg_box" style="padding: 4px">' +
            'Some locations do not have an accurate address on file, so driving directions are not available' +
            '</div></td></tr>';

            routeHtml += '</table>';
            routeElem.innerHTML = routeHtml;
            neuro.map.drawAddresses(); // Draw symbols at each address in lieu of a route.
        }
    }
    else {
        neuro.map.drawAddresses(); // Draw symbols at each address in lieu of a route.
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Draw the route narrative.

neuro.map.drawRouteNarrative = function (data, addressStartIndex) {

    var routeMinutes, routeDistance, routeElem, routeHtml = '', i;
    var leg, legList, legMinutes, legDistance;
    var maneuver, maneuverList, maneuverMinutes, maneuverDistance, maneuverHtml, m;
    var qualityText, qualityHtml;
    var addressItem;

    if (data.route) {

        routeMinutes = Math.round(data.route.time / 60);
        routeDistance = Math.round(data.route.distance * 10) / 10;
        routeElem = document.getElementById(neuro.map.mapManeuversID);
        routeHtml = '<table class="gridview_content">'; // Surround the maneuvers in a table
        legList = data.route.legs;

        routeHtml += '<tr><td colspan="3"><div class="gridview_header">' +
            'Driving Directions (' +
            neuro.map.pluralText(routeDistance, 'mile') + ', ' + neuro.map.pluralText(routeMinutes, 'minute') +
            ')' +
            '</div></td></tr>';

        // Display the starting address

        addressItem = neuro.map.addressList[addressStartIndex];
        qualityText = addressItem.geoqualityText;

        if (qualityText !== '') {
            qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
        }
        else {
            qualityHtml = '';
        }
        routeHtml += '<tr><td>&nbsp;</td><td colspan="2"><div class="map_trek_head">' +
            'Start at ' + addressItem.title + ', ' +
            addressItem.street + ', ' + addressItem.city + ' ' + addressItem.state + ' ' + addressItem.postalCode +
            qualityHtml +
            '</div></td></tr>';

        for (i = 0; i < legList.length; i++) {

            leg = legList[i];
            addressItem = neuro.map.addressList[addressStartIndex + i + 1];
            qualityText = addressItem.geoqualityText;

            if (qualityText !== '') {
                qualityHtml = '<br /><span class="map_quality_warning">' + qualityText + '</span>';
            }
            else {
                qualityHtml = '';
            }

            maneuverList = leg.maneuvers;
            legMinutes = Math.round(leg.time / 60);
            legDistance = Math.round(leg.distance * 10) / 10;

            routeHtml += '<tr><td>&nbsp;</td><td colspan="2"><div class="map_trek_head">' +
            'To ' + addressItem.title + ', ' +
            addressItem.street + ', ' + addressItem.city + ' ' + addressItem.state + ' ' + addressItem.postalCode +
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
        routeElem.innerHTML = routeHtml;
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////
// Return the singular or plural of the given units and noun. For example, "1 mile" or "2 miles."
//
// This function handles simple nouns whose plural just adds a trailing "s".

neuro.map.pluralText = function (units, noun) {

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
};

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

///////////////////////////////////////////////////////////////////////////////////////////////////
// Start from URL

neuro.map.startFromUrl = function () {

    var street, city, state, postalCode, country, title;
    var lat, lng, quality;
    var argCount, i;
    var argName;
    var args = adacare.lib.getArgs();

    argCount = 0;
    for (argName in args) {
        argCount++;
    }

    if (argCount > 0) {

        for (i = 0; i < 10; i++) {

            // Programmer's note: I've seen some instances when the URL was encoded with spaces replaced
            // by plus signs. E.g., "123 Maple St" as "123+Maple+St". I'm not sure how it happens, as it
            // hasn't been reproducible. The only bad effect is that the addresses in the navigation text
            // look a bit odd, but it doesn't cause any problems. If the issue happens very often, we
            // might want to decode the plus signs back to spaces to keep everything looking pretty.

            street = args["street" + i];
            city = args["city" + i];
            state = args["state" + i];
            postalCode = args["postalCode" + i];
            country = args["country" + i];
            title = args["title" + i];
            lat = args["lat" + i];
            lng = args["lng" + i];
            quality = args["quality" + i];

            // Add the address to our list if it has at least a city/state or postal code.
            // If everything's null, it means that the address was not included on the URL. 
            // It does NOT mean that the address wasn't provided as a blank address.

            if ((city !== undefined && state !== undefined) || postalCode !== undefined) {
                neuro.map.addAddressItem(street, city, state, postalCode, country, title, street, lat, lng, quality);
            }
        }

        neuro.map.geocodeAddressList();
    }
};
