import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState(() => {
        const saved = localStorage.getItem('COMPARE_LIST');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('COMPARE_LIST', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product) => {
        setCompareList(prev => {
            if (prev.length >= 2) return prev;
            if (prev.find(p => p.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromCompare = (productId) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    const isInCompare = (productId) => {
        return compareList.some(p => p.id === productId);
    };

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare
        }}>
            {children}
        </CompareContext.Provider>
    );
};

export default CompareContext;
