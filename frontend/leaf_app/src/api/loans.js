import api from "./axiosInstance";

export const getApplicationsAPI        = async (params={})                  => (await api.get("/loans/applications/", { params })).data;
export const submitApplicationAPI      = async (data)                       => (await api.post("/loans/applications/", data)).data;
export const updateApplicationStatusAPI= async (id, status, rejectReason="")=> (await api.patch(`/loans/applications/${id}/`, { status, reject_reason: rejectReason })).data;
export const getLoansAPI               = async (params={})                  => (await api.get("/loans/", { params })).data;
export const getLoanAPI                = async (id)                         => (await api.get(`/loans/${id}/`)).data;
export const createLoanAPI             = async (data)                       => (await api.post("/loans/", data)).data;
export const updateLoanStatusAPI       = async (id, status, declineReason="")=> (await api.patch(`/loans/${id}/`, { status, decline_reason: declineReason })).data;