const BASE_URL = "https://www.pivotaltracker.com/services/v5";

var headers;
var requestInit;
var startedStories;
var storyHistories = {};
var currentIteration;

var headersAreSet = () => {
    var set = !(headers === undefined);
    return set;
}

var setHeaders = (cookie) => {
    if(headers === undefined) {
        headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Accept-Encoding", "gzip, deflate, br");
        headers.append("Accept-Language", "en-US,en;q=0.5");
        headers.append("Cache-Control", "no-cache");
        headers.append("Cookie", cookie);
        requestInit = {
            method: "GET",
            headers: headers,
            mode: "cors",
            cache: "default",
        };
    }
}

var extractProjectId = () => {
    var urlElements = window.location.href.split("/");
    var projectsSegment = urlElements.findIndex((e) => e === "projects");
    var id = urlElements[projectsSegment+1];
    return id;
}

var fetchStartedStories = async (forceRefresh) => {
    if(startedStories === undefined || forceRefresh) {
        const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories?filter=state:started`);
        var response = await fetch(myRequest, requestInit);
        startedStories = await response.json();
    }
    return startedStories;
}

var fetchCurrentIteration = async (forceRefresh) => {
    if(currentIteration === undefined || forceRefresh) {
        const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/iterations?scope=current`);
        var response = await fetch(myRequest, requestInit);
        currentIteration = await response.json();
    }
    return currentIteration;
}

var fetchStoryHistory = async (id, forceRefresh) => {
    //console.log(`fetching history for ${id}, forced ${forceRefresh}`);
    if(storyHistories[id] === undefined || forceRefresh) {
        const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories/${id}/activity`);
        var response = await fetch(myRequest, requestInit);
        storyHistories[id] = await response.json();
    }
    return storyHistories[id];
}

var fetchPrecedingIterations = async (iterations_to_fetch) => {
    const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/iterations?scope=done&offset=-${iterations_to_fetch}`);
    var response = await fetch(myRequest, requestInit);
    var iterations = await response.json();
    return iterations;
}

/*
var fetchAllStories = async (forceRefresh) => {
    // TODO caching
    const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories`);
    var response = await fetch(myRequest, requestInit);
    var allStories = await response.json();
    return allStories;
}
*/