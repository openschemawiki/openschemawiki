import { APIError, defineApiRoute } from "astro-typesafe-api/server";
import { z } from "zod";
import semver from "semver";
import { prisma, sqids } from "src/shared";
import crypto from "crypto";
import type { Schema } from "@prisma/client";
import { zfd } from "zod-form-data";
import { writeFileSync, readFileSync } from "fs"
import * as tar from "tar"
import * as path from "path"
import ZSchema from "z-schema"
import { safe } from "#lib/safe";

export const PUT = defineApiRoute({
	input: zfd.formData({
		name: zfd.text().refine((data) => {
			// Make sure the name has no special characters
			const regex = /^[a-zA-Z0-9-_]+$/;
			return regex.test(data);
		}, "Name can only contain letters, numbers, hyphens, and underscores."),
		description: zfd.text(),
		tarball: zfd.file(),
		category: zfd.text(),
		version: zfd.text().refine((data) => {
			const valid = semver.valid(semver.coerce(data));

			if (valid !== null) {
				return valid;
			}
		}, "Invalid semantic version number.")
	}),
	output: z.object({
		uid: z.string()
	}),
	async fetch(input, { request }) {
		// Check all previous versions of the schema
		const existing = await prisma.schema.findMany({
			where: {
				name: input.name
			}
		});

		// Check if the schema already exists
		if (existing.length > 0) {
			const existingVersions = existing.map((schema) => schema.version);

			if (existingVersions.includes(input.version)) {
				throw new APIError({
					code: "CONFLICT",
					message: "Schema with this version already exists."
				});
			}

			// Check if the new version is higher than all existing versions
			const highestVersion = semver.maxSatisfying(existingVersions, "*");

			if (highestVersion && semver.gt(highestVersion, input.version)) {
				throw new APIError({
					code: "CONFLICT",
					message: "New version is lower than the highest already published version."
				});
			}
		}

		const arrayBuffer = await input.tarball.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Only read the schema.json file from the given tarball
		const schemaBuffer = await new Promise<Buffer>((resolve, reject) => {
			new tar.Parser({
				gzip: true,
				portable: true,
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
						reject(new APIError({
							code: "BAD_REQUEST",
							message: "No schema.json file found in the tarball."
						}))
				},
			}).end(buffer)
		})

		const schema = safe(() => JSON.parse(schemaBuffer.toString()) as Object);

		if (!schema) {
			throw new APIError({
				code: "BAD_REQUEST",
				message: "Provided schema is not valid JSON."
			});
		}

		// Validate the schema
		const validator = new ZSchema({
			strictMode: false
		});

		const isSchemaValid = validator.validateSchema(schema);

		if (!isSchemaValid) {
			throw new APIError({
				code: "BAD_REQUEST",
				message: "Provided schema could not be validated against the JSON Schema spec.",
				details: validator.getLastErrors()
			});
		}

		const sha512 = crypto.createHash("sha512").update(schemaBuffer).digest("hex");

		// Make sure the schema has not been published yet under a different name
		const existingSchema = await prisma.schema.findFirst({
			where: {
				sha512
			}
		});

		if (existingSchema) {
			throw new APIError({
				code: "CONFLICT",
				message: `The '${existingSchema.name}' schema already provides the same schema. Make sure your schema is unique or consider using theirs.`
			});
		}

		const result = await prisma.schema.create({
			data: {
				category: input.category,
				name: input.name,
				version: input.version,
				description: input.description,
				sha512
			}
		})

		const uid = sqids.encode([result.id]);

		const filePath = `./persistent/${uid}.tar.gz`;

		writeFileSync(filePath, buffer);

		return {
			uid
		}
	}
})

export const GET = defineApiRoute({
	input: z.object({
		name: z.string(),
		version:  z.string().optional().refine((data) => {
			if (data === undefined) {
				return true;
			}

			const valid = semver.valid(semver.coerce(data));

			if (valid !== null) {
				return valid;
			}
		}, "Invalid semantic version number."),
	}),
	output: z.any(),
	async fetch(input, {request}) {
		let schema: Schema | null = null;

		if (input.version) {
			schema = await prisma.schema.findUnique({
				where: {
					name_version: {
						name: input.name,
						version: input.version
					}
				}
			})
		} else {
			schema = await prisma.schema.findFirst({
				where: {
					name: input.name
				},
				orderBy: {
					version: "desc"
				}
			})
		}

		if (!schema) {
			throw new APIError({
				code: "NOT_FOUND",
				message: "Schema not found."
			})
		}

		const uid = sqids.encode([schema.id]);

		const filePath = `./persistent/${uid}.tar.gz`;

		const buffer = readFileSync(filePath);

		return {
			...schema,
			tarballBase64: buffer.toString("base64")
		};
	}
})