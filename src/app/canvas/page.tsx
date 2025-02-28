"use client";
import { Stage, Layer, Rect, Circle, Image } from 'react-konva';
import useImage from 'use-image';

const LionImage = () => {
    const [image] = useImage('https://konvajs.org/assets/lion.png');
    return <Image image={image} />;
};




import { useState, useEffect } from "react";

const useInnerSize = () => {
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return size;
};



export default function Canvas() {
    const { width, height } = useInnerSize();
    return (
        // Stage - is a div wrapper
        // Layer - is an actual 2d canvas element, so you can have several layers inside the stage
        // Rect and Circle are not DOM elements. They are 2d shapes on canvas
        <Stage width={width} height={height}>
            <Layer>
                <Rect width={50} height={50} fill="red" draggable />
                <Circle x={200} y={200} stroke="black" radius={50} draggable />
                <LionImage />
            </Layer>
        </Stage>
    );
}


