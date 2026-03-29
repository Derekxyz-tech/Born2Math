import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SpaceBackground} from './components/SpaceBackground';
import {RankText} from './components/RankText';

export const RankUp: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Timing checkpoints (Frames)
	const startTransition = 240; // 8s
	const climax = 300; // 10s
	const celebrationStart = 330; // 11s

	// Animations
	const entryScale = spring({
		frame,
		fps,
		config: {damping: 10, stiffness: 40},
	});

	const transitionFlash = interpolate(
		frame,
		[startTransition, climax, celebrationStart],
		[0, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	const eOpacity = interpolate(
		frame,
		[startTransition, climax],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	const dOpacity = interpolate(
		frame,
		[climax, celebrationStart],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	const rumble = frame >= startTransition && frame < climax
		? Math.random() * 10 - 5
		: 0;

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<SpaceBackground />
			
			{/* Rank E Sequence */}
			{frame < climax && (
				<RankText 
					rank="E" 
					color="#E53E3E" 
					opacity={eOpacity} 
					scale={entryScale + (frame > startTransition ? (frame - startTransition) * 0.01 : 0)} 
				/>
			)}

			{/* Rank D Sequence */}
			{frame >= climax && (
				<RankText 
					rank="D" 
					color="#3182CE" 
					opacity={dOpacity} 
					scale={1 + (frame - climax) * 0.005} 
				/>
			)}

			{/* Transition Flash Overlay */}
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					opacity: transitionFlash,
					pointerEvents: 'none',
				}}
			/>

			<div style={{
				position: 'absolute',
				bottom: 100,
				width: '100%',
				textAlign: 'center',
				color: 'white',
				fontSize: 80,
				fontWeight: 'bold',
				fontFamily: 'sans-serif',
				opacity: dOpacity,
				letterSpacing: 20,
				textShadow: '0 0 20px #3182CE'
			}}>
				RANK UP
			</div>
		</AbsoluteFill>
	);
};
