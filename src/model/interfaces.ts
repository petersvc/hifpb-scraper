interface data {
    name: string
    url: string
    abreviation: string
    unity?: string
}

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

export { courseClass, data }
