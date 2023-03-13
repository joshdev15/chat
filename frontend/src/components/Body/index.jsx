import { useContext } from "react";
import { MainContext } from "context/MainContext";
import styles from "./styles.module.scss";

const Body = () => {
  const { nick, messages } = useContext(MainContext);

  return (
    <div id="body-msg" className={styles.body}>
      {messages.map(
        (msg) =>
          !["", " ", undefined, null].includes(msg?.content) && (
            <div
              className={`${styles.msgCont} ${
                nick === msg?.nickname ? styles.me : styles.you
              }`}
              key={Math.random()}
            >
              <div
                className={`${styles.msg} 
${nick === msg?.nickname ? styles.msgMe : styles.msgYou}
            `}
              >
                <p>
                  {msg?.nickname}
                  <span>
                    {` - ${new Date().toLocaleString("en-GB", {
                      timeZone: "UTC",
                    })}`}
                  </span>
                </p>
                <p>{msg?.content}</p>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default Body;
