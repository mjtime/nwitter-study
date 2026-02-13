import { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
const Description = styled.p`
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
  background-color: transparent;
  border: none;
  border: 1px solid #7b7b7b;
  border-radius: 5px;
  padding: 10px 5px;
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
`;

export default function DeleteAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const REQUIRED_TEXT = "주의사항을 확인했으며 탈퇴합니다";
  const [input, setInput] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDelete = async () => {
    const user = auth.currentUser;
    if (!user || input !== REQUIRED_TEXT || isLoading) return;
    try {
      setLoading(true);

      // 1. firestore 데이터 삭제 (유저정보, 프로필사진)
      await deleteDoc(doc(db, "users", user.uid));
      //   프로필 사진이 있는 경우 삭제
      const userDoc = await getDoc(doc(db, "avatars", user.uid));
      if (userDoc.exists()) {
        await deleteDoc(doc(db, "avatars", user.uid));
      }

      // 2. Auth 계정 삭제
      await deleteUser(user);
      alert("계졍이 삭제되었습니다. 이용해주셔서 감사합니다.");
      navigate("/login");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("보안을 위해 다시 로그인한 후 탈퇴를 진행해주세요.");
        auth.signOut();
        navigate("/login");
      } else {
        alert("탈퇴 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Withdrawal</Title>
        <Description>
          탈퇴 시 계정 정보는 즉시 삭제됩니다.
          <br /> 단, <Strong>작성하신 게시물은 자동 삭제되지 않습니다.</Strong>
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
          <DeleteBtn onClick={onDelete}>
            {isLoading ? "Loading..." : "Delete"}
          </DeleteBtn>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
}
