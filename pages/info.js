import { useState } from "react";

const Info = () => {
  const pixels = Array(10000).fill(null);

  const handleClick = (index) => {
    console.log(`You clicked pixel ${index}`);
  };

  return (
    <div className="grid grid-cols-100 w-[1000px] h-[1000px] overflow-auto m-auto">
      {pixels.map((_, index) => (
        <div
          key={index}
          className="w-full h-full ring-[0.1px] ring-slate-500 bg-white hover:bg-gray-200"
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
};

export default Info;
