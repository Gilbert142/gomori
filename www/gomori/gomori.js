let $modLoader = null;

(() => {
	try {
		const ModLoader = require("./gomori/lib/ModLoader");

		const modLoader = new ModLoader(window.$plugins);
		$modLoader = modLoader;

		modLoader.loadMods();
		modLoader.buildMods();
		modLoader.patchMods();
	} catch (err) {
		alert(`GOMORI encountered a critical error: ${err.stack}`);
	}
})()
