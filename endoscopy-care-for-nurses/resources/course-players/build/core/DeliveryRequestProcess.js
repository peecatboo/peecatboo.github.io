//****************************************************************************************************************

//Delivery Request Process [DB.1.1]
//For a delivery request; returns the validity of the delivery request; may return an exception code
//Reference:
//Check Activity Process UP.5

function Sequencer_DeliveryRequestProcess(deliveryRequest, callingLog) {

    var checkActivityResult;
    var returnValue;

    if (!deliveryRequest.IsALeaf()) {

        returnValue = new Sequencer_DeliveryRequestProcessResult(false, "DB.1.1-1", IntegrationImplementation.GetString("You cannot select '{0}' at this time.  Please select another menu item to continue with '{0}.'", deliveryRequest.GetTitle()));
        return returnValue;
    }

    var aryParents = this.GetActivityPath(deliveryRequest, true);

    if (aryParents.length === 0) {

        returnValue = new Sequencer_DeliveryRequestProcessResult(false, "DB.1.1-2", IntegrationImplementation.GetString("Nothing to open"));
        return returnValue;
    }

    for (var i = 0; i < aryParents.length; i++) {

        checkActivityResult = this.CheckActivityProcess(aryParents[i]);

        if (checkActivityResult === true) {

            returnValue = new Sequencer_DeliveryRequestProcessResult(false, "DB.1.1-3", IntegrationImplementation.GetString("You cannot select '{0}' at this time.  Please select another menu item to continue with '{0}.'", deliveryRequest.GetTitle()));
            return returnValue;
        }
    }

    returnValue = new Sequencer_DeliveryRequestProcessResult(true, null, "");
    return returnValue;
}

function Sequencer_DeliveryRequestProcessResult(valid, exception, exceptionText) {
    this.Valid = valid;
    this.Exception = exception;
    this.ExceptionText = exceptionText;

}

Sequencer_DeliveryRequestProcessResult.prototype.toString = function() {
    return "Valid=" + this.Valid +
        ", Exception=" + this.Exception +
        ", ExceptionText=" + this.ExceptionText;
};
