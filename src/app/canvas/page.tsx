"use client";
import { Stage, Layer, Rect, Circle, Image } from 'react-konva';
import useImage from 'use-image';

const LionImage = () => {
    const [image] = useImage('https://konvajs.org/assets/lion.png');
    return <Image image={image} />;
  };

export default function Canvas() {
    return (
        // Stage - is a div wrapper
        // Layer - is an actual 2d canvas element, so you can have several layers inside the stage
        // Rect and Circle are not DOM elements. They are 2d shapes on canvas
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            <Rect width={50} height={50} fill="red" draggable/>
            <Circle x={200} y={200} stroke="black" radius={50} draggable/>
            <LionImage />
          </Layer>
        </Stage>
      );
}


