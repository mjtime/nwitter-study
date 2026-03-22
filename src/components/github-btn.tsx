import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";
import Button from "./common/Button";

const GitButton = styled(Button)`
  margin-top: 50px;
  width: 100%;
`;

const Logo = styled.img`
  height: 25px;
`;

export default function GithubButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provieder = new GithubAuthProvider();
      const credentials = await signInWithPopup(auth, provieder);
      const user = credentials.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(doc(db, "users", credentials.user.uid), {
          createdAt: Date.now(),
          email: user.email,
          name: user.displayName ?? "Anonymous",
          provider: "github.com",
          isVerified: true,
          verifiedAt: Date.now(),
        });
      }
      navigate("/");
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    }
  };
  return (
    <GitButton onClick={onClick} variant="active_fill_border">
      <Logo src="/github-logo.svg" />
      Continue with Github
    </GitButton>
  );
}
