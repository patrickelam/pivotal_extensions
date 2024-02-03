const PATTERN = "www.pivotaltracker.com";
const SAVE_AND_COLLAPSE = "Save and collapse";


var readPrefsFromStorageAndUpdate = (forceRefresh) => {
    chrome.storage.local.get(["add_days_in_progress"]).then((result) => {
        var add_days_in_progress = result.add_days_in_progress;
        if(!add_days_in_progress || add_days_in_progress == "null") {
            add_days_in_progress = "true";
        }
        var preferences = {add_days_in_progress : add_days_in_progress};
        updatePage(preferences, forceRefresh);
      });
}

var updatePage = (preferences, forceRefresh) => {
    if(preferences.add_days_in_progress === "true") {
        addDaysInProgress(forceRefresh);
    } else {
        removeDaysInProgress();
    }
}

var handleRefreshEvent = () => {
    readPrefsFromStorageAndUpdate(true);
}

var handleSetTokenEvent = (data) => {
    setHeaders(data.token);
}

var handlePageLoadedEvent = () => {
    readPrefsFromStorageAndUpdate(false);
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
readPrefsFromStorageAndUpdate(false);


document.addEventListener("click", (e) => { 
    if (e.target.title === SAVE_AND_COLLAPSE) {
        console.log("refresh page items");
        readPrefsFromStorageAndUpdate(false);
    }
});
/*
<button class="autosaves collapser top top_collapser story_collapser_c3873" tabindex="0" aria-label="Save and collapse" title="Save and collapse"></button>
*/