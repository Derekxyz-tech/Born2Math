import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

export const Nebula: React.FC = () => {
	const frame = useCurrentFrame();

	const blobs = useMemo(() => {
		return [
			{color: '#6B46C1', x: 30, y: 40, size: 400, speed: 0.1},
			{color: '#3182CE', x: 70, y: 60, size: 500, speed: 0.15},
			{color: '#9F7AEA', x: 50, y: 50, size: 600, speed: 0.05},
			{color: '#E53E3E', x: 20, y: 80, size: 350, speed: 0.2},
		];
	}, []);

	return (
		<div
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				filter: 'blur(80px)',
				opacity: 0.6,
			}}
		>
			{blobs.map((blob, i) => {
				const offsetX = Math.sin(frame * blob.speed * 0.01) * 50;
				const offsetY = Math.cos(frame * blob.speed * 0.01) * 50;

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${blob.x}%`,
							top: `${blob.y}%`,
							width: blob.size,
							height: blob.size,
							backgroundColor: blob.color,
							borderRadius: '50%',
							transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px)`,
						}}
					/>
				);
			})}
		</div>
	);
};
