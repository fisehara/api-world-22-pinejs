import type { ConfigLoader } from '@balena/pinejs';
export default {
	models: [
		{
			modelName: 'university',
			modelFile: __dirname + '/university.sbvr',
			apiRoot: 'university',
		},
	],
	users: [
		{
			username: 'guest',
			password: ' ',
			permissions: ['resource.all'],
		},
	],
} as ConfigLoader.Config;
