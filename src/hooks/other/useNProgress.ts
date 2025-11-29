import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configuração do NProgress
NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.1,
  easing: "ease",
  trickleSpeed: 200,
});

export const useNProgress = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();

    // Pequeno delay para simular o carregamento
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);
};

