import React from "react";

const DashboardKPI = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  bgColor
}) => {

  const colorConfig = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      icon: "text-amber-600 dark:text-amber-400",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-500/10",
      icon: "text-red-600 dark:text-red-400",
    },
    purple: {
      bg: "bg-violet-50 dark:bg-violet-500/10",
      icon: "text-violet-600 dark:text-violet-400",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-500/10",
      icon: "text-orange-600 dark:text-orange-400",
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      icon: "text-cyan-600 dark:text-cyan-400",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      icon: "text-indigo-600 dark:text-indigo-400",
    },
  };


  return (
    <div
      className={`
      h-[70px]
      rounded-xl
      border border-gray-200 
      dark:border-gray-800
      ${bgColor}
      px-3
      flex
      items-center
      justify-between
      shadow-sm
      hover:shadow-md
      transition-all
      duration-300
      `}
    >

      {/* Title + Value */}
      <div className="flex flex-col">

        <span
          className="
          text-[11px]
          font-medium
          text-gray-500
          dark:text-gray-400
          "
        >
          {title}
        </span>


        <span
          className="
          text-lg
          font-bold
          text-gray-900
          dark:text-white
          "
        >
          {value}
        </span>

      </div>


      {/* Icon */}
      <div
        className={`
        w-9 h-9
        rounded-lg
        flex
        items-center
        justify-center
        ${colorConfig[color].bg}
        `}
      >

        <Icon
          size={18}
          className={colorConfig[color].icon}
        />

      </div>

    </div>
  );
};


export default DashboardKPI;