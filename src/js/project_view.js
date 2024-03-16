const SAVE_AND_COLLAPSE = "Save and collapse";
const SAVE_AMP_COLLAPSE = "Save &amp; collapse";
const SAVE_AMP2_COLLAPSE = "Save & collapse";

const ADD_DAYS_IN_PROGRESS = "add_days_in_progress"
const ITERATION_PROGRESS = "iteration_progress"


var readPrefsFromStorageAndUpdate = (forceRefresh) => {
    chrome.storage.local.get([ADD_DAYS_IN_PROGRESS,ITERATION_PROGRESS]).then((result) => {
        var add_days_in_progress = result.ADD_DAYS_IN_PROGRESS;
        if(!add_days_in_progress) add_days_in_progress = "true";

        var iteration_progress = result.ITERATION_PROGRESS;
        if(!iteration_progress) iteration_progress = "true";

        var preferences = {
            [ITERATION_PROGRESS] : add_days_in_progress, 
            [ADD_DAYS_IN_PROGRESS] : iteration_progress
        };
        updatePage(preferences, forceRefresh);
      });
}

var updatePage = (preferences, forceRefresh) => {
    if(preferences.add_days_in_progress === "true") {
        addDaysInProgress(forceRefresh);
    } else {
        removeDaysInProgress();
    }

    if(preferences.iteration_progress === "true") {
        addIterationProgress(forceRefresh);
    } else {
        removeIterationProgress();
    }
}

var handleRefreshEvent = () => {
    readPrefsFromStorageAndUpdate(false);
}

var handleForceRefreshEvent = () => {
    readPrefsFromStorageAndUpdate(true);
}

var handleSetTokenEvent = (data) => {
    setHeaders(data.token);
}

var handleMessage = (request, sender, sendResponse) => {
    switch(request.event) {
        case "refresh":
            handleRefreshEvent();
            break;
        case "set_token":
            handleSetTokenEvent(request.data);
            break;
        case "force_refresh":
            handleForceRefreshEvent();
            break;
    }
}


chrome.runtime.onMessage.addListener(handleMessage);
readPrefsFromStorageAndUpdate(false);


document.addEventListener("click", (e) => { 
    if (e.target.title === SAVE_AND_COLLAPSE || e.target.title === SAVE_AMP_COLLAPSE || e.target.title === SAVE_AMP2_COLLAPSE) {
        readPrefsFromStorageAndUpdate(false);
    }
});

waitForElement(`#panel_backlog_${extractProjectId()}`).then((elm) => {
    readPrefsFromStorageAndUpdate(false);
});