<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebReport2.Default" %>

<%@ Register assembly="Microsoft.ReportViewer.WebForms, Version=15.0.0.0, Culture=neutral, PublicKeyToken=89845dcd8080cc91" namespace="Microsoft.Reporting.WebForms" tagprefix="rsweb" %>

<%@ OutputCache Duration="60" VaryByParam="*" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptManager1" runat="server">
        </asp:ScriptManager>
        <asp:Button ID="buttonShow" runat="server" OnClick="buttonShow_Click" Text="Refresh Report" />
        <br />
        <asp:CheckBox ID="Hide1" runat="server" AutoPostBack="true" OnCheckedChanged="Hide1_CheckedChanged"></asp:CheckBox>
        <asp:CheckBox ID="Hide2" runat="server" AutoPostBack="true" OnCheckedChanged="Hide2_CheckedChanged"></asp:CheckBox>
        <asp:CheckBox ID="Hide3" runat="server" AutoPostBack="true" OnCheckedChanged="Hide3_CheckedChanged"></asp:CheckBox>
        <br />
        <asp:Label ID="Label1" runat="server" Text="Label"></asp:Label>
        <br />
        <div>
                <rsweb:ReportViewer ID="ReportViewer1" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="272px"  AsyncRendering="false">
                    <LocalReport ReportPath="Reports\Report1.rdlc" EnableExternalImages="True"/>
                </rsweb:ReportViewer>

        </div>
        <div>
                <rsweb:ReportViewer ID="ReportViewer2" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="313px"  AsyncRendering="false">
                    <LocalReport ReportPath="Reports\Report2.rdlc" EnableExternalImages="True"/>
                </rsweb:ReportViewer>

        </div>
        <div>
                <rsweb:ReportViewer ID="ReportViewer3" runat="server" ProcessingMode="Local" Width="84%" BorderStyle="Solid" BorderWidth="1px" Height="313px"  AsyncRendering="false">
                    <LocalReport ReportPath="Reports\Report3.rdlc" EnableExternalImages="True"/>
                </rsweb:ReportViewer>

        </div>
    </form>
</body>
</html>
