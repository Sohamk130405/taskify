import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || "");
  const imgRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user details into state
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setProfilePic(
        user.profilePic ? axios.defaults.baseURL + user.profilePic : null
      );
    }
  }, [user]);

  console.log(user);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      if (imgRef.current.files[0]) {
        formData.append("profile_pic", imgRef.current.files[0]);
      }

      const res = await axios.put(`/api/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("user-taskify", JSON.stringify(res.data));
      setUser(res.data);
      showToast("Profile", "Profile updated successfully!", "success");
      navigate("/home");
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        showToast("Error", errorMessage, "error");
      } else {
        showToast(
          "Error",
          "An error occurred. Please try again later.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    imgRef.current.click();
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-center items-center mb-6 rounded-full">
          <img
            onClick={handleImageUpload}
            src={profilePic || "/images/user.png"}
            alt=""
            className="w-40 h-40 object-cover rounded-full"
          />
          <input
            type="file"
            hidden
            ref={imgRef}
            onChange={(e) =>
              setProfilePic(URL.createObjectURL(e.target.files[0]))
            }
          />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">Profile</h2>
        <p className="text-gray-600 text-center mb-6">Update your details</p>
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500"
              required
              placeholder="James Brown"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className="form-input w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500"
              required
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              className="form-input w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500"
              required
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f59e0b] text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
