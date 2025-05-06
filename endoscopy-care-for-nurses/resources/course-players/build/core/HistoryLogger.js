
// function HistoryLogger(recordHistory, recordHistoryDetailed, version){

//     this.auditCount = 0;

//     this.RecordHistory = recordHistory;
//     this.RecordHistoryDetailed = recordHistoryDetailed;
//     if (this.RecordHistoryDetailed) {
//         this.RecordHistory = true;
//     }

//     // Functions
//     this.DataIsAvailable = HistoryLogger_DataIsAvailable;
//     this.ShowAllAvailableData = HistoryLogger_ShowAllAvailableData;

//     this.WriteEvent = HistoryLogger_WriteEvent;
//     this.WriteEventReturnValue = HistoryLogger_WriteEventReturnValue;

//     this.WriteEventDetailed = HistoryLogger_WriteEventDetailed;
//     this.WriteEventDetailedReturnValue = HistoryLogger_WriteEventDetailedReturnValue;

//     this.GetSerializedLog = HistoryLogger_GetSerializedLog;

//     // Create our own log, always include timestamps
//     this.log = new Log(version, true, "RTL");

//     this.currentEntry = null;

//     this.DataExists = false;

//     this.version = version;
//     this.includeTimestamps = true;
// }


// function HistoryLogger_DataIsAvailable(){

//     return this.DataExists;
// }

// function HistoryLogger_ShowAllAvailableData(){
//     this.log.display();
// }

// function HistoryLogger_WriteEvent(args, atts, parentEntry){

//     if (this.RecordHistory) {
//         // If we have an event then don't bother writing the args entry
//         var myArgs = (atts !== undefined && atts !== null && atts.event ? '' : args);
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentEntry = this.log.startNew("RT", myArgs);
//         }
//         else{
//             this.currentEntry = parentEntry.startNew("RT", myArgs);
//         }

//         this.currentEntry.setAttribute("id", this.auditCount++);

//         for (var attribute in atts) {
//             this.currentEntry.setAttribute(attribute, atts[attribute])
//         }

//         return this.currentEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function HistoryLogger_WriteEventReturnValue(str, atts, parentEntry){

//     // Only possibility for null is when dynamically turning on logging at runtime
//     // (not currently supported for history logger)
//     if (this.currentEntry == null) {
//         return;
//     }

//     if (this.RecordHistory) {
//         this.currentEntry.setReturn(str);
//         for (var attribute in atts) {
//             this.currentEntry.setAttribute(attribute, atts[attribute])
//         }
//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentEntry = parentEntry;
//     } else {
//         //this.AssertError("HistoryLogger_WriteEventReturnValue() called without parentEntry");
//     }
// }

// function HistoryLogger_WriteEventDetailed(args, atts, parentEntry){

//     if (this.RecordHistoryDetailed) {
//         // If we have an event then don't bother writing the args entry
//         var myArgs = (atts !== undefined && atts !== null && atts.event ? '' : args);
//         if (parentEntry === undefined || parentEntry === null){
//             this.currentEntry = this.log.startNew("RT", myArgs);
//         }
//         else{
//             this.currentEntry = parentEntry.startNew("RT", myArgs);
//         }

//         this.currentEntry.setAttribute("id", this.auditCount++);

//         for (var attribute in atts) {
//             this.currentEntry.setAttribute(attribute, atts[attribute])
//         }

//         return this.currentEntry;
//     } else {
//         return disabledLogEntry;
//     }
// }

// function HistoryLogger_WriteEventDetailedReturnValue(str, atts, parentEntry){

//     // Only possibility for null is when dynamically turning on logging at runtime
//     // (not currently supported for history logger)
//     if (this.currentEntry == null) {
//         return;
//     }

//     if (this.RecordHistoryDetailed) {
//         this.currentEntry.setReturn(str);
//         for (var attribute in atts) {
//             this.currentEntry.setAttribute(attribute, atts[attribute])
//         }

//     }

//     if (parentEntry !== null && parentEntry !== undefined) {
//         this.currentEntry = parentEntry;
//     } else {
//         //this.AssertError("HistoryLogger_WriteEventDetailedReturnValue() called without parentEntry");
//     }
// }

// function HistoryLogger_GetSerializedLog(){
//     return this.log.serializeDomElement(this.log.dom.getElementsByTagName('RTL')[0]);
// }
