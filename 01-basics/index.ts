import { Server } from "http";
import axios from "axios";
import express from 'express';
import { init } from "../lib/pine-init";
import { faker } from "@faker-js/faker";
// namespacing axios to be the http client.
const httpClient = axios;

const PORT = 1337
const HOST = `http://localhost:${PORT}`

async function initPine(): Promise<Server | undefined> {

    const app = express();
    // load the config file containing the sbvr path
    const initConfig = await import("./config");
    return await init(
        initConfig.default,
        app,
        PORT,
        true,
    );
}

async function deInitPine(pineInstance?: Server) {
    pineInstance?.close((err: any) => {
        process.exit(err ? 1 : 0)
    });
}

// create campuses and subjects
const campuses = [
    { campusId: undefined, subjectId: undefined, name: "Faculty of Quantum Physics", subject: "physics" },
    { campusId: undefined, subjectId: undefined, name: "Department of Theoretical Physics", subject: "physics" },
    { campusId: undefined, subjectId: undefined, name: "Department of Linguistics and Philosophy", subject: "linguistics" },
    { campusId: undefined, subjectId: undefined, name: "Faculty of Natural Language Processing", subject: "linguistics" },
    { campusId: undefined, subjectId: undefined, name: "Faculty of Oceanography", subject: "biology" },
    { campusId: undefined, subjectId: undefined, name: "Department of Plant Biology, Ecology, and Evolution", subject: "biology" }
]

async function createCampusesAndStudents() {
    // create subjects and campuses
    for (const campus of campuses) {
        // try if the subject already exists, otherwise create it.
        let response = await httpClient.get(`${HOST}/university/subject?$filter=name eq '${campus.subject}'`)
        campus["subjectId"] = response?.data?.d?.[0]?.id

        if (!campus["subjectId"]) {
            response = await httpClient.post(`${HOST}/university/subject`, { name: campus.subject })
            campus["subjectId"] = response?.data?.id
        }

        // try if the subject already exists, otherwise create it.
        response = await httpClient.get(`${HOST}/university/campus?$filter=name eq '${campus.name}'`)
        campus["campusId"] = response?.data?.d?.[0]?.id

        if (!campus["campusId"]) {
            response = await httpClient.post(`${HOST}/university/campus`, { name: campus.name })
            campus["campusId"] = response?.data?.id

        }

        await httpClient.post(`${HOST}/university/campus__offers__subject`, { campus: campus["campusId"], offers__subject: campus["subjectId"] })
    }

}


const createStudent = async (name: string, last_name: string, campusId?: number, subjectId?: number): Promise<number | undefined> => {
    let response = await httpClient.post(`${HOST}/university/student`, { name: name, last_name: last_name })
    let studentId = response?.data?.id

    if (subjectId) {
        await httpClient.post(`${HOST}/university/student__studies__subject`, { student: studentId, studies__subject: subjectId })
    }

    if (campusId) {
        await httpClient.post(`${HOST}/university/student__is_member_of__campus`, { student: studentId, is_member_of__campus: 1 })
        return studentId;
    }
}

async function createStudentsExample() {
    // create 50 students with random campus and subject
    for (let i = 0; i < 50; i++) {
        const campusIdx = faker.datatype.number(campuses.length - 1)
        const campus = campuses[campusIdx];
        await createStudent(faker.name.firstName(), faker.name.lastName(), campus.campusId, campus.subjectId);
    }

    createStudent("Grace", "Hopper");
    createStudent("Grace", "Jones");

}

async function basicStudentExample() {
    let response;
    // create one student Grace Hopper
    response = await httpClient.post(`${HOST}/university/student`,
        { name: "Grace", last_name: "Hopper" })

    let studentId = response?.data?.id

    // update student from Grace Hopper to Grace Jones
    await httpClient.patch(`${HOST}/university/student(${studentId})`, { last_name: "Jones" })
    // get student by id
    await httpClient.get(`${HOST}/university/student(1)`)
    // delete student by id
    await httpClient.delete(`${HOST}/university/student(1)`)

    // get student by studentId - should be empty now
    response = await httpClient.get(`${HOST}/university/student(${studentId})`)
    console.log(`get student by ${studentId} - should be empty now : ${JSON.stringify(response.data, null, 2)}`);
}

async function extendedStudentExamples() {
    // count all students = 52
    let response = await httpClient.get(`${HOST}/university/student/$count`)
    console.log(`count all students ${JSON.stringify(response.data, null, 2)}`);

    // get top 5 students
    response = await httpClient.get(`${HOST}/university/student?$top=5`)
    console.log(`get top 5 students ${JSON.stringify(response.data, null, 2)}`);

    // get skip 10 students top 5 students
    response = await httpClient.get(`${HOST}/university/student?$skip=10&$top=5`)
    console.log(`get skip 10 students top 5 students ${JSON.stringify(response.data, null, 2)}`);

    // get top 5 students ordered by name ascending
    response = await httpClient.get(`${HOST}/university/student?$orderby=name asc&$top=5`)
    console.log(`get top 5 students ordered by name ascending${JSON.stringify(response.data, null, 2)}`);

    // get top 5 students ordered by name descending
    response = await httpClient.get(`${HOST}/university/student?$orderby=name desc&$top=5`)
    console.log(`get top 5 students ordered by name descending ${JSON.stringify(response.data, null, 2)}`);

    // get top 5 students after skip 10 ordered by name ascending
    response = await httpClient.get(`${HOST}/university/student?$orderby=name asc&$top=5&$skip=10`)
    console.log(`get top 5 students after skip 10 ordered by name ascending ${JSON.stringify(response.data, null, 2)}`);

    // get student by id 31
    response = await httpClient.get(`${HOST}/university/student(31)`)
    console.log(`get student by id 31 ${JSON.stringify(response.data, null, 2)}`);

    // get students which name starts with A
    response = await httpClient.get(`${HOST}/university/student?$filter=startswith(name,'A')`)
    console.log(`get students which name starts with A ${JSON.stringify(response.data, null, 2)}`);

    // get students which id > 35 and < 45
    response = await httpClient.get(`${HOST}/university/student?$filter=id ge 35 and id le 45`)
    console.log(`get students which id > 35 and < 45 ${JSON.stringify(response.data, null, 2)}`);

    // get student which name is equal Grace
    response = await httpClient.get(`${HOST}/university/student?$filter=name eq 'Grace'`)
    console.log(`get student which name is equal Grace ${JSON.stringify(response.data, null, 2)}`);

    // get student which name is equal Grace and last_name is equal Hopper
    response = await httpClient.get(`${HOST}/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'`)
    console.log(`get student which name is equal Grace and last_name is equal Hopper${JSON.stringify(response.data, null, 2)}`);
}

async function filteredStudentExample() {
    // create one student with name and last_name
    let response = await httpClient.post(`${HOST}/university/student`, { name: "Grace", last_name: "Hopper" })
    console.log(`create one student with name and last_name: ${JSON.stringify(response.data, null, 2)}`);

    // get student which name is equal Grace and last_name is equal Hopper
    response = await httpClient.get(`${HOST}/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'`)
    console.log(`get student which name is equal Grace and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);

    // patch students which name is equal Grace and last_name is equal Hopper
    response = await httpClient.patch(`${HOST}/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'`, { name: "Gracy" })
    console.log(`patch students which name is equal Grace and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);

    // get student which name is equal Gracy and last_name is equal Hopper
    response = await httpClient.get(`${HOST}/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'`)
    console.log(`get student which name is equal Gracy and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);

    // delete students which name is equal Gracy and last_name is equal Hopper
    response = await httpClient.delete(`${HOST}/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'`)
    console.log(`delete students which name is equal Gracy and last_name is equal Hopper`);

    // get student which name is equal Grace and last_name is equal Hopper - should be empty now
    response = await httpClient.get(`${HOST}/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'`)
    console.log(`get student which name is equal Gracy and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);
}


async function expandedDataModelStudentExample() {
    let response;

    // get student by id 31 and expand relationship is_member_of__campus with nested expand campus
    response = await httpClient.get(`${HOST}/university/student(31)?$expand=is_member_of__campus/campus`)

    console.log(`get student by id 31 and expand relationship is_member_of__campus with nested expand campus ${JSON.stringify(response.data, null, 2)}`);

    // get student by id 31 and expand relationship studies__subject with nested expand subject
    response = await httpClient.get(`${HOST}/university/student(31)?$expand=studies__subject/subject`)

    console.log(`get student by id 31 and expand relationship studies__subject with nested expand subject ${JSON.stringify(response.data, null, 2)} `);


    // get student by id 31 and expand relationship studies__subject with nested expand subject
    response = await httpClient.get(`${HOST}/university/student(31)?$expand=studies__subject/subject,is_member_of__campus/campus`)

    console.log(`get student by id 31 and expand relationship studies__subject with nested expand subject ${JSON.stringify(response.data, null, 2)} `);


    // get all students that are studying subject with name "physics"
    response = await httpClient.get(`${HOST}/university/student?$top=1&$expand=studies__subject/subject&$filter=studies__subject/subject/name eq 'physics'`)

    console.log(`get all students that are studying subject with name "physics" ${JSON.stringify(response.data, null, 2)} `);

    // get all students that are member of campus "Faculty of Quantum Physics" and expand relationship is_member_of__campus with nested expand campus
    response = await httpClient.get(`${HOST}/university/student?$top=2&$expand=is_member_of__campus/campus&$filter=is_member_of__campus/campus/name eq 'Faculty of Quantum Physics'`)
    console.log(`get all students that are member of campus "Faculty of Quantum Physics" and expand relationship is_member_of__campus with nested expand campus ${JSON.stringify(response.data, null, 2)} `);

}


async function run() {
    let pineInstance = await initPine();
    await basicStudentExample();
    await createCampusesAndStudents();
    await createStudentsExample();
    await extendedStudentExamples();
    await filteredStudentExample();
    await expandedDataModelStudentExample();
    await deInitPine(pineInstance);
}

run();
