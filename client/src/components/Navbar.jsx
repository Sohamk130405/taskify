import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import axios from "axios";
import { allOrg, selectedOrg } from "../atoms/orgAtom";
import Dropdown from "./ui/Dropdown";
import userAtom from "../atoms/userAtom";
import {
  NotificationsOutline,
  PersonCircle,
  SettingsOutline,
  RefreshOutline,
} from "react-ionicons";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = useRecoilValue(userAtom);
  const [organizations, setOrganizations] = useRecoilState(allOrg);
  const [selectedOrganization, setSelectedOrganization] = useRecoilState(selectedOrg);
  
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get("/api/organizations/getOrgs");
        const fetchedOrgs = res.data;
        setOrganizations(fetchedOrgs);

        const storedOrg = localStorage.getItem("selectedOrganization");
        const selectedOrg = storedOrg
          ? JSON.parse(storedOrg)
          : fetchedOrgs.length > 0
          ? fetchedOrgs[0]
          : null;

        setSelectedOrganization(selectedOrg);

        if (!storedOrg && fetchedOrgs.length > 0) {
          localStorage.setItem(
            "selectedOrganization",
            JSON.stringify(fetchedOrgs[0])
          );
        }
      } catch (error) {
        console.error(error);
        // Handle error case
      }
    };

    user && fetchOrgs();
  }, []);
  return (
    <div className="md:w-[calc(100%-230px)] w-[calc(100%-60px)] fixed flex items-center justify-between pl-2 pr-6 h-[70px] top-0 md:left-[230px] left-[60px] border-b border-slate-300 bg-[#fff]">
      {user && (
        <div className="flex items-center gap-3 cursor-pointer">
          <Link to="/Profile">
            {user?.profilePic ? (
              <img
                src={axios.defaults.baseURL + user.profilePic}
                alt="prifile_pic"
                className="h-10 w-10 object-cover rounded-full"
              />
            ) : (
              <PersonCircle color="#fb923c" width={"28px"} height={"28px"} />
            )}
          </Link>
          {organizations.length > 0 && (
            <>
              <Dropdown
                items={organizations}
                activeItem={selectedOrganization}
                setActiveItem={(item) => {
                  setSelectedOrganization(item);
                  localStorage.setItem(
                    "selectedOrganization",
                    JSON.stringify(item)
                  );
                }}
              />
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="md:grid hidden place-items-center bg-gray-100 rounded-full p-2 cursor-pointer">
          <SettingsOutline color={"#444"} />
        </div>
        <div className="grid place-items-center bg-gray-100 rounded-full p-2 cursor-pointer">
          <RefreshOutline
            color={"#444"}
            onClick={() => {
              window.location.reload();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
