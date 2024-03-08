import { fetchRedis } from "@/components/helper/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/addFriend";
import { Session } from "inspector";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    //   checking the given email in right form
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // fetching the id of the user using user's email
    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response("The user doesn't exist, check the email! 🙅", {
        status: 400,
      });
    }

    const session = await getServerSession(authOptions);

    // if user is not login
    if (!session) {
      return new Response("Unauthorized ⚠️", { status: 401 });
    }

    // if requesting themselves
    if (session.user.id === idToAdd) {
      return new Response("You can't add yourself 🙏", { status: 400 });
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("You already sent the request 👀", { status: 400 });
    }

    //  check if user is already your friend
    const isAlreadyFriend = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriend) {
      return new Response("The user is already your friend 🫂", {
        status: 400,
      });
    }

    await pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    // sending friend request
    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid payload request", { status: 422 });
    }
    console.log(error);
    return new Response("Invalid Request", { status: 400 });
  }
}
