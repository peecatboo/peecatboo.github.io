(function() {
    LearningObject = function(
        Title,
        Href,
        Parameters,
        DataFromLms,
        MasteryScore,
        MaxTimeAllowed,
        TimeLimitAction,
        Prerequisites,
        Visible,
        CompletedByMeasure,
        CompletionThreshold,
        CompletionProgressWeight,
        PersistState,
        ItemIdentifier,
        ResourceIdentifier,
        ExternalIdentifier,
        DatabaseIdentifier,
        ScormType,
        SSPBuckets,
        sequencingData,
        SharedDataMaps,
        Children) {
        if (arguments.length > 1) {
            this.Title = Title;
            this.Href = Href;
            this.Parameters = Parameters;
            this.DataFromLms = DataFromLms;
            this.MasteryScore = MasteryScore;
            this.MaxTimeAllowed = MaxTimeAllowed;
            this.TimeLimitAction = TimeLimitAction;
            this.Prerequisites = Prerequisites;
            this.Visible = Visible;
            this.CompletedByMeasure = CompletedByMeasure;
            this.CompletionThreshold = CompletionThreshold;
            this.CompletionProgressWeight = CompletionProgressWeight;
            this.PersistState = PersistState;
            this.ItemIdentifier = ItemIdentifier;
            this.ResourceIdentifier = ResourceIdentifier;
            this.ExternalIdentifier = ExternalIdentifier;
            this.DatabaseIdentifier = DatabaseIdentifier;
            this.ScormType = ScormType;
            this.SSPBuckets = SSPBuckets;
            this.SequencingData = sequencingData;
            this.SharedDataMaps = SharedDataMaps;
            this.Children = Children;
        } else { // JSON data
            var data = arguments[0];
            this.Title = data.Title;
            this.Href = data.Href;
            this.Parameters = data.Parameters;
            this.DataFromLms = data.DataFromLms;
            this.MasteryScore = data.MasteryScore;
            this.MaxTimeAllowed = data.MaxTimeAllowed;
            this.TimeLimitAction = data.TimeLimitAction;
            this.Prerequisites = data.Prerequisites;
            this.Visible = data.Visible;
            this.CompletedByMeasure = data.CompletedByMeasure;
            this.CompletionThreshold = data.CompletionThreshold;
            this.CompletionProgressWeight = data.CompletionProgressWeight;
            this.PersistState = data.PersistState;
            this.ItemIdentifier = data.ItemIdentifier;
            this.ResourceIdentifier = data.ResourceIdentifier;
            this.ExternalIdentifier = data.ExternalIdentifier;
            this.DatabaseIdentifier = data.DatabaseIdentifier;
            this.ScormType = data.ScormType;
            this.SSPBuckets = data.SSPBuckets;
            this.SequencingData = new SequencingData(data.SequencingData);
            this.SharedDataMaps = data.SharedDataMaps;
            this.Children = data.Children.map(function (c) {
                return new LearningObject(c);
            });
        }
        //flag to indicate that this activity has had the default rollup rules applied to it. flag helps us present more informative debug logs
        //needs to be on learning object instead of activity because these rules get added to the learning object (which isn't cloned) by the look
        //ahead sequencer
        this.UsesDefaultSatisfactionRollupRules = false;
        this.UsesDefaultCompletionRollupRules = false;
    };

    LearningObject.prototype.GetScaledPassingScore = LearningObject_GetScaledPassingScore;

    function LearningObject_GetScaledPassingScore() {
        //if there is sequencing data and there is a primary objective
        if (this.SequencingData !== null && this.SequencingData.PrimaryObjective !== null) {
            //if satisfied by measure is true (and not null...implicit in "==true" affirmation)
            if (this.SequencingData.PrimaryObjective.SatisfiedByMeasure === true) {
                //if there is a min normalized measure
                if (this.SequencingData.PrimaryObjective.MinNormalizedMeasure !== null) {
                    //return min normalzied measure
                    return this.SequencingData.PrimaryObjective.MinNormalizedMeasure;
                } else {
                    //return 1.0
                    return 1;
                }
            }
        }
        //return unknown
        return null;
    }
})();
