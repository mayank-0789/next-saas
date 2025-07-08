import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})$/;
const SPOTIFY_REGEX = /^(https?:\/\/)?(open\.)?spotify\.com\/track\/([a-zA-Z0-9]{22})(\?.*)?$/;

const createStreamSchema = z.object({
    createrId: z.string(),
    type: z.enum(["Spotify", "YouTube"]),
    url: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = createStreamSchema.safeParse(await req.json());
        if (!body.success) {
            return NextResponse.json({ error: body.error.message }, { status: 400 });
        }
        const {createrId,type,url,title,description} = body.data;

        //check if the url is valid
        const isYTUrl = YT_REGEX.test(url);
        const isSpotifyUrl = SPOTIFY_REGEX.test(url);
        if(!isYTUrl && !isSpotifyUrl){
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Validate URL matches the specified type
        if ((type === "YouTube" && !isYTUrl) || (type === "Spotify" && !isSpotifyUrl)) {
            return NextResponse.json({ error: `URL does not match the specified type: ${type}` }, { status: 400 });
        }

        //check if the url is already in the database
        const existingStream = await prismaClient.stream.findUnique({
            where: {
                url: body.data.url
            }
        })

        if(existingStream){
            return NextResponse.json({ error: "Stream already exists" }, { status: 400 });
        }

        //now extract the id from the url
        const extractedId = isYTUrl 
            ? body.data.url.match(YT_REGEX)?.[1] 
            : body.data.url.match(SPOTIFY_REGEX)?.[1];

        if (!extractedId) {
            return NextResponse.json({ error: "Could not extract valid ID from URL" }, { status: 400 });
        }

        const stream = await prismaClient.stream.create({ 
            data: {
                userId: createrId, //jo jo cheezien user se li hai isiye body.data ke andar likha hai
                type: type,
                url: url,
                title: title,
                description: description,
                extractedId: extractedId
            }
        })

        return NextResponse.json({ stream }, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest){
    try {
        const createrId = req.nextUrl.searchParams.get("createrId");
        
        if (!createrId) {
            return NextResponse.json({ error: "createrId query parameter is required" }, { status: 400 });
        }

        const streams = await prismaClient.stream.findMany({
            where: {
                userId: createrId
            }
        });

        return NextResponse.json({ streams }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
