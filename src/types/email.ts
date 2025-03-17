// Type definitions for email system

export type EmailSettings = {
  forwardingAddress: string;
  isEmailToTaskEnabled: boolean;
  lastSyncTimestamp: number | null;
};

export type EmailToTaskRule = {
  id: string;
  name: string;
  isEnabled: boolean;
  fromAddresses: string[];
  subjectContains: string[];
  bodyContains: string[];
  assignToProject: string | null;
  assignToArea: string | null;
  addTags: string[];
  isEveningTask: boolean;
  isSomedayTask: boolean;
}; 