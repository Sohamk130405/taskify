// src/pages/NotFound.js
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600">Page Not Found</p>
      <Link
        to="/"
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
