import puppeteer from 'puppeteer'
import fs from 'fs'

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

async function main(): Promise<courseClass[]> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.goto('https://joaopessoa.ifpb.edu.br/horario/curso/4')
    await page.waitForSelector('.tab-pane') //
    const pageContent = await page.evaluate(() => {
        function getSemesterDayHour(divId: string): { semester: number; weekday: string; start: string; end: string } {
            const [semester, day, timeSlot] = divId.split('_')
            const intSemester = parseInt(semester)
            const intDay = parseInt(day)
            const intTimeSlot = parseInt(timeSlot)
            const days = {
                1: 'segunda',
                2: 'terca',
                3: 'quarta',
                4: 'quinta',
                5: 'sexta'
            }
            const timeSlots = {
                1: '07:00 - 07:50',
                2: '07:50 - 08:40',
                3: '08:40 - 09:30',
                4: '09:50 - 10:40',
                5: '10:40 - 11:30',
                6: '11:30 - 12:20',
                7: '13:00 - 13:50',
                8: '13:50 - 14:40',
                9: '14:40 - 15:30',
                10: '15:50 - 16:40',
                11: '16:40 - 17:30',
                12: '17:30 - 18:20',
                13: '18:20 - 19:10',
                14: '19:10 - 20:00',
                15: '20:00 - 20:50',
                16: '20:50 - 21:40',
                17: '21:40 - 22:30'
            }
            const [start, end] = timeSlots[intTimeSlot as keyof typeof timeSlots].split(' - ')
            return {
                semester: intSemester,
                weekday: days[intDay as keyof typeof days],
                start,
                end
            }
        }

        const courseRaw = document.querySelector('b')?.innerText as string
        const course = courseRaw.slice(2, -3)
        const courseClasses: courseClass[] = []
        const semesterElements = Array.from(document.querySelectorAll('.tab-pane div table tbody'))

        semesterElements.forEach((semester) => {
            const trs = Array.from(semester.querySelectorAll('tr'))
            trs.shift() // remove a primeira tr que é o cabeçalho
            trs.forEach((tr) => {
                const tds = Array.from(tr.querySelectorAll('td'))
                tds.shift() // remove a primeira td que é o horario (slot)
                tds.forEach((td) => {
                    const divElement = td.querySelector('div')
                    if (divElement?.childElementCount === 0) return // se não tem aula, não faz nada
                    const divId = divElement?.id as string // div id 1_5_7 = periodo 1, sexta-feira, aula (slot) 7
                    const { semester, weekday, start, end } = getSemesterDayHour(divId)
                    const className = divElement?.querySelector('span')?.innerText as string
                    const aElements = divElement?.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>
                    const aTeacherElement = Array.from(aElements).filter((a, i) => i % 2 === 0)
                    const aLocationElement = Array.from(aElements).filter((a, i) => i % 2 !== 0)
                    const teacher = aTeacherElement.map((a) => {
                        return {
                            name: a.innerText,
                            link: a.href
                        }
                    })
                    const location = aLocationElement.map((a) => {
                        return {
                            name: a.innerText,
                            link: a.href
                        }
                    })
                    courseClasses.push({
                        course,
                        semester,
                        weekday,
                        start,
                        end,
                        className,
                        teacher,
                        location
                    })
                })
            })
        })

        return courseClasses
    })
    await browser.close()
    return pageContent
}

const runMain = true
const save = true
if (runMain) {
    void main().then((data) => {
        if (save) {
            const courseName = data[0].course.split(' ').join('_')
            const fileName = `data/${courseName}.json`
            fs.writeFileSync(fileName, JSON.stringify(data, null, 2))
        }
    })
}
