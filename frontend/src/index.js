import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import MainProvider from "context/MainContext";
import Header from "components/Header";
import Body from "components/Body";
import Messages from "components/Messages";
import Notifications, { notify } from "react-notify-toast";
import Nickname from "components/Nickname";
import "index.css";

const App = () => {
  const [isSupported, setSupported] = useState(true);

  useEffect(() => {
    window.addEventListener("load", () => {
      if (!window["WebSocket"]) {
        notify.show("Your browser does not support web socket");
        setSupported(false);
        return;
      }
    });
  }, []);

  return (
    <React.StrictMode>
      <div className={"App"}>
        <div className="sub">
        <MainProvider>
          <Nickname />
          <Header />
          <Body />
          <Messages isSupported={isSupported} />
          <Notifications options={{ zIndex: 3000, animationDuration: 100 }} />
        </MainProvider>
        </div>
      </div>
    </React.StrictMode>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
