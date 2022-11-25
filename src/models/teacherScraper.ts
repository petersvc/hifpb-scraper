import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { teacher } from './interfaces'
import type { Page, Browser } from 'puppeteer'

export default class TeacherScraper {
    private readonly baseUrl: string
    private readonly browser: Browser
    private page: Page | undefined

    constructor(browser: Browser) {
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/professor'
        this.browser = browser
    }

    async scrape(): Promise<void> {
        this.page = await this.browser.newPage()
        await this.scrapeTeachers()
        await this.browser.close()
    }

    async scrapeTeachers(): Promise<void> {
        console.log('raspando dados de -> ', this.baseUrl)
        await this.page?.goto(this.baseUrl)
        await this.page?.waitForSelector('#table_professores')

        async function delay(time: number): Promise<void> {
            return await new Promise(function (resolve) {
                setTimeout(resolve, time)
            })
        }
        await delay(300)
        await this.page?.click('span.page-size')
        await this.page?.click('div.dropdown-menu > a:nth-child(4)')

        const pagesNumber = await this.page?.evaluate(() => {
            const pageLinksRaw = Array.from(document.querySelectorAll('a.page-link'))
            const pageLinks = pageLinksRaw.filter((a) => parseInt(a.textContent as string) > 0).length

            return pageLinks - 1
        })

        const loops = pagesNumber as number
        const teachers: teacher[] = []
        for (let i = 0; i < loops; i++) {
            const data = await this.page?.evaluate(() => {
                const teachers: teacher[] = []
                const tabs = document.querySelector('#table_professores')
                const links = Array.from(tabs?.querySelectorAll('tr td a') as NodeListOf<HTMLAnchorElement>)
                const teacherUrls = links.map((a) => a.href)
                const names = links.map((a) => a.innerText)
                const abreviatonsRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(2)') as NodeListOf<HTMLTableDataCellElement>)
                const abreviations = abreviatonsRaw.map((td) => td.innerText)
                const unitiesRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(3)') as NodeListOf<HTMLTableDataCellElement>)
                const unities = unitiesRaw.map((td) => td.innerText)
                teacherUrls.forEach((url, index) => {
                    teachers.push({
                        name: names[index],
                        url,
                        abreviation: abreviations[index],
                        unity: unities[index]
                    })
                })
                return teachers
            })

            teachers.push(...(data as teacher[]))

            await delay(1000)

            i < loops && (await this.page?.click('li.page-next > a.page-link'))
        }

        this.writeTeachersJson(teachers)
        await this.scrapeTeachers()
    }

    private writeTeachersJson(data: teacher[]): void {
        if (!existsSync('data/teachers')) {
            mkdirSync('data/teachers')
        }
        const fileName = 'data/teachers/teachers.json'
        writeFileSync(fileName, JSON.stringify(data, null, 2))
    }
}
