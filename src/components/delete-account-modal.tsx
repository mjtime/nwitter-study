import { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  deleteUser,
  EmailAuthProvider,
  GithubAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const Modal = styled.div`
  background: black;
  border: 1px solid #333;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Title = styled.h2`
  font-size: 30px;
`;
const Description = styled.div`
  font-size: 16px;
  line-height: 1.6;
`;

const Strong = styled.span`
  color: #f08080;
  font-weight: bold;
`;

const ConfirmText = styled.span`
  display: inline-block;
  font-weight: 600;
  background-color: #333333;
`;

const Input = styled.input`
  width: 100%;
  background-color: transparent;
  border: none;
  border: 1px solid #7b7b7b;
  border-radius: 5px;
  padding: 10px 5px;
  margin-top: 10px;
  color: white;
  font-size: 16px;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
`;
const BaseButton = styled.button`
  border: 1px solid;
  border-radius: 15px;
  padding: 7px 15px;
  background-color: transparent;
  cursor: pointer;
`;
const CancelBtn = styled(BaseButton)`
  color: white;
`;
const DeleteBtn = styled(BaseButton)`
  color: #f08080;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Line = styled.div`
  border-bottom: 1px solid #7b7b7b;
  margin: 15px 0;
`;

export default function DeleteAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const REQUIRED_TEXT = "주의사항을 확인했으며 탈퇴합니다";
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const onDelete = async () => {
    if (!user || input !== REQUIRED_TEXT || isLoading) return;
    try {
      setLoading(true);
      setPasswordError("");

      const providerId = user.providerData[0].providerId;
      if (providerId === "password") {
        if (!password) {
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerId === "github.com") {
        // github 유저인 경우: github 팝업을 다시 띄워 인증
        const provider = new GithubAuthProvider();
        await reauthenticateWithPopup(user, provider);
      }

      // 1. firestore 데이터 삭제 (유저정보, 프로필사진)
      await deleteDoc(doc(db, "users", user.uid));
      //   프로필 사진이 있는 경우 삭제
      const userDoc = await getDoc(doc(db, "avatars", user.uid));
      if (userDoc.exists()) {
        await deleteDoc(doc(db, "avatars", user.uid));
      }

      // 2. 작성한 게시글 삭제
      const tweetsRef = collection(db, "tweets");
      const q = query(tweetsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // 3. Auth 계정 삭제
      await deleteUser(user);

      alert("계정이 삭제되었습니다. 이용해주셔서 감사합니다.");
      navigate("/login");
    } catch (e) {
      setPasswordError(getFirebaseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Withdrawal</Title>
        <Description>
          회원탈퇴를 위해 아래의 내용을 확인합니다.
          <br />
          이메일 가입 계정: 비밀번호 확인
          <br />
          Github 가입 계정: 팝업 자동 로그인을 통한 확인
          <br />
          {user?.providerData[0].providerId === "password" && (
            <>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              ></Input>
              {passwordError ? <Strong>{passwordError}</Strong> : null}
              <br />
            </>
          )}
        </Description>
        <Line />
        <Description>
          탈퇴 시 <Strong>계정 정보와 작성한 글은 즉시 삭제</Strong>됩니다.
          <br />
          탈퇴를 하려면 아래 문구를 똑같이 입력해주세요.
        </Description>
        <ConfirmText>{REQUIRED_TEXT}</ConfirmText>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={REQUIRED_TEXT}
        ></Input>
        <ButtonContainer>
          <CancelBtn onClick={onClose}>Cancel</CancelBtn>
          <DeleteBtn
            onClick={onDelete}
            disabled={
              isLoading ||
              input !== REQUIRED_TEXT ||
              (user?.providerData[0].providerId === "password" &&
                password.length < 6)
            }
          >
            {isLoading ? "Loading..." : "Delete"}
          </DeleteBtn>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
}
