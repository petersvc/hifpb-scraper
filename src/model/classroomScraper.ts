import { data } from './interfaces.js'
import type { Page } from 'puppeteer'
import Scraper from './scraper.js'

export default class ClassroomScraper extends Scraper {
    constructor(page: Page | undefined) {
        super()
        this.page = page
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/sala'
    }

    async run(): Promise<data[]> {
        console.log('raspando dados de -> ', this.baseUrl)
        await this.page?.goto(this.baseUrl)
        await this.page?.waitForSelector('#table_salas')

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

        let loops = pagesNumber as number

        if (loops < 1) {
            loops++
        }

        const data: data[] = []

        for (let i = 0; i < loops; i++) {
            console.log(`Raspandord-> ${this.baseUrl}`)
            const scrapedData = await this.page?.evaluate(() => {
                const classRooms: data[] = []
                const tabs = document.querySelector('#table_salas')
                const links = Array.from(tabs?.querySelectorAll('tr td a') as NodeListOf<HTMLAnchorElement>)
                const classRoomUrls = links.map((a) => a.href)
                const names = links.map((a) => a.innerText)
                const abreviatonsRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(2)') as NodeListOf<HTMLTableDataCellElement>)
                const abreviations = abreviatonsRaw.map((td) => td.innerText)
                classRoomUrls.forEach((url, index) => {
                    classRooms.push({
                        name: names[index],
                        url,
                        abreviation: abreviations[index]
                    })
                })

                return classRooms
            })

            data.push(...(scrapedData as data[]))

            await delay(1000)

            if ((pagesNumber as number) > 0) {
                i < loops && (await this.page?.click('li.page-next > a.page-link'))
            }
        }

        return data
    }
}
