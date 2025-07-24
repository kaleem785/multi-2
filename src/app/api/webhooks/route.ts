import { User } from "@/generated/prisma";
import { db } from "@/lib/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    if (eventType === "user.created" || eventType === "user.updated") {
      console.log(`User created with ID: ${id}`);
      const data = evt.data;
      const user: Partial<User> = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email_addresses[0]?.email_address || "",
        picture: data.image_url,
      };
      if (!user) return;
      const dbUser = await db.user.upsert({
        where: { email: user.email },
        update: user,
        create: {
          id: user.id!,
          name: user.name!,
          email: user.email!,
          picture: user.picture!,
          role: user.role || "USER",
        },
      });
      // Sync role back to Clerk's privateMetadata
      await clerkClient.users.updateUserMetadata(data.id, {
        privateMetadata: {
          role: dbUser.role || "USER",
        },
      });
    }
    if (eventType === "user.deleted") {
      await db.user.delete({
        where: { id: id },
      });
    }
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
