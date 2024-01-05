
var handleMessageSendResponse = (response) => {
    console.log("handleMessageSendResponse:");
    console.log(response);
}

var handleMessageSendError = (e) => {
    console.log("handleMessageSendError:");
    console.log(e);
}

var messageSend = (command, data, handleSuccess, handleFailure) => {
    const sending = chrome.runtime.sendMessage({
        command: command,
        data: data
    });
    sending.then(handleSuccess, handleFailure);
}

var setDaysInProgressCheckbox = (newValue) => {
    if(newValue === "true") {
        document.getElementById("days_in_progress").checked = true;
    } else {
        document.getElementById("days_in_progress").checked = false;
    }
}

var setPreferences = (data) => {
    console.log("setPreferences:");
    console.log(data);
    setDaysInProgressCheckbox(data.add_days_in_progress);
}

var fetchPreferences = () => {
    messageSend("get_prefs", null, setPreferences,handleMessageSendError);
}

var savePreferences = (prefs) => {
    messageSend("set",prefs,handleMessageSendResponse,handleMessageSendError);
}

var collectPreferences = () => {
    return { add_days_in_progress : document.getElementById("days_in_progress").checked.toString()};
}

var handleDaysInProgressPrefChange = () => {
    savePreferences(collectPreferences());
}

var handleRefreshClicked = () => {
    messageSend("refresh",null);
}

document.addEventListener("click", (e) => { 
    if (e.target.id === "refresh") {
        handleRefreshClicked();
    } else if (e.target.id === "days_in_progress") {
        handleDaysInProgressPrefChange();
    }
});

fetchPreferences();
