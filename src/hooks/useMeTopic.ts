import { useCallback, useEffect, useState } from "react";
import { TContact, Tinode, Topic } from "tinode-sdk";

export const useMeTopic = (tinode: Tinode | null) => {
  const [me, setMe] = useState<Topic | null>(null);
  const [contacts, setContacts] = useState<TContact[]>([]);

  const resetContacts = useCallback(() => {
    if (!me) return;

    const contacts: TContact[] = [];

    me.contacts((c: TContact) => {
      contacts.push(c);
    });

    setContacts(contacts);
  }, [me, setContacts]);

  /* const onAddContact = useCallback(
    (topic: Topic) => {
      console.log("topic :>> ", topic);

      setContacts((prev) => [
        ...prev,
        {
          name: topic.name,
          online: topic.online,
          private: topic.private,
          public: topic.public,
          topic: topic.name,
          read: topic.read,
          recv: topic.recv,
          seq: topic.seq,
          unread: topic.unread,
        },
      ]);
      //resetContacts();
    },
    [setContacts]
  ); */

  useEffect(() => {
    if (!tinode) return;

    const me = tinode.getMeTopic();

    setMe(me);
  }, [tinode, setMe]);

  // Подписка на топик me
  useEffect(() => {
    if (!me) return;

    me.onSubsUpdated = resetContacts;

    me.subscribe(me.startMetaQuery().withLaterSub().build())
      .then(() => {
        console.log("Подписка на топик me выполнена успешно");
      })
      .catch((err) => {
        console.log("Ошибка при подписке на топик", err.message);
      });
  }, [me, resetContacts]);

  return { contacts, resetContacts };
};
