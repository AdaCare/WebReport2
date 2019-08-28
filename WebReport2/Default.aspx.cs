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
                ReportViewer1.Visible = true;
                ReportViewer2.Visible = false;
                ReportViewer3.Visible = false;

                Show1.Checked = true;
                Show2.Checked = true;
                Show3.Checked = true;

                string instanceId = Environment.GetEnvironmentVariable("WEBSITE_INSTANCE_ID");
                /// string siteName = Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME");
                // SiteNameLabel.Text = siteName;

                if (instanceId == null)
                    instanceId = "UNK";

                InstanceID.Text = instanceId;
            }
        }
        protected override void OnLoadComplete(EventArgs e)
        {
            int pagenum;

            base.OnLoadComplete(e);
            if (!IsPostBack)
            {
                ShowReport();
            }
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

        protected override void OnPreRenderComplete(EventArgs e)
        {
            base.OnPreRenderComplete(e);

            Helpers.JavaScriptRegisterTabControlCode(Page, TabControl);
        }

        protected void buttonShow_Click(object sender, EventArgs e)
        {
            ShowReport();
        }

        protected void ShowReport()
        {

            DataTable dt = GetData();

            ReportViewer1.Reset();
            ReportViewer1.AsyncRendering = AsyncMode.Checked;

            ReportDataSource rds = new ReportDataSource("DataSet1", dt);
            ReportViewer1.LocalReport.DataSources.Add(rds);
            ReportViewer1.LocalReport.ReportPath = "Reports/Report1.rdlc";
            ReportViewer1.LocalReport.DisplayName = "Report1";
            ReportViewer1.LocalReport.Refresh();
            ReportViewer1.ShowFindControls = false;
            ReportViewer1.ShowPrintButton = false;
            ReportViewer1.ShowFindControls = false;
            ReportViewer1.ShowZoomControl = false;
            ReportViewer1.ShowRefreshButton = false;
            ReportViewer1.ShowBackButton = false;
            ReportViewer1.Visible = Show1.Checked;

            ReportViewer2.Reset();
            ReportViewer2.AsyncRendering = AsyncMode.Checked;

            ReportDataSource rds2 = new ReportDataSource("DataSet1", dt);
            ReportViewer2.LocalReport.DataSources.Add(rds2);
            ReportViewer2.LocalReport.ReportPath = "Reports/Report2.rdlc";
            ReportViewer2.LocalReport.DisplayName = "Report2";
            ReportViewer2.LocalReport.Refresh();
            ReportViewer2.ShowFindControls = false;
            ReportViewer2.ShowPrintButton = false;
            ReportViewer2.ShowFindControls = false;
            ReportViewer2.ShowZoomControl = false;
            ReportViewer2.ShowRefreshButton = false;
            ReportViewer2.ShowBackButton = false;
            ReportViewer2.Visible = Show2.Checked;
            ReportViewer2.Visible = true;

            ReportViewer3.Reset();
            ReportViewer3.AsyncRendering = AsyncMode.Checked;

            ReportDataSource rds3 = new ReportDataSource("DataSet1", dt);
            ReportViewer3.LocalReport.DataSources.Add(rds2);
            ReportViewer3.LocalReport.ReportPath = "Reports/Report3.rdlc";
            ReportViewer3.LocalReport.DisplayName = "Report3";
            ReportViewer3.LocalReport.Refresh();
            ReportViewer3.ShowFindControls = false;
            ReportViewer3.ShowPrintButton = false;
            ReportViewer3.ShowFindControls = false;
            ReportViewer3.ShowZoomControl = false;
            ReportViewer3.ShowRefreshButton = false;
            ReportViewer3.ShowBackButton = false;
            ReportViewer3.Visible = Show3.Checked;
        }

        protected DataTable GetData()
        {
            DataTable dt = new DataTable("Sales.Invoices");
            dt.Columns.Add("InvoiceID", typeof(int));
            dt.Columns.Add("InvoiceLineID", typeof(int));
            dt.Columns.Add("UnitPrice", typeof(decimal));

            #region DATA-ROWS
            dt.Rows.Add(1,1,230.00);
            dt.Rows.Add(2,2,13.00);
            dt.Rows.Add(3,2,32.00);
            dt.Rows.Add(4,3,30.00);
            dt.Rows.Add(5,4,2.70);
            dt.Rows.Add(6,4,32.00);
            dt.Rows.Add(7,4,13.00);
            dt.Rows.Add(8,5,32.00);
            dt.Rows.Add(9,5,32.00);
            dt.Rows.Add(10,5,24.00);
            dt.Rows.Add(11,6,16.00);
            dt.Rows.Add(12,6,13.00);
            dt.Rows.Add(13,6,32.00);
            dt.Rows.Add(14,7,13.00);
            dt.Rows.Add(15,7,3.50);
            dt.Rows.Add(16,7,32.00);
            dt.Rows.Add(17,7,32.00);
            dt.Rows.Add(18,8,32.00);
            dt.Rows.Add(19,8,13.00);
            dt.Rows.Add(20,8,13.00);
            dt.Rows.Add(21,9,25.00);
            dt.Rows.Add(22,9,32.00);
            dt.Rows.Add(23,10,13.00);
            dt.Rows.Add(24,10,13.00);
            dt.Rows.Add(25,11,13.00);
            dt.Rows.Add(26,12,25.00);
            dt.Rows.Add(27,12,13.00);
            dt.Rows.Add(28,13,15.00);
            dt.Rows.Add(29,13,285.00);
            dt.Rows.Add(30,14,30.00);
            dt.Rows.Add(31,14,37.00);
            dt.Rows.Add(32,14,32.00);
            dt.Rows.Add(33,15,25.00);
            dt.Rows.Add(34, 15, 2.40);
            dt.Rows.Add(35,16,34.00);
            dt.Rows.Add(36,17,32.00);
            dt.Rows.Add(37,17,13.00);
            dt.Rows.Add(38,18,13.00);
            dt.Rows.Add(39,19,240.00);
            dt.Rows.Add(40,19,345.00);
            dt.Rows.Add(41,19,230.00);
            dt.Rows.Add(42,20,30.00);
            dt.Rows.Add(43,21,18.00);
            dt.Rows.Add(44,21,32.00);
            dt.Rows.Add(45,21,13.00);
            dt.Rows.Add(46, 22, 32.00);
            dt.Rows.Add(47,22,105.00);
            dt.Rows.Add(48,23,13.00);
            dt.Rows.Add(49,23,230.00);
            dt.Rows.Add(50,23,32.00);
            dt.Rows.Add(51,24,230.00);
            dt.Rows.Add(52,24,2.40);
            dt.Rows.Add(53,25,13.00);
            dt.Rows.Add(54,25,32.00);
            dt.Rows.Add(55,26,13.00);
            dt.Rows.Add(56,27,32.00);
            dt.Rows.Add(57,27,13.00);
            dt.Rows.Add(58,28,18.00);
            dt.Rows.Add(59,28,13.00);
            dt.Rows.Add(60,28,102.00);
            dt.Rows.Add(61,29,32.00);
            dt.Rows.Add(62,29,35.00);
            dt.Rows.Add(63,30,25.00);
            dt.Rows.Add(64,31,13.00);
            dt.Rows.Add(65,31,87.00);
            dt.Rows.Add(66,31,25.00);
            dt.Rows.Add(67,32,45.00);
            dt.Rows.Add(68,32,25.00);
            dt.Rows.Add(69,32,32.00);
            dt.Rows.Add(70,33,2.70);
            dt.Rows.Add(71,34,29.00);
            dt.Rows.Add(72,34,32.00);
            dt.Rows.Add(73,34,25.00);
            dt.Rows.Add(74,34,13.00);
            dt.Rows.Add(75,34,32.00);
            dt.Rows.Add(76,35,25.00);
            dt.Rows.Add(77,36,32.00);
            dt.Rows.Add(78,36,13.00);
            dt.Rows.Add(79,36,32.00);
            dt.Rows.Add(80,36,32.00);
            dt.Rows.Add(81,37,13.00);
            dt.Rows.Add(82,38,13.00);
            dt.Rows.Add(83,39,13.00);
            dt.Rows.Add(84,39,13.00);
            dt.Rows.Add(85,39,240.00);
            dt.Rows.Add(86,40,45.00);
            dt.Rows.Add(87,40,32.00);
            dt.Rows.Add(88,41,30.00);
            dt.Rows.Add(89,41,90.00);
            dt.Rows.Add(90,42,34.00);
            dt.Rows.Add(91,42,13.00);
            dt.Rows.Add(92,42,22.00);
            dt.Rows.Add(93,43,18.00);
            dt.Rows.Add(94,43,25.00);
            dt.Rows.Add(95,44,230.00);
            dt.Rows.Add(96,44,1.28);
            dt.Rows.Add(97,45,112.00);
            dt.Rows.Add(98,46,18.00);
            dt.Rows.Add(99,46,32.00);
            dt.Rows.Add(100,47,99.00);
            dt.Rows.Add(101, 47, 50.00);
            dt.Rows.Add(102,47,230.00);
            dt.Rows.Add(103,48,18.00 );
            dt.Rows.Add(104,48,16.00 );
            dt.Rows.Add(105,49,15.00 );
            dt.Rows.Add(106,50,1.89  );
            dt.Rows.Add(107,51,18.00 );
            dt.Rows.Add(108,52,3.70  );
            dt.Rows.Add(109,53,18.00 );
            dt.Rows.Add(110, 53, 18.00);
            dt.Rows.Add(111, 53, 18.00);
            dt.Rows.Add(112,53,102.00);
            dt.Rows.Add(113,54,1.14  );
            dt.Rows.Add(114,55,18.00 );
            dt.Rows.Add(115,55,4.10  );
            dt.Rows.Add(116,55,18.00 );
            dt.Rows.Add(117,56,18.00 );
            dt.Rows.Add(118,56,18.00 );
            dt.Rows.Add(119,57,30.00 );
            dt.Rows.Add(120,58,13.00);
            dt.Rows.Add(121,58,13.00);
            dt.Rows.Add(122,58,29.00);
            dt.Rows.Add(123,59,3.70 );
            dt.Rows.Add(124,59,18.00);
            dt.Rows.Add(125,59,99.00);
            dt.Rows.Add(126,60,26.00);
            dt.Rows.Add(127,60,13.00);
            dt.Rows.Add(128,61,32.00);
            dt.Rows.Add(129,62,4.10 );
            dt.Rows.Add(130,63,18.00);
            dt.Rows.Add(131,64,18.00);
            dt.Rows.Add(132,65,4.10 );
            dt.Rows.Add(133,65,4.10 );
            dt.Rows.Add(134,65,18.00);
            dt.Rows.Add(135,65,3.70 );
            dt.Rows.Add(136,66,37.00);
            dt.Rows.Add(137,67,99.00);
            dt.Rows.Add(138,68,18.00);
            dt.Rows.Add(139,69,5.00 );
            dt.Rows.Add(140,70,3.70 );
            dt.Rows.Add(141,70,13.00);
            dt.Rows.Add(142,71,25.00);
            dt.Rows.Add(143,71,13.00);
            dt.Rows.Add(144, 72, 2.40);
            dt.Rows.Add(145, 72, 3.70);
            dt.Rows.Add(146, 73, 22.00);
            dt.Rows.Add(147, 73, 5.00);
            dt.Rows.Add(148, 74, 2.74);
            dt.Rows.Add(149, 75, 18.00);
            dt.Rows.Add(150,76,102.00);
            dt.Rows.Add(151,76,48.00 );
            dt.Rows.Add(152,77,48.00 );
            dt.Rows.Add(153,77,18.00 );
            dt.Rows.Add(154,78,26.00 );
            dt.Rows.Add(155,78,18.00 );
            dt.Rows.Add(156,78,42.00 );
            dt.Rows.Add(157,79,5.00  );
            dt.Rows.Add(158,80,90.00);
            dt.Rows.Add(159,80,13.00);
            dt.Rows.Add(160,80,32.00);
            dt.Rows.Add(161,81,32.00);
            dt.Rows.Add(162,81,30.00);
            dt.Rows.Add(163,82,13.00);
            dt.Rows.Add(164,82,13.00);
            dt.Rows.Add(165,83,48.00);
            dt.Rows.Add(166,83,18.00);
            dt.Rows.Add(167,83,13.00);
            dt.Rows.Add(168,83,4.10 );
            dt.Rows.Add(169,84,32.00);
            dt.Rows.Add(170,84,13.00);
            dt.Rows.Add(171,85,13.00);
            dt.Rows.Add(172,85,4.10 );
            dt.Rows.Add(173,86,18.00);
            dt.Rows.Add(174, 86, 25.00);
            dt.Rows.Add(175, 87, 18.00);
            dt.Rows.Add(176, 87, 32.00);
            dt.Rows.Add(177, 88, 2.70);
            dt.Rows.Add(178, 88, 13.00);
            dt.Rows.Add(179,88,230.00);
            dt.Rows.Add(180,89,32.00 );
            dt.Rows.Add(181,89,25.00 );
            dt.Rows.Add(182,89,13.00 );
            dt.Rows.Add(183,90,18.00 );
            dt.Rows.Add(184,90,13.00 );
            dt.Rows.Add(185,90,3.50  );
            dt.Rows.Add(186,90,32.00 );
            dt.Rows.Add(187,91,32.00);
            dt.Rows.Add(188,91,18.00);
            dt.Rows.Add(189,91,25.00);
            dt.Rows.Add(190,92,13.00);
            dt.Rows.Add(191,92,13.00);
            dt.Rows.Add(192,93,13.00);
            dt.Rows.Add(193,93,32.00);
            dt.Rows.Add(194,93,32.00);
            dt.Rows.Add(195,94,13.00);
            dt.Rows.Add(196,94,18.00);
            dt.Rows.Add(197,95,13.00);
            dt.Rows.Add(198,95,3.70 );
            dt.Rows.Add(199,95,13.00);
            dt.Rows.Add(200,95,34.00);
            dt.Rows.Add(201,95,29.00);
            dt.Rows.Add(202,96,13.00);
            dt.Rows.Add(203,96,13.00);
            dt.Rows.Add(204,96,13.00);
            dt.Rows.Add(205,96,32.00);
            dt.Rows.Add(206,96,32.00);
            dt.Rows.Add(207,97,13.00);
            dt.Rows.Add(208,97,13.00);
            dt.Rows.Add(209,98,34.00);
            dt.Rows.Add(210,98,13.00);
            dt.Rows.Add(211, 99, 13.00);
            dt.Rows.Add(212, 99, 13.00);
            dt.Rows.Add(213, 99, 13.00);
            dt.Rows.Add(214,100,13.00);
            dt.Rows.Add(215,101,32.00);
            dt.Rows.Add(216,101,87.00);
            dt.Rows.Add(217,102,13.00);
            dt.Rows.Add(218,102,2.70 );
            dt.Rows.Add(219,102,25.00);
            dt.Rows.Add(220,103,32.00);
            dt.Rows.Add(221,103,30.00);
            dt.Rows.Add(222,103,32.00);
            dt.Rows.Add(223,103,18.00);
            dt.Rows.Add(224,104,32.00);
            dt.Rows.Add(225,104,18.00);
            dt.Rows.Add(226,104,13.00);
            dt.Rows.Add(227,105,2.70 );
            dt.Rows.Add(228,105,32.00);
            dt.Rows.Add(229,105,240.00);
            dt.Rows.Add(230, 106, 3.70);
            dt.Rows.Add(231,106,13.00);
            dt.Rows.Add(232,107,2.70 );
            dt.Rows.Add(233,107,2.70 );
            dt.Rows.Add(234,107,32.00);
            dt.Rows.Add(235,107,25.00);
            dt.Rows.Add(236,108,32.00);
            dt.Rows.Add(237,108,42.00);
            dt.Rows.Add(238,109,13.00);
            dt.Rows.Add(239, 109, 13.00);
            dt.Rows.Add(240, 110, 13.00);
            dt.Rows.Add(241,110,230.00);
            dt.Rows.Add(242,110,29.00 );
            dt.Rows.Add(243,110,35.00 );
            dt.Rows.Add(244,111,30.00 );
            dt.Rows.Add(245,111,13.00 );
            dt.Rows.Add(246,112,30.00 );
            dt.Rows.Add(247,113,230.00);
            dt.Rows.Add(248,113,18.00 );
            dt.Rows.Add(249,113,32.00);
            dt.Rows.Add(250,113,13.00);
            dt.Rows.Add(251,114,2.70 );
            dt.Rows.Add(252,114,13.00);
            dt.Rows.Add(253,115,13.00);
            dt.Rows.Add(254,115,13.00);
            dt.Rows.Add(255,115,13.00);
            dt.Rows.Add(256,115,13.00);
            dt.Rows.Add(257,116,99.00);
            dt.Rows.Add(258,116,13.00);
            dt.Rows.Add(259,116,18.00);
            dt.Rows.Add(260,117,32.00);
            dt.Rows.Add(261,117,90.00);
            dt.Rows.Add(262,117,18.00);
            dt.Rows.Add(263,118,25.00);
            dt.Rows.Add(264,118,13.00);
            dt.Rows.Add(265,119,30.00);
            dt.Rows.Add(266,119,13.00);
            dt.Rows.Add(267,119,25.00);
            dt.Rows.Add(268,119,34.00);
            dt.Rows.Add(269,120,13.00);
            dt.Rows.Add(270,120,20.00);
            dt.Rows.Add(271,121,13.00);
            dt.Rows.Add(272,121,32.00);
            dt.Rows.Add(273,121,240.00);
            dt.Rows.Add(274,122,32.00 );
            dt.Rows.Add(275,122,25.00 );
            dt.Rows.Add(276,122,16.00 );
            dt.Rows.Add(277,122,13.00 );
            dt.Rows.Add(278,123,13.00 );
            dt.Rows.Add(279,123,13.00 );
            dt.Rows.Add(280,123,18.00 );
            dt.Rows.Add(281,123,32.00);
            dt.Rows.Add(282,124,25.00);
            dt.Rows.Add(283,124,5.00 );
            dt.Rows.Add(284,124,13.00);
            dt.Rows.Add(285,124,16.00);
            dt.Rows.Add(286,125,32.00);
            dt.Rows.Add(287,125,18.00);
            dt.Rows.Add(288,125,2.70 );
            dt.Rows.Add(289, 125, 16.00);
            dt.Rows.Add(290,126,105.00);
            dt.Rows.Add(291,126,3.70  );
            dt.Rows.Add(292,126,13.00 );
            dt.Rows.Add(293,126,32.00 );
            dt.Rows.Add(294,126,25.00 );
            dt.Rows.Add(295,127,35.00 );
            dt.Rows.Add(296,127,25.00 );
            dt.Rows.Add(297,128,4.30  );
            dt.Rows.Add(298, 128, 18.00);
            dt.Rows.Add(299, 129, 4.10);
            dt.Rows.Add(300,129,18.00);
            dt.Rows.Add(301,129,32.00);
            dt.Rows.Add(302,130,13.00);
            dt.Rows.Add(303,130,18.50);
            dt.Rows.Add(304,131,35.00);
            dt.Rows.Add(305,131,32.00);
            dt.Rows.Add(306,132,2.10 );
            dt.Rows.Add(307,133,3.70 );
            dt.Rows.Add(308, 134, 2.90);
            dt.Rows.Add(309,135,33.00);
            dt.Rows.Add(310,135,18.00);
            dt.Rows.Add(311,136,18.00);
            dt.Rows.Add(312,136,32.00);
            dt.Rows.Add(313,137,18.00);
            dt.Rows.Add(314,137,18.00);
            dt.Rows.Add(315,137,2.55 );
            dt.Rows.Add(316,138,18.00);
            dt.Rows.Add(317,138,18.00);
            dt.Rows.Add(318,139,32.00);
            dt.Rows.Add(319,139,20.00);
            dt.Rows.Add(320,140,18.00);
            dt.Rows.Add(321,141,18.00);
            dt.Rows.Add(322,142,18.00);
            dt.Rows.Add(323,143,12.50);
            dt.Rows.Add(324,144,18.00);
            dt.Rows.Add(325,145,13.00);
            dt.Rows.Add(326,146,33.00);
            dt.Rows.Add(327,146,4.10 );
            dt.Rows.Add(328,147,18.00);
            dt.Rows.Add(329,148,32.00);
            dt.Rows.Add(330,149,0.66 );
            dt.Rows.Add(331,150,4.10 );
            dt.Rows.Add(332,151,4.10 );
            dt.Rows.Add(333, 152, 4.10);
            dt.Rows.Add(334, 153, 4.30);
            dt.Rows.Add(335,154,13.00);
            dt.Rows.Add(336,154,32.00);
            dt.Rows.Add(337,154,18.00);
            dt.Rows.Add(338,154,25.00);
            dt.Rows.Add(339,154,13.00);
            dt.Rows.Add(340,155,32.00);
            dt.Rows.Add(341,155,2.40 );
            dt.Rows.Add(342,156,240.00);
            dt.Rows.Add(343,157,25.00);
            dt.Rows.Add(344,157,13.00);
            dt.Rows.Add(345,158,2.10 );
            dt.Rows.Add(346,158,13.00);
            dt.Rows.Add(347,158,32.00);
            dt.Rows.Add(348,159,13.00);
            dt.Rows.Add(349,159,32.00);
            dt.Rows.Add(350,159,18.00);
            dt.Rows.Add(351, 159, 32.00);
            dt.Rows.Add(352, 159, 32.00);
            dt.Rows.Add(353, 160, 32.00);
            dt.Rows.Add(354, 161, 13.00);
            dt.Rows.Add(355, 161, 4.30);
            dt.Rows.Add(356, 161, 20.00);
            dt.Rows.Add(357,162,105.00);
            dt.Rows.Add(358,163,13.00 );
            dt.Rows.Add(359,163,32.00 );
            dt.Rows.Add(360,164,32.00 );
            dt.Rows.Add(361,164,29.00 );
            dt.Rows.Add(362,164,13.00 );
            dt.Rows.Add(363,164,25.00 );
            dt.Rows.Add(364,165,25.00 );
            dt.Rows.Add(365, 165, 25.00);
            dt.Rows.Add(366, 166, 13.00);
            dt.Rows.Add(367, 166, 15.00);
            dt.Rows.Add(368, 166, 1.28);
            dt.Rows.Add(369, 166, 13.00);
            dt.Rows.Add(370, 167, 13.00);
            dt.Rows.Add(371, 167, 13.00);
            dt.Rows.Add(372,167,285.00);
            dt.Rows.Add(373,167,18.00 );
            dt.Rows.Add(374,167,13.00 );
            dt.Rows.Add(375,168,240.00);
            dt.Rows.Add(376,168,18.00 );
            dt.Rows.Add(377,168,2.90  );
            dt.Rows.Add(378,168,285.00);
            dt.Rows.Add(379,169,13.00 );
            dt.Rows.Add(380, 169, 1.89);
            dt.Rows.Add(381, 170, 13.00);
            dt.Rows.Add(382,170,240.00);
            dt.Rows.Add(383,170,34.00 );
            dt.Rows.Add(384,170,32.00 );
            dt.Rows.Add(385,170,105.00);
            dt.Rows.Add(386,171,13.00 );
            dt.Rows.Add(387,171,18.00 );
            dt.Rows.Add(388,171,1.89  );
            dt.Rows.Add(389,171,32.00 );
            dt.Rows.Add(390,172,18.00);
            dt.Rows.Add(391,172,13.00);
            dt.Rows.Add(392,172,13.00);
            dt.Rows.Add(393,172,45.00);
            dt.Rows.Add(394,173,13.00);
            dt.Rows.Add(395,173,13.00);
            dt.Rows.Add(396,174,32.00);
            dt.Rows.Add(397,174,2.90 );
            dt.Rows.Add(398, 175, 1.28);
            dt.Rows.Add(399, 175, 18.00);
            dt.Rows.Add(400, 175, 13.00);
            dt.Rows.Add(401,175,34.00);
            dt.Rows.Add(402,175,2.55 );
            dt.Rows.Add(403,176,230.00);
            dt.Rows.Add(404,176,34.00);
            dt.Rows.Add(405,176,32.00);
            dt.Rows.Add(406,176,0.66 );
            dt.Rows.Add(407,177,32.00);
            dt.Rows.Add(408,177,18.00);
            dt.Rows.Add(409,177,13.00);
            dt.Rows.Add(410,178,13.00);
            dt.Rows.Add(411,178,32.00);
            dt.Rows.Add(412,178,34.00);
            dt.Rows.Add(413,178,4.10 );
            dt.Rows.Add(414,178,13.00);
            dt.Rows.Add(415,179,48.00);
            dt.Rows.Add(416,179,25.00);
            dt.Rows.Add(417,180,25.00);
            dt.Rows.Add(418,180,12.50);
            dt.Rows.Add(419,180,30.00);
            dt.Rows.Add(420,180,32.00);
            dt.Rows.Add(421,181,32.00);
            dt.Rows.Add(422,181,32.00);
            dt.Rows.Add(423,181,18.00);
            dt.Rows.Add(424,181,18.00);
            dt.Rows.Add(425, 182, 32.00);
            dt.Rows.Add(426,182,230.00);
            dt.Rows.Add(427,182,285.00);
            dt.Rows.Add(428,182,30.00 );
            dt.Rows.Add(429,183,102.00);
            dt.Rows.Add(430,183,34.00 );
            dt.Rows.Add(431,184,13.00 );
            dt.Rows.Add(432,184,1.05  );
            dt.Rows.Add(433,184,30.00 );
            dt.Rows.Add(434, 185, 13.00);
            dt.Rows.Add(435, 185, 2.90);
            dt.Rows.Add(436, 186, 18.00);
            dt.Rows.Add(437,186,230.00);
            dt.Rows.Add(438,187,13.00 );
            dt.Rows.Add(439,187,25.00 );
            dt.Rows.Add(440,187,2.70  );
            dt.Rows.Add(441,188,35.00 );
            dt.Rows.Add(442,189,3.70  );
            dt.Rows.Add(443,189,20.00 );
            dt.Rows.Add(444,189,32.00 );
            dt.Rows.Add(445, 189, 18.00);
            dt.Rows.Add(446, 189, 87.00);
            dt.Rows.Add(447, 190, 26.00);
            dt.Rows.Add(448, 190, 4.10);
            dt.Rows.Add(449,191,285.00);
            dt.Rows.Add(450,191,18.00 );
            dt.Rows.Add(451,191,18.00 );
            dt.Rows.Add(452,192,13.00 );
            dt.Rows.Add(453,192,32.00 );
            dt.Rows.Add(454,192,13.00 );
            dt.Rows.Add(455,192,13.00 );
            dt.Rows.Add(456,193,32.00 );
            dt.Rows.Add(457, 193, 35.00);
            dt.Rows.Add(458, 193, 18.00);
            dt.Rows.Add(459, 193, 13.00);
            dt.Rows.Add(460, 194, 1.05);
            dt.Rows.Add(461, 194, 13.00);
            dt.Rows.Add(462, 195, 4.50);
            dt.Rows.Add(463, 195, 32.00);
            dt.Rows.Add(464,195,345.00);
            dt.Rows.Add(465,195,18.50 );
            dt.Rows.Add(466,196,25.00 );
            dt.Rows.Add(467,196,13.00 );
            dt.Rows.Add(468,197,112.00);
            dt.Rows.Add(469,197,20.00 );
            dt.Rows.Add(470,197,32.00 );
            dt.Rows.Add(471,198,18.00 );
            dt.Rows.Add(472, 198, 2.04);
            dt.Rows.Add(473,198,230.00);
            dt.Rows.Add(474,199,13.00 );
            dt.Rows.Add(475,199,32.00 );
            dt.Rows.Add(476,200,13.00 );
            dt.Rows.Add(477,200,34.00 );
            dt.Rows.Add(478,200,4.10  );
            dt.Rows.Add(479,201,87.00 );
            dt.Rows.Add(480,201,32.00 );
            dt.Rows.Add(481, 201, 13.00);
            dt.Rows.Add(482, 202, 25.00);
            dt.Rows.Add(483, 202, 5.00);
            dt.Rows.Add(484,202,18.00);
            dt.Rows.Add(485,202,45.00);
            dt.Rows.Add(486,202,4.10 );
            dt.Rows.Add(487,203,99.00);
            dt.Rows.Add(488,203,35.00);
            dt.Rows.Add(489,204,32.00);
            dt.Rows.Add(490,205,1.28 );
            dt.Rows.Add(491,205,13.00);
            dt.Rows.Add(492, 205, 3.70);
            dt.Rows.Add(493, 205, 13.00);
            dt.Rows.Add(494, 205, 32.00);
            dt.Rows.Add(495,206,230.00);
            dt.Rows.Add(496,206,34.00 );
            dt.Rows.Add(497,206,240.00);
            dt.Rows.Add(498,207,13.00 );
            dt.Rows.Add(499,207,32.00 );
            dt.Rows.Add(500,208,32.00 );
                                      
            #endregion DATA-ROWS      


            //string connstr = system.configuration.configurationmanager.connectionstrings["wideworldimportersconnectionstring"].connectionstring;
            //using (sqlconnection cn = new sqlconnection(connstr))
            //{
            //    cn.open();
            //    sqldataadapter adp = new sqldataadapter("select top 500 invoiceid, invoicelineid, unitprice from sales.invoicelines order by invoiceid, invoicelineid;", cn);
            //    adp.fill(dt);
            //    cn.close();
            //}

            return dt;
        }

        protected void Show1_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer1.Visible = Show1.Checked;
        }

        protected void Show2_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer2.Visible = Show2.Checked;

        }

        protected void Show3_CheckedChanged(object sender, EventArgs e)
        {
            ReportViewer3.Visible = Show3.Checked;

        }
        protected void AsyncMode_CheckedChanged(object sender, EventArgs e)
        {
            ShowReport();
        }
    }
}