import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Button = styled.span`
  background-color: white;
  margin-top: 50px;
  font-weight: 500;
  width: 100%;
  color: black;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
    } catch (error) {
      alert("로그인에 실패했습니다.");
    }
  };
  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
