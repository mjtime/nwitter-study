import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../../firebase";

export default function EmailVerificationGuard() {
  const user = auth.currentUser;

  const isSocialUser = user?.providerData.some(
    (p) => p.providerId !== "password",
  );
  if (user && !user.emailVerified && !isSocialUser) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
