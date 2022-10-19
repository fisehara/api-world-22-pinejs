import { Server } from 'http';
import axios from 'axios';
import { init } from '../lib/pine-init';
import { faker } from '@faker-js/faker';
import { fileURLToPath } from 'url';

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

async function pingServer() {
    // get ping route
    await axios.get(HOST + "/ping").then((response) => {
        console.log(`${JSON.stringify(response.data, null, 2)}`);
    })
}


// create campuses and subjects
const campuses = [
    { campusId: undefined, subjectId: undefined, name: 'Faculty of Quantum Physics', subject: 'physics' },
    { campusId: undefined, subjectId: undefined, name: 'Department of Theoretical Physics', subject: 'physics' },
    { campusId: undefined, subjectId: undefined, name: 'Department of Linguistics and Philosophy', subject: 'linguistics' },
    { campusId: undefined, subjectId: undefined, name: 'Faculty of Natural Language Processing', subject: 'linguistics' },
    { campusId: undefined, subjectId: undefined, name: 'Faculty of Oceanography', subject: 'biology' },
    { campusId: undefined, subjectId: undefined, name: 'Department of Plant Biology, Ecology, and Evolution', subject: 'biology' }
]

async function createCampusesAndStudents() {
    // create subjects and campuses
    for (const campus of campuses) {
        // try if the subject already exists, otherwise create it.
        await axios.get(HOST + `/university/subject?$filter=name eq '${campus.subject}'`).then((response) => {
            campus['subjectId'] = response?.data?.d?.[0]?.id
        }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })

        if (!campus['subjectId']) {
            await axios.post(HOST + "/university/subject", { name: campus.subject }).then((response) => {
                campus['subjectId'] = response?.data?.id
            }).catch((err: any) => {
                console.log(`Should not error ${err}`)
            })
        }

        // try if the subject already exists, otherwise create it.
        await axios.get(HOST + `/university/campus?$filter=name eq '${campus.name}'`).then((response) => {
            campus['campusId'] = response?.data?.d?.[0]?.id
        })

        if (!campus['campusId']) {
            await axios.post(HOST + "/university/campus", { name: campus.name }).then((response) => {
                campus['campusId'] = response?.data?.id
            }).catch((err: any) => {
                console.log(`Should not error ${err}`)
            })
        }

        await axios.post(HOST + "/university/campus__offers__subject", { campus: campus['campusId'], offers__subject: campus['subjectId'] }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }

}


const createStudent = async (name: string, last_name: string, campusId?: number, subjectId?: number): Promise<number | undefined> => {
    let studentId;
    await axios.post(HOST + "/university/student", { name: name, last_name: last_name }).then((response) => {
        studentId = response?.data?.id
    }).catch((err: any) => {
        console.log(`Should not error ${err}`)
    })

    if (subjectId) {
        await axios.post(HOST + "/university/student__studies__subject", { student: studentId, studies__subject: subjectId }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }

    if (campusId) {
        await axios.post(HOST + "/university/student__is_member_of__campus", { student: studentId, is_member_of__campus: campusId }).catch((err: any) => {
            console.log(`Should not error ${err}`)
        })
    }

    return studentId;
}

async function createStudentsExample() {
    // create 50 students with random campus and subject
    for (let i = 0; i < 50; i++) {
        const campusIdx = faker.datatype.number(campuses.length - 1)
        const campus = campuses[campusIdx];
        await createStudent(faker.name.firstName(), faker.name.lastName(), campus.campusId, campus.subjectId);
    }

    createStudent('Grace', 'Hopper');
    createStudent('Grace', 'Jones');

}

async function basicStudentExample() {

    let studentId: number = 0;
    // create one student with name and last_name, get unique studentId
    await axios.post(HOST + "/university/student",
        { name: "Grace", last_name: "Hopper" }).then((response) => {
            studentId = response?.data?.id
        })
    // patch student last_name by studentId 
    await axios.patch(HOST + `/university/student(${studentId})`, { last_name: 'Jones' })
    // get student by studentId
    await axios.get(HOST + `/university/student(${studentId})`).then((response) => {
        console.log(`get student by id ${studentId}: ${JSON.stringify(response.data, null, 2)}`);
    })
    // delete student by id
    await axios.delete(HOST + `/university/student(${studentId})`).then((response) => {
        console.log(`delete student by id ${studentId}`);
    })

    // get student by studentId - should be empty now
    await axios.get(HOST + `/university/student(${studentId})`).then((response) => {
        console.log(`get student by ${studentId} - should be empty now : ${JSON.stringify(response.data, null, 2)}`);
    })
}

async function extendedStudentExamples() {
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

    // get student which name is equal Grace
    await axios.get(HOST + "/university/student?$filter=name eq 'Grace'").then((response) => {
        console.log(`get student which name is equal Grace ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student which name is equal Grace and last_name is equal Hopper
    await axios.get(HOST + "/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'").then((response) => {
        console.log(`get student which name is equal Grace and last_name is equal Hopper${JSON.stringify(response.data, null, 2)}`);
    })
}

async function filteredStudentExample() {

    // create one student with name and last_name
    await axios.post(HOST + "/university/student", { name: "Grace", last_name: "Hopper" }).then((response) => {
        console.log(`create one student with name and last_name: ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student which name is equal Grace and last_name is equal Hopper
    await axios.get(HOST + "/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'").then((response) => {
        console.log(`get student which name is equal Grace and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);
    })

    // patch students which name is equal Grace and last_name is equal Hopper
    await axios.patch(HOST + "/university/student?$filter=name eq 'Grace' and last_name eq 'Hopper'", { name: 'Gracy' }).then((response) => {
        console.log(`patch students which name is equal Grace and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student which name is equal Gracy and last_name is equal Hopper
    await axios.get(HOST + "/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'").then((response) => {
        console.log(`get student which name is equal Gracy and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);
    })

    // delete students which name is equal Gracy and last_name is equal Hopper
    await axios.delete(HOST + "/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'").then((response) => {
        console.log(`delete students which name is equal Gracy and last_name is equal Hopper`);
    })

    // get student which name is equal Grace and last_name is equal Hopper - should be empty now
    await axios.get(HOST + "/university/student?$filter=name eq 'Gracy' and last_name eq 'Hopper'").then((response) => {
        console.log(`get student which name is equal Gracy and last_name is equal Hopper: ${JSON.stringify(response.data, null, 2)}`);
    })

}


async function expandedDataModelStudentExample() {

    // get student by id 31 and expand relationship is_member_of__campus with nested expand campus
    await axios.get(HOST + "/university/student(31)?$expand=is_member_of__campus/campus").then((response) => {
        console.log(`get student by id 31 and expand relationship is_member_of__campus with nested expand campus ${JSON.stringify(response.data, null, 2)}`);
    })

    // get student by id 31 and expand relationship studies__subject with nested expand subject
    await axios.get(HOST + "/university/student(31)?$expand=studies__subject/subject").then((response) => {
        console.log(`get student by id 31 and expand relationship studies__subject with nested expand subject ${JSON.stringify(response.data, null, 2)}`);
    })

    // get all students that are studying subject with name 'physics'
    await axios.get(HOST + "/university/student?$expand=studies__subject/subject&$filter=studies__subject/subject/name eq 'physics'").then((response) => {
        console.log(`get all students that are studying subject with name 'physics' ${JSON.stringify(response.data, null, 2)}`);
    })

    // get all students that are member of campus 'Faculty of Quantum Physics' and expand relationship is_member_of__campus with nested expand campus
    await axios.get(HOST + "/university/student?$expand=is_member_of__campus/campus&$filter=is_member_of__campus/campus/name eq 'Faculty of Quantum Physics'").then((response) => {
        console.log(`get all students that are member of campus 'Faculty of Quantum Physics' and expand relationship is_member_of__campus with nested expand campus ${JSON.stringify(response.data, null, 2)}`);
    })
}



async function run() {
    await initPine();
    await pingServer();
    await createCampusesAndStudents();
    await createStudentsExample();
    await basicStudentExample();
    await extendedStudentExamples();
    await filteredStudentExample();
    await expandedDataModelStudentExample();
    await deInitPine();
}

run();