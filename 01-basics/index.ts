import { Server } from 'http';
import axios from 'axios';
import { init } from '../lib/pine-init';
import { randomString } from '../lib/random-data-generator';

const HOST = "http://localhost:1337"

let pineInstance: Server | undefined;

async function initPine() {
    // load the config file containing the sbvr path
    const initConfig = await import('./config');
    pineInstance = await init(
        initConfig.default,
        1337,
        true,
    );
}

async function deInitPine() {
    pineInstance?.close((err: any) => {
        process.exit(err ? 1 : 0)
    });
}

async function runRequests() {
    // get ping route
    await axios.get(HOST + "/ping").then((response) => {
        console.log(`${JSON.stringify(response.data, null, 2)}`);
    })

    // write 50 students to the database
    for (let i = 0; i < 50; i++) {
        await axios.post(HOST + "/university/student", { name: randomString(16), lastname: randomString(16) }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }

    await axios.post(HOST + "/university/student", { name: "Grace", lastname: "Hopper" }).catch((err: any) => {
        console.log(`Should not error ${err}`)
    })
    await axios.post(HOST + "/university/student", { name: "Grace", lastname: "Jones" }).catch((err: any) => {
        console.log(`Should not error ${err}`)
    })

    // get all students (verbose thus commented)
    // await axios.get(HOST + "/university/student').then((response) => {
    //     console.log(`${JSON.stringify(response.data, null, 2)}`);
    // })

    // count all students = 52
    await axios.get(HOST + "/university/student/$count").then((response) => {
        console.log(`count all students ${JSON.stringify(response.data, null, 2)}`);
    })

    // get top 5 students
    await axios.get(HOST + "/university/student?$top=5").then((response) => {
        console.log(`get top 5 students ${JSON.stringify(response.data, null, 2)}`);
    })

    // get skip 10 students top 5 students
    await axios.get(HOST + "/university/student?$skip=10&$top=5").then((response) => {
        console.log(`get skip 10 students top 5 students ${JSON.stringify(response.data, null, 2)}`);
    })

    // get top 5 students ordered by name ascending
    await axios.get(HOST + "/university/student?$orderby=name asc&$top=5").then((response) => {
        console.log(`get top 5 students ordered by name ascending${JSON.stringify(response.data, null, 2)}`);
    })

    // get top 5 students ordered by name descending
    await axios.get(HOST + "/university/student?$orderby=name desc&$top=5").then((response) => {
        console.log(`get top 5 students ordered by name descending ${JSON.stringify(response.data, null, 2)}`);
    })

    // get top 5 students after skip 10 ordered by name ascending
    await axios.get(HOST + "/university/student?$orderby=name asc&$top=5&$skip=10").then((response) => {
        console.log(`get top 5 students after skip 10 ordered by name ascending ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student by id 31
    await axios.get(HOST + "/university/student(31)").then((response) => {
        console.log(`get student by id 31 ${JSON.stringify(response.data, null, 2)}`);
    })

    // get students which name starts with A
    await axios.get(HOST + "/university/student?$filter=startswith(name,'A')").then((response) => {
        console.log(`get students which name starts with A ${JSON.stringify(response.data, null, 2)}`);
    })

    // get students which id > 35 and < 45
    await axios.get(HOST + "/university/student?$filter=id ge 35 and id le 45").then((response) => {
        console.log(`get students which id > 35 and < 45 ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student which name equal Grace
    await axios.get(HOST + "/university/student?$filter=name eq 'Grace'").then((response) => {
        console.log(`get students which name starts with A ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student which name equal Grace and lastname equal Hopper
    await axios.get(HOST + "/university/student?$filter=name eq 'Grace' and lastname eq 'Hopper'").then((response) => {
        console.log(`get students which name starts with A ${JSON.stringify(response.data, null, 2)}`);
    })
}

async function run() {
    await initPine();
    await runRequests();
    await deInitPine();
}

run();