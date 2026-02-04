import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = auth.currentUser;

  if (user) {
    if (!user.emailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
