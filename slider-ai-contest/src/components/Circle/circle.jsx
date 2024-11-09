import React from 'react';

const Circle = ({ id, size, top, left, onMouseDown, isSelected }) => {
    return (
        <div
            className={`circle ${isSelected ? 'selected' : ''}`}
            style={{
                width: size,
                height: size,
                top,
                left,
            }}
            onMouseDown={onMouseDown}
        />
    );
}

export default Circle;
