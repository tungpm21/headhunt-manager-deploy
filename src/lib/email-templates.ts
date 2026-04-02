import { JobCandidateStage, SubmissionResult } from "@/types/job";

export type EmailTemplateStage = "CONTACTED" | "INTERVIEW" | "OFFER" | "REJECTED";

type EmailTemplateData = {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  interviewDate?: string | null;
};

function formatInterviewDate(interviewDate?: string | null) {
  if (!interviewDate) {
    return "theo lịch đã thống nhất";
  }

  return new Date(interviewDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const EMAIL_TEMPLATES: Record<
  EmailTemplateStage,
  {
    heading: string;
    subject: (data: EmailTemplateData) => string;
    body: (data: EmailTemplateData) => string;
  }
> = {
  CONTACTED: {
    heading: "Email giới thiệu cơ hội",
    subject: (data) =>
      `Cơ hội việc làm tại ${data.companyName} - ${data.jobTitle}`,
    body: (data) =>
      `Chào ${data.candidateName},\n\nBên mình đang có cơ hội ${data.jobTitle} tại ${data.companyName}. Nếu bạn quan tâm, mình rất muốn trao đổi thêm để chia sẻ chi tiết về vai trò, chế độ và lộ trình tuyển dụng.\n\nKhi thuận tiện, bạn phản hồi giúp mình để mình sắp xếp lịch trao đổi nhé.\n\nTrân trọng,`,
  },
  INTERVIEW: {
    heading: "Email mời phỏng vấn",
    subject: (data) =>
      `Lịch phỏng vấn - ${data.jobTitle} tại ${data.companyName}`,
    body: (data) =>
      `Chào ${data.candidateName},\n\nBạn được mời tham gia phỏng vấn cho vị trí ${data.jobTitle} tại ${data.companyName} vào ngày ${formatInterviewDate(data.interviewDate)}.\n\nBạn vui lòng phản hồi lại email này để xác nhận tham gia hoặc đề xuất khung thời gian phù hợp hơn.\n\nTrân trọng,`,
  },
  OFFER: {
    heading: "Email gửi offer",
    subject: (data) =>
      `Thư mời nhận việc - ${data.jobTitle} tại ${data.companyName}`,
    body: (data) =>
      `Chào ${data.candidateName},\n\nChúc mừng bạn đã đi tới bước đề nghị nhận việc cho vị trí ${data.jobTitle} tại ${data.companyName}.\n\nBên mình sẽ gửi thêm thông tin chi tiết về offer package, thời gian onboard và các bước xác nhận tiếp theo. Nếu có câu hỏi nào, bạn cứ phản hồi trực tiếp để mình hỗ trợ.\n\nTrân trọng,`,
  },
  REJECTED: {
    heading: "Email phản hồi kết quả",
    subject: (data) =>
      `Kết quả ứng tuyển - ${data.jobTitle} tại ${data.companyName}`,
    body: (data) =>
      `Chào ${data.candidateName},\n\nCảm ơn bạn đã dành thời gian ứng tuyển cho vị trí ${data.jobTitle} tại ${data.companyName}.\n\nSau khi trao đổi kỹ với phía tuyển dụng, hiện tại hồ sơ của bạn chưa phù hợp với nhu cầu của vị trí này. Bên mình vẫn mong có cơ hội đồng hành cùng bạn ở những vị trí phù hợp hơn trong thời gian tới.\n\nChúc bạn nhiều thuận lợi trong các bước tiếp theo.\n\nTrân trọng,`,
  },
};

export function shouldOpenEmailTemplate(
  stage: JobCandidateStage,
  result: SubmissionResult
): stage is EmailTemplateStage {
  if (stage === "CONTACTED" || stage === "INTERVIEW" || stage === "OFFER") {
    return true;
  }

  return stage === "REJECTED" && result !== "WITHDRAWN";
}

export function buildEmailTemplate(
  stage: EmailTemplateStage,
  data: EmailTemplateData
) {
  const template = EMAIL_TEMPLATES[stage];

  return {
    heading: template.heading,
    subject: template.subject(data),
    body: template.body(data),
  };
}
