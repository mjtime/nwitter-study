import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import Tweet from "../components/tweet";
import { updateProfile } from "firebase/auth";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const EditAvatarText = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  color: white;
  font-size: 16px;
  font-weight: 600;

  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
`;

const AvatarUpload = styled.label`
  position: relative;
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

  &:hover ${EditAvatarText} {
    opacity: 1;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const NameWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const NameContainer = styled.div<{ $editMode: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  border-bottom: ${(props) => (props.$editMode ? "1px solid #1d9bf0" : "none")};
`;
const Name = styled.span`
  font-size: 22px;
`;

const BaseButton = styled.div`
  position: absolute;
  cursor: pointer;
  width: 18px;
  display: flex;
  align-items: center;
  svg {
    fill: white;
  }
  &:hover {
    opacity: 0.8;
  }
`;

const Button = styled(BaseButton)`
  left: 100%;
  margin-left: 5px;
`;

const CancelButton = styled(BaseButton)`
  right: 100%;
  margin-right: 5px;
`;

const Input = styled.input`
  width: 120px;
  font-size: 22px;
  text-align: center;
  background: transparent;
  color: white;
  border: none;

  &:focus {
    outline: none;
  }
`;

const TextLength = styled.span`
  font-size: 12px;
  color: #ffffff80;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

export interface ITweet {
  id: string;
  image?: { type: "base64"; value: string };
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
  updatedAt?: number;
}

export default function Profile() {
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName ?? "");
  const MAX_FILE_SIZE = 300 * 1024;
  const [tweets, setTweets] = useState<ITweet[]>([]);
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

  const fetchTweets = async () => {
    if (!user) return;
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25),
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, image, updatedAt } =
        doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        image,
        updatedAt,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };

  useEffect(() => {
    fetchTweets();
  }, []);

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
          { merge: true },
        );

        setAvatar(base64Data);
      } catch (error) {
        console.log(error);
        alert("Failed to update the avatar. Please try again.");
      }
    };

    reader.readAsDataURL(file);
  };

  const onEdit = () => {
    setEditMode(true);
  };

  const onCancel = () => {
    setNewName(user?.displayName ?? "");
    setEditMode(false);
  };

  const onUpdate = async () => {
    if (!user || newName === "" || isLoading) return;
    if (user.displayName === newName) {
      setEditMode(false);
      return;
    }
    try {
      setIsLoading(true);
      await updateProfile(user, { displayName: newName });

      const tweetsRef = collection(db, "tweets");
      const q = query(tweetsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { username: newName });
      });

      await batch.commit();

      setTweets((prev) =>
        prev.map((tweet) => {
          if (tweet.userId === user.uid) {
            return { ...tweet, username: newName };
          }
          return tweet;
        }),
      );

      setEditMode(false);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
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
        <EditAvatarText>EDIT</EditAvatarText>
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="image/*"
      />
      <NameWrapper>
        <NameContainer $editMode={editMode}>
          {editMode ? (
            <>
              <CancelButton onClick={onCancel}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </CancelButton>
              <Input
                onChange={(e) => setNewName(e.target.value)}
                value={newName}
                type="text"
                maxLength={10}
                required
              />
              <TextLength>{newName.length}</TextLength>
              <Button onClick={onUpdate}>
                {isLoading ? (
                  "Loading..."
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </Button>
            </>
          ) : (
            <>
              <Name>{user?.displayName ?? "Anonymous"}</Name>
              <Button onClick={onEdit}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </>
          )}
        </NameContainer>
      </NameWrapper>
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
