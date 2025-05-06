;
(function() {

    MenuItem = function(parentMenuItem, activity, isClone) {

        this.ParentMenuItem      = parentMenuItem;
        this.ActivityId          = activity.GetItemIdentifier();
        this.MenuElementId       = this.ActivityId;
        this.Title               = activity.GetTitle();
        this.Satisfied           = activity.IsSatisfied();
        this.Completed           = activity.IsCompleted();
        this.Active              = activity.Active;
        this.Level               = parentMenuItem === null ? 0 : parentMenuItem.Level + 1;
        this.Children            = [];
        this.Visible             = true;
        this.Enabled             = true;
        this.CurrentDisplayState = null;
        this.CurrentDisplayState = IntegrationImplementation.PopulateMenuItemDivTag(
                                                                this.ActivityId,
                                                                this.Title,
                                                                this.Level,
                                                                activity.IsDeliverable(),
                                                                Control.Package.LearningStandard,
                                                                Control.Package.Properties.StatusDisplay,
                                                                this.ActivityId);
    };

    MenuItem.prototype.Render             = MenuItem_Render;
    MenuItem.prototype.UpdateStateDisplay = MenuItem_UpdateStateDisplay;

    MenuItem.prototype.Hide               = MenuItem_Hide;
    MenuItem.prototype.Show               = MenuItem_Show;
    MenuItem.prototype.Enable             = MenuItem_Enable;
    MenuItem.prototype.Disable            = MenuItem_Disable;
    MenuItem.prototype.ResynchChildren    = MenuItem_ResynchChildren;


    function MenuItem_Render(activity) {

        // Figure out the previous node
        var nodeToInsertAfter;

        //if this is the root node, insert it at the appropriate spot on the page
        if (this.ParentMenuItem === null) {
            return;
        }
        //otherwise, we need to find the last (grand)child of the previous sibling and insert after it
        else {
            //find the location of this activity within the parent
            for (var i = 0, n = this.ParentMenuItem.Children.length; i < n; i++) {
                if (this.ParentMenuItem.Children[i].ActivityId == this.ActivityId) {
                    break;
                }
            }
        }

        if (activity.DisplayInChoice() === true) {
            this.Show();
        } else {
            this.Hide();
        }
    }


    function MenuItem_UpdateStateDisplay(activity, currentActivity, navigationRequestInfo, useLookAheadActivityStatus) {
        var newVisible = true;
        var newEnabled = true;

        if (activity.DisplayInChoice() === true) {
            newVisible = true;
        } else {
            newVisible = false;
        }

        // If the nav request won't succeed, hide it if this package is configured to do so
        if (!navigationRequestInfo.WillSucceed) {

            if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_DISABLE) {
                newEnabled = false;
            } else if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_HIDE) {
                newVisible = false;
            } else if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_SHOW_ENABLE) {
                newVisible = true;
            }
        } else {
            if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_DISABLE) {
                //this.Enable(this.Activity.GetItemIdentifier(), this.Activity.GetTitle());
                newEnabled = true;
            } else if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_HIDE) {
                newVisible = true;
            } else if (Control.Package.Properties.InvalidMenuItemAction == INVALID_MENU_ITEM_ACTION_SHOW_ENABLE) {
                newVisible = true;
            }
        }

        if (newVisible != this.Visible) {
            if (newVisible === true) {
                this.Show();
            } else {
                this.Hide();
            }
        }

        if (activity.IsTheRoot() === true && Control.Package.Properties.ForceDisableRootChoice === true) {
            newEnabled = false;
        }

        if (newEnabled != this.Enabled) {
            if (newEnabled === true) {
                this.Enable(activity.GetItemIdentifier(), activity.GetTitle());
            } else {
                this.Disable();
            }
        }

        this.Satisfied = getSatisfiedStatus(activity);
        this.Completed = activity.IsCompleted();
        this.Progress  = activity.ActivityProgressStatus;
        this.Active    = activity.Active;

        this.CurrentDisplayState = IntegrationImplementation.UpdateMenuStateDisplay(
            activity,
            this.ActivityId,
            activity.IsDeliverable(),
            currentActivity,
            navigationRequestInfo,
            Control.Package.LearningStandard,
            Control.Package.Properties.StatusDisplay,
            this.CurrentDisplayState,
            useLookAheadActivityStatus);
    }


    function MenuItem_Hide() {
        this.Visible = false;
    }

    function MenuItem_Show() {
        this.Visible = true;
    }

    function MenuItem_Enable(activityIdentifier, activityTitle) {
        this.Enabled = true;
    }

    function MenuItem_Disable() {
        this.Enabled = false;
    }

    function MenuItem_ResynchChildren(activity) {
        var availableChildren = activity.GetAvailableChildren();

        //reset the children to the new children
        this.Children = [];

        for (var childActivity in availableChildren) {
            if (!availableChildren.hasOwnProperty(childActivity)) {
                continue;
            }

            if (!availableChildren[childActivity].MenuItem)
                Control.CreateMenuItem(activity.MenuItem, availableChildren[childActivity]);
            this.Children[childActivity] = availableChildren[childActivity].MenuItem;
        }
    }

    function getSatisfiedStatus(activity) {
        var objectives = activity.ActivityObjectives,
            i = 0, n = objectives.length;

        for (; i < n; i++) {
            if (objectives[i].Identifier === 'NoFeedback' ||
                (objectives[i].Identifier === 'SubmitAll' && !objectives[i].GetSatisfiedStatus())) {
                return 'unknown';
            }
        }

        return activity.IsSatisfied();
    }

})();
