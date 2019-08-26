using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.Reporting.WebForms;
using System.Data;


using System.Data.SqlClient;
using System.Text;

namespace WebReport2
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                // need anything here?
                //                ReportViewer1.Visible = false;
                //                ReportViewer2.Visible = false;
                //                ReportViewer3.Visible = false;
                Hide1.Checked = true;
                Hide2.Checked = true;
                Hide3.Checked = true;

                string instanceId = Environment.GetEnvironmentVariable("WEBSITE_INSTANCE_ID");
                /// string siteName = Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME");
                // SiteNameLabel.Text = siteName;
                Label1.Text = instanceId;
            }
        }
        protected override void OnLoadComplete(EventArgs e)
        {
            int pagenum;

            base.OnLoadComplete(e);
            //if (!IsPostBack)
            //{
            //    ShowReport();
            //}
            return;

            // Don't test IsPostBack. For some reason, the page loads *twice* each time it is displayed.
            // if (!IsPostBack)
            // {
            pagenum = ReportViewer1.CurrentPage;
            ReportViewer1.LocalReport.Refresh();
            ReportViewer1.CurrentPage = pagenum;

            pagenum = ReportViewer2.CurrentPage;
            ReportViewer2.LocalReport.Refresh();
            ReportViewer2.CurrentPage = pagenum;

            pagenum = ReportViewer3.CurrentPage;
            ReportViewer3.LocalReport.Refresh();
            ReportViewer3.CurrentPage = pagenum;
            // }
        }

        protected void buttonShow_Click(object sender, EventArgs e)
        {
            ShowReport();
        }

        protected void ShowReport()
        {

            DataTable dt = GetData();

            ReportViewer1.Reset();
            ReportDataSource rds = new ReportDataSource("DataSet1", dt);
            ReportViewer1.LocalReport.DataSources.Add(rds);
            ReportViewer1.LocalReport.ReportPath = "Reports/Report1.rdlc";
            ReportViewer1.LocalReport.Refresh();
            ReportViewer1.ShowFindControls = false;
            ReportViewer1.ShowPrintButton = false;
            ReportViewer1.ShowFindControls = false;
            ReportViewer1.ShowZoomControl = false;
            ReportViewer1.ShowRefreshButton = false;
            ReportViewer1.ShowBackButton = false;
            ReportViewer1.Visible = true;

            ReportViewer2.Reset();
            ReportDataSource rds2 = new ReportDataSource("DataSet1", dt);
            ReportViewer2.LocalReport.DataSources.Add(rds2);
            ReportViewer2.LocalReport.ReportPath = "Reports/Report2.rdlc";
            ReportViewer2.LocalReport.Refresh();
            ReportViewer2.ShowFindControls = false;
            ReportViewer2.ShowPrintButton = false;
            ReportViewer2.ShowFindControls = false;
            ReportViewer2.ShowZoomControl = false;
            ReportViewer2.ShowRefreshButton = false;
            ReportViewer2.ShowBackButton = false;
            ReportViewer2.Visible = true;

            ReportViewer3.Reset();
            ReportDataSource rds3 = new ReportDataSource("DataSet1", dt);
            ReportViewer3.LocalReport.DataSources.Add(rds2);
            ReportViewer3.LocalReport.ReportPath = "Reports/Report2.rdlc";
            ReportViewer3.LocalReport.Refresh();
            ReportViewer3.ShowFindControls = false;
            ReportViewer3.ShowPrintButton = false;
            ReportViewer3.ShowFindControls = false;
            ReportViewer3.ShowZoomControl = false;
            ReportViewer3.ShowRefreshButton = false;
            ReportViewer3.ShowBackButton = false;
            ReportViewer3.Visible = true;
        }

        protected DataTable GetData()
        {
            DataTable dt = new DataTable();
            string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["WideWorldImportersConnectionString"].ConnectionString;
            using (SqlConnection cn = new SqlConnection(connStr))
            {
                cn.Open();
                SqlDataAdapter adp = new SqlDataAdapter("SELECT TOP 500 InvoiceID, InvoiceLineID, UnitPrice FROM Sales.InvoiceLines ORDER BY InvoiceID, InvoiceLineID;", cn);
                adp.Fill(dt);
                cn.Close();
            }

            return dt;
        }

        protected void Hide1_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer1.Visible = Hide1.Checked;
        }

        protected void Hide2_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer2.Visible = Hide2.Checked;

        }

        protected void Hide3_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer3.Visible = Hide3.Checked;

        }
    }
}