import { useContext } from "react";
import { MainContext } from "context/MainContext";
import styles from "./styles.module.scss";

const Header = () => {
  const { nick } = useContext(MainContext);
  return <div className={styles.header}>{nick}</div>;
};

export default Header;
