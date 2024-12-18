import React from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const ProtectedRoute = ({ element }) => {
  const user = useRecoilValue(userAtom);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return element;
};

export default ProtectedRoute;
