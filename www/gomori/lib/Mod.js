const AdmZip = require("../../adm-zip-0.5.1/adm-zip");

const { FILE_TYPE_MAP } = require("../constants/filetypes");
const { read, isDir, readDir } = require("../utils/fs");
const ModFile = require("./ModFile");
const AssetModFile = require("./AssetModFile");

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
				if (file.endsWith("/")) this.buildDir(file, fileType);
				else this.buildFile(file, fileType);
			}
		}
	}

	buildDir(path, type) {
		if (this.isZip) return this.buildZipDir(path, type);

		const files = readDir(`mods/${this.id}/${path}`);
		for (const file of files) {
			if (isDir(`mods/${this.id}/${path}${file}`)) continue;
			this.buildFile(`${path}${file}`, type);
		}
	}

	buildZipDir(path, type) {
		path = `${this.id}/${path}`;
		const entries = this.zip.getEntries()
			.filter(({ entryName }) => {
				// Filter for children of dir and exclude deeper dirs to avoid recursive lookup
				return entryName.startsWith(path) && !entryName.replace(path, "").includes("/") && entryName !== path;
			});
		for (const { entryName } of entries) {
			this.buildFile(entryName.replace(`${this.id}/`, ""), type);
		}
	}

	buildFile(path, type) {
		const modFile = type.asset ? new AssetModFile(this, path, type) : new ModFile(this, path, type);
		modFile.build();
		this.files.set(modFile.patchPath, modFile);
		if (this.enabled &&
			((type.conflicts === true && this.modLoader.fileConflictCheck(modFile.patchPath))
			||(type.delta === true && this.modLoader.fileConflictCheckDelta(modFile.patchPath))))
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
