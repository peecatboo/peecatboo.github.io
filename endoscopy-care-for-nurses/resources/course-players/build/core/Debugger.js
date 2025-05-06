
// function Debugger(recordControlAudit, recordControlDetailed, recordRteAudit, recordRteDetailed,
//                   recordSequencingAudit, recordSequencingDetailed, recordSequencingSimple, recordLookAheadAudit,
//                   recordLookAheadDetailed, version, includeTimestamps){
//     this.auditCount = 0;

//     this.RecordControlAudit = recordControlAudit;
//     this.RecordControlDetailed = recordControlDetailed;
//     if (this.RecordControlDetailed) {
//         this.RecordControlAudit = true;
//     }

//     this.RecordRteAudit = recordRteAudit;
//     this.RecordRteDetailed = recordRteDetailed;
//     if (this.RecordRteDetailed) {
//         this.RecordRteAudit = true;
//     }

//     this.RecordSequencingAudit = recordSequencingAudit;
//     this.RecordSequencingDetailed = recordSequencingDetailed;
//     if (this.RecordSequencingDetailed) {
//         this.RecordSequencingAudit = true;
//     }

//     this.RecordLookAheadAudit = recordLookAheadAudit;
//     this.RecordLookAheadDetailed = recordLookAheadDetailed;
//     if (this.RecordLookAheadDetailed) {
//         this.RecordLookAheadAudit = true;
//     }

//     this.RecordSequencingSimple = recordSequencingSimple;

//     // Functions
//     this.Write = Debugger_Write;
//     this.AssertError = Debugger_AssertError;
//     this.DataIsAvailable = Debugger_DataIsAvailable;
//     this.ShowAllAvailableData = Debugger_ShowAllAvailableData;

//     this.WriteControlAudit = Debugger_WriteControlAudit;
//     this.WriteControlDetailed = Debugger_WriteControlDetailed;
//     this.WriteRteAudit = Debugger_WriteRteAudit;
//     this.WriteRteAuditReturnValue = Debugger_WriteRteAuditReturnValue;
//     this.WriteRteDetailed = Debugger_WriteRteDetailed;

//     this.WriteSequencingAudit = Debugger_WriteSequencingAudit;
//     this.WriteSequencingAuditReturnValue = Debugger_WriteSequencingAuditReturnValue;
//     this.WriteSequencingDetailed = Debugger_WriteSequencingDetailed;

//     this.WriteSequencingSimpleAudit = Debugger_WriteSequencingSimpleAudit;
//     this.WriteSequencingSimpleReturnValue = Debugger_WriteSequencingSimpleReturnValue;
//     this.WriteSequencingSimpleDetailed = Debugger_WriteSequencingSimpleDetailed;

//     this.WriteLookAheadAudit = Debugger_WriteLookAheadAudit;
//     this.WriteLookAheadAuditReturnValue = Debugger_WriteLookAheadAuditReturnValue;
//     this.WriteLookAheadDetailed = Debugger_WriteLookAheadDetailed;

//     this.GetErrors = Debugger_GetErrors;

//     //this.items = new Array();
//     this.log = new Log(version, includeTimestamps);

//     this.currentControlEntry = null;
//     this.currentRunTimeEntry = null;
//     this.currentSequencingEntry = null;
//     this.currentLookAheadEntry = null;
//     this.currentSequencingSimpleEntry = null;

//     this.ErrorDataExists = false;
//     this.ShowDebugLogAtExit = false;

//     this.version = version;
//     this.includeTimestamps = includeTimestamps;
// }

// function Debugger_Write(str){
//     this.AssertError("Debug.Write function is deprecated. Remove all calls.");
// }

// function Debugger_AssertError(arg, errorCondition){

//     if (errorCondition === undefined || errorCondition === null || errorCondition === true){
//         Debug.WriteControlAudit("Code Asserted Error-" + arg);
//         if (confirm(arg + "\r\nWould you like to enter debug mode?")){
//             var x=a.b.c;
//         }
//     }
// }

// function Debugger_DataIsAvailable(){

//     var dataIsAvailable = this.RecordControlAudit ||
//                             this.RecordControlDetailed ||
//                             this.RecordRteAudit ||
//                             this.RecordRteDetailed ||
//                             this.RecordSequencingAudit ||
//                             this.RecordSequencingDetailed ||
//                             this.RecordLookAheadAudit ||
//                             this.RecordLookAheadDetailed ||
//                             this.ErrorDataExists;

//     return dataIsAvailable;
// }


// function Debugger_ShowAllAvailableData(loadAllData){
//     if (loadAllData === undefined || loadAllData === null)
//         loadAllData = false;
//     this.log.display(loadAllData);
// }

// //
// // Control
// //
// function Debugger_WriteControlAudit(args, parentEntry, isError){

//     //alert("this.RecordControlAudit=" + this.RecordControlAudit);

//     if (isError) {
//         this.ErrorDataExists = true;
//     }

//     if (this.RecordControlAudit || isError) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentControlEntry = this.log.startNew("c", args);
//         }
//         else{
//             this.currentControlEntry = parentEntry.startNew("c", args);
//         }

//         this.currentControlEntry.setAttribute("id", this.auditCount++);
//         return this.currentControlEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function Debugger_WriteControlAuditReturnValue(str, parentEntry, isError){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentControlEntry == null) {
//         return;
//     }

//     if (this.RecordControlAudit || isError) {
//         this.currentControlEntry.setReturn(str);
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentControlEntry = parentEntry;
//     } else {
//         this.AssertError("Debugger_WriteControlAuditReturnValue() called without parentEntry");
//     }
// }

// function Debugger_WriteControlDetailed(str, parentEntry, isError){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentControlEntry == null) {
//         return;
//     }

//     if (isError) {
//         var errorEntry = this.WriteControlAudit("Control ERROR", null, true)
//         errorEntry.write(str);
//     }
//     else if (this.RecordControlDetailed) {
//         if (parentEntry !== undefined && parentEntry !== null){
//             parentEntry.write(str);
//         }
//         else{
//             this.currentControlEntry.write(str);
//         }
//     }
// }

// //
// // RunTime
// //
// function Debugger_WriteRteAudit(args, parentEntry){

//     if (this.RecordRteAudit) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentRunTimeEntry = this.log.startNew("rt", args);
//         }
//         else{
//             this.currentRunTimeEntry = parentEntry.startNew("rt", args);
//         }

//         this.currentRunTimeEntry.setAttribute("id", this.auditCount++);
//         return this.currentRunTimeEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function Debugger_WriteRteAuditReturnValue(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentRunTimeEntry == null) {
//         return;
//     }

//     if (this.RecordRteAudit) {
//         this.currentRunTimeEntry.setReturn(str);
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentRunTimeEntry = parentEntry;
//     } else {
//         //this.AssertError("Debugger_WriteRteAuditReturnValue() called without parentEntry");
//     }
// }

// function Debugger_WriteRteDetailed(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentRunTimeEntry == null) {
//         return;
//     }

//     if (this.RecordRteDetailed) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentRunTimeEntry.write(str);
//         }
//         else{
//             parentEntry.write(str);
//         }
//     }
// }

// //
// // Sequencing
// //
// function Debugger_WriteSequencingAudit(args, parentEntry){

//     if (this.RecordSequencingAudit) {

//         if (parentEntry === undefined || parentEntry === null){
//             this.currentSequencingEntry = this.log.startNew("s", args);
//         }
//         else{
//             this.currentSequencingEntry = parentEntry.startNew("s", args);
//         }

//         this.currentSequencingEntry.setAttribute("id", this.auditCount++);
//         return this.currentSequencingEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function Debugger_WriteSequencingAuditReturnValue(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentSequencingEntry == null) {
//         return;
//     }

//     if (this.RecordSequencingAudit) {
//         this.currentSequencingEntry.setReturn(str);
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentSequencingEntry = parentEntry;
//     } else {
//         this.AssertError("Debugger_WriteSequencingAuditReturnValue() called without parentEntry");
//     }
// }

// function Debugger_WriteSequencingDetailed(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentSequencingEntry == null) {
//         return;
//     }

//     if (this.RecordSequencingDetailed) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentSequencingEntry.write(str);
//         }
//         else{
//             parentEntry.write(str);
//         }
//     }
// }

// //
// // Look Ahead
// //
// function Debugger_WriteLookAheadAudit(args, parentEntry){

//     if (this.RecordLookAheadAudit) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentLookAheadEntry = this.log.startNew("l", args);
//         }
//         else{
//             this.currentLookAheadEntry = parentEntry.startNew("l", args);
//         }

//         this.currentLookAheadEntry.setAttribute("id", this.auditCount++);
//         return this.currentLookAheadEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function Debugger_WriteLookAheadAuditReturnValue(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentLookAheadEntry == null) {
//         return;
//     }

//     if (this.RecordLookAheadAudit) {
//         this.currentLookAheadEntry.setReturn(str);
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentLookAheadEntry = parentEntry;
//     } else {
//         this.AssertError("Debugger_WriteLookAheadAuditReturnValue() called without parentEntry");
//     }
// }

// function Debugger_WriteLookAheadDetailed(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentLookAheadEntry == null) {
//         return;
//     }

//     if (this.RecordLookAheadDetailed) {

//         if (parentEntry === undefined || parentEntry === null){
//             this.currentLookAheadEntry.write(str);
//         }
//         else{
//             parentEntry.write(str);
//         }

//     }
// }

// function Debugger_WriteSequencingSimpleAudit(args, parentEntry){

//     if (this.RecordSequencingSimple) {
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentSequencingSimpleEntry = this.log.startNew("ss", args);
//         }
//         else{
//             this.currentSequencingSimpleEntry = parentEntry.startNew("ss", args);
//         }

//         this.currentSequencingSimpleEntry.setAttribute("id", this.auditCount++);
//         return this.currentSequencingSimpleEntry;
//     } else {
//         return disabledLogEntry;
//     }

// }

// function Debugger_WriteSequencingSimpleReturnValue(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentSequencingSimpleEntry == null) {
//         return;
//     }

//     if (this.RecordSequencingSimple) {
//         this.currentSequencingSimpleEntry.setReturn(str);
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentSequencingSimpleEntry = parentEntry;
//     } else {
//         this.AssertError("Debugger_WriteLookAheadAuditReturnValue() called without parentEntry");
//     }
// }

// function Debugger_WriteSequencingSimpleDetailed(str, parentEntry){

//     // Only possibility for null is when dynamically turning on debugging at runtime
//     if (this.currentSequencingSimpleEntry == null) {
//         return;
//     }

//     if (this.RecordSequencingSimple) {

//         if (parentEntry === undefined || parentEntry === null){
//             this.currentSequencingSimpleEntry.write(str);
//         }
//         else{
//             parentEntry.write(str);
//         }
//     }
// }

// function Debugger_GetErrors() {
//     var xpathStmt = "//c[@f='Control ERROR']";
//     var nodes = this.log.dom.selectNodes(xpathStmt);

//     var result = new Array();
//     for (var i=0; i<nodes.length; i++) {
//         if (nodes[i].text !== undefined){
//             result[result.length] = nodes[i].text;
//         } else {
//             result[result.length] = nodes[i].textContent;
//         }
//     }

//     return result;
// }


// // "Dummy" disabled LogEntry to be returned by disabled logging functions
// function DisabledLogEntry() {}
// DisabledLogEntry.prototype.write = function() {};
// DisabledLogEntry.prototype.error = function() {};
// DisabledLogEntry.prototype.startNew = function() { return disabledLogEntry };
// DisabledLogEntry.prototype.setAttribute = function() {};
// DisabledLogEntry.prototype.setReturn = function() {};

// // Create a single global instance
// disabledLogEntry = new DisabledLogEntry();
