<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebReport2.Default" %>

<%@ Register assembly="Microsoft.ReportViewer.WebForms, Version=15.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" namespace="Microsoft.Reporting.WebForms" tagprefix="rsweb" %>

<%@ OutputCache Duration="60" VaryByParam="*" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="App_Themes/02-jquery-ui-1.12.1.min.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/03-themeroller-adacare-v1.2.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/05-stylesheet-v1.9.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/05-stylesheet_masterpage-v1.7.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/05-stylesheet_masterpage-bugfix-v1.0.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/06-stylesheet_fontresizer.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/06-stylesheet_menubar-v1.2.css" rel="stylesheet" type="text/css" />
    <link href="App_Themes/06-stylesheet_validation.css" rel="stylesheet" type="text/css" />

    <%-- Load jQuery from a CDN.  Fall back to local copy if CDN is not available. --%>
    <script type="text/javascript" src="//code.jquery.com/jquery-2.2.4.min.js"></script>
    <script type="text/javascript">
        if (typeof jQuery == 'undefined') {
            document.write(unescape("%3Cscript src='/js/jquery-2.2.4.min.js' type='text/javascript'%3E%3C/script%3E"));
        }
    </script>

    <%-- jQuery 2.2.4. The Migrate plug-in is temporary --%>
    <script type="text/javascript" src="//code.jquery.com/jquery-migrate-1.4.1.js"></script>

    <%-- This fixes a display problem in the menubar. The menus are rendered as <ul> lists, floated left to display 
    horizontally. However, when the page is first loaded, the top menu is displayed vertically for just a second.
    Surrounding the menu with the inline styles below fixes the problem. --%>
    <style type="text/css">
        .MenuFix .level1 > li > a {
            float: left;
        }

        .MenuFix .level1 > li {
            display: inline;
        }
    </style>



</head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server">
            <CompositeScript>
                <Scripts>
                    <%-- Caution: Test calendar drag with scroll before upgrading --%>
                    <%--<asp:ScriptReference Path="~/js/jquery-1.10.2.min.js" />--%>
                    <%--<asp:ScriptReference Path="~/js/jquery-ui-1.10.2.custom.min.js" />--%>
                    <%--<asp:ScriptReference Path="~/js/jquery-ui-1.11.2.min.js" />--%>

                    <%--<asp:ScriptReference Path="~/js/jquery-ui-1.11.3.min.js" />--%>
                    <%--<asp:ScriptReference Path="~/js/jquery-ui-1.12.1.min.js" />--%>

                    <asp:ScriptReference Path="~/js/jquery-ui.min-1.12.1.js" />
                    <%-- 2017-09-03 SG: Need to remove all references to livequery soon! --%>
                    <%--<asp:ScriptReference Path="~/js/jquery.livequery-1.3.4sgfix.js" />--%>
                    <%--<asp:ScriptReference Path="~/Scripts/jquery.livequery.min.js" />--%>
                    <asp:ScriptReference Path="~/js/cookiefuncs.js" />
                    <asp:ScriptReference Path="~/js/fontsizer.js" />
                    <asp:ScriptReference Path="~/js/dateprototypes.v1.0.js" />
                    <asp:ScriptReference Path="~/js/adacare.lib.v2.34.js" />
                    <asp:ScriptReference Path="~/js/adacare.datepicker.v3.1.4.js" />
                    <asp:ScriptReference Path="~/js/jquery.maskedinput-1.4.1.min.js" />
                </Scripts>
            </CompositeScript>
            <Scripts>
                <asp:ScriptReference Path="~/js/jquery.blockUI.v2.70.js" />
            </Scripts>
        </asp:ScriptManager>

        <div>
            <asp:Label ID="InstanceIDLabel" runat="server" Text="InstanceID: "></asp:Label>
            <asp:Label ID="InstanceID" runat="server" Text="unk"></asp:Label>
        </div>
        <div>
        <asp:Button ID="buttonShow" runat="server" OnClick="buttonShow_Click" Text="Refresh Report" />
        </div>

        <table class="gridview_content">
            <tr>
                <td><p>Reports</p></td>
                </tr>
            <tr>
                <td>
                    <asp:CheckBox ID="Hide1" runat="server" AutoPostBack="true" OnCheckedChanged="Hide1_CheckedChanged" Checked="true"></asp:CheckBox>
                    <asp:CheckBox ID="Hide2" runat="server" AutoPostBack="true" OnCheckedChanged="Hide2_CheckedChanged" Checked="true"></asp:CheckBox>
                    <asp:CheckBox ID="Hide3" runat="server" AutoPostBack="true" OnCheckedChanged="Hide3_CheckedChanged" Checked="true"></asp:CheckBox>
                </td>
            </tr>

            <tr>
                <td class="reportviewer_surround_wide">
                    <asp:Panel ID="TabControl" runat="server">
                        <ul>
                            <li><a href="#TabControl-1">Report1</a></li>
                            <li><a href="#TabControl-2">Report2</a></li>
                            <li><a href="#TabControl-3">Report3</a></li>
                        </ul>
                        <div id="TabControl-1" class="ui-tabs-hide reportviewer_surround_wide">
                            <p>
                                This is Report1 text.
                            </p>
                            <table class="gridview_content">
                                <tr>
                                    <td>
                                        <div class="reportviewer_surround_wide">
                                            <rsweb:ReportViewer ID="ReportViewer1" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="272px"
                                                AsyncRendering="false" ShowBackButton="False" ShowFindControls="False" ShowPrintButton="False" ShowRefreshButton="False" ShowZoomControl="False">
                                                <LocalReport ReportPath="Reports\Report2.rdlc" EnableExternalImages="True" DisplayName="Report2"/>
                                            </rsweb:ReportViewer>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <br />
                        </div>
                        <div id="TabControl-2" class="ui-tabs-hide reportviewer_surround_wide">
                            <p>
                                This is Report2 text.
                            </p>
                            <table class="gridview_content">
                                <tr>
                                    <td>
                                        <div class="reportviewer_surround_wide">
                                            <rsweb:ReportViewer ID="ReportViewer2" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="272px"
                                                AsyncRendering="false" ShowBackButton="False" ShowFindControls="False" ShowPrintButton="False" ShowRefreshButton="False" ShowZoomControl="False">
                                                <LocalReport ReportPath="Reports\Report2.rdlc" EnableExternalImages="True" DisplayName="Report2"/>
                                            </rsweb:ReportViewer>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <br />
                        </div>
                        <div id="TabControl-3" class="ui-tabs-hide reportviewer_surround_wide">
                            <p>
                                This is Report3 text.
                            </p>
                            <table class="gridview_content">
                                <tr>
                                    <td>
                                        <div class="reportviewer_surround_wide">
                                            <rsweb:ReportViewer ID="ReportViewer3" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="272px"
                                                AsyncRendering="false" ShowBackButton="False" ShowFindControls="False" ShowPrintButton="False" ShowRefreshButton="False" ShowZoomControl="False">
                                                <LocalReport ReportPath="Reports\Report2.rdlc" EnableExternalImages="True" DisplayName="Report2"/>
                                            </rsweb:ReportViewer>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <br />
                        </div>
                    </asp:Panel>
                </td>
            </tr>
        </table>
    </form>
</body>
</html>
