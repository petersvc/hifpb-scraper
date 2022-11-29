import { data } from './interfaces.js'
import type { Page } from 'puppeteer'
import Scraper from './scraper.js'

export default class CourseScraper extends Scraper {
    constructor(page: Page | undefined) {
        super()
        this.page = page
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/curso'
    }

    async run(): Promise<data[]> {
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
            const courses: data[] = []
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
        console.log('dados raspados')
        return data as data[]
    }
}
