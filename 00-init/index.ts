import { Server } from "http";
import axios from "axios";
import express from 'express';
import * as pine from '@balena/pinejs';
import { cleanInit } from "../lib/pine-init";

// namespacing axios to be the http client.
const httpClient = axios;

const PORT = 1337
const HOST = `http://localhost:${PORT}`

const initConfig = {
    // specify the model by name, apiroot name and the modelFile (SBVR file)
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
}




async function initPine() {
    // create an express app for pinejs to use it.
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use('/ping', (req: express.Request, res: express.Response) => {
        res.status(200).send("pong");
    });

    let server: Server | undefined;

    try {
        await cleanInit(true); // true: delete DB
        await pine.init(app, initConfig);
        await new Promise((resolve) => {
            server = app.listen(PORT, () => {
                resolve('server started');
            });
        });
        return server
    } catch (e) {
        console.log(`pineInit ${e}`);
    }
}

async function deInitPine(pineInstance?: Server) {
    pineInstance?.close((err: any) => {
        process.exit(err ? 1 : 0)
    });
}

async function pong() {
    let response = await httpClient.get(`${HOST}/ping`);
    console.log(`Pinged pine: ${JSON.stringify(response.data, null, 2)}`);
}

async function createSubject() {
    // create subject physics with credit
    let response = await httpClient.post(`${HOST}/university/subject`, { name: "physics", credit: 5 })
    console.log(`create subject physics with credit: ${JSON.stringify(response.data, null, 2)}`);
    // create subject biology without credit (null)
    response = await httpClient.post(`${HOST}/university/subject`, { name: "biology" })
    console.log(`create subject biology without credit (null): ${JSON.stringify(response.data, null, 2)}`);
}

async function getSubject() {
    let response = await httpClient.get(`${HOST}/university/subject`);
    console.log(`get all subjects: ${JSON.stringify(response.data, null, 2)}`);
}


async function createCampus() {
    // create a faculty for quantum physics
    let response = await httpClient.post(`${HOST}/university/campus`, { name: "Faculty of Quantum Physics" })
    console.log(`create a faculty for quantum physics: ${JSON.stringify(response.data, null, 2)}`);
    // create a faculty for oceanography
    response = await httpClient.post(`${HOST}/university/campus`, { name: "Faculty of Oceanography" })
    console.log(`create a faculty for oceanography: ${JSON.stringify(response.data, null, 2)}`);
}

async function getAllCampuses() {
    let response = await httpClient.get(`${HOST}/university/campus`);
    console.log(`get all campuses: ${JSON.stringify(response.data, null, 2)}`);
}

async function run() {
    let pineInstance = await initPine();
    await pong();
    await createSubject();
    await getSubject();
    await createCampus();
    await getAllCampuses();
    await deInitPine(pineInstance);
}

run();
