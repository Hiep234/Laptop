// LocationThunk.js
import { locationService } from "../../Service/LocationService";

export const getAllProvinces = () => async (dispatch) => {
    try {
        const res = await locationService.getProvinces();
        if (res && res.data) {
            dispatch({
                type: "SET_PROVINCES",
                payload: res.data,
            });
        }
        return res.data;
    } catch (error) {
        console.error("Error fetching provinces:", error);
        throw error;
    }
};

export const getAllDistricts = (provinceId) => async (dispatch) => {
    try {
        const res = await locationService.getDistrict(provinceId);
        if (res && res.data) {
            dispatch({
                type: "SET_DISTRICTS",
                payload: res.data,
            });
        }
        return res.data;
    } catch (error) {
        console.error(`Error fetching districts for province ${provinceId}:`, error);
        throw error;
    }
};

export const getAllWards = (districtId) => async (dispatch) => {
    try {
        const res = await locationService.getWards(districtId);
        if (res && res.data) {
            dispatch({
                type: "SET_WARDS",
                payload: res.data,
            });
        }
        return res.data;
    } catch (error) {
        console.error(`Error fetching wards for district ${districtId}:`, error);
        throw error;
    }
};

export const getAllCountries = () => async (dispatch) => {
    try {
        const res = await locationService.getCountries();
        if (res && res.data) {
            dispatch({
                type: "SET_COUNTRIES",
                payload: res.data,
            });
        }
        return res.data;
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
    }
};
