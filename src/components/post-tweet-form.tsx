import { addDoc, collection } from "firebase/firestore";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";
import type { ITweet } from "../types/tweet.types";
import Button from "./common/Button";
import { IconButton } from "./common/Button/IconButton";
import TextInputWithLimit from "./common/TextInputWithLimit";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const ImgPreviewWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: 6px;
  right: 6px;
`;

const ImgPreview = styled.img`
  width: 100%;
  max-height: 100px;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid #333;
`;

interface PostTweetFormProps {
  onPostSuccess: (newTweet: ITweet) => void;
}

export default function PostTweetForm({ onPostSuccess }: PostTweetFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILE_SIZE = 300 * 1024; // 300KB

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
      setFile(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onRemoveImage = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || tweet === "" || tweet.length > 180) return;

    try {
      setLoading(true);
      const newTweetData = {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
        likes: [],

        ...(file && {
          image: {
            type: "base64",
            value: file,
          },
        }),
      };

      const docRef = await addDoc(collection(db, "tweets"), newTweetData);

      onPostSuccess({
        id: docRef.id,
        ...newTweetData,
      } as ITweet);

      setTweet("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <TextInputWithLimit value={tweet} onChange={setTweet} />
      {file && (
        <ImgPreviewWrapper>
          <ImgPreview src={file} alt="uploaded preview" />
          <RemoveImageButton $size="sm" onClick={onRemoveImage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </RemoveImageButton>
        </ImgPreviewWrapper>
      )}

      <Button variant="upload" as={"label"} htmlFor="file">
        {file ? "Photo added✅" : "Add photo"}
      </Button>
      <AttachFileInput
        ref={fileInputRef}
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      <Button variant="submit" type="submit" isLoading={isLoading}>
        Post
      </Button>
    </Form>
  );
}
