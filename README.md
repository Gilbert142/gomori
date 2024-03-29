# ⚠️ GOMORI is no longer supported or maintained. ⚠️
## Many mods will not function as intended with GOMORI.
## Consider using alternative mod loaders, such as [OneLoader](https://github.com/rphsoftware/OneLoader), instead.

----

# Gilbert's Mod Loader
This is a simple mod loader for OMORI. Installation instructions + modding documentation down below.

## Installation
### Installing the mod loader
1. Download **GOMORI.zip** from the [releases page](https://github.com/GilbertGobbels/gomori/releases).
2. Right-click OMORI in your steam library, select properties.
3. Go to Local Files, then hit BROWSE...
4. Extract **GOMORI.zip** in this folder. **Some ZIP extractors create a new folder when extracting; make sure the `www` folder in the zip file is extracted directly into the game folder! (When asked for a destination folder, select the game folder.)**
5. When asked to overwrite files, select YES.
6. Start OMORI. You should now see a *mods* section in your game options.

### Installing mods
1. Right-click OMORI in your steam library, select properties.
2. Go to Local Files, then hit BROWSE...
3. Open the **www** folder, then the **mods** folder.
4. Place the mod zip file in this folder.
5. Start OMORI. You should now see the mod listed in your mods options.

## Making mods
1. Once you've edited decrypted game files, add them to your mod folder.
2. In order for the modloader to load your mod files, you need to register them in your mod metadata file. Create a mod metadata file called **mod.json**. For a reference file, check out [mods/gomori/mod.json](https://github.com/GilbertGobbels/gomori/blob/master/www/mods/gomori/mod.json).
3. Register files by adding their paths, relative to the mod folder as root, to the correct files array. You may also register entire folders by suffixing a path with "/".
    * **plugins** are patched to **/www/js/plugins**. They should have a **js** extension. Plugin files that do not replace an existing plugin are loaded as new plugins at runtime.
    * **text** files are patched to **/www/languages/en**. They should have a **yml** extension.
    * **data** files are patched to **/www/data**. They should have a **json** extension.
    * **maps** files are patched to **/www/maps**. They should have a **json** extension.
    * **assets** files are patched to **/www/<path in mod folder>**. Files with a **png** or **ogg** extension are converted to **rpgmvp** and **rpgmvo** respectively. For example, **/img/characters/DW_OMORI.png** in the mod is patched to **/www/img/characters/DW_OMORI.rpgmvp** in the game directory.
    * **exec** files are patched and instantly executed while your mod is being built. They should have a **js** extension and have a function as module export.
4. Choose a unique ID for your mod and enter it in **mod.json**. Your mod's ID should be identical to the mod folder's name.
5. **Add** the mod folder to a zip file named with your mod ID. The zip file should contain only one folder in its root; your mod folder.

### Protected Files
The following files are protected and cannot be patched by the modloader. Consider using plugin files instead.
* js/libs/pixi.js
* js/libs/pixi-tilemap.js
* js/libs/pixi-picture.js
* js/libs/lz-string.js
* js/libs/iphone-inline-video.browser.js
* js/rpg_core.js
* js/rpg_managers.js
* js/rpg_objects.js
* js/rpg_scenes.js
* js/rpg_sprites.js
* js/rpg_windows.js
* js/plugins.js
* gomori/gomori.js
* js/main.js

## Contributors
Thanks to FalsePattern#7777 for his help with loading zip files!
