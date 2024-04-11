const BASE_URL = "https://www.pivotaltracker.com/services/v5";
const BATCH_SIZE = 20; // undocumented, but api returns errors over this amount.

var startedStories;
var storyHistories = {};
var currentIteration;
var cookie;

var cookieIsSet = () => {
    var set = !(cookie === undefined);
    return set;
}

var setCookie = (newCookie) => {
    cookie = newCookie;
}

var buildRequestData = (method) => {
    var requestData = {};
    if(cookie !== undefined) {
        var headers = new Headers();
        headers.append("Accept", "application/json, text/javascript, */*; q=0.01");
        headers.append("Accept-Encoding", "gzip, deflate, br");
        headers.append("Accept-Language", "en-US,en;q=0.5");
        headers.append("Cache-Control", "no-cache");
        headers.append("Cookie", cookie);
        requestData = {
            method: method,
            headers: headers,
            mode: "cors",
            cache: "default",
        };
    }
    
    return requestData;
}

var sendPOST = async (path, body) => {
    var requestData = buildRequestData("POST");
    requestData.body = body;
    requestData.headers.append("Content-Type", "application/json");
    const myRequest = new Request(`${BASE_URL}${path}`);
    var response = await fetch(myRequest, requestData);
    var responseJson = await response.json();
    return responseJson;
}

var sendGET = async (path) => {
    var requestData = buildRequestData("GET");
    const myRequest = new Request(`${BASE_URL}${path}`);
    var response = await fetch(myRequest, requestData);
    var responseJson = await response.json();
    return responseJson;
}

var extractProjectIdFromURL = () => {
    return extractProjectId(window.location.href);
}

var extractProjectId = (url) => {
    var urlElements = url.split("/");
    var projectsSegment = urlElements.findIndex((e) => e === "projects");
    var id = urlElements[projectsSegment+1];
    return id;
}

var extractStoryId = (url) => {
    var urlElements = url.split("/");
    var storySegment = urlElements.findIndex((e) => e === "stories");
    var id = urlElements[storySegment+1];
    return id;
}

var fetchStartedStories = async (forceRefresh) => {
    if(startedStories === undefined || forceRefresh) {
       startedStories = await sendGET(`/projects/${extractProjectIdFromURL()}/stories?filter=state:started`)
    }
    return startedStories;
}

var fetchCurrentIteration = async (forceRefresh) => {
    if(currentIteration === undefined || forceRefresh) {
       currentIteration = await sendGET(`/projects/${extractProjectIdFromURL()}/iterations?scope=current`);
    }
    return currentIteration;
}

var fetchStoryHistories = async (storyIds, forceRefresh) => {
    var storyIdsToFetch = [];
    var projectId = extractProjectIdFromURL();

    // Ignore already-cached stories
    for(id in storyIds) {
        if(storyHistories[storyIds[id]] === undefined || forceRefresh) {
            storyIdsToFetch.push(storyIds[id]);
        }
    }
    var requestBody = [];
    var batchCounter = 0;

    do {
        if(batchCounter < BATCH_SIZE && storyIdsToFetch.length > 0) {
            var storyId = storyIdsToFetch.pop();
            requestBody.push(`/services/v5/projects/${projectId}/stories/${storyId}/activity?limit=200`);
            batchCounter++;            
        }
        if(batchCounter == BATCH_SIZE || storyIdsToFetch.length == 0){
            if(requestBody.length > 0) {
                var body = JSON.stringify(requestBody);
                var response = await sendPOST(`/aggregator`, body)

                // Cache Results
                for(url in response) {
                    var storyId = extractStoryId(url);
                    storyHistories[storyId] = response[url];
                }
                requestBody = [];
                batchCounter = 0;
            }
        }
    } while(storyIdsToFetch.length > 0)
}

var fetchStoryHistory = async (id, forceRefresh) => {
    if(storyHistories[id] === undefined || forceRefresh) {
        storyHistories[id] = await sendGET(`/projects/${extractProjectIdFromURL()}/stories/${id}/activity?limit=200`);
    }
    return storyHistories[id];
}

var fetchPrecedingIterations = async (iterations_to_fetch, forceRefresh) => {
    var precedingIterations = await sendGET(`/projects/${extractProjectIdFromURL()}/iterations?scope=done&offset=-${iterations_to_fetch}`);
    return precedingIterations;
}