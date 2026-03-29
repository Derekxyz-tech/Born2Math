import React from 'react';
import {StarField} from './StarField';
import {Nebula} from './Nebula';

export const SpaceBackground: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				backgroundColor: '#050510',
				background: 'radial-gradient(circle, #0B0B2E 0%, #050510 100%)',
				overflow: 'hidden',
			}}
		>
			<StarField />
			<Nebula />
		</div>
	);
};
