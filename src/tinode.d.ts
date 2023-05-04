type Token = {
  token: string;
  expires: Date;
};

type TopicType = "me" | "fnd" | "grp" | "p2p" | "sys";

type GetQuery = object;

type SetParams = object;

type MsgStatus = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80;

type What = "data" | "sub" | "desc" | "tags" | "cred" | "del";

declare module "tinode-sdk" {
  export type TinodeParams = {
    appName: string;
    host: string;
    apiKey: string;
    transport: "lp" | "ws";
    secure: boolean;
    persist: boolean;
  };
  export type TSubscriber = {
    online: boolean;
    public: { fn: string };
    read: number;
    recv: number;
    trusted: boolean;
    user: string;
  };
  export type TMessage = {
    content: string | object;
    topic: string;
    from: string;
    seq: number;
    ts: Date;
    head: null;
    noecho: boolean;
  };

  export type TContact = {
    name: string;
    online: boolean;
    private: {
      comment: string;
    };
    public: {
      fn: string;
      note: string;
    };
    read: number;
    recv: number;
    seq: number;
    topic: string;
    unread: number;
  };

  type MapFunction<T> = (value: T) => void;

  export class Topic {
    name: string;
    online: boolean;
    private: {
      comment: string;
    };
    public: {
      fn: string;
      note: string;
    };
    read: number;
    recv: number;
    seq: number;
    topic: string;
    unread: number;
    messages(callback: MapFunction<TMessage>): ReturnType<any>;
    contacts(callback: MapFunction<TContact>): ReturnType<any>;
    subscribers(callback: MapFunction<TSubscriber>): ReturnType<any>;
    noteKeyPress(): void;
    getMeta(query: GetQuery): Promise<any>;
    createMessage: (content: Drafty | string, noEcho?: boolean) => TMessage;
    publishMessage: (msg: TMessage) => Promise<any>;
    publishDraft: (data: Drafty | string, promise: Promise<any>) => Promise<any>;
    publish: (msg: Drafty | string, noEcho?: boolean) => Promise<any>;
    subscribe(getQuery?: GetQuery, setParams?: SetParams): Promise<any>;
    leave(unsubscribe?: boolean): Promise<any>;
    isSubscribed(): boolean;
    isNewMessage(seq: number): boolean;
    topicType(name: string): TopicType;
    startMetaQuery(): MetaGetBuilder;
    onData: (msg: any) => void;
    onAllMessagesReceived: (count: number) => void;
    onInfo: (msg: any) => void;
    onMetaDesc: (msg: any) => void;
    onMetaSub: (msg: any) => void;
    onPres: (msg: any) => void;
    onSubsUpdated: (topicIds: string[], count: number) => void;
    onContactUpdate: (what: What, cont: any) => void;
    maxMsgSeq: () => number;
    minMsgSeq: () => number;
    msgStatus: (msg: TMessage, upd: boolean) => MsgStatus;
    noteRead: (seq: number) => void;
  }
  export class MetaGetBuilder {
    constructor(parent: Topic);
    withData(since?: number, before?: number, limit?: number): MetaGetBuilder;
    withLaterData(limit?: number): MetaGetBuilder;
    withLaterDesc(limit?: number): MetaGetBuilder;
    withLaterSub(limit?: number): MetaGetBuilder;
    withLaterDel(limit?: number): MetaGetBuilder;
    withDesc(ms?: number): MetaGetBuilder;
    withSub(ms?: number, limit?: number, userOrTopic?: string): MetaGetBuilder;
    withTags(): MetaGetBuilder;
    withCred(): MetaGetBuilder;
    extract(what: What): MetaGetBuilder;
    build(): GetQuery;
  }
  export class Drafty {
    constructor();
    static init(plain: string): Drafty | null;
    txt: string;
    fmt: any[];
    ent: any[];
  }
  export class Tinode {
    constructor(params: TinodeParams, onSetupCompleted?: (value: unknown) => void);
    setHumanLanguage(locale: string): void;
    enableLogging(enabled: boolean): void;
    connect(): Promise<void>;
    disconnect(): void;
    reconnect(): void;
    setAuthToken(token: Token): void;
    getServerInfo(): void;
    onConnect(): void;
    onDisconnect(err: any): void;
    onAutoreconnectIteration(): void;
    onInfoMessage(): void;
    onDataMessage(): void;
    loginBasic(uname: string, password: string, cred: any): Promise<void>;
    loginToken(token: string, cred?: any): Promise<void>;
    getAuthToken(): null | Token;
    getCurrentLogin(): string;
    getMeTopic(): Topic;
    isAuthenticated(): boolean;
    isConnected(): boolean;
    isTopicCached(topic: string): boolean;
    isP2PTopicName(topic: string): boolean;
    getCurrentUserID(): string;
    mapTopics: (topic: any) => any[];
    topicType(topic: string): TopicType;
    getTopic(topic: string): Topic;
    createMessage(topic: string, content: Drafty, noEcho?: boolean): Drafty;
    publishMessage(msg: Drafty, attachmentsopt?: string[]): Promise<any>;
    newGroupTopicName(isChannel: boolean): string;

    static DEL_CHAR: string;
    static MESSAGE_STATUS_NONE: number;
    static MESSAGE_STATUS_QUEUED: number;
    static MESSAGE_STATUS_SENDING: number;
    static MESSAGE_STATUS_FAILED: number;
    static MESSAGE_STATUS_FATAL: number;
    static MESSAGE_STATUS_SENT: number;
    static MESSAGE_STATUS_RECEIVED: number;
    static MESSAGE_STATUS_READ: number;
    static MESSAGE_STATUS_TO_ME: number;
    static EXPIRE_PROMISES_TIMEOUT: number;
    static EXPIRE_PROMISES_PERIOD: number;
    static RECV_TIMEOUT: number;
    static DEFAULT_MESSAGES_PAGE: number;
  }
}
