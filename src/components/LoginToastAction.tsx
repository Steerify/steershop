import { ToastAction } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

export const LoginToastAction = () => {
  const navigate = useNavigate();

  return (
    <ToastAction altText="Go to login" onClick={() => navigate("/auth")}> 
      Login
    </ToastAction>
  );
};
