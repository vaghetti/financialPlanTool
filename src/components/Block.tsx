import React from "react";

interface props {
  className?: string;
}

export default function Block(props: React.PropsWithChildren<props>) {
  return (
    <div
      className={
        " p-6 bg-white rounded-xl shadow-lg m-3  float-left " +
        (props.className ?? "")
      }
    >
      {props.children}
    </div>
  );
}
