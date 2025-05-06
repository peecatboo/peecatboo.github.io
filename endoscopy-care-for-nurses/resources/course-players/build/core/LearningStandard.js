(function() {
    LearningStandard = function(
        LearningStandardValue) {
        this.value = LearningStandardValue;
    }

    LearningStandard.prototype.isAICC = LearningStandard_isAICC;
    LearningStandard.prototype.is12 = LearningStandard_is12;
    LearningStandard.prototype.is2004 = LearningStandard_is2004;
    LearningStandard.prototype.is20043rdOrGreater = LearningStandard_is20043rdOrGreater;
    LearningStandard.prototype.is20044thOrGreater = LearningStandard_is20044thOrGreater;

    function LearningStandard_isAICC() {
        if (this.value == STANDARD_AICC) {
            return true;
        }

        return false;
    }

    function LearningStandard_is12() {
        if (this.value == STANDARD_SCORM_12) {
            return true;
        }

        return false;
    }

    function LearningStandard_is2004() {
        if (this.value == STANDARD_SCORM_2004_2ND_EDITION ||
            this.value == STANDARD_SCORM_2004_3RD_EDITION ||
            this.value == STANDARD_SCORM_2004_4TH_EDITION) {
            return true;
        }

        return false;
    }

    function LearningStandard_is20043rdOrGreater() {
        if (this.value == STANDARD_SCORM_2004_3RD_EDITION ||
            this.value == STANDARD_SCORM_2004_4TH_EDITION) {
            return true;
        }

        return false;
    }

    function LearningStandard_is20044thOrGreater() {
        if (this.value == STANDARD_SCORM_2004_4TH_EDITION) {
            return true;
        }

        return false;
    }

    LearningStandard.prototype.toString =
        function() {
            return this.value
    };

})();
