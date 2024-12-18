// SignUp.js
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SignUp = () => {
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/users/signup", {
        name: fullName,
        email,
        password,
        phone,
      });

      localStorage.setItem("user-taskify", JSON.stringify(res.data));
      setUser(res.data);
      showToast("SignUp", "Account created Successfully!", "success");
      navigate("/Home");
    } catch (error) {
      console.log(error);
      // If the error is from the server (e.g., network error, 500 Internal Server Error)
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        showToast("Error", errorMessage, "error");
      } else {
        // If the error object does not contain the expected structure
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

  return (
    <div className="bg-gray-100 flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <span className="inline-block bg-gray-200 rounded-full p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
              />
            </svg>
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Create a new account
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your details to register.
        </p>
        <form>
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
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              className="form-input w-full px-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-gray-600 text-xs mt-1">
              Must contain 1 uppercase letter, 1 number, min. 8 characters.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => handleSignUp(e)}
            className="w-full bg-[#f59e0b] text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Register
          </button>
          <p className="text-gray-600 text-xs text-center mt-4">
            Already have an account?{" "}
            <a
              onClick={() => setAuthScreen("login")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              login
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
