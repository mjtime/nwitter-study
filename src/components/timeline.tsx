import styled from "styled-components";
import Tweet from "./tweet";
import { useTweets } from "../hooks/use-tweets";

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
