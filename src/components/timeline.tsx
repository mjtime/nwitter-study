import styled from "styled-components";
import Tweet from "./tweet";
import { useTweets } from "../hooks/use-tweets";

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
`;

export default function Timeline() {
  const { tweets, isLoading } = useTweets("all");
  return (
    <Wrapper>
      {isLoading
        ? "Loading Tweets..."
        : tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)}
    </Wrapper>
  );
}
