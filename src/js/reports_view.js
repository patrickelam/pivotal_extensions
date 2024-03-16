const CYCLE_TIME_CHART = "cycle_time_chart"
const CYCLE_TIME_ITERATIONS = "cycle_time_iterations"

console.log("cycle_time_main");

var readPrefsFromStorageAndUpdate = (forceRefresh) => {
    
    chrome.storage.local.get([CYCLE_TIME_CHART,CYCLE_TIME_ITERATIONS]).then((result) => {
        var cycle_time_chart = result[CYCLE_TIME_CHART];
        if(!cycle_time_chart) cycle_time_chart = "true";

        var cycle_time_iterations = parseInt(result[CYCLE_TIME_ITERATIONS]);
        if(!cycle_time_iterations) cycle_time_iterations = 2;

        var preferences = {
            [CYCLE_TIME_CHART] : cycle_time_chart, 
            [CYCLE_TIME_ITERATIONS] : cycle_time_iterations
        };
        updatePage(preferences, forceRefresh);
      });
      
}

var updatePage = (preferences, forceRefresh) => {
    console.log("preferences")
    console.log(preferences)
    if(preferences[CYCLE_TIME_CHART] === "true") {
        addCycleTimeChart(preferences[CYCLE_TIME_ITERATIONS]);
    } else {
        removeChart();
    }
}

var handleRefreshEvent = () => {
    readPrefsFromStorageAndUpdate(false);
}

var handleForceRefreshEvent = () => {
    console.log("force refresh")
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

var isOnCycleTimeByPoint = () => {
    var urlElements = window.location.href.split("/");
    var isCycleTime = urlElements.findIndex((e) => e === "cycle_time") >= -1;
    var isurlparam = getUrlParameter("display") === "estimate";
    //console.log(`isCycleTime: ${isCycleTime}, isurlparam: ${isurlparam}`);
    return isCycleTime && isurlparam;
}

chrome.runtime.onMessage.addListener(handleMessage);

waitForElement(`.cycle-time-chart`).then((elm) => {
    if(isOnCycleTimeByPoint() && !chartExists()) {
        readPrefsFromStorageAndUpdate(false);
    }
});
  
observeUrlChange(() => {
    if(isOnCycleTimeByPoint() && !chartExists()) {
        readPrefsFromStorageAndUpdate(false);
    }
});