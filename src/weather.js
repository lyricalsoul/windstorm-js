const INMET_CITY_CODE = 1100205 // ariquemes is 1100023

const ALERTS_ENDPOINT = `https://apiprevmet3.inmet.gov.br/avisos/getByGeocode/${INMET_CITY_CODE}`
const WEATHER_ENDPOINT = `https://apiprevmet3.inmet.gov.br/previsao/${INMET_CITY_CODE}`

export const fetchCurrentAlerts = async () => {
  const response = await fetch(ALERTS_ENDPOINT)
  return await response.json().catch(() => {
    return undefined
  })
}

export const fetchCurrentWeather = async () => {
  const response = await fetch(WEATHER_ENDPOINT)
  return await response.json()
    .then((d) => d[INMET_CITY_CODE])
    .catch(() => {
      return undefined
    })
}