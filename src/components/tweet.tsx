import styled from "styled-components";
import type { ITweet } from "./timeline";
import { auth, db } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const ContentColumn = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
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
  white-space: nowrap;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px 20px 0px;
  font-size: 18px;
`;

const TextArea = styled.textarea`
  margin: 10px 0px;
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
  margin-left: auto;
  color: ${(props) => (props.$isLimit ? "#f08080" : "#ffffff80")};
  font-size: 12px;
`;

const ActionButtons = styled.div<{ $editMode: boolean }>`
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
  color: #ffffff80;

  justify-content: ${(props) =>
    props.$editMode ? "space-between" : "flex-start"};
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
      <ContentColumn>
        <Username>{username}</Username>
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
      </ContentColumn>
      <VisualColumn>
        <CreatedAt>
          {formattedDate}
          {updatedAt ? " (edited)" : ""}
        </CreatedAt>

        {image ? <Photo src={image.value} /> : null}
        {user?.uid === userId ? (
          <ActionButtons $editMode={editMode}>
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
      </VisualColumn>
    </Wrapper>
  );
}
