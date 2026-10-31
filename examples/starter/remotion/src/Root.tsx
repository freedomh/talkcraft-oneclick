import React from 'react';import {Composition} from 'remotion';import {Main} from './Main';
export const Root=()=> <Composition id="Main" component={Main} width={1080} height={1920} fps={30} durationInFrames={120}/>;
