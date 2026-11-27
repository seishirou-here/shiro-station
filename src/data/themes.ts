export interface CozyAnimeScenePalette {
  skyTop: string
  skyHorizon: string
  fogColor: string
  ambientColor: string
  ambientIntensity: number
  sunColor: string
  sunIntensity: number
  stationLampColor: string
  trainBody: string
  trainStripe: string
  platformTone: string
  woodAccent: string
  sakuraTint: string
  sakuraDeep: string
  petalCountDesktop: number
  petalCountMobile: number
}

export const COZY_ANIME_THEME: {
  label: string
  jpLabel: string
  scene: CozyAnimeScenePalette
} = {
  label: 'Cozy Anime',
  jpLabel: '夕暮れ桜',
  scene: {
    skyTop: '#ff9d6c',
    skyHorizon: '#ffe4b5',
    fogColor: '#ffd8a8',
    ambientColor: '#ffe7c7',
    ambientIntensity: 0.85,
    sunColor: '#ffbe6b',
    sunIntensity: 1.8,
    stationLampColor: '#ffd28a',
    trainBody: '#faf5eb',
    trainStripe: '#7bae7f',
    platformTone: '#e8dcc8',
    woodAccent: '#7c5542',
    sakuraTint: '#ffb7c5',
    sakuraDeep: '#f38aa5',
    petalCountDesktop: 90,
    petalCountMobile: 42,
  },
}
