import { useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import { notify } from "react-notify-toast";
import useWebSocket, { ReadyState } from "react-use-websocket";
import styles from "./styles.module.scss";

const MsgInput = ({ nick, isSupported }) => {
  const { setMessages, messages } = useContext(MainContext);
  const { lastMessage, sendJsonMessage, readyState, lastJsonMessage } =
    useWebSocket(`ws://localhost:8080/ws?nickname=${nick}`);

  const onWS = (e) => {
    e.preventDefault();

    if (isSupported) {
      const messageText = e.target.querySelector("#message").value;
      const message = { content: messageText, nickname: nick };
      const copy = [...messages];
      setMessages([...copy, message]);
      sendJsonMessage(message);
      e.target.reset();
    }
  };

  useEffect(() => {
    console.log(readyState);
    const connectionStatus = {
      [ReadyState.OPEN]: () => notify.show("Open"),
      [ReadyState.CONNECTING]: () => notify.show("Connecting"),
      [ReadyState.CLOSING]: () => notify.show("Closing"),
      [ReadyState.CLOSED]: () => notify.show("Closed"),
      [ReadyState.UNINSTANTIATED]: () => notify.show("Uninstantiated"),
    };

    const currentState = connectionStatus[readyState];
    currentState();
  }, [readyState]);

  useEffect(() => {
    console.log("lastJsonMessage", lastJsonMessage);
    const copy = [...messages];
    setMessages([...copy, lastJsonMessage]);
  }, [lastMessage, lastJsonMessage]);

  if (["", undefined, null].includes(nick)) {
    return <></>;
  }

  return (
    <div className={styles.message}>
      <form id="message-form" onSubmit={(e) => onWS(e)}>
        <input
          type="text"
          id="message"
          name="message"
          autoComplete="off"
          autoFocus={true}
        />
        <input type={"submit"} id="submit" name="submit" />
      </form>
    </div>
  );
};

const Messages = ({ isSupported }) => {
  const { nick } = useContext(MainContext);
  console.log("nick", nick);

  return (
    !["", undefined, null].includes(nick) && (
      <MsgInput nick={nick} isSupported={isSupported} />
    )
  );
};

export default Messages;
