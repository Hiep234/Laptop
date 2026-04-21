import {baseService} from "./BaseService";


export class ChatService extends baseService {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    get_message_by_id = (page, size,senderId,receiverId) => {
        return this.get(`api/v1/users/message?page=${page}&size=${size}&senderId=${senderId}&receiverId=${receiverId}`,true);
    };
    get_information = (page, size) => {
        return this.get(`api/v1/users/information?page=${page}&size=${size}`);
    };

}

export const chatService = new ChatService();
