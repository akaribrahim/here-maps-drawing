import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import HereMapContainer from '../components/HereMapContainer';
import { hereApiKey } from './credentials';

export default {
  title: 'HereMaps/HereMapContainer',
  component: HereMapContainer
} as ComponentMeta<typeof HereMapContainer>;

const Template: ComponentStory<typeof HereMapContainer> = (args) => <HereMapContainer {...args} />;

export const DefaultMap = Template.bind({});
DefaultMap.args = {
  apiKey: hereApiKey
};

export const EventsUiDisabled = Template.bind({});
EventsUiDisabled.args = {
  apiKey: hereApiKey,
  useEvents: false,
  useUi: false
};

export const ContainerStyle = Template.bind({});
ContainerStyle.args = {
  apiKey: hereApiKey,
  containerStyles: { height: 200 }
};
