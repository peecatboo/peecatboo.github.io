;
(function() {

    //initialEntries is an optimal parameter to be a bit more efficient

    StringBuilder = function(initialEntries) {

        if (initialEntries !== null && parseInt(initialEntries, 10) > 0) {
            this.Contents = new Array(parseInt(initialEntries, 10));
        } else {
            this.Contents = new Array();
        }
        this.CurrentEntry = 0;
    }

    StringBuilder.prototype.Append = StringBuilder_Append;
    StringBuilder.prototype.AppendLine = StringBuilder_AppendLine;
    StringBuilder.prototype.toString = StringBuilder_toString;


    function StringBuilder_Append(str) {
        this.Contents[this.CurrentEntry] = str;
        this.CurrentEntry++;
    }

    function StringBuilder_AppendLine(str) {
        this.Append(str + "\r\n");
    }

    function StringBuilder_toString() {
        return this.Contents.join("").trim();
    }

})();
