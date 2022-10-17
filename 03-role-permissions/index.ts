import { Server } from 'http';
import axios from 'axios';
import { init } from '../lib/pine-init';
import { faker } from '@faker-js/faker';

const HOST = "http://localhost:1337"

let pineInstance: Server | undefined;

const basicStudentAuthHeaderBase64 =
    Buffer.from('student;student').toString('base64');
const axiosHeaderStudentAuth = { headers: { 'Authorization': 'Basic ' + basicStudentAuthHeaderBase64 } }

const basicAdminAuthHeaderBase64 =
    Buffer.from('admin;admin').toString('base64');

const axiosHeaderAdminAuth = { headers: { 'Authorization': 'Basic ' + basicAdminAuthHeaderBase64 } }


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


    // create campuses and subjects
    const campuses = [
        { campusId: undefined, subjectId: undefined, name: 'Faculty of Quantum Physics', subject: 'physics' },
        { campusId: undefined, subjectId: undefined, name: 'Department of Theoretical Physics', subject: 'physics' },
        { campusId: undefined, subjectId: undefined, name: 'Department of Linguistics and Philosophy', subject: 'linguistics' },
        { campusId: undefined, subjectId: undefined, name: 'Faculty of Natural Language Processing', subject: 'linguistics' },
        { campusId: undefined, subjectId: undefined, name: 'Faculty of Oceanography', subject: 'biology' },
        { campusId: undefined, subjectId: undefined, name: 'Department of Plant Biology, Ecology, and Evolution', subject: 'biology' }
    ]


    // create subjects and campuses
    for (const campus of campuses) {
        // try if the subject already exists, otherwise create it.
        await axios.get(HOST + `/university/subject?$filter=name eq '${campus.subject}'`, axiosHeaderAdminAuth).then((response) => {
            campus['subjectId'] = response?.data?.d?.[0]?.id
        }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })

        if (!campus['subjectId']) {
            await axios.post(HOST + "/university/subject", { name: campus.subject }, axiosHeaderAdminAuth).then((response) => {
                campus['subjectId'] = response?.data?.id
            }).catch((err: any) => {
                console.log(`Should not error ${err}`)
            })
        }

        // try if the subject already exists, otherwise create it.
        await axios.get(HOST + `/university/campus?$filter=name eq '${campus.name}'`, axiosHeaderAdminAuth).then((response) => {
            campus['campusId'] = response?.data?.d?.[0]?.id
        })

        if (!campus['campusId']) {
            await axios.post(HOST + "/university/campus", { name: campus.name }, axiosHeaderAdminAuth).then((response) => {
                campus['campusId'] = response?.data?.id
            }).catch((err: any) => {
                console.log(`Should not error ${err}`)
            })
        }

        await axios.post(HOST + "/university/campus__offers__subject", { campus: campus['campusId'], offers__subject: campus['subjectId'] }, axiosHeaderAdminAuth).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }



    const createStudentWithRandomCampusAndSubject = async (name: string, lastname: string) => {
        let studentId;
        await axios.post(HOST + "/university/student", { name: name, lastname: lastname }, axiosHeaderAdminAuth).then((response) => {
            studentId = response?.data?.id
        }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })

        const campusIdx = faker.datatype.number(campuses.length - 1)
        const campus = campuses[campusIdx];

        await axios.post(HOST + "/university/student__studies__subject", { student: studentId, studies__subject: campus['subjectId'] }, axiosHeaderAdminAuth).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })

        await axios.post(HOST + "/university/student__is_member_of__campus", { student: studentId, is_member_of__campus: campus['subjectId'] }, axiosHeaderAdminAuth).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }


    // create 50 students
    for (let i = 0; i < 10; i++) {
        await createStudentWithRandomCampusAndSubject(faker.name.firstName(), faker.name.lastName())
    }

    createStudentWithRandomCampusAndSubject('Grace', 'Hopper');
    createStudentWithRandomCampusAndSubject('Grace', 'Jones');

    // students can get top 5 students
    await axios.get(HOST + "/university/student?$top=5", axiosHeaderStudentAuth).then((response) => {
        console.log(`students can get top 5 students ${JSON.stringify(response.data, null, 2)}`);
    })

    // guest can get all subjects
    await axios.get(HOST + "/university/subject").then((response) => {
        console.log(`guest can get all subjects ${JSON.stringify(response.data, null, 2)}`);
    })

    // guest can get all campus
    await axios.get(HOST + "/university/campus").then((response) => {
        console.log(`guest can get all campus ${JSON.stringify(response.data, null, 2)}`);
    })

    // guest can't get all student
    await axios.get(HOST + "/university/student").catch((err) => {
        console.log(`guest can't get all student ${JSON.stringify(err.message, null, 2)}`);
    })



}

async function run() {
    await initPine();
    await runRequests();
    await deInitPine();
}

run();