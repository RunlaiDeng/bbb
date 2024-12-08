import React, { createContext, useContext, useState } from "react";
import { getFollowing, setFollowing } from "../Utils";

// 创建一个 Context
const FollowContext = createContext();

export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
}
// 提供 Context 的 Provider 组件
export function FollowProvider({ children }) {
  const [follow, setFollowState] = useState(getFollowing());
  const setFollow = (index, isChecked) => {
    setFollowing(index, isChecked);
    setFollowState(getFollowing());
  };
  return (
    <FollowContext.Provider value={{ follow, setFollow }}>
      {children}
    </FollowContext.Provider>
  );
}
