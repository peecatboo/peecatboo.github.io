(function() {
    SequencingObjectiveMap = function(
        TargetObjectiveId,
        ReadSatisfiedStatus,
        ReadNormalizedMeasure,
        ReadRawScore,
        ReadMinScore,
        ReadMaxScore,
        ReadCompletionStatus,
        ReadProgressMeasure,
        WriteSatisfiedStatus,
        WriteNormalizedMeasure,
        WriteRawScore,
        WriteMinScore,
        WriteMaxScore,
        WriteCompletionStatus,
        WriteProgressMeasure) {
        if (arguments.length > 1) {
            this.TargetObjectiveId = TargetObjectiveId;
            this.ReadSatisfiedStatus = ReadSatisfiedStatus;
            this.ReadNormalizedMeasure = ReadNormalizedMeasure;
            this.ReadRawScore = ReadRawScore;
            this.ReadMinScore = ReadMinScore;
            this.ReadMaxScore = ReadMaxScore;
            this.ReadCompletionStatus = ReadCompletionStatus;
            this.ReadProgressMeasure = ReadProgressMeasure;
            this.WriteSatisfiedStatus = WriteSatisfiedStatus;
            this.WriteNormalizedMeasure = WriteNormalizedMeasure;
            this.WriteRawScore = WriteRawScore;
            this.WriteMinScore = WriteMinScore;
            this.WriteMaxScore = WriteMaxScore;
            this.WriteCompletionStatus = WriteCompletionStatus;
            this.WriteProgressMeasure = WriteProgressMeasure;
        } else {
            var data = arguments[0];
            this.TargetObjectiveId = data.TargetObjectiveId;
            this.ReadSatisfiedStatus = data.ReadSatisfiedStatus;
            this.ReadNormalizedMeasure = data.ReadNormalizedMeasure;
            this.ReadRawScore = data.ReadRawScore;
            this.ReadMinScore = data.ReadMinScore;
            this.ReadMaxScore = data.ReadMaxScore;
            this.ReadCompletionStatus = data.ReadCompletionStatus;
            this.ReadProgressMeasure = data.ReadProgressMeasure;
            this.WriteSatisfiedStatus = data.WriteSatisfiedStatus;
            this.WriteNormalizedMeasure = data.WriteNormalizedMeasure;
            this.WriteRawScore = data.WriteRawScore;
            this.WriteMinScore = data.WriteMinScore;
            this.WriteMaxScore = data.WriteMaxScore;
            this.WriteCompletionStatus = data.WriteCompletionStatus;
            this.WriteProgressMeasure = data.WriteProgressMeasure;
        }
    };

    SequencingObjectiveMap.prototype.toString = function() {
        return "TargetObjectiveId=" + this.TargetObjectiveId +
            ", ReadSatisfiedStatus=" + this.ReadSatisfiedStatus +
            ", ReadNormalizedMeasure=" + this.ReadNormalizedMeasure +
            ", ReadRawScore=" + this.ReadRawScore +
            ", ReadMinScore=" + this.ReadMinScore +
            ", ReadMaxScore=" + this.ReadMaxScore +
            ", ReadCompletionStatus=" + this.ReadCompletionStatus +
            ", ReadProgressMeasure=" + this.ReadProgressMeasure +
            ", WriteSatisfiedStatus=" + this.WriteSatisfiedStatus +
            ", WriteNormalizedMeasure=" + this.WriteNormalizedMeasure +
            ", WriteRawScore=" + this.WriteRawScore +
            ", WriteMinScore=" + this.WriteMinScore +
            ", WriteMaxScore=" + this.WriteMaxScore +
            ", WriteCompletionStatus=" + this.WriteCompletionStatus +
            ", WriteProgressMeasure=" + this.ReadProgressMeasure;
    };

})();
