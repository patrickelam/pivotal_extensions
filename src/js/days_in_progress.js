const DAY_CHARACTER = "🌞"; // https://apps.timwhitlock.info/unicode/inspect/hex/1F31E


var dayString = (days) => {
    var text = "";
    for(var i = 0; i < days; i++) {
        text += " " + DAY_CHARACTER;
    }
    return text + " ";
};

// https://github.com/bertrandmoulard/story_time/blob/master/story_time.js
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
  var old_elements = document.querySelectorAll('[type="pivotal_extensions_days_in_progress"]');
  if(old_elements != undefined) {
        old_elements.forEach((old_el) => {
          old_el.remove();
      });
  }
}

var updateStoryHtml = (id, days) => {
    var element = document.querySelector(".story_" + id + " .story_name");
    if(element != null) {
      var span = document.createElement("span");
      span.innerText = dayString(days);
      span.setAttribute("type","pivotal_extensions_days_in_progress");
      element.appendChild(span);
    } else {
      console.log("updateStoryHTML - element is null");
    }   
}

var updateStory = (story) => {
    for(var i = 0; i < story.history.length; i++) {
        if(story.history[i].highlight == "started") {
            var days = Math.ceil((Date.now() - Date.parse(story.history[i].occurred_at)) / 86400000);
            updateStoryHtml(story.id, removeWeekends(days));
            return;
        }  
    }    
}

var fetchStoryHistoriesAndUpdateHTML = async (started_stories, forceRefresh) => {
    for (var i=0; i < started_stories.length;i++) {
        var history = await fetchStoryHistory(started_stories[i].id, forceRefresh);
        started_stories[i].history = history;
    }
    removeDaysInProgress();
    for (var i=0; i < started_stories.length;i++) {
      updateStory(started_stories[i]);
  }
}

var addDaysInProgress = async (forceRefresh) => {
    if(headersAreSet()) {
        var started_stories = await fetchStartedStories(forceRefresh);
        await fetchStoryHistoriesAndUpdateHTML(started_stories, forceRefresh);
    }
}