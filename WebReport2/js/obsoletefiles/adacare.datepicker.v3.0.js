
/////////////////////////////////////////////////////////////////////////////////////////////////////
//
// adacare.DatePickerV3             Sandy Gettings                                      02/24/2014
//
// Attach datepicker to a field.
//
// Parameters:
// 1. The country abbreviation, for localization.
// 2. The ID of the text field element where the date appears.
// 3. The ID of a hidden field element with a copy of the date.
// 4. The ID of the "previous" button image element.
// 5. The ID of the "next" button image element.
// 6. An object with options as follows:
//
//    postBackOnChange      True or false (default), to cause a postback when the date is changed.
//
//    incrementDays         The number of days the datepicker is incremented when the user clicks
//                          the "previous" or "next" buttons. Typically 1 (default) or 7.
//
//    firstDayOfWeek        The first day of the week, 0-6 for Sunday-Saturday. Sunday is the default.
//                          Typically used when the increment is 7.
//
//    bindToType            Type of binding to another datepicker. This is used to define a pair of 
//                          datepickers that together concert to display a range of dates. This binding
//                          can be used to prevent the upper date from crossing over the lower date,
//                          and vice versa. Values are:
//
//                              undefined   No binding (default)
//
//                              'lowerstop' The other datepicker is the lower date. This datepicker
//                                          will stop at the lower's date and not cross over.
//
//                              'lowerpush' When the user tries to cross over the lower date, the
//                                          lower date will be pushed down to match this datepicker.
//
//                              'upperstop' The other datepicker is the upper date. This datepicker
//                                          will stop at the upper's date and not cross over.
//
//                              'upperpush' When the user tries to cross over the upper date, the
//                                          upper date will be pushed up to match this datepicker.
//
//                              'match'     Changes the other datepicker to match this one. That is,
//                                          the two datepickers are synchronized.
//
//    bindToElemID          The ID of the text field where the date appears in the bound datepicker.
//
//    bindToElemHiddenID    The ID of a hidden field element with a copy of the date in the bound
//                          datepicker.

adacare.DatePickerV3 = {

    // Rounding options

    ROUND_TO_NONE: 'none',
    ROUND_TO_FIRST_DAY_OF_WEEK: 'firstdayofweek',
    ROUND_TO_LAST_DAY_OF_WEEK: 'lastdayofweek',
    ROUND_TO_FIRST_DAY_OF_MONTH: 'firstdayofmonth',
    ROUND_TO_LAST_DAY_OF_MONTH: 'lastdayofmonth',

    // Binding options

    BIND_TO_TYPE_LOWERSTOP: 'lowerstop',
    BIND_TO_TYPE_LOWERPUSH: 'lowerpush',
    BIND_TO_TYPE_UPPERSTOP: 'upperstop',
    BIND_TO_TYPE_UPPERPUSH: 'upperpush',
    BIND_TO_TYPE_MATCH: 'match',

    // Name attributes of the datepicker's elements.

    NAME_VISIBLE_ELEM: 'datepickerText',
    NAME_PREV_BUTT: 'datepickerPrevButt',
    NAME_NEXT_BUTT: 'datepickerNextButt',

    // The are properties that are associated with individual datepickers.

    Parms: function () {
        'use strict';

        this.surroundDivID = null;
        this.$hiddenElem = null;
        this.$visibleElem = null;
        this.$prevButt = null;
        this.$nextButt = null;
        this.firstDayOfWeek = 0; // 0=Sunday
        this.roundTo = 'none';   // 'default'
        this.bindToType = null;
        this.$bindToSurroundDiv = null;
        this.postBackOnChange = false;
    },

    init: function (countryAbbr, surroundDivID, hiddenElemID, options) {
        'use strict';

        var $surroundDiv, $hiddenElem;
        var visibleFormat, hiddenFormat;
        var thisInstance;
        var parms;

        $surroundDiv = $('#' + surroundDivID);
        $hiddenElem = $('#' + hiddenElemID);

        parms = new adacare.DatePickerV3.Parms();
        parms.surroundDivID = surroundDivID;
        parms.$hiddenElem = $hiddenElem;
        parms.$visibleElem = $surroundDiv.find('[name$="' + this.NAME_VISIBLE_ELEM + '"]');
        parms.$prevButt = $surroundDiv.find('[data-datepicker$="' + this.NAME_PREV_BUTT + '"]');
        parms.$nextButt = $surroundDiv.find('[data-datepicker$="' + this.NAME_NEXT_BUTT + '"]');
        parms.firstDayOfWeek = (options.firstDayOfWeek !== undefined ? options.firstDayOfWeek : 0); // 0=Sunday
        parms.roundTo = (options.roundTo !== undefined ? options.roundTo : this.ROUND_TO_NONE);
        parms.bindToType = options.bindToType; // undefined | lowerstop | lowerpush | upperstop | upperpush | match
        parms.$bindToSurroundDiv = (options.bindToSurroundDivID !== undefined ? $('#' + options.bindToSurroundDivID) : undefined);
        parms.postBackOnChange = (options.postBackOnChange !== undefined ? options.postBackOnChange : false);

        switch (countryAbbr) {
            case adacare.lib.COUNTRY_ABBR_AU: visibleFormat = 'D, d M yy'; break;
            case adacare.lib.COUNTRY_ABBR_CA: visibleFormat = 'D, M d yy'; break;
            case adacare.lib.COUNTRY_ABBR_GB: visibleFormat = 'D, d M yy'; break;
            case adacare.lib.COUNTRY_ABBR_GI: visibleFormat = 'D, d M yy'; break;
            case adacare.lib.COUNTRY_ABBR_MT: visibleFormat = 'D, d M yy'; break;
            case adacare.lib.COUNTRY_ABBR_US: visibleFormat = 'D, M d yy'; break;
            default: visibleFormat = 'DD, M d'; break; // Default is same as US
        };

        // Define the datepicker. Whenever a new date is selected:
        // - Re-set the date, to take care of rounding and redisplay the the date text.
        // - Cause the page to postback to the server (make this optional?)

        hiddenFormat = 'mm/dd/yy'; // Must be same as server expects
        thisInstance = this;

        parms.$visibleElem.datepicker({
            showOn: 'focus',
            //buttonImage: '/images/datepickerv3-icon-calendar.png',
            //buttonImageOnly: true,
            showButtonPanel: true,
            numberOfMonths: 2,
            dateFormat: visibleFormat,
            altField: '#' + hiddenElemID,
            altFormat: hiddenFormat,
            showAnim: 'slideDown',
            onSelect: function (dateText, datepickerInstance) {
                //thisInstance.setDate(new Date($hiddenElem.val()), thisInstance.$visibleElem, thisInstance.bindToType, thisInstance.$bindToSurroundDiv); //???-- not needed, and causes datepicker pop back up!
                thisInstance.setDate(parms, parms.$visibleElem, new Date(parms.$hiddenElem.val()), true); //???-- not needed, and causes datepicker pop back up!

                // Bug: The datepicker won't allow two picks in a row (mobile), unless you move
                // the focus elsewhere first. Or (in IE Desktop), the datepicker keeps
                // reappearing after the pick (no fix yet).

                //thisInstance.$nextButt[0].focus(); // Moves focus away to avoid bug

                if (parms.postBackOnChange) {
                    __doPostBack(parms.$hiddenElem[0].id, '');
                }
            }
        });

        this.setDate(parms, parms.$visibleElem, new Date($hiddenElem.val()), false);

        parms.$prevButt.click(function () { return thisInstance.prevNextButtHandler(parms, parms.$visibleElem, parms.$hiddenElem, -1); });
        parms.$nextButt.click(function () { return thisInstance.prevNextButtHandler(parms, parms.$visibleElem, parms.$hiddenElem, +1); });
    },

    // Set the date in the DatePicker. This method takes care of rounding, too.

    setDate: function (parms, $visibleElem, newDate, allowBinding) {
        'use strict';

        var newDate;
        var junk = this;

        newDate = this.roundDate(parms, newDate);

        // Handle binding with another datepicker. This may cause a change in our
        // new date.

        if (allowBinding) {

            newDate = this.bindToHandler(parms, newDate);
        }

        $visibleElem.datepicker('disable');
        $visibleElem.datepicker('setDate', new Date(newDate));
        $visibleElem.datepicker('enable');
    },

    // Round the given date.

    roundDate: function (parms, origDate) {
        'use strict';

        var newDate;

        if (parms.roundTo === this.ROUND_TO_FIRST_DAY_OF_WEEK) {
            newDate = adacare.lib.firstDateOfWeek(parms.firstDayOfWeek, origDate);
        }
        else if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {
            newDate = adacare.lib.lastDateOfWeek(parms.firstDayOfWeek, origDate);
        }
        else if (parms.roundTo === this.ROUND_TO_FIRST_DAY_OF_MONTH) {
            newDate = new Date(origDate.getFullYear(), origDate.getMonth(), 1, 0, 0, 0, 0);
        }
        else if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_MONTH) {
            newDate = (new Date(origDate.getFullYear(), origDate.getMonth() + 1, 1, 0, 0, 0, 0)).addDays(-1);
        }
        else {
            newDate = origDate;
        }

        return newDate;
    },

    // Handle clicks on the prev/next buttons. The increment is -1 for prev, +1 for next.

    prevNextButtHandler: function (parms, $visibleElem, $hiddenElem, increment) {
        'use strict';

        var incrementDays, incrementMonths;
        var origDate, newDate;

        // If we're using rounding, then we bump the original date up/down by a week or a month.
        // Then, setDate() will clean it up.

        origDate = new Date($hiddenElem.val());

        if (parms.roundTo === this.ROUND_TO_FIRST_DAY_OF_WEEK || parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {

            incrementDays = (increment >= 0 ? 7 : -7);
            newDate = origDate.addDays(incrementDays);
        }
        else if (parms.roundTo === this.ROUND_TO_FIRST_DAY_OF_MONTH || parms.roundTo === this.ROUND_TO_LAST_DAY_OF_MONTH) {

            incrementMonths = (increment >= 0 ? 1 : -1);
            newDate = new Date(origDate.getFullYear(), origDate.getMonth() + incrementMonths, 1, 0, 0, 0, 0);
        }
        else {

            incrementDays = (increment >= 0 ? 1 : -1);
            newDate = origDate.addDays(incrementDays);
        }

        this.setDate(parms, $visibleElem, newDate, true);

        if (parms.postBackOnChange) {
            __doPostBack(parms.$hiddenElem[0].id, '');
        }
    },

    // Handle binding with another datepicker.
    // BUG: (minor) A bound datepicker with "incrementDays" other than 1 or 7 is not supported.
    // When this datepicker "pushes" the bound datepicker, it does not account for the
    // bound datepicker's increment. For example, if the bound datepicker should always 
    // land on a Sunday, then the "push" could set it to  a non-Sunday. We've implemented
    // a partial solution below.

    bindToHandler: function (parms, thisDate) {
        'use strict';

        var bindToType, $bindToVisibleElem;
        var resultDate, bindToDate;

        resultDate = thisDate;

        if (parms.bindToType !== undefined && parms.$bindToSurroundDiv !== undefined) {

            $bindToVisibleElem = parms.$bindToSurroundDiv.find('[name$="' + this.NAME_VISIBLE_ELEM + '"]');
            //bindToDate = adacare.lib.parseDateLocalized(countryAbbr, $bindToElem.val());
            bindToDate = $bindToVisibleElem.datepicker('getDate');

            if (parms.bindToType === this.BIND_TO_TYPE_LOWERSTOP && thisDate < bindToDate) {

                // Stop this datepicker from crossing over. If we're set to increment
                // weekly, then we stop with 6 days to spare.

                if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {

                    resultDate = bindToDate.addDays(SIX_DAYS);
                }

                else if (parms.roundTo !== this.ROUND_TO_NONE) {

                    resultDate = this.roundDate(parms,bindToDate.addDays(1));
                }

                else {

                    resultDate = bindToDate;
                }
            }
            else if (parms.bindToType === this.BIND_TO_TYPE_LOWERPUSH && thisDate < bindToDate) {

                // Push the bound datepicker to match this datepicker. If we're set to increment
                // weekly, then we push by 6 days. Note that we're looking at this datepicker's
                // increment; we should look at the bound datepicker instead, but we can't.

                if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {

                    bindToDate = thisDate.addDays(-SIX_DAYS);
                }

                else if (parms.roundTo !== this.ROUND_TO_NONE) {

                    bindToDate = this.roundDate(parms, thisDate);
                }

                else {

                    bindToDate = thisDate;
                }

                //$bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                //$bindToElemHidden.val($bindToElem.val());
                this.setDate(parms, $bindToVisibleElem, bindToDate, false);
            }
            else if (parms.bindToType === this.BIND_TO_TYPE_UPPERSTOP && thisDate > bindToDate) {

                // Stop this datepicker from crossing over. If we're set to increment
                // weekly, then we stop with 6 days to spare.

                if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {

                    resultDate = bindToDate.addDays(-SIX_DAYS);
                }

                else if (parms.roundTo !== this.ROUND_TO_NONE) {

                    resultDate = this.roundDate(parms, bindToDate.addDays(-1));
                }

                else {

                    resultDate = bindToDate;
                }
            }
            else if (parms.bindToType === this.BIND_TO_TYPE_UPPERPUSH && thisDate > bindToDate) {

                // Push the bound datepicker to match this datepicker. If we're set to increment
                // weekly, then we push by 6 days. Note that we're looking at this datepicker's
                // increment; we should look at the bound datepicker instead, but we can't.

                if (parms.roundTo === this.ROUND_TO_LAST_DAY_OF_WEEK) {

                    bindToDate = thisDate.addDays(SIX_DAYS);
                }

                else if (parms.roundTo !== this.ROUND_TO_NONE) {

                    bindToDate = this.roundDate(parms, thisDate);
                }

                else {

                    bindToDate = thisDate;
                }

                //$bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                //$bindToElemHidden.val($bindToElem.val());
                this.setDate(parms, $bindToVisibleElem, bindToDate, false);
            }
            else if (parms.bindToType === this.BIND_TO_TYPE_MATCH) {

                // Change the bound datepicker to match this datepicker (up or down).

                bindToDate = thisDate;
                //$bindToElem.val(adacare.lib.formatDateLocalized(countryAbbr, bindToDate));
                //$bindToElemHidden.val($bindToElem.val());
                this.setDate(parms, $bindToVisibleElem, bindToDate, false);
            }
        }

        return resultDate;
    }
};
