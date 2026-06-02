export interface RepoData {
    id: number;
    name: string;
    description: string | null;
    url: string;
    language: string;
    stars: number;
    updatedAt: string;
}

export interface DetailedStats {
    massiveFiles: number;
    nestedLoopsO2: number;
    hardcodedSecrets: number;
    sqlInjections: number;
    leftoverLogs: number;
    commentRatioPercent: number;
    languages?: Record<string, number>;
    duplicatePercent?: number;
}

export interface AnalysisData {
    id?: number;
    grade?: string;
    final_score?: number;
    doc_score?: number;
    arch_score?: number;
    test_ci_score?: number;
    clean_code_score?: number;
    efficiency_score?: number;
    security_score?: number;
    habit_score?: number;
    detailed_stats?: DetailedStats;
    insight?: string;
    analyzed_at?: string;
    status?: string;
}

export interface ProjectData {
    _id: string;
    groupName: string;
    userId: number;
    repos: RepoData[];
    createdAt: string;
    isAnalyzed: boolean;
    grade?: string;
    finalScore?: number;
    analysisResult?: any;
}

export type ModalTab = "overview" | "code" | "repos";