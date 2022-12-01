import { Server } from "http";
import axios from "axios";
import express from 'express';
import { init } from "../lib/pine-init";
import { faker } from "@faker-js/faker";
import { initS3Storage } from 'ramirogm-pinejs-s3-storage';
import { getFileSize } from "../lib/get-file-size";
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');

// namespacing axios to be the http client.
const httpClient = axios;

const PORT = 1337
const HOST = `http://localhost:${PORT}`

async function initPine(): Promise<Server | undefined> {

    initS3Storage();
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
const paths = [
    path.join(__dirname, '../resources/PHY4604-Quantum-Mechanics-syllabus.pdf'),
    path.join(__dirname, '../resources/physics-101-syllabus.pdf'),
]
const campuses = [
    { campusId: undefined, subjectId: undefined, name: "Faculty of Quantum Physics", subject: "physics", syllabusDocFile: { data: fs.createReadStream(paths[0]), filename: 'PHY4604-Quantum-Mechanics-syllabus.pdf', contentType: 'application/pdf'} },
    { campusId: undefined, subjectId: undefined, name: "Department of Theoretical Physics", subject: "physics", syllabusDocFile: { data: fs.createReadStream(paths[1]), filename: 'physics-101-syllabus.pdf', contentType: 'application/pdf'} },
    { campusId: undefined, subjectId: undefined, name: "Department of Linguistics and Philosophy", subject: "linguistics" },
    { campusId: undefined, subjectId: undefined, name: "Faculty of Natural Language Processing", subject: "linguistics" },
    { campusId: undefined, subjectId: undefined, name: "Faculty of Oceanography", subject: "biology" },
    { campusId: undefined, subjectId: undefined, name: "Department of Plant Biology, Ecology, and Evolution", subject: "biology" }
]

async function createCampusesAndSubjects() {
    // create subjects and campuses
    for (const campus of campuses) {
        // try if the subject already exists, otherwise create it.
        let response = await httpClient.get(`${HOST}/university/subject?$filter=name eq '${campus.subject}'`)
        campus["subjectId"] = response?.data?.d?.[0]?.id

        if (!campus["subjectId"]) {
            if ( !campus.syllabusDocFile ) {
                response = await httpClient.post(`${HOST}/university/subject`, { name: campus.subject })
            } else {
                const form = new FormData();
                form.append('name', campus.subject, {contentType: 'text/plain'});
                form.append('syllabus_doc', campus.syllabusDocFile.data, {filename: campus.syllabusDocFile.filename, contentType: campus.syllabusDocFile.contentType});
                const formHeaders = form.getHeaders();

                response = await httpClient.post(`${HOST}/university/subject`, form, {
                    headers: {
                      ...formHeaders,
                    }});
                console.log(`subject with syllabus is ${JSON.stringify(response.data, null, 2)}`);
            }

            campus["subjectId"] = response?.data?.id
        }

        // try if the campus already exists, otherwise create it.
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
    console.log(`createStudent studentId: ${studentId}`);
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



async function basicWebResourceExample() {
    let response;
    console.log("basicWebResourceExample");
    // create one student
    let studentId = await createStudent("Elon", "Musk", 1, 1);

    response = await httpClient.get(`${HOST}/university/student(${studentId})`)
    console.log(`get student by ${studentId} : ${JSON.stringify(response.data, null, 2)}`);

    response = await httpClient.get(`${HOST}/university/student(${studentId})?$expand=studies__subject/subject`)
    console.log(`studies__subject/subject ${studentId} studies__subject/subject : ${JSON.stringify(response.data, null, 2)}`);
    const url = response.data.d[0].studies__subject[0].subject[0].syllabus_doc.href;
    console.log(`Subject syllabus URL: ${url}`);
    // Now get the file and test that is as expected
    response = await httpClient.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Accept': '*/*'
        }
    });
    
    const receivedSize = response.data.length;
    const expectedSize = getFileSize(paths[0]);
    console.log(`File size ${expectedSize} and received size ${receivedSize} ${expectedSize === receivedSize ? " match " : " **DON'T MATCH**" }`);
}


async function run() {
    let pineInstance = await initPine();
    await basicStudentExample();
    await createCampusesAndSubjects();
    await createStudentsExample();
    await extendedStudentExamples();
    await filteredStudentExample();
    await expandedDataModelStudentExample();
    await basicWebResourceExample();
    await deInitPine(pineInstance);
}

run();
