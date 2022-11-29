import type { Page } from 'puppeteer'

export default class Scraper {
    protected _baseUrl!: string
    protected _page: Page | undefined

    get page(): Page | undefined {
        return this._page
    }

    set page(newPage: Page | undefined) {
        this._page = newPage
    }

    get baseUrl(): string {
        return this._baseUrl
    }

    set baseUrl(newBaseUrl: string) {
        this._baseUrl = newBaseUrl
    }
}
