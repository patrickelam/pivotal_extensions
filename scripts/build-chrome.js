var tools = require('./tools.js');


tools.cleanOutputDir();
tools.cleanBuildDir();
tools.moveJSFiles();
tools.moveIcons();
tools.moveOptionsMenu();
tools.moveChromeSpecificFiles();
tools.zipChromeExtension();
tools.cleanBuildDir();