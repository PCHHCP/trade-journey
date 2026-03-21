export const SUPPORTED_LANGUAGES = ["en-US", "zh-CN"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
