import type * as Express from 'express';
import { checkPassword, PermissionReq } from "@balena/pinejs/out/sbvr-api/permissions";

export const resolveBasicAuthHeader = async (
	req: Express.Request,
	expectedScheme = 'Basic',
): Promise<PermissionReq['user']> => {
	const auth = req.header('Authorization');
	if (!auth) {
		return;
	}

	const parts = auth.split(' ');
	if (parts.length !== 2) {
		return;
	}

	const [scheme, basicAuthContentBase64] = parts;
	if (scheme.toLowerCase() !== expectedScheme.toLowerCase()) {
		return;
	}

	const basicAuthContent = Buffer.from(basicAuthContentBase64, 'base64')
		.toString()
		.trim();
	const [username, password] = basicAuthContent.split(';');
	return checkPassword(username, password);
};

export const basicUserPasswordAuthorizationMiddleware = (
	expectedScheme = 'Basic',
) => {
	expectedScheme = expectedScheme.toLowerCase();
	return async (
		req: Express.Request,
		_res?: Express.Response,
		next?: Express.NextFunction,
	): Promise<void> => {
		try {
			const user = await resolveBasicAuthHeader(req, expectedScheme);
			if (user) {
				req.user = user;
			}
		} finally {
			next?.();
		}
	};
};