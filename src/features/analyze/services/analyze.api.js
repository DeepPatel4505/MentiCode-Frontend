import api, { getApiAuthToken, getWsUrl } from "../../../lib/api";

export const createPlayground = async (payload) => {
    try {
        const res = await api.post(`/analysis/playgrounds`, payload);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to create playground");
    }
};

export const getPlaygrounds = async () => {
    try {
        const res = await api.get(`/analysis/playgrounds`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch playgrounds");
    }
};

export const deletePlayground = async (playgroundId) => {
    try {
        const res = await api.delete(`/analysis/playgrounds/${playgroundId}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to delete playground");
    }
};

export const getFiles = async (playgroundId) => {
    try {
        const res = await api.get(`/analysis/playgrounds/${playgroundId}/files`);
        console.log("Fetched files:", res.data);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch files");
    }
};

export const startAnalysis = async (playgroundId, fileId) => {
    try {
        const res = await api.post(
            `/analysis/playgrounds/${playgroundId}/files/${fileId}/analyze`,
        );
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to start analysis");
    }
};

export const getJobResult = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}/result`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch result");
    }
};

export const getJobStatus = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch job status");
    }
};

export const createWS = () => {
    const token = getApiAuthToken();
    return new WebSocket(`${getWsUrl("/ws")}?token=${token || ""}`);
};