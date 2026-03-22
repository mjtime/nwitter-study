import styled from "styled-components";
import type { ITweet } from "../types/tweet.types";
import { auth, db } from "../firebase";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";
import Button from "./common/Button";
import { IconButton } from "./common/Button/IconButton";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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

const PhotoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
`;

const PhotoContainer = styled.div`
  position: relative;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  object-fit: cover;
`;
const PhotoEditButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: stretch;
`;

const HiddenInput = styled.input`
  display: none;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  color: #ffffff80;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const ControlGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
`;

const LikeCount = styled.span`
  font-size: 16px;
`;

interface TweetProps extends ITweet {
  onDeleteSuccess: (id: string) => void;
  onLikeSuccess: (id: string, newLikes: string[]) => void;
  onEditSuccess: (id: string, payload: Partial<ITweet>) => void;
}

export default function Tweet({
  username,
  image,
  tweet,
  userId,
  id,
  createdAt,
  updatedAt,
  likes = [],
  onDeleteSuccess,
  onLikeSuccess,
  onEditSuccess,
}: TweetProps) {
  const user = auth.currentUser;
  const [isLoading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTweet, setEditedTweet] = useState(tweet);
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    image ? image.value : null,
  );
  const isLiked = user ? likes.includes(user.uid) : false;
  const likeCount = likes.length;
  const MAX_FILE_SIZE = 300 * 1024;

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweets?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      onDeleteSuccess(id);
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    } finally {
    }
  };

  const onEdit = () => {
    if (user?.uid !== userId) return;
    setEditMode(true);
    setPhotoPreview(image ? image.value : null);
    setPhotoFile(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length !== 1) return;

    const selectedFile = files[0];

    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("300KB 이하의 이미지만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoFile(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDeletePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
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

    try {
      setLoading(true);
      const tweetRef = doc(db, "tweets", id);
      // 1. 업데이트할 데이터
      const updateData: any = {
        tweet: editedTweet,
        updatedAt: Date.now(),
      };

      // 2. 사진 데이터 처리 로직
      if (photoFile) {
        // Case A: 새로운 사진 파일이 선택됨 (변경 또는 추가)
        updateData.image = {
          type: "base64",
          value: photoFile,
        };
      } else if (!photoPreview && image) {
        // Case B: 미리보기는 없는데 기존 이미지는 있었음 (삭제)
        updateData.image = null;
      }

      // 3. 변경 사항 확인
      // 텍스트와 사진 변경 사항이 없다면 업데이트를 하지 않고 종료
      if (editedTweet === tweet && updateData.image === undefined) {
        setEditMode(false);
        setLoading(false);
        return;
      }

      // 4. Firestore 업데이트 실행
      await updateDoc(tweetRef, updateData);

      onEditSuccess(id, {
        tweet: editedTweet,
        image: updateData.image !== undefined ? updateData.image : image,
        updatedAt: updateData.updatedAt,
      });

      setEditMode(false);
      setPhotoFile(null);
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setEditedTweet(tweet);
    setEditMode(false);
    setPhotoFile(null);
    setPhotoPreview(image ? image.value : null);
  };

  const onLike = async () => {
    if (!user) return;
    const tweetRef = doc(db, "tweets", id);
    const newLikes = isLiked
      ? likes.filter((uid) => uid !== user.uid)
      : [...likes, user.uid];

    try {
      if (isLiked) {
        await updateDoc(tweetRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(tweetRef, { likes: arrayUnion(user.uid) });
      }
      onLikeSuccess(id, newLikes);
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
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
        {editMode ? (
          photoPreview ? (
            <PhotoWrapper>
              <PhotoContainer>
                <Photo src={photoPreview} />
              </PhotoContainer>
              <PhotoEditButtons>
                <Button
                  as="label"
                  variant="upload"
                  size="sm"
                  htmlFor={`file-change-${id}`}
                >
                  Change
                </Button>
                <HiddenInput
                  type="file"
                  id={`file-change-${id}`}
                  accept="image/*"
                  onChange={onFileChange}
                />
                <Button
                  variant="active_nev_border"
                  size="sm"
                  onClick={onDeletePhoto}
                >
                  Delete
                </Button>
              </PhotoEditButtons>
            </PhotoWrapper>
          ) : null
        ) : image ? (
          <PhotoContainer>
            <Photo src={image.value} />
          </PhotoContainer>
        ) : null}
      </Main>
      <ButtonGroup>
        {!editMode && (
          <ActionGroup>
            <IconButton
              $variant={isLiked ? "lineFilled" : "line"}
              $size="sm"
              $color="red"
              onClick={onLike}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </IconButton>
            <LikeCount>{likeCount}</LikeCount>
          </ActionGroup>
        )}
        {user?.uid === userId ? (
          <ControlGroup>
            {editMode ? (
              <>
                <Button variant="active_nev" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                {!photoPreview && (
                  <>
                    <Button
                      as={"label"}
                      variant="active_pos"
                      size="sm"
                      htmlFor={`file-add-${id}`}
                    >
                      Add Photo
                    </Button>
                    <HiddenInput
                      type="file"
                      id={`file-add-${id}`}
                      accept="image/*"
                      onChange={onFileChange}
                    />
                  </>
                )}
                <Button
                  variant="active_pos"
                  size="sm"
                  isLoading={isLoading}
                  onClick={onUpdate}
                >
                  Update
                </Button>
              </>
            ) : (
              <>
                <Button variant="active_pos" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button variant="active_nev" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              </>
            )}
          </ControlGroup>
        ) : null}
      </ButtonGroup>
    </Wrapper>
  );
}
