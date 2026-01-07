import styled from "styled-components";
import type { ITweet } from "./timeline";
import { auth, db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const ContentColumn = styled.div`
  padding: 10px;
  &:last-child {
    place-self: end;
  }
`;

const VisualColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  height: 100%;
  padding: 0 10px 5px 0;
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const CreatedAt = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  padding-bottom: 10px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export default function Tweet({
  username,
  image,
  tweet,
  userId,
  id,
  createdAt,
}: ITweet) {
  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweets?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
    } catch (error) {
    } finally {
    }
  };

  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}`;
  return (
    <Wrapper>
      <ContentColumn>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {user?.uid === userId ? (
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        ) : null}
      </ContentColumn>
      <VisualColumn>
        <CreatedAt>{formattedDate}</CreatedAt>
        {image ? <Photo src={image.value} /> : null}
      </VisualColumn>
    </Wrapper>
  );
}
