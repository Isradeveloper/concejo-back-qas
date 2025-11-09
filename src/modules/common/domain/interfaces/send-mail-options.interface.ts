export interface Attachment {
  filename: string;
  content: string;
  cid: string;
}

export interface sendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachments?: Attachment[];
}
