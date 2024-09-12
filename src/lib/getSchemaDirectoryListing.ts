import type { Schema } from "@prisma/client";
import { sqids } from "src/shared";
import { existsSync, readFileSync } from "fs";
import * as tar from "tar"
import type { JsonTree } from "./Tree";

export async function getSchemaDirectoryListing(schema: Schema): Promise<JsonTree | null> {
	const uid = sqids.encode([schema.id]);

	const filePath = `./persistent/${uid}.tar.gz`;

	if (!existsSync(filePath)) {
		return null;
	}

	const buffer = readFileSync(filePath);

	const listing = await new Promise<JsonTree>((resolve, reject) => {
		const dirTree: JsonTree = {
			key: "",
			value: "",
			children: []
		}
		new tar.Parser({
			onReadEntry: (entry) => {
				const path = entry.path
				const parts = path.split("/")
				let current = dirTree
				for (let i = 0; i < parts.length; i++) {
					const part = parts[i]
					const existing = current.children.find((child) => child.key === part)
					if (existing) {
						current = existing
					} else {
						const child: JsonTree = {
							key: part,
							value: "",
							children: []
						}
						current.children.push(child)
						current = child
					}
				}

				return entry.resume()
			},
			ondone: () => {
				resolve(dirTree)
			}
		}).end(buffer)
	})
	
	return listing
}