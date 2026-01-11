import styled, { css } from "styled-components";
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
  align-items: center;
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
  gap: 10px;
  justify-content: flex-end;
  color: #ffffff80;
`;

// 공통 Button CSS 헬퍼 (Text / Outline)
const textStyle = css<{ $btnColor?: string }>`
  background-color: inherit;
  color: #ffffff80;
  border: 0;
  font-size: 11px;
  padding: 5px 0px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: ${(props) => props.$btnColor || "#f08080"};
  }
`;

const outlineStyle = css<{ $btnColor?: string }>`
  display: block;
  width: 100%;
  background-color: inherit;
  border: 1px solid ${(props) => props.$btnColor || "#ffffff80"};
  color: ${(props) => props.$btnColor || "#ffffff80"};
  border-radius: 15px;
  font-size: 11px;
  padding: 3px 0px;
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
  box-sizing: border-box;
  transition: opacity 0.2s;
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
`;

// 통합 버튼 컴포넌트 ($version에 따라 스타일 분기)
const Button = styled.button<{
  $version: "text" | "outline";
  $btnColor?: string;
}>`
  ${(props) => (props.$version === "outline" ? outlineStyle : textStyle)}
`;

const LabelButton = styled.label<{
  $version: "text" | "outline";
  $btnColor?: string;
}>`
  ${(props) => (props.$version === "outline" ? outlineStyle : textStyle)}
  /* label은 inline이 기본이므로 outline일 때만 block 처리 */
  display: ${(props) =>
    props.$version === "outline" ? "block" : "inline-block"};
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
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    image ? image.value : null
  );
  const MAX_FILE_SIZE = 300 * 1024;

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

      setEditMode(false);
      setPhotoFile(null);
    } catch (error) {
      alert("Failed to update the tweet. Please try again.");
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
                <LabelButton
                  htmlFor={`file-change-${id}`}
                  $version="outline"
                  $btnColor="#5da9ff"
                >
                  Change
                </LabelButton>
                <HiddenInput
                  type="file"
                  id={`file-change-${id}`}
                  accept="image/*"
                  onChange={onFileChange}
                />
                <Button
                  onClick={onDeletePhoto}
                  $version="outline"
                  $btnColor="#f08080"
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
      {user?.uid === userId ? (
        <ButtonGroup>
          {editMode ? (
            <>
              <Button onClick={onCancel} $version="text">
                Cancel
              </Button>
              {!photoPreview && (
                <>
                  <LabelButton
                    htmlFor={`file-add-${id}`}
                    $version="text"
                    $btnColor="#5da9ff"
                  >
                    Add Photo
                  </LabelButton>
                  <HiddenInput
                    type="file"
                    id={`file-add-${id}`}
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </>
              )}
              <Button onClick={onUpdate} $version="text" $btnColor="#5da9ff">
                {isLoading ? "Loading..." : "Update"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onEdit} $version="text" $btnColor="#5da9ff">
                Edit
              </Button>
              <Button onClick={onDelete} $version="text">
                Delete
              </Button>
            </>
          )}
        </ButtonGroup>
      ) : null}
    </Wrapper>
  );
}
