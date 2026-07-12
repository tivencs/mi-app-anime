import _ from 'lodash'
import * as cheerio from 'cheerio'
import { makeRequest } from './MakeRequest'
import { config } from './config'

interface Anime {
  id: string
  slug: string
  title: string
  altertitles: { language: string, title: string }[]
  synopsis: string
  status: string
  episodes: string
  image: string
  thumbnail: string
  type: string
  rel_id: { [key: string]: string[] }
  coincidencias: string
}

interface AnimeTypes {
  [key: string]: string
}

interface SearchResults {
  animes: Anime[]
  anime_types: AnimeTypes
}

type SearchReturnType = Promise<SearchResults | null>

export async function search(q: string): SearchReturnType {
  // 1. Apuntamos a la URL real de búsqueda que usa la web hoy en día
  const searchURL = `${config.baseURL}buscar/?q=${encodeURIComponent(q)}`

  // 2. Solicitamos el HTML de la página en lugar de un JSON
  const html: string = await makeRequest(searchURL, 'text', { method: 'get' })

  if (!html) return null

  // 3. Cargamos el HTML con Cheerio para raspar los resultados
  const $ = cheerio.load(html)
  const animes: Anime[] = []

  // 4. Buscamos el contenedor de los animes en la estructura de JKAnime
  $('.anime__item').each((__index, element) => {
    const linkEl = $(element).find('a')
    const imgEl = $(element).find('.anime__item__pic')
    const titleEl = $(element).find('h5 a')

    const href = linkEl.attr('href') || ''
    const slug = href.split('/').filter(Boolean).pop() || ''
    const title = titleEl.text().trim()
    const image = imgEl.attr('data-setbg') || ''

    if (slug) {
      animes.push({
        id: slug,
        slug: slug,
        title: title,
        altertitles: [],
        synopsis: '',
        status: '',
        episodes: '',
        image: image,
        thumbnail: image,
        type: '',
        rel_id: {},
        coincidencias: ''
      })
    }
  })

  return {
    animes,
    anime_types: {}
  }
}