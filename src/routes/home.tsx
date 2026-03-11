import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import { useTweets } from "../hooks/use-tweets";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormWrapper = styled.div`
  position: sticky;
  top: 0;
  background-color: black;
  padding: 6px 0;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
`;

const TimelineWrapper = styled.div`
  padding: 30px 0;
`;

export default function Home() {
  const {
    tweets,
    addTweet,
    removeTweet,
    updateTweetLikes,
    isLoading,
    hasMore,
    fetchNextPage,
    updateTweet,
  } = useTweets("all");
  return (
    <Wrapper>
      <FormWrapper>
        <PostTweetForm onPostSuccess={addTweet} />
      </FormWrapper>
      <TimelineWrapper>
        <Timeline
          tweets={tweets}
          isLoading={isLoading}
          hasMore={hasMore}
          fetchNextPage={fetchNextPage}
          onDeleteSuccess={removeTweet}
          onLikeSuccess={updateTweetLikes}
          onEditSuccess={updateTweet}
        />
      </TimelineWrapper>
    </Wrapper>
  );
}
