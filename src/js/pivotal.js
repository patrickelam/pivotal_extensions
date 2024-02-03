const BASE_URL = "https://www.pivotaltracker.com/services/v5";

var headers;
var requestInit;
var startedStories;
var storyHistories = {};

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
    return urlElements[urlElements.length - 1];
}

var fetchStartedStories = async (forceRefresh) => {
    console.log(`fetchStartedStories`);
    //console.log(forceRefresh);
    //console.log(startedStories);
    if(startedStories === undefined || forceRefresh) {
        console.log("API Call: Fetching started stories");
        const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories?filter=state:started`);
        var response = await fetch(myRequest, requestInit);
        startedStories = await response.json();
    }
    return startedStories;
}

var fetchStoryHistory = async (id, forceRefresh) => {
    console.log(`fetchStoryHistory ${id} ${forceRefresh}`);
    //console.log(storyHistories.id);
    if(storyHistories.id === undefined || forceRefresh) {
        console.log(`API Call: Fetching history for id: ${id}`);
        const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories/${id}/activity`);
        var response = await fetch(myRequest, requestInit);
        storyHistories.id = await response.json();
        //console.log(storyHistories.id);
    }
    return storyHistories.id;
}