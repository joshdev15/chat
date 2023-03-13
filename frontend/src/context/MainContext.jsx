import { createContext, useState } from "react";

export const MainContext = createContext();

const MainProvider = ({ children }) => {
  const [nick, setNick] = useState();
  const [messages, setMessages] = useState([]);

  return (
    <MainContext.Provider value={{ nick, setNick, messages, setMessages }}>
      {children}
    </MainContext.Provider>
  );
};

export default MainProvider;
