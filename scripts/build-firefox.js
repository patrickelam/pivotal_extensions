var tools = require('./tools.js');


tools.cleanOutputDir();
tools.cleanBuildDir();
tools.createBuildDir();
tools.createOutputDir();
tools.moveJSFiles();
tools.moveCSSFiles();
tools.moveIcons();
tools.moveOptionsMenu();
tools.moveFirefoxSpecificFiles();
tools.zipFirefoxExtension();