import { useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useShowToast = () => {
  const showToast = useCallback((title, description, type = "default") => {
    toast(
      <div>
        <strong>{title}</strong>
        <div>{description}</div>
      </div>,
      {
        type: type,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  }, []);

  return showToast;
};

export default useShowToast;
