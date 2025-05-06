String.prototype.trim = String_Trim; //TODO - test the ability for this to work like str.trim()...or does it need to be str=str.trim();...update code accordingly
String.prototype.toBoolean = String_ToBoolean;

function String_Trim(){
    return Trim(this);
}

function Trim(str){
    str = str.replace(/^\s*/, "");
    str = str.replace(/\s*$/, "");
    return str;
}

function String_ToBoolean(){

    var str = this;

    str = new String(str).toLowerCase();

    if (str == "1" || str.charAt(0) == "t"){
        return true;
    }
    else if (str == "0" || str.charAt(0) == "f"){
        return false;
    }
    else {
        // Debug.AssertError("Value '" + str + "' can not be converted to a boolean.");
    }
}

//accepts an arbitrary number of arguments and merges them into a single querystring
function MergeQueryStringParameters(){

    var paramNames = new Array();
    var paramValues = new Array();

    var url = null;
    var anchor = null;
    var i;

    var numOfNonEmptyArgs = 0;
    var firstArg = null;
    for (i = 0; i < arguments.length; i++)
    {
        if (arguments[i] != null && arguments[i].length > 0) {
            numOfNonEmptyArgs++;
            if (firstArg == null) {
                firstArg = arguments[i];
            }
        }
    }

    // Exit it by returning our one arg if that's all we have
    if (numOfNonEmptyArgs == 1) {
        return firstArg;
    }

    for (i = 0; i < arguments.length; i++)
    {
        var qs = arguments[i];

        qs = new String(qs);

        // Pick off the anchor if it exists.
        // If the query string ends in a named anchor like "#middleofpage, save this
        // off and strip it from the url.  The first anchor seen will be the one used
        // in the merged query string.
        if (qs.indexOf("#") > -1 )
        {
            if (qs.charAt(0) == "#")
            {
                if (anchor === null)
                {
                    anchor = qs.substring(1);
                }
                qs = "";
            }
            else
            {
                var splitAtAnchor = qs.split('#');
                if (anchor === null)
                {
                    anchor = splitAtAnchor[1];
                }
                qs = splitAtAnchor[0];
            }
        }

        // Pick off the url if there is one
        if (qs.indexOf("?") > 0)
        {
            var urlPart = qs.substring(0, qs.indexOf("?"));
            var qsPart = qs.substring(qs.indexOf("?")+1, qs.length);
            if (url === null)
            {
                url = urlPart;
            }
            qs = qsPart;

        }

        // If there's no ?, #, =, or &, assume it's a pure url
        // Since & can be a valid filename char, also check for the case where
                // there's a '&' but also a '.' which assumes there will be a filename extension in the url
        if (qs.indexOf("#") < 0 && qs.indexOf("=") < 0 && qs.indexOf("?") < 0
            && (qs.indexOf("&") < 0 || (qs.indexOf("&") > 0 && qs.indexOf(".") > 0)))
        {
            if (url === null)
            {
                url = qs;
            }
            qs = "";
        }

        // May or may not be recieved with a "?" or "&" prefix so trim it off if it exists
        if (qs.charAt(0) == '?')
        {
            qs = qs.substring(1);
        }
        if (qs.charAt(0) == '&')
        {
            qs = qs.substring(1);
        }

        // Now get the params
        if (qs.indexOf("&") > -1)
        {
            var allPairs = qs.split('&');
            for (var j = 0; j < allPairs.length; j++)
            {
                AddQueryStringParm(paramNames, paramValues, allPairs[j]);
            }
        }
        else
        {
            if (qs.length > 0) {
                AddQueryStringParm(paramNames, paramValues, qs);
            }
        }
    }

    // Now contsruct the merged query string...
    var mergedQueryString = "";

    if (url !== null)
    {
        mergedQueryString += url;
    }

    var isFirstParm = true;
    for (i = 0; i < paramNames.length; i++)
    {
        if (isFirstParm)
        {
            mergedQueryString += "?";
            isFirstParm = false;
        }
        else
        {
            mergedQueryString += "&";
        }


        mergedQueryString += paramNames[i];

        var value = paramValues[i];
        // Some params may just have a name with no value, if so don't append "="
        if (value != null)
        {
            mergedQueryString += "=" + value;
        }
    }

    if (anchor !== null)
    {
        mergedQueryString += "#" + anchor;
    }

    return mergedQueryString;
}

//private helper method for MergeQueryStringParameters()
function AddQueryStringParm(names, values, qsParm)
{
    if (qsParm.indexOf("=") > -1)
    {
        var parm = qsParm.split('=');
        var name = parm[0];
        var value = parm[1];
        names[names.length] = name;
        values[values.length] = value;
    }
    else
    {
        // If it's just a name, add the parm as a property with a value of empty string
        names[names.length] = qsParm;
        values[values.length] = null;
    }
}

function CleanExternalString(str){
    //make sure the string is in a proper JS string format (who knows where it came from originially - Flash, Java, etc)
    //these transitions are enough to make absolutely sure that we have a native JavaScript string when we're done
    str = str + "";
    str = new String(str);
    str = str.toString();
    str = unescape(escape(str)); // Strange, yes.  But it fixed an IE-specific corruption problem. (Seen specifically with interaction id)
    return str;
}


function ZeroPad(num, numDigits){

    var strTemp;
    var intLen;
    var i;

    strTemp = new String(num);
    intLen = strTemp.length;

    if (intLen > numDigits){
        strTemp = strTemp.substr(0,numDigits);
    }
    else{
        for (i=intLen; i<numDigits; i++){
            strTemp = "0" + strTemp;
        }
    }

    return strTemp;
}

//currently, rounds to the number of specified specified digits after the decimal point
function RoundToPrecision(number, significantDigits){
    return Math.round(number * Math.pow(10, significantDigits)) / Math.pow(10, significantDigits);
}



// DE - 03/15/2010 - Added GetErrorDetailString and supporting printStackTrace.js to thirdparty folder

function GetErrorDetailString(error){
    var errParts = [];

    if(typeof navigator != "undefined"){
        if(typeof navigator.userAgent != "undefined"){
            errParts.push("User Agent: " + navigator.userAgent);
        }
        if(typeof navigator.platform != "undefined"){
            errParts.push("Platform: " + navigator.platform);
        }
    } else {
        errParts.push("No browser information was available (via the global navigator object)");
    }


    if(typeof error.name != "undefined"){
        errParts.push("Name: " + error.name);
    }
    if(typeof error.message != "undefined"){
        errParts.push("Message: " + error.message);
    }
    if(typeof error.description != "undefined"){
        errParts.push("Description: " + error.description);
    }
    if(typeof error.number != "undefined"){
        errParts.push("Number: " + error.number);
    }
    if(typeof error.fileName != "undefined"){
        errParts.push("Filename: " + error.fileName);
    }
    if(typeof error.lineNumber != "undefined"){
        errParts.push("Linenumber: " + error.lineNumber);
    }
    if(typeof error.toString != "undefined"){
        errParts.push("toString(): " + error.toString());
    }

    // try {
    //     //This relies on script at thirdparty/stackTrace.js
    //     var errStack = printStackTrace({e:error});
    //     errParts.push("StackTrace: " + errStack.join('  -->  '));
    // }
    // catch (error2){
    //     errParts.push("StackTrace: [Error fetching stack trace]");
    // }
    return errParts.join(', ');
}
