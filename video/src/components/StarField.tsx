import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

const STAR_COUNT = 300;

export const StarField: React.FC = () => {
	const frame = useCurrentFrame();

	const stars = useMemo(() => {
		return Array.from({length: STAR_COUNT}).map((_, i) => ({
			id: i,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 2 + 1,
			speed: Math.random() * 0.05 + 0.02,
			opacity: Math.random(),
		}));
	}, []);

	return (
		<div
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			{stars.map((star) => {
				const driftY = (frame * star.speed) % 100;
				const currentY = (star.y + driftY) % 100;
				const opacity = interpolate(
					Math.sin(frame / 20 + star.id),
					[-1, 1],
					[0.2, star.opacity]
				);

				return (
					<div
						key={star.id}
						style={{
							position: 'absolute',
							left: `${star.x}%`,
							top: `${currentY}%`,
							width: star.size,
							height: star.size,
							backgroundColor: 'white',
							borderRadius: '50%',
							opacity: opacity,
							boxShadow: '0 0 4px white',
						}}
					/>
				);
			})}
		</div>
	);
};
