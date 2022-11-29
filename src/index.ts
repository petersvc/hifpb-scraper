import Crawler from './model/crawler.js'
import inquirer from 'inquirer'
import { readdirSync } from 'fs'

console.log('------------------ HIFPB SCRAPER ------------------')

const dataToWorkOptions = ['aulas', 'cursos', 'professores', 'salas', 'laboratorios', 'Voltar']

let courses!: string[]

const app = new Crawler()
const closeProperties = { closeMenu: false, closeRead: false, closeCourse: false, closeScrape: false }

const questions = {
    menu: [
        {
            type: 'list',
            name: 'options',
            message: 'O que deseja fazer?',
            choices: ['Ler dados', 'Raspar (coletar) dados', 'Sair']
        }
    ],
    readOptions: [
        {
            type: 'list',
            name: 'readOptions',
            message: 'Quais dados deseja visualizar?',
            choices: dataToWorkOptions
        }
    ],
    courseOptions: [
        {
            type: 'list',
            name: 'courseOptions',
            message: 'Deseja visualizar as aulas de qual curso?',
            choices: courses
        }
    ],
    scrapeOptions: [
        {
            type: 'list',
            name: 'scrapeOptions',
            message: 'Quais dados deseja coletar?',
            choices: dataToWorkOptions
        }
    ]
}

void (async () => {
    while (!closeProperties.closeMenu) {
        const { options } = await inquirer.prompt(questions.menu)

        if (closeOrBack(options, 'closeMenu')) break

        if (options === 'Ler dados') {
            const aulasDirFilesNames = [...readdirSync('data/aulas')]

            if (aulasDirFilesNames.length > 0) {
                courses = [...aulasDirFilesNames.map((fileName) => fileName.replace('.json', ''))]
                courses.push('Voltar')
                questions.courseOptions[0].choices = courses
            }

            while (!closeProperties.closeRead) {
                const { readOptions } = await inquirer.prompt(questions.readOptions)

                if (closeOrBack(readOptions, 'closeRead')) break

                if (readOptions !== 'aulas') {
                    console.table(app.readData(readOptions))
                } else {
                    while (!closeProperties.closeCourse) {
                        const { courseOptions } = await inquirer.prompt(questions.courseOptions)

                        if (closeOrBack(courseOptions, 'closeScrape')) break

                        console.table(app.readData(readOptions, courseOptions), [
                            'semester',
                            'weekday',
                            'start',
                            'end',
                            'className',
                            'teacher',
                            'location'
                        ])
                    }
                }
            }
        } else {
            while (!closeProperties.closeScrape) {
                const { scrapeOptions } = await inquirer.prompt(questions.scrapeOptions)

                if (closeOrBack(scrapeOptions, 'closeScrape')) break

                await app.scrape(scrapeOptions)
            }
        }
    }
})()

function closeOrBack(option: string, closePropertie: string): boolean {
    if (option === 'Voltar' || option === 'Sair') {
        closeProperties[closePropertie] = true
    }
    return closeProperties[closePropertie]
}
