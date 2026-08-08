export interface PersonaVoice {
  tone: string;
  sentenceStyle: string;
  personPOV: "first" | "third";
  signaturePhrases?: string[];
}

export interface PersonaProfile {
  name: string;
  domain: string;
  bio: string;
  voice: PersonaVoice;
  interests: string[];
  opinions: string[];
  publishingStandards: string[];
}

export interface Agent {
  agentId: string;
  persona: PersonaProfile;
  status: "active" | "stopped";
  createdAt: string;
  nextRunAt?: string;
}

export interface DiscoveryCandidates {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
}

export interface JudgmentResult {
  verdict: "accept" | "reject";
  reason: string;
  noveltyScore: number;
  relevanceScore: number;
}

export interface JudgmentReview {
  all: Array<JudgmentResult & { candidate: DiscoveryCandidates }>;
  accepted?: DiscoveryCandidates & JudgmentResult;
}

export interface DraftPost {
  text: string;
  rationale: string;
  sources: string[];
}

export interface Post {
  id: string;
  agentId: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
  topicKey: string;
}

export interface TopicReview {
  agentId: string;
  reviewedAt: string;
  candidateTitle?: string;
  candidateUrl?: string;
  verdict: "accept" | "reject";
  reason?: string;
  noveltyScore?: number;
  relevanceScore?: number;
}

export interface RunLog {
  id?: number;
  agentId: string;
  startedAt: string;
  finishedAt?: string;
  outcome: "published" | "skipped_no_candidates" | "skipped_all_rejected" | "skipped_dedup" | "skipped_near_duplicate" | "error";
  detail?: string;
}
