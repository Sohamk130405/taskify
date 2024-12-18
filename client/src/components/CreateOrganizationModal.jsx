import React, { useState, useEffect } from "react";
import axios from "axios";
import userAtom from "../atoms/userAtom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { allOrg, selectedOrg } from "../atoms/orgAtom";
import { PersonCircle } from "react-ionicons";

const CreateOrganizationModal = ({ isOpen, onClose, onCreate }) => {
  const currUser = useRecoilValue(userAtom);
  const [organizationName, setOrganizationName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [organizations, setOrganizations] = useRecoilState(allOrg);
  const setSelectedOrganization = useSetRecoilState(selectedOrg);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      axios
        .get("/api/users/getAllUsers")
        .then((res) => {
          setUsers(res.data.filter((user) => user.id !== currUser.id));
        })
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [isOpen, currUser?.id]);

  const handleCreate = () => {
    if (organizationName.trim()) {
      const newOrganization = {
        name: organizationName.trim(),
        users: selectedUsers,
      };

      axios
        .post("/api/organizations/createOrg", {
          orgName: newOrganization.name,
          selectedUsers: newOrganization.users,
          createdBy: currUser.id,
        })
        .then((res) => {
          onCreate({ ...newOrganization, id: res.data.id });
          setSelectedUsers([]);
          setOrganizations([
            ...organizations,
            { id: res.data.id, ...newOrganization, role: "admin" },
          ]);
          setSelectedOrganization({ ...newOrganization, id: res.data.orgId });
          onClose();
        })
        .catch((error) => console.error("Error creating organization:", error));
    }
  };

  const handleUserSelection = (user) => {
    if (!selectedUsers.some((selected) => selected.id === user.id)) {
      setSelectedUsers((prevSelected) => [...prevSelected, user]);
    }
  };

  const handleUserRemoval = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.filter((user) => user.id !== userId)
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[500px] shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create Organization</h2>
        <input
          type="text"
          placeholder="Organization Name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Add Users</h3>
          <input
            type="text"
            placeholder="Search for users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          />
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {filteredUsers.length > 0
              ? filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => handleUserSelection(user)}
                  >
                    <div className="flex gap-2">
                      <img
                        src={
                          user.profile_pic
                            ? axios.defaults.baseURL + user.profile_pic
                            : "/images/user.png"
                        }
                        alt="prifile_pic"
                        className="h-10 w-10 object-cover rounded-full"
                      />
                      <div className="flex flex-col">
                        <h6 className="font-medium">{user.name}</h6>{" "}
                        <p className="text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              : "No users found"}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Selected Users</h3>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center bg-gray-200 rounded-lg p-2"
              >
                {user.name}
                <button
                  onClick={() => handleUserRemoval(user.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
