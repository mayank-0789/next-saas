import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import prismaClient from "@/lib/db";

const downvoteSchema = z.object({
    streamId: z.string()
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    const user = await prismaClient.user.findUnique({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
                userId: user.id
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