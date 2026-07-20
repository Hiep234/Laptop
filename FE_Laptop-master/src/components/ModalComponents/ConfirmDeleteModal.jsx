import React from 'react';
import {Button, Typography, Space} from 'antd';
import {CloseOutlined, DeleteOutlined} from '@ant-design/icons';
import {ExclamationCircleFilled} from '@ant-design/icons';
import {Modal} from "antd";
const ConfirmDeleteModal = ({
                                visible,
                                onCancel,
                                onConfirm,
                                itemCount,
                                loading
                            }) => {
    return (
        <Modal
            centered
            visible={visible}
            onCancel={onCancel}
            footer={null}
            closable={false}
            width={400}
            bodyStyle={{ padding: '24px' }}
        >
            <div style={{ textAlign: 'center' }}>
                <ExclamationCircleFilled
                    style={{
                        fontSize: '48px',
                        color: '#faad14',
                        marginBottom: '16px'
                    }}
                />

                <Typography.Text strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>
                    Xác nhận xóa sản phẩm
                </Typography.Text>

                <Typography.Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
                    Bạn có chắc chắn muốn xóa {itemCount} sản phẩm khỏi giỏ hàng?
                </Typography.Text>
                <Space size="large">
                    <Button
                        size="large"
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        disabled={loading}
                        style={{ width: '120px' }}
                    >
                        Hủy bỏ
                    </Button>

                    <Button
                        type="primary"
                        danger
                        size="large"
                        icon={<DeleteOutlined />}
                        onClick={onConfirm}
                        loading={loading}
                        style={{ width: '120px' }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

export default ConfirmDeleteModal;