import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Dropdown = ({ items, activeItem, setActiveItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
    setIsOpen(false);

    // Get the current path
    const currentPath = location.pathname;

    // Split the current path into parts
    const pathParts = currentPath.split("/");

    if (pathParts[1] === "Home") return navigate("/Home");
    pathParts[2] = item.id; // Assuming orgId is at index 2 (first index after the base path)

    // Create the new path
    const newPath = pathParts.join("/");

    // Navigate to the new path
    navigate(newPath);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={toggleDropdown}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          {activeItem ? activeItem.name : "Select Organization"}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`block px-4 py-2 text-sm cursor-pointer ${
                  activeItem?.id === item.id ? "bg-gray-100" : ""
                }`}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
