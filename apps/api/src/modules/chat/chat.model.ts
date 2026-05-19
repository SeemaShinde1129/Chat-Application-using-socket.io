namespace chatModel {
  export const eventTypes = {
    error: "error",
    join: "join",
    message: "message",
    typing: "typing",
    users: "users",
  } as const;

  export type EventType = (typeof eventTypes)[keyof typeof eventTypes];

  export type Message = {
    from: string;
    to: string;
    message: string;
    timestamp: number;
  };

  export type JoinPayload = {
    username: string;
  };

  export type UsersPayload = {
    users: string[];
    count: number;
  };

  export type TypingPayload = {
    from: string;
    to: string;
    isTyping: boolean;
    timestamp: number;
  };

  export type ErrorPayload = {
    message: string;
  };

  export type EventMap = {
    error: ErrorPayload;
    join: JoinPayload;
    message: Message;
    typing: TypingPayload;
    users: UsersPayload;
  };

  export type Event<TType extends EventType = EventType> = {
    type: TType;
    payload: EventMap[TType];
  };
}

export = chatModel;
