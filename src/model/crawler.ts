import { launch, type Browser, Page } from 'puppeteer'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

import CourseScraper from './courseScraper.js'
import TeacherScraper from './teacherScraper.js'
import ClassroomScraper from './classroomScraper.js'
import LabScraper from './labScraper.js'
import ClassScraper from './classScraper.js'
import { data } from './interfaces.js'

export default class Crawler {
    browser: Browser | undefined
    page: Page | undefined
    dataToWork: string
    data!: data[]

    setDataToWork(newDataToWork: string): void {
        this.dataToWork = newDataToWork
    }

    getDataToWork(): string {
        return this.dataToWork
    }

    private async run(): Promise<void> {
        switch (this.dataToWork) {
            case 'cursos': {
                this.data = await new CourseScraper(this.page).run()
                break
            }
            case 'professores': {
                this.data = await new TeacherScraper(this.page).run()
                break
            }
            case 'salas': {
                this.data = await new ClassroomScraper(this.page).run()
                break
            }
            case 'laboratorios': {
                this.data = await new LabScraper(this.page).run()
                break
            }
            default: {
                if (!existsSync('data/cursos/cursos.json')) {
                    this.setDataToWork('cursos')
                    const data = await new CourseScraper(this.page).run()
                    this.writeData(data)
                }

                this.setDataToWork('aulas')
                await new ClassScraper(this.page).run()
                break
            }
        }
    }

    async launchBrowser(): Promise<void> {
        this.browser = await launch({ headless: true })
        this.page = await this.browser.newPage()
    }

    async scrape(dataToWork: string): Promise<void> {
        const start: number = performance.now()

        this.setDataToWork(dataToWork)

        await this.launchBrowser()
        await this.run()

        if (this.dataToWork !== 'aulas') {
            this.writeData(this.data)
        }

        await this.browser?.close()

        const end: number = performance.now()
        console.log('Executado em ', Number((end - start) / 1000), 'ms')
    }

    writeData(data: data[]): void {
        if (!existsSync(`data/${this.dataToWork}`)) {
            console.log(`Criando pasta ${this.dataToWork}`)
            mkdirSync(`data/${this.dataToWork}`, { recursive: true })
            console.log(`Pasta ${this.dataToWork} criada com sucesso`)
        }
        const fileName = `data/${this.dataToWork}/${this.dataToWork}.json`
        writeFileSync(fileName, JSON.stringify(data, null, 2))
        console.log(`Arquivo ${this.dataToWork}.json criado com sucesso`)
    }

    readData(dataToWork: string, course?: string): data[] {
        let data: data[] = []
        if (dataToWork !== 'aulas') data = [...this.getData(dataToWork)]
        else {
            data = [...this.getData(dataToWork, course)]
        }
        return data
    }

    getData(dataToWork: string, course?: string): data[] {
        const slashPath = dataToWork !== 'aulas' ? dataToWork : course
        const fileName = `data/${dataToWork}/${slashPath as string}.json`
        console.log(`Lendo os dados do arquivo ${slashPath as string}.json`)
        const data = JSON.parse(readFileSync(fileName, 'utf-8'))
        return data
    }
}
