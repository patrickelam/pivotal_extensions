var tools = require('./tools.js');


tools.cleanOutputDir();
tools.cleanBuildDir();
tools.moveJSFiles();
tools.moveIcons();
tools.moveOptionsMenu();
tools.moveFirefoxSpecificFiles();
tools.zipFirefoxExtension();
tools.cleanBuildDir();