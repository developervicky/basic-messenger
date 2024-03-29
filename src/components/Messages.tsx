"use client";

import { cn, toPusherKey } from "@/lib/utils";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Message } from "@/lib/validations/message";
import { pusherClient } from "@/lib/pusher";

interface MessageProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}
const Messages: FC<MessageProps> = ({
  initialMessages,
  sessionId,
  chatId,
  sessionImg,
  chatPartner,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind(toPusherKey("incoming-message"), messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind(toPusherKey("incoming-message"), messageHandler);
    };
  }, [chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimeStamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentuser = message.senderId === sessionId;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div key={`${message.id}-${message.timestamp}`}>
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentuser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentuser,
                    "order-2 items-start": !isCurrentuser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentuser,
                    "bg-gray-200 text-gray-900": !isCurrentuser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentuser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentuser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimeStamp(message.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative h-6 w-6", {
                  "order-2": isCurrentuser,
                  "order-1": !isCurrentuser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentuser ? (sessionImg as string) : chatPartner.image
                  }
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
