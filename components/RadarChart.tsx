import React from 'react';

interface RadarChartData {
    label: string;
    value: number; // between 0 and 1
}

interface RadarChartProps {
    data: RadarChartData[];
    size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
    if (!data || data.length === 0) {
        return <div style={{width: size, height: size}} className="flex items-center justify-center text-slate-500">No hay datos para mostrar</div>;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.3; // Reducido para dar más espacio a las etiquetas
    const numAxes = data.length;
    const angleSlice = (Math.PI * 2) / numAxes;
    const gridLevels = 4;

    const getPoint = (angle: number, r: number) => ({
        x: centerX + r * Math.cos(angle - Math.PI / 2),
        y: centerY + r * Math.sin(angle - Math.PI / 2),
    });

    const gridPoints = Array.from({ length: gridLevels }, (_, i) => {
        const r = radius * ((i + 1) / gridLevels);
        return Array.from({ length: numAxes }, (__, j) => getPoint(j * angleSlice, r));
    });

    const dataPoints = data.map((d, i) => getPoint(i * angleSlice, d.value * radius));
    const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    const axisPoints = Array.from({ length: numAxes }, (_, i) => getPoint(i * angleSlice, radius));
    
    const labelPoints = Array.from({ length: numAxes }, (_, i) => getPoint(i * angleSlice, radius * 1.35)); // Aumentado para mejor visibilidad

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g>
                {/* Grid */}
                {gridPoints.reverse().map((points, i) => (
                    <polygon
                        key={i}
                        points={points.map(p => `${p.x},${p.y}`).join(' ')}
                        className="fill-slate-100 stroke-slate-300"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {axisPoints.map((p, i) => (
                    <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={p.x}
                        y2={p.y}
                        className="stroke-slate-300"
                        strokeWidth="1"
                    />
                ))}

                {/* Data Polygon */}
                <polygon points={dataPath} className="fill-sky-500/50 stroke-sky-700" strokeWidth="2" />
                
                 {/* Data Points */}
                 {dataPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" className="fill-sky-700" />
                ))}

                {/* Labels */}
                {labelPoints.map((p, i) => {
                    let textAnchor = "middle";
                    if (p.x < centerX - 10) textAnchor = "end";
                    if (p.x > centerX + 10) textAnchor = "start";
                    
                    const labelParts = data[i].label.split(' ');
                    const line1 = labelParts[0];
                    const line2 = labelParts.slice(1).join(' ');

                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="text-xs font-semibold fill-slate-700"
                        >
                            <tspan x={p.x} dy={line2 ? "-0.6em" : "0"}>{line1}</tspan>
                            {line2 && <tspan x={p.x} dy="1.2em">{line2}</tspan>}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
};

export default RadarChart;