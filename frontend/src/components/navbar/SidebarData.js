import React from "react";
// import * as FaIcons from 'react-icons/fa';
import * as AiIcons from "react-icons/ai";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";

export const SidebarData = [
  {
    title: "Ride Requests",
    path: "/ride-request",
    icon: <MdIcons.MdPeopleOutline color="white" />,
  },
  {
    title: "Drive Requests",
    path: "/drive-request",
    icon: <AiIcons.AiOutlineCar color="white" />,
  },
  {
    title: "Trip History",
    path: "/trip-history",
    icon: <BsIcons.BsCardChecklist color="white" />,
  },
];

if (localStorage.getItem("isadmin") === 1) {
  SidebarData.push({
    title: "Admin Page",
    path: "/admin",
    icon: <MdIcons.MdAdminPanelSettings color="white" />,
  });
}

// export default SidebarData;
