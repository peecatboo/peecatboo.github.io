(function() {
    Registration = function(
        Id,
        SuspendedActivity,
        TrackingEnabled,
        LessonMode,
        Package,
        Activities,
        GlobalObjectives,
        SSPBuckets,
        SharedData) {
        this.Id = Id;
        this.SuspendedActivity = SuspendedActivity;
        this.TrackingEnabled = TrackingEnabled;
        this.LessonMode = LessonMode;
        this.Package = Package;
        this.Activities = Activities;
        this.GlobalObjectives = GlobalObjectives;
        this.SSPBuckets = SSPBuckets;
        this.SharedData = SharedData;
    }

    Registration.prototype.FindActivityForThisScormObject = Registration_FindActivityForThisScormObject;


    function Registration_FindActivityForThisScormObject(databaseId) {

        for (var i = 0; i < this.Activities.length; i++) {
            if (this.Activities[i].ScormObjectDatabaseId == databaseId) {
                return this.Activities[i];
            }
        }

        // Debug.AssertError("Registration_FindActivityForThisScormObject could not find the activity for learning object " + databaseId);

        return null;
    }

})();
