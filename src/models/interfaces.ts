interface courseClass {
    course: string
    semester: number
    weekday: string
    start: string
    end: string
    className: string
    teacher: Array<{
        name: string
        link: string
    }>
    location: Array<{
        name: string
        link: string
    }>
}

interface course {
    name: string
    url: string
    abreviation: string
}

interface teacher {
    name: string
    url: string
    abreviation: string
    unity: string
}

interface classRoom {
    name: string
    url: string
    abreviation: string
}

interface lab {
    name: string
    url: string
    abreviation: string
}

export { course, courseClass, teacher, classRoom, lab }
