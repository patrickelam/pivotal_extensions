var tools = require('./tools.js');


tools.cleanOutputDir();
tools.cleanBuildDir();
tools.createBuildDir();
tools.createOutputDir();
tools.moveJSFiles();
tools.moveIcons();
tools.moveOptionsMenu();
tools.moveChromeSpecificFiles();
tools.zipChromeExtension();