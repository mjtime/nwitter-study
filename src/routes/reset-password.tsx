import { useState } from "react";
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "") return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("재설정 이메일을 보냈습니다. 메일함을 확인해주세요.");
      setError("");
    } catch (e) {
      if (e instanceof FirebaseError) {
        let message = "에러가 발생했습니다. 다시 시도해주세요."; // 기본 메시지

        switch (e.code) {
          case "auth/invalid-email":
            message = "유효하지 않은 이메일 형식입니다.";
            break;
          case "auth/too-many-requests":
            message =
              "너무 많은 요청이 시도되었습니다. 잠시 후 다시 시도해주세요.";
            break;
          case "auth/network-request-failed":
            message = "네트워크 연결이 원활하지 않습니다.";
            break;
        }
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>Reset Password</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Send Reset Email"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Ready to Login? <Link to="/login">Return to Login</Link>
      </Switcher>
      <Switcher>
        Don't have an account?{" "}
        <Link to="/create-account">Create one &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
