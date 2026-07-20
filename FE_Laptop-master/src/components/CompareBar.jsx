import React from 'react';
import { useCompare } from '../Utils/CompareContext';
import { useNavigate } from 'react-router-dom';
import { SwapOutlined, PlusOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import './CompareBar.css';

const CompareBar = () => {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const navigate = useNavigate();

    if (compareList.length === 0) return null;

    const handleCompare = () => {
        if (compareList.length === 2) {
            navigate(`/compare?id1=${compareList[0].id}&id2=${compareList[1].id}`);
        }
    };

    return (
        <div className="compare-bar-overlay">
            <div className="compare-bar">
                <div className="compare-bar-items">
                    {/* Product 1 */}
                    {compareList[0] && (
                        <div className="compare-bar-item">
                            <img
                                className="compare-bar-item-image"
                                src={compareList[0].image}
                                alt={compareList[0].name}
                            />
                            <span className="compare-bar-item-name">{compareList[0].name}</span>
                            <button
                                className="compare-bar-item-remove"
                                onClick={() => removeFromCompare(compareList[0].id)}
                            >
                                <CloseOutlined style={{ fontSize: 10 }} />
                            </button>
                        </div>
                    )}

                    <span className="compare-bar-vs">VS</span>

                    {/* Product 2 or placeholder */}
                    {compareList[1] ? (
                        <div className="compare-bar-item">
                            <img
                                className="compare-bar-item-image"
                                src={compareList[1].image}
                                alt={compareList[1].name}
                            />
                            <span className="compare-bar-item-name">{compareList[1].name}</span>
                            <button
                                className="compare-bar-item-remove"
                                onClick={() => removeFromCompare(compareList[1].id)}
                            >
                                <CloseOutlined style={{ fontSize: 10 }} />
                            </button>
                        </div>
                    ) : (
                        <div className="compare-bar-placeholder">
                            <PlusOutlined />
                            <span>Chọn thêm 1 sản phẩm</span>
                        </div>
                    )}
                </div>

                <div className="compare-bar-actions">
                    <button
                        className="compare-bar-btn compare-bar-btn-primary"
                        onClick={handleCompare}
                        disabled={compareList.length < 2}
                    >
                        <SwapOutlined style={{ marginRight: 6 }} />
                        So sánh
                    </button>
                    <button
                        className="compare-bar-btn compare-bar-btn-clear"
                        onClick={clearCompare}
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompareBar;
