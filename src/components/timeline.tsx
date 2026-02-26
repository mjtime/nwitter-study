import styled from "styled-components";
import Tweet from "./tweet";
import { useTweets } from "../hooks/use-tweets";

export interface ITweet {
  id: string;
  image?: { type: "base64"; value: string };
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
  updatedAt?: number;
  likes: string[];
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const tweets = useTweets("all");
  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
