import { useOptimistic, useState } from "react";
import { auth, db } from "../firebase";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";

// optimistic 상태에서 사용할 액션 타입
type OptimisticAction =
  | { type: "toggle" } // 좋아요 상태 반전
  | { type: "rollback"; prev: boolean }; // 실패 시 이전 상태로 복구

interface UseLikeProps {
  tweetId: string;
  likes: string[];
  onLikeSuccess: (id: string, newLikes: string[]) => void;
}

export function useLike({ tweetId, likes, onLikeSuccess }: UseLikeProps) {
  const user = auth.currentUser;

  // 서버 데이터 기반 실제 좋아요 여부 (derived state)
  const isLiked = user ? likes.includes(user.uid) : false;
  // 낙관적 UI 상태 (UI 먼저 변경)
  const [optimisticIsLiked, addOptimistic] = useOptimistic<
    boolean,
    OptimisticAction
  >(isLiked, (state, action) => {
    switch (action.type) {
      case "toggle":
        return !state;
      case "rollback":
        return action.prev;
      default:
        return state;
    }
  });
  // 요청 중복 방지
  const [pending, setPending] = useState(false);

  // optimistic 상태를 반영한 좋아요 수 계산
  const likeCount =
    likes.length +
    (optimisticIsLiked !== isLiked ? (optimisticIsLiked ? 1 : -1) : 0);

  const onLike = async () => {
    if (!user) return;
    if (pending) return;

    setPending(true);
    const prev = optimisticIsLiked; // rollback 대비 이전 상태 저장
    const tweetRef = doc(db, "tweets", tweetId);

    // 1. UI 먼저 변경 (optimistic)
    addOptimistic({ type: "toggle" });
    try {
      // 2. 서버에 반영할 likes 배열 계산
      const newLikes = prev
        ? likes.filter((uid) => uid !== user.uid)
        : [...likes, user.uid];

      // 3. Firestore 업데이트
      if (prev) {
        await updateDoc(tweetRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(tweetRef, { likes: arrayUnion(user.uid) });
      }
      // 4. 부모 상태 동기화
      onLikeSuccess(tweetId, newLikes);
    } catch (e) {
      alert(getFirebaseErrorMessage(e));
      // 5. 실패 시 UI 복구
      addOptimistic({ type: "rollback", prev });
    } finally {
      setPending(false);
    }
  };
  return {
    optimisticIsLiked, // UI용 좋아요 상태
    likeCount, // UI용 좋아요 수
    onLike, // 좋아요 클릭 핸들러
  };
}
