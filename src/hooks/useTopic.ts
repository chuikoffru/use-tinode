import { useCallback, useEffect, useState } from "react";
import { TMessage, TSubscriber, Tinode, Topic } from "tinode-sdk";

export const useTopic = (tinode: Tinode | null, topicName: string) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [subscribers, setSubscribers] = useState<TSubscriber[]>([]);
  const [_, setMaxSeqId] = useState(0);
  const [__, setMinSeqId] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showGoToLastButton, setShowGoToLastButton] = useState(false);

  const resetSubscribers = useCallback(() => {
    if (!topic) return;

    const subs: TSubscriber[] = [];

    topic.subscribers((s: TSubscriber) => {
      //console.log("s :>> ", s);
      subs.push(s);
    });

    setSubscribers(subs);
  }, [topic, setSubscribers]);

  const resetMessages = useCallback(() => {
    if (!topic) return;

    const msgs: TMessage[] = [];

    topic.messages((msg: TMessage) => {
      //console.log("msg :>> ", msg);
      msgs.push(msg);
    });

    setMessages(msgs);
  }, [topic]);

  const goToLatestMessage = useCallback(() => {
    setScrollPosition(0);
  }, []);

  const postReadNotification = useCallback(
    (seq: number) => {
      topic?.noteRead(seq);
    },
    [topic],
  );

  const handleAllMessagesReceived = useCallback(
    (count: number) => {
      if (count > 0) {
        // 0 means "latest".
        postReadNotification(0);
      }

      resetMessages();
    },
    [postReadNotification],
  );

  const handleMessageUpdate = useCallback(
    (msg: TMessage) => {
      if (!topic) return;
      setMaxSeqId(topic.maxMsgSeq());
      setMinSeqId(topic.minMsgSeq());

      if (topic.isNewMessage(msg.seq)) {
        if (scrollPosition > 400) {
          setShowGoToLastButton(true);
        } else {
          goToLatestMessage();
        }
      }

      // Aknowledge messages except own messages. They are
      // automatically assumed to be read and recived.
      const status = topic.msgStatus(msg, true);

      if (status >= Tinode.MESSAGE_STATUS_SENT && msg.from != tinode?.getCurrentUserID()) {
        postReadNotification(msg.seq);
      }
    },
    [topic, scrollPosition, postReadNotification],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!topic) return;

      if (!topic.isSubscribed()) {
        await topic.subscribe();
      }

      try {
        /* const newMessage = topic.createMessage(text, true);
        newMessage.from = tinode.getCurrentUserID();
        newMessage.ts = new Date(); */
        const response = await topic.publish(text);

        /* newMessage.seq = response.params.seq;
        newMessage.ts = new Date(response.ts);
        console.log("newMessage :>> ", newMessage);
        setMessages((prev) => [...prev, newMessage]); */
        console.log("response :>> ", response);
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    [topic],
  );

  useEffect(() => {
    if (!tinode || !topicName) return;

    const theTopic = tinode.getTopic(topicName);

    setTopic(theTopic);
  }, [tinode, topicName]);

  useEffect(() => {
    if (!topic) return;

    topic.onSubsUpdated = resetSubscribers;
    topic.onAllMessagesReceived = handleAllMessagesReceived;
    topic.onData = handleMessageUpdate;

    topic
      .subscribe(topic.startMetaQuery().withDesc().withSub().withLaterData().build())
      .then((data: any) => {
        console.log("Подписка на топик выполнена успешно", data.topic);
      })
      .catch((err: any) => {
        console.log("Ошибка при подписке на топик", err);
      });

    return () => {
      topic.leave().then((data: any) => {
        console.log(data.topic, " unsubscribed");
      });
    };
  }, [topic, resetMessages, resetSubscribers]);

  const clearMessages = useCallback(() => setMessages([]), [setMessages]);

  return {
    topic,
    messages,
    sendMessage,
    subscribers,
    clearMessages,
    showGoToLastButton,
  };
};
