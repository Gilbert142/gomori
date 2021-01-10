const { encrypt } = require("../utils/encryption");
const { read, write, exists, remove } = require("../utils/fs");

class ModFile {
	constructor(mod, path, type) {
		this.mod = mod;
		this.path = path;
		this.type = type;
		this.isPatched = this.type.patch && exists(this.basilPath);

		this.encryptedBuffer = null;
		this.decryptedBuffer = null;
	}

	read() {
		if (this.mod.zip) return this._readZip();
		return read(`mods/${this.mod.id}/${this.path}`);
	}

	_readZip() {
		return this.mod.zip.getEntry(`${this.mod.id}/${this.path}`).getData();
	}

	build() {
		this.decryptedBuffer = this.read();
		if (this.type.encrypted) this.encryptedBuffer = encrypt(this.decryptedBuffer, this.unpatchedEncryptedBuffer);
	}

	patch() {
		if (this.type.patch && exists(this.patchPath)) write(this.basilPath, this.unpatchedEncryptedBuffer);
		if (this.type.patch) write(this.patchPath, this.encryptedBuffer);
		if (this.type.require) {
			try {
				const func = this.require();
				if (typeof func === "function") func();
			} catch (err) {
				throw new Error(`Failed to execute file "${this.path}" for mod "${this.mod.id}": ${err.stack}`);
			}
		}
		this.isPatched = true;
	}

	require() {
		const path = require("path");
		const base = path.dirname(process.mainModule.filename);

		const tempFile = `exec.${this.mod.id}.${this.path.replace(/\//g, ".")}.js`;
		write(tempFile, this.decryptedBuffer);
		const exportData = require(`${base}/${tempFile}`);
		remove(tempFile);
		return exportData;
	}

	unpatch() {
		if (!this.isPatched) return;
		write(this.patchPath, this.unpatchedEncryptedBuffer);
		this.isPatched = false;
	}

	get fileName() {
		return this.path.split("/")[this.path.split("/").length - 1];
	}

	get patchPath() {
		let patchPath = this.path;

		if (this.type.dir) patchPath = `${this.type.dir}/${this.fileName}`;
		if (this.type.encrypted && this.type.decrypted) patchPath = patchPath.replace(`.${this.type.decrypted}`, `.${this.type.encrypted}`);

		if (patchPath.startsWith("/")) patchPath = patchPath.substring(1);
		return patchPath;
	}

	get basilPath() {
		return `${this.patchPath}.BASIL`;
	}

	get unpatchedEncryptedBuffer() {
		const path = this.isPatched ? this.basilPath : this.patchPath;
		if (!exists(path)) return null;
		return read(path);
	}
}

module.exports = ModFile;
