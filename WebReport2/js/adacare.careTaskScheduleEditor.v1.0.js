var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.careTaskScheduleEditor) { adacare.careTaskScheduleEditor = {}; }
else { throw new Error('adacare.careTaskScheduleEditor is already defined!'); }

adacare.careTaskScheduleEditor = {

    // Constants

    DATA_KEY: 'dow',

    // Init everything for this page.

    $dowValue: 0,
    $dowString: '',
    $dowCheckboxList: null,

    init: function (dowValueID) {
        'use strict';

        //this.initAccordion();
        //Sys.WebForms.PageRequestManager.getInstance().add_endRequest(adacare.careTaskScheduleEditor.initAccordion);

        this.$dowValue = $('#' + dowValueID);
        this.$dowCheckboxList = $('[data-dow]');

        this.getDOW();
        this.$dowCheckboxList.each(function () { $(this).off('change').on('change', adacare.careTaskScheduleEditor.setDOW); });
    },

    // Get the caller's DOW value and display the checkboxes.

    getDOW: function () {
        'use strict';

        var dowValue = 0;
        var dowBit, shiftBits;

        dowValue = adacare.careTaskScheduleEditor.$dowValue.val();

        adacare.careTaskScheduleEditor.$dowCheckboxList.each(function () {

            dowBit = $(this).data(adacare.careTaskScheduleEditor.DATA_KEY);
            shiftBits = dowBit - 1;

            if (dowValue & (1 << shiftBits)) {

                $(this).prop('checked', true);
            }
        });
    },

    // Set the caller's DOW value based on the state of the checkboxes.

    setDOW: function () {
        'use strict';

        var dowValue = 0;
        var checked, dowBit, shiftBits;

        adacare.careTaskScheduleEditor.$dowCheckboxList.each(function () {

            checked = $(this).prop('checked');

            if (checked) {

                dowBit = $(this).data(adacare.careTaskScheduleEditor.DATA_KEY);
                shiftBits = dowBit - 1;
                dowValue += (1 << shiftBits);
            }
        });

        adacare.careTaskScheduleEditor.$dowValue.val(dowValue);
    },

    initAccordion: function () {
        'use strict';

        var $optionPanel;

        $optionPanel = $('#OptionPanelDiv');
        $optionPanel.removeClass('general_hidden'); // Helps prevent FOUC
        $optionPanel.accordion({
            heightStyle: 'content',
            collapsible: true,
            active: false
        });
    }
};

