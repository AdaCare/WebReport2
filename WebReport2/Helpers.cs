using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace WebReport2
{
    public class Helpers
    {
        public static void JavaScriptRegisterTabControlCode(Page page, Panel tabControlPanel)
        {
            const string SCRIPT_KEY_TEMPLATE = "AdaCare.JavaScriptRegisterTabControlCode.{0}";

            // Sandy said to reverse these to see if fixes reportviewer 2019-08-25
            const string TABCONTROL_TEMPLATE = "adacare.lib.tabControl('{0}');";
            // const string TABCONTROL_TEMPLATE = "adacare.lib.tabControlReportViewerBugFix('{0}');";

            string scriptKey;
            string javaScriptCode;

            scriptKey = string.Format(SCRIPT_KEY_TEMPLATE, tabControlPanel.ClientID);
            javaScriptCode = string.Format(TABCONTROL_TEMPLATE, tabControlPanel.ClientID);
            JavaScriptRegisterPageCode(page, javaScriptCode, scriptKey);
        }

        //***************************************************************************************
        // Register a pair of birthdate/age fields. First, the page should define a text field for 
        // the birthdate, normally with the "val_birthdate" class. Next, the caller should fill in
        // the birthdate field when the page (or dialog) is first opened, and then invoke this 
        // function to register the JavaScript that manages the field. 
        //
        // After that, JavaScript on the client side will handle changes to the birthdate field by
        // updating the "age" field (a Label control, which is rendered as a <span>).

        public static void JavaScriptRegisterBirthdateField(UpdatePanel updatePanel, TextBox birthdateField, Label ageDisplay)
        {
            const string SCRIPT_KEY_TEMPLATE = "AdaCare.JavaScriptRegisterFieldFuncCode.{0}";
            const string CODE_TEMPLATE = "adacare.lib.handleBirthdateField('{0}','{1}');";

            string scriptKey;
            string javaScriptCode;

            scriptKey = string.Format(SCRIPT_KEY_TEMPLATE, birthdateField.ClientID);
            javaScriptCode = string.Format(CODE_TEMPLATE, birthdateField.ClientID, ageDisplay.ClientID);
            JavaScriptRegisterUpdatePanelCode(updatePanel, javaScriptCode, scriptKey);
        }

        //***************************************************************************************
        // Register a pair of checkbox/text fields. The page needs a checkbox field and corresponding
        // text field (e.g., Label). The caller should suppy the field IDs, plus the text to be
        // displayed depending on whether the checkbox is on or off.

        public static void JavaScriptRegisterCheckboxField(UpdatePanel updatePanel, CheckBox checkboxField, Label textField, string textOn, string textOff)
        {
            const string SCRIPT_KEY_TEMPLATE = "AdaCare.JavaScriptRegisterFieldFuncCode.{0}";
            const string CODE_TEMPLATE = "adacare.lib.handleCheckBoxField('{0}','{1}','{2}','{3}');";

            string scriptKey;
            string javaScriptCode;

            scriptKey = string.Format(SCRIPT_KEY_TEMPLATE, checkboxField.ClientID);
            javaScriptCode = string.Format(CODE_TEMPLATE, checkboxField.ClientID, textField.ClientID, Utility.JavaScriptEncode(textOn), Utility.JavaScriptEncode(textOff));
            JavaScriptRegisterUpdatePanelCode(updatePanel, javaScriptCode, scriptKey);
        }

        //***************************************************************************************
        // Register JavaScript code for a page.
        // (for pages that include the Microsoft Ajax Control Toolkit)
        //
        // This method registers the Javascript code during page initialization. Prior to invoking
        // this method, the caller should have gathered all JavaScript code into a string, and
        // then pass the string to us.

        public static void JavaScriptRegisterPageCode(Page page, string javascriptCode)
        {
            const string SCRIPT_KEY = "AdaCare.JavaScriptRegisterPageCode";

            JavaScriptRegisterPageCode(page, javascriptCode, SCRIPT_KEY);
        }

        public static void JavaScriptRegisterPageCode(Page page, string javascriptCode, string scriptKey)
        {
            const string JAVASCRIPT_TEMPLATE = "function pageLoad() {{{0}}};";
            string scriptStr;

            scriptStr = string.Format(JAVASCRIPT_TEMPLATE, javascriptCode);
            // 2017-01-04 SG This blew up after NuGet update.
            //ToolkitScriptManager.RegisterClientScriptBlock(page, page.GetType(), scriptKey, scriptStr, true);
            ScriptManager.RegisterClientScriptBlock(page, page.GetType(), scriptKey, scriptStr, true);
        }

        //***************************************************************************************
        // Register JavaScript code for use within an UpdatePanel.
        //
        // This method registers the Javascript code during page initialization. Prior to invoking
        // this method, the caller should have gathered all JavaScript code into a string, and
        // then pass the string to us.
        //
        // The first parameter is any control within the UpdatPanel. The JavaScript will be executed 
        // only when the UpdatePanel is updated, not every time the page is posted back.

        public static void JavaScriptRegisterUpdatePanelCode(Control control, string javascriptCode)
        {
            const string SCRIPT_KEY_TEMPLATE = "AdaCare.JavaScriptRegisterCodeForUpdatePanel.{0}";
            string scriptKey;

            scriptKey = string.Format(SCRIPT_KEY_TEMPLATE, control.ClientID);
            JavaScriptRegisterUpdatePanelCode(control, javascriptCode, scriptKey);
        }

        public static void JavaScriptRegisterUpdatePanelCode(Control control, string javascriptCode, string scriptKey)
        {
            const string JAVASCRIPT_TEMPLATE = "jQuery(function($) {{ {0} }});";
            string scriptStr;

            scriptStr = string.Format(JAVASCRIPT_TEMPLATE, javascriptCode);
            // 2017-01-04 SG This blew up after NuGet update.
            //ToolkitScriptManager.RegisterClientScriptBlock(control, control.GetType(), scriptKey, scriptStr, true);
            ScriptManager.RegisterClientScriptBlock(control, control.GetType(), scriptKey, scriptStr, true);
        }

    }
}