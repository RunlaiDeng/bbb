import { useState } from "react";

const Info = () => {
  const pixels = Array(100).fill(null);

  const handleClick = (index) => {
    console.log(`You clicked pixel ${index}`);
  };

  return (
    <div className="grid grid-cols-10 w-72 h-72 sm:w-[1000px] sm:h-[1000px] overflow-auto m-auto ring my-4">
      {pixels.map((_, index) => (
        <div
          key={index}
          className="w-full h-full bg-base-200 hover:bg-base-300"
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
};

export default Info;
