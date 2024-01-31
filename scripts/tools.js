var fs = require('fs-extra');
var archiver = require('archiver');

const OUTPUT_DIR = 'output';
const BUILD_DIR = 'build';

const cleanOutputDir = () => {
    if (fs.existsSync(OUTPUT_DIR)){
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
}

const createOutputDir = () => {
    fs.mkdirSync(OUTPUT_DIR);
}

const cleanBuildDir = () => {
    if (fs.existsSync(BUILD_DIR)){
        fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    }
}

const createBuildDir = () => {
    fs.mkdirSync(BUILD_DIR);
}

const moveJSFiles = () => {
    fs.copySync('src/js/', `${BUILD_DIR}`);
}

const moveIcons = () => {
    fs.copySync('icons/', `${BUILD_DIR}/icons`);
}

const moveOptionsMenu = () => {
    fs.copySync('src/options/', `${BUILD_DIR}/options`);
}

const moveFirefoxSpecificFiles = () => {
    fs.copySync('src/firefox/', `${BUILD_DIR}`);
}

const moveChromeSpecificFiles = () => {
    fs.copySync('src/chrome/', `${BUILD_DIR}`);
}

const zipFirefoxExtension = () => {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(`${OUTPUT_DIR}/pivotal-extensions-firefox.zip`);
    return new Promise((resolve, reject) => {
        archive
          .directory(`${BUILD_DIR}`, false)
          .on('error', err => reject(err))
          .pipe(stream)
        ;
    
        stream.on('close', () => resolve());
        archive.finalize();
      });
}

const zipChromeExtension = () => {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(`${OUTPUT_DIR}/pivotal-extensions-chrome.zip`);
    return new Promise((resolve, reject) => {
        archive
          .directory(`${BUILD_DIR}`, false)
          .on('error', err => reject(err))
          .pipe(stream)
        ;
    
        stream.on('close', () => resolve());
        archive.finalize();
      });
}

module.exports = {
    OUTPUT_DIR,
    BUILD_DIR,
    cleanOutputDir,
    cleanBuildDir,
    createOutputDir,
    createBuildDir,
    moveJSFiles,
    moveIcons,
    moveOptionsMenu,
    moveFirefoxSpecificFiles,
    moveChromeSpecificFiles,
    zipFirefoxExtension,
    zipChromeExtension
};