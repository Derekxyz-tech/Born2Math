import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {RankUp} from './RankUp';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="RankUp"
				component={RankUp}
				durationInFrames={600}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};

registerRoot(RemotionRoot);
