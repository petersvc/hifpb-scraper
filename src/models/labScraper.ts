import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { lab } from './interfaces'
import type { Page, Browser } from 'puppeteer'

export default class LabScraper {
    private readonly baseUrl: string
    private readonly browser: Browser
    private page: Page | undefined

    constructor(browser: Browser) {
        this.baseUrl = 'https://joaopessoa.ifpb.edu.br/horario/laboratorio'
        this.browser = browser
    }

    async scrape(): Promise<void> {
        this.page = await this.browser.newPage()
        await this.scrapeLabs()
        await this.browser.close()
    }

    async scrapeLabs(): Promise<void> {
        console.log('raspando dados de -> ', this.baseUrl)
        await this.page?.goto(this.baseUrl)
        await this.page?.waitForSelector('#table_laboratorios')

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
        const labs: lab[] = []
        for (let i = 0; i < loops; i++) {
            const data = await this.page?.evaluate(() => {
                const labs: lab[] = []
                const tabs = document.querySelector('#table_laboratorios')
                const links = Array.from(tabs?.querySelectorAll('tr td a') as NodeListOf<HTMLAnchorElement>)
                const labUrls = links.map((a) => a.href)
                const names = links.map((a) => a.innerText)
                const abreviatonsRaw = Array.from(tabs?.querySelectorAll('tr td:nth-child(2)') as NodeListOf<HTMLTableDataCellElement>)
                const abreviations = abreviatonsRaw.map((td) => td.innerText)
                labUrls.forEach((url, index) => {
                    labs.push({
                        name: names[index],
                        url,
                        abreviation: abreviations[index]
                    })
                })
                return labs
            })

            labs.push(...(data as lab[]))

            await delay(1000)
            if ((pagesNumber as number) > 0) {
                i < loops && (await this.page?.click('li.page-next > a.page-link'))
            }
        }

        this.writeLabsJson(labs)
        await this.scrapeLabs()
    }

    private writeLabsJson(data: lab[]): void {
        if (!existsSync('data/labs')) {
            mkdirSync('data/labs')
        }
        const fileName = 'data/labs/labs.json'
        writeFileSync(fileName, JSON.stringify(data, null, 2))
    }
}
