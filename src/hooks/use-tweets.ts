import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import type { ITweet } from "../types/tweet.types";

export function useTweets(mode: "all" | "mine" | "likes", userId?: string) {
  const [tweets, setTweets] = useState<ITweet[]>([]);

  useEffect(() => {
    let q = query(collection(db, "tweets"), orderBy("createdAt", "desc"));

    if (mode === "mine" && userId) {
      q = query(q, where("userId", "==", userId));
    } else if (mode === "likes" && userId) {
      q = query(q, where("likes", "array-contains", userId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as ITweet,
      );
      setTweets(data);
    });

    return () => unsubscribe();
  }, [mode, userId]);
  return tweets;
}
