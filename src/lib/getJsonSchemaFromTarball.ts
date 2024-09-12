import type { Schema } from "@prisma/client";
import * as tar from "tar"
import * as path from "path"
import { existsSync, readFileSync } from "fs"
import { sqids } from "src/shared";
import type { SchemaType } from "#components/Schema/types";

export async function getJsonSchemaFromTarball(schema: Schema): Promise<SchemaType | null> {
	const uid = sqids.encode([schema.id]);

	const filePath = `./persistent/${uid}.tar.gz`;

	if (!existsSync(filePath)) {
		return null;
	}

	const buffer = readFileSync(filePath);

	const schemaBuffer = await new Promise<Buffer>((resolve, reject) => {
		new tar.Parser({
			onReadEntry(entry) {
				const name = path.basename(entry.path);

				if (name === "schema.json") {
					entry.on("data", (data) => {
						resolve(data)
					})
				}
				
				return entry.resume();
			},
			filter(p, entry) {
				return path.basename(p) === "schema.json";
			},
			ondone() {
					reject(null)
			},
		}).end(buffer)
	})

	try {
		return JSON.parse(schemaBuffer.toString())
	} catch(e) {
		return null
	}
}