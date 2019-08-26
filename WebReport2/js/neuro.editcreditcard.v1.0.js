// Copyright 2014 by Neurosoftware, LLC.
//
// neuro.editcreditcard.v1.0                Sandy Gettings              02/20/2014
//
// This code helps edit credit cards from the client-side JavaScript. We do this to
// avoid unnecessary postbacks.
//
// Things to do:
// -- Validate the credit card number's checksum.
// -- Validate the credit card number format against the card type (Visa, Amex, etc.)

var neuro;
if (!neuro) { neuro = {}; }
else if (typeof (neuro) !== 'object') { throw new Error('neuro is already defined, but is not an object!'); }

if (!neuro.editcreditcard) { neuro.editcreditcard = {}; }
else { throw new Error('neuro.editcreditcard is already defined!'); }

/////////////////////////////////////////////////////////////////////////////////////////////////////

neuro.editcreditcard = {

    $cardType: null,
    $cardNumber: null,
    $cardExpMonth: null,
    $cardExpYear: null,
    $cardCvv: null,

    init: function (cardTypeID, cardNumberID, cardExpMonthID, cardExpYearID, cardCvvID) {
        'use strict';

        this.$cardType = $('#' + cardTypeID);
        this.$cardNumber = $('#' + cardNumberID);
        this.$cardExpMonth = $('#' + cardExpMonthID);
        this.$cardExpYear = $('#' + cardExpYearID);
        this.$cardCvv = $('#' + cardCvvID);

        // When any of the fields is changed, we want to clear some of the others. We do this in a
        // top-to-bottom order; changing a field only clears the ones beneath it on the form.

        this.$cardType.change(function () {
            neuro.editcreditcard.clearAll();
        });

        this.$cardNumber.change(function () {
            neuro.editcreditcard.clearExp();
            neuro.editcreditcard.clearCvv();
        });

        this.$cardExpMonth.change(function () {
            neuro.editcreditcard.clearCvv();
        });

        this.$cardExpYear.change(function () {
            neuro.editcreditcard.clearCvv();
        });
    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Functions for clearing the various card card fields

    clearAll: function () {
        'use strict';

        neuro.editcreditcard.clearNumber();
        neuro.editcreditcard.clearExp();
        neuro.editcreditcard.clearCvv();
    },

    clearNumber: function () {
        'use strict';

        neuro.editcreditcard.$cardNumber.val('');
    },

    clearExp: function () {
        'use strict';

        neuro.editcreditcard.$cardExpMonth.val('');
        neuro.editcreditcard.$cardExpYear.val('');
    },

    clearCvv: function () {
        'use strict';

        neuro.editcreditcard.$cardCvv.val('');
    }
};
