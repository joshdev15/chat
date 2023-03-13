import { useContext } from "react";
import { MainContext } from "context/MainContext";
import styles from "./styles.module.scss";

const Nickname = () => {
  const { nick, setNick } = useContext(MainContext);

  const onSubmit = (e) => {
    e.preventDefault();
    const currentValue = e.target.querySelector("#nick").value;

    if (typeof currentValue === "string" && currentValue !== "") {
      setNick(currentValue);
    } else {
      e.target.reset();
    }
  };

  return (
    nick === undefined && (
      <div className={styles.nickname}>
        <div className={styles.container}>
          <h2>Bienvenido a Chat</h2>
          <h5>Por favor ingrese su Nickname</h5>
          <form id="nickname-form" onSubmit={(e) => onSubmit(e)}>
            <input
              type="text"
              id="nick"
              name="nick"
              autoComplete="off"
              autoFocus={true}
            />
            <input type={"submit"} id="submit" name="submit" />
          </form>
        </div>
      </div>
    )
  );
};

export default Nickname;
