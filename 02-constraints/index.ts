import { Server } from "http";
import axios from "axios";
import express from 'express';
import { init } from "../lib/pine-init";
import { faker } from "@faker-js/faker";
// namespacing axios to be the http client.
const httpClient = axios;

const PORT = 1337
const HOST = `http://localhost:${PORT}`


async function initPine() {
    const app = express();
    // load the config file containing the sbvr path
    const initConfig = await import("./config");
    return await init(
        initConfig.default,
        app,
        1337,
        true,
    );
}

async function deInitPine(pineInstance?: Server) {
    pineInstance?.close((err: any) => {
        process.exit(err ? 1 : 0)
    });
}

async function createSubject() {
    // create subject physics with credit
    let response = await httpClient.post(`${HOST}/university/subject`, { name: "physics", credit: 5 })
    console.log(`create subject physics with credit: ${JSON.stringify(response.data, null, 2)}`);
    // create subject biology without credit (null)
    response = await httpClient.post(`${HOST}/university/subject`, { name: "biology" })
    console.log(`create subject biology without credit (null): ${JSON.stringify(response.data, null, 2)}`);
}

async function createCampus() {
    // create a faculty for quantum physics
    let response = await httpClient.post(`${HOST}/university/campus`, { name: "Faculty of Quantum Physics" })
    console.log(`create a faculty for quantum physics: ${JSON.stringify(response.data, null, 2)}`);
    // create a faculty for oceanography
    response = await httpClient.post(`${HOST}/university/campus`, { name: "Faculty of Oceanography" })
    console.log(`create a faculty for oceanography: ${JSON.stringify(response.data, null, 2)}`);
    // create a faculty for mathematics
    response = await httpClient.post(`${HOST}/university/campus`, { name: "Faculty of Mathematics" })
    console.log(`create a faculty for mathematics: ${JSON.stringify(response.data, null, 2)}`);
}


async function linkSubjectAndCampus() {
    await httpClient.post(`${HOST}/university/campus__offers__subject`, { campus: 1, offers__subject: 1 })
    await httpClient.post(`${HOST}/university/campus__offers__subject`, { campus: 2, offers__subject: 2 })
}


async function createStudentAndLink() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Grace", last_name: "Hopper" })

    let studentId = response?.data?.id

    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })
    await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 1 })
}

async function createStudentAndLinkAndFailOnPatch() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Grace", last_name: "Hopper" })

    let studentId = response?.data?.id

    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })
    let respond = await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 1 })

    let entryId = respond?.data?.id

    try {
        await httpClient.patch(`${HOST}/university/student__is_member_of__campus(${entryId})`, { student: studentId, is_member_of__campus: 2 })
    } catch (err: any) {
        // expected to error as subject and campus mismatch on the patch.
        console.log(`createStudentAndLinkAndFailOnPatch expected to fail on student__is_member_of__campus patch: ${JSON.stringify(err.response.data, null, 2)}`);
    }

    try {
        await httpClient.patch(`${HOST}/university/student__studies__subject(${entryId})`, { student: studentId, studies__subject: 2 })
    } catch (err: any) {
        // expected to error as subject and campus mismatch on the patch.
        console.log(`createStudentAndLinkAndFailOnPatch expected to fail on student__studies__subject patch: ${JSON.stringify(err.response.data, null, 2)}`);
    }
}

async function createStudentAndLinkAndFailOnDeleteOfSubjectLink() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Grace", last_name: "Hopper" })

    let studentId = response?.data?.id

    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })
    let respond = await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 1 })

    let entryId = respond?.data?.id

    try {
        await httpClient.delete(`${HOST}/university/campus__offers__subject(1)`)
    } catch (err: any) {
        // expected to error as subject and campus mismatch on the patch.
        console.log(`createStudentAndLinkAndFailOnDeleteOfSubjectLink expected to fail on delete: ${JSON.stringify(err.response.data, null, 2)}`);
    }
}

async function deleteSubjectShouldFail() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Grace", last_name: "Hopper" })

    let studentId = response?.data?.id

    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })
    let respond = await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 1 })

    let entryId = respond?.data?.id

    try {
        await httpClient.delete(`${HOST}/university/subject(1)`)
    } catch (err: any) {
        // expected to error as subject and campus mismatch on the patch.
        console.log(`deleteSubjectShouldFail expected to fail on delete: ${JSON.stringify(err.response.data, null, 2)}`);
    }
}

async function failWithMismatchCampusSubjectCombination() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Ada", last_name: "Lovelance" })
    let studentId = response?.data?.id


    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })

    try {
        await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 2 })
    } catch (err: any) {
        // expected to error as subject and campus mismatch
        console.log(`failWithMismatchCampusSubjectCombination expected to fail: ${JSON.stringify(err.response.data, null, 2)}`);
    }
}

async function failWithMissingSubjectCampus() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Tim", last_name: "Tom" })
    let studentId = response?.data?.id

    try {
        await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 2 })
    } catch (err: any) {
        console.log(`failWithMissingSubjectCampus expected to fail: ${JSON.stringify(err.response.data, null, 2)}`);
        // expected to fail as the subject for the student is not set.
    }
}

async function failWithCampusMissingSubject() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Conrad", last_name: "Zuse" })
    let studentId = response?.data?.id

    await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: 1 })

    try {
        await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 3 })
    } catch (err: any) {
        console.log(`expected to fail failWithCampusMissingSubject: ${JSON.stringify(err.response.data, null, 2)}`);
        // expected to fail as the campus has not subject assigned. Students are not allowed to study on a campus
        // not offering a subject.
    }
}



async function createStudentWithWrongCredit() {
    try {
        await httpClient.post(`${HOST}/university/student`,
            { name: "Grace", last_name: "Hopper", earns__semester_credit: 17 })
    } catch (err: any) {
        console.log(`expected to fail with to big earns__semester_credit: ${JSON.stringify(err.response.data, null, 2)}`);
    }

    try {
        await httpClient.post(`${HOST}/university/student`,
            { name: "Grace", last_name: "Hopper", earns__semester_credit: 0 })
    } catch (err: any) {
        console.log(`expected to fail with to small earns__semester_credit: ${JSON.stringify(err.response.data, null, 2)}`);
    }

    try {
        await httpClient.post(`${HOST}/university/student`,
            { name: "Grace", last_name: "Hopper", earns__semester_credit: -1})
    } catch (err: any) {
        console.log(`expected to fail with to small earns__semester_credit: ${JSON.stringify(err.response.data, null, 2)}`);
    }

}



async function run() {
    let pineInstance = await initPine();
    await createSubject();
    await createCampus();
    await linkSubjectAndCampus();
    await createStudentAndLink();
    await createStudentAndLinkAndFailOnPatch();
    await createStudentAndLinkAndFailOnDeleteOfSubjectLink();
    await failWithMismatchCampusSubjectCombination();
    await deleteSubjectShouldFail();
    await failWithMissingSubjectCampus();
    await failWithCampusMissingSubject();
    await createStudentWithWrongCredit();
    await deInitPine(pineInstance);
}

run();
