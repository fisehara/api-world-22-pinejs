import express from 'express';
import { exit } from 'process';
import * as pine from '@balena/pinejs';
import { Server } from 'http';

export async function init(
	initConfig: pine.ConfigLoader.Config,
	app: express.Application,
	initPort: number,
	deleteDb: boolean = false,
) {
	let server: Server | undefined;
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	app.use('/ping', (req: express.Request, res: express.Response) => {
		res.status(200).send("pong");
	});

	try {
		await cleanInit(deleteDb);
		await pine.init(app, initConfig);
		await new Promise((resolve) => {
			server = app.listen(initPort, () => {
				resolve('server started');
			});
		});
		return server
	} catch (e) {
		console.log(`pineInit ${e}`);
		exit(1);
	}
}

export async function cleanInit(deleteDb: boolean = false) {
	if (!deleteDb) {
		return;
	}

	try {
		const initDbOptions = {
			engine:
				process.env.DATABASE_URL?.slice(
					0,
					process.env.DATABASE_URL?.indexOf(':'),
				) || 'postgres',
			params: process.env.DATABASE_URL || 'localhost',
		};
		const initDb = pine.dbModule.connect(initDbOptions);
		await initDb.executeSql(
			'DROP SCHEMA "public" CASCADE; CREATE SCHEMA "public";',
		);
		console.info(`Postgres database dropped`);
	} catch (e) {
		console.error(`Error during dropping postgres database: ${e}`);
	}
}
