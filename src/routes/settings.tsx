import { useState } from "react";
import styled from "styled-components";
import DeleteAccountModal from "../components/delete-account-modal";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const Title = styled.h2`
  font-size: 34px;
  font-weight: 700;
  padding-bottom: 30px;
  border-bottom: 1px solid #606060;
`;
const List = styled.ul``;
const ListItem = styled.li`
  padding: 20px 10px;
  border-bottom: 1px solid #303030;
  cursor: pointer;

  &:hover {
    background-color: #222222;
    transition: background-color 0.2s;
  }
`;

export default function Settings() {
  const [isDelAccountModalOpen, setDelAccountModalOpen] = useState(false);
  return (
    <Wrapper>
      <Title>Settings</Title>
      <List>
        <ListItem onClick={() => setDelAccountModalOpen(true)}>
          회원탈퇴
        </ListItem>
      </List>
      {isDelAccountModalOpen && (
        <DeleteAccountModal onClose={() => setDelAccountModalOpen(false)} />
      )}
    </Wrapper>
  );
}
