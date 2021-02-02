const decryptSymbol = 'decryptFiles';

// An initialize hook to programmatically create the decryptFiles handler
const _GOMORI_Window_OmoMenuOptionsSystem_intialize = Window_OmoMenuOptionsSystem.prototype.initialize;
Window_OmoMenuOptionsSystem.prototype.initialize = function() {
    _GOMORI_Window_OmoMenuOptionsSystem_intialize.apply(this, arguments);

    //this.setHandler(decryptSymbol, require('GOMORI SDK Decryptor.js'))
    this.setHandler(decryptSymbol, () => {
        decryptAllFiles();

        SoundManager.playSave();
        this.activate();
    })
}

// Make Command List patch to add the decryption button.
Window_OmoMenuOptionsSystem.prototype.makeCommandList = function() {
    const isOptionsScene = SceneManager._scene.constructor === Scene_OmoMenuOptions
    const isSceneTitle = SceneManager._scene instanceof Scene_OmoriTitleScreen;
    this.addCommand(LanguageManager.getPluginText('optionsMenu', 'system').restoreConfig.text, 'restoreConfig', isSceneTitle);
    this.addCommand(LanguageManager.getPluginText('optionsMenu', 'system').load.text, 'load', isOptionsScene);
    this.addCommand('DUMP GAME FILES', decryptSymbol);
    this.addCommand(LanguageManager.getPluginText('optionsMenu', 'system').toTitleScreen.text, 'toTitleScreen', isOptionsScene);  
    this.addCommand(LanguageManager.getPluginText('optionsMenu', 'system').exit.text, 'exit');  
};

// Get Command Help Text hook for SDK addition's help texts.
const _GOMORI_Window_OmoMenuOptionsSystem_getCommandHelpText = Window_OmoMenuOptionsSystem.prototype.getCommandHelpText;
Window_OmoMenuOptionsSystem.prototype.getCommandHelpText = function(symbol = this.currentSymbol()) {
    switch (symbol) {
        case decryptSymbol:
            return 'Decrypts game files. Hopefully you know what you\'re doing!';
        default:
            _GOMORI_Window_OmoMenuOptionsSystem_getCommandHelpText.call(this, symbol);
    }
}

// =============================================================================
// DECRYPTION THINGS!! I HAVE NO IDEA HOW TO DO THIS SO I BLATANLY STOLE CODE
// FROM FALSEPATTERN SO GIVE HIM ALL YOUR LOVE AND REP
// =============================================================================
function decryptAllFiles() {
    const crypto = require('./gomori/utils/encryption');
    const path = require("path");
    const fs = require("fs");

    const BASE_DIR = path.dirname(process.mainModule.filename)
    const OUT_DIR = path.join(BASE_DIR, '../www_decrypt');

    const RPG_KEY = parseHexString(JSON.parse(crypto.decryptSteam(fs.readFileSync(path.join(BASE_DIR, 'data/System.KEL')))).encryptionKey);

    // decode base 16 string
    function parseHexString(str) { 
        var result = [];
        while (str.length >= 2) { 
            result.push(parseInt(str.substring(0, 2), 16));

            str = str.substring(2, str.length);
        }

        return result;
    }

    // function for decrypting RPGMV files
    function decryptRPGMV(data, key) {
        const l = key.length;
        data = data.slice(16);
        for (let i = 0; i < 16; i++) {
            data[i] = data[i] ^ key[i % l];
        }
        return data;
    }

    // check if a path is a directory
    function isDir(path) {
        return fs.lstatSync(path).isDirectory();
    }

    // convert encrypted extensions to their decrypted counterparts
    function mapExtension(ext) {
        switch (ext) {
            case '.KEL':
            case '.AUBREY':
            case '.PLUTO':
                return '.json';
            case '.HERO':
                return '.yml';
            case '.OMORI':
                return '.js';
            case '.rpgmvp':
                return '.png';
            case '.rpgmvm':
                return '.m4a';
            case '.rpgmvo':
                return '.ogg';
            default:
                return ext;
        }
    }

    // decrypt a file with a certain function
    function decryptWith(filePath, decryptor) {
        const extension = path.extname(filePath);
        const outFilePath = filePath.slice(0, filePath.length - extension.length) + mapExtension(extension);

        fs.writeFileSync(path.join(OUT_DIR, outFilePath), decryptor(fs.readFileSync(path.join(BASE_DIR, filePath)))); 
    }

    // fully decrypt a file, choosing best decryption function based on the extension
    function decryptFile(filePath) {
        if (isDir(path.join(BASE_DIR, filePath))) {
            // mirror directory in OUT_DIR
            fs.mkdirSync(path.join(OUT_DIR, filePath));

            // walk through dir
            fs.readdirSync(path.join(BASE_DIR, filePath)).forEach(file => {
                decryptFile(path.join(filePath, file));
            });
        } else {
            switch (path.extname(filePath)) {
                case '.KEL':
                case '.OMORI':
                case '.AUBREY':
                case '.HERO':
                case '.PLUTO':
                    decryptWith(filePath, crypto.decryptSteam);
                    break;
                case '.rpgmvp':
                case '.rpgmvo':
                case '.rpgmvm':
                    decryptWith(filePath, (file) => decryptRPGMV(file, RPG_KEY));
                    break;
                default:
                    decryptWith(filePath, (file) => file);
            }
        }
    }

    // now that all of that function mess is sorted out
    // actually begin decrypting files
    if (fs.existsSync(OUT_DIR)) {
        alert('It seems that www_decrypt/ already exists in your OMORI installation.\n'
            + 'To avoid overwriting any precious work you may or may not have done in that folder, we\'ve halted decryption.\n'
            + 'Delete the folder and try again if you\'re sure about this.');
    } else {
        fs.mkdirSync(OUT_DIR);

        [
            'audio/',
            'data/',
            'img/',
            'js/',
            'languages/',
            'maps/',
            // these files do not need to be decrypted, but for the sake of everyone
            // trying to mod the game, they get copied anyways
            'fonts/',
            'movies/',
            'icon/',
            // these files also do not need to be decrypted
            'editor.json',
            'index.html',
            'package.json',
            // I'm not even sure if this is useful for modding, but just in case...
            'steam_appid.txt',
        ].forEach(file => decryptFile(file));
    }
}
