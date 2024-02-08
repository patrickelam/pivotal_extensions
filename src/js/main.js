const PATTERN = "www.pivotaltracker.com";
const SAVE_AND_COLLAPSE = "Save and collapse";


var readPrefsFromStorageAndUpdate = (forceRefresh) => {
    chrome.storage.local.get(["add_days_in_progress","iteration_progress"]).then((result) => {
        var add_days_in_progress = result.add_days_in_progress;
        if(!add_days_in_progress) add_days_in_progress = "true";

        var iteration_progress = result.iteration_progress;
        if(!iteration_progress) iteration_progress = "true";

        var preferences = {
            add_days_in_progress : add_days_in_progress, 
            iteration_progress : iteration_progress
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

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
var waitForElm = (selector) => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}

chrome.runtime.onMessage.addListener(handleMessage);
readPrefsFromStorageAndUpdate(false);


document.addEventListener("click", (e) => { 
    if (e.target.title === SAVE_AND_COLLAPSE) {
        readPrefsFromStorageAndUpdate(false);
    }
});

waitForElm(`#panel_backlog_${extractProjectId()}`).then((elm) => {
    readPrefsFromStorageAndUpdate(false);
});