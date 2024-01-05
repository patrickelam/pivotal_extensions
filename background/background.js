const PATTERN = "https://www.pivotaltracker.com/*";
const PATTERN2 = "www.pivotaltracker.com"

var session_cookie = "";
var should_update_content_scripts = true;
var preferences; // { add_days_in_progress : "true" }


var readPrefsFromStorage = () => {
    var add_days_in_progress = localStorage.getItem("add_days_in_progress");
    if(!add_days_in_progress || add_days_in_progress == "null") {
        add_days_in_progress = "true";
    }
    console.log(`Reading from local storage: ${add_days_in_progress}`);
    return {add_days_in_progress : add_days_in_progress};
}

var writeLocalStorage = (prefs) => {
    localStorage.setItem("add_days_in_progress", prefs.add_days_in_progress.toString());
}

var handleSendMessageResponse = (response) => {}

var handleSendMessageError = (e) => {
    console.log("handleSendMessageError:");
    console.log(e);
}

var sendMessage = (command, data, responseHandler, errorHandler) => {
    browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
        for (const tab of tabs) {
            browser.tabs
              .sendMessage(tab.id, { command : command, data : data })
              .then(responseHandler);
          }
    });
}

// Sends to content scripts
var sendUpdateCommand = () => {
    if(session_cookie !== "") {
        sendMessage("refresh", {prefs : preferences, cookie : session_cookie}, handleSendMessageResponse, handleSendMessageError)
        should_update_content_scripts = false;
    }
}

var handleRefreshCommand = (sendResponse) => {
    sendUpdateCommand();
    sendResponse({});
}

var handleGetCommand = (sendResponse) => {
    sendResponse(readPrefsFromStorage());
}

var handleSetCommand = (prefs, sendResponse) => {
    writeLocalStorage(prefs);
    preferences = prefs;
    sendResponse({});
    sendUpdateCommand();
}

var scrapeCookies = (interceptedRequest) => {
    if(session_cookie === "") {
        interceptedRequest.requestHeaders.forEach((header) => {
            if(header.name === "Cookie") {
                session_cookie = header.value;
            }
        });
    };
}

// Incoming from options popup
var handleMessageFromOptions = (request, sender, sendResponse) => {
    if(request.command === "refresh") {
        handleRefreshCommand(sendResponse);
    } else if (request.command === "get_prefs") {
        handleGetCommand(sendResponse);
    } else if (request.command === "set") {
        handleSetCommand(request.data, sendResponse);
    }
};

var handlePageFinishedLoading = (event) => {
    console.log("handlePageFinishedLoading");
    console.log(event);
    sendUpdateCommand();
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    scrapeCookies,
    { urls: [PATTERN] },
    //["blocking", "requestHeaders"],
    ["requestHeaders"],
);

chrome.webNavigation.onCompleted.addListener(handlePageFinishedLoading, {url: [{hostEquals : PATTERN2}]});

preferences = readPrefsFromStorage();
chrome.runtime.onMessage.addListener(handleMessageFromOptions);
