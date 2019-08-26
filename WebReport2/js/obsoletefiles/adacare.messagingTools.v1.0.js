// Copyright 2017 by Neurosoftware, LLC.
//
// adacare.messagingTools.v1.0.js         Sandy Gettings
//
// This code is used for sending messages from the client's browser.
//
// Revisions:
//
// 2017-01-01 SG: Original code.

var adacare;
if (!adacare) { adacare = {}; }
else if (typeof adacare !== 'object') { throw new Error('adacare is already defined, but is not an object!'); }

if (!adacare.messagingTools) { adacare.messagingTools = {}; }
else { throw new Error('adacare.messagingTools is already defined!'); }

adacare.messagingTools = {

    // Constants - must match definitions in server code.

    // Delivery method codes (AdaCareLib.Messaging.DeliveryMethod)

    DELIVERY_METHOD_CODE_NONE: 'N',
    DELIVERY_METHOD_CODE_APP: 'A',
    DELIVERY_METHOD_CODE_EMAIL: 'E',
    DELIVERY_METHOD_CODE_SMS: 'S',
    DELIVERY_METHOD_CODE_VOICE: 'V',

    // Info for recipients elements

    DELIVERY_PREFS_ACCORDION_ID: 'DeliveryPrefsAccordion',

    RECIPIENT_ACCORDION_ID_LIST: ['ClientRecipientAccordion', 'OfficeUserRecipientAccordion', 'StaffRecipientAccordion'],
    RECIPIENT_ACCORDION_LIST_CLIENT_INDEX: 0,
    RECIPIENT_ACCORDION_LIST_OFFICEUSER_INDEX: 1,
    RECIPIENT_ACCORDION_LIST_STAFF_INDEX: 2,
    RECIPIENTS_PANE_ID: 'RecipientsPane',
    RECIPIENTS_PANE_CLOSE_BUTT_ID: 'RecipientsPaneCloseButt',
    RECIPIENTS_EDIT_BUTT_ID: 'RecipientsPaneEditButt',
    RECIPIENTS_COUNT_DISPLAY_ID: 'RecipientCountDisplay',

    // Info for the conversation elements

    CONVERSATION_PANE_ID: 'conversationPane',
    CONVERSATION_PANE_GETTING_STARTED_ID: 'conversationPaneGettingStarted',
    CONVERSATION_REFRESH_BUTT_ID: 'ConversationRefreshButt',
    CONVERSATION_SHOW_ALL_BUTT_ID: 'ConversationShowAllButt',
    CONVERSATION_OPEN_NEW_BUTT_ID: 'ConversationOpenNewButt',
    CONVERSATION_ITEM_DATA_KEY_FOR_ID: 'id',
    CONVERSATION_ITEM_SELECTED_CLASS: 'messagingViewerConversationSelected',
    CONVERSATION_ITEM_UNREAD_CLASS: 'messagingViewerConversationItemUnread',

    // Info for the message elements

    MESSAGE_NONE_ID: -1,
    VIEWER_MESSAGE_PANE_ID: 'ViewerMessagePane',
    VIEWER_MESSAGE_HEADER_ID: 'ViewerMessageHeader',
    VIEWER_MESSAGE_HEADER_RECIPIENTS_DISPLAY_ID: 'ViewerMessageHeaderRecipientsDisplay',

    // Info for the single-recipient pop-up

    POPUP_DIALOG_ID: 'messagingPopupDialog',
    POPUP_RECIPIENT_NAME_ID: 'recipientName',

    POPUP_RECIPIENT_DELIVERY_METHOD_APP_ID: 'DeliveryMethodApp',

    POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ID: 'PopupDeliveryMethodEmail',
    POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ADDRESS_ID: 'PopupDeliveryMethodEmailAddress',
    POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_NOTES_ID: 'PopupDeliveryMethodEmailNotes',

    POPUP_RECIPIENT_DELIVERY_METHOD_SMS_ID: 'PopupDeliveryMethodSms',
    POPUP_RECIPIENT_DELIVERY_METHOD_SMS_NUMBER_ID: 'PopupDeliveryMethodSmsNumber',
    POPUP_RECIPIENT_DELIVERY_METHOD_SMS_NOTES_ID: 'PopupDeliveryMethodSmsNotes',

    // Info for the elements to enter the message text and its Send button.

    MESSAGE_TEXTBOX_ID: 'MessageTextBox',
    MESSAGE_TEXTBOX_CHAR_COUNT_MAX: 140,
    MESSAGE_TEXTBOX_CHAR_COUNT_DISPLAY_ID: 'CharCountDisplay',
    MESSAGE_SEND_BUTT_ID: 'MessageSendButt',
    MESSAGE_SEND_BUTT_TEXT_FOR_SEND: 'Send',
    MESSAGE_SEND_BUTT_TEXT_FOR_REPLY: 'Reply',
    MESSAGE_SEND_BUTT_TEXT_FOR_NO_REPLY: 'No Reply',

    //MESSAGE_SENDING_STATUS_DISPLAY_ID: 'messageSendingStatusDisplay',

    // Info for Web Service calls

    WS_CONTEXT_FETCH_CONVERSATION_LIST: 'FETCH_CONVERSATION_LIST',
    WS_CONTEXT_FETCH_MESSAGE_LIST: 'CONTEXT_FETCH_MESSAGE_LIST',
    WS_CONTEXT_SEND_MESSAGE_FOR_POPUP_SINGLE_RECIPIENT: 'SEND_MESSAGE_FOR_POPUP_SINGLE_RECIPIENT',
    WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_NEW_CONVERSATION: 'SEND_MESSAGE_FOR_VIEWER_NEW_CONVERSATION',
    WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_REPLY_OR_SAME_CONVERSATION: 'SEND_MESSAGE_FOR_VIEWER_REPLY_OR_SAME_CONVERSATION',

    PLEASE_WAIT_HTML: '<div class="general_center">Please wait...</div>',

    // jQuery objects for important elements on the page

    $recipientsPane: null,
    $recipientsEditButt: null,

    $conversationPane: null,
    $conversationPaneGettingStarted: null,
    $conversationRefreshButt: null,
    $conversationShowAllButt: null,
    $conversationOpenNewButt: null,

    $viewerMessagePane: null,
    $viewerMessageHeader: null,
    $viewerMessageHeaderRecipientsDisplay: null,
    $messageTextBox: null,
    $messageSendButt: null,

    //$messageSendingStatusDisplay: null,

    appUserID: -1,
    currentConversationMessageInfoList: null,                               // The list of parent conversation messages
    currentConversationMessageID: -1,                                       // Currently selected conversation parent message ID
    currentConversationShowAll: false,                                      // True/false to show all or only most recent conversations
    currentRecipientCount: 0,                                               // Currently selected number of recipients
    currentMessageCharCount: 0,                                             // Current number of characters in message text to send
    currentDeliveryMethodDropDownListIDs: [],
    enableMessagesToClients: false,
    enableMessagesToOfficeUsers: false,
    enableMessagesToStaff: false,

    // ID lists for recipient clients, officeUsers, and staff. When these functions are used in a pop-up, the IDs
    // as passed in to the initializtion function. When used in the viewer, the user can select various
    // recipients on the fly, so these lists aren't populated until the user clicks the "send" button.

    recipientClientIDList: [],
    recipientOfficeUserIDList: [],
    recipientStaffIDList: [],

    $recipientAccordionList: [],
    $checkboxList: [],

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Initialization functions.

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // The server-side code must call the initForViewer() function at the beginning (or on its UpdatePanel's
    // PreRender event).

    initForViewer: function (appUserID, deliveryMethodDropDownListIDs, enableMessagesToClients, enableMessagesToOfficeUsers, enableMessagesToStaff) {
        'use strict';

        this.appUserID = appUserID;

        this.$recipientsPane = $('#' + this.RECIPIENTS_PANE_ID);
        this.$recipientsEditButt = $('#' + this.RECIPIENTS_EDIT_BUTT_ID);

        this.$conversationPane = $('#' + adacare.messagingTools.CONVERSATION_PANE_ID);
        this.$conversationPaneGettingStarted = $('#' + adacare.messagingTools.CONVERSATION_PANE_GETTING_STARTED_ID);
        this.$conversationRefreshButt = $('#' + adacare.messagingTools.CONVERSATION_REFRESH_BUTT_ID);
        this.$conversationShowAllButt = $('#' + adacare.messagingTools.CONVERSATION_SHOW_ALL_BUTT_ID);
        this.$conversationOpenNewButt = $('#' + adacare.messagingTools.CONVERSATION_OPEN_NEW_BUTT_ID);

        this.$viewerMessagePane = $('#' + adacare.messagingTools.VIEWER_MESSAGE_PANE_ID);
        this.$viewerMessageHeader = $('#' + adacare.messagingTools.VIEWER_MESSAGE_HEADER_ID);
        this.$viewerMessageHeaderRecipientsDisplay = $('#' + adacare.messagingTools.VIEWER_MESSAGE_HEADER_RECIPIENTS_DISPLAY_ID);

        this.currentConversationMessageID = this.MESSAGE_NONE_ID;
        this.currentDeliveryMethodDropDownListIDs = deliveryMethodDropDownListIDs;
        this.enableMessagesToClients = enableMessagesToClients;
        this.enableMessagesToOfficeUsers = enableMessagesToOfficeUsers;
        this.enableMessagesToStaff = enableMessagesToStaff;

        this.initAllAccordions();
        this.updateViewerRecipientCount();
        this.fetchViewerConversationList();

        // Attach the handlers for various clicks and such

        adacare.messagingTools.$conversationRefreshButt.off('click').on('click', this.fetchViewerConversationList);
        adacare.messagingTools.$conversationShowAllButt.off('click').on('click', this.onViewerShowAllClick);
        adacare.messagingTools.$conversationOpenNewButt.off('click').on('click', this.onViewerOpenNewMsgButtClick);

        this.$recipientsEditButt.off('click').on('click', this.onRecipientsPaneEditClick);
        $('#' + adacare.messagingTools.RECIPIENTS_PANE_CLOSE_BUTT_ID).off('click').on('click', this.onRecipientsPaneCloseClick);

        // This is a trick to position the pop-up for selecting recipients and delivery methods. This 
        // technique avoids the "Send" button showing through this pane when the Send button is disabled 
        // and partially transparent.

        this.$recipientsPane.position({ my: 'left top', at: 'left-20 top+20', of: this.$viewerMessageHeader });

        this.displayNoConversations();
        this.initMessageTextBox(this.onViewerMessageSendButtClick);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // This function is used to open the pop-up message dialog. It is intended to be called from JavaScript
    // in the user's browser.

    initForPopupForSingleRecipient: function (recipientName,
        recipientEmail, recipientEmailNotes,
        recipientSmsNumber, recipientSmsNotes,
        recipientVoiceNumber, recipientVoiceNotes,
        recipientClientID, recipientOfficeUserID, recipientStaffID,
        deliveryMethodsEnabledList, deliveryMethodsDefaultList) {
        'use strict';

        var deliveryMethodAppEnabled = false, deliveryMethodEmailEnabled = false, deliveryMethodSmsEnabled = false, deliveryMethodVoiceEnabled = false;
        var deliveryMethodPreferred = this.DELIVERY_METHOD_CODE_APP; // Default
        var found, i;

        // See which delivery methods are available, as the company may not allow every method,
        // and the recipient may not have all methods available (e.g., no email).

        for (i = 0; i < deliveryMethodsEnabledList.length; i++) {

            switch (deliveryMethodsEnabledList[i]) {

                case this.DELIVERY_METHOD_CODE_APP: deliveryMethodAppEnabled = true; break;
                case this.DELIVERY_METHOD_CODE_EMAIL: deliveryMethodEmailEnabled = recipientEmail; break;
                case this.DELIVERY_METHOD_CODE_SMS: deliveryMethodSmsEnabled = recipientSmsNumber; break;
                case this.DELIVERY_METHOD_CODE_VOICE: deliveryMethodVoiceEnabled = recipientVoiceNumber; break;
            }
        }

        // Find the preferred delivery method for this recipient.

        found = false;

        for (i = 0; i < deliveryMethodsDefaultList.length && !found; i++) {

            switch (deliveryMethodsDefaultList[i]) {

                case this.DELIVERY_METHOD_CODE_APP:

                    if (deliveryMethodAppEnabled) {
                        deliveryMethodPreferred = deliveryMethodsDefaultList[i];
                        found = true;
                    }
                    break;

                case this.DELIVERY_METHOD_CODE_EMAIL:

                    if (deliveryMethodEmailEnabled) {
                        deliveryMethodPreferred = deliveryMethodsDefaultList[i];
                        found = true;
                    }
                    break;

                case this.DELIVERY_METHOD_CODE_SMS:

                    if (deliveryMethodSmsEnabled) {
                        deliveryMethodPreferred = deliveryMethodsDefaultList[i];
                        found = true;
                    }
                    break;

                case this.DELIVERY_METHOD_CODE_VOICE:

                    if (deliveryMethodVoiceEnabled) {
                        deliveryMethodPreferred = deliveryMethodsDefaultList[i];
                        found = true;
                    }
                    break;
            }
        }

        // Initialize the recipient lists. In a simple pop-up, tha caller just passes in a single
        // recipient. The other lists will remain empty.

        if (recipientClientID > 0) { adacare.messagingTools.recipientClientIDList[0] = recipientClientID; }
        else if (recipientOfficeUserID > 0) { adacare.messagingTools.recipientOfficeUserIDList[0] = recipientOfficeUserID; }
        else if (recipientStaffID > 0) { adacare.messagingTools.recipientStaffIDList[0] = recipientStaffID; }

        // Display the recipient info on the pop-up.

        $('#' + adacare.messagingTools.POPUP_RECIPIENT_NAME_ID).text(recipientName);

        this.displayPopupDeliveryMethod(this.POPUP_RECIPIENT_DELIVERY_METHOD_APP_ID,
            null, null,
            null, null,
            deliveryMethodAppEnabled, (deliveryMethodPreferred === this.DELIVERY_METHOD_CODE_APP));

        this.displayPopupDeliveryMethod(this.POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ID,
            this.POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ADDRESS_ID, recipientEmail,
            this.POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_NOTES_ID, recipientEmailNotes,
            deliveryMethodEmailEnabled, (deliveryMethodPreferred === this.DELIVERY_METHOD_CODE_EMAIL));

        this.displayPopupDeliveryMethod(this.POPUP_RECIPIENT_DELIVERY_METHOD_SMS_ID,
            this.POPUP_RECIPIENT_DELIVERY_METHOD_SMS_NUMBER_ID, recipientSmsNumber,
            this.POPUP_RECIPIENT_DELIVERY_METHOD_SMS_NOTES_ID, recipientSmsNotes,
            deliveryMethodSmsEnabled, (deliveryMethodPreferred === this.DELIVERY_METHOD_CODE_SMS));

        this.updatePopupRecipientCount();
        this.enableOrDisableSendButton();
        this.initMessageTextBox(this.onPopupMessageSendButtClick);

        // Display the popup modal dialog.

        adacare.lib.modalEditDialog('open', this.POPUP_DIALOG_ID, 'Send a Message', 500, null);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display a delivery method for a single recipient popup.

    displayPopupDeliveryMethod: function (enabledCheckboxID, deliveryAddressID, deliveryAddress, deliveryNotesID, deliveryNotes, isEnabled, isPreferred) {
        'use strict';

        if (deliveryAddress) { $('#' + deliveryAddressID).text(deliveryAddress); }
        else { $('#' + deliveryAddressID).text(''); }

        if (isEnabled) {
            $('#' + enabledCheckboxID).off('click').on('click', this.updatePopupRecipientCount);
            $('#' + enabledCheckboxID).removeAttr('disabled');
        }
        else {
            $('#' + enabledCheckboxID).off('click');
            $('#' + enabledCheckboxID).attr('disabled', true);
        }

        if (isPreferred) { $('#' + enabledCheckboxID).prop('checked', true); }
        else { $('#' + enabledCheckboxID).prop('checked', false); }

        if (deliveryNotesID) {
            $('#' + deliveryNotesID).text(deliveryNotes);
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Common initialization.

    initMessageTextBox: function (sendButtClickHandler) {
        'use strict';

        this.$messageTextBox = $('#' + adacare.messagingTools.MESSAGE_TEXTBOX_ID);
        this.$messageSendButt = $('#' + adacare.messagingTools.MESSAGE_SEND_BUTT_ID);

        // Set up the status display.

        //this.$messageSendingStatusDisplay = $('#' + adacare.messagingTools.MESSAGE_SENDING_STATUS_DISPLAY_ID);
        //this.$messageSendingStatusDisplay.position({ my: 'center center', at: 'center center', of: this.$messageTextBox }).hide();

        // Attach handlers for the message textbox

        this.$messageTextBox.keyup(
            function () { adacare.lib.countAndLimitChars(this, adacare.messagingTools.MESSAGE_TEXTBOX_CHAR_COUNT_MAX, adacare.messagingTools.MESSAGE_TEXTBOX_CHAR_COUNT_DISPLAY_ID, adacare.messagingTools.onMessageTextChanged); });
        this.$messageTextBox.change(
            function () { adacare.lib.countAndLimitChars(this, adacare.messagingTools.MESSAGE_TEXTBOX_CHAR_COUNT_MAX, adacare.messagingTools.MESSAGE_TEXTBOX_CHAR_COUNT_DISPLAY_ID, adacare.messagingTools.onMessageTextChanged); });

        this.$messageSendButt.off('click').on('click', sendButtClickHandler);

        // Update the "Send" button's text.

        this.displaySendMsgButtonText(null);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the display for a new or an existing conversation.
    // 
    // Existing conversations display the person to send the message to. This recipient is the one person
    // who we originally sent a message to, or who sent the message to the user (us).
    //
    // New conversations allow the user to select from lists of recipients.

    initForNewConversation: function () {
        'use strict';

        adacare.messagingTools.$viewerMessagePane.html('');               // Clear display of any messages
        this.currentConversationMessageID = this.MESSAGE_NONE_ID;   // No current conversation
        this.$recipientsEditButt.show();                            // Show the recipients pane and such
        this.$recipientsPane.show();

        // Update the "Send" button's text.

        adacare.messagingTools.displaySendMsgButtonText(null);
    },

    initForExistingConversation: function (messageID) {
        'use strict';

        this.currentConversationMessageID = messageID;              // Remember the current conversation
        this.$recipientsEditButt.hide();
        this.$recipientsPane.hide();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Init the accordions with lists of possible recipients (clients, office users, and staff).

    initAllAccordions: function () {
        'use strict';

        var isEnabled, anyEnabled = false;
        var i;

        // Init the accordions.

        for (i = 0; i < adacare.messagingTools.RECIPIENT_ACCORDION_ID_LIST.length; i++) {

            // Save the list of accordions and the list of checkboxes for each.

            adacare.messagingTools.$recipientAccordionList[i] = $('#' + adacare.messagingTools.RECIPIENT_ACCORDION_ID_LIST[i]);
            adacare.messagingTools.$checkboxList[i] = $('#' + adacare.messagingTools.RECIPIENT_ACCORDION_ID_LIST[i] + ' :checkbox'); // All descendant checkboxes within each accordion

            // Display the accordions. Some accordions may be disabled per the company's preferences.

            switch (i) {

                case this.RECIPIENT_ACCORDION_LIST_CLIENT_INDEX:

                    isEnabled = this.enableMessagesToClients;
                    break;

                case this.RECIPIENT_ACCORDION_LIST_OFFICEUSER_INDEX:

                    isEnabled = this.enableMessagesToOfficeUsers;
                    break;

                case this.RECIPIENT_ACCORDION_LIST_STAFF_INDEX:

                    isEnabled = this.enableMessagesToStaff;
                    break;
            }

            // Display or hide each accordion. If none is enabled, we'll hide the "New" button as well.

            if (isEnabled) {

                adacare.messagingTools.$recipientAccordionList[i].accordion({ heightStyle: 'content', collapsible: true, active: false });
                anyEnabled = true;
            }
            else {

                adacare.messagingTools.$recipientAccordionList[i].hide();
            }

            // Set up handlers for clicks on the buttons and checkboxes

            $(adacare.messagingTools.$checkboxList[i]).off('click').on('click', adacare.messagingTools.updateViewerRecipientCount);
        }

        // Hide the "New" button if no recipients are enabled.

        if (!anyEnabled) {

            adacare.messagingTools.$conversationOpenNewButt.hide();
        }

        // The accordion for delivery preferences is simpler.

        $('#' + adacare.messagingTools.DELIVERY_PREFS_ACCORDION_ID).accordion({ heightStyle: 'content', collapsible: true, active: false });
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Event handlers (clicks and such)

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle events for the user clicking the "all" and "none" buttons within accordions.

    selectAllInOneViewerRecipientAccordion: function (accordionIndex) {
        'use strict';

        adacare.messagingTools.$checkboxList[accordionIndex].prop('checked', true);
        adacare.messagingTools.updateViewerRecipientCount();
    },

    selectNoneInOneViewerRecipientAccordion: function (accordionIndex) {
        'use strict';

        adacare.messagingTools.$checkboxList[accordionIndex].prop('checked', false);
        adacare.messagingTools.updateViewerRecipientCount();
    },

    selectNoneInAllViewerRecipientAccordions: function () {
        'use strict';

        var accordionIndex;

        for (accordionIndex = 0; accordionIndex < adacare.messagingTools.RECIPIENT_ACCORDION_ID_LIST.length; accordionIndex++) {

            this.selectNoneInOneViewerRecipientAccordion(accordionIndex);
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Flip between "show all" and "show recent" in the list of conversations.

    onViewerShowAllClick: function () {
        'use strict';

        adacare.messagingTools.currentConversationShowAll = !adacare.messagingTools.currentConversationShowAll;

        adacare.messagingTools.$conversationShowAllButt.val(adacare.messagingTools.currentConversationShowAll ? 'Show Recent' : 'Show All');
        adacare.messagingTools.fetchViewerConversationList();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle a click on a conversation item. When the user clicks the item, we fetch all messages
    // for the conversation and display them in the message pane.

    onConversationItemClick: function () {
        'use strict';

        adacare.messagingTools.selectViewerConversationItem($(this));
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle a click on the "open new message" button.

    onViewerOpenNewMsgButtClick: function () {
        'use strict';

        // Init display for a new conversation.

        adacare.messagingTools.initForNewConversation();

        // Unhighlight any selected conversation and uncheck any recipients.

        adacare.messagingTools.$conversationPane.children().removeClass(adacare.messagingTools.CONVERSATION_ITEM_SELECTED_CLASS);
        adacare.messagingTools.selectNoneInAllViewerRecipientAccordions();

        // Open the pane for selecting recipients (the accordions).

        //$('#' + adacare.messagingTools.RECIPIENTS_PANE_ID).show();
        adacare.messagingTools.$recipientsPane.show();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle a click on the "edit recipients" button.

    onRecipientsPaneEditClick: function () {
        'use strict';

        // Open the pane for selecting recipients (the accordions).

        //$('#' + adacare.messagingTools.RECIPIENTS_PANE_ID).show();
        adacare.messagingTools.$recipientsPane.show();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Close the pane for selecting recipients.

    onRecipientsPaneCloseClick: function () {
        'use strict';

        adacare.messagingTools.$recipientsPane.hide();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Handle a click on the "send" button.

    onPopupMessageSendButtClick: function () {
        'use strict';

        var deliveryMethodCount = 0, deliveryMethodCodeList = [];
        var messageText;
        var webService;

        messageText = adacare.messagingTools.messageSendButtClickInit();

        // Get the user's delivery preferences. The idea is to construct a list of delivery methods the
        // user wants for this particular message. (Voice delivery will be added eventually.)

        if ($('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_APP_ID).is(":checked")) {

            deliveryMethodCodeList[deliveryMethodCount++] = adacare.messagingTools.DELIVERY_METHOD_CODE_APP;
        }

        if ($('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ID).is(":checked")) {

            deliveryMethodCodeList[deliveryMethodCount++] = adacare.messagingTools.DELIVERY_METHOD_CODE__EMAIL;
        }

        if ($('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_SMS_ID).is(":checked")) {

            deliveryMethodCodeList[deliveryMethodCount++] = adacare.messagingTools.DELIVERY_METHOD_CODE_SMS;
        }

        // Pass the message to the server for sending. The web service will return the ID of the
        // completed message.

        webService = new AdaCareWeb.WebServices.MessagingWebService();
        webService.SendMessageForPopupForSingleRecipient(
            messageText,
            adacare.messagingTools.recipientClientIDList, adacare.messagingTools.recipientOfficeUserIDList, adacare.messagingTools.recipientStaffIDList,
            deliveryMethodCodeList,
            adacare.messagingTools.wsSelectSuccess,
            adacare.messagingTools.wsFail,
            adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_POPUP_SINGLE_RECIPIENT);
    },

    onViewerMessageSendButtClick: function () {
        'use strict';

        var conversationMessageID;
        var deliveryMethodCodeList = [];
        var messageText;
        var $checkboxItemsChecked;
        var webService;
        webService = new AdaCareWeb.WebServices.MessagingWebService();

        // Say "please wait," grab a copy of the message text, and clear the message text display.

        messageText = adacare.messagingTools.messageSendButtClickInit();

        // Is this a new message or a reply/send-another to an existing conversation?

        conversationMessageID = adacare.messagingTools.currentConversationMessageID;

        if (conversationMessageID !== adacare.messagingTools.MESSAGE_NONE_ID) {

            // Pass the message to the server for sending, including the parent message ID of the
            // conversation we're replying to. The server will figure out whether this is a reply
            // to a single person (the original sender) or another message to all recipients
            // because *we* are the original sender for this conversation.

            webService = new AdaCareWeb.WebServices.MessagingWebService();
            webService.SendMessageForReply(
                conversationMessageID, messageText,
                adacare.messagingTools.wsSelectSuccess,
                adacare.messagingTools.wsFail,
                adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_REPLY_OR_SAME_CONVERSATION);
        }
        else {

            // New message. Construct the lists of recipients.

            $checkboxItemsChecked = adacare.messagingTools.$checkboxList[adacare.messagingTools.RECIPIENT_ACCORDION_LIST_CLIENT_INDEX].filter(':checked');
            $checkboxItemsChecked.each(function (index) { adacare.messagingTools.recipientClientIDList[index] = $(this).val(); });

            $checkboxItemsChecked = adacare.messagingTools.$checkboxList[adacare.messagingTools.RECIPIENT_ACCORDION_LIST_OFFICEUSER_INDEX].filter(':checked');
            $checkboxItemsChecked.each(function (index) { adacare.messagingTools.recipientOfficeUserIDList[index] = $(this).val(); });

            $checkboxItemsChecked = adacare.messagingTools.$checkboxList[adacare.messagingTools.RECIPIENT_ACCORDION_LIST_STAFF_INDEX].filter(':checked');
            $checkboxItemsChecked.each(function (index) { adacare.messagingTools.recipientStaffIDList[index] = $(this).val(); });

            // Get the user's delivery preferences.

            deliveryMethodCodeList = adacare.messagingTools.getDeliveryMethods();

            // Pass the message to the server for sending. The web service will return the ID of the
            // completed message.

            webService = new AdaCareWeb.WebServices.MessagingWebService();
            webService.SendMessageForNewConversation(
                messageText,
                adacare.messagingTools.recipientClientIDList, adacare.messagingTools.recipientOfficeUserIDList, adacare.messagingTools.recipientStaffIDList,
                deliveryMethodCodeList,
                adacare.messagingTools.wsSelectSuccess,
                adacare.messagingTools.wsFail,
                adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_NEW_CONVERSATION);
        }
    },

    messageSendButtClickInit: function () {
        'use strict';

        var messageText;

        // Say "please wait," grab a copy of the message text, and clear the message text display.

        adacare.lib.pleaseWaitPopup('open');

        messageText = adacare.messagingTools.$messageTextBox.val();
        adacare.messagingTools.$messageTextBox.text('');
        adacare.messagingTools.currentMessageCharCount = 0;
        adacare.messagingTools.enableOrDisableSendButton();

        return messageText;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Callback method invoked when the message textbox is changed.

    onMessageTextChanged: function (charCount) {
        'use strict';

        adacare.messagingTools.currentMessageCharCount = charCount;
        adacare.messagingTools.enableOrDisableSendButton();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Other stuff

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the number of recipients selected.

    updatePopupRecipientCount: function () {
        'use strict';

        var totalCount = 0;

        // In the pop-up, at least one delivery method must be selected counts as a recipient.

        if ($('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_APP_ID).is(":checked")
            || $('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_EMAIL_ID).is(":checked")
            || $('#' + adacare.messagingTools.POPUP_RECIPIENT_DELIVERY_METHOD_SMS_ID).is(":checked")) {

            totalCount = 1;
        }

        adacare.messagingTools.currentRecipientCount = totalCount;
        adacare.messagingTools.enableOrDisableSendButton();
    },

    updateViewerRecipientCount: function () {
        'use strict';

        var $checkboxItemsChecked, $firstItemChecked, firstNameChecked;
        var thisCount, totalCountText, totalCount = 0;
        var i;

        for (i = 0; i < adacare.messagingTools.RECIPIENT_ACCORDION_ID_LIST.length; i++) {

            $checkboxItemsChecked = adacare.messagingTools.$checkboxList[i].filter(':checked');
            thisCount = $checkboxItemsChecked.length;

            // Remember the first name that was checked. This is a littel tricky, since the technique
            // below depends on how ASPX renders a CheckBoxList control. At present, each item in the
            // control is rendered as a pair of elements: a checkbox and a label "for" the checkbox.
            // The "for" value of the label element is the ID of the matching checkbox.

            if (totalCount === 0 && thisCount > 0) {

                $firstItemChecked = $checkboxItemsChecked.first();
                firstNameChecked = $('label[for="' + $firstItemChecked.attr('id') + '"]').text();
            }

            totalCount += thisCount;
        }

        // Display the selected names nicely. This is displayed both at the bottom of the accordions
        // and in the main header for "To:".

        if (totalCount === 0) { totalCountText = 'Please select at least one person from the lists above.'; }
        else if (totalCount === 1) { totalCountText = firstNameChecked; }
        else if (totalCount === 2) { totalCountText = firstNameChecked + ' and ' + adacare.lib.formatDecimal(totalCount - 1, 0, true) + ' other'; }
        else { totalCountText = firstNameChecked + ' and ' + adacare.lib.formatDecimal(totalCount - 1, 0, true) + ' others'; }

        $('#' + adacare.messagingTools.RECIPIENTS_COUNT_DISPLAY_ID).text(totalCountText);
        adacare.messagingTools.$viewerMessageHeaderRecipientsDisplay.text(totalCount !== 0 ? totalCountText : '(no recipients)');

        // Remember the count to share with others, and enable/disable the Send button.

        adacare.messagingTools.currentRecipientCount = totalCount;
        adacare.messagingTools.enableOrDisableSendButton();
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Enable/Disable the "send" button.

    enableOrDisableSendButton: function () {
        'use strict';

        var conversationMessageSelected, conversationAppUserID;
        var disabled = false;

        // Make sure the message text has at least one character.

        disabled = (disabled || adacare.messagingTools.currentMessageCharCount === 0);

        // Make sure we have one or more recipients to send the message to. That is, either we're sending
        // to an existing conversation's sender or recipients, or we're starting a new conversation *and* 
        // we selected some recipients from the accordions.

        disabled = (disabled || ((this.currentConversationMessageID === this.MESSAGE_NONE_ID) && (adacare.messagingTools.currentRecipientCount === 0)));

        // We prevent replying to messages from background processes.

        conversationMessageSelected = this.findConversationMessage(adacare.messagingTools.currentConversationMessageID);

        if (conversationMessageSelected) {

            conversationAppUserID = conversationMessageSelected.SentFromAppUserID;
            disabled = (disabled || ((this.currentConversationMessageID !== this.MESSAGE_NONE_ID) && (conversationAppUserID <= 0))); // Replying to existing conversation from "reserved" appUser sender
        }

        if (!disabled) {
            $('#' + adacare.messagingTools.MESSAGE_SEND_BUTT_ID).prop('disabled', false).removeClass('ui-state-disabled');
        }
        else {
            $('#' + adacare.messagingTools.MESSAGE_SEND_BUTT_ID).prop('disabled', true).addClass('ui-state-disabled');
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the list of conversations.

    displayConversationList: function (messageInfoList) {
        'use strict';

        var CONVERSATION_TEMPLATE = '<div class="messagingViewerConversationItem"><div class="messagingViewerConversationItemHeader"><span class="messagingViewerConversationName">{0}</span><span class="messagingViewerConversationDateTime">{1}</span><span class="messagingViewerConversationItemUnread">&bull;</span></div><div class="messagingViewerConversationMessageText">{2}</div></div>';

        var itemStr, itemHtml, $itemHtml, i;

        // Clear the display of conversations and then display the new list.

        adacare.messagingTools.$conversationPane.html('');

        if (messageInfoList && messageInfoList.length > 0) {

            adacare.messagingTools.$conversationPaneGettingStarted.hide();

            for (i = 0; i < messageInfoList.length; i++) {

                itemStr = CONVERSATION_TEMPLATE
                    .replace('{0}', messageInfoList[i].OtherPartyDescrip)
                    .replace('{1}', messageInfoList[i].ConversationMostRecentDateTimeLocalToString)
                    //.replace('{2}', messageInfoList[i].MessageTextJSEncoded);
                    .replace('{2}', messageInfoList[i].MessageTextHtmlEncoded);

                itemHtml = $.parseHTML(itemStr);
                $itemHtml = $(itemHtml);
                $itemHtml.data(adacare.messagingTools.CONVERSATION_ITEM_DATA_KEY_FOR_ID, messageInfoList[i].ConversationParentMessageID);
                $itemHtml.off('click').on('click', adacare.messagingTools.onConversationItemClick);

                adacare.messagingTools.displayConversationUnreadIcon(messageInfoList[i], $itemHtml);
                adacare.messagingTools.$conversationPane.append(itemHtml);

                // Preselect the first one.

                if (i === 0) {
                    adacare.messagingTools.selectViewerConversationItem($itemHtml);
                }
            }
        }
        else {
            // Display the "Getting Started" message and clear the list of messages.

            adacare.messagingTools.displayNoConversations();
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display or hide a conversation's "unread" with a little icon.

    displayConversationUnreadIcon: function (conversationMessageInfo, $conversationItem) {
        'use strict';

        var anyUnread;

        anyUnread = conversationMessageInfo.AnyUnread;
        //$conversationItem = this.findConversationItemByID(conversationMessageInfo.ConversationParentMessageID);

        // Show or hide the little "unread" indicator.

        if ($conversationItem) {

            if (anyUnread) { $conversationItem.find('.' + adacare.messagingTools.CONVERSATION_ITEM_UNREAD_CLASS).show(); }
            else { $conversationItem.find('.' + adacare.messagingTools.CONVERSATION_ITEM_UNREAD_CLASS).hide(); }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the case where there are no messages. Display the "Getting Started" message and clear 
    // the list of messages.

    displayNoConversations: function () {
        'use strict';

        var GETTING_STARTED_TEMPLATE = '<div id="conversationPaneGettingStarted" class="messagingViewerConversationPaneGettingStarted">You haven\'t sent or received any messages recently. To get started, click the <strong>New</strong> button above, and then select at least one recipient.</div>';

        var itemHtml;

        // Display a nice message for newbies.

        itemHtml = $.parseHTML(GETTING_STARTED_TEMPLATE);
        adacare.messagingTools.$conversationPane.append(itemHtml);

        // Hide the recipients pane and buttons.

        adacare.messagingTools.$recipientsPane.hide();
        adacare.messagingTools.$recipientsEditButt.hide();

        // Clear the messages pane.

        adacare.messagingTools.displayViewerMessageList(null);

        // Update the "Send" button's text.

        //adacare.messagingTools.displaySendMsgButtonText(null);

    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the list of messages within a conversation. If the list is null or empty, then we just 
    // clear the list.

    displayViewerMessageList: function (messageInfoList) {
        'use strict';

        var MESSAGE_SENT_FROM_ME_TEMPLATE = '<div class="messagingViewerMessageSentFromMe"><div class="messagingViewerMessageSentFromMeDateTime">{0}</div><div class="messagingViewerMessageSentFromMeBody">{1}</div></div>';

        var MESSAGE_SENT_TO_ME_TEMPLATE = '<div class="messagingViewerMessageSentToMe"><div class="messagingViewerMessageSentToMeDateTime">{0}</div><div class="messagingViewerMessageSentToMeBody">{1}</div></div>';

        var $viewerMessagePane;
        var itemStr, itemHtml, i;

        // Clear the display of messages and then display the new list.

        $viewerMessagePane = adacare.messagingTools.$viewerMessagePane;
        $viewerMessagePane.html('');

        if (messageInfoList) {
            for (i = 0; i < messageInfoList.length; i++) {

                // Display the message differently, depending on whether we're the sender or recipient.

                if (messageInfoList[i].SentFromAppUserID === adacare.messagingTools.appUserID) {

                    itemStr = MESSAGE_SENT_FROM_ME_TEMPLATE
                       .replace('{0}', messageInfoList[i].SentDateTimeLocalToString)
                       //.replace('{1}', messageInfoList[i].MessageTextJSEncoded);
                        .replace('{1}', messageInfoList[i].MessageTextHtmlEncoded);
                }
                else {

                    itemStr = MESSAGE_SENT_TO_ME_TEMPLATE
                       .replace('{0}', messageInfoList[i].SentDateTimeLocalToString)
                       //.replace('{1}', messageInfoList[i].MessageTextJSEncoded);
                        .replace('{1}', messageInfoList[i].MessageTextHtmlEncoded);
                }

                itemHtml = $.parseHTML(itemStr);
                $viewerMessagePane.append(itemHtml);
            }

            // Scroll to the bottom, since the messages are in date/time order.

            $viewerMessagePane.scrollTop($viewerMessagePane[0].scrollHeight - $viewerMessagePane.height());
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Select the given conversation item. This causes the item to be highlighted and the child messages
    // to be displayed.

    selectViewerConversationByID: function (conversationParentMessageID) {
        'use strict';

        var $conversationItem;

        $conversationItem = this.findConversationItemByID(conversationParentMessageID);
        this.selectViewerConversationItem($conversationItem);
    },

    selectViewerConversationItem: function ($conversationItem) {
        'use strict';

        var conversationParentMessageID, conversationMessageInfo;
        //var conversationAppUserID;

        // Mark the conversation as "read," since fetching the message list will cause them to be read
        // and it's shorter to handle this here instead of a round-trip to the server. The init display
        // pane for an existing conversation.

        conversationParentMessageID = $conversationItem.data(adacare.messagingTools.CONVERSATION_ITEM_DATA_KEY_FOR_ID);
        conversationMessageInfo = adacare.messagingTools.findConversationMessage(conversationParentMessageID);
        conversationMessageInfo.AnyUnread = false;
        adacare.messagingTools.displayConversationUnreadIcon(conversationMessageInfo, $conversationItem);

        adacare.messagingTools.initForExistingConversation(conversationParentMessageID);

        // Un-highlight any selected conversation, and highlight the one that was clicked (this one)

        adacare.messagingTools.$conversationPane.children().removeClass(adacare.messagingTools.CONVERSATION_ITEM_SELECTED_CLASS);
        $conversationItem.addClass(adacare.messagingTools.CONVERSATION_ITEM_SELECTED_CLASS);

        // Display the appropriate text in the Send button. 

        adacare.messagingTools.displaySendMsgButtonText(conversationMessageInfo.SentFromAppUserID);

        // Fetch the messages for this conversation

        adacare.messagingTools.fetchViewerMessageList(conversationParentMessageID);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Display the appropriate text in the Send button, depending on who started the conversation.
    // There are three cases:
    //
    // -- We are the recipient from an automated message. The button shows "No Reply."
    // -- We are the recipient from a regular user. The button shows "Reply."
    // -- We are the sender, so the button shows "Send."

    displaySendMsgButtonText: function (conversationAppUserID) {
        'use strict';

        var sendMsgButtText;

        if (conversationAppUserID) {
            if (conversationAppUserID <= 0) { sendMsgButtText = adacare.messagingTools.MESSAGE_SEND_BUTT_TEXT_FOR_NO_REPLY; }
            else if (conversationAppUserID !== adacare.messagingTools.appUserID) { sendMsgButtText = adacare.messagingTools.MESSAGE_SEND_BUTT_TEXT_FOR_REPLY; }
            else { sendMsgButtText = adacare.messagingTools.MESSAGE_SEND_BUTT_TEXT_FOR_SEND; }
        }
        else { // No conversation is selected

            sendMsgButtText = adacare.messagingTools.MESSAGE_SEND_BUTT_TEXT_FOR_SEND;
        }

        adacare.messagingTools.$messageSendButt.val(sendMsgButtText);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the list of conversations.

    fetchViewerConversationList: function () {
        'use strict';

        var selectAll;
        var webService;

        adacare.messagingTools.$conversationPane.html(adacare.messagingTools.PLEASE_WAIT_HTML);
        adacare.lib.pleaseWaitPopup('open');

        selectAll = adacare.messagingTools.currentConversationShowAll;

        webService = new AdaCareWeb.WebServices.MessagingWebService();
        webService.SelectConversations(
            selectAll,
            adacare.messagingTools.wsSelectSuccess,
            adacare.messagingTools.wsFail,
            adacare.messagingTools.WS_CONTEXT_FETCH_CONVERSATION_LIST);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the list of messages within one conversation. The given message ID is the parent message
    // for the conversation.

    fetchViewerMessageList: function (conversationParentMessageID) {
        'use strict';

        var conversationMessageSelected;
        var otherPartDescrip = '';
        var webService;

        //adacare.messagingTools.$viewerMessagePane.html(adacare.messagingTools.PLEASE_WAIT_HTML);
        adacare.lib.pleaseWaitPopup('open');

        conversationMessageSelected = this.findConversationMessage(conversationParentMessageID);

        if (conversationMessageSelected) {
            otherPartDescrip = conversationMessageSelected.OtherPartyDescrip;
        }

        adacare.messagingTools.$viewerMessageHeaderRecipientsDisplay.text(otherPartDescrip);

        webService = new AdaCareWeb.WebServices.MessagingWebService();
        webService.SelectAllByConversation(
            conversationParentMessageID,
            adacare.messagingTools.wsSelectSuccess,
            adacare.messagingTools.wsFail,
            adacare.messagingTools.WS_CONTEXT_FETCH_MESSAGE_LIST);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Replace the conversation message given by the ID.

    replaceConversationMessage: function (conversationMessageNew) {
        'use strict';

        var messageInfoList;
        var i;

        messageInfoList = adacare.messagingTools.currentConversationMessageInfoList;

        if (messageInfoList) {

            for (i = 0; i < messageInfoList.length; i++) {

                if (messageInfoList[i].ConversationParentMessageID === conversationMessageNew.ConversationParentMessageID) {

                    messageInfoList[i] = conversationMessageNew;
                    break;
                }
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch the conversation message given by the ID, or null.

    findConversationMessage: function (conversationParentMessageID) {
        'use strict';

        var messageInfoList;
        var conversationMessage = null;
        var i;

        messageInfoList = adacare.messagingTools.currentConversationMessageInfoList;

        if (messageInfoList) {

            for (i = 0; i < messageInfoList.length; i++) {

                if (messageInfoList[i].ConversationParentMessageID === conversationParentMessageID) {

                    conversationMessage = messageInfoList[i];
                    break;
                }
            }
        }

        return conversationMessage;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Find the given conversation item in the displayed list. Return the jQuery dislay item for the
    // conversation, or null if not found.

    findConversationItemByID: function (conversationParentMessageID) {
        'use strict';

        var conversationID, $allConversationItems, $conversationItem = null;
        var found = false;
        var i;

        $allConversationItems = adacare.messagingTools.$conversationPane.children();

        for (i = 0; !found && i < $allConversationItems.length; i++) {

            $conversationItem = $($allConversationItems[i]);
            conversationID = $conversationItem.data(adacare.messagingTools.CONVERSATION_ITEM_DATA_KEY_FOR_ID);

            if (conversationID === conversationParentMessageID) {

                found = true;
            }
        }

        return (found ? $conversationItem : null);
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Get an array of the user's choices for delivery methods.

    getDeliveryMethods: function () {
        'use strict';

        var $dropDownList;
        var deliveryMethodCodeList = [];
        var i;

        for (i = 0; i < adacare.messagingTools.currentDeliveryMethodDropDownListIDs.length; i++) {

            $dropDownList = $('#' + adacare.messagingTools.currentDeliveryMethodDropDownListIDs[i]);
            deliveryMethodCodeList[i] = $dropDownList.val();
        }

        return deliveryMethodCodeList;
    },

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Web service calls (hopefully) end up here. The "context" gives of the name of the function that
    // was called, so we know what to display.

    wsSelectSuccess: function (returnedValue, context, methodName) {
        'use strict';
        var messageInfo, messageInfoList = new AdaCareWeb.WebServices.MessagingWebService();
        var success;

        adacare.lib.pleaseWaitPopup('close');

        if (returnedValue !== null) {

            switch (context) {

                case adacare.messagingTools.WS_CONTEXT_FETCH_CONVERSATION_LIST:

                    messageInfoList = returnedValue;
                    adacare.messagingTools.currentConversationMessageInfoList = messageInfoList;
                    adacare.messagingTools.displayConversationList(messageInfoList);
                    break;

                case adacare.messagingTools.WS_CONTEXT_FETCH_MESSAGE_LIST:

                    messageInfoList = returnedValue;
                    adacare.messagingTools.displayViewerMessageList(messageInfoList);
                    break;

                case adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_POPUP_SINGLE_RECIPIENT:

                    success = returnedValue;
                    //adacare.messagingTools.$messageSendingStatusDisplay.fadeOut();
                    adacare.lib.modalEditDialog('close', adacare.messagingTools.POPUP_DIALOG_ID);
                    break;

                case adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_NEW_CONVERSATION:

                    messageInfo = returnedValue;
                    adacare.messagingTools.currentConversationMessageInfoList.unshift(messageInfo); // Inserts the new conversation message at the top of the list
                    messageInfoList = adacare.messagingTools.currentConversationMessageInfoList;
                    adacare.messagingTools.displayConversationList(messageInfoList);
                    adacare.messagingTools.selectViewerConversationByID(messageInfo.ConversationParentMessageID);
                    break;

                case adacare.messagingTools.WS_CONTEXT_SEND_MESSAGE_FOR_VIEWER_REPLY_OR_SAME_CONVERSATION:

                    //IDEA: function (returnedValue, context, methodName) { adacare.messagingTools.wsSelectSuccess(returnedValue, context, methodName); alert('quack!'); },
                    messageInfo = returnedValue;
                    adacare.messagingTools.replaceConversationMessage(messageInfo); // Replace the conversation message in the list with this updated one.
                    messageInfoList = adacare.messagingTools.currentConversationMessageInfoList;
                    adacare.messagingTools.displayConversationList(messageInfoList);
                    adacare.messagingTools.selectViewerConversationByID(messageInfo.ConversationParentMessageID);
                    break;
            }
        }
    },

    wsFail: function (error, context, methodName) {
        'use strict';

        adacare.lib.WSFailedGenericMessage(error, context, methodName + ': Web service failed,');
        adacare.lib.pleaseWaitPopup('close');
    }
};
