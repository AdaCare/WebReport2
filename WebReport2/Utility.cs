
/// <summary>
/// 
/// Copyright 2009, 2010 by Neurosoftware, LLC.
///
/// Utility.cs               
/// Sandy Gettings
/// 
/// This is a collection of utility methods commonly used across the appllication.
/// 
/// Revisions:
/// 2017-11-20 SG: Refactored low-level conversion methods.
/// 2018-06-18 SG: Changed time formatting from "00:00a" to "00:00 am" (added space and "m" to "am" and "pm").
/// 2018-07-20 SG: Added a separate compact time format for calendars (like the old format, "00:00a").
/// 2019-05-22 SG: Refactored FOrmatTimeSpan to support null? int.
/// 
/// </summary>

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace WebReport2
{
    public class Utility
    {

        //***************************************************************************************
        // Encode a string into a JavaScript-compatible format.
        // The basic idea is to escape the tricky characters.

        public static string JavaScriptEncode(string s)
        {
            StringBuilder sb = new StringBuilder();

            if (!string.IsNullOrEmpty(s))
            {
                foreach (char c in s)
                {
                    switch (c)
                    {
                        case '\'':
                            sb.Append("\\\'");
                            break;
                        case '\"':
                            sb.Append("\\\"");
                            break;
                        case '\\':
                            sb.Append("\\\\");
                            break;
                        case '\b':
                            sb.Append("\\b");
                            break;
                        case '\f':
                            sb.Append("\\f");
                            break;
                        case '\n':
                            sb.Append("\\n");
                            break;
                        case '\r':
                            sb.Append("\\r");
                            break;
                        case '\t':
                            sb.Append("\\t");
                            break;
                        default:
                            int i = (int)c;
                            if (i < 32 || i > 127)
                            {
                                sb.AppendFormat("\\u{0:X04}", i);
                            }
                            else
                            {
                                sb.Append(c);
                            }
                            break;
                    }
                }
            }
            return sb.ToString();
        }

    }
}
