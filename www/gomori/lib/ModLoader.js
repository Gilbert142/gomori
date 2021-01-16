const Mod = require("./Mod");
const { defaultConfig } = require("../constants/defaults");
const { exists, read, write, readDir } = require("../utils/fs");

class ModLoader {
	constructor(plugins) {
		this.plugins = plugins;
		this.conflictFiles = new Set();
		this.mods = new Map();
		this._config = null;
	}

	loadMods() {
		const mods = readDir("mods");
		for (const modDir of mods) {
			const isZip = modDir.endsWith(".zip");
			const id = modDir.replace(".zip", "");

			if (this.mods.has(id)) {
				alert(`Cannot load mod "${modDir}" for having a conflicting ID.`);
				continue;
			}

			const mod = new Mod(this, id, isZip);
			this.mods.set(id, mod);
			mod.load();
		}
	}

	buildMods() {
		for (const mod of this.mods.values()) {
			try {
				mod.build();
			} catch (err) {
				alert(`Failed to build mod "${mod.id}": ${err.stack}`);
			}
		}
	}

	patchMods() {
		for (const mod of this.mods.values()) {
			try {
				mod.unpatch();
				if (this.config[mod.id] !== false) mod.patch();
			} catch (err) {
				alert(`Failed to patch mod "${mod.id}": ${err.stack}`);
			}
		}
	}

	fileConflictCheck(filePath) {
		if (this.conflictFiles.has(filePath)) return true;
		this.conflictFiles.add(filePath);
		return false;
	}

	get config() {
		if (this._config) return this._config;

		if (!exists("save/mods.json")) write("save/mods.json", JSON.stringify(defaultConfig));
		this._config = JSON.parse(read("save/mods.json").toString());
		return this._config;
	}
}

module.exports = ModLoader;
