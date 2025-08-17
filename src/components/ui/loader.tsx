import React from "react";

function Loader({ parentHeight = 200 }: { parentHeight?: number }) {
  return (
    <div
      style={{ height: parentHeight }}
      className="flex justify-center items-center"
    >
      <div className="w-10 h-10 border-primary border-t-gray-300 border-8 rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;
