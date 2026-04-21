import { baseService } from "./BaseService";

export class WithdrawalService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    adminGetAllWithdrawals = (startDate, endDate, status, page, size, sortBy, sortDirection) => {
        const rawParams = { startDate, endDate, status, page, size, sortBy, sortDirection };

        const filteredParams = Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== null && value !== undefined)
        );

        const queryString = new URLSearchParams(filteredParams).toString();

        return this.get(`api/v1/withdrawals/admin/page?${queryString}`, true);
    }

    adminUpdateWithdrawalStatus = (withdrawalId, data) => {
        return this.put(`api/v1/withdrawals/update/status/${withdrawalId}`, data);
    }
}

export const withdrawalService = new WithdrawalService();