import styled from "styled-components";
import { auth, db } from "../firebase";
import {
  Wrapper,
  Title,
  Switcher,
  Error,
  Input,
} from "../components/auth-components";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";

const Content = styled.div`
  margin-top: 60px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  line-height: 1.5;
  color: #eff3f4;
`;

const Text = styled.p``;

const Strong = styled.span`
  color: #1d9bf0;
  font-weight: bold;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #1d9bf0;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-decoration: underline;
  &:hover {
    color: #1a8cd8;
  }
`;

const LogOutButton = styled.button`
  padding: 10px 20px;
  border-radius: 50px;
  border: 2px solid tomato;
  width: 30%;
  font-size: 16px;
  color: tomato;
  background-color: transparent;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const user = auth.currentUser;
  const [verifyLoading, setverifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // 계정이 없는 경우
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 소셜 회원, 인증 회원인 경우
  const isSocialUser = user?.providerData.some(
    (p) => p.providerId !== "password",
  );
  if (isSocialUser || user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  const onLogOut = async () => {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };

  const updateDBVerified = async (uid: string) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        isVerified: true,
        verifiedAt: Date.now(),
      });
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    }
  };

  useEffect(() => {
    const checkStatusAndMove = async () => {
      if (!user) return;

      await user.reload();
      if (user.emailVerified) {
        await updateDBVerified(user.uid);
        navigate("/", { replace: true });
      }
    };
    checkStatusAndMove();
  }, [user, navigate]);

  // 인증 여부 수동 확인
  const checkVerification = async () => {
    if (verifyLoading) return;
    setverifyLoading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        await updateDBVerified(user.uid);
        navigate("/");
      } else {
        setError("인증이 완료되지 않았습니다. 메일함을 확인해주세요.");
      }
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    }
    setverifyLoading(false);
  };

  // 인증 여부 자동 확인
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(interval);
          await updateDBVerified(user.uid);
          navigate("/");
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate, user]);

  const onResend = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    try {
      await sendEmailVerification(user);
      alert("인증 메일이 재발송되었습니다.");
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Verify Email</Title>
      <Content>
        <Text>
          이메일 인증이 필요한 계정입니다. <br />
          <Strong>{auth.currentUser?.email}</Strong>로 <br />
          인증 메일을 보냈습니다.
        </Text>
        <Text>메일 링크를 클릭하면 자동으로 인증이 완료됩니다.</Text>
        <Text>인증이 완료되지 않는다면 아래 버튼을 눌러주세요.</Text>
        <Input
          as="button"
          type="button"
          onClick={checkVerification}
          value="인증 완료 확인"
          style={{
            backgroundColor: "#1d9bf0",
            color: "white",
            cursor: "pointer",
          }}
        >
          {verifyLoading ? "Loading..." : "인증 완료 확인"}
        </Input>
        {error !== "" && <Error>{error}</Error>}
        <Switcher>
          메일을 못 받으셨나요?
          <ResendButton onClick={onResend}>재발송하기</ResendButton>
        </Switcher>
      </Content>
      <LogOutButton onClick={onLogOut}>Log Out</LogOutButton>
    </Wrapper>
  );
}
