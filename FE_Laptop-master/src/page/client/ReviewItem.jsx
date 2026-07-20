import { Avatar, Rate } from 'antd';
import {StarFilled, StarOutlined, UserOutlined} from '@ant-design/icons';

export default function ReviewItem({ name, avatar, date, rating, comment }) {
    return (
        <div className="review-item">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Avatar
                        size={48}
                        src={avatar || "/placeholder.svg"}
                        icon={<UserOutlined />}
                        alt={name}
                    />
                    <div>
                        <div className="reviewer-name">{name}</div>
                        <div className="review-date">{date}</div>
                    </div>
                </div>
                <Rate
                    disabled
                    defaultValue={rating}
                    className="review-rating"
                    character={({ index }) => index < rating ? <StarFilled /> : <StarOutlined />}
                />
            </div>
            <p className="review-comment">{comment}</p>
        </div>
    );
}