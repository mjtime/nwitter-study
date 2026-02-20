import { FirebaseError } from "firebase/app";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-login-credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
  "auth/weak-password": "비밀번호는 6자리 이상이어야 합니다.",
  "auth/network-request-failed": "네트워크 연결이 원활하지 않습니다.",
  "auth/requires-recent-login": "보안을 위해 다시 로그인한 후 시도해주세요.",
  "auth/popup-closed-by-user": "인증이 취소되었습니다.",
  "auth/too-many-requests":
    "짧은 시간에 너무 많은 요청이 있었습니다. 1~2분 후 다시 시도해주세요.",
  "permission-denied": "작성 권한이 없습니다. 다시 로그인해 주세요.",
  unavailable: "서버 접속이 원활하지 않습니다. 네트워크를 확인해 주세요.",
  "resource-exhausted": "일일 업로드 용량을 초과했습니다.",
  "not-found": "데이터를 찾을 수 없습니다.",
};

export const getFirebaseErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    return ERROR_MESSAGES[error.code] || "인증 오류가 발생했습니다.";
  }
  return "알 수 없는 오류가 발생했습니다.";
};
