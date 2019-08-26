// These cookie functions are from w3schools.com

// Store a value in a cookie.

function setCookie(cookie_name,value,expiredays)
{
    var exdate=new Date();
    
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=cookie_name+ "=" +escape(value)+
    ((expiredays == null) ? "" : ";expires="+exdate.toGMTString());
}

// Get the value stored in a cookie.
// Return null if failed.

function getCookie(cookie_name)
{
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(cookie_name + "=");
  if (c_start!=-1)
    { 
    c_start=c_start + cookie_name.length+1; 
    c_end=document.cookie.indexOf(";",c_start);
    if (c_end==-1) c_end=document.cookie.length;
    return unescape(document.cookie.substring(c_start,c_end));
    } 
  }
return null;
}

