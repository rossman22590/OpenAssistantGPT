import { Metadata } from "next";

export function constructMetadata({
    title = ` Build your own chatbot with OpenAI Assistant`,
    description = `AI Tutor Agents is a platform for building chatbot using the OpenAI Assistant API. We offer seamless integration for effortlessly incorporating a chatbot into your website.`,
    image = "https://openassistantgpt.io/thumbnail.png",
    icons = [
        {
            rel: "apple-touch-icon",
            sizes: "32x32",
            url: "/logo-32-32.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            url: "/logo-32-32.png",
        },
        {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            url: "/logo-32-32.png",
        },
    ],
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string | null;
    icons?: Metadata["icons"];
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            ...(image && {
                images: [
                    {
                        url: image,
                    },
                ],
            }),
        },
        twitter: {
            title,
            description,
            ...(image && {
                card: "summary_large_image",
                images: [image],
            }),
            creator: "@myaitutor",
        },
        icons,
        metadataBase: new URL('https://myapps.ai'),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}