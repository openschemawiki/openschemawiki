import { APIError, defineApiRoute } from "astro-typesafe-api/server";
import { prisma, sqids } from "src/shared";
import { z } from "zod";

export const PUT = defineApiRoute({
	input: z.object({
		content: z.string(),
		schema: z.string(),
		reply: z.string().nullable().optional()
	}),
	async fetch(input, { request }) {
		const { content, schema, reply } = input;

		const schemaId = sqids.decode(schema)[0];

		if (reply) {
			const replyObject = await prisma.comment.findUnique({
				where: {
					id: reply
				}
			})

			if (!replyObject) {
				throw new APIError({
					code: "NOT_FOUND",
					message: "Cannot reply to a non-existing message."
				})
			}
		}


		const schemaObject = await prisma.schema.findUnique({
			where: {
				id: schemaId
			}
		})

		if (!schemaObject) {
			throw new APIError({
				code: "NOT_FOUND",
				message: "Schema not found"
			})
		}

		const comment = await prisma.comment.create({
			data: {
				content,
				schemaId: schemaObject.id,
				authorId: 1,
				replyTo: reply ?? null
			}
		})

		return {
			uid: comment.id
		}
	}
})