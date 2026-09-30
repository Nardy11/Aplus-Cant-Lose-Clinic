import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useSelector } from "react-redux";
import AccountAvatar from "../components/Authentication/AccountAvatar";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const user = useSelector((state) => state.user);

  return (
    <div className="chat-page">
      <AccountAvatar />
      <div className="chat-workspace">
        {user && <SideDrawer />}
        <div className="chat-columns">
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && (
            <Chatbox
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
