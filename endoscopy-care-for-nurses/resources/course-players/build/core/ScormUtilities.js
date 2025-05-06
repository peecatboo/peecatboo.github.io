
var HUNDREDTHS_PER_SECOND = 100;
var HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60;
var HUNDREDTHS_PER_HOUR   = HUNDREDTHS_PER_MINUTE * 60;
var HUNDREDTHS_PER_DAY    = HUNDREDTHS_PER_HOUR * 24;
var HUNDREDTHS_PER_MONTH  = HUNDREDTHS_PER_DAY * (((365 * 4) + 1) / 48); // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
var HUNDREDTHS_PER_YEAR   = HUNDREDTHS_PER_MONTH * 12;

var REG_EX_DIGITS = /\d+/g;
var REG_EX_CHILDREN = /._children$/;
var REG_EX_COUNT = /._count$/;


function ConvertIso8601TimeToUtcAnsiSql(iso8601Time){

    var dateParts = GetParsedIso8601Time(iso8601Time);
    var date = new Date();

    if (dateParts["timezoneoffsetchar"] === "" ||
        dateParts["timezoneoffsetchar"] === null ||
        dateParts["timezoneoffsetchar"] === undefined)
    {
        date.setFullYear(dateParts["year"]);
        // Months happen to be zero-based in JavaScript
        date.setMonth(dateParts["month"] - 1);
        date.setDate(dateParts["day"]);
        date.setHours(dateParts["hours"]);
        date.setMinutes(dateParts["minutes"]);
        date.setSeconds(dateParts["seconds"]);
        date.setMilliseconds(dateParts["milliseconds"]);
    }
    else
    {
        date.setUTCFullYear(dateParts["year"]);
        // Months happen to be zero-based in JavaScript
        date.setUTCMonth(dateParts["month"] - 1);
        date.setUTCDate(dateParts["day"]);
        date.setUTCHours(dateParts["hours"]);
        date.setUTCMinutes(dateParts["minutes"]);
        date.setUTCSeconds(dateParts["seconds"]);
        date.setUTCMilliseconds(dateParts["milliseconds"]);
        if (dateParts["timezoneoffsetchar"] == "-")
        {
            date.setUTCHours(date.getUTCHours() + new Number(dateParts["offsethours"]) );
            date.setUTCMinutes(date.getUTCMinutes() + new Number(dateParts["offsetminutes"]) );
        }
        else if (dateParts["timezoneoffsetchar"] == "+")
        {
            date.setUTCHours(date.getUTCHours() - new Number(dateParts["offsethours"]));
            date.setUTCMinutes(date.getUTCMinutes() - new Number(dateParts["offsetminutes"]));
        }
    }

    var dbDateTime = date.getUTCFullYear() + "-" +
                     // Add 1 to month because months are zero-based in JavaScript
                     ZeroPad(date.getUTCMonth() + 1, 2) + "-" +
                     ZeroPad(date.getUTCDate(), 2) + "T" +
                     ZeroPad(date.getUTCHours(), 2) + ":" +
                     ZeroPad(date.getUTCMinutes(), 2) + ":" +
                     ZeroPad(date.getUTCSeconds(), 2);

    return dbDateTime;
}

function ConvertDateToIso8601String(date) {

    var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; }

    var str = "";
    str += date.getUTCFullYear();
    str += "-" + zeropad(date.getUTCMonth() + 1);
    str += "-" + zeropad(date.getUTCDate());
    str += "T" + zeropad(date.getUTCHours()) + ":" + zeropad(date.getUTCMinutes());
    str += ":" + zeropad(date.getUTCSeconds()) + ".";
    var millis = ("00" + date.getUTCMilliseconds().toString());
    str += millis.substr(millis.length - 3, 2); // We only keep track of 100ths of a sec, so trim
    str += "Z";

    return str;
}

/*
    Parses an iso8601 date/time string and returns an object that describes the
    individual date/time fields.
    The empty strings are for backwards compatibility with the previous version
    of this function.
*/
function GetParsedIso8601Time(dateStr) {
    var iso8601RegExp = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d*))?)?)?((?:([+-])(\d{2})(?::(\d{2}))?)|Z)?)?$/;
    var match = iso8601RegExp.exec(dateStr);

    var dateParts = {};
    dateParts.year = '';
    dateParts.month = '';
    dateParts.day = '';
    dateParts.hours = '';
    dateParts.minutes = '';
    dateParts.seconds = '';
    dateParts.milliseconds = '';
    dateParts.timezoneoffsetchar = '';
    dateParts.offsethours = '';
    dateParts.offsetminutes = '';

    if (!match) {
        return dateParts;
    }

    dateParts.year = match[1] || '';
    dateParts.month = match[2] || '';
    dateParts.day = match[3] || '';
    dateParts.hours = match[4] || '';
    dateParts.minutes = match[5] || '';
    dateParts.seconds = match[6] || '';
    dateParts.milliseconds = ((match[7] || '') +'000').substring(0,3);


    var timezone = match[8];
    if (timezone && timezone == 'Z') {
        dateParts.timezoneoffsetchar = 'Z';
    }
    if (timezone && timezone != 'Z') {
        dateParts.timezoneoffsetchar = match[9] || '';
        dateParts.offsethours = match[10] || '';
        dateParts.offsetminutes = match[11] || '';
    }

    return dateParts
}

/*
    Parses an iso8601 date/time string and returns a Date Object
    Note that Date.parse() is implementation-dependent, so we roll our own
*/
function GetDateFromUtcIso8601Time(iso8601Time) {
    var dateParts = GetParsedIso8601Time(iso8601Time);


    var retDate = new Date();
    retDate.setUTCFullYear(dateParts.year);
    retDate.setUTCMonth(dateParts.month - 1);
    retDate.setUTCDate(dateParts.day);

    retDate.setUTCHours(dateParts.hours);
    retDate.setUTCMinutes(dateParts.minutes);
    retDate.setUTCSeconds(dateParts.seconds);
    retDate.setUTCMilliseconds(dateParts.milliseconds);

    return retDate;
}

function ConvertIso8601TimeSpanToCmiTimeSpan(iso8601TimeSpan){

    var hundredths = ConvertIso8601TimeSpanToHundredths(iso8601TimeSpan);
    var cmiRepresentation = ConvertHundredthsIntoSCORMTime(hundredths);

    return cmiRepresentation;
}

function ConvertCmiTimeSpanToIso8601TimeSpan(cmiTimeSpan){

    var hundredths = ConvertCmiTimeSpanToHundredths(cmiTimeSpan);
    var isoRepresentation = ConvertHundredthsToIso8601TimeSpan(hundredths);

    return isoRepresentation;
}

function ConvertCmiTimeToIso8601Time(cmiTime){

    //TOTEST: Unit Test ConvertCmiTimeToIso8601Time

    //assumes that cmiTime is a valid CmiTime (hh:mm:ss.s)
    //since CmiTime doesn't have any concept of a date, we'll assume that the current date is the best selection
    //this assumption should be ok since in SCORM 1.2, the only time CmiTime is used is for interactions which are only written once

    dtmNow = new Date();

    var year = dtmNow.getFullYear();
    var month = dtmNow.getMonth();
    var day = dtmNow.getDate();

    year = ZeroPad(year, 4);
    month = ZeroPad((month + 1), 2);
    day = ZeroPad(day, 2);

    var IsoTime = year + "-" + month + "-" + day + "T" + cmiTime;

    return IsoTime;
}

function ConvertCmiTimeSpanToHundredths(cmiTimeSpan){

    //TOTEST: unit test ConvertCmiTimeSpanToHundredths

    if (cmiTimeSpan === ""){
        return 0;
    }

    var aryParts;
    var intHours;
    var intMinutes;
    var intSeconds;

    var intTotalMilliSeconds;

    //split the string into its parts
    aryParts = cmiTimeSpan.split(":");

    //seperate the parts and multiply by the appropriate constant (360000 = num hundredths in an hour, etc)
    intHours   = aryParts[0];
    intMinutes = aryParts[1];
    intSeconds = aryParts[2]; //don't need to worry about hundredths b/c they are expressed as fractions of a second

    intTotalHundredths = (intHours * 360000) + (intMinutes * 6000) + (intSeconds * 100);

    //necessary because in JavaScript, some values for intSeconds (such as 2.01) will have a lot of decimal
    //places when multiplied by 1000. For instance, 2.01 turns into 2009.999999999999997.
    intTotalHundredths = Math.round(intTotalHundredths);

    return intTotalHundredths;
}

function ConvertIso8601TimeSpanToHundredths(strIso8601Time){


    if (strIso8601Time === ""){
        return 0;
    }

    var intTotalHundredths = 0;

    var strNumberBuilder;
    var strCurrentCharacter;
    var blnInTimeSection;

    var Seconds = 0; // 100 hundreths of a seconds
    var Minutes = 0; // 60 seconds
    var Hours = 0;  // 60 minutes
    var Days = 0;  // 24 hours
    var Months = 0;  // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
    var Years = 0;  // assumed to be 12 "average" months

    strIso8601Time = new String(strIso8601Time);

    strNumberBuilder = "";
    strCurrentCharacter = "";
    blnInTimeSection = false;

    //start at 1 to get past the "P"
    for (var i=1; i < strIso8601Time.length; i++){

        strCurrentCharacter = strIso8601Time.charAt(i);

        if (IsIso8601SectionDelimiter(strCurrentCharacter)){

            switch (strCurrentCharacter.toUpperCase()){

                case "Y":
                    Years = parseInt(strNumberBuilder, 10);
                break;

                case "M":
                    if (blnInTimeSection){
                        Minutes = parseInt(strNumberBuilder, 10);
                    }
                    else{
                        Months = parseInt(strNumberBuilder, 10);
                    }
                break;

                case "D":
                    Days = parseInt(strNumberBuilder, 10);
                break;

                case "H":
                    Hours = parseInt(strNumberBuilder, 10);
                break;

                case "S":
                    Seconds = parseFloat(strNumberBuilder);
                break;

                case "T":
                    blnInTimeSection = true;
                break;

            }

            strNumberBuilder = "";
        }
        else{
            strNumberBuilder += "" + strCurrentCharacter;  //use "" to keep the number as string concats instead of numeric additions
        }

    }

    intTotalHundredths = (Years * HUNDREDTHS_PER_YEAR) +
                        (Months * HUNDREDTHS_PER_MONTH) +
                        (Days * HUNDREDTHS_PER_DAY) +
                        (Hours * HUNDREDTHS_PER_HOUR) +
                        (Minutes * HUNDREDTHS_PER_MINUTE) +
                        (Seconds * HUNDREDTHS_PER_SECOND);

    //necessary because in JavaScript, some values (such as 2.01) will have a lot of decimal
    //places when multiplied by a larger number. For instance, 2.01 turns into 2009.999999999999997.
    intTotalHundredths = Math.round(intTotalHundredths);


    return intTotalHundredths;
}


function IsIso8601SectionDelimiter(str){

    if (str.search(/[PYMDTHS]/) >=0 ){
        return true;
    }
    else{
        return false;
    }

}


function ConvertHundredthsToIso8601TimeSpan(totalHundredths){


    var iso8601Time = "";

    var HundredthsOfASecond; //decrementing counter - work at the hundreths of a second level because that is all the precision that is required

    var Seconds; // 100 hundreths of a seconds
    var Minutes; // 60 seconds
    var Hours;  // 60 minutes
    var Days;  // 24 hours
    var Months;  // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
    var Years;  // assumed to be 12 "average" months

    HundredthsOfASecond = totalHundredths;

    Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
    HundredthsOfASecond -= (Years * HUNDREDTHS_PER_YEAR);

    Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
    HundredthsOfASecond -= (Months * HUNDREDTHS_PER_MONTH);

    Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
    HundredthsOfASecond -= (Days * HUNDREDTHS_PER_DAY);

    Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
    HundredthsOfASecond -= (Hours * HUNDREDTHS_PER_HOUR);

    Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
    HundredthsOfASecond -= (Minutes * HUNDREDTHS_PER_MINUTE);

    Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
    HundredthsOfASecond -= (Seconds * HUNDREDTHS_PER_SECOND);


    if (Years > 0) {
        iso8601Time += Years + "Y";
    }
    if (iso8601Time > 0){
        ScormTime += Months + "M";
    }
    if (Days > 0){
        iso8601Time += Days + "D";
    }

    //check to see if we have any time before adding the "T"
    if ((HundredthsOfASecond + Seconds + Minutes + Hours) > 0 ){

        iso8601Time += "T";

        if (Hours > 0){
            iso8601Time += Hours + "H";
        }

        if (Minutes > 0){
            iso8601Time += Minutes + "M";
        }

        if ((HundredthsOfASecond + Seconds) > 0){
            iso8601Time += Seconds;

            if (HundredthsOfASecond > 0){
                iso8601Time += "." + HundredthsOfASecond;
            }

            iso8601Time += "S";
        }

    }


    if (iso8601Time === ""){
        iso8601Time = "T0H0M0S";
    }

    iso8601Time = "P" + iso8601Time;


    return iso8601Time;
}



function ConvertHundredthsIntoSCORMTime(intTotalHundredths){

    var intHours;
    var intintMinutes;
    var intSeconds;
    var intMilliseconds;

    //this function used to accept milliseconds, so just massage the argument here
    //TODO: improvement - clean up this function to work natively with hundredths and be a little tighter
    intTotalMilliseconds = (intTotalHundredths * 10);

    var strCMITimeSpan;

    //extract time parts
    intMilliseconds = intTotalMilliseconds % 1000;

    intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

    intMinutes = ((intTotalMilliseconds - intMilliseconds - (intSeconds * 1000)) / 60000) % 60;

    intHours = (intTotalMilliseconds - intMilliseconds - (intSeconds * 1000) - (intMinutes * 60000)) / 3600000;

    /*
    deal with exceptional case when content used a huge amount of time and interpreted CMITimstamp
    to allow a number of intMinutes and seconds greater than 60 i.e. 9999:99:99.99 instead of 9999:60:60:99
    note - this case is permissable under SCORM, but will be exceptionally rare
    */

    if (intHours == 10000)
    {
        intHours = 9999;

        intMinutes = (intTotalMilliseconds - (intHours * 3600000)) / 60000;
        if (intMinutes == 100)
        {
            intMinutes = 99;
        }
        intMinutes = Math.floor(intMinutes);

        intSeconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000)) / 1000;
        if (intSeconds == 100)
        {
            intSeconds = 99;
        }
        intSeconds = Math.floor(intSeconds);

        intMilliseconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000) - (intSeconds * 1000));

    }

    //drop the extra precision from the milliseconds
    intHundredths = Math.floor(intMilliseconds / 10);

    //put in padding 0's and concatinate to get the proper format
    strCMITimeSpan = ZeroPad(intHours, 4) + ":" + ZeroPad(intMinutes, 2) + ":" + ZeroPad(intSeconds, 2) + "." + intHundredths;

    //check for case where total milliseconds is greater than max supported by strCMITimeSpan
    if (intHours > 9999)
    {
        strCMITimeSpan = "9999:99:99.99";
    }

    return strCMITimeSpan;

}




function RemoveIndiciesFromCmiElement(element){
    return element.replace(REG_EX_DIGITS, "n");
}


function ExtractIndex(strElementName){
    var strIndex = "";
    var aryMatches;

    //get the first ".#." from the string
    aryMatches = strElementName.match(/\.\d+\./);

    if (aryMatches !== null && aryMatches.length > 0){
        //drop the periods
        strIndex = aryMatches[0].replace(/\./g, "");

        strIndex = parseInt(strIndex, 10);
    }
    return strIndex;
}

function ExtractSecondaryIndex(strElementName){

    var strIndex = "";
    var aryMatches;

    //get the first ".#." from the string

    aryMatches = strElementName.match(/\.\d+\./g);

    if (aryMatches !== null && aryMatches.length > 1){

        //drop the periods
        strIndex = aryMatches[1].replace(/\./g, "");

        strIndex = parseInt(strIndex, 10);
    }

    return strIndex;
}

function TranslateDualStausToSingleStatus(completionStatus, successStatus){

    var returnValue = null;

    switch (successStatus){

        case (SCORM_STATUS_PASSED):
            returnValue = SCORM_STATUS_PASSED;
        break;

        case (SCORM_STATUS_FAILED): //failed
            returnValue = SCORM_STATUS_FAILED;
        break;

        case (SCORM_STATUS_UNKNOWN):

            if (completionStatus == SCORM_STATUS_COMPLETED){
                returnValue = SCORM_STATUS_COMPLETED;
            }
            else if (completionStatus == SCORM_STATUS_INCOMPLETE){
                returnValue = SCORM_STATUS_INCOMPLETE;
            }
            else if (completionStatus == SCORM_STATUS_UNKNOWN || completionStatus == SCORM_STATUS_NOT_ATTEMPTED){
                returnValue = SCORM_STATUS_NOT_ATTEMPTED;
            }
            else if (completionStatus == SCORM_STATUS_BROWSED){
                returnValue = SCORM_STATUS_BROWSED;
            }

        break;
    }

    if (returnValue === null){
        return "";
    }
    else{
        return returnValue;
    }
}


function TranslateSingleStatusIntoSuccess(singleStatus){

    var returnValue;

    switch (singleStatus){

        case(SCORM_STATUS_PASSED):
            returnValue = SCORM_STATUS_PASSED;
        break;

        case(SCORM_STATUS_COMPLETED):
            returnValue = SCORM_STATUS_UNKNOWN;
        break;

        case(SCORM_STATUS_FAILED):
            returnValue = SCORM_STATUS_FAILED;
        break;

        case(SCORM_STATUS_INCOMPLETE):
            returnValue = SCORM_STATUS_UNKNOWN;
        break;

        case(SCORM_STATUS_BROWSED):
            returnValue = SCORM_STATUS_UNKNOWN;
        break;

        case(SCORM_STATUS_NOT_ATTEMPTED):
            returnValue = SCORM_STATUS_UNKNOWN;
        break;

        default:
    }

    return returnValue;
}

function TranslateSingleStatusIntoCompletion(singleStatus){

    var returnValue;

    switch (singleStatus){

        case(SCORM_STATUS_PASSED):
            returnValue = SCORM_STATUS_COMPLETED;
        break;

        case(SCORM_STATUS_COMPLETED):
            returnValue = SCORM_STATUS_COMPLETED;
        break;

        case(SCORM_STATUS_FAILED):

            if (Control.Package.Properties.CompletionStatOfFailedSuccessStat ===  SCORM_STATUS_COMPLETED || Control.Package.Properties.CompletionStatOfFailedSuccessStat ===  SCORM_STATUS_INCOMPLETE){
                returnValue = Control.Package.Properties.CompletionStatOfFailedSuccessStat;
            } else {
                returnValue = SCORM_STATUS_COMPLETED;
            }

        break;

        case(SCORM_STATUS_INCOMPLETE):
            returnValue = SCORM_STATUS_INCOMPLETE;
        break;

        case(SCORM_STATUS_BROWSED):
            returnValue = SCORM_STATUS_BROWSED;
        break;

        case(SCORM_STATUS_NOT_ATTEMPTED):
            returnValue = SCORM_STATUS_NOT_ATTEMPTED;
        break;

        default:
    }

    return returnValue;
}

function IsValidCMITimeSpan(value){


    var regValid = /^\d?\d?\d\d:\d\d:\d\d(.\d\d?)?$/;

    if (value.search(regValid) > -1){
        return true;
    }
    else{
        return false;
    }
}

function IsValidCMIDecimal(value){

    //check for characters "0-9", ".", and "-" only
    if (value.search(/[^.\d-]/) > -1){
        return false;
    }

    //if contains a dash, ensure it is first and that there is only 1
    if (value.search("-") > -1){
        if (value.indexOf("-", 1) > -1){
            return false;
        }
    }

    //ensure only 1 decimal point
    if (value.indexOf(".") != value.lastIndexOf(".")){
        return false;
    }

    //ensure there is at least 1 digit
    if (value.search(/\d/) < 0){
        return false;
    }

    return true;

}

function IsValidCMIIdentifier(value){


    //validate string length
    if (value.length > 255){
        return false;
    }

    //can't pass the test suite unless you prohibit empty strings from being set as well
    if (value === ""){
        return false;
    }

    return true;
}

function IsValidCMISInteger(value){


    //check for characters "0-9", and "-" only
    if (value.search(/[^\d-]/) > -1){
        return false;
    }

    //if contains a dash, ensure it is first and that there is only 1
    if (value.search("-") > -1){
        if (value.indexOf("-", 1) > -1){
            return false;
        }
    }

    //ensure there is at least 1 digit
    if (value.search(/\d/) < 0){
        return false;
    }

    value = parseInt(value, 10);
    if (value < -32768 || value > 32768){
        return false;
    }

    return true;
}

function IsValidCMITime(value){


    var regValid = /^\d\d:\d\d:\d\d(.\d\d?)?$/;
    var aryParts;
    var intHours;
    var intMinutes;

    var arySeconds;
    var intSeconds;
    var intSecondFraction = 0;

    //check for proper format
    if (value.search(regValid) < 0){
        return false;
    }

    //break the string into its parts and validate each part
    aryParts = value.split(":");

    intHours = aryParts[0];
    intMinutes = aryParts[1];

    arySeconds = aryParts[2].split(".");
    intSeconds = arySeconds[0];

    if (arySeconds.length > 1){
        intSecondFraction = arySeconds[1];
    }

    if (intHours < 0 || intHours > 23){
        return false;
    }

    if (intMinutes < 0 || intMinutes > 59){
        return false;
    }

    if (intSeconds < 0 || intSeconds > 59){
        return false;
    }

    if (intSecondFraction < 0 || intSecondFraction > 99){
        return false;
    }

    return true;
}


function IsValidCMIFeedback(interactionType, value){

    //be sure to check length on server

    //no response can be greater than 4096 characters
    if (value.length > 4096){
        return false;
    }

    if (RegistrationToDeliver.Package.Properties.ValidateInteractionResponses)
    {
        //even though things are technically supposed to be lower case, allow upper case letters to come in
        value = value.toLowerCase();

        switch(interactionType){

            case "true-false":
                //must start with one of these characters - 0,1,t,f
                if (value.search(/^[01tf]/) !== 0){
                    return false;
                }
                break;

            case "choice":

                //comma delimited list of single digit lower case letters or numbers surrounded by optional {}
                if (value.search(/(^(([a-z0-9])|(([a-z0-9]\,)+[a-z0-9]))$)|(^\{(([a-z0-9])|(([a-z0-9]\,)+[a-z0-9]))\}$)/) !== 0){
                    return false;
                }
                break;

            case "fill-in":
                //any alphanumeric string up to 255 chars
                if (value.length > 255){
                    return false;
                }
                break;

            case "numeric":
                if (! IsValidCMIDecimal(value)){
                    return false;
                }
                break;

            case "likert":

                //single character - can be blank
                //if ( ! ((value.length == 1 && value.search(/^[0-9a-z]$/) === 0) || (value.length === 0))){
                // return false;
                //}

                //above validation was an error, there are no restrictions on the likert format in SCORM 1.2

                break;

            case "matching":
                if (value.search(/(^[0-9a-z]\.[0-9a-z]$)|(^([0-9a-z]\.[0-9a-z]\,)+([0-9a-z]\.[0-9a-z])$)|(^\{[0-9a-z]\.[0-9a-z]\}$)|(^\{([0-9a-z]\.[0-9a-z]\,)+([0-9a-z]\.[0-9a-z])\}$)/) !== 0){
                    return false;
                }
                break;

            case "performance":
                if (value.length > 255){
                    return false;
                }
                break;

            case "sequencing":
                //comma delimited list of single digit lower case letters or numbers
                if (value.search(/(^[a-z0-9]$)|(^([a-z0-9]\,)+[a-z0-9]$)/) !== 0){
                    return false;
                }
                break;

            default:
                //we are unable to determine the type (possibly b/c it hasn't yet been set) so just accept anything
                //we will re-check this value when the type is set
                break;
        }
    }

    return true;
}


//normalizes a raw score to a scaled score between 0-1
function NormalizeRawScore(rawScore, minScore, maxScore){

    //raw score is required to be a valid decimal 0-100 in SCORM 1.2

    var normalizedScore = null;

    if (minScore !== null && minScore !== undefined){
        minScore = parseFloat(minScore);
    }

    if (maxScore !== null && maxScore !== undefined){
        maxScore = parseFloat(maxScore);
    }

    if (rawScore !== null && rawScore !== undefined){

        rawScore = parseFloat(rawScore);

        if (minScore !== null && minScore !== undefined &&
            maxScore !== null && maxScore !== undefined &&
            rawScore >= minScore &&
            rawScore <= maxScore){

            if (minScore == maxScore){
                normalizedScore = 1;
            }
            else{
                normalizedScore = ((rawScore - minScore) / (maxScore - minScore));
            }
        }

        else{ //no valid min and max score, so try to assume that the score is 0-100

            if (rawScore >= 0 && rawScore <= 100){
                normalizedScore = (rawScore / 100);
            }
        }
    }

    if (normalizedScore !== null){
        return RoundToPrecision(normalizedScore, 7);
    }
    else{
        return null;
    }
}
