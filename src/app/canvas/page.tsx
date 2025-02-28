"use client";
import { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Image } from 'react-konva';
import useImage from 'use-image';

const LionImage = () => {
    const [image] = useImage('https://konvajs.org/assets/lion.png');
    return <Image image={image} />;
  };

  export default function Canvas() {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
  
    useEffect(() => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }, []);
  
    return (
      <Stage width={width} height={height}>
        <Layer>
          <Rect width={50} height={50} fill="red" draggable />
          <Circle x={200} y={200} stroke="black" radius={50} draggable />
          <LionImage />
        </Layer>
      </Stage>
    );
  }
  


