
var handleSendEventResponse = (response) => {
    //console.log("handleMessageSendResponse:");
    //console.log(response);
}

var handleSendEventError = (e) => {
    console.log("handleMessageSendError:");
    console.log(e);
}

var sendEvent = (event, data, handleSuccess, handleFailure) => {
    chrome.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
        for (const tab of tabs) {
            chrome.tabs
              .sendMessage(tab.id, { event : event, data : data })
              .then(handleSuccess, handleFailure);
          }
    });
}

var sendRefreshEvent = () => {
    sendEvent("refresh",null,handleSendEventResponse,handleSendEventError);
}

var updateDaysInProgressCheckbox = (newValue) => {
    if(newValue === "true") {
        document.getElementById("days_in_progress").checked = true;
    } else {
        document.getElementById("days_in_progress").checked = false;
    }
}

var readPrefsFromStorage = () => {
    chrome.storage.local.get(["add_days_in_progress"]).then((result) => {
        var add_days_in_progress = result.add_days_in_progress;
        if(!add_days_in_progress || add_days_in_progress == "null") {
            add_days_in_progress = "true";
        }
        updateDaysInProgressCheckbox(add_days_in_progress);
      });
}

var writePrefsToStorage = (prefs) => {
    chrome.storage.local.set({ add_days_in_progress: prefs.add_days_in_progress.toString() }).then(() => {
        sendRefreshEvent();
    });
}

var collectPreferences = () => {
    var add_days_in_progress_cb = document.getElementById("days_in_progress").checked.toString();
    return { add_days_in_progress : add_days_in_progress_cb};
}

var handleDaysInProgressPrefChange = () => {
    writePrefsToStorage(collectPreferences());
}

var handleRefreshClicked = () => {
    sendRefreshEvent();
}

document.addEventListener("click", (e) => { 
    if (e.target.id === "refresh") {
        handleRefreshClicked();
    } else if (e.target.id === "days_in_progress") {
        handleDaysInProgressPrefChange();
    }
});

readPrefsFromStorage();