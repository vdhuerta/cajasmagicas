import React from 'react';

interface RadarChartData {
    label: string;
    value: number; // between 0 and 1
}

interface RadarChartDataset {
    data: RadarChartData[];
    color: string; // e.g., 'fill-sky-500/50'
    stroke: string; // e.g., 'stroke-sky-700'
}

interface RadarChartProps {
    datasets: RadarChartDataset[];
    size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ datasets, size = 300 }) => {
    if (!datasets || datasets.length === 0 || datasets.every(d => d.data.length === 0)) {
        return <div style={{width: size, height: size}} className="flex items-center justify-center text-slate-500">No hay datos para mostrar</div>;
    }

    const allLabels = [...new Set(datasets.flatMap(d => d.data.map(item => item.label)))];
    const numAxes = allLabels.length;

    if (numAxes < 3) {
        return <div style={{width: size, height: size}} className="flex items-center justify-center text-slate-500 text-center p-4">Se necesitan al menos 3 habilidades diferentes para mostrar el gráfico.</div>;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.3;
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

    const axisPoints = Array.from({ length: numAxes }, (_, i) => getPoint(i * angleSlice, radius));
    const labelPoints = Array.from({ length: numAxes }, (_, i) => getPoint(i * angleSlice, radius * 1.35));

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

                {/* Data Polygons */}
                {datasets.map((dataset, datasetIndex) => {
                    const dataPoints = allLabels.map((label, i) => {
                        const dataPoint = dataset.data.find(d => d.label === label);
                        const value = dataPoint ? dataPoint.value : 0;
                        return getPoint(i * angleSlice, value * radius);
                    });
                    const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
                    const pointFill = dataset.stroke.replace('stroke-', 'fill-');

                    return (
                        <g key={datasetIndex}>
                            <polygon points={dataPath} className={`${dataset.color} ${dataset.stroke}`} strokeWidth="2" />
                            {dataPoints.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="4" className={pointFill} />
                            ))}
                        </g>
                    );
                })}
                
                {/* Labels */}
                {labelPoints.map((p, i) => {
                    // FIX: Explicitly type `textAnchor` to prevent type widening to `string` and satisfy the SVG text attribute's expected type.
                    let textAnchor: 'start' | 'middle' | 'end' = "middle";
                    if (p.x < centerX - 10) textAnchor = "end";
                    if (p.x > centerX + 10) textAnchor = "start";
                    
                    const labelParts = (allLabels[i] as string).split(' ');
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