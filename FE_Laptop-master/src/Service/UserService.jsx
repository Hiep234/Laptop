import {baseService} from "./BaseService";

export class UserService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super()
    };
    register = (username,password,fullName,email) => {
        return this.post('api/v1/auth/register',{username,email,password,fullName})
    }
    login = (username,password) => {
        return this.post('api/v1/auth/login',{username,password})
    }
    changePassword = (currentPassword, newPassword,confirmPassword) => {
        return this.post('api/v1/auth/change-password',{currentPassword, newPassword,confirmPassword})
    }
    getBalanceOfUser = (id) => {
        return this.get(`api/v1/auth/balance/${id}`,true);
    }
    informationUser = (username) => {
        return this.get(`api/v1/auth/${username}`);
    }
    adminGetAllUser = (keyword, page, size, sortDir, sortBy) => {
        const rawParams = { keyword, page, size, sortBy, sortDir };

        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );
        const params = new URLSearchParams(filteredParams).toString();
        return this.get(`api/v1/users/admin?${params}`, true);
    }
    blockUser = (userId) => {
        return this.put(`api/v1/users/block/${userId}`,{});
    }
    sendRequestDrawl = (body) => {
        return this.post('api/v1/withdrawals/create',body)
    }
    userGetAllWithdrawals = (startDate, endDate, page, size, sortBy, sortDirection) => {
        const rawParams = { startDate, endDate, page, size, sortBy, sortDirection };
        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );
        const params = new URLSearchParams(filteredParams).toString();
        return this.get(`api/v1/withdrawals/user/page?${params}`, true);
    }



}
export const userService = new UserService ();