import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import prismaClient from "@/lib/db";

const downvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req: NextRequest) {
    const { error, userId } = await requireAuth();
    if (error) return error;

    try {
        const body = downvoteSchema.safeParse(await req.json());

        if (!body.success) {
            return NextResponse.json({ error: body.error.message }, { status: 400 });
        }
        
        const { streamId } = body.data;
        const stream = await prismaClient.stream.findUnique({
            where: {
                id: streamId
            }
        })

        if (!stream) {
            return NextResponse.json({ error: "Stream not found" }, { status: 404 });
        }

        const existingUpvote = await prismaClient.upVote.findFirst({
            where: {
                streamId: streamId,
                userId: userId
            }
        })

        if (!existingUpvote) {
            return NextResponse.json({ error: "You have not upvoted this stream To downvote you first have to upvote" }, { status: 400 });
        }

        await prismaClient.upVote.delete({
            where: {
                id: existingUpvote.id
            }
        })

        return NextResponse.json({ message: "Downvote successful" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}
