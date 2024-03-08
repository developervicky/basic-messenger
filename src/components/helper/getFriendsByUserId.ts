import { fetchRedis } from "./redis";

export const getFriendsByUderId = async (userId: string) => {
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriends = JSON.parse(friend) as User;
      return parsedFriends;
    })
  );

  return friends;
};
