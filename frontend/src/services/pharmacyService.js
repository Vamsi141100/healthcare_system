import axiosInstance from "./axiosInstance";

const getPharmacies = async () => {
    const response = await axiosInstance.get('/pharmacies/');
    return response.data;
};

const createPharmacy = async (data) => {
    const response = await axiosInstance.post('/admin/pharmacies', data);
    return response.data;
};

const updatePharmacy = async (id, data) => {
    const response = await axiosInstance.put(`/admin/pharmacies/${id}`, data);
    return response.data;
};

const deletePharmacy = async (id) => {
    const response = await axiosInstance.delete(`/admin/pharmacies/${id}`);
    return response.data;
};

const pharmacyService = {
    getPharmacies,
    createPharmacy,
    updatePharmacy,
    deletePharmacy
};

export default pharmacyService;