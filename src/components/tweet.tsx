import styled from "styled-components";
import type { ITweet } from "./timeline";
import { auth, db } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  gap: 10px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 16px;
`;

const CreatedAt = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  white-space: nowrap;
`;

const Main = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Payload = styled.p`
  font-size: 18px;
  line-height: 1.2;
`;

const PhotoContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  object-fit: cover;
`;

const TextArea = styled.textarea`
  font-size: 18px;
  font-family: inherit;
  color: white;
  background-color: black;
  border: 2px solid #007fff;
  border-radius: 10px;
  padding: 10px;
  width: 100%;
  resize: none;

  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const TextLength = styled.p<{ $isLimit: boolean }>`
  align-self: flex-end;
  color: ${(props) => (props.$isLimit ? "#f08080" : "#ffffff80")};
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  color: #ffffff80;
`;
const Button = styled.button<{ $btnColor?: string }>`
  background-color: inherit;
  color: #ffffff80;
  border: 0;
  font-size: 11px;
  padding: 0px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.$btnColor || "#f08080"};
  }
`;

export default function Tweet({
  username,
  image,
  tweet,
  userId,
  id,
  createdAt,
  updatedAt,
}: ITweet) {
  const user = auth.currentUser;
  const [isLoading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTweet, setEditedTweet] = useState(tweet);

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweets?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
    } catch (error) {
      alert("Failed to delete the tweet. Please try again.");
    } finally {
    }
  };

  const onEdit = () => {
    if (user?.uid !== userId) return;
    setEditMode(true);
  };

  const onUpdate = async () => {
    if (
      !user ||
      isLoading ||
      editedTweet === "" ||
      editedTweet.length > 180 ||
      user.uid !== userId
    )
      return;

    if (editedTweet === tweet) {
      setEditMode(false);
      return;
    }

    try {
      setLoading(true);
      const tweetRef = doc(db, "tweets", id);

      await updateDoc(tweetRef, {
        tweet: editedTweet,
        updatedAt: Date.now(),
      });
      setEditMode(false);
    } catch (error) {
      alert("Failed to update the tweet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setEditedTweet(tweet);
    setEditMode(false);
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
      <Header>
        <Username>{username}</Username>
        <CreatedAt>
          {formattedDate}
          {updatedAt ? " (edited)" : ""}
        </CreatedAt>
      </Header>
      <Main>
        <Content>
          {editMode ? (
            <>
              <TextArea
                value={editedTweet}
                onChange={(e) => setEditedTweet(e.target.value)}
                maxLength={180}
                required
                rows={5}
              />
              <TextLength $isLimit={editedTweet.length >= 180}>
                {editedTweet.length}/180
              </TextLength>
            </>
          ) : (
            <Payload>{tweet}</Payload>
          )}
        </Content>
        {image && (
          <PhotoContainer>
            <Photo src={image.value} />
          </PhotoContainer>
        )}
      </Main>
      {user?.uid === userId ? (
        <ActionButtons>
          {editMode ? (
            <>
              <Button onClick={onCancel}>Cancel</Button>
              <Button onClick={onUpdate} $btnColor="#73e5ebff">
                {isLoading ? "Loading..." : "Update"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onEdit} $btnColor="#73e5ebff">
                Edit
              </Button>
              <Button onClick={onDelete}>Delete</Button>
            </>
          )}
        </ActionButtons>
      ) : null}
    </Wrapper>
  );
}
