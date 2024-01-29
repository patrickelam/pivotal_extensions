const PATTERN = "www.pivotaltracker.com"

var readPrefsFromStorageAndUpdate = () => {
    chrome.storage.local.get(["add_days_in_progress"]).then((result) => {
        var add_days_in_progress = result.add_days_in_progress;
        if(!add_days_in_progress || add_days_in_progress == "null") {
            add_days_in_progress = "true";
        }
        var preferences = {add_days_in_progress : add_days_in_progress};
        updatePage(preferences);
      });
}

var updatePage = (preferences) => {
    if(preferences.add_days_in_progress === "true") {
        addDaysInProgress();
    } else {
        removeDaysInProgress();
    }
}

var handleRefreshEvent = () => {
    readPrefsFromStorageAndUpdate();
}

var handleSetTokenEvent = (data) => {
    setHeaders(data.token);
}

var handlePageLoadedEvent = () => {
    readPrefsFromStorageAndUpdate();
}

var handleMessage = (request, sender, sendResponse) => {
    switch(request.event) {
        case "refresh":
            handleRefreshEvent();
            break;
        case "set_token":
            handleSetTokenEvent(request.data);
            break;
        case "page_finished_loading":
            handlePageLoadedEvent();
            break;
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
readPrefsFromStorageAndUpdate();