import React from 'react';
import {Composition} from 'remotion';
import {Edit, durationOf} from './Edit';
import {FPS} from './timeline';

export const RemotionRoot: React.FC = () => <>
  <Composition id="Dynamic" component={Edit} width={1080} height={1920} fps={FPS} durationInFrames={durationOf('dynamic')} defaultProps={{variant: 'dynamic' as const}} />
  <Composition id="Calm" component={Edit} width={1080} height={1920} fps={FPS} durationInFrames={durationOf('calm')} defaultProps={{variant: 'calm' as const}} />
  <Composition id="CalmFast" component={Edit} width={1080} height={1920} fps={FPS} durationInFrames={durationOf('calmFast')} defaultProps={{variant: 'calmFast' as const}} />
</>;
