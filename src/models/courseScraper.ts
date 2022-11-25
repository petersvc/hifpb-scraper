import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { course } from './interfaces'
import type { Page, Browser } from 'puppeteer'

export default class CourseScraper {
    private readonly baseUrl: string
    private readonly browser: Browser
    private page: Page | undefined

    constructor(browser: Browser) {
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/curso'
        this.browser = browser
    }

    async scrape(): Promise<void> {
        this.page = await this.browser.newPage()
        await this.scrapeCourses()
        await this.browser.close()
    }

    private async scrapeCourses(): Promise<void> {
        console.log('raspando dados de -> ', this.baseUrl)
        await this.page?.goto(this.baseUrl)
        await this.page?.waitForSelector('#custom-tabs-four-tabContent')

        async function delay(time: number): Promise<void> {
            return await new Promise(function (resolve) {
                setTimeout(resolve, time)
            })
        }

        await this.page?.click('#custo-tab-4-tab')
        await delay(300)

        await this.page?.click('#custo-tab-4 span.page-size')
        await this.page?.click('#custo-tab-4 div.dropdown-menu > a:nth-child(2)')

        const data = await this.page?.evaluate(() => {
            const courses: course[] = []
            const tabs = document.querySelector('#custom-tabs-four-tabContent')
            const links = Array.from(tabs?.querySelectorAll('tr td a') as NodeListOf<HTMLAnchorElement>)
            const courseUrls = links.map((a) => a.href)
            const names = links.map((a) => a.innerText)
            const abreviatonsRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(2)') as NodeListOf<HTMLTableDataCellElement>)
            const abreviations = abreviatonsRaw.map((td) => td.innerText)
            courseUrls.forEach((url, index) => {
                courses.push({
                    name: names[index],
                    abreviation: abreviations[index],
                    url
                })
            })
            return courses
        })
        this.writeCoursesJson(data as course[])
        await this.scrapeCourses()
    }

    private writeCoursesJson(data: course[]): void {
        if (!existsSync('data/courses')) {
            mkdirSync('data/courses')
        }
        const fileName = 'data/courses/courses.json'
        writeFileSync(fileName, JSON.stringify(data, null, 2))
    }
}
