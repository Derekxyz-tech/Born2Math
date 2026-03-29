import React from 'react';
import {interpolate, useCurrentFrame, spring} from 'remotion';

interface RankTextProps {
	rank: string;
	color: string;
	opacity: number;
	scale: number;
}

export const RankText: React.FC<RankTextProps> = ({rank, color, opacity, scale}) => {
	const frame = useCurrentFrame();
	
	const glowPulse = interpolate(
		Math.sin(frame / 10),
		[-1, 1],
		[20, 50]
	);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: '600px',
				fontWeight: '900',
				color: 'white',
				fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				textShadow: `0 0 ${glowPulse}px ${color}, 0 0 ${glowPulse * 2}px ${color}`,
				opacity,
				transform: `scale(${scale})`,
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			{rank}
		</div>
	);
};
