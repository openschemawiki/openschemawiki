import { APIError, defineApiRoute } from "astro-typesafe-api/server";
import { prisma, sqids } from "src/shared";
import { zfd } from "zod-form-data";
import { v4 as uuid } from "uuid";
import { writeFileSync } from "fs"
import { z } from "zod";

export const POST = defineApiRoute({
	input: zfd.formData({
		file: zfd.file(),
		schema: zfd.text()
	}),
	output: z.object({
		uid: z.string().uuid()
	}),
	async fetch(input, { request }) {
		const { file, schema } = input;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// The schema is a sqidid, we will need to decode it
		const schemaId = sqids.decode(schema);

		if (schemaId.length !== 1) {
			throw new APIError({
				code: "BAD_REQUEST",
				message: "The provided schema id is invalid."
			})
		}

		const schemaObject = await prisma.schema.findUnique({
			where: {
				id: schemaId[0]
			}
		})

		if (!schemaObject) {
			throw new APIError({
				code: "BAD_REQUEST",
				message: "The provided schema id is invalid."
			})
		}

		if (schemaObject.file !== null) {
			throw new APIError({
				code: "BAD_REQUEST",
				message: "A file has already been provided for this schema. Please issue a new version and upload the file that way."
			})
		}

		// The file is a gzipped tarball. We just want to store it and give it some unique id
		// Let's generate one
		const uid = uuid();

		await prisma.schema.update({
			where: {
				id: schemaId[0]
			},
			data: {
				file: uid
			}
		})

		// We will store the file in the /persistent directory
		const filePath = `./persistent/${uid}.tar.gz`;

		writeFileSync(filePath, buffer);

		return {
			uid: uid
		}
	}
})