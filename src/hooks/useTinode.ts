import { useEffect, useMemo, useState } from "react";
import { Tinode, TinodeParams } from "tinode-sdk";
import { useTopic } from "./useTopic";
import { useMeTopic } from "./useMeTopic";

// TODO: Прокинуть в хук параметры с токеном
export const useTinode = (accessToken: string, params: TinodeParams) => {
  const [tinode, setTinode] = useState<Tinode | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFetching, setIsFetching] = useState("Подключение к серверу");
  const [userId, setUserId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState("");
  const { contacts } = useMeTopic(tinode);

  const { topic, messages, sendMessage, subscribers } = useTopic(
    tinode,
    topicName
  );

  const isLoggedIn = useMemo(() => !!userId, [userId]);

  useEffect(() => {
    // Создаем экземпляр Tinode
    const tn = new Tinode(params);

    tn.onConnect = () => {
      console.log("Подключение к серверу Tinode установлено");
      setIsConnected(true);
      setIsFetching("");
    };

    tn.onDisconnect = (err) => {
      setIsConnected(false);
      setIsFetching("");
      setUserId(null);
      console.log("Соединение с сервером Tinode разорвано");
      console.log(err);
    };

    // Подключаемся к серверу Tinode
    tn.connect().then(() => {
      // Создаем токен для авторизации
      const date = new Date();

      date.setDate(date.getDate() + 1);

      const token = {
        token: btoa(accessToken),
        expires: date,
      };

      if (token) {
        setIsFetching("Авторизация пользователя");
        // Если авторизационный токен уже получен, используем его для авторизации при подключении
        tn.loginToken(token.token).then(() => {
          console.log("Авторизация по токену выполнена успешно");
          setUserId(tn.getCurrentUserID());
          setTinode(tn);
        });
      }
    });

    return () => {
      if (tinode) {
        tn.disconnect();
      }
    };
  }, [accessToken]);

  return {
    tinode,
    isLoggedIn,
    isConnected,
    isFetching,
    userId,
    topic,
    contacts,
    messages,
    subscribers,
    sendMessage,
    changeTopic: setTopicName,
    selectedTopic: topic?.name,
  };
};
