
import React from 'react';
import { DienesBlockType, Shape, Size, Color, Thickness } from '../types';
import { TAILWIND_COLORS } from '../constants';

interface DienesBlockProps {
  block: DienesBlockType;
}

const translations: Record<string, Record<string, string>> = {
  shape: {
    [Shape.Circle]: 'círculo',
    [Shape.Square]: 'cuadrado',
    [Shape.Triangle]: 'triángulo',
    [Shape.Rectangle]: 'rectángulo',
  },
  color: {
    [Color.Red]: 'rojo',
    [Color.Blue]: 'azul',
    [Color.Yellow]: 'amarillo',
  },
  size: {
    [Size.Small]: 'pequeño',
    [Size.Large]: 'grande',
  },
  thickness: {
    [Thickness.Thick]: 'grueso',
    [Thickness.Thin]: 'delgado',
  }
};

const DienesBlock: React.FC<DienesBlockProps> = ({ block }) => {
  const { id, shape, color, size, thickness } = block;
  const dimensions = size === Size.Large ? { w: 48, h: 48 } : { w: 32, h: 32 };
  const colorClasses = TAILWIND_COLORS[color];
  const isThick = thickness === Thickness.Thick;
  
  const thicknessClass = isThick ? 'stroke-2' : 'stroke-1';
  const dropShadowClass = isThick ? 'drop-shadow-lg' : 'drop-shadow-md';

  const strokeWidth = isThick ? 2 : 1;
  const halfStroke = strokeWidth / 2;
  const edgeOffset = isThick ? (size === Size.Large ? 3 : 2) : 0;


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('dienes-block', JSON.stringify(block));
  };
  
  const renderShape = () => {
    const { w, h } = dimensions;
    const topLayerClasses = `${colorClasses.svg} ${colorClasses.stroke} ${thicknessClass}`;
    const edgeLayerClasses = `${colorClasses.edge}`;
    
    switch (shape) {
      case Shape.Circle:
        const radius = (w / 2) - halfStroke;
        return (
          <g>
            {isThick && <circle cx={w/2} cy={h/2} r={radius} className={edgeLayerClasses} transform={`translate(${edgeOffset}, ${edgeOffset})`} />}
            <circle cx={w/2} cy={h/2} r={radius} className={topLayerClasses}/>
          </g>
        );
      case Shape.Square:
        return (
            <g>
                {isThick && <rect x={halfStroke} y={halfStroke} width={w - strokeWidth} height={h - strokeWidth} className={edgeLayerClasses} transform={`translate(${edgeOffset}, ${edgeOffset})`} />}
                <rect x={halfStroke} y={halfStroke} width={w - strokeWidth} height={h - strokeWidth} className={topLayerClasses}/>
            </g>
        );
      case Shape.Triangle:
        const points = `${halfStroke},${h - halfStroke} ${w - halfStroke},${h - halfStroke} ${w/2},${halfStroke}`;
        return (
            <g>
                {isThick && <polygon points={points} className={edgeLayerClasses} transform={`translate(${edgeOffset}, ${edgeOffset})`} />}
                <polygon points={points} className={topLayerClasses} />
            </g>
        );
      case Shape.Rectangle:
        return (
            <g>
                {isThick && <rect x={halfStroke} y={(h/4) + halfStroke} width={w - strokeWidth} height={(h/2) - strokeWidth} className={edgeLayerClasses} transform={`translate(${edgeOffset}, ${edgeOffset})`} />}
                <rect x={halfStroke} y={(h/4) + halfStroke} width={w - strokeWidth} height={(h/2) - strokeWidth} className={topLayerClasses} />
            </g>
        );
      default:
        return null;
    }
  };

  const translatedShape = translations.shape[shape];
  const translatedColor = translations.color[color];
  const translatedSize = translations.size[size];
  const translatedThickness = translations.thickness[thickness];
  
  const title = `${translatedShape} ${translatedColor} ${translatedSize} ${translatedThickness}`;

  return (
    <div
      id={id}
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing transition-transform transform hover:scale-110"
      title={title}
      data-block={JSON.stringify(block)}
    >
      <svg width={dimensions.w + edgeOffset} height={dimensions.h + edgeOffset} viewBox={`0 0 ${dimensions.w + edgeOffset} ${dimensions.h + edgeOffset}`} className={dropShadowClass}>
        {renderShape()}
      </svg>
    </div>
  );
};

export default DienesBlock;
