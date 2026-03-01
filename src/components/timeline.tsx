import styled from "styled-components";
import Tweet from "./tweet";
import { useTweets } from "../hooks/use-tweets";

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

export default function Timeline() {
  const { tweets, isLoading } = useTweets("all");

  return (
    <Wrapper>
      {isLoading ? (
        "Loading..."
      ) : tweets.length === 0 ? (
        <NoTweets>There are no posts yet. It's still quiet here. </NoTweets>
      ) : (
        tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)
      )}
    </Wrapper>
  );
}
