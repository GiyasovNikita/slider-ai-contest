import React, {useEffect, useRef, useState} from 'react';
import Circle from "../../Circle.jsx";

const Canvas = () => {
    const [circles, setCircles] = useState([]);
    const [selectedCircles, setSelectedCircles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
    const [initialPositions, setInitialPositions] = useState({});
    const slideRef = useRef(null);
    const [minDimension, setMinDimension] = useState(0);

    useEffect(() => {
        if (slideRef.current) {
            const { width, height } = slideRef.current.getBoundingClientRect();
            setMinDimension(Math.min(width, height)); // Минимальная сторона слайда
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace' && selectedCircles.length > 0) {
                e.preventDefault();
                deleteSelectedCircles();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedCircles]);

    const addCircle = () => {
        if (!slideRef.current) return;

        const slideRect = slideRef.current.getBoundingClientRect();
        const size = Math.random() * 0.15 + 0.05; // Размер от 5% до 20% от меньшей стороны
        const pixelSize = size * minDimension; // Размер круга в пикселях
        const newCircle = {
            id: Date.now(),
            size: `${pixelSize}px`,
            top: `${Math.random() * (slideRect.height - pixelSize)}px`,
            left: `${Math.random() * (slideRect.width - pixelSize)}px`,
        };
        setCircles([...circles, newCircle]);
    };

    const handleMouseDown = (e, id) => {
        e.preventDefault(); // предотвращаем стандартное поведение браузера

        if (e.shiftKey) {
            // При нажатии Shift переключаем выделение (добавляем или убираем из выделенных)
            toggleSelectCircle(id);
        } else {
            // Если Shift не нажат, сбрасываем выделение и добавляем только текущий круг
            setSelectedCircles([id]);
        }

        setDragging(true); // Устанавливаем режим перетаскивания
        setInitialMousePos({ x: e.clientX, y: e.clientY });

        // Обновляем начальные позиции всех выделенных кругов при начале перетаскивания
        setInitialPositions((prevPositions) => {
            const updatedPositions = { ...prevPositions };
            const circlesToSave = [...selectedCircles, id];

            circlesToSave.forEach((circleId) => {
                if (!updatedPositions[circleId]) {
                    const circle = circles.find((c) => c.id === circleId);
                    if (circle) {
                        updatedPositions[circleId] = {
                            top: parseFloat(circle.top),
                            left: parseFloat(circle.left),
                        };
                    }
                }
            });
            return updatedPositions;
        });
    };

    const handleMouseMove = (e) => {
        if (dragging) {
            const deltaX = e.clientX - initialMousePos.x;
            const deltaY = e.clientY - initialMousePos.y;
            const slideRect = slideRef.current.getBoundingClientRect();

            setCircles((prevCircles) =>
                prevCircles.map((circle) => {
                    if (selectedCircles.includes(circle.id)) {
                        const initialPosition = initialPositions[circle.id];
                        if (!initialPosition) return circle;

                        let newTop = initialPosition.top + deltaY;
                        let newLeft = initialPosition.left + deltaX;
                        const circleSize = parseFloat(circle.size);

                        // Ограничиваем перемещение в пределах слайда
                        newTop = Math.min(Math.max(newTop, 0), slideRect.height - circleSize);
                        newLeft = Math.min(Math.max(newLeft, 0), slideRect.width - circleSize);

                        return {
                            ...circle,
                            top: `${newTop}px`,
                            left: `${newLeft}px`,
                        };
                    }
                    return circle;
                })
            );
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        setInitialPositions({});
    };


    useEffect(() => {
        if (dragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);

    const toggleSelectCircle = (id) => {
        setSelectedCircles((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((circleId) => circleId !== id)
                : [...prevSelected, id]
        );
    };

    const deleteSelectedCircles = () => {
        setCircles((prevCircles) =>
            prevCircles.filter((circle) => !selectedCircles.includes(circle.id))
        );
        setSelectedCircles([]);
    };

    return (
        <div className="app">
            <button className="add-circle-btn" onClick={addCircle}>Добавить круг</button>
            <div className="slide" ref={slideRef}>
                {circles.map(circle => (
                    <Circle
                        key={circle.id}
                        {...circle}
                        onMouseDown={(e) => handleMouseDown(e, circle.id)}
                        isSelected={selectedCircles.includes(circle.id)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Canvas;

