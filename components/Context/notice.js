import { createContext, useContext, useState } from "react";

// 创建通知上下文
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    setNotifications([...notifications, { type, message }]);

    setTimeout(() => {
      setNotifications((notifications) => notifications.slice(1));
    }, 2000);
  };

  const success = (message) => addNotification("success", message);
  const info = (message) => addNotification("info", message);
  const failure = (message) => addNotification("failure", message);

  return (
    <NotificationContext.Provider value={{ success, info, failure }}>
      <div className="toast toast-top toast-center text-xs z-50 ">
        {notifications.map((notification, index) => {
          const type = notification.type;
          return (
            <div key={index} className={`bg-white border-2 border-green-500 alert alert-${type}`}>
              {type == "success" && (
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="2745"
                  width="20"
                  height="20"
                >
                  <path
                    d="M983.8 312.7C958 251.7 921 197 874 150c-47-47-101.7-84-162.7-109.7C648.2 13.5 581.1 0 512 0S375.8 13.5 312.7 40.3C251.7 66 197 103 150 150c-47 47-84 101.7-109.7 162.7C13.5 375.8 0 442.9 0 512s13.5 136.2 40.3 199.3C66 772.3 103 827 150 874c47 47 101.8 83.9 162.7 109.7 63.1 26.7 130.2 40.3 199.3 40.3s136.2-13.5 199.3-40.3C772.3 958 827 921 874 874c47-47 83.9-101.8 109.7-162.7 26.7-63.1 40.3-130.2 40.3-199.3s-13.5-136.2-40.2-199.3z m-230 90.4L485.1 671.8c-7 7-16.2 10.5-25.5 10.5s-18.4-3.5-25.5-10.5l-164-164c-14.1-14.1-14.1-36.9 0-50.9 14.1-14.1 36.9-14.1 50.9 0l138.6 138.6 243.2-243.2c14.1-14.1 36.9-14.1 50.9 0 14.2 14 14.2 36.7 0.1 50.8z"
                    p-id="2746"
                    fill="#0e932e"
                  ></path>
                </svg>
              )}
              {type == "info" && (
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="7546"
                  width="20"
                  height="20"
                >
                  <path
                    d="M512 97.52381c228.912762 0 414.47619 185.563429 414.47619 414.47619s-185.563429 414.47619-414.47619 414.47619S97.52381 740.912762 97.52381 512 283.087238 97.52381 512 97.52381z m0 73.142857C323.486476 170.666667 170.666667 323.486476 170.666667 512s152.81981 341.333333 341.333333 341.333333 341.333333-152.81981 341.333333-341.333333S700.513524 170.666667 512 170.666667z m36.571429 268.190476v292.571428h-73.142858V438.857143h73.142858z m0-121.904762v73.142857h-73.142858v-73.142857h73.142858z"
                    p-id="7547"
                    fill="#1195db"
                  ></path>
                </svg>
              )}
              {type == "failure" && (
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="5633"
                  width="20"
                  height="20"
                >
                  <path
                    d="M721.856 303.104a48.448 48.448 0 0 0-68.416 0L511.488 445.056l-136.192-136.32a46.976 46.976 0 1 0-66.496 66.496l136.32 136.256-141.952 141.952a48.384 48.384 0 0 0 68.416 68.352l141.888-141.888 137.088 136.96a46.912 46.912 0 1 0 66.432-66.368L579.968 513.472l141.888-141.952a48.448 48.448 0 0 0 0-68.416M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024"
                    fill="#FA5555"
                    p-id="5634"
                  ></path>
                </svg>
              )}

              <span>{notification.message}</span>
            </div>
          );
        })}
      </div>
      {children}
    </NotificationContext.Provider>
  );
};
