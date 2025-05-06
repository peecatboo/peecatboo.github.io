(function() {
    SequencingObjective = function(
        Id,
        SatisfiedByMeasure,
        MinNormalizedMeasure,
        Maps) {
        if (arguments.length > 1) {
            this.Id = Id;
            this.SatisfiedByMeasure = SatisfiedByMeasure;
            this.MinNormalizedMeasure = MinNormalizedMeasure;
            this.Maps = Maps;
        } else {
            var data = arguments[0];
            this.Id = data.Id;
            this.SatisfiedByMeasure = data.SatisfiedByMeasure;
            this.MinNormalizedMeasure = data.MinNormalizedMeasure;
            this.Maps = data.Maps.map(function (m) {
                return new SequencingObjectiveMap(m);
            });
        }
    };

    SequencingObjective.prototype.toString =
        function() {
            var ret = "Id=" + this.Id +
                ", SatisfiedByMeasure=" + this.SatisfiedByMeasure +
                ", MinNormalizedMeasure=" + this.MinNormalizedMeasure;

            ret += "Maps:";
            for (var map in this.Maps) {
                if (!this.Maps.hasOwnProperty(map)) {
                    continue;
                }
                ret += "{" + map + "}" + this.Maps[map] + "  ";
            }
            return ret;
    };

})();
