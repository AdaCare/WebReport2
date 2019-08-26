// Original from dev411.com 2008-02-28
// Fixes and other changes by Sandy Gettings

function fontSizer (defaultSize,cookieName) {
  // debugger;
  if (!document.getElementById) return;
  var d = document, t = this;
  
  // The 0-th element is not used!
  t.sizeNames = new Array('100%','70%','80%','90%','100%','110%','120%','130%');
  t.tagsToChange =new Array('div','td','th','p','tr');
  t.defaultSize = defaultSize;
  t.cookieName = cookieName;
  t.minSize = 1;
  t.maxSize = 7;
  if ((t.defaultSize < t.minSize) && (t.defaultSize > t.maxSize))
    t.defaultSize = 3;
  t.currentSize = t.defaultSize;
  
  // Call this function upon load. 
  // Example: <body onload="fSizer.init('body');">
  
  t.init = function (item) {
    var size = null;
    size = getCookie(t.cookieName)
    if (!size) size=t.defaultSize;
    t.setFontSize(item,size)
  };
  
  // Adjust the size up or down by the given number
  // of steps into the sizeNames() array.
  
  t.adjust = function (item,adjustment) {
    t.setFontSize(item,Number(t.currentSize)+Number(adjustment))
  };
  
  // Reset to default size.
  
  t.reset = function (item) {
    t.setFontSize(item,t.defaultSize)
  };
  
  // Set the font size to the given size index
  // into the sizeNames() array.
  
  t.setFontSize = function (item,newSize) {
    var itemElement = null, itemTags, i, j;
    if (newSize == null || isNaN(newSize)) newSize = t.defaultSize
    else if (newSize < t.minSize) newSize = t.minSize
    else if (newSize > t.maxSize) newSize = t.maxSize;
    t.currentSize = newSize;
    setCookie(t.cookieName,newSize,1); // Expire cookie in 1 day (24 hours)
    if (!(itemElement = d.getElementById(item)))
      itemElement = d.getElementsByTagName(item)[0];
    itemElement.style.fontSize=t.sizeNames[newSize];
    
    // This also resizes the child elements - isn't this redundant?
    /* for (i=0;i<t.tagsToChange.length;i++) {
      itemTags = itemElement.getElementsByTagName(t.tagsToChange[i]);
      for (j=0;j<itemTags.length;j++)
        itemTags[j].style.fontSize=t.sizeNames[newSize];
    } */
  }
}

// debugger;
var fSizer = new fontSizer(4,'fontSizerCookie'); // Set the default size.
// fSizer.init('body');
