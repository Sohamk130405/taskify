import Signup from "../components/SignUp";
import Login from "../components/Login";
import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthPage = () => {
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) return navigate("/Home");
  }, []);
  const authScreenState = useRecoilValue(authScreenAtom);
  return <>{authScreenState === "signUp" ? <Signup /> : <Login />}</>;
};

export default AuthPage;
