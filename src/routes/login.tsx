import { useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Error,
  Form,
  Input,
  SubmitButton,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      const credentials = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = credentials.user;
      try {
        // 이메일 인증이 되었지만, DB에 반영되지 않은 경우 상태 동기화
        if (user.emailVerified) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && !userDoc.data().isVerified) {
            await updateDoc(doc(db, "users", user.uid), {
              isVerified: true,
              verifiedAt: Date.now(),
            });
          }
        }
      } catch (e) {
        alert(getFirebaseErrorMessage(e));
      }
      navigate("/");
    } catch (e) {
      setError(getFirebaseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Log into X</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={password}
          placeholder="Password"
          type="password"
          required
        />
        <SubmitButton
          variant="submit"
          type="submit"
          isLoading={isLoading}
          size="lg"
        >
          Log In
        </SubmitButton>
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Forgot password? <Link to="/reset-password">Reset Password</Link>
      </Switcher>
      <Switcher>
        Don't have an account?{" "}
        <Link to="/create-account">Create one &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
