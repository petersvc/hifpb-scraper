import Scraper from './models/scraper'
// import { existsSync, readFileSync } from 'fs'

const scraper = new Scraper('course') // , ['https://joaopessoa.ifpb.edu.br/horario/curso/4']
// let urls: string[] = []
// if (existsSync('data/courses.json')) {
//     console.log('exists')
//     const data = readFileSync('data/courses.json', 'utf-8')
//     urls = JSON.parse(data).map((course: { url: string }) => course.url)
//     console.log(typeof JSON.parse(data))
// } else {
//     console.log('does not exist')
// }

// console.log(urls)
// void scraper.test()
void scraper.scrap()
