import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

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
  return (
    <Wrapper>
      <FormWrapper>
        <PostTweetForm />
      </FormWrapper>
      <TimelineWrapper>
        <Timeline />
      </TimelineWrapper>
    </Wrapper>
  );
}
