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
			permissions: [
				'university.subject.read',
				'university.campus.read'
			],
		},
		{
			username: 'student',
			password: 'student',
			permissions: [
				'university.student.read',
				'university.student.create',
				'university.student.update',
			],
		},
		{
			username: 'admin',
			password: 'admin',
			permissions: ['resource.all'],
		},
	],
} as ConfigLoader.Config;
