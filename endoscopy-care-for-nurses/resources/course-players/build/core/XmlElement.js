;
(function() {

    //TODO - possible optimization, specify initial num of attributes and elements to initialize array sizes

    XmlElement = function(elementName) {
        this.ElementName = elementName;
        this.Attributes = new Array();
        this.Elements = new Array();
    }

    XmlElement.prototype.AddAttribute = XmlElement_AddAttribute;
    XmlElement.prototype.AddElement = XmlElement_AddElement;

    XmlElement.prototype.Encode = XmlElement_Encode;
    XmlElement.prototype.toString = XmlElement_toString;

    function XmlElement_AddAttribute(attributeName, attributeValue) {
        this.Attributes[attributeName] = this.Encode(attributeValue);
    }

    function XmlElement_AddElement(strElement) {
        this.Elements[this.Elements.length] = strElement;
    }

    function XmlElement_toString() {

        var xml = new StringBuilder(this.Attributes.length + this.Elements.length + 2);

        xml.Append("<" + this.ElementName + " ");

        for (var attribute in this.Attributes) {
            if (!this.Attributes.hasOwnProperty(attribute)) {
                continue;
            }
            xml.Append(attribute + "=\"" + this.Attributes[attribute] + "\" ");
        }

        if (this.Elements.length > 0) {

            xml.AppendLine(">");

            for (var i = 0; i < this.Elements.length; i++) {
                xml.AppendLine(this.Elements[i]);
            }

            xml.AppendLine("</" + this.ElementName + ">");
        } else {
            xml.AppendLine("/>");
        }

        return xml.toString().trim();
    }

    function XmlElement_Encode(str) {

        str = new String(str);

        if (str !== null) {

            str = str.replace(/\&/g, "&amp;");
            str = str.replace(/\</g, "&lt;");
            str = str.replace(/\>/g, "&gt;");
            str = str.replace(/\'/g, "&apos;");
            str = str.replace(/\"/g, "&quot;");

            //replace any non-printable ASCII characters (<32) or any unicode characters (>127) with their unicode hex escape value.
            //
            //test to make sure the javascript implementation supports a function as the second parm and
            //use an alternative method if necessary
            if ('a'.replace(/a/, function() {
                return '';
            }).length == 0) { // Does it support a function as second parm?
                str = str.replace(/(\w|\W)/g, XmlElement_CharacterEscape);
            } else {
                str = EscapeCharacters(str);
            }
        }

        return str;
    }

    //translates any non-printable ASCII characters (<32) or any unicode characters (>127) with their unicode hex escape value

    XmlElement_CharacterEscape = function(s, match) {

        var charCode = match.charCodeAt(0);
        charCode = new Number(charCode);
        if (charCode > 127) {
            return '&#x' + charCode.toString(16) + ';';
        } else if (charCode < 32) {
            //dirty, dirty hack to disguise illegal xml characters...  see comment and end of file for more info.
            return '&amp;#x' + charCode.toString(16) + ';';
        } else {
            return match;
        }
    }

    //stand-alone version of function that translates any non-printable ASCII characters (<32) or any unicode characters (>127) with their unicode hex escape value

    function EscapeCharacters(str) {

        var outStr = new StringBuilder();

        for (var c = 0; c < str.length; c++) {
            var charCode = str.charCodeAt(c);
            if (charCode > 127) {
                outStr.Append('&#x' + charCode.toString(16) + ';');
            } else if (charCode < 32) {
                //dirty, dirty hack to disguise illegal xml characters...  see comment and end of file for more info.
                outStr.Append('&amp;#x' + charCode.toString(16) + ';');
            } else {
                outStr.Append(str.charAt(c));
            }
        }

        return outStr.toString();
    }

    // ASCII characters 0-31 (except 9, 10, and 13) are illegal in a well-formed XML
    // document, even when properly escaped, but we're translating them anyway.
    // This was causing problems on the server side, because those characters were
    // breaking the XSLT transform and further processing of all XML messages that
    // contained the illegal characters.  By escaping the leading ampersand, we can
    // trick the server-side processing into overlooking the illegal characters.
    // The escaped ampersands are then translated into real ones on the return trip,
    // so the data remains intact when removed from the XML.

    // We now also 'protect' the leading ampersand for encoded white space characters
    // too.  Otherwise the Java server's xsl transform expands them and they get transformed
    // into spaces when we reload the translated document.

})();
