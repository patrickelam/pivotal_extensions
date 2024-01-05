const DAY_CHARACTER = "🌞"; // https://apps.timwhitlock.info/unicode/inspect/hex/1F31E

var session_cookie = "";

var dayString = (days) => {
    var text = "";
    for(var i = 0; i < days; i++) {
        text += " " + DAY_CHARACTER;
    }
    return text + " ";
};

var removeWeekends = (days) => {
    var weekDay = (new Date()).getDay();
    if(weekDay == 6) {
        days = days - 1;
        weekDay = weekDay - 1;
    }
    if(weekDay >= days) {
        return days;
    }
    else {
        var daysToLastSunday = days - weekDay;
        var floor = Math.floor(daysToLastSunday / 7);
        var res = daysToLastSunday - (floor * 2);
        var mod = daysToLastSunday % 7;
        if(mod > 1) {
            res = res - 2;
        }
        else if (mod > 0) {
            res = res - 1;
        }
        return res + weekDay;
    }
}

var removeDaysInProgress = () => {
  var old_suns = document.querySelectorAll('[type="pe_suns"]');
  if(old_suns != undefined) {
      old_suns.forEach((old_el) => {
          old_el.remove();
      });
  }
}

var updateStoryHtml = (id, days) => {
    var element = document.querySelector(".story_" + id + " .story_name");

    if(element != null) {
      var span = document.createElement("span");
      span.innerText = dayString(days);
      span.setAttribute("type","pe_suns");
      element.appendChild(span);
    } else {
      console.log("updateStoryHTML - element is null");
    }
    
}

var updateStory = (data, id) => {
    for(var i = 0; i < data.length; i++) {
        if(data[i].highlight == "started") {
            var days = Math.ceil((Date.now() - Date.parse(data[i].occurred_at)) / 86400000);
            updateStoryHtml(id, removeWeekends(days));
            return;
        }
    }
}

var fetchStoryHistoriesAndUpdateHTML = async (data) => {
    for (var i=0; i < data.length;i++) {
        var history = await fetchStoryHistory(data[i].id);
        data[i].history = history;
    }
    removeDaysInProgress();
    for (var i=0; i < data.length;i++) {
      updateStory(data[i].history, data[i].id);
  }
}

var addDaysInProgress = async () => {
    console.log("addDaysInProgress");
    var started_stories = await fetchStartedStories();
  
    await fetchStoryHistoriesAndUpdateHTML(started_stories);
}

var handleRefreshCommand = (data) => {
    setHeaders(data.cookie);
    if(data.prefs.add_days_in_progress === "true") {
        addDaysInProgress();
    } else {
      console.log("removeDaysInProgress");
        removeDaysInProgress();
    }
}

var handleMessage = (request, sender, sendResponse) => {
    console.log("days_in_progress handling message:");
    console.log(request);
    if(request.command === "refresh") {
        handleRefreshCommand(request.data);
    }
}

chrome.runtime.onMessage.addListener(handleMessage);