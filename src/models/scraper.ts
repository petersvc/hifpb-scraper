import { launch, type Browser } from 'puppeteer'

import CourseScraper from './courseScraper'
import TeacherScraper from './teacherScraper'
import ClassRoomScraper from './classRoomScraper'
import LabScraper from './labScraper'
import ClassScraper from './classScraper'
import { existsSync } from 'fs'

export default class Scraper {
    options: { headless: boolean } | undefined
    stuffToscrape: string
    scraper: CourseScraper | TeacherScraper | ClassRoomScraper | LabScraper | ClassScraper | undefined

    constructor(stuffToScrape: string) {
        this.options = { headless: true }
        this.stuffToscrape = stuffToScrape
    }

    setOptions(newOptions: { headless: boolean }): void {
        this.options = newOptions
    }

    setStuffToscrape(newStuffToScrape: string): void {
        this.stuffToscrape = newStuffToScrape
    }

    private setScraper(browser: Browser): void {
        switch (this.stuffToscrape) {
            case 'course': {
                this.scraper = new CourseScraper(browser)
                break
            }
            case 'teacher': {
                this.scraper = new TeacherScraper(browser)
                break
            }
            case 'classRoom': {
                this.scraper = new ClassRoomScraper(browser)
                break
            }
            case 'lab': {
                this.scraper = new LabScraper(browser)
                break
            }
            case 'classes': {
                if (!existsSync('data/courses/courses.json')) {
                    void (async () => await this.scraper?.scrape())()
                }
                this.scraper = new ClassScraper(browser)
            }
        }
    }

    private async launch(): Promise<void> {
        const browser = await launch(this.options)
        this.setScraper(browser)
        await this.scraper?.scrape()
    }

    public async scrape(): Promise<void> {
        const start: number = performance.now()

        await this.launch()

        const end: number = performance.now()
        console.log('Execution time:', Number((end - start) / 1000), 'ms')
    }
}
