import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
  QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import type { ITweet } from "../types/tweet.types";
import { getFirebaseErrorMessage } from "../utils/firebase-errors";
export function useTweets(mode: "all" | "mine" | "likes", userId?: string) {
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 새 글을 배열 맨 앞에 추가하는 함수
  const addTweet = (newTweet: ITweet) => {
    setTweets((prev) => [newTweet, ...prev]);
  };
  // 글 삭제 함수
  const removeTweet = (tweetId: string) => {
    setTweets((prev) => prev.filter((tweet) => tweet.id !== tweetId));
  };

  // 글 내용 업데이트 함수
  const updateTweet = (tweetId: string, payload: Partial<ITweet>) => {
    setTweets((prev) =>
      prev.map((t) => (t.id === tweetId ? { ...t, ...payload } : t)),
    );
  };

  // 좋아요 상태 업데이트 함수
  const updateTweetLikes = (tweetId: string, newLikes: string[]) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId ? { ...tweet, likes: newLikes } : tweet,
      ),
    );
  };

  const fetchTweets = useCallback(
    async (isFirstLoad: boolean) => {
      // 로딩 중이면 종료
      if (isLoading) return;
      // 첫 요청이 아닌데 더이상 가져올게 없으면 종료
      if (!isFirstLoad && !hasMore) return;

      setIsLoading(true);
      try {
        // 1. 쿼리 조건 배열 생성
        const queryConstraints: QueryConstraint[] = [
          orderBy("createdAt", "desc"),
          limit(10),
        ];

        if (mode === "mine" && userId) {
          queryConstraints.push(where("userId", "==", userId));
        } else if (mode === "likes" && userId) {
          queryConstraints.push(where("likes", "array-contains", userId));
        }

        if (!isFirstLoad && lastVisible) {
          queryConstraints.push(startAfter(lastVisible));
        }

        // 2. 최종 쿼리 생성
        const tweetsQuery = query(
          collection(db, "tweets"),
          ...queryConstraints,
        );

        const snapshot = await getDocs(tweetsQuery);

        const newTweets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ITweet[];

        setTweets((prev) => {
          const allTweets = isFirstLoad ? newTweets : [...prev, ...newTweets];

          // 중복된 ID를 가진 트윗을 제거하는 필터링
          const map = new Map();

          for (const tweet of allTweets) {
            map.set(tweet.id, tweet);
          }

          return [...map.values()];
        });

        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === 10);
      } catch (e) {
        alert(getFirebaseErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    },
    [lastVisible, isLoading, hasMore, mode, userId],
  );

  // 모드 변경 시 초기화
  useEffect(() => {
    if ((mode === "mine" || mode === "likes") && !userId) return;
    setTweets([]);
    setLastVisible(null);
    setHasMore(true);
    fetchTweets(true);
  }, [mode, userId]);

  const fetchNextPage = useCallback(() => fetchTweets(false), [fetchTweets]);

  return {
    tweets,
    isLoading,
    hasMore,
    fetchNextPage,
    removeTweet,
    updateTweetLikes,
    addTweet,
    updateTweet,
  };
}
