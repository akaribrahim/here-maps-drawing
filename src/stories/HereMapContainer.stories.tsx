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

export const CenterAndZoom = Template.bind({});
CenterAndZoom.args = {
  apiKey: hereApiKey,
  center: { lat: 12, lng: 33 },
  zoom: 15
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

export const MapLanguage = Template.bind({});
MapLanguage.args = {
  apiKey: hereApiKey,
  mapLanguage: 'tr-TR'
};

export const Resize = Template.bind({});
Resize.args = {
  apiKey: hereApiKey,
  resizeOnWidthChange: false
};
