import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState<string | null>(null);
  const MAX_FILE_SIZE = 300 * 1024;
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "avatars", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAvatar(docSnap.data().avatar);
        }
      } catch (e) {
        alert("Failed to loading the avatar. Please try again.");
      }
    };

    fetchAvatar();
  }, [user]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!user || !files || files.length !== 1) return;
    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert("300KB 이하의 이미지만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      try {
        const userDocRef = doc(db, "avatars", user.uid);

        await setDoc(
          userDocRef,
          {
            avatar: base64Data,
          },
          { merge: true }
        );

        setAvatar(base64Data);
      } catch (error) {
        console.log(error);
        alert("Failed to update the avatar. Please try again.");
      }
    };

    reader.readAsDataURL(file);
  };
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {Boolean(avatar) ? (
          <AvatarImg src={avatar ?? ""} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <Name>{user?.displayName ?? "Anonymous"}</Name>
    </Wrapper>
  );
}
