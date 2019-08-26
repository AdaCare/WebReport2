// Copyright 2009, 2010, 2011 by Neurosoftware, LLC.
//
// dateprototypes.v1.0.js                Sandy Gettings              Revised 10/12/11
//
// This is a library that extends the JavaScript Date object by defining some handy
// prototypes.

//***************************************************************************************
// Return the Julian Day.
//
// Note to the programmer: Julian dates are defined as the time elapsed since noon UTC on
// January 1, 4713 BCE. JavaScript dates are relative to midnight on January 1, 1970.
//
// Credit: Ben Bahrenburg

Date.prototype.julianDayUTC = function () {

    var MS_PER_MINUTE = 60000;
    var MS_PER_DAY = 86400000;
    var JULIAN_DAY_JAN_01_1970 = 2440587.5;
    var jday;

    //jday = Math.floor((this.getTime() / MS_PER_DAY) - (this.getTimezoneOffset() / MINUTES_PER_DAY) + 2440587.5);
    jday = Math.floor((this.getTime() - (this.getTimezoneOffset() * MS_PER_MINUTE)) / MS_PER_DAY + JULIAN_DAY_JAN_01_1970);

    return jday;
};

Date.prototype.julianDay = function () {

    var MS_PER_MINUTE = 60000;
    var MS_PER_DAY = 86400000;
    var JULIAN_DAY_JAN_01_1970 = 2440587.5;
    var jday;

    //jday = Math.floor((this.getTime() / MS_PER_DAY) - (this.getTimezoneOffset() / MINUTES_PER_DAY) + 2440587.5);
    jday = Math.floor((this.getTime()) / MS_PER_DAY + JULIAN_DAY_JAN_01_1970);

    return jday;
};


//***************************************************************************************
// Add n days to the date, returned as a new Date object.
//
//
// Just so ya know, this method is better that just adding 24 hours to a given date. That's
// because a day may be 23 or 25 hours long when we cross over Daylight Savings Time.

Date.prototype.addDays = function (days) {

    var d;

    d = new Date(this);
    d.setDate(this.getDate() + days);

    return d;
};
