import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const TextLength = styled.p<{ $isLimit: boolean }>`
  align-self: flex-end;
  margin: 5px 5px 0 0;
  color: ${(props) => (props.$isLimit ? "#f08080" : "#ffffff80")};
  font-size: 12px;
`;

interface Props {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}
export default function TextInputWithLimit({
  value,
  onChange,
  maxLength = 180,
  rows = 5,
}: Props) {
  const isLimit = value.length >= maxLength;
  return (
    <Wrapper>
      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        required
      />
      <TextLength $isLimit={isLimit}>
        {value.length}/{maxLength}
      </TextLength>
    </Wrapper>
  );
}
