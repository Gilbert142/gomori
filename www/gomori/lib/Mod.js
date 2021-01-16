const AdmZip = require("../../adm-zip-0.5.1/adm-zip");

const { FILE_TYPE_MAP } = require("../constants/filetypes");
const { read } = require("../utils/fs");
const ModFile = require("./ModFile");

class Mod {
	constructor(modLoader, id, isZip) {
		this.modLoader = modLoader;
		this.id = id;
		this.isZip = isZip;
		this.zip = null;
		this.meta = null;
		this.files = new Map();
	}

	load() {
		if (this.isZip) return this._loadZip();

		const buf = read(`mods/${this.id}/mod.json`);
		this.meta = JSON.parse(buf.toString());
		return this.meta;
	}

	build() {
		for (const [type, fileType] of Object.entries(FILE_TYPE_MAP)) {
			const files = this.meta.files[type];
			if (!files) continue;
			for (const file of files) {
				this.buildFile(file, fileType);
			}
		}
	}

	buildFile(path, type) {
		const modFile = new ModFile(this, path, type);
		modFile.build();
		this.files.set(modFile.patchPath, modFile);
		if (this.enabled && type.conflicts === true && this.modLoader.fileConflictCheck(modFile.patchPath))
			throw new Error(`Failed to build mod ${this.id} due to conflicted file ${path}.`);
	}

	unpatch() {
		for (const modFile of this.files.values()) {
			modFile.unpatch();
		}
	}

	patch() {
		for (const modFile of this.files.values()) {
			modFile.patch();
		}
	}

	get enabled() {
		return this.modLoader.config[this.id] !== false;
	}

	_loadZip() {
		const path = require("path");
		const base = path.dirname(process.mainModule.filename);
		this.zip = AdmZip(`${base}/mods/${this.id}.zip`);

		this.meta = JSON.parse(this.zip.getEntry(`${this.id}/mod.json`).getData());
		return this.meta;
	}
}

module.exports = Mod;
