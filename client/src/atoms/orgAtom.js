// atom/orgAtom.js
import { atom } from "recoil";

// Atom for selected organization
export const selectedOrg = atom({
  key: "selectedOrg", // unique ID for this atom
  default: JSON.parse(localStorage.getItem("selectedOrganization")) || null, // default value
});

// Atom for all organizations
export const allOrg = atom({
  key: "allOrg", // unique ID for this atom
  default: JSON.parse(localStorage.getItem("allOrganizations")) || [], // Initialize with local storage or empty array
});
