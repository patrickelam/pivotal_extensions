// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
var waitForElement = (selector) => {
    //console.log(`waiting for element ${selector}`);
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}

var getUrlParameter = (sParam) => {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

// https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
var observeUrlChange = (fn) => {
    let oldHref = document.location.href;
    const observer = new MutationObserver(mutations => {
      if (oldHref !== document.location.href) {
        fn();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
};