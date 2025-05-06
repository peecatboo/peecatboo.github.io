(function() {
    Package = function(
        Id,
        ObjectivesGlobalToSystem,
        LearningStandardValue,
        Properties,
        SharedDataGlobalToSystem,
        LearningObjects) {
        this.Id = Id;
        this.ObjectivesGlobalToSystem = ObjectivesGlobalToSystem;
        this.LearningStandard = new LearningStandard(LearningStandardValue);
        this.Properties = Properties;
        this.SharedDataGlobalToSystem = SharedDataGlobalToSystem;
        this.LearningObjects = LearningObjects;
    }

})();
