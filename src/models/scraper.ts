import puppeteer from 'puppeteer'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

import { course, courseClass } from './interfaces'

class Scraper {
    public options: { headless: boolean } | undefined
    public stuffToScrap: string
    public urls: string[] | null
    private page: puppeteer.Page | null
    private browser: puppeteer.Browser | null
    private data: courseClass[] | undefined

    constructor(stuffToScrape: string) {
        this.options = { headless: false }
        this.stuffToScrap = stuffToScrape
        this.urls = null
        this.page = null
        this.browser = null
    }

    private async launch(): Promise<void> {
        const browser = await puppeteer.launch(this.options)
        const page = await browser.newPage()
        this.page = page
        this.browser = browser
    }

    async getCourses(): Promise<void> {
        let data = ''
        if (existsSync('data/courses.json')) {
            console.log('reading courses.json')
            data = readFileSync('data/courses.json', 'utf-8')
        } else {
            const coursesUrl = 'https://joaopessoa.ifpb.edu.br/horario/curso'
            console.log('proceding to scrape hifpb for courses data')
            console.log('scraping -> ', coursesUrl)
            await this.launch()
            await this.page?.goto(coursesUrl)
            await this.page?.waitForSelector('#custom-tabs-four-tabContent')

            async function delay(time: number): Promise<void> {
                return await new Promise(function (resolve) {
                    setTimeout(resolve, time)
                })
            }

            console.log('aguardando clicar na tab')
            await this.page?.click('#custo-tab-4-tab')
            await delay(1000)

            await this.page?.click('#custo-tab-4 span.page-size')
            await this.page?.click('#custo-tab-4 div.dropdown-menu > a:nth-child(2)')

            const data = await this.page?.evaluate(() => {
                const courses: course[] = []
                const tabs = document.querySelector('#custom-tabs-four-tabContent')
                const links = Array.from(tabs?.querySelectorAll('tr td a') as NodeListOf<HTMLAnchorElement>)
                const urls = links.map((a) => a.href)
                const names = links.map((a) => a.innerText)
                const abreviatonsRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(2)') as NodeListOf<HTMLTableDataCellElement>)
                const abreviations = abreviatonsRaw.map((td) => td.innerText)
                urls.forEach((url, index) => {
                    courses.push({
                        name: names[index],
                        abreviation: abreviations[index],
                        url
                    })
                })
                return courses
            })
            this.writeCoursesJson(data as course[])
            await this.getCourses()
        }
        const urls = JSON.parse(data).map((course: { url: string }) => course.url) as string[] // urls = JSON.parse(data).map((course: course) => course.url)
        this.setUrls(urls)
        await this.scrap()
    }

    async singleScrap(url: string): Promise<void> {
        this.page === null && (await this.launch())
        await this.page?.goto(url)
        await this.page?.waitForSelector('.tab-pane')
        this.stuffToScrap === 'course' && (await this.courseClassScrap())
        this.writeJson(this.data as courseClass[])
    }

    private async courseClassScrap(): Promise<void> {
        const data = await this.page?.evaluate(() => {
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
        this.data = data
    }

    async test(): Promise<void> {
        // const btn = document.querySelector('.dropdown-toggle') as HTMLButtonElement
        this.page === null && (await this.launch())
        await this.page?.goto('https://joaopessoa.ifpb.edu.br/horario/curso')
        await this.page?.waitForSelector('#custom-tabs-four-tabContent')
        async function delay(time: number): Promise<void> {
            return await new Promise(function (resolve) {
                setTimeout(resolve, time)
            })
        }

        await this.page?.click('#custo-tab-4-tab')
        console.log('aguardando clicar na tab')
        await delay(1000)
        console.log('foi')
        await this.page?.click('#custo-tab-4 span.page-size')
        await this.page?.click('#custo-tab-4 div.dropdown-menu > a:nth-child(2)')
        // console.log('aguardando clicar no botao')
        // await delay(2000)
        // console.log('foi')

        const data = await this.page?.evaluate(() => {
            const trs = document.querySelectorAll('#custom-tabs-four-tabContent #table4 tbody tr')
            const cursoss = Array.from(trs).length
            return cursoss
        })
        console.log(data)
    }

    public async scrap(): Promise<void> {
        if (this.urls == null) {
            await this.getCourses()
        } else {
            for (const [i, url] of this.urls.entries()) {
                console.log(`Scraping -> ${url}`)
                console.log(`Progress -> ${i + 1}/${this.urls.length}`)
                await this.singleScrap(url)
            }
        }
        await this.browser?.close()
    }

    private writeCoursesJson(data: course[]): void {
        if (!existsSync('data')) {
            mkdirSync('data')
        }
        const fileName = 'data/COURSES.json'
        writeFileSync(fileName, JSON.stringify(data, null, 2))
        // console.log(data)
    }

    private writeJson(data: courseClass[]): void {
        const courseName = data[0].course.split(' ').join('_')
        // if (!existsSync(`data/${courseName}`)) {
        //     mkdirSync(`data/${courseName}`)
        // }
        const fileName = `data/${courseName}CLASSES.json`
        writeFileSync(fileName, JSON.stringify(data, null, 2))
        // console.log(data)
    }

    setStuffToScrap(newStuffToScrap: string): void {
        this.stuffToScrap = newStuffToScrap
    }

    setUrls(newUrls: string[]): void {
        this.urls = newUrls
    }
}

export { Scraper as default }
