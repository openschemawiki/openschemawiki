import type { Schema } from "@prisma/client";
import { sqids } from "src/shared";
import { existsSync, readFileSync } from "fs";
import * as tar from "tar"
import { Tree } from "#lib/Tree"
import { basename } from "path"
import {mimeType as mime} from 'mime-type/with-db'

export async function getFilesFromTarball(schema: Schema): Promise<Tree | null> {
	mime.define("application/typescript", {
		extensions: ["ts", "tsx"],
		source: "iana",
	}, mime.dupOverwrite)

	mime.delete("video/mp2t")

	return new Promise((resolve, reject) => {
		const uid = sqids.encode([schema.id]);
		const filePath = `./persistent/${uid}.tar.gz`;

		if (!existsSync(filePath)) {
			return resolve(null);
		}

		const buffer = readFileSync(filePath);

		const dirTree = new Tree("/", {
			data: "",
			type: "Directory",
			mimetype: "",
			bytesize: 0
		})
		new tar.Parser({
			onReadEntry: (entry) => {
				entry.on("data", (data) => {
					dirTree.insert("/", basename(entry.path), {
						data: data.toString(),
						type: entry.type,
						mimetype: mime.lookup(entry.path) || "",
						bytesize: entry.size
					});
				})

				return entry.resume()
			},
			ondone: () => {
				resolve(dirTree)
			}
		}).end(buffer)
	})
}