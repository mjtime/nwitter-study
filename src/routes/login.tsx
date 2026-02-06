import { useState } from "react";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
        alert(
          "인증 정보 업데이트 중 오류가 발생했습니다. 같은 오류가 반복되면 관리자에게 문의해주세요.",
        );
      }
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
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
        <Input type="submit" value={isLoading ? "Loading..." : "Log in"} />
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
