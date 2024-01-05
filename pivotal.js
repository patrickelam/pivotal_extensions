const BASE_URL = "https://www.pivotaltracker.com/services/v5";


var headers;
var requestInit;

var setHeaders = (cookie) => {
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

var extractProjectId = () => {
    var urlElements = window.location.href.split("/");
    return urlElements[urlElements.length - 1];
}

var fetchStartedStories = async () => {
    const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories?filter=state:started`);
    var response = await fetch(myRequest, requestInit);
    var data = await response.json();
    return data;
}

var fetchStoryHistory = async (id) => {
    const myRequest = new Request(`${BASE_URL}/projects/${extractProjectId()}/stories/${id}/activity`);
    var response = await fetch(myRequest, requestInit);
    var data = await response.json();
    return data;
}