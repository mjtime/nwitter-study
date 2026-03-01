import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { styled, createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import MainLayout from "./layouts/main-layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./routes/guards/protected-route";
import AuthLayout from "./layouts/auth-layout";
import PublicRoute from "./routes/guards/public-route";
import VerifyEmail from "./routes/verify-email";
import ResetPassword from "./routes/reset-password";
import Settings from "./routes/settings";
import EmailVerificationGuard from "./routes/guards/email-verification-guard";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "settings", element: <Settings /> },
      {
        element: <EmailVerificationGuard />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "create-account", element: <CreateAccount /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
]);

const GlobalStyles = createGlobalStyle`
${reset};
*{box-sizing: border-box;}
body{background-color:black;
color:white;
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    await auth.authStateReady();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App;
