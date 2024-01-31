const PATTERN = "https://www.pivotaltracker.com/*";


var handleSendEventResponse = (response) => {}

var handleSendEventError = (e) => {
    console.log("handleSendMessageError:");
    console.log(e);
}

var sendEvent = (event, data, responseHandler, errorHandler) => {
    chrome.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
        for (const tab of tabs) {
            chrome.tabs
              .sendMessage(tab.id, { event : event, data : data })
              .then(responseHandler, errorHandler);
          }
    });
}

var scrapeHeaders = (interceptedRequest) => {
    interceptedRequest.requestHeaders.forEach((header) => {
        if(header.name === "Cookie") {
            sendEvent("set_token", {token : header.value}, handleSendEventResponse, handleSendEventError);
        }
    });
}

var handlePageFinishedLoading = (event) => {
    sendEvent("page_finished_loading", {}, handleSendEventResponse, handleSendEventError);
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    scrapeHeaders,
    { urls: [PATTERN] },
    ["requestHeaders"],
);

chrome.webNavigation.onCompleted.addListener(
    handlePageFinishedLoading, 
    {url: [
        {urlMatches : PATTERN}
    ]}
);
