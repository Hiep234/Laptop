import {chatService} from "../../Service/ChatService";


export const get_all_messages = (page,size,senderId,receiverId) => {
    return async (dispatch) => {
        try {
            const res = await chatService.get_message_by_id(page,size,senderId,receiverId);
            dispatch({
                type: "GET_MESSAGE",
                payload: res.data
            })
        } catch (error) {
            console.log(error);
        }
    }
}
export const get_all_users = (page,size) => {
    return async (dispatch) => {
        try {
            const res = await chatService.get_information(page,size);

            dispatch({
                type: "GET_USER",
                payload: res.data
            })
        } catch (error) {
            console.log(error);
        }
    }
}
