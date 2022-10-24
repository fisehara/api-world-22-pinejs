import type { ConfigLoader } from '@balena/pinejs';

const matchesActor = 'actor eq @__ACTOR_ID';
const matchesUser = `user/any(u:u/${matchesActor})`;

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
				`university.user.read?${matchesActor}`
				`university.student.read?${matchesUser}`,
				`university.student.create`,
				`university.student.update?${matchesUser}`,
			],
		},
		{
			username: 'admin',
			password: 'admin',
			permissions: ['resource.all'],
		},
	],
} as ConfigLoader.Config;
