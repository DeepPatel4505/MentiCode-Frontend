import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getFiles,
    getJobResult,
    getJobStatus,
    startAnalysis,
} from "../services/analyze.api";

const FILE_JOB_MAP_STORAGE_KEY = "analysis:fileIdToJobId";

function readFileJobMap() {
    try {
        const raw = window.localStorage.getItem(FILE_JOB_MAP_STORAGE_KEY);
        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function writeFileJobMap(map) {
    window.localStorage.setItem(FILE_JOB_MAP_STORAGE_KEY, JSON.stringify(map));
}

export function saveFileJobMapping(fileId, jobId) {
    if (!fileId || !jobId) {
        return;
    }

    const map = readFileJobMap();
    map[fileId] = jobId;
    writeFileJobMap(map);
}

export function getStoredJobIdForFile(fileId) {
    if (!fileId) {
        return null;
    }

    const map = readFileJobMap();
    return map[fileId] || null;
}

export const analysisQueryKeys = {
    playgroundFiles: (playgroundId) => ["analysis", "playgroundFiles", playgroundId],
    jobStatus: (jobId) => ["analysis", "jobStatus", jobId],
    jobResult: (jobId) => ["analysis", "jobResult", jobId],
};

export function usePlaygroundFilesQuery(playgroundId, enabled) {
    return useQuery({
        queryKey: analysisQueryKeys.playgroundFiles(playgroundId),
        queryFn: () => getFiles(playgroundId),
        enabled: Boolean(playgroundId && enabled),
        staleTime: 2 * 60 * 1000,
        gcTime: 20 * 60 * 1000,
    });
}

export function useStartAnalysisMutation(playgroundId, fileId, onJobStart) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => startAnalysis(playgroundId, fileId),
        onSuccess: (data) => {
            const jobId = data?.jobId;
            if (!jobId) {
                return;
            }

            saveFileJobMapping(fileId, jobId);
            onJobStart?.(jobId);

            queryClient.invalidateQueries({
                queryKey: analysisQueryKeys.jobStatus(jobId),
            });
        },
    });
}

export function useJobStatusQuery(jobId, enabled) {
    return useQuery({
        queryKey: analysisQueryKeys.jobStatus(jobId),
        queryFn: () => getJobStatus(jobId),
        enabled: Boolean(jobId && enabled),
        staleTime: 5 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "completed" || status === "failed") {
                return false;
            }
            return 1500;
        },
    });
}

export function useJobResultQuery(jobId, enabled) {
    return useQuery({
        queryKey: analysisQueryKeys.jobResult(jobId),
        queryFn: () => getJobResult(jobId),
        enabled: Boolean(jobId && enabled),
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}
