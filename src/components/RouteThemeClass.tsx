import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const RouteThemeClass = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isHome = pathname === "/";
    document.body.classList.toggle("homepage-theme", isHome);
    document.body.classList.toggle("app-page-theme", !isHome);

    return () => {
      document.body.classList.remove("homepage-theme");
      document.body.classList.remove("app-page-theme");
    };
  }, [pathname]);

  return null;
};
