import { data } from './interfaces.js'
import type { Page } from 'puppeteer'
import Scraper from './scraper.js'

export default class TeacherScraper extends Scraper {
    constructor(page: Page | undefined) {
        super()
        this.page = page
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/professor'
    }

    async run(): Promise<data[]> {
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

            return pageLinks
        })

        const loops = pagesNumber as number
        const data: data[] = []

        for (let i = 0; i < loops; i++) {
            const scrapedData = await this.page?.evaluate(() => {
                const teachers: data[] = []
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

            data.push(...(scrapedData as data[]))

            await delay(1000)

            i < loops && (await this.page?.click('li.page-next > a.page-link'))
        }
        return data
    }
}
