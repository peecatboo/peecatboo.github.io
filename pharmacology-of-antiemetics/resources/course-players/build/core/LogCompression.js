
function LogCompression(dictionaryObj){

    this.dictionary = dictionaryObj;
    this.dictKeyDelimiter = this.dictionary["delimiter"];

}
//compressedXmlInput: xml object with compressed attributes
//returns a decompressed xml string
LogCompression.prototype.decompressXmltoString = function(compressedXmlInput){
    var str = compressedXmlInput.toString();
    var diction = this.dictionary;
    var regexp = new RegExp(this.dictKeyDelimiter + "([0-9]{1,4})" + this.dictKeyDelimiter, "g");

    function getDictionaryValueforStrReplace(){
        return diction[arguments[1]];
    }

    return str.replace(regexp, getDictionaryValueforStrReplace);

}

LogCompression.prototype.decompressString = function(compressedStringInput){
    var diction = this.dictionary;
    var regexp = new RegExp(this.dictKeyDelimiter + "([0-9]{1,4})" + this.dictKeyDelimiter, "g");

    function getDictionaryValueforStrReplace(){
        return diction[arguments[1]];
    }

    return compressedStringInput.replace(regexp, getDictionaryValueforStrReplace);

}
