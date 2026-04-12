import api from "./axiosInstance";

export const getMembersAPI        = async (params={})  => (await api.get("/members/", { params })).data;
export const getMemberStatsAPI    = async ()            => (await api.get("/members/stats/")).data;
export const getMemberAPI         = async (id)          => (await api.get(`/members/${id}/`)).data;
export const registerMemberAPI    = async (data)        => (await api.post("/members/", data)).data;
export const updateMemberAPI      = async (id, data)    => (await api.put(`/members/${id}/`, data)).data;
export const updateMemberStatusAPI= async (id, status, isOfficial) => (await api.patch(`/members/${id}/status/`, { status, is_official: isOfficial })).data;
export const deleteMemberAPI      = async (id)          => (await api.delete(`/members/${id}/`)).data;