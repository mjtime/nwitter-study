import styled from "styled-components";
import Tweet from "./tweet";
import { useEffect, useRef } from "react";
import type { ITweet } from "../types/tweet.types";

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
`;

const NoTweets = styled.span`
  margin-top: 50px;
  color: #808080;
  font-size: 16px;
`;

const ObserverTarget = styled.div`
  height: 20px;
  background: transparent;
`;

interface TimelineProps {
  tweets: ITweet[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  onDeleteSuccess: (id: string) => void;
  onLikeSuccess: (id: string, newLikes: string[]) => void;
  onEditSuccess: (id: string, payload: Partial<ITweet>) => void;
}

export default function Timeline({
  tweets,
  isLoading,
  hasMore,
  fetchNextPage,
  onDeleteSuccess,
  onLikeSuccess,
  onEditSuccess,
}: TimelineProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;
        if (isLoading) return;
        if (!hasMore) return;

        fetchNextPage();
      },
      {
        threshold: 0.1,
      },
    );

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }
  }, [hasMore, isLoading, fetchNextPage]);

  return (
    <Wrapper>
      {tweets.length === 0 ? (
        <NoTweets>There are no posts yet. It's still quiet here. </NoTweets>
      ) : (
        tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            {...tweet}
            onDeleteSuccess={onDeleteSuccess}
            onLikeSuccess={onLikeSuccess}
            onEditSuccess={onEditSuccess}
          />
        ))
      )}
      {hasMore && (
        <ObserverTarget ref={targetRef}>
          {isLoading ? "Loading more..." : ""}
        </ObserverTarget>
      )}
    </Wrapper>
  );
}
